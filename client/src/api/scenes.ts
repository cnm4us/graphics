export type SceneSummary = {
  id: number;
  name: string;
  description: string | null;
  latestVersion?: {
    id: number;
    versionNumber: number;
    label: string | null;
  };
};

export const fetchScenes = async (
  spaceId: number,
): Promise<SceneSummary[]> => {
  const res = await fetch(`/api/spaces/${spaceId}/scenes`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('SCENES_FETCH_FAILED');
  }
  const data = (await res.json()) as { scenes: SceneSummary[] };
  return data.scenes;
};

