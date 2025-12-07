export type GeneratedImage = {
  id: number;
  spaceId: number;
  characterVersionId: number | null;
  styleVersionId: number | null;
  sceneVersionId: number | null;
  seed: number;
  prompt: string;
  negativePrompt: string | null;
  s3Key: string;
  s3Url?: string;
   cloudfrontUrl?: string;
  createdAt: string;
};

export const generateImage = async (params: {
  spaceId: number;
  characterVersionId: number;
  styleVersionId: number;
  seed?: number;
}): Promise<GeneratedImage> => {
  const res = await fetch('/api/images/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as
      | { error?: string; message?: string }
      | null;
    const msg = data?.message || data?.error || 'IMAGE_GENERATION_FAILED';
    throw new Error(msg);
  }

  const data = (await res.json()) as { image: GeneratedImage };
  return data.image;
};

export const fetchImagesForSpace = async (
  spaceId: number,
): Promise<GeneratedImage[]> => {
  const res = await fetch(`/api/spaces/${spaceId}/images`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('IMAGES_LIST_FAILED');
  }

  const data = (await res.json()) as { images: GeneratedImage[] };
  return data.images;
};

