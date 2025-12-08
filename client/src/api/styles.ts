import type { StyleValues } from './styleDefinitions.ts';

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

export type NewStylePayload = {
  name: string;
  description?: string;
  styleDefinition?: StyleValues;
};

export const fetchStyles = async (
  spaceId: number,
): Promise<StyleSummary[]> => {
  const res = await fetch(`/api/spaces/${spaceId}/styles`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('STYLES_FETCH_FAILED');
  }
  const data = (await res.json()) as { styles: StyleSummary[] };
  return data.styles;
};

export const createStyle = async (
  spaceId: number,
  payload: NewStylePayload,
): Promise<StyleSummary> => {
  const res = await fetch(`/api/spaces/${spaceId}/styles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('STYLE_CREATE_FAILED');
  }
  const data = (await res.json()) as { style: StyleSummary };
  return data.style;
};

export const fetchStyleWithVersions = async (
  spaceId: number,
  styleId: number,
): Promise<StyleWithVersions> => {
  const res = await fetch(
    `/api/spaces/${spaceId}/styles/${styleId}/versions`,
    {
      credentials: 'include',
    },
  );
  if (!res.ok) {
    throw new Error('STYLE_VERSIONS_FETCH_FAILED');
  }
  const data = (await res.json()) as { style: StyleWithVersions };
  return data.style;
};

export const cloneStyleVersion = async (
  spaceId: number,
  styleId: number,
  payload: {
    fromVersionId: number;
    label?: string | null;
    artStyle?: string | null;
    colorPalette?: string | null;
    lighting?: string | null;
    camera?: string | null;
    renderTechnique?: string | null;
    negativePrompt?: string | null;
    baseSeed?: number | null;
  },
): Promise<StyleVersionDetail> => {
  const res = await fetch(
    `/api/spaces/${spaceId}/styles/${styleId}/versions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) {
    throw new Error('STYLE_VERSION_CLONE_FAILED');
  }
  const data = (await res.json()) as { version: StyleVersionDetail };
  return data.version;
};
