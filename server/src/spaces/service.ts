import { getDbPool } from '../db/index.js';

export type SpaceRecord = {
  id: number;
  owner_user_id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Space = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

const mapSpace = (record: SpaceRecord): Space => ({
  id: record.id,
  name: record.name,
  description: record.description,
  createdAt: record.created_at.toISOString(),
  updatedAt: record.updated_at.toISOString(),
});

export const listSpacesForUser = async (userId: number): Promise<Space[]> => {
  const db = getDbPool();
  const [rows] = await db.query(
    'SELECT * FROM spaces WHERE owner_user_id = ? ORDER BY created_at DESC',
    [userId],
  );
  const list = rows as SpaceRecord[];
  return list.map(mapSpace);
};

export const createSpaceForUser = async (
  userId: number,
  name: string,
  description?: string | null,
): Promise<Space> => {
  const db = getDbPool();

  const [result] = await db.query(
    'INSERT INTO spaces (owner_user_id, name, description) VALUES (?, ?, ?)',
    [userId, name, description ?? null],
  );

  const insertResult = result as { insertId?: number };
  const id = insertResult.insertId;

  if (!id) {
    throw new Error('SPACE_CREATE_FAILED');
  }

  const [rows] = await db.query('SELECT * FROM spaces WHERE id = ? LIMIT 1', [
    id,
  ]);
  const list = rows as SpaceRecord[];
  if (list.length === 0) {
    throw new Error('SPACE_LOAD_FAILED');
  }

  return mapSpace(list[0]);
};

export const deleteSpaceForUser = async (
  userId: number,
  spaceId: number,
): Promise<boolean> => {
  const db = getDbPool();
  const [result] = await db.query(
    'DELETE FROM spaces WHERE id = ? AND owner_user_id = ?',
    [spaceId, userId],
  );
  const info = result as { affectedRows?: number };
  return (info.affectedRows ?? 0) > 0;
};

