import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { getDbPool } from '../db/index.js';
import { env } from '../config/env.js';

export type UserRecord = {
  id: number;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: Date;
  updated_at: Date;
};

export type PublicUser = {
  id: number;
  email: string;
  displayName: string | null;
};

const mapUserToPublic = (user: UserRecord): PublicUser => ({
  id: user.id,
  email: user.email,
  displayName: user.display_name,
});

const getJwtSecret = (): string => {
  if (env.jwtSecret && env.jwtSecret.trim().length > 0) {
    return env.jwtSecret;
  }
  // Fallback for dev; do not use in production without JWT_SECRET.
  // eslint-disable-next-line no-console
  console.warn('[auth] Using development fallback JWT secret; set JWT_SECRET for production.');
  return 'dev-insecure-jwt-secret';
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  passwordHash: string,
): Promise<boolean> => bcrypt.compare(password, passwordHash);

export const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const db = getDbPool();
  const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  const list = rows as UserRecord[];
  return list.length > 0 ? list[0] : null;
};

export const findUserById = async (id: number): Promise<UserRecord | null> => {
  const db = getDbPool();
  const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  const list = rows as UserRecord[];
  return list.length > 0 ? list[0] : null;
};

export const createUser = async (
  email: string,
  password: string,
  displayName?: string,
): Promise<PublicUser> => {
  const db = getDbPool();

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('EMAIL_TAKEN');
  }

  const passwordHash = await hashPassword(password);

  const [result] = await db.query(
    'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
    [email, passwordHash, displayName ?? null],
  );

  const insertResult = result as { insertId?: number };
  const id = insertResult.insertId;

  if (!id) {
    throw new Error('USER_CREATE_FAILED');
  }

  const created = await findUserById(id);
  if (!created) {
    throw new Error('USER_LOAD_FAILED');
  }

  return mapUserToPublic(created);
};

export const generateAuthToken = (user: PublicUser): string => {
  const secret = getJwtSecret();
  const payload = {
    sub: user.id,
    email: user.email,
  };

  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export type AuthPayload = JwtPayload & {
  sub: number;
  email?: string;
};

export const verifyAuthToken = (token: string): AuthPayload | null => {
  const secret = getJwtSecret();
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!decoded || typeof decoded !== 'object') {
      return null;
    }
    if (typeof decoded.sub !== 'number') {
      return null;
    }
    return decoded as AuthPayload;
  } catch {
    return null;
  }
};
