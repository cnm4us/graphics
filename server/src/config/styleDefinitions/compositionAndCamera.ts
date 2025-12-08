import type { StyleCategory } from './types.js';

export const compositionAndCameraCategory: StyleCategory = {
  key: 'composition_and_camera',
  label: 'Composition & Camera',
  order: 5,
  description:
    'Default framing, camera behavior, and compositional tendencies for this style.',
  properties: [
    {
      key: 'camera_style',
      label: 'Camera style',
      type: 'tags',
      options: [
        { value: 'cinematic', label: 'Cinematic Framing' },
        { value: 'portrait', label: 'Portrait Framing' },
        { value: 'dynamic_angles', label: 'Dynamic Angles' },
        { value: 'orthographic', label: 'Orthographic / Isometric' },
      ],
      allowCustom: true,
    },
    {
      key: 'focal_length',
      label: 'Focal length / lens feel',
      type: 'enum',
      options: [
        { value: 'wide', label: 'Wide Lens Feel' },
        { value: 'normal', label: 'Normal Lens Feel' },
        { value: 'telephoto', label: 'Telephoto / Compressed' },
      ],
      allowCustom: true,
    },
    {
      key: 'composition_notes',
      label: 'Composition notes',
      type: 'tags',
      description:
        'Optional notes about layout tendencies (e.g., centered subjects, rule-of-thirds, graphic shapes).',
      allowCustom: true,
    },
  ],
};

