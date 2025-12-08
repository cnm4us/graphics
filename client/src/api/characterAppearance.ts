export type AppearancePropertyType = 'string' | 'enum' | 'tags';

export type AppearanceOption = {
  value: string;
  label: string;
};

export type AppearanceProperty = {
  key: string;
  label: string;
  type: AppearancePropertyType;
  description?: string;
  options?: AppearanceOption[];
  allowCustom?: boolean;
};

export type AppearanceCategory = {
  key: string;
  label: string;
  order: number;
  description?: string;
  properties: AppearanceProperty[];
};

export type CharacterAppearanceConfig = {
  categories: AppearanceCategory[];
};

export type AppearanceValue = string | string[];

export type AppearanceValues = Record<string, Record<string, AppearanceValue>>;

export const fetchCharacterAppearanceConfig =
  async (): Promise<CharacterAppearanceConfig> => {
    const res = await fetch('/api/character-appearance-config', {
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('CHARACTER_APPEARANCE_CONFIG_FETCH_FAILED');
    }

    const data = (await res.json()) as CharacterAppearanceConfig;
    return data;
  };

export const createEmptyAppearanceValues = (
  config: CharacterAppearanceConfig,
): AppearanceValues => {
  const result: AppearanceValues = {};

  for (const category of config.categories) {
    const categoryValues: Record<string, AppearanceValue> = {};

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

export const buildInitialAppearanceValues = (
  config: CharacterAppearanceConfig,
  existing: AppearanceValues | null | undefined,
): AppearanceValues => {
  const base: AppearanceValues =
    existing && typeof existing === 'object' ? { ...existing } : {};

  for (const category of config.categories) {
    const currentCategory =
      (base[category.key] as Record<string, AppearanceValue> | undefined) ??
      {};

    const nextCategory: Record<string, AppearanceValue> = { ...currentCategory };

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

export const serializeAppearanceValues = (
  config: CharacterAppearanceConfig,
  values: AppearanceValues,
): AppearanceValues => {
  const result: AppearanceValues = {};

  for (const category of config.categories) {
    const sourceCategory = values[category.key];
    if (!sourceCategory) continue;

    const outCategory: Record<string, AppearanceValue> = {};

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
