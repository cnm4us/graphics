import type { StyleCategory } from './types.js';

export const colorAndLightingCategory: StyleCategory = {
  key: 'color_and_lighting',
  label: 'Color & Lighting',
  order: 3,
  description:
    'Color palette, saturation, contrast, and lighting character for this style.',
  properties: [
    {
      key: 'color_palette',
      label: 'Color palette',
      type: 'tags',
      options: [
        { value: 'bold_colors', label: 'Bold Colors' },
        { value: 'limited_palette', label: 'Limited Palette' },
        { value: 'pastel', label: 'Pastel Palette' },
        { value: 'high_contrast', label: 'High Contrast' },
        { value: 'muted', label: 'Muted / Desaturated' },
      ],
      allowCustom: true,
    },
    {
      key: 'saturation',
      label: 'Saturation',
      type: 'enum',
      options: [
        { value: 'low', label: 'Low Saturation' },
        { value: 'medium', label: 'Medium Saturation' },
        { value: 'high', label: 'High Saturation' },
      ],
      allowCustom: true,
    },
    {
      key: 'lighting_style',
      label: 'Lighting style',
      type: 'tags',
      options: [
        { value: 'soft_light', label: 'Soft, Even Light' },
        { value: 'dramatic_light', label: 'Dramatic / High Contrast Light' },
        { value: 'rim_light', label: 'Rim Lighting' },
        { value: 'studio_light', label: 'Studio Lighting' },
        { value: 'ambient_light', label: 'Ambient / Environmental Light' },
      ],
      allowCustom: true,
    },
  ],
};

