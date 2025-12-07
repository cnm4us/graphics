import express, { type Request, type Response } from 'express';
import { attachUserFromToken, requireAuth } from '../auth/routes.js';
import type { AuthPayload, PublicUser } from '../auth/service.js';
import {
  assertSpaceOwnedByUser,
  createCharacterForSpace,
  listCharactersForSpace,
  type NewCharacterInput,
} from './service.js';

type AuthedRequest = Request & { user?: PublicUser; authPayload?: AuthPayload };

const router = express.Router({ mergeParams: true });

router.use(attachUserFromToken);
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res: Response) => {
  const user = req.user;
  const spaceId = Number(req.params.spaceId);

  if (!user) {
    res.status(401).json({ error: 'UNAUTHENTICATED' });
    return;
  }
  if (!Number.isFinite(spaceId) || spaceId <= 0) {
    res.status(400).json({ error: 'INVALID_SPACE_ID' });
    return;
  }

  try {
    await assertSpaceOwnedByUser(spaceId, user.id);
  } catch {
    res.status(404).json({ error: 'SPACE_NOT_FOUND' });
    return;
  }

  const characters = await listCharactersForSpace(spaceId);
  res.status(200).json({ characters });
});

router.post('/', async (req: AuthedRequest, res: Response) => {
  const user = req.user;
  const spaceId = Number(req.params.spaceId);

  if (!user) {
    res.status(401).json({ error: 'UNAUTHENTICATED' });
    return;
  }
  if (!Number.isFinite(spaceId) || spaceId <= 0) {
    res.status(400).json({ error: 'INVALID_SPACE_ID' });
    return;
  }

  const body = req.body as {
    name?: string;
    description?: string;
    identitySummary?: string;
    physicalDescription?: string;
    wardrobeDescription?: string;
    personalityMannerisms?: string;
    extraNotes?: string;
  };

  const trimmedName = body.name?.trim();
  if (!trimmedName) {
    res.status(400).json({ error: 'NAME_REQUIRED' });
    return;
  }

  try {
    await assertSpaceOwnedByUser(spaceId, user.id);
  } catch {
    res.status(404).json({ error: 'SPACE_NOT_FOUND' });
    return;
  }

  const input: NewCharacterInput = {
    name: trimmedName,
    description: body.description,
    identitySummary: body.identitySummary,
    physicalDescription: body.physicalDescription,
    wardrobeDescription: body.wardrobeDescription,
    personalityMannerisms: body.personalityMannerisms,
    extraNotes: body.extraNotes,
  };

  try {
    const character = await createCharacterForSpace(spaceId, input);
    res.status(201).json({ character });
  } catch (error) {
    res.status(500).json({ error: 'CHARACTER_CREATE_FAILED' });
  }
});

export { router as charactersRouter };

