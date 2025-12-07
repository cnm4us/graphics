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

