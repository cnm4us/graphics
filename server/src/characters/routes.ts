import express, { type Request, type Response } from 'express';
import { attachUserFromToken, requireAuth } from '../auth/routes.js';
import type { AuthPayload, PublicUser } from '../auth/service.js';
import {
  assertSpaceOwnedByUser,
  createCharacterForSpace,
  listCharactersForSpace,
  type NewCharacterInput,
  getCharacterWithVersions,
  cloneCharacterVersion,
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

router.get(
  '/:characterId/versions',
  async (req: AuthedRequest, res: Response) => {
    const user = req.user;
    const spaceId = Number(req.params.spaceId);
    const characterId = Number(req.params.characterId);

    if (!user) {
      res.status(401).json({ error: 'UNAUTHENTICATED' });
      return;
    }
    if (!Number.isFinite(spaceId) || spaceId <= 0) {
      res.status(400).json({ error: 'INVALID_SPACE_ID' });
      return;
    }
    if (!Number.isFinite(characterId) || characterId <= 0) {
      res.status(400).json({ error: 'INVALID_CHARACTER_ID' });
      return;
    }

    try {
      await assertSpaceOwnedByUser(spaceId, user.id);
    } catch {
      res.status(404).json({ error: 'SPACE_NOT_FOUND' });
      return;
    }

    const result = await getCharacterWithVersions(spaceId, characterId);
    if (!result) {
      res.status(404).json({ error: 'CHARACTER_NOT_FOUND' });
      return;
    }

    res.status(200).json({ character: result });
  },
);

router.post(
  '/:characterId/versions',
  async (req: AuthedRequest, res: Response) => {
    const user = req.user;
    const spaceId = Number(req.params.spaceId);
    const characterId = Number(req.params.characterId);

    if (!user) {
      res.status(401).json({ error: 'UNAUTHENTICATED' });
      return;
    }
    if (!Number.isFinite(spaceId) || spaceId <= 0) {
      res.status(400).json({ error: 'INVALID_SPACE_ID' });
      return;
    }
    if (!Number.isFinite(characterId) || characterId <= 0) {
      res.status(400).json({ error: 'INVALID_CHARACTER_ID' });
      return;
    }

    const body = req.body as {
      fromVersionId?: number;
      label?: string | null;
      identitySummary?: string | null;
      physicalDescription?: string | null;
      wardrobeDescription?: string | null;
      personalityMannerisms?: string | null;
      extraNotes?: string | null;
      basePrompt?: string | null;
      negativePrompt?: string | null;
      baseSeed?: number | null;
    };

    const fromVersionId = Number(body.fromVersionId);
    if (!Number.isFinite(fromVersionId) || fromVersionId <= 0) {
      res.status(400).json({ error: 'INVALID_FROM_VERSION_ID' });
      return;
    }

    try {
      await assertSpaceOwnedByUser(spaceId, user.id);
    } catch {
      res.status(404).json({ error: 'SPACE_NOT_FOUND' });
      return;
    }

    try {
      const version = await cloneCharacterVersion(spaceId, characterId, {
        fromVersionId,
        label: body.label ?? undefined,
        identitySummary: body.identitySummary ?? undefined,
        physicalDescription: body.physicalDescription ?? undefined,
        wardrobeDescription: body.wardrobeDescription ?? undefined,
        personalityMannerisms: body.personalityMannerisms ?? undefined,
        extraNotes: body.extraNotes ?? undefined,
        basePrompt: body.basePrompt ?? undefined,
        negativePrompt: body.negativePrompt ?? undefined,
        baseSeed: body.baseSeed ?? undefined,
      });
      res.status(201).json({ version });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      if (message === 'CHARACTER_NOT_FOUND') {
        res.status(404).json({ error: 'CHARACTER_NOT_FOUND' });
        return;
      }
      if (message === 'CHARACTER_VERSION_NOT_FOUND') {
        res.status(404).json({ error: 'CHARACTER_VERSION_NOT_FOUND' });
        return;
      }
      // eslint-disable-next-line no-console
      console.error('[characters] Clone version error:', error);
      res.status(500).json({ error: 'CHARACTER_VERSION_CLONE_FAILED' });
    }
  },
);

export { router as charactersRouter };
