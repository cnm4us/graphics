import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';
import {
  createCharacter,
  fetchCharacters,
  type CharacterSummary,
} from '../api/characters.ts';
import {
  fetchImagesForSpace,
  type GeneratedImage,
} from '../api/images.ts';
import { useSpaceContext } from '../space/SpaceContext.tsx';

export function CharactersPage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const { setActiveSpaceId } = useSpaceContext();

  const spaceIdParam = params.spaceId;
  const spaceIdFromParams =
    spaceIdParam && Number.isFinite(Number(spaceIdParam))
      ? Number(spaceIdParam)
      : null;

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(
    spaceIdFromParams ?? null,
  );

  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [imagesForSpace, setImagesForSpace] = useState<GeneratedImage[]>([]);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterDescription, setNewCharacterDescription] = useState('');

  useEffect(() => {
    if (
      spaceIdFromParams &&
      (!selectedSpaceId || selectedSpaceId !== spaceIdFromParams)
    ) {
      setSelectedSpaceId(spaceIdFromParams);
      setActiveSpaceId(spaceIdFromParams);
    }
  }, [spaceIdFromParams, selectedSpaceId, setActiveSpaceId]);

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
        if (spaceIdFromParams) {
          const match = list.find((s) => s.id === spaceIdFromParams);
          if (!match) {
            setSpacesError('Space not found.');
            setSelectedSpaceId(null);
          } else {
            setSelectedSpaceId(spaceIdFromParams);
            setActiveSpaceId(spaceIdFromParams);
          }
        } else if (list.length > 0) {
          setSelectedSpaceId(list[0].id);
          setActiveSpaceId(list[0].id);
        }
      } catch {
        setSpacesError('Failed to load spaces.');
      } finally {
        setSpacesLoading(false);
      }
    };

    void loadSpaces();
  }, [user, spaceIdFromParams, setActiveSpaceId]);

  useEffect(() => {
    const loadCharacters = async (): Promise<void> => {
      if (!selectedSpaceId) {
        setCharacters([]);
        setImagesForSpace([]);
        return;
      }
      setMetaError(null);
      try {
        const [chars, images] = await Promise.all([
          fetchCharacters(selectedSpaceId),
          fetchImagesForSpace(selectedSpaceId),
        ]);
        setCharacters(chars);
        setImagesForSpace(images);
      } catch {
        setMetaError('Failed to load characters or images.');
      }
    };

    void loadCharacters();
  }, [selectedSpaceId]);

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

  if (loading) {
    return (
      <section>
        <h2>Characters</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>Characters</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  const activeSpace =
    spaceIdFromParams != null
      ? spaces.find((s) => s.id === spaceIdFromParams) ?? null
      : null;

  const getLatestImageForCharacter = (
    character: CharacterSummary,
  ): GeneratedImage | null => {
    const latestVersionId = character.latestVersion?.id;
    if (!latestVersionId) return null;

    const img = imagesForSpace.find(
      (image) => image.characterVersionId === latestVersionId,
    );

    return img ?? null;
  };

  const characterHasImage = (character: CharacterSummary): boolean => {
    return getLatestImageForCharacter(character) != null;
  };

  return (
    <section>
      {spaceIdFromParams && activeSpace ? (
        <>
          <h2>{activeSpace.name}</h2>
          <section style={{ marginTop: 24 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0 }}>Characters</h3>
              <button
                type="button"
                onClick={() =>
                  navigate(`/spaces/${spaceIdFromParams}/characters/new`)
                }
              >
                Create character
              </button>
            </div>
            {metaError && <p style={{ color: 'red' }}>{metaError}</p>}

            <ul
              style={{
                marginTop: 16,
                padding: 0,
                listStyle: 'none',
                maxWidth: 720,
              }}
            >
              {characters.map((c) => {
                const latestImage = getLatestImageForCharacter(c);
                const hasImage = latestImage != null;
                const imageUrl =
                  latestImage?.cloudfrontUrl ?? latestImage?.s3Url ?? null;

                return (
                  <li
                    key={c.id}
                    style={{
                      marginBottom: 24,
                      paddingBottom: 16,
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div>
                        <strong>{c.name}</strong>
                        {c.description && <span> — {c.description}</span>}
                        {c.latestVersion && (
                          <span>
                            {' '}
                            (v{c.latestVersion.versionNumber}
                            {c.latestVersion.label
                              ? `: ${c.latestVersion.label}`
                              : ''}
                            )
                          </span>
                        )}
                      </div>
                      {hasImage && imageUrl && (
                        <div>
                          <img
                            src={imageUrl}
                            alt={latestImage.prompt.slice(0, 80)}
                            style={{
                              width: '100%',
                              height: 'auto',
                              display: 'block',
                              borderRadius: 4,
                              border: '1px solid #ccc',
                            }}
                          />
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/spaces/${spaceIdFromParams}/characters/${c.id}`,
                            )
                          }
                        >
                          View
                        </button>
                        {!hasImage && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/spaces/${spaceIdFromParams}/characters/new?from=${c.id}&mode=edit`,
                              )
                            }
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/spaces/${spaceIdFromParams}/characters/new?from=${c.id}`,
                            )
                          }
                        >
                          Clone
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
              {characters.length === 0 && <li>No characters yet.</li>}
            </ul>
          </section>
        </>
      ) : (
        <>
          <h2>Characters</h2>
          <p>Select a space and manage its characters.</p>

          <section style={{ marginTop: 16 }}>
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
                    onClick={() => {
                      if (spaceIdFromParams) {
                        navigate(`/spaces/${space.id}/characters`);
                      } else {
                        setSelectedSpaceId(space.id);
                      }
                    }}
                    style={{
                      fontWeight:
                        selectedSpaceId === space.id ? 'bold' : 'normal',
                      marginRight: 8,
                    }}
                  >
                    {space.name}
                  </button>
                  {space.description && <span> — {space.description}</span>}
                </li>
              ))}
            </ul>
          </section>

          {selectedSpaceId && (
            <section style={{ marginTop: 24 }}>
              <h3>Characters in selected space</h3>
              {metaError && <p style={{ color: 'red' }}>{metaError}</p>}

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
                        {c.latestVersion.label
                          ? `: ${c.latestVersion.label}`
                          : ''}
                        )
                      </span>
                    )}
                  </li>
                ))}
                {characters.length === 0 && <li>No characters yet.</li>}
              </ul>
            </section>
          )}
        </>
      )}
    </section>
  );
}
