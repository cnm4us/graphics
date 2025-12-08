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
import {
  type StyleCategory,
  type StyleDefinitionConfig,
  type StyleValues,
  fetchStyleDefinitionConfig,
  createEmptyStyleValues,
  serializeStyleValues,
} from '../api/styleDefinitions.ts';

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

  useEffect(() => {
    const loadStyleConfig = async (): Promise<void> => {
      setStyleConfigLoading(true);
      setStyleConfigError(null);
      try {
        const config = await fetchStyleDefinitionConfig();
        setStyleConfig(config);
        setStyleValues((prev) =>
          Object.keys(prev).length === 0
            ? createEmptyStyleValues(config)
            : prev,
        );
      } catch {
        setStyleConfigError('Failed to load style configuration.');
      } finally {
        setStyleConfigLoading(false);
      }
    };

    void loadStyleConfig();
  }, []);

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

  const handleCreateStyle = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    if (!selectedSpaceId) {
      setFormError('No space selected.');
      return;
    }
    const trimmedName = newStyleName.trim();
    if (!trimmedName) {
      setFormError('Name is required.');
      return;
    }
    try {
      setSubmitting(true);
      let serializedDefinition: StyleValues | undefined;
      if (styleConfig) {
        const result = serializeStyleValues(styleConfig, styleValues);
        if (Object.keys(result).length > 0) {
          serializedDefinition = result;
        }
      }
      const style = await createStyle(selectedSpaceId, {
        name: trimmedName,
        description: newStyleDescription.trim() || undefined,
        styleDefinition: serializedDefinition,
      });
      setStyles((prev) => [style, ...prev]);
      setNewStyleName('');
      setNewStyleDescription('');
      if (styleConfig) {
        setStyleValues(createEmptyStyleValues(styleConfig));
        setTagInputs({});
      }
    } catch {
      setFormError('Failed to create style.');
    } finally {
      setSubmitting(false);
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

          <form
            onSubmit={handleCreateStyle}
            style={{ maxWidth: 720, marginTop: 16 }}
          >
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
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
              {submitting ? 'Creating…' : 'Create style'}
            </button>
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
