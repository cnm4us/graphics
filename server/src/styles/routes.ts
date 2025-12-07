import express, { type Request, type Response } from 'express';
import { attachUserFromToken, requireAuth } from '../auth/routes.js';
import type { AuthPayload, PublicUser } from '../auth/service.js';
import {
  assertSpaceOwnedByUserForStyles,
  createStyleForSpace,
  listStylesForSpace,
  type NewStyleInput,
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
    await assertSpaceOwnedByUserForStyles(spaceId, user.id);
  } catch {
    res.status(404).json({ error: 'SPACE_NOT_FOUND' });
    return;
  }

  const styles = await listStylesForSpace(spaceId);
  res.status(200).json({ styles });
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
    artStyle?: string;
    colorPalette?: string;
    lighting?: string;
    camera?: string;
    renderTechnique?: string;
    negativePrompt?: string;
  };

  const trimmedName = body.name?.trim();
  if (!trimmedName) {
    res.status(400).json({ error: 'NAME_REQUIRED' });
    return;
  }

  try {
    await assertSpaceOwnedByUserForStyles(spaceId, user.id);
  } catch {
    res.status(404).json({ error: 'SPACE_NOT_FOUND' });
    return;
  }

  const input: NewStyleInput = {
    name: trimmedName,
    description: body.description,
    artStyle: body.artStyle,
    colorPalette: body.colorPalette,
    lighting: body.lighting,
    camera: body.camera,
    renderTechnique: body.renderTechnique,
    negativePrompt: body.negativePrompt,
  };

  try {
    const style = await createStyleForSpace(spaceId, input);
    res.status(201).json({ style });
  } catch (error) {
    res.status(500).json({ error: 'STYLE_CREATE_FAILED' });
  }
});

export { router as stylesRouter };

