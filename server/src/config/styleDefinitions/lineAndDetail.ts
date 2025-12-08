import type { StyleCategory } from './types.js';

export const lineAndDetailCategory: StyleCategory = {
  key: 'line_and_detail',
  label: 'Line & Detail',
  order: 2,
  description:
    'Line work, edge treatment, and overall level of detail for this style.',
  properties: [
    {
      key: 'line_weight',
      label: 'Line weight',
      type: 'enum',
      options: [
        { value: 'none', label: 'No Visible Outlines' },
        { value: 'thin', label: 'Thin Clean Lines' },
        { value: 'medium', label: 'Medium Lines' },
        { value: 'thick', label: 'Thick Bold Lines' },
        { value: 'variable', label: 'Variable Line Weight' },
      ],
      allowCustom: true,
    },
    {
      key: 'line_quality',
      label: 'Line quality',
      type: 'tags',
      options: [
        { value: 'clean', label: 'Clean / Polished' },
        { value: 'sketchy', label: 'Sketchy / Rough' },
        { value: 'expressive', label: 'Expressive / Gestural' },
        { value: 'inking', label: 'Inked Comic Lines' },
      ],
      allowCustom: true,
    },
    {
      key: 'detail_level',
      label: 'Detail level',
      type: 'enum',
      options: [
        { value: 'simple', label: 'Simple / Minimal Detail' },
        { value: 'medium_detail', label: 'Medium Detail' },
        { value: 'high_detail', label: 'Highly Detailed' },
      ],
      allowCustom: true,
    },
  ],
};

