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
  payload: {
    name: string;
    description?: string;
  },
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

