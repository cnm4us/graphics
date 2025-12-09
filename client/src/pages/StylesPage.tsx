import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';
import {
  fetchStyles,
  type StyleSummary,
} from '../api/styles.ts';
import {
  fetchImagesForSpace,
  type GeneratedImage,
} from '../api/images.ts';
import { useSpaceContext } from '../space/SpaceContext.tsx';

export function StylesPage(): JSX.Element {
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

  const [styles, setStyles] = useState<StyleSummary[]>([]);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [imagesForSpace, setImagesForSpace] = useState<GeneratedImage[]>([]);

  useEffect(() => {
    if (
      spaceIdFromParams &&
      (!selectedSpaceId || selectedSpaceId !== spaceIdFromParams)
    ) {
      setSelectedSpaceId(spaceIdFromParams);
    }
  }, [spaceIdFromParams, selectedSpaceId]);

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
    const loadStyles = async (): Promise<void> => {
      if (!selectedSpaceId) {
        setStyles([]);
        setImagesForSpace([]);
        return;
      }
      setMetaError(null);
      try {
        const [sts, images] = await Promise.all([
          fetchStyles(selectedSpaceId),
          fetchImagesForSpace(selectedSpaceId),
        ]);
        setStyles(sts);
        setImagesForSpace(images);
      } catch {
        setMetaError('Failed to load styles.');
      }
    };

    void loadStyles();
  }, [selectedSpaceId]);

  const getLatestImageForStyle = (
    style: StyleSummary,
  ): GeneratedImage | null => {
    const latestVersionId = style.latestVersion?.id;
    if (!latestVersionId) return null;

    const img = imagesForSpace.find(
      (image) => image.styleVersionId === latestVersionId,
    );

    return img ?? null;
  };

  const styleHasImage = (style: StyleSummary): boolean => {
    return getLatestImageForStyle(style) != null;
  };

  if (loading) {
    return (
      <section>
        <h2>Styles</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>Styles</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  const activeSpace =
    spaceIdFromParams != null
      ? spaces.find((s) => s.id === spaceIdFromParams) ?? null
      : null;

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
              <h3 style={{ margin: 0 }}>Styles</h3>
              <button
                type="button"
                onClick={() =>
                  navigate(`/spaces/${spaceIdFromParams}/styles/new`)
                }
              >
                Create style
              </button>
            </div>
            {metaError && <p style={{ color: 'red' }}>{metaError}</p>}
            <ul style={{ marginTop: 16 }}>
              {styles.map((s) => {
                const canEdit = !styleHasImage(s);
                return (
                  <li key={s.id} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <div>
                        <strong>{s.name}</strong>
                        {s.description && <span> — {s.description}</span>}
                        {s.latestVersion && (
                          <span>
                            {' '}
                            (v{s.latestVersion.versionNumber}
                            {s.latestVersion.label
                              ? `: ${s.latestVersion.label}`
                              : ''}
                            )
                          </span>
                        )}
                        {!canEdit && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: '0.85rem',
                              color: '#555',
                            }}
                          >
                            — Used for images (locked)
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/spaces/${spaceIdFromParams}/styles/${s.id}`,
                            )
                          }
                        >
                          View
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/spaces/${spaceIdFromParams}/styles/new?from=${s.id}&mode=edit`,
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
                              `/spaces/${spaceIdFromParams}/styles/new?from=${s.id}`,
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
              {styles.length === 0 && <li>No styles yet.</li>}
            </ul>
          </section>
        </>
      ) : (
        <>
          <h2>Styles</h2>
          <p>Select a space and manage its styles.</p>

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
                        navigate(`/spaces/${space.id}/styles`);
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
        </>
      )}

      {!spaceIdFromParams && selectedSpaceId && (
        <section style={{ marginTop: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ margin: 0 }}>Styles in selected space</h3>
            <button
              type="button"
              onClick={() =>
                navigate(`/spaces/${selectedSpaceId}/styles/new`)
              }
            >
              Create style
            </button>
          </div>
          {metaError && <p style={{ color: 'red' }}>{metaError}</p>}
          <ul style={{ marginTop: 16 }}>
            {styles.map((s) => {
              const canEdit = !styleHasImage(s);
              return (
                <li key={s.id} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div>
                      <strong>{s.name}</strong>
                      {s.description && <span> — {s.description}</span>}
                      {s.latestVersion && (
                        <span>
                          {' '}
                          (v{s.latestVersion.versionNumber}
                          {s.latestVersion.label
                            ? `: ${s.latestVersion.label}`
                            : ''}
                          )
                        </span>
                      )}
                      {!canEdit && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: '0.85rem',
                            color: '#555',
                          }}
                        >
                          — Used for images (locked)
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/spaces/${selectedSpaceId}/styles/${s.id}`,
                          )
                        }
                      >
                        View
                      </button>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/spaces/${selectedSpaceId}/styles/new?from=${s.id}&mode=edit`,
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
                            `/spaces/${selectedSpaceId}/styles/new?from=${s.id}`,
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
            {styles.length === 0 && <li>No styles yet.</li>}
          </ul>
        </section>
      )}
    </section>
  );
}
