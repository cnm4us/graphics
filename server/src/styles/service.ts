import { getDbPool } from '../db/index.js';

export type StyleRecord = {
  id: number;
  space_id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export type StyleVersionRecord = {
  id: number;
  style_id: number;
  version_number: number;
  label: string | null;
  art_style: string | null;
  color_palette: string | null;
  lighting: string | null;
  camera: string | null;
  render_technique: string | null;
  negative_prompt: string | null;
  base_seed: number | null;
  cloned_from_version_id: number | null;
  created_at: Date;
};

export type StyleSummary = {
  id: number;
  name: string;
  description: string | null;
  latestVersion?: {
    id: number;
    versionNumber: number;
    label: string | null;
  };
};

export type NewStyleInput = {
  name: string;
  description?: string;
  artStyle?: string;
  colorPalette?: string;
  lighting?: string;
  camera?: string;
  renderTechnique?: string;
  negativePrompt?: string;
};

export const assertSpaceOwnedByUserForStyles = async (
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

export const listStylesForSpace = async (
  spaceId: number,
): Promise<StyleSummary[]> => {
  const db = getDbPool();
  const [rows] = await db.query(
    'SELECT id, name, description FROM styles WHERE space_id = ? ORDER BY created_at DESC',
    [spaceId],
  );
  const styles = rows as StyleRecord[];

  if (styles.length === 0) {
    return [];
  }

  const ids = styles.map((s) => s.id);
  const [versionRows] = await db.query(
    'SELECT sv.* FROM style_versions sv WHERE sv.style_id IN (?) ORDER BY sv.style_id, sv.version_number DESC',
    [ids],
  );
  const versions = versionRows as StyleVersionRecord[];

  const latestByStyle = new Map<number, StyleVersionRecord>();
  for (const v of versions) {
    if (!latestByStyle.has(v.style_id)) {
      latestByStyle.set(v.style_id, v);
    }
  }

  return styles.map((s) => {
    const latest = latestByStyle.get(s.id);
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

export const createStyleForSpace = async (
  spaceId: number,
  input: NewStyleInput,
): Promise<StyleSummary> => {
  const db = getDbPool();

  const [styleResult] = await db.query(
    'INSERT INTO styles (space_id, name, description) VALUES (?, ?, ?)',
    [spaceId, input.name, input.description ?? null],
  );
  const insertStyle = styleResult as { insertId?: number };
  const styleId = insertStyle.insertId;
  if (!styleId) {
    throw new Error('STYLE_CREATE_FAILED');
  }

  const [versionResult] = await db.query(
    'INSERT INTO style_versions (style_id, version_number, label, art_style, color_palette, lighting, camera, render_technique, negative_prompt, base_seed, cloned_from_version_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      styleId,
      1,
      'v1',
      input.artStyle ?? null,
      input.colorPalette ?? null,
      input.lighting ?? null,
      input.camera ?? null,
      input.renderTechnique ?? null,
      input.negativePrompt ?? null,
      null,
      null,
    ],
  );
  const insertVer = versionResult as { insertId?: number };
  const versionId = insertVer.insertId;
  if (!versionId) {
    throw new Error('STYLE_VERSION_CREATE_FAILED');
  }

  return {
    id: styleId,
    name: input.name,
    description: input.description ?? null,
    latestVersion: {
      id: versionId,
      versionNumber: 1,
      label: 'v1',
    },
  };
};

