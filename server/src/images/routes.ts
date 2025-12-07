import express, { type Request, type Response } from 'express';
import { attachUserFromToken, requireAuth } from '../auth/routes.js';
import type { AuthPayload, PublicUser } from '../auth/service.js';
import {
  generateImageForUser,
  type GenerateImageInput,
} from './service.js';

type AuthedRequest = Request & { user?: PublicUser; authPayload?: AuthPayload };

const router = express.Router();

router.use(attachUserFromToken);
router.use(requireAuth);

router.post('/generate', async (req: AuthedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'UNAUTHENTICATED' });
    return;
  }

  const body = req.body as {
    spaceId?: number;
    characterVersionId?: number;
    styleVersionId?: number;
    sceneVersionId?: number;
    seed?: number;
    aspectRatio?: string;
    resolution?: string;
  };

  const spaceId = Number(body.spaceId);
  const characterVersionId = Number(body.characterVersionId);
  const styleVersionId = Number(body.styleVersionId);
  const sceneVersionId =
    body.sceneVersionId !== undefined ? Number(body.sceneVersionId) : undefined;
  const seed =
    body.seed !== undefined && Number.isFinite(Number(body.seed))
      ? Number(body.seed)
      : undefined;

  if (!Number.isFinite(spaceId) || spaceId <= 0) {
    res.status(400).json({ error: 'INVALID_SPACE_ID' });
    return;
  }
  if (!Number.isFinite(characterVersionId) || characterVersionId <= 0) {
    res.status(400).json({ error: 'INVALID_CHARACTER_VERSION_ID' });
    return;
  }
  if (!Number.isFinite(styleVersionId) || styleVersionId <= 0) {
    res.status(400).json({ error: 'INVALID_STYLE_VERSION_ID' });
    return;
  }

  const input: GenerateImageInput = {
    userId: user.id,
    spaceId,
    characterVersionId,
    styleVersionId,
    sceneVersionId:
      sceneVersionId && Number.isFinite(sceneVersionId)
        ? sceneVersionId
        : undefined,
    seed,
    aspectRatio: body.aspectRatio,
    resolution: body.resolution,
  };

  try {
    const image = await generateImageForUser(input);
    res.status(201).json({ image });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    res.status(500).json({ error: 'IMAGE_GENERATION_FAILED', message });
  }
});

export { router as imagesRouter };

