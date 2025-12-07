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

export type CharacterVersionDetail = {
  id: number;
  versionNumber: number;
  label: string | null;
  identitySummary: string | null;
  physicalDescription: string | null;
  wardrobeDescription: string | null;
  personalityMannerisms: string | null;
  extraNotes: string | null;
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

export const fetchCharacters = async (
  spaceId: number,
): Promise<CharacterSummary[]> => {
  const res = await fetch(`/api/spaces/${spaceId}/characters`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('CHARACTERS_FETCH_FAILED');
  }
  const data = (await res.json()) as { characters: CharacterSummary[] };
  return data.characters;
};

export const createCharacter = async (
  spaceId: number,
  payload: {
    name: string;
    description?: string;
  },
): Promise<CharacterSummary> => {
  const res = await fetch(`/api/spaces/${spaceId}/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('CHARACTER_CREATE_FAILED');
  }
  const data = (await res.json()) as { character: CharacterSummary };
  return data.character;
};

export const fetchCharacterWithVersions = async (
  spaceId: number,
  characterId: number,
): Promise<CharacterWithVersions> => {
  const res = await fetch(
    `/api/spaces/${spaceId}/characters/${characterId}/versions`,
    {
      credentials: 'include',
    },
  );
  if (!res.ok) {
    throw new Error('CHARACTER_VERSIONS_FETCH_FAILED');
  }
  const data = (await res.json()) as { character: CharacterWithVersions };
  return data.character;
};

export const cloneCharacterVersion = async (
  spaceId: number,
  characterId: number,
  payload: {
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
  },
): Promise<CharacterVersionDetail> => {
  const res = await fetch(
    `/api/spaces/${spaceId}/characters/${characterId}/versions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) {
    throw new Error('CHARACTER_VERSION_CLONE_FAILED');
  }
  const data = (await res.json()) as { version: CharacterVersionDetail };
  return data.version;
};

