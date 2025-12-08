# Implementation Plan: Structured Character Appearance & Lore Fields

## 1. Overview
Goal: Replace the current minimal character create/clone fields (name + description) with a structured appearance/lore system driven by the new configuration files, so that characters have rich, consistent identity data (core identity, facial structure, hair, skin, physique, markers, clothing, lore, reference images) that can be used for prompt building and future workflows.

In scope:
- Define and persist a structured appearance payload for character versions (using the config in `server/src/config/characterAppearance/` as the source of truth).
- Add backend storage for appearance data (likely a JSON column on `character_versions`) and, where appropriate, migrate prompt-building logic to read from it.
- Expose the appearance configuration to the frontend via an API endpoint.
- Replace the current character create/clone UI with a form that renders fields from the config (including tags with seeded options and custom entries).
- Ensure cloning behavior pre-fills structured appearance values when creating a new character via `/spaces/:spaceId/characters/new?from=...`.

Out of scope (for this plan):
- In-app editing of the appearance configuration itself (categories/properties/options remain code-driven for now).
- Backward compatibility with existing characters or generated images (we can reset or drop old character data as needed).
- Full visual polish of the multi-section form; we’ll keep the UI clean but functional and defer advanced styling.

---

## 2. Step-by-Step Plan

1. Define the persistence model for structured appearance data  
Status: Completed  
Testing: Appearance data will be stored on `character_versions` in a JSON column named `appearance_json`, using a parsed JSON object in the API with the following shape:  
- DB/storage shape (per version):  
  - Column: `appearance_json` (MySQL `JSON` where available, otherwise `TEXT` containing JSON).  
  - Value shape:  
    - `appearance: { [categoryKey: string]: { [propertyKey: string]: string | string[] } }`  
    - `categoryKey` corresponds to `AppearanceCategory.key` from `CharacterAppearanceConfig`.  
    - `propertyKey` corresponds to `AppearanceProperty.key` within that category.  
    - For `type: 'string'` and `type: 'enum'`, values are stored as a single `string`.  
    - For `type: 'tags'`, values are stored as `string[]`, where each string is either a known option `value` or a custom tag (when `allowCustom` is true).  
- API shape (per character version):  
  - Serialized to the client as a parsed JSON object field, e.g. `appearance`, not as a raw string.  
  - The client will also fetch `CharacterAppearanceConfig` from the backend and use it, along with `appearance`, to render and prefill the long-form UI (one section per category, ordered by `category.order`).  
- Defaulting/empty state:  
  - When a new character version is created, `appearance_json` may be initialized to either an empty object `{}` or a config-shaped structure with empty values (implementation detail for Step 4).  
  - Absence of a category or property key in `appearance` means “no value set yet” for that field.  
This model cleanly handles free-text fields, single-choice enums, and multi-tag fields, and it is stable enough to support future UI refinements (e.g., multi-step or tabbed forms) without changing the backend representation.  
Checkpoint: Wait for developer approval before proceeding.

2. Update the database schema to add appearance storage for character versions  
Status: Completed  
Testing: Added an `appearance_json` column to `character_versions` in `db/migrations.sql` via `ALTER TABLE character_versions ADD COLUMN IF NOT EXISTS appearance_json JSON NOT NULL DEFAULT ('{}') AFTER extra_notes;` and applied the migration to the local `graphics` database using `sudo mysql graphics < db/migrations.sql`. Confirmed via `SHOW COLUMNS FROM character_versions;` that `appearance_json` exists with default `'{}'`.  
Checkpoint: Wait for developer approval before proceeding.

3. Expose the appearance configuration via a backend API endpoint  
Status: Completed  
Testing: Added a new Express route in `server/src/index.ts` that handles `GET /api/character-appearance-config` and returns the exported `characterAppearanceConfig` from `server/src/config/characterAppearance/index.ts` as JSON. Ran `npm run build` in `server/` to ensure the server compiles with the new import and route. The response payload is static configuration (categories/properties/options) with no secrets.  
Checkpoint: Wait for developer approval before proceeding.

4. Implement a reusable appearance form model on the client  
Status: Completed  
Testing: Added `client/src/api/characterAppearance.ts` with client-side types mirroring the backend config (`CharacterAppearanceConfig`, `AppearanceCategory`, `AppearanceProperty`, etc.), an `AppearanceValues` model shaped as `{ [categoryKey]: { [propertyKey]: string | string[] } }`, and helpers: `fetchCharacterAppearanceConfig` (calls `GET /api/character-appearance-config`), `createEmptyAppearanceValues` (builds an in-memory value object from the config), `buildInitialAppearanceValues` (merges existing values with config defaults), and `serializeAppearanceValues` (trims/filters empty values and returns a JSON-ready object for `appearance_json`). Ran `npm run build` in `client/` to confirm the new module compiles.  
Checkpoint: Wait for developer approval before proceeding.

5. Replace CharacterCreatePage form with config-driven fields  
Status: Completed  
Testing: Updated `CharacterCreatePage` (`client/src/pages/CharacterCreatePage.tsx`) to fetch `CharacterAppearanceConfig` via `fetchCharacterAppearanceConfig`, maintain `AppearanceValues` state, and render a long-form, config-driven appearance form: strings as textareas, enums as selects populated from `options`, and tags as a comma-separated text input. On submit, the page now serializes values with `serializeAppearanceValues` and calls `createCharacter` with both `name` and `appearance`. On the backend, `NewCharacterInput` in `server/src/characters/service.ts` now includes an `appearance` payload, and `createCharacterForSpace` writes it into the `appearance_json` column when inserting the first `character_versions` row. Server and client builds pass, and `SHOW COLUMNS FROM character_versions;` confirms the `appearance_json` column is present and non-null; existing rows default to `'{}'`, ready for new structured data.  
Checkpoint: Wait for developer approval before proceeding.

6. Wire clone behavior to pre-fill structured appearance  
Status: Completed  
Testing: Updated `CharacterVersionDetail` on the server (`server/src/characters/service.ts`) to expose a parsed `appearance` object by reading `appearance_json` for each version, and extended `getCharacterWithVersions` to include it. The clone API (`cloneCharacterVersion`) now copies `appearance_json` from the source version when inserting a new row. On the client, `CharacterVersionDetail` in `client/src/api/characters.ts` gained an optional `appearance` field, and `CharacterCreatePage` was updated so that when `/spaces/:spaceId/characters/new?from=<characterId>` is hit, it uses `fetchCharacterWithVersions` to load the source character, sets the name/description from that payload, and seeds `AppearanceValues` with the latest version’s `appearance` via `buildInitialAppearanceValues`. The form then submits a serialized appearance object to the backend, creating a new character with copied structured appearance while leaving the original unchanged. Server and client builds pass after these changes.  
Checkpoint: Wait for developer approval before proceeding.

7. Integrate structured appearance into prompt building for images  
Status: Completed  
Testing: Updated `server/src/images/service.ts` to (a) extend `CharacterVersionPromptRow` with an optional `appearance_json` field, (b) import `characterAppearanceConfig` and `CharacterAppearanceValues`, and (c) add `buildAppearanceLines`, which parses `appearance_json` into a `{ [categoryKey]: { [propertyKey]: string | string[] } }` object and walks selected categories (`core_identity`, `facial_structure`, `hair`, `skin`, `physique`, `distinctive_markers`, `clothing_defaults`, `character_lore`) plus their properties to produce human-readable lines of the form `Category Label: Prop Label: value; ...`. `buildPrompt` now calls `buildAppearanceLines` for the character and appends those lines after the existing free-text character fields but before any custom `base_prompt`, so structured appearance enriches prompts without removing legacy fields or the fallback description behavior. Ran `npm run build` in `server/` to confirm the changes compile.  
Checkpoint: Wait for developer approval before proceeding.

8. Clean up legacy character fields and update documentation/handoff  
Status: Pending  
Testing: Remove or de-emphasize legacy character description fields that are superseded by structured appearance (where safe, given we are early and can reset data). Run `npm run build` in both `server` and `client`, then manually exercise character create/clone and image generation flows. Update `agents/handoff/handoff_03.md` and any relevant plans to note that character appearance is now structured and tied to the config.  
Checkpoint: Wait for developer approval before proceeding.

---

## 3. Progress Tracking Notes

- Step 1 — Status: Completed.  
- Step 2 — Status: Completed.  
- Step 3 — Status: Completed.  
- Step 4 — Status: Completed.  
- Step 5 — Status: Completed.  
- Step 6 — Status: Completed.  
- Step 7 — Status: Completed.  
- Step 8 — Status: Pending.
