import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { fetchSpaces, type Space } from '../api/spaces.ts';
import { fetchStyleWithVersions, type StyleWithVersions } from '../api/styles.ts';
import {
  type StyleCategory,
  type StyleDefinitionConfig,
  type StyleValues,
  fetchStyleDefinitionConfig,
  createEmptyStyleValues,
} from '../api/styleDefinitions.ts';
import { useSpaceContext } from '../space/SpaceContext.tsx';

export function StyleViewPage(): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const { setActiveSpaceId } = useSpaceContext();

  const spaceIdParam = params.spaceId;
  const styleIdParam = params.styleId;
  const spaceId =
    spaceIdParam && Number.isFinite(Number(spaceIdParam))
      ? Number(spaceIdParam)
      : null;
  const styleId =
    styleIdParam && Number.isFinite(Number(styleIdParam))
      ? Number(styleIdParam)
      : null;

  const [space, setSpace] = useState<Space | null>(null);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);

  const [style, setStyle] = useState<StyleWithVersions | null>(null);
  const [styleConfig, setStyleConfig] =
    useState<StyleDefinitionConfig | null>(null);
  const [styleValues, setStyleValues] = useState<StyleValues>({});
  const [styleConfigLoading, setStyleConfigLoading] = useState(false);
  const [styleConfigError, setStyleConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!spaceId || !user || !styleId) return;

    setActiveSpaceId(spaceId);

    const load = async (): Promise<void> => {
      setSpacesLoading(true);
      setSpacesError(null);
      setStyleConfigLoading(true);
      setStyleConfigError(null);
      try {
        const [spaces, config, styleData] = (await Promise.all([
          fetchSpaces(),
          fetchStyleDefinitionConfig(),
          fetchStyleWithVersions(spaceId, styleId),
        ])) as [Space[], StyleDefinitionConfig, StyleWithVersions];

        const current = spaces.find((s) => s.id === spaceId) ?? null;
        if (!current) {
          setSpacesError('Space not found or not accessible.');
          setSpace(null);
        } else {
          setSpace(current);
        }

        setStyleConfig(config);
        setStyle(styleData);

        const latestVersion =
          styleData.versions[styleData.versions.length - 1] ?? null;
        const existingDefinition =
          (latestVersion?.styleDefinition as StyleValues | null | undefined) ??
          null;

        const baseValues = createEmptyStyleValues(config);
        if (existingDefinition) {
          const merged: StyleValues = { ...baseValues };
          for (const categoryKey of Object.keys(existingDefinition)) {
            const cat = existingDefinition[categoryKey] ?? {};
            merged[categoryKey] = {
              ...(cat as Record<string, string | string[]>),
            };
          }
          setStyleValues(merged);
        } else {
          setStyleValues(baseValues);
        }
      } catch {
        setSpacesError('Failed to load space or style.');
        setStyleConfigError('Failed to load style configuration.');
      } finally {
        setSpacesLoading(false);
        setStyleConfigLoading(false);
      }
    };

    void load();
  }, [user, spaceId, styleId, setActiveSpaceId]);

  if (loading) {
    return (
      <section>
        <h2>View style</h2>
        <p>Loading your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>View style</h2>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  if (!spaceId || !styleId) {
    return (
      <section>
        <h2>View style</h2>
        <p>Invalid space or style ID.</p>
      </section>
    );
  }

  const heading =
    space && style
      ? `${style.name} in ${space.name}`
      : style
        ? style.name
        : 'View style';

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
            const optionLabel =
              typeof current === 'string' && current.trim().length > 0
                ? (prop.options ?? []).find((opt) => opt.value === current)
                    ?.label ?? current
                : null;

            return (
              <div key={prop.key} style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 500 }}>{prop.label}</div>
                {prop.description && (
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>
                    {prop.description}
                  </div>
                )}
                <div style={{ marginTop: 2 }}>{optionLabel ?? '—'}</div>
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
      {styleConfigLoading && <p>Loading style configuration…</p>}
      {styleConfigError && (
        <p style={{ color: 'red' }}>{styleConfigError}</p>
      )}
      {style && (
        <div style={{ maxWidth: 720, marginTop: 16 }}>
          {style.description && (
            <p style={{ marginTop: 0 }}>{style.description}</p>
          )}
          {styleConfig &&
            styleConfig.categories
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((category) => renderStyleSection(category))}
        </div>
      )}
    </section>
  );
}

