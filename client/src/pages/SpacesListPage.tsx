import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import {
  createSpace,
  deleteSpace,
  fetchSpaces,
  importSpaceContent,
  type Space,
} from '../api/spaces.ts';
import {
  fetchCharacters,
  type CharacterSummary,
} from '../api/characters.ts';
import { fetchStyles, type StyleSummary } from '../api/styles.ts';
import {
  deleteImage as deleteImageApi,
  fetchImagesForSpace,
  type GeneratedImage,
} from '../api/images.ts';

type CharacterOption = CharacterSummary & {
  spaceId: number;
  spaceName: string;
};

type StyleOption = StyleSummary & {
  spaceId: number;
  spaceName: string;
};

export function SpacesListPage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [allCharacters, setAllCharacters] = useState<CharacterOption[]>([]);
  const [allStyles, setAllStyles] = useState<StyleOption[]>([]);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [selectedCharacterIds, setSelectedCharacterIds] = useState<
    Set<number>
  >(new Set());
  const [selectedStyleIds, setSelectedStyleIds] = useState<Set<number>>(
    new Set(),
  );

  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const loadSpacesAndMeta = async (): Promise<void> => {
      setSpacesLoading(true);
      setSpacesError(null);
      setMetaError(null);
      try {
        const list = await fetchSpaces();
        setSpaces(list);

        // Preload characters and styles from all spaces owned by this user.
        const [charactersBySpace, stylesBySpace] = await Promise.all([
          Promise.all(
            list.map(async (space) => {
              try {
                const chars = await fetchCharacters(space.id);
                return chars.map<CharacterOption>((c) => ({
                  ...c,
                  spaceId: space.id,
                  spaceName: space.name,
                }));
              } catch {
                return [] as CharacterOption[];
              }
            }),
          ),
          Promise.all(
            list.map(async (space) => {
              try {
                const sts = await fetchStyles(space.id);
                return sts.map<StyleOption>((s) => ({
                  ...s,
                  spaceId: space.id,
                  spaceName: space.name,
                }));
              } catch {
                return [] as StyleOption[];
              }
            }),
          ),
        ]);

        setAllCharacters(charactersBySpace.flat());
        setAllStyles(stylesBySpace.flat());

        if (!selectedSpaceId && list.length > 0) {
          setSelectedSpaceId(list[0].id);
        }
      } catch {
        setSpacesError('Failed to load spaces.');
      } finally {
        setSpacesLoading(false);
      }
    };

    void loadSpacesAndMeta();
  }, [user, selectedSpaceId]);

  useEffect(() => {
    const loadImages = async (): Promise<void> => {
      if (!selectedSpaceId) {
        setImages([]);
        return;
      }
      setImagesError(null);
      try {
        const imgs = await fetchImagesForSpace(selectedSpaceId);
        setImages(imgs);
      } catch {
        setImagesError('Failed to load images.');
      }
    };

    void loadImages();
  }, [selectedSpaceId]);

  const handleToggleCharacterImport = (id: number): void => {
    setSelectedCharacterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleStyleImport = (id: number): void => {
    setSelectedStyleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateSpace = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (!newName.trim()) return;

    try {
      const space = await createSpace(newName.trim(), newDescription.trim());
      setSpaces((prev) => [space, ...prev]);
      setNewName('');
      setNewDescription('');

      // If any import checkboxes are selected, import content into the new space.
      if (selectedCharacterIds.size > 0 || selectedStyleIds.size > 0) {
        try {
          await importSpaceContent(space.id, {
            characterIds: Array.from(selectedCharacterIds),
            styleIds: Array.from(selectedStyleIds),
          });
        } catch {
          setMetaError('Space created, but importing content failed.');
        }
      }

      // Reset import selections after creation.
      setSelectedCharacterIds(new Set());
      setSelectedStyleIds(new Set());

      // Default selected space for images to the newly created space.
      setSelectedSpaceId(space.id);
    } catch {
      setSpacesError('Failed to create space.');
    }
  };

  const handleDeleteSpace = async (id: number): Promise<void> => {
    try {
      await deleteSpace(id);
      setSpaces((prev) => prev.filter((s) => s.id !== id));
      if (selectedSpaceId === id) {
        setSelectedSpaceId(null);
        if (spaces.length > 1) {
          const next = spaces.find((s) => s.id !== id);
          setSelectedSpaceId(next ? next.id : null);
        }
      }
    } catch {
      setSpacesError('Failed to delete space.');
    }
  };

  const handleDeleteImage = async (image: GeneratedImage): Promise<void> => {
    if (!selectedSpaceId) return;
    try {
      await deleteImageApi(selectedSpaceId, image.id);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      if (modalImage && modalImage.id === image.id) {
        setModalImage(null);
      }
    } catch {
      setImagesError('Failed to delete image.');
    }
  };

  if (loading) {
    return (
      <section>
        <h2>Spaces</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>Spaces</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Spaces</h2>
      <p>
        Welcome, {user.displayName || user.email}. Manage your spaces below.
      </p>

      <form onSubmit={handleCreateSpace} style={{ maxWidth: 400, marginTop: 16 }}>
        <h3>Create a new space</h3>
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="spaceName">Name</label>
          <input
            id="spaceName"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="spaceDescription">Description</label>
          <textarea
            id="spaceDescription"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={3}
            style={{ display: 'block', width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <h4>Import characters from existing spaces</h4>
          {metaError && <p style={{ color: 'red' }}>{metaError}</p>}
          {allCharacters.length === 0 && (
            <p style={{ fontSize: '0.9rem' }}>No characters available to import yet.</p>
          )}
          {allCharacters.length > 0 && (
            <ul style={{ maxHeight: 160, overflowY: 'auto', paddingLeft: 16 }}>
              {allCharacters.map((c) => (
                <li key={c.id} style={{ marginBottom: 4 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCharacterIds.has(c.id)}
                      onChange={() => handleToggleCharacterImport(c.id)}
                      style={{ marginRight: 6 }}
                    />
                    <strong>{c.name}</strong>
                    {c.description && <span> — {c.description}</span>}
                    <span style={{ fontSize: '0.85rem', marginLeft: 6 }}>
                      (from space: {c.spaceName})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h4>Import styles from existing spaces</h4>
          {allStyles.length === 0 && (
            <p style={{ fontSize: '0.9rem' }}>No styles available to import yet.</p>
          )}
          {allStyles.length > 0 && (
            <ul style={{ maxHeight: 160, overflowY: 'auto', paddingLeft: 16 }}>
              {allStyles.map((s) => (
                <li key={s.id} style={{ marginBottom: 4 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedStyleIds.has(s.id)}
                      onChange={() => handleToggleStyleImport(s.id)}
                      style={{ marginRight: 6 }}
                    />
                    <strong>{s.name}</strong>
                    {s.description && <span> — {s.description}</span>}
                    <span style={{ fontSize: '0.85rem', marginLeft: 6 }}>
                      (from space: {s.spaceName})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit">Create space</button>
      </form>

      <section style={{ marginTop: 24 }}>
        <h3>Your spaces</h3>
        {spacesLoading && <p>Loading spaces…</p>}
        {spacesError && <p style={{ color: 'red' }}>{spacesError}</p>}
        {!spacesLoading && spaces.length === 0 && (
          <p>You do not have any spaces yet.</p>
        )}
        <ul>
          {spaces.map((space) => (
            <li key={space.id} style={{ marginBottom: 8 }}>
              <Link
                to={`/spaces/${space.id}`}
                style={{ marginRight: 8, fontWeight: 'bold' }}
              >
                {space.name}
              </Link>
              {space.description && <span> — {space.description}</span>}
              <button
                type="button"
                onClick={() => setSelectedSpaceId(space.id)}
                style={{ marginLeft: 8 }}
              >
                View images
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleDeleteSpace(space.id);
                }}
                style={{ marginLeft: 8 }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selectedSpaceId && (
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
      )}

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
    </section>
  );
}

