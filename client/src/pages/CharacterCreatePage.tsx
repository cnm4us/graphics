import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';
import {
  createCharacter,
  fetchCharacters,
  type CharacterSummary,
} from '../api/characters.ts';
import { useSpaceContext } from '../space/SpaceContext.tsx';

export function CharacterCreatePage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { setActiveSpaceId } = useSpaceContext();

  const spaceIdParam = params.spaceId;
  const spaceId =
    spaceIdParam && Number.isFinite(Number(spaceIdParam))
      ? Number(spaceIdParam)
      : null;

  const fromParam = searchParams.get('from');
  const fromCharacterId =
    fromParam && Number.isFinite(Number(fromParam)) ? Number(fromParam) : null;

  const [space, setSpace] = useState<Space | null>(null);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!spaceId || !user) return;

    setActiveSpaceId(spaceId);

    const load = async (): Promise<void> => {
      setSpacesLoading(true);
      setSpacesError(null);
      try {
        const spaces = await fetchSpaces();
        const current = spaces.find((s) => s.id === spaceId) ?? null;
        if (!current) {
          setSpacesError('Space not found or not accessible.');
          setSpace(null);
          return;
        }
        setSpace(current);

        if (fromCharacterId) {
          try {
            const chars = await fetchCharacters(spaceId);
            const fromChar =
              chars.find((c) => c.id === fromCharacterId) ?? null;
            if (fromChar) {
              setName(fromChar.name);
              setDescription(fromChar.description ?? '');
            }
          } catch {
            // If cloning fails to load, fall back to blank form.
          }
        }
      } catch {
        setSpacesError('Failed to load spaces.');
      } finally {
        setSpacesLoading(false);
      }
    };

    void load();
  }, [user, spaceId, fromCharacterId, setActiveSpaceId]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    if (!spaceId) {
      setFormError('Invalid space.');
      return;
    }
    if (!name.trim()) {
      setFormError('Name is required.');
      return;
    }

    try {
      setSubmitting(true);
      await createCharacter(spaceId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      navigate(`/spaces/${spaceId}/characters`);
    } catch {
      setFormError('Failed to create character.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section>
        <h2>Create character</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>Create character</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  if (!spaceId) {
    return (
      <section>
        <h2>Create character</h2>
        <p>Invalid space ID.</p>
      </section>
    );
  }

  const heading = space ? space.name : 'Create character';

  return (
    <section>
      <h2>{heading}</h2>
      <p>
        {fromCharacterId
          ? 'Clone an existing character and adjust details before saving.'
          : 'Create a new character for this space.'}
      </p>
      {spacesLoading && <p>Loading space…</p>}
      {spacesError && <p style={{ color: 'red' }}>{spacesError}</p>}
      {!spacesLoading && !space && !spacesError && (
        <p>Space not found or not accessible.</p>
      )}

      {space && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 480, marginTop: 16 }}>
          {formError && <p style={{ color: 'red' }}>{formError}</p>}
          <div style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="characterName">Name</label>
            <input
              id="characterName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ display: 'block', width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="characterDescription">Description</label>
            <textarea
              id="characterDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ display: 'block', width: '100%' }}
            />
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Create character'}
          </button>
        </form>
      )}
    </section>
  );
}

