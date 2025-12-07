import { getDbPool } from '../db/index.js';

export type CharacterRecord = {
  id: number;
  space_id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export type CharacterVersionRecord = {
  id: number;
  character_id: number;
  version_number: number;
  label: string | null;
  identity_summary: string | null;
  physical_description: string | null;
  wardrobe_description: string | null;
  personality_mannerisms: string | null;
  extra_notes: string | null;
  base_prompt: string | null;
  negative_prompt: string | null;
  base_seed: number | null;
  cloned_from_version_id: number | null;
  created_at: Date;
};

export type CharacterSummary = {
  id: number;
  name: string;
  description: string | null;
  latestVersion?: {
    id: number;
    versionNumber: number;
    label: string | null;
  };
};

export type NewCharacterInput = {
  name: string;
  description?: string;
  identitySummary?: string;
  physicalDescription?: string;
  wardrobeDescription?: string;
  personalityMannerisms?: string;
  extraNotes?: string;
};

export const assertSpaceOwnedByUser = async (
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

export const listCharactersForSpace = async (
  spaceId: number,
): Promise<CharacterSummary[]> => {
  const db = getDbPool();
  const [rows] = await db.query(
    'SELECT id, name, description FROM characters WHERE space_id = ? ORDER BY created_at DESC',
    [spaceId],
  );
  const chars = rows as CharacterRecord[];

  if (chars.length === 0) {
    return [];
  }

  const ids = chars.map((c) => c.id);
  const [versionRows] = await db.query(
    'SELECT cv.* FROM character_versions cv WHERE cv.character_id IN (?) ORDER BY cv.character_id, cv.version_number DESC',
    [ids],
  );
  const versions = versionRows as CharacterVersionRecord[];

  const latestByCharacter = new Map<number, CharacterVersionRecord>();
  for (const v of versions) {
    if (!latestByCharacter.has(v.character_id)) {
      latestByCharacter.set(v.character_id, v);
    }
  }

  return chars.map((c) => {
    const latest = latestByCharacter.get(c.id);
    return {
      id: c.id,
      name: c.name,
      description: c.description,
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

export const createCharacterForSpace = async (
  spaceId: number,
  input: NewCharacterInput,
): Promise<CharacterSummary> => {
  const db = getDbPool();

  const [charResult] = await db.query(
    'INSERT INTO characters (space_id, name, description) VALUES (?, ?, ?)',
    [spaceId, input.name, input.description ?? null],
  );
  const insertChar = charResult as { insertId?: number };
  const characterId = insertChar.insertId;
  if (!characterId) {
    throw new Error('CHARACTER_CREATE_FAILED');
  }

  const [versionResult] = await db.query(
    'INSERT INTO character_versions (character_id, version_number, label, identity_summary, physical_description, wardrobe_description, personality_mannerisms, extra_notes, base_prompt, negative_prompt, base_seed, cloned_from_version_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      characterId,
      1,
      'v1',
      input.identitySummary ?? null,
      input.physicalDescription ?? null,
      input.wardrobeDescription ?? null,
      input.personalityMannerisms ?? null,
      input.extraNotes ?? null,
      null,
      null,
      null,
      null,
    ],
  );
  const insertVer = versionResult as { insertId?: number };
  const versionId = insertVer.insertId;
  if (!versionId) {
    throw new Error('CHARACTER_VERSION_CREATE_FAILED');
  }

  return {
    id: characterId,
    name: input.name,
    description: input.description ?? null,
    latestVersion: {
      id: versionId,
      versionNumber: 1,
      label: 'v1',
    },
  };
};

