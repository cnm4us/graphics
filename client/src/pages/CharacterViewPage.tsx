import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';
import {
  fetchCharacterWithVersions,
  type CharacterWithVersions,
} from '../api/characters.ts';
import {
  type AppearanceCategory,
  type CharacterAppearanceConfig,
  type AppearanceValues,
  fetchCharacterAppearanceConfig,
  buildInitialAppearanceValues,
} from '../api/characterAppearance.ts';
import { useSpaceContext } from '../space/SpaceContext.tsx';

export function CharacterViewPage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const { setActiveSpaceId } = useSpaceContext();

  const spaceIdParam = params.spaceId;
  const characterIdParam = params.characterId;
  const spaceId =
    spaceIdParam && Number.isFinite(Number(spaceIdParam))
      ? Number(spaceIdParam)
      : null;
  const characterId =
    characterIdParam && Number.isFinite(Number(characterIdParam))
      ? Number(characterIdParam)
      : null;

  const [space, setSpace] = useState<Space | null>(null);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);

  const [character, setCharacter] = useState<CharacterWithVersions | null>(
    null,
  );
  const [appearanceConfig, setAppearanceConfig] =
    useState<CharacterAppearanceConfig | null>(null);
  const [appearanceValues, setAppearanceValues] = useState<AppearanceValues>(
    {},
  );
  const [appearanceLoading, setAppearanceLoading] = useState(false);
  const [appearanceError, setAppearanceError] = useState<string | null>(null);

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
      setAppearanceLoading(true);
      setAppearanceError(null);
      try {
        const [spaces, config, characterData] = (await Promise.all([
          fetchSpaces(),
          fetchCharacterAppearanceConfig(),
          characterId
            ? fetchCharacterWithVersions(spaceId, characterId)
            : Promise.resolve(null),
        ])) as [Space[], CharacterAppearanceConfig, CharacterWithVersions | null];

        const current = spaces.find((s) => s.id === spaceId) ?? null;
        if (!current) {
          setSpacesError('Space not found or not accessible.');
          setSpace(null);
        } else {
          setSpace(current);
        }

        setAppearanceConfig(config);

        if (characterData) {
          setCharacter(characterData);
          const latestVersion =
            characterData.versions[characterData.versions.length - 1] ?? null;
          const existingAppearance =
            latestVersion?.appearance ?? (null as AppearanceValues | null);
          setAppearanceValues((prev) =>
            buildInitialAppearanceValues(config, existingAppearance ?? prev),
          );
        } else {
          setAppearanceValues((prev) =>
            buildInitialAppearanceValues(config, prev),
          );
        }
      } catch {
        setSpacesError('Failed to load space or character.');
        setAppearanceError('Failed to load character appearance config.');
      } finally {
        setSpacesLoading(false);
        setAppearanceLoading(false);
      }
    };

    void load();
  }, [user, spaceId, characterId, setActiveSpaceId]);

  if (loading) {
    return (
      <section>
        <h2>View character</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>View character</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  if (!spaceId || !characterId) {
    return (
      <section>
        <h2>View character</h2>
        <p>Invalid space or character ID.</p>
      </section>
    );
  }

  const heading =
    space && character
      ? `${character.name} in ${space.name}`
      : character
        ? character.name
        : 'View character';

  const renderAppearanceSection = (
    category: AppearanceCategory,
  ): JSX.Element => {
    const valuesForCategory = appearanceValues[category.key] ?? {};

    return (
      <fieldset
        key={category.key}
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 4,
          border: '1px solid #ccc',
        }}
      >
        <legend style={{ fontWeight: 600 }}>{category.label}</legend>
        {category.description && (
          <p style={{ marginTop: 0 }}>{category.description}</p>
        )}
        {category.properties.map((prop) => {
          const current = valuesForCategory[prop.key];

          if (prop.type === 'enum') {
            return (
              <div key={prop.key} style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 500 }}>{prop.label}</div>
                {prop.description && (
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>
                    {prop.description}
                  </div>
                )}
                <div style={{ marginTop: 2 }}>
                  {typeof current === 'string' && current.trim().length > 0
                    ? (prop.options ?? []).find(
                        (opt) => opt.value === current,
                      )?.label ?? current
                    : '—'}
                </div>
              </div>
            );
          }

          if (prop.type === 'tags') {
            const list =
              Array.isArray(current) && current.length > 0
                ? current
                : typeof current === 'string' && current.trim().length > 0
                  ? [current.trim()]
                  : [];
            const optionMap = new Map(
              (prop.options ?? []).map((opt) => [opt.value, opt.label]),
            );

            return (
              <div key={prop.key} style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 500 }}>{prop.label}</div>
                {prop.description && (
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>
                    {prop.description}
                  </div>
                )}
                <div
                  style={{
                    marginTop: 4,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                  }}
                >
                  {list.length === 0 && <span>—</span>}
                  {list.map((tag) => {
                    const label = optionMap.get(tag) ?? tag;
                    return (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 6px',
                          borderRadius: 999,
                          backgroundColor: '#eef',
                          fontSize: '0.8rem',
                        }}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <div key={prop.key} style={{ marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 500 }}>{prop.label}</div>
              {prop.description && (
                <div style={{ fontSize: '0.85rem', color: '#555' }}>
                  {prop.description}
                </div>
              )}
              <div style={{ marginTop: 2 }}>
                {typeof current === 'string' && current.trim().length > 0
                  ? current
                  : '—'}
              </div>
            </div>
          );
        })}
      </fieldset>
    );
  };

  return (
    <section>
      <h2>{heading}</h2>
      {spacesLoading && <p>Loading space…</p>}
      {spacesError && <p style={{ color: 'red' }}>{spacesError}</p>}
      {!spacesLoading && !space && !spacesError && (
        <p>Space not found or not accessible.</p>
      )}

      {character && (
        <div style={{ maxWidth: 720, marginTop: 16 }}>
          {character.description && (
            <p style={{ marginTop: 0 }}>{character.description}</p>
          )}

          {appearanceLoading && (
            <p>Loading character appearance configuration…</p>
          )}
          {appearanceError && (
            <p style={{ color: 'red' }}>{appearanceError}</p>
          )}
          {appearanceConfig &&
            appearanceConfig.categories
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((category) => renderAppearanceSection(category))}
        </div>
      )}
    </section>
  );
}

