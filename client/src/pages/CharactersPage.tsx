import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';
import {
  createCharacter,
  fetchCharacters,
  type CharacterSummary,
} from '../api/characters.ts';

export function CharactersPage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);

  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterDescription, setNewCharacterDescription] = useState('');

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
    const loadCharacters = async (): Promise<void> => {
      if (!selectedSpaceId) {
        setCharacters([]);
        return;
      }
      setMetaError(null);
      try {
        const chars = await fetchCharacters(selectedSpaceId);
        setCharacters(chars);
      } catch {
        setMetaError('Failed to load characters.');
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

  return (
    <section>
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
                onClick={() => setSelectedSpaceId(space.id)}
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
                onChange={(e) => setNewCharacterDescription(e.target.value)}
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
        </section>
      )}
    </section>
  );
}

