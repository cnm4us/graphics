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
Status: Pending  
Testing: Document in this plan how appearance data will be stored on `character_versions` (e.g., JSON column with a `{ [categoryKey]: { [propertyKey]: value } }` shape) and how it maps to the config keys; verify the model handles tags, enums, and free text consistently.  
Checkpoint: Wait for developer approval before proceeding.

2. Update the database schema to add appearance storage for character versions  
Status: Pending  
Testing: Add a JSON (or TEXT) column to `character_versions` (e.g., `appearance_json`) via migration; apply the migration locally and confirm new character rows can be created with a non-null JSON payload, and that old rows (if any) are either dropped or updated according to the agreed reset strategy.  
Checkpoint: Wait for developer approval before proceeding.

3. Expose the appearance configuration via a backend API endpoint  
Status: Pending  
Testing: Implement a simple `GET /api/character-appearance-config` route that returns `characterAppearanceConfig` (categories/properties/options) in JSON; hit it from curl/Postman to verify the payload structure matches the types and that it’s safe for client consumption (no secrets, only static config).  
Checkpoint: Wait for developer approval before proceeding.

4. Implement a reusable appearance form model on the client  
Status: Pending  
Testing: Create client-side types mirroring the appearance config and an in-memory representation of a character’s appearance values (e.g., `{ [categoryKey]: { [propertyKey]: value | string[] } }`). Build a small helper to initialize default values from the config and serialize back to a JSON shape suitable for the backend. Verify, in dev tools or console, that editing fields updates this structure as expected.  
Checkpoint: Wait for developer approval before proceeding.

5. Replace CharacterCreatePage form with config-driven fields  
Status: Pending  
Testing: On `/spaces/:spaceId/characters/new`, render the form sections based on the config: strings as text inputs/areas, enums as selects, and tags as chip-style multi-selects with seeded options and custom entry support (e.g., for `strengths`). On submit, send both the basic identity (name) and the appearance JSON to the backend. Confirm that creating a new character results in a persisted `appearance_json` row that matches the form input.  
Checkpoint: Wait for developer approval before proceeding.

6. Wire clone behavior to pre-fill structured appearance  
Status: Pending  
Testing: When hitting `/spaces/:spaceId/characters/new?from=<characterId>`, fetch the source character’s appearance JSON from the backend and use it to pre-populate the form (including tags). Verify that saving creates a new character with copied appearance values (unless changed) and that the original character remains unchanged. Confirm this works for multiple categories, not just core identity.  
Checkpoint: Wait for developer approval before proceeding.

7. Integrate structured appearance into prompt building for images  
Status: Pending  
Testing: Extend the prompt builder in `server/src/images/service.ts` to optionally read from `appearance_json` (when present) and construct lines based on categories/properties (e.g., core identity + facial structure + hair) in addition to, or instead of, existing free-text fields. Generate a few images and confirm that the logged prompt includes the expected structured details (name, age range, body type, etc.).  
Checkpoint: Wait for developer approval before proceeding.

8. Clean up legacy character fields and update documentation/handoff  
Status: Pending  
Testing: Remove or de-emphasize legacy character description fields that are superseded by structured appearance (where safe, given we are early and can reset data). Run `npm run build` in both `server` and `client`, then manually exercise character create/clone and image generation flows. Update `agents/handoff/handoff_03.md` and any relevant plans to note that character appearance is now structured and tied to the config.  
Checkpoint: Wait for developer approval before proceeding.

---

## 3. Progress Tracking Notes

- Step 1 — Status: Pending.  
- Step 2 — Status: Pending.  
- Step 3 — Status: Pending.  
- Step 4 — Status: Pending.  
- Step 5 — Status: Pending.  
- Step 6 — Status: Pending.  
- Step 7 — Status: Pending.  
- Step 8 — Status: Pending.

