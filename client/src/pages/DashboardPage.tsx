import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import {
  createSpace,
  deleteSpace,
  fetchSpaces,
  type Space,
} from '../api/spaces.ts';
import {
  createCharacter,
  fetchCharacters,
  type CharacterSummary,
} from '../api/characters.ts';
import {
  createStyle,
  fetchStyles,
  type StyleSummary,
} from '../api/styles.ts';
import {
  generateImage,
  fetchImagesForSpace,
  type GeneratedImage,
} from '../api/images.ts';

export function DashboardPage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [styles, setStyles] = useState<StyleSummary[]>([]);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterDescription, setNewCharacterDescription] = useState('');
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleDescription, setNewStyleDescription] = useState('');

  const [selectedCharacterVersionId, setSelectedCharacterVersionId] =
    useState<number | null>(null);
  const [selectedStyleVersionId, setSelectedStyleVersionId] =
    useState<number | null>(null);
  const [seedInput, setSeedInput] = useState('');
  const [lastGenerated, setLastGenerated] = useState<GeneratedImage | null>(
    null,
  );
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<GeneratedImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const loadSpaces = async (): Promise<void> => {
      setSpacesLoading(true);
      setSpacesError(null);
      try {
        const list = await fetchSpaces();
        setSpaces(list);
        if (!selectedSpaceId && list.length > 0) {
          setSelectedSpaceId(list[0].id);
        }
      } catch {
        setSpacesError('Failed to load spaces.');
      } finally {
        setSpacesLoading(false);
      }
    };

    void loadSpaces();
  }, [user, selectedSpaceId]);

  useEffect(() => {
    const loadMeta = async (): Promise<void> => {
      if (!selectedSpaceId) {
        setCharacters([]);
        setStyles([]);
        setImages([]);
        return;
      }
      setMetaError(null);
      setImagesError(null);
      try {
        const [chars, sts, imgs] = await Promise.all([
          fetchCharacters(selectedSpaceId),
          fetchStyles(selectedSpaceId),
          fetchImagesForSpace(selectedSpaceId),
        ]);
        setCharacters(chars);
        setStyles(sts);
        setImages(imgs);

        const firstCharVersionId =
          chars[0]?.latestVersion?.id ?? null;
        const firstStyleVersionId =
          sts[0]?.latestVersion?.id ?? null;
        setSelectedCharacterVersionId(firstCharVersionId);
        setSelectedStyleVersionId(firstStyleVersionId);
      } catch {
        setMetaError('Failed to load characters/styles.');
        setImagesError('Failed to load images.');
      }
    };

    void loadMeta();
  }, [selectedSpaceId]);

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

  const handleCreateCharacter = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (!selectedSpaceId || !newCharacterName.trim()) return;
    try {
      const character = await createCharacter(selectedSpaceId, {
        name: newCharacterName.trim(),
        description: newCharacterDescription.trim(),
      });
      setCharacters((prev) => [character, ...prev]);
      setNewCharacterName('');
      setNewCharacterDescription('');
    } catch {
      setMetaError('Failed to create character.');
    }
  };

  const handleCreateStyle = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (!selectedSpaceId || !newStyleName.trim()) return;
    try {
      const style = await createStyle(selectedSpaceId, {
        name: newStyleName.trim(),
        description: newStyleDescription.trim(),
      });
      setStyles((prev) => [style, ...prev]);
      setNewStyleName('');
      setNewStyleDescription('');
    } catch {
      setMetaError('Failed to create style.');
    }
  };

  const handleGenerateImage = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setImageError(null);
    if (
      !selectedSpaceId ||
      !selectedCharacterVersionId ||
      !selectedStyleVersionId
    ) {
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
        spaceId: selectedSpaceId,
        characterVersionId: selectedCharacterVersionId,
        styleVersionId: selectedStyleVersionId,
        seed,
      });
      setLastGenerated(image);
      setImages((prev) => [image, ...prev]);
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : 'IMAGE_GENERATION_FAILED';
      setImageError(message);
    }
  };

  if (loading) {
    return (
      <section>
        <h2>Dashboard</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>Dashboard</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Dashboard</h2>
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
              <button
                type="button"
                onClick={() => setSelectedSpaceId(space.id)}
                style={{
                  fontWeight: selectedSpaceId === space.id ? 'bold' : 'normal',
                  marginRight: 8,
                }}
              >
                {space.name}
              </button>
              {space.description && <span> — {space.description}</span>}
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
          <h3>Characters and styles in selected space</h3>
          {metaError && <p style={{ color: 'red' }}>{metaError}</p>}

          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h4>Characters</h4>
              <form onSubmit={handleCreateCharacter} style={{ maxWidth: 320 }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label htmlFor="characterName">Name</label>
                  <input
                    id="characterName"
                    type="text"
                    value={newCharacterName}
                    onChange={(e) => setNewCharacterName(e.target.value)}
                    required
                    style={{ display: 'block', width: '100%' }}
                  />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label htmlFor="characterDescription">Description</label>
                  <textarea
                    id="characterDescription"
                    value={newCharacterDescription}
                    onChange={(e) =>
                      setNewCharacterDescription(e.target.value)
                    }
                    rows={3}
                    style={{ display: 'block', width: '100%' }}
                  />
                </div>
                <button type="submit">Create character</button>
              </form>

              <ul style={{ marginTop: 16 }}>
                {characters.map((c) => (
                  <li key={c.id} style={{ marginBottom: 8 }}>
                    <strong>{c.name}</strong>
                    {c.description && <span> — {c.description}</span>}
                    {c.latestVersion && (
                      <span>
                        {' '}
                        (v{c.latestVersion.versionNumber}
                        {c.latestVersion.label ? `: ${c.latestVersion.label}` : ''}
                        )
                      </span>
                    )}
                  </li>
                ))}
                {characters.length === 0 && <li>No characters yet.</li>}
              </ul>
            </div>

            <div style={{ flex: 1 }}>
              <h4>Styles</h4>
              <form onSubmit={handleCreateStyle} style={{ maxWidth: 320 }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label htmlFor="styleName">Name</label>
                  <input
                    id="styleName"
                    type="text"
                    value={newStyleName}
                    onChange={(e) => setNewStyleName(e.target.value)}
                    required
                    style={{ display: 'block', width: '100%' }}
                  />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label htmlFor="styleDescription">Description</label>
                  <textarea
                    id="styleDescription"
                    value={newStyleDescription}
                    onChange={(e) => setNewStyleDescription(e.target.value)}
                    rows={3}
                    style={{ display: 'block', width: '100%' }}
                  />
                </div>
                <button type="submit">Create style</button>
              </form>

              <ul style={{ marginTop: 16 }}>
                {styles.map((s) => (
                  <li key={s.id} style={{ marginBottom: 8 }}>
                    <strong>{s.name}</strong>
                    {s.description && <span> — {s.description}</span>}
                    {s.latestVersion && (
                      <span>
                        {' '}
                        (v{s.latestVersion.versionNumber}
                        {s.latestVersion.label ? `: ${s.latestVersion.label}` : ''}
                        )
                      </span>
                    )}
                  </li>
                ))}
                {styles.length === 0 && <li>No styles yet.</li>}
              </ul>
            </div>
          </div>

          <section style={{ marginTop: 32 }}>
            <h3>Generate image</h3>
            {imageError && <p style={{ color: 'red' }}>{imageError}</p>}

            <form onSubmit={handleGenerateImage} style={{ maxWidth: 480 }}>
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
                <h4>Last generated image</h4>
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
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
