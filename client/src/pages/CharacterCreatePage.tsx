import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';
import {
  createCharacter,
  fetchCharacterWithVersions,
  updateCharacter,
} from '../api/characters.ts';
import { useSpaceContext } from '../space/SpaceContext.tsx';
import {
  type AppearanceCategory,
  type CharacterAppearanceConfig,
  type AppearanceValues,
  fetchCharacterAppearanceConfig,
  buildInitialAppearanceValues,
  serializeAppearanceValues,
} from '../api/characterAppearance.ts';

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
  const modeParam = searchParams.get('mode');
  const isEditMode = modeParam === 'edit' && fromCharacterId != null;

  const [space, setSpace] = useState<Space | null>(null);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [appearanceConfig, setAppearanceConfig] =
    useState<CharacterAppearanceConfig | null>(null);
  const [appearanceValues, setAppearanceValues] = useState<AppearanceValues>(
    {},
  );
  const [tagInputs, setTagInputs] = useState<
    Record<string, Record<string, string>>
  >({});
  const [appearanceLoading, setAppearanceLoading] = useState(false);
  const [appearanceError, setAppearanceError] = useState<string | null>(null);
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
      setAppearanceLoading(true);
      setAppearanceError(null);
      try {
        const promises: Array<Promise<unknown>> = [
          fetchSpaces(),
          fetchCharacterAppearanceConfig(),
        ];
        if (fromCharacterId) {
          promises.push(
            fetchCharacterWithVersions(spaceId, fromCharacterId),
          );
        }

        const [spaces, config, fromCharacterMaybe] = (await Promise.all(
          promises,
        )) as [
          Space[],
          CharacterAppearanceConfig,
          | {
              name: string;
              description: string | null;
              versions: Array<{
                appearance?: AppearanceValues | null;
              }>;
            }
          | undefined,
        ];

        const current = spaces.find((s) => s.id === spaceId) ?? null;
        if (!current) {
          setSpacesError('Space not found or not accessible.');
          setSpace(null);
        } else {
          setSpace(current);
        }

        setAppearanceConfig(config);

        if (fromCharacterMaybe) {
          setName(fromCharacterMaybe.name);
          setDescription(fromCharacterMaybe.description ?? '');

          const latestVersion =
            fromCharacterMaybe.versions[
              fromCharacterMaybe.versions.length - 1
            ] ?? null;
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
        setSpacesError('Failed to load spaces.');
        setAppearanceError('Failed to load character appearance config.');
      } finally {
        setSpacesLoading(false);
        setAppearanceLoading(false);
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

    if (!appearanceConfig) {
      setFormError('Appearance configuration is not loaded.');
      return;
    }

    try {
      setSubmitting(true);
      const serializedAppearance = serializeAppearanceValues(
        appearanceConfig,
        appearanceValues,
      );
      if (isEditMode && fromCharacterId) {
        await updateCharacter(spaceId, fromCharacterId, {
          name: name.trim(),
          description: description.trim() || undefined,
          appearance: serializedAppearance,
        });
      } else {
        await createCharacter(spaceId, {
          name: name.trim(),
          description: description.trim() || undefined,
          appearance: serializedAppearance,
        });
      }
      navigate(`/spaces/${spaceId}/characters`);
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      if (message === 'CHARACTER_HAS_GENERATED_IMAGES') {
        setFormError(
          'This character already has generated images and cannot be edited.',
        );
      } else if (isEditMode) {
        setFormError('Failed to update character.');
      } else {
        setFormError('Failed to create character.');
      }
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

  const heading = space
    ? isEditMode
      ? `Edit character in ${space.name}`
      : space.name
    : isEditMode
      ? 'Edit character'
      : 'Create character';

  const getTagsFor = (
    categoryKey: string,
    propertyKey: string,
  ): string[] => {
    const categoryValues = appearanceValues[categoryKey] ?? {};
    const raw = categoryValues[propertyKey];
    if (Array.isArray(raw)) {
      return raw.map((v) => `${v}`.trim()).filter((v) => v.length > 0);
    }
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return [raw.trim()];
    }
    return [];
  };

  const setTagsFor = (
    category: AppearanceCategory,
    propertyKey: string,
    tags: string[],
  ): void => {
    const cleaned = tags
      .map((tag) => tag.trim())
      .filter((tag, idx, all) => tag.length > 0 && all.indexOf(tag) === idx);

    setAppearanceValues((prev) => {
      const categoryValues = { ...(prev[category.key] ?? {}) };
      categoryValues[propertyKey] = cleaned;
      return { ...prev, [category.key]: categoryValues };
    });
  };

  const getTagInputValue = (
    categoryKey: string,
    propertyKey: string,
  ): string => {
    const cat = tagInputs[categoryKey];
    return cat?.[propertyKey] ?? '';
  };

  const setTagInputValue = (
    categoryKey: string,
    propertyKey: string,
    value: string,
  ): void => {
    setTagInputs((prev) => {
      const categoryInputs = { ...(prev[categoryKey] ?? {}) };
      categoryInputs[propertyKey] = value;
      return { ...prev, [categoryKey]: categoryInputs };
    });
  };

  const handleChangeString = (
    category: AppearanceCategory,
    propertyKey: string,
    value: string,
  ): void => {
    setAppearanceValues((prev) => {
      const categoryValues = { ...(prev[category.key] ?? {}) };
      categoryValues[propertyKey] = value;
      return { ...prev, [category.key]: categoryValues };
    });
  };

  const handleChangeTags = (
    category: AppearanceCategory,
    propertyKey: string,
    value: string,
  ): void => {
    setTagInputValue(category.key, propertyKey, value);
  };

  const commitTagInput = (
    category: AppearanceCategory,
    propertyKey: string,
  ): void => {
    const raw = getTagInputValue(category.key, propertyKey);
    const parts = raw
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (parts.length === 0) {
      setTagInputValue(category.key, propertyKey, '');
      return;
    }

    const existing = getTagsFor(category.key, propertyKey);
    const merged = [...existing];
    for (const part of parts) {
      if (!merged.includes(part)) {
        merged.push(part);
      }
    }

    setTagsFor(category, propertyKey, merged);
    setTagInputValue(category.key, propertyKey, '');
  };

  const handleTagKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    category: AppearanceCategory,
    propertyKey: string,
  ): void => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitTagInput(category, propertyKey);
    }
  };

  const handleRemoveTag = (
    category: AppearanceCategory,
    propertyKey: string,
    tag: string,
  ): void => {
    const existing = getTagsFor(category.key, propertyKey);
    setTagsFor(
      category,
      propertyKey,
      existing.filter((t) => t !== tag),
    );
  };

  const handleToggleSuggestionTag = (
    category: AppearanceCategory,
    propertyKey: string,
    value: string,
  ): void => {
    const existing = getTagsFor(category.key, propertyKey);
    if (existing.includes(value)) {
      setTagsFor(
        category,
        propertyKey,
        existing.filter((t) => t !== value),
      );
    } else {
      setTagsFor(category, propertyKey, [...existing, value]);
    }
  };

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
                <label htmlFor={`appearance-${category.key}-${prop.key}`}>
                  {prop.label}
                </label>
                {prop.description && (
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>
                    {prop.description}
                  </div>
                )}
                <select
                  id={`appearance-${category.key}-${prop.key}`}
                  value={typeof current === 'string' ? current : ''}
                  onChange={(e) =>
                    handleChangeString(category, prop.key, e.target.value)
                  }
                  style={{ display: 'block', width: '100%' }}
                >
                  <option value="">Select…</option>
                  {(prop.options ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (prop.type === 'tags') {
            const tags = getTagsFor(category.key, prop.key);
            const inputValue = getTagInputValue(category.key, prop.key);
            const optionMap = new Map(
              (prop.options ?? []).map((opt) => [opt.value, opt.label]),
            );
            const availableOptions = (prop.options ?? []).filter(
              (opt) => !tags.includes(opt.value),
            );

            return (
              <div key={prop.key} style={{ marginBottom: '0.75rem' }}>
                <label htmlFor={`appearance-${category.key}-${prop.key}`}>
                  {prop.label}
                </label>
                {prop.description && (
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>
                    {prop.description}
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginTop: 4,
                    padding: 4,
                    borderRadius: 4,
                    border: '1px solid #ddd',
                  }}
                >
                  {tags.map((tag) => {
                    const label = optionMap.get(tag) ?? tag;
                    return (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 6px',
                          borderRadius: 999,
                          backgroundColor: '#f0f0f0',
                          fontSize: '0.85rem',
                        }}
                      >
                        <span>{label}</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveTag(category, prop.key, tag)
                          }
                          style={{
                            marginLeft: 4,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '0.9rem',
                          }}
                          aria-label={`Remove ${label}`}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                  <input
                    id={`appearance-${category.key}-${prop.key}`}
                    type="text"
                    value={inputValue}
                    onChange={(e) =>
                      handleChangeTags(category, prop.key, e.target.value)
                    }
                    onKeyDown={(e) =>
                      handleTagKeyDown(e, category, prop.key)
                    }
                    onBlur={() => commitTagInput(category, prop.key)}
                    placeholder="Type a keyword and press Enter or ,"
                    style={{
                      minWidth: 120,
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                    }}
                  />
                </div>
                {availableOptions.length > 0 && (
                  <div
                    style={{
                      marginTop: 4,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}
                  >
                    {availableOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          handleToggleSuggestionTag(
                            category,
                            prop.key,
                            opt.value,
                          )
                        }
                        style={{
                          padding: '2px 6px',
                          borderRadius: 999,
                          border: '1px solid #ccc',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={prop.key} style={{ marginBottom: '0.5rem' }}>
              <label htmlFor={`appearance-${category.key}-${prop.key}`}>
                {prop.label}
              </label>
              {prop.description && (
                <div style={{ fontSize: '0.85rem', color: '#555' }}>
                  {prop.description}
                </div>
              )}
              <textarea
                id={`appearance-${category.key}-${prop.key}`}
                value={typeof current === 'string' ? current : ''}
                onChange={(e) =>
                  handleChangeString(category, prop.key, e.target.value)
                }
                rows={3}
                style={{ display: 'block', width: '100%' }}
              />
            </div>
          );
        })}
      </fieldset>
    );
  };

  return (
    <section>
      <h2>{heading}</h2>
      <p>
        {isEditMode
          ? 'Edit this character before it has been used for image generation.'
          : fromCharacterId
            ? 'Clone an existing character and adjust details before saving.'
            : 'Create a new character for this space.'}
      </p>
      {spacesLoading && <p>Loading space…</p>}
      {spacesError && <p style={{ color: 'red' }}>{spacesError}</p>}
      {!spacesLoading && !space && !spacesError && (
        <p>Space not found or not accessible.</p>
      )}

      {space && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 720, marginTop: 16 }}>
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
          <button type="submit" disabled={submitting}>
            {submitting
              ? 'Saving…'
              : isEditMode
                ? 'Save changes'
                : 'Create character'}
          </button>
        </form>
      )}
    </section>
  );
}
