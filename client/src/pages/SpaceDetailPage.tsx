import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';

export function SpaceDetailPage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);

  const spaceIdParam = params.spaceId;
  const spaceId =
    spaceIdParam && Number.isFinite(Number(spaceIdParam))
      ? Number(spaceIdParam)
      : null;

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
      } catch {
        setSpacesError('Failed to load spaces.');
      } finally {
        setSpacesLoading(false);
      }
    };

    void loadSpaces();
  }, [user]);

  if (loading) {
    return (
      <section>
        <h2>Space</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>Space</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  if (!spaceId) {
    return (
      <section>
        <h2>Space</h2>
        <p>Invalid space ID.</p>
        <p>
          <Link to="/spaces">Back to spaces</Link>
        </p>
      </section>
    );
  }

  const space = spaces.find((s) => s.id === spaceId);

  return (
    <section>
      <h2>Space</h2>
      <p>
        <Link to="/spaces">&larr; Back to spaces</Link>
      </p>
      {spacesLoading && <p>Loading space…</p>}
      {spacesError && <p style={{ color: 'red' }}>{spacesError}</p>}
      {!spacesLoading && !space && !spacesError && (
        <p>Space not found or not accessible.</p>
      )}
      {space && (
        <div style={{ marginTop: 16 }}>
          <h3>{space.name}</h3>
          {space.description && <p>{space.description}</p>}
          <p style={{ fontSize: '0.9rem', color: '#555' }}>
            Space ID: {space.id}
          </p>
          <nav
            aria-label="Space navigation"
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Link to={`/spaces/${space.id}/characters`}>Characters</Link>
            <Link to={`/spaces/${space.id}/styles`}>Styles</Link>
            <Link to={`/spaces/${space.id}/scenes`}>Scenes</Link>
            <Link to={`/spaces/${space.id}/generate`}>Generate</Link>
            <Link to={`/spaces/${space.id}/images`}>Images</Link>
          </nav>
        </div>
      )}
    </section>
  );
}
