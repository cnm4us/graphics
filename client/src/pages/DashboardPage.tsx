import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';
import {
  fetchCharacters,
  type CharacterSummary,
} from '../api/characters.ts';
import { fetchStyles, type StyleSummary } from '../api/styles.ts';
import { fetchScenes, type SceneSummary } from '../api/scenes.ts';

export function DashboardPage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);

  const [metaError, setMetaError] = useState<string | null>(null);

  const [charactersBySpace, setCharactersBySpace] = useState<
    Record<number, CharacterSummary[]>
  >({});
  const [stylesBySpace, setStylesBySpace] = useState<
    Record<number, StyleSummary[]>
  >({});
  const [scenesBySpace, setScenesBySpace] = useState<
    Record<number, SceneSummary[]>
  >({});

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
      setMetaError(null);
      try {
        const list = await fetchSpaces();
        setSpaces(list);
      } catch {
        setSpacesError('Failed to load spaces.');
      } finally {
        setSpacesLoading(false);
      }
    };

    void loadSpaces();
  }, [user]);

  useEffect(() => {
    const loadMeta = async (): Promise<void> => {
      if (!user || spaces.length === 0) {
        setCharactersBySpace({});
        setStylesBySpace({});
        setScenesBySpace({});
        return;
      }
      setMetaError(null);
      const charMap: Record<number, CharacterSummary[]> = {};
      const styleMap: Record<number, StyleSummary[]> = {};
      const sceneMap: Record<number, SceneSummary[]> = {};

      try {
        await Promise.all(
          spaces.map(async (space) => {
            try {
              const [chars, styles, scenes] = await Promise.all([
                fetchCharacters(space.id),
                fetchStyles(space.id),
                fetchScenes(space.id),
              ]);
              charMap[space.id] = chars;
              styleMap[space.id] = styles;
              sceneMap[space.id] = scenes;
            } catch {
              // If one space fails, record an empty list and let the global error surface.
              charMap[space.id] = charMap[space.id] ?? [];
              styleMap[space.id] = styleMap[space.id] ?? [];
              sceneMap[space.id] = sceneMap[space.id] ?? [];
              setMetaError(
                'Failed to load characters/styles/scenes for one or more spaces.',
              );
            }
          }),
        );
        setCharactersBySpace(charMap);
        setStylesBySpace(styleMap);
        setScenesBySpace(sceneMap);
      } catch {
        setMetaError(
          'Failed to load characters/styles/scenes for one or more spaces.',
        );
      }
    };

    void loadMeta();
  }, [user, spaces]);

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
        Welcome, {user.displayName || user.email}. Overview of your spaces and
        their content.
      </p>

      <section style={{ marginTop: 24 }}>
        <h3>Your spaces</h3>
        {spacesLoading && <p>Loading spaces…</p>}
        {spacesError && <p style={{ color: 'red' }}>{spacesError}</p>}
        {metaError && <p style={{ color: 'red' }}>{metaError}</p>}
        {!spacesLoading && spaces.length === 0 && (
          <p>You do not have any spaces yet.</p>
        )}
        <ul style={{ marginTop: 16 }}>
          {spaces.map((space) => {
            const characters = charactersBySpace[space.id] ?? [];
            const styles = stylesBySpace[space.id] ?? [];
            const scenes = scenesBySpace[space.id] ?? [];

            return (
              <li
                key={space.id}
                style={{
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: '1px solid #ddd',
                }}
              >
                <h4 style={{ marginBottom: 4 }}>{space.name}</h4>
                {space.description && (
                  <p style={{ marginTop: 0, marginBottom: 8 }}>
                    {space.description}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: 24,
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: 200 }}>
                    <h5>Characters</h5>
                    {characters.length === 0 && (
                      <p style={{ fontSize: '0.9rem' }}>No characters yet.</p>
                    )}
                    {characters.length > 0 && (
                      <ul>
                        {characters.map((c) => (
                          <li key={c.id}>
                            <strong>{c.name}</strong>
                            {c.description && <span> — {c.description}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div style={{ minWidth: 200 }}>
                    <h5>Styles</h5>
                    {styles.length === 0 && (
                      <p style={{ fontSize: '0.9rem' }}>No styles yet.</p>
                    )}
                    {styles.length > 0 && (
                      <ul>
                        {styles.map((s) => (
                          <li key={s.id}>
                            <strong>{s.name}</strong>
                            {s.description && <span> — {s.description}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div style={{ minWidth: 200 }}>
                    <h5>Scenes</h5>
                    {scenes.length === 0 && (
                      <p style={{ fontSize: '0.9rem' }}>No scenes yet.</p>
                    )}
                    {scenes.length > 0 && (
                      <ul>
                        {scenes.map((scene) => (
                          <li key={scene.id}>
                            <strong>{scene.name}</strong>
                            {scene.description && (
                              <span> — {scene.description}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
}
