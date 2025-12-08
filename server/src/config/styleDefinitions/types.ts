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

