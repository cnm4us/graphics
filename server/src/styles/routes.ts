import express, { type Request, type Response } from 'express';
import { attachUserFromToken, requireAuth } from '../auth/routes.js';
import type { AuthPayload, PublicUser } from '../auth/service.js';
import {
  assertSpaceOwnedByUserForStyles,
  createStyleForSpace,
  listStylesForSpace,
  type NewStyleInput,
  getStyleWithVersions,
  cloneStyleVersion,
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

router.get(
  '/:styleId/versions',
  async (req: AuthedRequest, res: Response) => {
    const user = req.user;
    const spaceId = Number(req.params.spaceId);
    const styleId = Number(req.params.styleId);

    if (!user) {
      res.status(401).json({ error: 'UNAUTHENTICATED' });
      return;
    }
    if (!Number.isFinite(spaceId) || spaceId <= 0) {
      res.status(400).json({ error: 'INVALID_SPACE_ID' });
      return;
    }
    if (!Number.isFinite(styleId) || styleId <= 0) {
      res.status(400).json({ error: 'INVALID_STYLE_ID' });
      return;
    }

    try {
      await assertSpaceOwnedByUserForStyles(spaceId, user.id);
    } catch {
      res.status(404).json({ error: 'SPACE_NOT_FOUND' });
      return;
    }

    const result = await getStyleWithVersions(spaceId, styleId);
    if (!result) {
      res.status(404).json({ error: 'STYLE_NOT_FOUND' });
      return;
    }

    res.status(200).json({ style: result });
  },
);

router.post(
  '/:styleId/versions',
  async (req: AuthedRequest, res: Response) => {
    const user = req.user;
    const spaceId = Number(req.params.spaceId);
    const styleId = Number(req.params.styleId);

    if (!user) {
      res.status(401).json({ error: 'UNAUTHENTICATED' });
      return;
    }
    if (!Number.isFinite(spaceId) || spaceId <= 0) {
      res.status(400).json({ error: 'INVALID_SPACE_ID' });
      return;
    }
    if (!Number.isFinite(styleId) || styleId <= 0) {
      res.status(400).json({ error: 'INVALID_STYLE_ID' });
      return;
    }

    const body = req.body as {
      fromVersionId?: number;
      label?: string | null;
      artStyle?: string | null;
      colorPalette?: string | null;
      lighting?: string | null;
      camera?: string | null;
      renderTechnique?: string | null;
      negativePrompt?: string | null;
      baseSeed?: number | null;
    };

    const fromVersionId = Number(body.fromVersionId);
    if (!Number.isFinite(fromVersionId) || fromVersionId <= 0) {
      res.status(400).json({ error: 'INVALID_FROM_VERSION_ID' });
      return;
    }

    try {
      await assertSpaceOwnedByUserForStyles(spaceId, user.id);
    } catch {
      res.status(404).json({ error: 'SPACE_NOT_FOUND' });
      return;
    }

    try {
      const version = await cloneStyleVersion(spaceId, styleId, {
        fromVersionId,
        label: body.label ?? undefined,
        artStyle: body.artStyle ?? undefined,
        colorPalette: body.colorPalette ?? undefined,
        lighting: body.lighting ?? undefined,
        camera: body.camera ?? undefined,
        renderTechnique: body.renderTechnique ?? undefined,
        negativePrompt: body.negativePrompt ?? undefined,
        baseSeed: body.baseSeed ?? undefined,
      });
      res.status(201).json({ version });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      if (message === 'STYLE_NOT_FOUND') {
        res.status(404).json({ error: 'STYLE_NOT_FOUND' });
        return;
      }
      if (message === 'STYLE_VERSION_NOT_FOUND') {
        res.status(404).json({ error: 'STYLE_VERSION_NOT_FOUND' });
        return;
      }
      // eslint-disable-next-line no-console
      console.error('[styles] Clone version error:', error);
      res.status(500).json({ error: 'STYLE_VERSION_CLONE_FAILED' });
    }
  },
);

export { router as stylesRouter };
