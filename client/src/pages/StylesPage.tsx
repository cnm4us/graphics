import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';
import {
  createStyle,
  fetchStyles,
  type StyleSummary,
} from '../api/styles.ts';
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
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleDescription, setNewStyleDescription] = useState('');

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
        return;
      }
      setMetaError(null);
      try {
        const sts = await fetchStyles(selectedSpaceId);
        setStyles(sts);
      } catch {
        setMetaError('Failed to load styles.');
      }
    };

    void loadStyles();
  }, [selectedSpaceId]);

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
        <h2>{activeSpace.name}</h2>
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

      {selectedSpaceId && (
        <section style={{ marginTop: 24 }}>
          <h3>Styles in selected space</h3>
          {metaError && <p style={{ color: 'red' }}>{metaError}</p>}

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
        </section>
      )}
    </section>
  );
}
