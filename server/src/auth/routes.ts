import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import type { AuthPayload, PublicUser } from './service.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  generateAuthToken,
  verifyAuthToken,
  verifyPassword,
} from './service.js';

type AuthedRequest = Request & { user?: PublicUser; authPayload?: AuthPayload };

const parseAuthToken = (req: Request): string | null => {
  const header = req.header('authorization');
  if (header && header.toLowerCase().startsWith('bearer ')) {
    return header.slice('bearer '.length).trim();
  }

  const cookieToken = (req as any).cookies?.auth_token;
  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }

  return null;
};

const attachUserFromToken = async (
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = parseAuthToken(req);
  if (!token) {
    return next();
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return next();
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    return next();
  }

  req.authPayload = payload;
  req.user = {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
  };

  return next();
};

const requireAuth = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHENTICATED' });
    return;
  }
  next();
};

const router = express.Router();

router.use(attachUserFromToken);

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body as {
    email?: string;
    password?: string;
    displayName?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: 'EMAIL_AND_PASSWORD_REQUIRED' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'PASSWORD_TOO_SHORT', minLength: 8 });
    return;
  }

  try {
    const user = await createUser(email.trim().toLowerCase(), password, displayName?.trim());
    const token = generateAuthToken(user);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user });
  } catch (error: any) {
    if (error instanceof Error && error.message === 'EMAIL_TAKEN') {
      res.status(409).json({ error: 'EMAIL_TAKEN' });
      return;
    }

    // eslint-disable-next-line no-console
    console.error('[auth] Register error:', error);
    res.status(500).json({ error: 'REGISTER_FAILED' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: 'EMAIL_AND_PASSWORD_REQUIRED' });
    return;
  }

  const userRecord = await findUserByEmail(email.trim().toLowerCase());
  if (!userRecord) {
    res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    return;
  }

  const valid = await verifyPassword(password, userRecord.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    return;
  }

  const user: PublicUser = {
    id: userRecord.id,
    email: userRecord.email,
    displayName: userRecord.display_name,
  };
  const token = generateAuthToken(user);

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ user });
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  res.status(204).send();
});

router.get('/me', requireAuth, (req: AuthedRequest, res: Response) => {
  res.status(200).json({ user: req.user });
});

export { router as authRouter, requireAuth, attachUserFromToken };

