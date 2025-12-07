import { getDbPool } from '../db/index.js';

export type SceneRecord = {
  id: number;
  space_id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export type SceneVersionRecord = {
  id: number;
  scene_id: number;
  version_number: number;
  label: string | null;
  environment_description: string | null;
  layout_description: string | null;
  time_of_day: string | null;
  mood: string | null;
  base_prompt: string | null;
  negative_prompt: string | null;
  base_seed: number | null;
  cloned_from_version_id: number | null;
  created_at: Date;
};

export type SceneSummary = {
  id: number;
  name: string;
  description: string | null;
  latestVersion?: {
    id: number;
    versionNumber: number;
    label: string | null;
  };
};

export const assertSpaceOwnedByUserForScenes = async (
  spaceId: number,
  userId: number,
): Promise<void> => {
  const db = getDbPool();
  const [rows] = await db.query(
    'SELECT id FROM spaces WHERE id = ? AND owner_user_id = ? LIMIT 1',
    [spaceId, userId],
  );
  const list = rows as Array<{ id: number }>;
  if (list.length === 0) {
    const error = new Error('SPACE_NOT_FOUND_OR_FORBIDDEN');
    throw error;
  }
};

export const listScenesForSpace = async (
  spaceId: number,
): Promise<SceneSummary[]> => {
  const db = getDbPool();
  const [rows] = await db.query(
    'SELECT id, name, description FROM scenes WHERE space_id = ? ORDER BY created_at DESC',
    [spaceId],
  );
  const scenes = rows as SceneRecord[];

  if (scenes.length === 0) {
    return [];
  }

  const ids = scenes.map((s) => s.id);
  const [versionRows] = await db.query(
    'SELECT sv.* FROM scene_versions sv WHERE sv.scene_id IN (?) ORDER BY sv.scene_id, sv.version_number DESC',
    [ids],
  );
  const versions = versionRows as SceneVersionRecord[];

  const latestByScene = new Map<number, SceneVersionRecord>();
  for (const v of versions) {
    if (!latestByScene.has(v.scene_id)) {
      latestByScene.set(v.scene_id, v);
    }
  }

  return scenes.map((s) => {
    const latest = latestByScene.get(s.id);
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      latestVersion: latest
        ? {
            id: latest.id,
            versionNumber: latest.version_number,
            label: latest.label,
          }
        : undefined,
    };
  });
};

