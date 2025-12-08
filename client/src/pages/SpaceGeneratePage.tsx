import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import {
  fetchCharacters,
  type CharacterSummary,
} from '../api/characters.ts';
import { fetchStyles, type StyleSummary } from '../api/styles.ts';
import {
  generateImage,
  fetchImagesForSpace,
  deleteImage as deleteImageApi,
  type GeneratedImage,
} from '../api/images.ts';
import { useSpaceContext } from '../space/SpaceContext.tsx';

export function SpaceGeneratePage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const { setActiveSpaceId } = useSpaceContext();

  const spaceIdParam = params.spaceId;
  const spaceId =
    spaceIdParam && Number.isFinite(Number(spaceIdParam))
      ? Number(spaceIdParam)
      : null;

  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [styles, setStyles] = useState<StyleSummary[]>([]);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [selectedCharacterVersionId, setSelectedCharacterVersionId] =
    useState<number | null>(null);
  const [selectedStyleVersionId, setSelectedStyleVersionId] =
    useState<number | null>(null);
  const [seedInput, setSeedInput] = useState('');
  const [lastGenerated, setLastGenerated] = useState<GeneratedImage | null>(
    null,
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (spaceId) {
      setActiveSpaceId(spaceId);
    }
  }, [spaceId, setActiveSpaceId]);

  useEffect(() => {
    if (!user || !spaceId) return;

    const loadMeta = async (): Promise<void> => {
      setMetaError(null);
      try {
        const [chars, sts] = await Promise.all([
          fetchCharacters(spaceId),
          fetchStyles(spaceId),
        ]);
        setCharacters(chars);
        setStyles(sts);

        const firstCharVersionId =
          chars[0]?.latestVersion?.id ?? null;
        const firstStyleVersionId =
          sts[0]?.latestVersion?.id ?? null;

        setSelectedCharacterVersionId(firstCharVersionId);
        setSelectedStyleVersionId(firstStyleVersionId);
      } catch {
        setMetaError('Failed to load characters/styles.');
      }
    };

    void loadMeta();
  }, [user, spaceId]);

  useEffect(() => {
    const loadImages = async (): Promise<void> => {
      if (!user || !spaceId) {
        setImages([]);
        return;
      }
      setImagesError(null);
      try {
        const imgs = await fetchImagesForSpace(spaceId);
        setImages(imgs);
      } catch {
        setImagesError('Failed to load images.');
      }
    };

    void loadImages();
  }, [user, spaceId, lastGenerated]);

  const handleDeleteImage = async (image: GeneratedImage): Promise<void> => {
    if (!spaceId) return;
    try {
      await deleteImageApi(spaceId, image.id);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      if (lastGenerated && lastGenerated.id === image.id) {
        setLastGenerated(null);
      }
      if (modalImage && modalImage.id === image.id) {
        setModalImage(null);
      }
    } catch {
      setImagesError('Failed to delete image.');
    }
  };

  const handleGenerateImage = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setImageError(null);

    if (!spaceId || !selectedCharacterVersionId || !selectedStyleVersionId) {
      setImageError('Please select a character and style.');
      return;
    }

    const seed =
      seedInput.trim().length > 0 ? Number(seedInput.trim()) : undefined;
    if (seed !== undefined && !Number.isFinite(seed)) {
      setImageError('Seed must be a number.');
      return;
    }

    try {
      const image = await generateImage({
        spaceId,
        characterVersionId: selectedCharacterVersionId,
        styleVersionId: selectedStyleVersionId,
        seed,
      });
      setLastGenerated(image);
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : 'IMAGE_GENERATION_FAILED';
      setImageError(message);
    }
  };

  if (loading) {
    return (
      <section>
        <h2>Generate images</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>Generate images</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  if (!spaceId) {
    return (
      <section>
        <h2>Generate images</h2>
        <p>Invalid space ID.</p>
        <p>
          <Link to="/spaces">Back to spaces</Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Generate images</h2>
      <p>Generate new images for this space.</p>
      {metaError && <p style={{ color: 'red' }}>{metaError}</p>}
      {characters.length === 0 && styles.length === 0 && (
        <p>
          This space does not have any characters or styles yet. Create them
          first, then return here to generate images.
        </p>
      )}

      {characters.length > 0 && styles.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <form onSubmit={handleGenerateImage} style={{ maxWidth: 480 }}>
            {imageError && <p style={{ color: 'red' }}>{imageError}</p>}

            <div style={{ marginBottom: '0.5rem' }}>
              <label htmlFor="characterSelect">Character version</label>
              <select
                id="characterSelect"
                value={selectedCharacterVersionId ?? ''}
                onChange={(e) =>
                  setSelectedCharacterVersionId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                style={{ display: 'block', width: '100%' }}
              >
                <option value="">Select a character</option>
                {characters.map((c) =>
                  c.latestVersion ? (
                    <option
                      key={c.id}
                      value={c.latestVersion.id}
                    >{`${c.name} (v${c.latestVersion.versionNumber}${
                      c.latestVersion.label ? `: ${c.latestVersion.label}` : ''
                    })`}</option>
                  ) : null,
                )}
              </select>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label htmlFor="styleSelect">Style version</label>
              <select
                id="styleSelect"
                value={selectedStyleVersionId ?? ''}
                onChange={(e) =>
                  setSelectedStyleVersionId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                style={{ display: 'block', width: '100%' }}
              >
                <option value="">Select a style</option>
                {styles.map((s) =>
                  s.latestVersion ? (
                    <option
                      key={s.id}
                      value={s.latestVersion.id}
                    >{`${s.name} (v${s.latestVersion.versionNumber}${
                      s.latestVersion.label ? `: ${s.latestVersion.label}` : ''
                    })`}</option>
                  ) : null,
                )}
              </select>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label htmlFor="seedInput">Seed (optional)</label>
              <input
                id="seedInput"
                type="text"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                style={{ display: 'block', width: '100%' }}
              />
            </div>

            <button type="submit">Generate image</button>
          </form>

          {lastGenerated && (
            <div style={{ marginTop: 16 }}>
              <h3>Last generated image</h3>
              <p>Seed: {lastGenerated.seed}</p>
              <p>S3 key: {lastGenerated.s3Key}</p>
              {lastGenerated.cloudfrontUrl && (
                <p>
                  URL:{' '}
                  <a
                    href={lastGenerated.cloudfrontUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lastGenerated.cloudfrontUrl}
                  </a>
                </p>
              )}
              {(lastGenerated.cloudfrontUrl || lastGenerated.s3Url) && (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={lastGenerated.cloudfrontUrl ?? lastGenerated.s3Url}
                    alt="Last generated"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <section style={{ marginTop: 32 }}>
        <h3>Images in this space</h3>
        {imagesError && <p style={{ color: 'red' }}>{imagesError}</p>}
        {images.length === 0 && <p>No images generated yet.</p>}
        {images.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
              marginTop: 12,
            }}
          >
            {images.map((img) => (
              <figure
                key={img.id}
                style={{
                  border: '1px solid #ccc',
                  padding: 8,
                  borderRadius: 4,
                }}
              >
                {(img.cloudfrontUrl || img.s3Url) && (
                  <button
                    type="button"
                    onClick={() => setModalImage(img)}
                    style={{
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    <img
                      src={img.cloudfrontUrl ?? img.s3Url}
                      alt={img.prompt.slice(0, 80)}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </button>
                )}
                <figcaption style={{ marginTop: 4, fontSize: '0.8rem' }}>
                  <div>Seed: {img.seed}</div>
                  <div>
                    Created:{' '}
                    {new Date(img.createdAt).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {modalImage && (modalImage.cloudfrontUrl || modalImage.s3Url) && (
        <div
          role="presentation"
          onClick={() => setModalImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              background: '#fff',
              padding: 16,
              borderRadius: 6,
              maxWidth: '90vw',
              maxHeight: '90vh',
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            <div style={{ alignSelf: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
                aria-label="Close image"
              >
                ×
              </button>
            </div>
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <img
                src={modalImage.cloudfrontUrl ?? modalImage.s3Url}
                alt={modalImage.prompt.slice(0, 120)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
            <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
              <div>Seed: {modalImage.seed}</div>
              <div>
                Created:{' '}
                {new Date(modalImage.createdAt).toLocaleString(undefined, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </div>
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    void handleDeleteImage(modalImage);
                  }}
                >
                  Delete image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p>
        <Link to={`/spaces/${spaceId}`}>&larr; Back to space</Link>
      </p>
    </section>
  );
}
