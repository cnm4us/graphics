import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';
import {
  createStyle,
  updateStyle,
  fetchStyleWithVersions,
} from '../api/styles.ts';
import { useSpaceContext } from '../space/SpaceContext.tsx';
import {
  type StyleCategory,
  type StyleDefinitionConfig,
  type StyleValues,
  fetchStyleDefinitionConfig,
  createEmptyStyleValues,
  serializeStyleValues,
} from '../api/styleDefinitions.ts';

export function StyleCreatePage(): JSX.Element {
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
  const fromStyleId =
    fromParam && Number.isFinite(Number(fromParam)) ? Number(fromParam) : null;
  const modeParam = searchParams.get('mode');
  const isEditMode = modeParam === 'edit' && fromStyleId != null;

  const [space, setSpace] = useState<Space | null>(null);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [styleConfig, setStyleConfig] =
    useState<StyleDefinitionConfig | null>(null);
  const [styleValues, setStyleValues] = useState<StyleValues>({});
  const [tagInputs, setTagInputs] = useState<
    Record<string, Record<string, string>>
  >({});
  const [styleConfigLoading, setStyleConfigLoading] = useState(false);
  const [styleConfigError, setStyleConfigError] = useState<string | null>(null);
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
      setStyleConfigLoading(true);
      setStyleConfigError(null);
      try {
        const promises: Array<Promise<unknown>> = [
          fetchSpaces(),
          fetchStyleDefinitionConfig(),
        ];
        if (fromStyleId) {
          promises.push(fetchStyleWithVersions(spaceId, fromStyleId));
        }

        const [spaces, config, fromStyleMaybe] = (await Promise.all(
          promises,
        )) as [
          Space[],
          StyleDefinitionConfig,
          | {
              id: number;
              name: string;
              description: string | null;
              versions: Array<{
                styleDefinition?: StyleValues | null;
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

        setStyleConfig(config);

        if (fromStyleMaybe) {
          setName(fromStyleMaybe.name);
          setDescription(fromStyleMaybe.description ?? '');

          const latestVersion =
            fromStyleMaybe.versions[fromStyleMaybe.versions.length - 1] ??
            null;
          const existingDefinition =
            latestVersion?.styleDefinition ?? (null as StyleValues | null);

          setStyleValues((prev) =>
            createEmptyStyleValues(config),
          );
          if (existingDefinition) {
            setStyleValues((prev) => {
              const base = { ...prev };
              for (const categoryKey of Object.keys(existingDefinition)) {
                const cat = existingDefinition[categoryKey] ?? {};
                base[categoryKey] = { ...(cat as Record<string, string | string[]>) };
              }
              return base;
            });
          }
        } else {
          setStyleValues((prev) =>
            Object.keys(prev).length === 0
              ? createEmptyStyleValues(config)
              : prev,
          );
        }
      } catch {
        setSpacesError('Failed to load spaces.');
        setStyleConfigError('Failed to load style configuration.');
      } finally {
        setSpacesLoading(false);
        setStyleConfigLoading(false);
      }
    };

    void load();
  }, [user, spaceId, setActiveSpaceId]);

  const getTagsFor = (categoryKey: string, propertyKey: string): string[] => {
    const categoryValues = styleValues[categoryKey] ?? {};
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
    category: StyleCategory,
    propertyKey: string,
    tags: string[],
  ): void => {
    const cleaned = tags
      .map((tag) => tag.trim())
      .filter((tag, idx, all) => tag.length > 0 && all.indexOf(tag) === idx);

    setStyleValues((prev) => {
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
    category: StyleCategory,
    propertyKey: string,
    value: string,
  ): void => {
    setStyleValues((prev) => {
      const categoryValues = { ...(prev[category.key] ?? {}) };
      categoryValues[propertyKey] = value;
      return { ...prev, [category.key]: categoryValues };
    });
  };

  const handleChangeTags = (
    category: StyleCategory,
    propertyKey: string,
    value: string,
  ): void => {
    setTagInputValue(category.key, propertyKey, value);
  };

  const commitTagInput = (category: StyleCategory, propertyKey: string): void => {
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
    category: StyleCategory,
    propertyKey: string,
  ): void => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitTagInput(category, propertyKey);
    }
  };

  const handleRemoveTag = (
    category: StyleCategory,
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
    category: StyleCategory,
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

  const renderStyleSection = (category: StyleCategory): JSX.Element => {
    const valuesForCategory = styleValues[category.key] ?? {};

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
                <label htmlFor={`style-${category.key}-${prop.key}`}>
                  {prop.label}
                </label>
                {prop.description && (
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>
                    {prop.description}
                  </div>
                )}
                <select
                  id={`style-${category.key}-${prop.key}`}
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
              <div key={prop.key} style={{ marginBottom: '0.5rem' }}>
                <label htmlFor={`style-${category.key}-${prop.key}`}>
                  {prop.label}
                </label>
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
                    padding: '4px 6px',
                    borderRadius: 4,
                    border: '1px solid #ccc',
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
                          backgroundColor: '#eef',
                          fontSize: '0.8rem',
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
                            background: 'none',
                            cursor: 'pointer',
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
                    id={`style-${category.key}-${prop.key}`}
                    type="text"
                    value={inputValue}
                    onChange={(e) =>
                      handleChangeTags(category, prop.key, e.target.value)
                    }
                    onKeyDown={(e) => handleTagKeyDown(e, category, prop.key)}
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
              <label htmlFor={`style-${category.key}-${prop.key}`}>
                {prop.label}
              </label>
              {prop.description && (
                <div style={{ fontSize: '0.85rem', color: '#555' }}>
                  {prop.description}
                </div>
              )}
              <textarea
                id={`style-${category.key}-${prop.key}`}
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

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    if (!spaceId) {
      setFormError('Invalid space.');
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Name is required.');
      return;
    }
    if (!styleConfig) {
      setFormError('Style configuration is not loaded.');
      return;
    }

    try {
      setSubmitting(true);
      const serialized = serializeStyleValues(styleConfig, styleValues);
      const styleDefinition =
        Object.keys(serialized).length > 0 ? serialized : undefined;
      if (isEditMode && fromStyleId) {
        await updateStyle(spaceId, fromStyleId, {
          name: trimmedName,
          description: description.trim() || undefined,
          styleDefinition,
        });
      } else {
        await createStyle(spaceId, {
          name: trimmedName,
          description: description.trim() || undefined,
          styleDefinition,
        });
      }
      navigate(`/spaces/${spaceId}/styles`);
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      if (message === 'STYLE_HAS_GENERATED_IMAGES') {
        setFormError(
          'This style already has generated images and cannot be edited.',
        );
      } else if (isEditMode) {
        setFormError('Failed to update style.');
      } else {
        setFormError('Failed to create style.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section>
        <h2>Create style</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>Create style</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  if (!spaceId) {
    return (
      <section>
        <h2>Create style</h2>
        <p>Invalid space ID.</p>
      </section>
    );
  }

  const heading = space
    ? isEditMode
      ? `Edit style in ${space.name}`
      : `Create style in ${space.name}`
    : isEditMode
      ? 'Edit style'
      : 'Create style';

  return (
    <section>
      <h2>{heading}</h2>
      {spacesLoading && <p>Loading space…</p>}
      {spacesError && <p style={{ color: 'red' }}>{spacesError}</p>}
      {!spacesLoading && !space && !spacesError && (
        <p>Space not found or not accessible.</p>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: 720, marginTop: 16 }}>
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="styleName">Name</label>
          <input
            id="styleName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="styleDescription">Description</label>
          <textarea
            id="styleDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ display: 'block', width: '100%' }}
          />
        </div>
        {styleConfigLoading && <p>Loading style configuration…</p>}
        {styleConfigError && (
          <p style={{ color: 'red' }}>{styleConfigError}</p>
        )}
        {styleConfig &&
          styleConfig.categories
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((category) => renderStyleSection(category))}
        <button type="submit" disabled={submitting}>
          {submitting
            ? isEditMode
              ? 'Saving…'
              : 'Creating…'
            : isEditMode
              ? 'Save'
              : 'Create style'}
        </button>
      </form>
    </section>
  );
}
