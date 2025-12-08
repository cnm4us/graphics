import type { StyleDefinitionConfig } from './types.js';
import { coreStyleCategory } from './coreStyle.js';
import { lineAndDetailCategory } from './lineAndDetail.js';
import { colorAndLightingCategory } from './colorAndLighting.js';
import { renderingTechniqueCategory } from './renderingTechnique.js';
import { compositionAndCameraCategory } from './compositionAndCamera.js';
import { moodAndAtmosphereCategory } from './moodAndAtmosphere.js';

export * from './types.js';

export const styleDefinitionConfig: StyleDefinitionConfig = {
  categories: [
    coreStyleCategory,
    lineAndDetailCategory,
    colorAndLightingCategory,
    renderingTechniqueCategory,
    compositionAndCameraCategory,
    moodAndAtmosphereCategory,
  ],
};

