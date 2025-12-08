import type { AppearanceCategory } from './types.js';

export const baseReferenceImagesCategory: AppearanceCategory = {
  key: 'base_reference_images',
  label: 'Base Reference Images',
  order: 9,
  description:
    'Optional reference image IDs used by the pipeline (face/body/hair/full-character).',
  properties: [
    {
      key: 'face_reference_image_id',
      label: 'Face reference image ID',
      type: 'string',
    },
    {
      key: 'body_reference_image_id',
      label: 'Body reference image ID',
      type: 'string',
    },
    {
      key: 'hair_reference_image_id',
      label: 'Hair reference image ID',
      type: 'string',
    },
    {
      key: 'full_character_reference_image_id',
      label: 'Full-character reference image ID',
      type: 'string',
    },
  ],
};

