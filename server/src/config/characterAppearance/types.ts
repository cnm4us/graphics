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

