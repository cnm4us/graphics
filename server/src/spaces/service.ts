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

export const importContentIntoSpace = async (
  userId: number,
  targetSpaceId: number,
  characterIds: number[],
  styleIds: number[],
): Promise<{ importedCharacters: number; importedStyles: number }> => {
  const db = getDbPool();

  const [spaceRows] = await db.query(
    'SELECT id FROM spaces WHERE id = ? AND owner_user_id = ? LIMIT 1',
    [targetSpaceId, userId],
  );
  const spaces = spaceRows as Array<{ id: number }>;
  if (spaces.length === 0) {
    const error = new Error('SPACE_NOT_FOUND_OR_FORBIDDEN');
    throw error;
  }

  let importedCharacters = 0;
  let importedStyles = 0;

  if (characterIds.length > 0) {
    const [charRows] = await db.query(
      `SELECT c.*
       FROM characters c
       JOIN spaces s ON c.space_id = s.id
       WHERE c.id IN (?) AND s.owner_user_id = ?`,
      [characterIds, userId],
    );
    const characters = charRows as Array<{
      id: number;
      name: string;
      description: string | null;
    }>;

    for (const sourceChar of characters) {
      const [insertCharResult] = await db.query(
        'INSERT INTO characters (space_id, name, description) VALUES (?, ?, ?)',
        [targetSpaceId, sourceChar.name, sourceChar.description ?? null],
      );
      const insertChar = insertCharResult as { insertId?: number };
      const newCharacterId = insertChar.insertId;
      if (!newCharacterId) {
        // eslint-disable-next-line no-console
        console.warn(
          '[spaces] Failed to insert imported character for id',
          sourceChar.id,
        );
        // eslint-disable-next-line no-continue
        continue;
      }

      const [versionRows] = await db.query(
        'SELECT * FROM character_versions WHERE character_id = ? ORDER BY version_number ASC',
        [sourceChar.id],
      );
      const versions = versionRows as any[];

      for (const v of versions) {
        await db.query(
          'INSERT INTO character_versions (character_id, version_number, label, identity_summary, physical_description, wardrobe_description, personality_mannerisms, extra_notes, base_prompt, negative_prompt, base_seed, cloned_from_version_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            newCharacterId,
            v.version_number,
            v.label ?? null,
            v.identity_summary ?? null,
            v.physical_description ?? null,
            v.wardrobe_description ?? null,
            v.personality_mannerisms ?? null,
            v.extra_notes ?? null,
            v.base_prompt ?? null,
            v.negative_prompt ?? null,
            v.base_seed ?? null,
            v.cloned_from_version_id ?? null,
          ],
        );
      }

      importedCharacters += 1;
    }
  }

  if (styleIds.length > 0) {
    const [styleRows] = await db.query(
      `SELECT st.*
       FROM styles st
       JOIN spaces s ON st.space_id = s.id
       WHERE st.id IN (?) AND s.owner_user_id = ?`,
      [styleIds, userId],
    );
    const styles = styleRows as Array<{
      id: number;
      name: string;
      description: string | null;
    }>;

    for (const sourceStyle of styles) {
      const [insertStyleResult] = await db.query(
        'INSERT INTO styles (space_id, name, description) VALUES (?, ?, ?)',
        [targetSpaceId, sourceStyle.name, sourceStyle.description ?? null],
      );
      const insertStyle = insertStyleResult as { insertId?: number };
      const newStyleId = insertStyle.insertId;
      if (!newStyleId) {
        // eslint-disable-next-line no-console
        console.warn(
          '[spaces] Failed to insert imported style for id',
          sourceStyle.id,
        );
        // eslint-disable-next-line no-continue
        continue;
      }

      const [versionRows] = await db.query(
        'SELECT * FROM style_versions WHERE style_id = ? ORDER BY version_number ASC',
        [sourceStyle.id],
      );
      const versions = versionRows as any[];

      for (const v of versions) {
        await db.query(
          'INSERT INTO style_versions (style_id, version_number, label, art_style, color_palette, lighting, camera, render_technique, negative_prompt, base_seed, cloned_from_version_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            newStyleId,
            v.version_number,
            v.label ?? null,
            v.art_style ?? null,
            v.color_palette ?? null,
            v.lighting ?? null,
            v.camera ?? null,
            v.render_technique ?? null,
            v.negative_prompt ?? null,
            v.base_seed ?? null,
            v.cloned_from_version_id ?? null,
          ],
        );
      }

      importedStyles += 1;
    }
  }

  return { importedCharacters, importedStyles };
};
