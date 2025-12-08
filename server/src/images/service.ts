import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { uploadImageToS3, deleteObjectFromS3 } from '../storage/s3Client.js';
import { getDbPool } from '../db/index.js';
import { assertSpaceOwnedByUser } from '../characters/service.js';
import { getSignedImageUrl } from './cloudfront.js';
import { characterAppearanceConfig } from '../config/characterAppearance/index.js';
import type { CharacterAppearanceValues } from '../characters/service.js';
import { styleDefinitionConfig } from '../config/styleDefinitions/index.js';

type StyleDefinitionValues = Record<string, Record<string, string | string[]>>;

export type GenerateImageInput = {
  userId: number;
  spaceId: number;
  characterVersionId: number;
  styleVersionId: number;
  sceneVersionId?: number;
  seed?: number;
  aspectRatio?: string;
  resolution?: string;
};

export type ImageSummary = {
  id: number;
  spaceId: number;
  characterVersionId: number | null;
  styleVersionId: number | null;
  sceneVersionId: number | null;
  seed: number;
  prompt: string;
  negativePrompt: string | null;
  s3Key: string;
  s3Url?: string;
  cloudfrontUrl?: string;
  createdAt: string;
};

type CharacterVersionPromptRow = {
  id: number;
  character_id: number;
  identity_summary: string | null;
  physical_description: string | null;
  wardrobe_description: string | null;
  personality_mannerisms: string | null;
  extra_notes: string | null;
  appearance_json?: string | null;
  base_prompt: string | null;
  negative_prompt: string | null;
};

type StyleVersionPromptRow = {
  id: number;
  style_id: number;
  style_name?: string | null;
  style_description?: string | null;
  art_style: string | null;
  color_palette: string | null;
  lighting: string | null;
  camera: string | null;
  render_technique: string | null;
   style_definition_json?: string | null;
  negative_prompt: string | null;
  base_prompt: string | null;
};

type SceneVersionPromptRow = {
  id: number;
  scene_id: number;
  environment_description: string | null;
  layout_description: string | null;
  time_of_day: string | null;
  mood: string | null;
  base_prompt: string | null;
  negative_prompt: string | null;
};

const buildAppearanceLines = (
  appearanceJson: string | null | undefined,
): string[] => {
  if (!appearanceJson) return [];

  let values: CharacterAppearanceValues | null = null;
  try {
    const parsed = JSON.parse(
      typeof appearanceJson === 'string'
        ? appearanceJson
        : String(appearanceJson),
    );
    if (parsed && typeof parsed === 'object') {
      values = parsed as CharacterAppearanceValues;
    }
  } catch {
    values = null;
  }

  if (!values) return [];

  const relevantCategoryKeys = new Set<string>([
    'core_identity',
    'facial_structure',
    'hair',
    'skin',
    'physique',
    'distinctive_markers',
    'clothing_defaults',
    'character_lore',
  ]);

  const lines: string[] = [];

  for (const category of characterAppearanceConfig.categories) {
    if (!relevantCategoryKeys.has(category.key)) continue;

    const categoryValues = values[category.key];
    if (!categoryValues) continue;

    const parts: string[] = [];

    for (const prop of category.properties) {
      const raw = categoryValues[prop.key];
      if (raw === undefined || raw === null) continue;

      if (prop.type === 'tags') {
        const list = Array.isArray(raw)
          ? raw
          : typeof raw === 'string'
            ? [raw]
            : [];
        const clean = list
          .map((item) => `${item}`.trim())
          .filter((item) => item.length > 0);
        if (clean.length === 0) continue;
        const displayList = clean.map((value) => {
          const option = prop.options?.find((opt) => opt.value === value);
          return option?.label ?? value;
        });
        parts.push(`${prop.label}: ${displayList.join(', ')}`);
      } else if (prop.type === 'enum') {
        const rawValue =
          typeof raw === 'string'
            ? raw
            : Array.isArray(raw) && raw[0]
              ? `${raw[0]}`
              : '';
        const trimmed = rawValue.trim();
        if (!trimmed) continue;
        const option = prop.options?.find((opt) => opt.value === trimmed);
        const display = option?.label ?? trimmed;
        parts.push(`${prop.label}: ${display}`);
      } else {
        const rawValue =
          typeof raw === 'string'
            ? raw
            : Array.isArray(raw) && raw[0]
              ? `${raw[0]}`
              : '';
        const trimmed = rawValue.trim();
        if (!trimmed) continue;
        parts.push(`${prop.label}: ${trimmed}`);
      }
    }

    if (parts.length > 0) {
      lines.push(`${category.label}: ${parts.join('; ')}`);
    }
  }

  return lines;
};

const buildStyleDefinitionLines = (
  styleDefinitionJson: string | null | undefined,
): string[] => {
  if (!styleDefinitionJson) return [];

  let values: StyleDefinitionValues | null = null;
  try {
    const parsed = JSON.parse(
      typeof styleDefinitionJson === 'string'
        ? styleDefinitionJson
        : String(styleDefinitionJson),
    );
    if (parsed && typeof parsed === 'object') {
      values = parsed as StyleDefinitionValues;
    }
  } catch {
    values = null;
  }

  if (!values) return [];

  const lines: string[] = [];

  for (const category of styleDefinitionConfig.categories) {
    const categoryValues = values[category.key];
    if (!categoryValues) continue;

    const parts: string[] = [];

    for (const prop of category.properties) {
      const raw = categoryValues[prop.key];
      if (raw === undefined || raw === null) continue;

      if (prop.type === 'tags') {
        const list = Array.isArray(raw)
          ? raw
          : typeof raw === 'string'
            ? [raw]
            : [];
        const clean = list
          .map((item) => `${item}`.trim())
          .filter((item) => item.length > 0);
        if (clean.length === 0) continue;
        const displayList = clean.map((value) => {
          const option = prop.options?.find((opt) => opt.value === value);
          return option?.label ?? value;
        });
        parts.push(`${prop.label}: ${displayList.join(', ')}`);
      } else if (prop.type === 'enum') {
        const rawValue =
          typeof raw === 'string'
            ? raw
            : Array.isArray(raw) && raw[0]
              ? `${raw[0]}`
              : '';
        const trimmed = rawValue.trim();
        if (!trimmed) continue;
        const option = prop.options?.find((opt) => opt.value === trimmed);
        const display = option?.label ?? trimmed;
        parts.push(`${prop.label}: ${display}`);
      } else {
        const rawValue =
          typeof raw === 'string'
            ? raw
            : Array.isArray(raw) && raw[0]
              ? `${raw[0]}`
              : '';
        const trimmed = rawValue.trim();
        if (!trimmed) continue;
        parts.push(`${prop.label}: ${trimmed}`);
      }
    }

    if (parts.length > 0) {
      lines.push(`${category.label}: ${parts.join('; ')}`);
    }
  }

  return lines;
};

const buildPrompt = (
  character: CharacterVersionPromptRow | null,
  style: StyleVersionPromptRow | null,
  scene: SceneVersionPromptRow | null,
): { prompt: string; negativePrompt: string | null } => {
  const characterLines: string[] = [];
  const styleLines: string[] = [];
  const sceneLines: string[] = [];
  const negative: string[] = [];

  if (character) {
    if (character.identity_summary) {
      characterLines.push(`Character identity: ${character.identity_summary}`);
    }
    if (character.physical_description) {
      characterLines.push(
        `Physical description: ${character.physical_description}`,
      );
    }
    if (character.wardrobe_description) {
      characterLines.push(`Wardrobe: ${character.wardrobe_description}`);
    }
    if (character.personality_mannerisms) {
      characterLines.push(
        `Personality and mannerisms: ${character.personality_mannerisms}`,
      );
    }
    if (character.extra_notes) {
      characterLines.push(
        `Additional character notes: ${character.extra_notes}`,
      );
    }
    const appearanceLines = buildAppearanceLines(character.appearance_json);
    if (appearanceLines.length > 0) {
      characterLines.push(...appearanceLines);
    }
    if (character.base_prompt) {
      characterLines.push(character.base_prompt);
    }
    if (character.negative_prompt) {
      negative.push(character.negative_prompt);
    }
  }

  if (style) {
    if (style.style_name) {
      const base = style.style_name;
      const desc =
        typeof style.style_description === 'string'
          ? style.style_description.trim()
          : '';
      if (desc) {
        styleLines.push(`Style: ${base} — ${desc}`);
      } else {
        styleLines.push(`Style: ${base}`);
      }
    }
    const styleDefinitionLines = buildStyleDefinitionLines(
      style.style_definition_json,
    );
    if (styleDefinitionLines.length > 0) {
      styleLines.push(...styleDefinitionLines);
    }
    if (style.art_style) {
      styleLines.push(`Art style: ${style.art_style}`);
    }
    if (style.color_palette) {
      styleLines.push(`Color palette: ${style.color_palette}`);
    }
    if (style.lighting) {
      styleLines.push(`Lighting: ${style.lighting}`);
    }
    if (style.camera) {
      styleLines.push(`Camera: ${style.camera}`);
    }
    if (style.render_technique) {
      styleLines.push(`Rendering: ${style.render_technique}`);
    }
    if (style.base_prompt) {
      styleLines.push(style.base_prompt);
    }
    if (style.negative_prompt) {
      negative.push(style.negative_prompt);
    }
  }

  if (scene) {
    if (scene.environment_description) {
      sceneLines.push(`Scene environment: ${scene.environment_description}`);
    }
    if (scene.layout_description) {
      sceneLines.push(`Scene layout: ${scene.layout_description}`);
    }
    if (scene.time_of_day) {
      sceneLines.push(`Time of day: ${scene.time_of_day}`);
    }
    if (scene.mood) {
      sceneLines.push(`Scene mood: ${scene.mood}`);
    }
    if (scene.base_prompt) {
      sceneLines.push(scene.base_prompt);
    }
    if (scene.negative_prompt) {
      negative.push(scene.negative_prompt);
    }
  }

  const sections: string[] = ['# Image Specification'];

  if (characterLines.length > 0) {
    sections.push('');
    sections.push('## Character');
    sections.push(
      ...characterLines.map((line) => (line.startsWith('- ') ? line : `- ${line}`)),
    );
  }

  if (styleLines.length > 0) {
    sections.push('');
    sections.push('## Art Style');
    sections.push(
      ...styleLines.map((line) => (line.startsWith('- ') ? line : `- ${line}`)),
    );
  }

  if (sceneLines.length > 0) {
    sections.push('');
    sections.push('## Scene');
    sections.push(
      ...sceneLines.map((line) => (line.startsWith('- ') ? line : `- ${line}`)),
    );
  }

  const prompt = sections.join('\n').trim();
  const negativePrompt = negative.length > 0 ? negative.join('\n') : null;

  return { prompt, negativePrompt };
};

const getImageClient = (): GoogleGenAI => {
  if (!env.googleApiKey) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }
  return new GoogleGenAI({
    apiKey: env.googleApiKey,
  });
};

const normalizeSeed = (value?: number): number | undefined => {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  const int = Math.floor(value);
  // Force into signed 32-bit range, then make non-negative.
  const int32 = int | 0;
  return Math.abs(int32);
};

const logImageUsageEvent = async (params: {
  userId: number;
  spaceId: number;
  imageId: number | null;
  action: 'CREATE' | 'DELETE';
  modelName: string;
  seed?: number | null;
  s3Key?: string | null;
}): Promise<void> => {
  const db = getDbPool();
  const seedValue =
    params.seed !== undefined && params.seed !== null ? params.seed : null;
  const s3KeyValue =
    params.s3Key !== undefined && params.s3Key !== null ? params.s3Key : null;

  try {
    await db.query(
      `INSERT INTO image_usage_events (
        user_id,
        space_id,
        image_id,
        action,
        model_name,
        seed,
        s3_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        params.userId,
        params.spaceId,
        params.imageId,
        params.action,
        params.modelName,
        seedValue,
        s3KeyValue,
      ],
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[images] Failed to log usage event:', error);
  }
};

export const generateImageForUser = async (
  input: GenerateImageInput,
): Promise<ImageSummary> => {
  const db = getDbPool();

  await assertSpaceOwnedByUser(input.spaceId, input.userId);

  const [charRows] = await db.query(
    `SELECT cv.*, c.space_id
     FROM character_versions cv
       JOIN characters c ON cv.character_id = c.id
     WHERE cv.id = ? AND c.space_id = ?
     LIMIT 1`,
    [input.characterVersionId, input.spaceId],
  );
  const characterRowWithSpace =
    (charRows as (CharacterVersionPromptRow & { space_id: number })[])[0] ??
    null;
  if (!characterRowWithSpace) {
    throw new Error('CHARACTER_VERSION_NOT_FOUND');
  }

  const [styleRows] = await db.query(
    `SELECT sv.*, s.space_id, s.name AS style_name, s.description AS style_description
     FROM style_versions sv
       JOIN styles s ON sv.style_id = s.id
     WHERE sv.id = ? AND s.space_id = ?
     LIMIT 1`,
    [input.styleVersionId, input.spaceId],
  );
  const styleRowWithSpace =
    (styleRows as (StyleVersionPromptRow & { space_id: number })[])[0] ?? null;
  if (!styleRowWithSpace) {
    throw new Error('STYLE_VERSION_NOT_FOUND');
  }

  let sceneRowWithSpace: (SceneVersionPromptRow & { space_id: number }) | null =
    null;
  if (input.sceneVersionId) {
    const [sceneRows] = await db.query(
      `SELECT sv.*, s.space_id
       FROM scene_versions sv
         JOIN scenes s ON sv.scene_id = s.id
       WHERE sv.id = ? AND s.space_id = ?
       LIMIT 1`,
      [input.sceneVersionId, input.spaceId],
    );
    sceneRowWithSpace =
      (sceneRows as (SceneVersionPromptRow & { space_id: number })[])[0] ??
      null;
    if (!sceneRowWithSpace) {
      throw new Error('SCENE_VERSION_NOT_FOUND');
    }
  }

  const character = characterRowWithSpace as CharacterVersionPromptRow;
  const style = styleRowWithSpace as StyleVersionPromptRow;
  const scene = sceneRowWithSpace as SceneVersionPromptRow | null;

  let { prompt, negativePrompt } = buildPrompt(character, style, scene);
  if (!prompt) {
    const [charInfoRows] = await db.query(
      'SELECT name, description FROM characters WHERE id = ? LIMIT 1',
      [characterRowWithSpace.character_id],
    );
    const [styleInfoRows] = await db.query(
      'SELECT name, description FROM styles WHERE id = ? LIMIT 1',
      [styleRowWithSpace.style_id],
    );

    const charInfo = (charInfoRows as Array<{ name: string; description: string | null }>)[0];
    const styleInfo = (styleInfoRows as Array<{ name: string; description: string | null }>)[0];

    const fallbackLines: string[] = [];
    if (charInfo) {
      const charLine = charInfo.description
        ? `Character: ${charInfo.name} — ${charInfo.description}`
        : `Character: ${charInfo.name}`;
      fallbackLines.push(charLine);
    }
    if (styleInfo) {
      const styleLine = styleInfo.description
        ? `Style: ${styleInfo.name} — ${styleInfo.description}`
        : `Style: ${styleInfo.name}`;
      fallbackLines.push(styleLine);
    }

    prompt = fallbackLines.join('\n').trim();

    if (!prompt) {
      throw new Error('PROMPT_EMPTY');
    }
  }

  const client = getImageClient();

  const providedSeed = normalizeSeed(input.seed);
  const effectiveSeed =
    providedSeed !== undefined
      ? providedSeed
      : normalizeSeed(Math.floor(Math.random() * 0x7fffffff))!;

  try {
    // Log the final request shape going to Google's image model (without secrets).
    // eslint-disable-next-line no-console
    console.log('[images] Calling Google image model', {
      model: env.imageModel,
      userId: input.userId,
      spaceId: input.spaceId,
      characterVersionId: input.characterVersionId,
      styleVersionId: input.styleVersionId,
      sceneVersionId: input.sceneVersionId ?? null,
      seed: effectiveSeed,
      aspectRatio: input.aspectRatio ?? null,
      resolution: input.resolution ?? null,
      prompt,
      negativePrompt,
    });

    const stream: any = await client.models.generateContentStream({
      model: env.imageModel,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
        imageConfig: {
          imageSize: '1K',
        },
      },
    });

    let bytesBase64: string | undefined;
    let mimeType: string = 'image/png';

    // Consume the stream until we find an inline image.
    // eslint-disable-next-line no-restricted-syntax
    for await (const chunk of stream as AsyncGenerator<any>) {
      const candidates = (chunk as any).candidates ?? [];
      const parts = candidates[0]?.content?.parts ?? [];
      // eslint-disable-next-line no-restricted-syntax
      for (const part of parts) {
        const inline = (part as any).inlineData;
        if (inline && inline.data) {
          bytesBase64 = inline.data;
          if (inline.mimeType) {
            mimeType = inline.mimeType;
          }
          break;
        }
      }
      if (bytesBase64) {
        break;
      }
    }

    if (!bytesBase64) {
      throw new Error('IMAGE_BYTES_MISSING');
    }

    const buffer = Buffer.from(bytesBase64, 'base64');

    const now = new Date();
    const key = [
      'spaces',
      String(input.spaceId),
      'images',
      `${now.getTime()}_${effectiveSeed}.png`,
    ].join('/');

    await uploadImageToS3(key, buffer, mimeType);

    const [insertResult] = await db.query(
      `INSERT INTO images (
        space_id,
        character_version_id,
        style_version_id,
        scene_version_id,
        seed,
        model_name,
        aspect_ratio,
        resolution,
        prompt,
        negative_prompt,
        s3_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.spaceId,
        input.characterVersionId,
        input.styleVersionId,
        input.sceneVersionId ?? null,
        effectiveSeed,
        env.imageModel,
        input.aspectRatio ?? null,
        input.resolution ?? null,
        prompt,
        negativePrompt,
        key,
      ],
    );
    const insert = insertResult as { insertId?: number };
    const imageId = insert.insertId;
    if (!imageId) {
      throw new Error('IMAGE_INSERT_FAILED');
    }

    const [rows] = await db.query(
      'SELECT * FROM images WHERE id = ? LIMIT 1',
      [imageId],
    );
    const imageRow = (rows as any[])[0];
    const createdAt =
      imageRow && imageRow.created_at instanceof Date
        ? imageRow.created_at.toISOString()
        : now.toISOString();

    const s3Url =
      env.s3.bucket && env.s3.region
        ? `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${key}`
        : undefined;

    const cloudfrontUrl = getSignedImageUrl(key);

    const summary: ImageSummary = {
      id: imageId,
      spaceId: input.spaceId,
      characterVersionId: input.characterVersionId,
      styleVersionId: input.styleVersionId,
      sceneVersionId: input.sceneVersionId ?? null,
      seed: effectiveSeed,
      prompt,
      negativePrompt,
      s3Key: key,
      s3Url,
      cloudfrontUrl,
      createdAt,
    };

    await logImageUsageEvent({
      userId: input.userId,
      spaceId: input.spaceId,
      imageId,
      action: 'CREATE',
      modelName: env.imageModel,
      seed: effectiveSeed,
      s3Key: key,
    });

    return summary;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[images] Generate error:', error);
    throw error;
  }
};

export const listImagesForSpace = async (
  userId: number,
  spaceId: number,
): Promise<ImageSummary[]> => {
  const db = getDbPool();

  await assertSpaceOwnedByUser(spaceId, userId);

  const [rows] = await db.query(
    'SELECT * FROM images WHERE space_id = ? ORDER BY created_at DESC',
    [spaceId],
  );
  const list = rows as any[];

  return list.map((row) => {
    const s3Key: string = row.s3_key;
    const createdAtValue = row.created_at;
    const createdAt =
      createdAtValue instanceof Date
        ? createdAtValue.toISOString()
        : new Date().toISOString();

    const s3Url =
      env.s3.bucket && env.s3.region
        ? `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${s3Key}`
        : undefined;

    const cloudfrontUrl = getSignedImageUrl(s3Key);

    return {
      id: row.id,
      spaceId: row.space_id,
      characterVersionId: row.character_version_id,
      styleVersionId: row.style_version_id,
      sceneVersionId: row.scene_version_id,
      seed: typeof row.seed === 'number' ? row.seed : 0,
      prompt: row.prompt,
      negativePrompt: row.negative_prompt,
      s3Key,
      s3Url,
      cloudfrontUrl,
      createdAt,
    };
  });
};

export const deleteImageForUser = async (
  userId: number,
  spaceId: number,
  imageId: number,
): Promise<boolean> => {
  const db = getDbPool();

  await assertSpaceOwnedByUser(spaceId, userId);

  const [rows] = await db.query(
    'SELECT id, space_id, s3_key, seed, model_name, deleted_at FROM images WHERE id = ? AND space_id = ? LIMIT 1',
    [imageId, spaceId],
  );
  const list = rows as Array<{
    id: number;
    space_id: number;
    s3_key: string;
    seed: number;
    model_name: string;
    deleted_at: Date | null;
  }>;

  const image = list[0];
  if (!image) {
    return false;
  }

  if (image.deleted_at) {
    return false;
  }

  await db.query(
    'UPDATE images SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
    [imageId],
  );

  await deleteObjectFromS3(image.s3_key);

  await logImageUsageEvent({
    userId,
    spaceId,
    imageId,
    action: 'DELETE',
    modelName: image.model_name,
    seed: image.seed,
    s3Key: image.s3_key,
  });

  return true;
};
