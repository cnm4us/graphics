import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchScenes, type SceneSummary } from '../api/scenes.ts';

export function SpaceScenesPage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const params = useParams();

  const spaceIdParam = params.spaceId;
  const spaceId =
    spaceIdParam && Number.isFinite(Number(spaceIdParam))
      ? Number(spaceIdParam)
      : null;

  const [scenes, setScenes] = useState<SceneSummary[]>([]);
  const [scenesError, setScenesError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const loadScenes = async (): Promise<void> => {
      if (!user || !spaceId) {
        setScenes([]);
        return;
      }
      setScenesError(null);
      try {
        const list = await fetchScenes(spaceId);
        setScenes(list);
      } catch {
        setScenesError('Failed to load scenes.');
      }
    };

    void loadScenes();
  }, [user, spaceId]);

  if (loading) {
    return (
      <section>
        <h2>Scenes</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>Scenes</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  if (!spaceId) {
    return (
      <section>
        <h2>Scenes</h2>
        <p>Invalid space ID.</p>
        <p>
          <Link to="/spaces">Back to spaces</Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Scenes</h2>
      <p>Scenes belonging to this space.</p>
      {scenesError && <p style={{ color: 'red' }}>{scenesError}</p>}
      {scenes.length === 0 && (
        <p>No scenes have been defined for this space yet.</p>
      )}
      {scenes.length > 0 && (
        <ul style={{ marginTop: 16 }}>
          {scenes.map((scene) => (
            <li key={scene.id} style={{ marginBottom: 8 }}>
              <strong>{scene.name}</strong>
              {scene.description && <span> — {scene.description}</span>}
              {scene.latestVersion && (
                <span>
                  {' '}
                  (v{scene.latestVersion.versionNumber}
                  {scene.latestVersion.label
                    ? `: ${scene.latestVersion.label}`
                    : ''}
                  )
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link to={`/spaces/${spaceId}`}>&larr; Back to space</Link>
      </p>
    </section>
  );
}
