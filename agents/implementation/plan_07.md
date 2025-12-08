# Implementation Plan: Structured Style Definitions & Prompt Integration

## 1. Overview
Goal: Introduce a config-driven, structured style definition system (parallel to structured character appearance) and wire it into styles, so that style versions have rich, consistent data (render domain, line and detail, color and lighting, rendering technique, composition/camera, mood/atmosphere) that the UI can edit and the image prompt builder can reliably incorporate alongside character appearance.

In scope:
- Finalize and document the `styleDefinitionConfig` schema under `server/src/config/styleDefinitions/`.
- Add backend storage for structured style definitions (e.g., a JSON column on `style_versions`) and ensure new/updated styles persist a `{ [categoryKey]: { [propertyKey]: string | string[] } }` payload.
- Expose the style definition configuration to the frontend via an API endpoint.
- Implement a config-driven style create/edit UI (parallel to `CharacterCreatePage`) that uses enums + tag pill selectors and supports basic incompatibility metadata for tags.
- Update the image prompt builder to consume structured style definitions and emit a clear “Art Style” section aligned with the Markdown-based prompt format already in use.

Out of scope (for this plan):
- Historical migration of existing style rows into the structured model (we can treat early data as disposable or migrate minimally during implementation).
- Advanced validation UX (e.g., sophisticated conflict resolution beyond simple “incompatibleWith” checks).
- Scene and camera rework; the plan focuses on styles, not scene definitions.

---

## 2. Step-by-Step Plan

1. Lock and document the styleDefinitionConfig schema  
Status: Completed  
Testing: The current style schema under `server/src/config/styleDefinitions/` defines six non-overlapping dimensions:  
- `core_style` (render_domain, genre, influences) — high-level render family and genre focus.  
- `line_and_detail` (line_weight, line_quality, detail_level) — line treatment and density of visual detail.  
- `color_and_lighting` (color_palette, saturation, lighting_style) — palette families, saturation level, and lighting character.  
- `rendering_technique` (shading, texture, surface_finish) — how forms are shaded and how surfaces read (flat vs cel vs painterly, smooth vs textured).  
- `composition_and_camera` (camera_style, focal_length, composition_notes) — framing tendencies and lens feel.  
- `mood_and_atmosphere` (mood_keywords, atmosphere) — emotional tone and environmental cues.  
Structured style values will follow the same shape as character appearance:  
- `styleDefinition = { [categoryKey: string]: { [propertyKey: string]: string | string[] } }`  
- Each `categoryKey` maps to one of the above style categories.  
- Each `propertyKey` corresponds to a property within that category; enums are stored as a single string, tags as `string[]`.  
Existing style model fields on `style_versions` (`art_style`, `color_palette`, `lighting`, `camera`, `render_technique`, `negative_prompt`) will be treated as legacy/free-text helpers:  
- Some structured properties intentionally overlap conceptually (e.g., `color_and_lighting.color_palette` vs `style_versions.color_palette`), but they will not share column names in the DB; the structured JSON will live in a new `style_definition_json` column.  
- During integration (later steps), we can choose to seed structured values from legacy fields or phase the legacy fields out of prompt construction in favor of the richer structured config.  
Checkpoint: Wait for developer approval before proceeding.

2. Add backend storage for structured style definitions on style_versions  
Status: Completed  
Testing: Extended `db/migrations.sql` with a `style_definition_json` column on `style_versions` via:  
`ALTER TABLE style_versions ADD COLUMN IF NOT EXISTS style_definition_json JSON NOT NULL DEFAULT ('{}') AFTER render_technique;`  
Applied the migration to the local `graphics` database using `sudo mysql graphics < db/migrations.sql` and confirmed via `SHOW COLUMNS FROM style_versions;` that `style_definition_json` exists with default `'{}'` (backed by a JSON/longtext type). Updated `StyleVersionRecord` in `server/src/styles/service.ts` to include an optional `style_definition_json?: string | null` so TypeScript reflects the DB schema. Ran `npm run build` in `server/` to ensure the change compiles; existing style creation still works, with `style_definition_json` defaulting to `'{}'` for now.  
Checkpoint: Wait for developer approval before proceeding.

3. Expose styleDefinitionConfig via a backend API endpoint  
Status: Completed  
Testing: Added a `GET /api/style-definition-config` route in `server/src/index.ts` that returns `styleDefinitionConfig` from `server/src/config/styleDefinitions/index.ts` as JSON. Ran `npm run build` in `server/` to confirm the server compiles with the new import and route. In a running environment, this endpoint will expose only static configuration (categories/properties/options) with no secrets, analogous to the existing `character-appearance-config` endpoint.  
Checkpoint: Wait for developer approval before proceeding.

4. Extend style services to persist style_definition_json for new and updated styles  
Status: Completed  
Testing: Updated `server/src/styles/service.ts` to add `style_definition_json?: string | null` to `StyleVersionRecord` and to extend `NewStyleInput` with an optional `styleDefinition?: { [categoryKey: string]: { [propertyKey: string]: string | string[] } }`. Style creation now computes a `styleDefinitionJson` string (JSON of the object or `{}`) and includes it in the `INSERT INTO style_versions (...)` statement targeting the new `style_definition_json` column; style version cloning now copies `style_definition_json` from the source version (or `{}` if absent). Updated `server/src/styles/routes.ts` to accept an optional `styleDefinition` object in the POST body for `/api/spaces/:spaceId/styles` and pass it through to `NewStyleInput`. Ran `npm run build` in `server/` to ensure types and queries compile; verified via `SHOW COLUMNS FROM style_versions;` that the column exists, and manual reasoning confirms that new styles will default `style_definition_json` to `'{}'` unless/​until the client starts sending structured definitions.  
Checkpoint: Wait for developer approval before proceeding.

5. Implement client style definition types and helpers  
Status: Completed  
Testing: Added `client/src/api/styleDefinitions.ts` with client-side types mirroring the backend style definition config (`StyleDefinitionConfig`, `StyleCategory`, `StyleProperty`, `StyleOption`, `StylePropertyType`) and an in-memory representation `StyleValues = { [categoryKey: string]: { [propertyKey: string]: string | string[] } }`. Implemented helpers: `fetchStyleDefinitionConfig` (calls `GET /api/style-definition-config`), `createEmptyStyleValues` (initializes empty values from the config, using `[]` for tags and `''` for strings/enums), `buildInitialStyleValues` (merges an existing style definition object into the config-shaped model, normalizing tags to `string[]`), and `serializeStyleValues` (trims and filters values and returns a JSON-ready object suitable for `style_definition_json`). Ran `npm run build` in `client/` to confirm the new module compiles.  
Checkpoint: Wait for developer approval before proceeding.

6. Replace StylesPage form with a config-driven style editor (create + edit)  
Status: Completed  
Testing: Updated `StylesPage` so that style creation uses the style config: enums render as selects, tags use a pill selector UI (mirroring `CharacterCreatePage`), and plain strings use textareas. The form now fetches `styleDefinitionConfig` via `fetchStyleDefinitionConfig` from `client/src/api/styleDefinitions.ts`, manages `StyleValues` state (including per-field tag input buffers), and on submit serializes values with `serializeStyleValues` and sends them as `styleDefinition` alongside `name` and `description` in the `createStyle` payload. After a successful create, it resets both the basic fields and structured values using `createEmptyStyleValues`. The form container was widened to `maxWidth: 720` so sections spread to roughly half the page width, matching the character form layout. Verified via `npm run build` in `client/` that the UI compiles and manual reasoning confirms that new styles will persist structured definitions into `style_definition_json`.  
Checkpoint: Wait for developer approval before proceeding.

7. Add basic incompatibility metadata and UI feedback for style tags  
Status: Pending  
Testing: Extend `StyleOption` to support an `incompatibleWith?: string[]` field and add at least a couple of concrete examples (e.g., `bold_colors` incompatible with `muted`). In the style editor UI, detect when a user selects a tag that conflicts with already-selected tags and surface a small inline warning (and/or auto-deselect the conflicting tag via a simple rule). Confirm that the UI never submits obviously contradictory combinations and that the stored JSON reflects the resolved selections.  
Checkpoint: Wait for developer approval before proceeding.

8. Integrate structured style definitions into the Markdown prompt builder  
Status: Pending  
Testing: Update the style portion of `buildPrompt` in `server/src/images/service.ts` to optionally read from `style_definition_json` (when present) and construct “Art Style” bullet lines based on the style categories/properties, in addition to the existing style name/description line. Generate images using different styles (comic, painterly, photorealistic) and inspect the logged prompts to confirm that the `## Art Style` section is populated with coherent, non-contradictory details from the structured style definition, and that it interacts well with the existing character and scene sections.  
Checkpoint: Wait for developer approval before proceeding.

9. Clean up legacy style fields and update documentation/handoff  
Status: Pending  
Testing: Where appropriate, reduce reliance on legacy free-text style fields (`art_style`, `color_palette`, etc.) in favor of the structured style definition, while ensuring backward compatibility for any existing data that still depends on them. Run `npm run build` in both `server` and `client`, then exercise the full flow: create/edit styles, generate images, and confirm prompts reflect the structured style data. Update `agents/handoff/handoff_04.md` (or the current handoff file) and relevant implementation plans to note that styles are now config-driven and integrated into the prompt builder.  
Checkpoint: Wait for developer approval before proceeding.

---

## 3. Progress Tracking Notes

- Step 1 — Status: Completed.  
- Step 2 — Status: Completed.  
- Step 3 — Status: Completed.  
- Step 4 — Status: Completed.  
- Step 5 — Status: Completed.  
- Step 6 — Status: Completed.  
- Step 7 — Status: Pending.  
- Step 8 — Status: Pending.  
- Step 9 — Status: Pending.
