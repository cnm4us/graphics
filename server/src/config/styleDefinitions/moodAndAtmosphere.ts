import type { StyleCategory } from './types.js';

export const moodAndAtmosphereCategory: StyleCategory = {
  key: 'mood_and_atmosphere',
  label: 'Mood & Atmosphere',
  order: 6,
  description:
    'Emotional tone and atmospheric cues this style tends to emphasize.',
  properties: [
    {
      key: 'mood_keywords',
      label: 'Mood keywords',
      type: 'tags',
      options: [
        { value: 'uplifting', label: 'Uplifting' },
        { value: 'dramatic', label: 'Dramatic' },
        { value: 'melancholic', label: 'Melancholic' },
        { value: 'whimsical', label: 'Whimsical' },
        { value: 'serene', label: 'Serene' },
      ],
      allowCustom: true,
    },
    {
      key: 'atmosphere',
      label: 'Atmosphere / environment feel',
      type: 'tags',
      description:
        'Optional cues like foggy, crisp, neon-lit, dreamlike, grounded, etc.',
      allowCustom: true,
    },
  ],
};

