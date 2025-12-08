import type { CharacterAppearanceConfig } from './types.js';
import { coreIdentityCategory } from './coreIdentity.js';
import { facialStructureCategory } from './facialStructure.js';
import { hairCategory } from './hair.js';
import { skinCategory } from './skin.js';
import { physiqueCategory } from './physique.js';
import { distinctiveMarkersCategory } from './distinctiveMarkers.js';
import { clothingDefaultsCategory } from './clothingDefaults.js';
import { characterLoreCategory } from './characterLore.js';
import { baseReferenceImagesCategory } from './baseReferenceImages.js';

export * from './types.js';

export const characterAppearanceConfig: CharacterAppearanceConfig = {
  categories: [
    coreIdentityCategory,
    facialStructureCategory,
    hairCategory,
    skinCategory,
    physiqueCategory,
    distinctiveMarkersCategory,
    clothingDefaultsCategory,
    characterLoreCategory,
    baseReferenceImagesCategory,
  ],
};

