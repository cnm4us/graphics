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

export type StyleVersionDetail = {
  id: number;
  versionNumber: number;
  label: string | null;
  artStyle: string | null;
  colorPalette: string | null;
  lighting: string | null;
  camera: string | null;
  renderTechnique: string | null;
  negativePrompt: string | null;
  baseSeed: number | null;
  clonedFromVersionId: number | null;
  createdAt: string;
};

export type StyleWithVersions = {
  id: number;
  name: string;
  description: string | null;
  versions: StyleVersionDetail[];
};

export type CloneStyleVersionInput = {
  fromVersionId: number;
  label?: string | null;
  artStyle?: string | null;
  colorPalette?: string | null;
  lighting?: string | null;
  camera?: string | null;
  renderTechnique?: string | null;
  negativePrompt?: string | null;
  baseSeed?: number | null;
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

export const getStyleWithVersions = async (
  spaceId: number,
  styleId: number,
): Promise<StyleWithVersions | null> => {
  const db = getDbPool();

  const [styleRows] = await db.query(
    'SELECT id, space_id, name, description FROM styles WHERE id = ? AND space_id = ? LIMIT 1',
    [styleId, spaceId],
  );
  const styles = styleRows as StyleRecord[];
  const style = styles[0];
  if (!style) {
    return null;
  }

  const [versionRows] = await db.query(
    'SELECT * FROM style_versions WHERE style_id = ? ORDER BY version_number ASC',
    [styleId],
  );
  const versions = versionRows as StyleVersionRecord[];

  const mapped: StyleVersionDetail[] = versions.map((v) => ({
    id: v.id,
    versionNumber: v.version_number,
    label: v.label,
    artStyle: v.art_style,
    colorPalette: v.color_palette,
    lighting: v.lighting,
    camera: v.camera,
    renderTechnique: v.render_technique,
    negativePrompt: v.negative_prompt,
    baseSeed: v.base_seed,
    clonedFromVersionId: v.cloned_from_version_id,
    createdAt: v.created_at.toISOString(),
  }));

  return {
    id: style.id,
    name: style.name,
    description: style.description,
    versions: mapped,
  };
};

export const cloneStyleVersion = async (
  spaceId: number,
  styleId: number,
  input: CloneStyleVersionInput,
): Promise<StyleVersionDetail> => {
  const db = getDbPool();

  const [styleRows] = await db.query(
    'SELECT id, space_id, name, description FROM styles WHERE id = ? AND space_id = ? LIMIT 1',
    [styleId, spaceId],
  );
  const styles = styleRows as StyleRecord[];
  if (styles.length === 0) {
    throw new Error('STYLE_NOT_FOUND');
  }

  const [fromRows] = await db.query(
    'SELECT * FROM style_versions WHERE id = ? AND style_id = ? LIMIT 1',
    [input.fromVersionId, styleId],
  );
  const fromList = fromRows as StyleVersionRecord[];
  const from = fromList[0];
  if (!from) {
    throw new Error('STYLE_VERSION_NOT_FOUND');
  }

  const [maxRows] = await db.query(
    'SELECT MAX(version_number) AS max_version FROM style_versions WHERE style_id = ?',
    [styleId],
  );
  const maxVersionRow = maxRows as Array<{ max_version: number | null }>;
  const nextVersionNumber = (maxVersionRow[0]?.max_version ?? 0) + 1;

  const label =
    input.label && input.label.trim().length > 0
      ? input.label
      : `v${nextVersionNumber}`;

  const artStyle =
    input.artStyle !== undefined ? input.artStyle : from.art_style;
  const colorPalette =
    input.colorPalette !== undefined ? input.colorPalette : from.color_palette;
  const lighting =
    input.lighting !== undefined ? input.lighting : from.lighting;
  const camera = input.camera !== undefined ? input.camera : from.camera;
  const renderTechnique =
    input.renderTechnique !== undefined
      ? input.renderTechnique
      : from.render_technique;
  const negativePrompt =
    input.negativePrompt !== undefined
      ? input.negativePrompt
      : from.negative_prompt;
  const baseSeed =
    input.baseSeed !== undefined ? input.baseSeed : from.base_seed;

  const [insertResult] = await db.query(
    'INSERT INTO style_versions (style_id, version_number, label, art_style, color_palette, lighting, camera, render_technique, negative_prompt, base_seed, cloned_from_version_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      styleId,
      nextVersionNumber,
      label,
      artStyle ?? null,
      colorPalette ?? null,
      lighting ?? null,
      camera ?? null,
      renderTechnique ?? null,
      negativePrompt ?? null,
      baseSeed ?? null,
      from.id,
    ],
  );
  const insert = insertResult as { insertId?: number };
  const versionId = insert.insertId;
  if (!versionId) {
    throw new Error('STYLE_VERSION_CREATE_FAILED');
  }

  const [newRows] = await db.query(
    'SELECT * FROM style_versions WHERE id = ? LIMIT 1',
    [versionId],
  );
  const newList = newRows as StyleVersionRecord[];
  const v = newList[0];

  return {
    id: v.id,
    versionNumber: v.version_number,
    label: v.label,
    artStyle: v.art_style,
    colorPalette: v.color_palette,
    lighting: v.lighting,
    camera: v.camera,
    renderTechnique: v.render_technique,
    negativePrompt: v.negative_prompt,
    baseSeed: v.base_seed,
    clonedFromVersionId: v.cloned_from_version_id,
    createdAt: v.created_at.toISOString(),
  };
};
