import express, { type Request, type Response } from 'express';
import { attachUserFromToken, requireAuth } from '../auth/routes.js';
import type { AuthPayload, PublicUser } from '../auth/service.js';
import {
  assertSpaceOwnedByUserForScenes,
  listScenesForSpace,
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
    await assertSpaceOwnedByUserForScenes(spaceId, user.id);
  } catch {
    res.status(404).json({ error: 'SPACE_NOT_FOUND' });
    return;
  }

  const scenes = await listScenesForSpace(spaceId);
  res.status(200).json({ scenes });
});

export { router as scenesRouter };

