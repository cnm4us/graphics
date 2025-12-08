import type { StyleCategory } from './types.js';

export const renderingTechniqueCategory: StyleCategory = {
  key: 'rendering_technique',
  label: 'Rendering Technique',
  order: 4,
  description:
    'Shading, texture, and rendering decisions that define how the style is realized.',
  properties: [
    {
      key: 'shading',
      label: 'Shading',
      type: 'enum',
      options: [
        { value: 'flat_color', label: 'Flat Color' },
        { value: 'cel_shading', label: 'Cel Shading' },
        { value: 'soft_shading', label: 'Soft / Gradient Shading' },
        { value: 'painterly_shading', label: 'Painterly Shading' },
      ],
      allowCustom: true,
    },
    {
      key: 'texture',
      label: 'Texture treatment',
      type: 'tags',
      options: [
        { value: 'smooth', label: 'Smooth / Clean' },
        { value: 'painterly_brush', label: 'Painterly Brush Texture' },
        { value: 'halftone', label: 'Halftone / Screen Tone' },
        { value: 'grain', label: 'Film Grain / Noise' },
      ],
      allowCustom: true,
    },
    {
      key: 'surface_finish',
      label: 'Surface finish',
      type: 'enum',
      options: [
        { value: 'matte', label: 'Matte Finish' },
        { value: 'glossy', label: 'Glossy / Shiny' },
        { value: 'mixed', label: 'Mixed Matte & Glossy' },
      ],
      allowCustom: true,
    },
  ],
};

