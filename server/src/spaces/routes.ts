import express, { type Request, type Response } from 'express';
import { attachUserFromToken, requireAuth } from '../auth/routes.js';
import {
  createSpaceForUser,
  deleteSpaceForUser,
  listSpacesForUser,
} from './service.js';
import type { AuthPayload, PublicUser } from '../auth/service.js';
import { listImagesForSpace, deleteImageForUser } from '../images/service.js';

type AuthedRequest = Request & { user?: PublicUser; authPayload?: AuthPayload };

const router = express.Router();

// Attach user from JWT cookie/header, then enforce auth for all routes in this router.
router.use(attachUserFromToken);
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'UNAUTHENTICATED' });
    return;
  }

  const spaces = await listSpacesForUser(user.id);
  res.status(200).json({ spaces });
});

router.post('/', async (req: AuthedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'UNAUTHENTICATED' });
    return;
  }

  const { name, description } = req.body as {
    name?: string;
    description?: string | null;
  };

  const trimmedName = name?.trim();
  if (!trimmedName) {
    res.status(400).json({ error: 'NAME_REQUIRED' });
    return;
  }

  try {
    const space = await createSpaceForUser(user.id, trimmedName, description);
    res.status(201).json({ space });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[spaces] Create error:', error);
    res.status(500).json({ error: 'SPACE_CREATE_FAILED' });
  }
});

router.delete('/:id', async (req: AuthedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'UNAUTHENTICATED' });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ error: 'INVALID_ID' });
    return;
  }

  const deleted = await deleteSpaceForUser(user.id, id);
  if (!deleted) {
    res.status(404).json({ error: 'SPACE_NOT_FOUND' });
    return;
  }

  res.status(204).send();
});

router.get('/:spaceId/images', async (req: AuthedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'UNAUTHENTICATED' });
    return;
  }

  const spaceId = Number(req.params.spaceId);
  if (!Number.isFinite(spaceId) || spaceId <= 0) {
    res.status(400).json({ error: 'INVALID_SPACE_ID' });
    return;
  }

  try {
    const images = await listImagesForSpace(user.id, spaceId);
    res.status(200).json({ images });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    if (message === 'SPACE_NOT_FOUND_OR_FORBIDDEN') {
      res.status(404).json({ error: 'SPACE_NOT_FOUND' });
      return;
    }
    // eslint-disable-next-line no-console
    console.error('[spaces] List images error:', error);
    res.status(500).json({ error: 'IMAGES_LIST_FAILED' });
  }
});

router.delete(
  '/:spaceId/images/:imageId',
  async (req: AuthedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'UNAUTHENTICATED' });
      return;
    }

    const spaceId = Number(req.params.spaceId);
    const imageId = Number(req.params.imageId);

    if (!Number.isFinite(spaceId) || spaceId <= 0) {
      res.status(400).json({ error: 'INVALID_SPACE_ID' });
      return;
    }
    if (!Number.isFinite(imageId) || imageId <= 0) {
      res.status(400).json({ error: 'INVALID_IMAGE_ID' });
      return;
    }

    try {
      const deleted = await deleteImageForUser(user.id, spaceId, imageId);
      if (!deleted) {
        res.status(404).json({ error: 'IMAGE_NOT_FOUND' });
        return;
      }
      res.status(204).send();
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      if (message === 'SPACE_NOT_FOUND_OR_FORBIDDEN') {
        res.status(404).json({ error: 'SPACE_NOT_FOUND' });
        return;
      }
      // eslint-disable-next-line no-console
      console.error('[spaces] Delete image error:', error);
      res.status(500).json({ error: 'IMAGE_DELETE_FAILED' });
    }
  },
);

export { router as spacesRouter };
