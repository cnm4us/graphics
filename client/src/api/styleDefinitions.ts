export type StylePropertyType = 'string' | 'enum' | 'tags';

export type StyleOption = {
  value: string;
  label: string;
};

export type StyleProperty = {
  key: string;
  label: string;
  type: StylePropertyType;
  description?: string;
  options?: StyleOption[];
  allowCustom?: boolean;
};

export type StyleCategory = {
  key: string;
  label: string;
  order: number;
  description?: string;
  properties: StyleProperty[];
};

export type StyleDefinitionConfig = {
  categories: StyleCategory[];
};

export type StyleValue = string | string[];

export type StyleValues = Record<string, Record<string, StyleValue>>;

export const fetchStyleDefinitionConfig =
  async (): Promise<StyleDefinitionConfig> => {
    const res = await fetch('/api/style-definition-config', {
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('STYLE_DEFINITION_CONFIG_FETCH_FAILED');
    }

    const data = (await res.json()) as StyleDefinitionConfig;
    return data;
  };

export const createEmptyStyleValues = (
  config: StyleDefinitionConfig,
): StyleValues => {
  const result: StyleValues = {};

  for (const category of config.categories) {
    const categoryValues: Record<string, StyleValue> = {};

    for (const prop of category.properties) {
      if (prop.type === 'tags') {
        categoryValues[prop.key] = [];
      } else {
        categoryValues[prop.key] = '';
      }
    }

    result[category.key] = categoryValues;
  }

  return result;
};

export const buildInitialStyleValues = (
  config: StyleDefinitionConfig,
  existing: StyleValues | null | undefined,
): StyleValues => {
  const base: StyleValues =
    existing && typeof existing === 'object' ? { ...existing } : {};

  for (const category of config.categories) {
    const currentCategory =
      (base[category.key] as Record<string, StyleValue> | undefined) ?? {};

    const nextCategory: Record<string, StyleValue> = { ...currentCategory };

    for (const prop of category.properties) {
      const existingValue = currentCategory[prop.key];

      if (existingValue === undefined) {
        nextCategory[prop.key] =
          prop.type === 'tags' ? ([] as string[]) : '';
        continue;
      }

      if (prop.type === 'tags') {
        if (Array.isArray(existingValue)) {
          nextCategory[prop.key] = existingValue;
        } else if (typeof existingValue === 'string') {
          nextCategory[prop.key] = existingValue
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
        } else {
          nextCategory[prop.key] = [];
        }
      } else {
        if (Array.isArray(existingValue)) {
          const first = existingValue[0];
          nextCategory[prop.key] = typeof first === 'string' ? first : '';
        } else if (typeof existingValue === 'string') {
          nextCategory[prop.key] = existingValue;
        } else {
          nextCategory[prop.key] = '';
        }
      }
    }

    base[category.key] = nextCategory;
  }

  return base;
};

export const serializeStyleValues = (
  config: StyleDefinitionConfig,
  values: StyleValues,
): StyleValues => {
  const result: StyleValues = {};

  for (const category of config.categories) {
    const sourceCategory = values[category.key];
    if (!sourceCategory) continue;

    const outCategory: Record<string, StyleValue> = {};

    for (const prop of category.properties) {
      const raw = sourceCategory[prop.key];

      if (prop.type === 'tags') {
        const list = Array.isArray(raw)
          ? raw.map((v) => `${v}`.trim()).filter((v) => v.length > 0)
          : typeof raw === 'string'
            ? raw
                .split(',')
                .map((v) => v.trim())
                .filter((v) => v.length > 0)
            : [];

        if (list.length > 0) {
          outCategory[prop.key] = list;
        }
      } else {
        const str =
          typeof raw === 'string'
            ? raw.trim()
            : Array.isArray(raw) && typeof raw[0] === 'string'
              ? raw[0].trim()
              : '';

        if (str.length > 0) {
          outCategory[prop.key] = str;
        }
      }
    }

    if (Object.keys(outCategory).length > 0) {
      result[category.key] = outCategory;
    }
  }

  return result;
};

