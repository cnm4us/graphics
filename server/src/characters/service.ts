import { getDbPool } from '../db/index.js';

export type CharacterAppearanceValues = Record<
  string,
  Record<string, string | string[]>
>;

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
  appearance_json?: string | null;
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
   appearance?: CharacterAppearanceValues;
};

export type CharacterVersionDetail = {
  id: number;
  versionNumber: number;
  label: string | null;
  identitySummary: string | null;
  physicalDescription: string | null;
  wardrobeDescription: string | null;
  personalityMannerisms: string | null;
  extraNotes: string | null;
  appearance?: CharacterAppearanceValues | null;
  basePrompt: string | null;
  negativePrompt: string | null;
  baseSeed: number | null;
  clonedFromVersionId: number | null;
  createdAt: string;
};

export type CharacterWithVersions = {
  id: number;
  name: string;
  description: string | null;
  versions: CharacterVersionDetail[];
};

export type CloneCharacterVersionInput = {
  fromVersionId: number;
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

export type UpdateCharacterInput = {
  name?: string;
  description?: string;
  appearance?: CharacterAppearanceValues;
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

  const appearanceJson =
    input.appearance && typeof input.appearance === 'object'
      ? JSON.stringify(input.appearance)
      : JSON.stringify({});

  const [versionResult] = await db.query(
    'INSERT INTO character_versions (character_id, version_number, label, identity_summary, physical_description, wardrobe_description, personality_mannerisms, extra_notes, appearance_json, base_prompt, negative_prompt, base_seed, cloned_from_version_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      characterId,
      1,
      'v1',
      input.identitySummary ?? null,
      input.physicalDescription ?? null,
      input.wardrobeDescription ?? null,
      input.personalityMannerisms ?? null,
      input.extraNotes ?? null,
      appearanceJson,
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

export const updateCharacterForSpace = async (
  spaceId: number,
  characterId: number,
  input: UpdateCharacterInput,
): Promise<CharacterSummary | null> => {
  const db = getDbPool();

  const [charRows] = await db.query(
    'SELECT id, space_id, name, description FROM characters WHERE id = ? AND space_id = ? LIMIT 1',
    [characterId, spaceId],
  );
  const chars = charRows as CharacterRecord[];
  const existing = chars[0];
  if (!existing) {
    return null;
  }

  const [latestVersionRows] = await db.query(
    'SELECT id, version_number FROM character_versions WHERE character_id = ? ORDER BY version_number DESC LIMIT 1',
    [characterId],
  );
  const latestVersionList = latestVersionRows as Array<{
    id: number;
    version_number: number;
  }>;
  const latestVersion = latestVersionList[0];

  if (latestVersion) {
    const [imageRows] = await db.query(
      'SELECT id FROM images WHERE character_version_id = ? LIMIT 1',
      [latestVersion.id],
    );
    const images = imageRows as Array<{ id: number }>;
    if (images.length > 0) {
      const error = new Error('CHARACTER_HAS_GENERATED_IMAGES');
      throw error;
    }
  }

  const trimmedName =
    input.name !== undefined && input.name.trim().length > 0
      ? input.name.trim()
      : existing.name;
  const trimmedDescription =
    input.description !== undefined
      ? input.description.trim() || null
      : existing.description;

  await db.query(
    'UPDATE characters SET name = ?, description = ? WHERE id = ?',
    [trimmedName, trimmedDescription, characterId],
  );

  if (input.appearance && latestVersion) {
    const appearanceJson = JSON.stringify(input.appearance);
    await db.query(
      'UPDATE character_versions SET appearance_json = ? WHERE id = ?',
      [appearanceJson, latestVersion.id],
    );
  }

  return {
    id: existing.id,
    name: trimmedName,
    description: trimmedDescription,
    latestVersion: latestVersion
      ? {
          id: latestVersion.id,
          versionNumber: latestVersion.version_number,
          label: null,
        }
      : undefined,
  };
};

export const getCharacterWithVersions = async (
  spaceId: number,
  characterId: number,
): Promise<CharacterWithVersions | null> => {
  const db = getDbPool();

  const [charRows] = await db.query(
    'SELECT id, space_id, name, description FROM characters WHERE id = ? AND space_id = ? LIMIT 1',
    [characterId, spaceId],
  );
  const chars = charRows as CharacterRecord[];
  const character = chars[0];
  if (!character) {
    return null;
  }

  const [versionRows] = await db.query(
    'SELECT * FROM character_versions WHERE character_id = ? ORDER BY version_number ASC',
    [characterId],
  );
  const versions = versionRows as CharacterVersionRecord[];

  const mapped: CharacterVersionDetail[] = versions.map((v) => {
    let appearance: CharacterAppearanceValues | null = null;
    if (v.appearance_json) {
      try {
        const parsed = JSON.parse(
          typeof v.appearance_json === 'string'
            ? v.appearance_json
            : String(v.appearance_json),
        );
        if (parsed && typeof parsed === 'object') {
          appearance = parsed as CharacterAppearanceValues;
        }
      } catch {
        appearance = null;
      }
    }

    return {
      id: v.id,
      versionNumber: v.version_number,
      label: v.label,
      identitySummary: v.identity_summary,
      physicalDescription: v.physical_description,
      wardrobeDescription: v.wardrobe_description,
      personalityMannerisms: v.personality_mannerisms,
      extraNotes: v.extra_notes,
      appearance,
      basePrompt: v.base_prompt,
      negativePrompt: v.negative_prompt,
      baseSeed: v.base_seed,
      clonedFromVersionId: v.cloned_from_version_id,
      createdAt: v.created_at.toISOString(),
    };
  });

  return {
    id: character.id,
    name: character.name,
    description: character.description,
    versions: mapped,
  };
};

export const cloneCharacterVersion = async (
  spaceId: number,
  characterId: number,
  input: CloneCharacterVersionInput,
): Promise<CharacterVersionDetail> => {
  const db = getDbPool();

  const [charRows] = await db.query(
    'SELECT id, space_id, name, description FROM characters WHERE id = ? AND space_id = ? LIMIT 1',
    [characterId, spaceId],
  );
  const chars = charRows as CharacterRecord[];
  if (chars.length === 0) {
    throw new Error('CHARACTER_NOT_FOUND');
  }

  const [fromRows] = await db.query(
    'SELECT * FROM character_versions WHERE id = ? AND character_id = ? LIMIT 1',
    [input.fromVersionId, characterId],
  );
  const fromList = fromRows as CharacterVersionRecord[];
  const from = fromList[0];
  if (!from) {
    throw new Error('CHARACTER_VERSION_NOT_FOUND');
  }

  const [maxRows] = await db.query(
    'SELECT MAX(version_number) AS max_version FROM character_versions WHERE character_id = ?',
    [characterId],
  );
  const maxVersionRow = maxRows as Array<{ max_version: number | null }>;
  const nextVersionNumber = (maxVersionRow[0]?.max_version ?? 0) + 1;

  const label =
    input.label && input.label.trim().length > 0
      ? input.label
      : `v${nextVersionNumber}`;

  const identitySummary =
    input.identitySummary !== undefined
      ? input.identitySummary
      : from.identity_summary;
  const physicalDescription =
    input.physicalDescription !== undefined
      ? input.physicalDescription
      : from.physical_description;
  const wardrobeDescription =
    input.wardrobeDescription !== undefined
      ? input.wardrobeDescription
      : from.wardrobe_description;
  const personalityMannerisms =
    input.personalityMannerisms !== undefined
      ? input.personalityMannerisms
      : from.personality_mannerisms;
  const extraNotes =
    input.extraNotes !== undefined ? input.extraNotes : from.extra_notes;
  const basePrompt =
    input.basePrompt !== undefined ? input.basePrompt : from.base_prompt;
  const negativePrompt =
    input.negativePrompt !== undefined
      ? input.negativePrompt
      : from.negative_prompt;
  const baseSeed =
    input.baseSeed !== undefined ? input.baseSeed : from.base_seed;

  const [insertResult] = await db.query(
    'INSERT INTO character_versions (character_id, version_number, label, identity_summary, physical_description, wardrobe_description, personality_mannerisms, extra_notes, appearance_json, base_prompt, negative_prompt, base_seed, cloned_from_version_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      characterId,
      nextVersionNumber,
      label,
      identitySummary ?? null,
      physicalDescription ?? null,
      wardrobeDescription ?? null,
      personalityMannerisms ?? null,
      extraNotes ?? null,
      from.appearance_json ?? JSON.stringify({}),
      basePrompt ?? null,
      negativePrompt ?? null,
      baseSeed ?? null,
      from.id,
    ],
  );
  const insert = insertResult as { insertId?: number };
  const versionId = insert.insertId;
  if (!versionId) {
    throw new Error('CHARACTER_VERSION_CREATE_FAILED');
  }

  const [newRows] = await db.query(
    'SELECT * FROM character_versions WHERE id = ? LIMIT 1',
    [versionId],
  );
  const newList = newRows as CharacterVersionRecord[];
  const v = newList[0];

  return {
    id: v.id,
    versionNumber: v.version_number,
    label: v.label,
    identitySummary: v.identity_summary,
    physicalDescription: v.physical_description,
    wardrobeDescription: v.wardrobe_description,
    personalityMannerisms: v.personality_mannerisms,
    extraNotes: v.extra_notes,
    basePrompt: v.base_prompt,
    negativePrompt: v.negative_prompt,
    baseSeed: v.base_seed,
    clonedFromVersionId: v.cloned_from_version_id,
    createdAt: v.created_at.toISOString(),
  };
};
