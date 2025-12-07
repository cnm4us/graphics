export type Space = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export const fetchSpaces = async (): Promise<Space[]> => {
  const res = await fetch('/api/spaces', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('SPACES_FETCH_FAILED');
  }

  const data = (await res.json()) as { spaces: Space[] };
  return data.spaces;
};

export const createSpace = async (
  name: string,
  description: string,
): Promise<Space> => {
  const res = await fetch('/api/spaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, description }),
  });

  if (!res.ok) {
    throw new Error('SPACE_CREATE_FAILED');
  }

  const data = (await res.json()) as { space: Space };
  return data.space;
};

export const importSpaceContent = async (
  spaceId: number,
  payload: {
    characterIds?: number[];
    styleIds?: number[];
  },
): Promise<{ importedCharacters: number; importedStyles: number }> => {
  const res = await fetch(`/api/spaces/${spaceId}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('SPACE_IMPORT_FAILED');
  }

  const data = (await res.json()) as {
    importedCharacters: number;
    importedStyles: number;
  };
  return data;
};

export const deleteSpace = async (id: number): Promise<void> => {
  const res = await fetch(`/api/spaces/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok && res.status !== 404) {
    throw new Error('SPACE_DELETE_FAILED');
  }
};
