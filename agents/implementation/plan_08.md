# Implementation Plan 08: Style Editing, Cloning, and Immutability

## 1. Overview

Goal: Introduce a consistent edit/clone workflow for styles that mirrors characters, while enforcing immutability once a style has been used for image generation. Authors should be able to:
- Create new styles using the structured style definition config.
- Edit styles freely *until* any image has been generated with that style.
- After first use, treat the style as immutable and require users to clone it to make changes, preserving a clean audit trail from each image back to the original component parts (character, style, scene).

In scope:
- Backend support for updating styles with an immutability guard, using the images table as the source of truth for “style has been used”.
- Extending style detail APIs to expose structured style definitions for use in edit/clone/view flows.
- Client-side edit and clone flows:
  - Show an Edit button only for styles that have not been used in any image.
  - Show only View and Clone for styles that *have* been used.
  - Use a shared config-driven style form for both create and edit, with appropriate button text (“Create style” vs “Save”).
- A read-only style view page (similar to CharacterViewPage) that displays the structured style definition.

Out of scope:
- Historical migration of existing styles beyond what is required to support editing and cloning (existing styles without structured style definitions will continue to behave with minimal/empty structured data).
- Multi-version editing semantics (we treat the style as a single unit; once *any* version is used, the style is locked from further edits via the edit form).
- Advanced style version management UI (this plan focuses on style-level edit/clone, not on deep per-version editing).

---

## 2. Step-by-Step Plan

1. Define style immutability semantics and invariants  
Status: Completed  
Testing: Clarify and codify the rules in code comments and types:  
- A style is *editable* only if no image row exists with a `style_version_id` that belongs to that style.  
- Once a style has been used in at least one image, subsequent attempts to edit it via the style edit endpoint must fail with a dedicated error (e.g., `STYLE_HAS_GENERATED_IMAGES`).  
- Cloning a style always creates a *new* style record with its own initial style version and structured style definition, ensuring that each image can be traced to the exact style definition used at generation time.  
No functional changes; this step is conceptual and documented alongside implementation in later steps.

2. Add backend style update endpoint with immutability guard  
Status: Completed  
Testing:  
- In `server/src/styles/service.ts`, introduce an `UpdateStyleInput` type mirroring `NewStyleInput` (name, description, plus optional structured `styleDefinition`) and a new `updateStyleForSpace(spaceId, styleId, input)` function that:  
  - Verifies the style belongs to the space.  
  - Finds the latest `style_versions` row for that style.  
  - Checks `images` for any row with `style_version_id` belonging to this style (or at least the latest version). If any exist, throw an `Error('STYLE_HAS_GENERATED_IMAGES')`.  
  - If editable, update `styles.name` / `styles.description` and, when provided, overwrite `style_definition_json` on the latest version with the serialized `styleDefinition`.  
  - Return a `StyleSummary` with updated `latestVersion` info.  
- In `server/src/styles/routes.ts`, add `PATCH /api/spaces/:spaceId/styles/:styleId` that:  
  - Validates `spaceId` and `styleId`.  
  - Checks auth and calls `assertSpaceOwnedByUserForStyles`.  
  - Parses an `UpdateStyleInput`-shaped body (name, description, optional styleDefinition).  
  - Calls `updateStyleForSpace` and returns `{ style }` on success.  
  - Maps `STYLE_HAS_GENERATED_IMAGES` to a 400 error with `{ error: 'STYLE_HAS_GENERATED_IMAGES' }`; other errors become 500.  
Verify via unit reasoning and manual DB inspection (if needed) that editing a style that has images is rejected while editing a never-used style updates both metadata and `style_definition_json`.

3. Extend style detail API to expose structured styleDefinition  
Status: Completed  
Testing:  
- In `server/src/styles/service.ts`, extend `StyleVersionDetail` to include an optional `styleDefinition?: Record<string, Record<string, string | string[]>> | null`.  
- In `getStyleWithVersions`, parse `style_definition_json` for each version (similar to how character appearance is parsed) and populate `styleDefinition` with the structured object, falling back to `{}` or `null` when parsing fails or data is absent.  
- In `client/src/api/styles.ts`, update `StyleVersionDetail` accordingly to mirror the server type (using `StyleValues` from `styleDefinitions.ts`), and ensure `fetchStyleWithVersions` returns a `style.versions` array where the latest version includes its `styleDefinition`.  
Run `npm run build` in `server/` and `client/` to confirm types are aligned and consumers compile.

4. Add client API helper for updating styles  
Status: Completed  
Testing:  
- In `client/src/api/styles.ts`, add:  
  - An `UpdateStylePayload` type: `{ name?: string; description?: string; styleDefinition?: StyleValues; }`.  
  - An `updateStyle(spaceId: number, styleId: number, payload: UpdateStylePayload): Promise<StyleSummary>` that issues a `PATCH` to `/api/spaces/${spaceId}/styles/${styleId}` with JSON body.  
  - Handle `STYLE_HAS_GENERATED_IMAGES` by allowing the caller to inspect the thrown error message.  
Use TypeScript to validate the new API and confirm `StyleSummary` is reused consistently for create/update responses.

5. Implement StyleViewPage (read-only style definition view)  
Status: Completed  
Testing:  
- Add `client/src/pages/StyleViewPage.tsx` that:  
  - Route: `/spaces/:spaceId/styles/:styleId`.  
  - Loads the space (via `fetchSpaces`) and the style detail with versions (via `fetchStyleWithVersions`), plus `styleDefinitionConfig` (via `fetchStyleDefinitionConfig`).  
  - Identifies the latest version and uses `buildInitialStyleValues` or equivalent logic to map `version.styleDefinition` into a config-shaped `StyleValues`.  
  - Renders a read-only layout analogous to `CharacterViewPage`: sections per style category, showing enum labels, tag pills, and plain string fields as text only (no inputs).  
- Wire the `View` button in `StylesPage` to navigate to this route.  
Confirm visually that `View` shows the same structured style details that drive the prompt and form, without allowing edits.

6. Extend StyleCreatePage to support create, clone, and edit modes  
Status: Completed  
Testing:  
- In `client/src/pages/StyleCreatePage.tsx`, introduce query-parameter–based modes mirroring `CharacterCreatePage`:  
  - `?from=<styleId>` → clone mode (new style based on existing).  
  - `?from=<styleId>&mode=edit` → edit mode for an existing style.  
- For both clone and edit:  
  - Load `fetchStyleWithVersions(spaceId, fromStyleId)` and pick the latest version.  
  - Use `styleDefinitionConfig` + `buildInitialStyleValues(config, latest.styleDefinition)` to seed `styleValues`.  
  - Initialize `name` / `description` from the base style; optionally adjust the name for clone (e.g., append “copy” in the UI only).  
- On submit:  
  - If `mode=edit`:  
    - Call `updateStyle(spaceId, fromStyleId, { name, description, styleDefinition: serialized })`.  
    - If the server responds with `STYLE_HAS_GENERATED_IMAGES`, surface a clear error (“This style already has generated images and cannot be edited.”) and do not navigate.  
    - Use button label “Save” in edit mode.  
  - Otherwise (create/clone mode):  
    - Call `createStyle(spaceId, { name, description, styleDefinition: serialized })`.  
    - Use button label “Create style”.  
  - On success, navigate back to `/spaces/${spaceId}/styles`.  
Verify via manual testing that:  
  - Editing a never-used style updates in place and returns to the list with updated name/description.  
  - Editing a used style is blocked with the appropriate error.  
  - Cloning always creates a new style, even when the source style has images.

7. Compute style “has images” status on the client for button visibility  
Status: Completed  
Testing:  
- In `client/src/pages/StylesPage.tsx`, mirror the approach used for characters by:  
  - Importing `fetchImagesForSpace` and loading images alongside styles when `selectedSpaceId` is set.  
  - Implementing `styleHasImage(style: StyleSummary): boolean` that locates the style’s latest version ID (if any) and checks whether any image in that space has `styleVersionId === latestVersion.id`.  
  - Only render the `Edit` button when `styleHasImage(style) === false`.  
  - Always render `View` and `Clone` (clone remains valid even for used styles).  
- Wire the buttons:  
  - `View` → `/spaces/${spaceId}/styles/${style.id}`.  
  - `Edit` → `/spaces/${spaceId}/styles/new?from=${style.id}&mode=edit`.  
  - `Clone` → `/spaces/${spaceId}/styles/new?from=${style.id}`.  
Check that the list behavior matches the intended UX:  
  - Styles with no images show View, Edit, Clone.  
  - Styles with images show View and Clone only.

8. Ensure server-side immutability matches UI behavior and is robust  
Status: Completed  
Testing:  
- Confirm that the backend `updateStyleForSpace` rejects edits when any `images` row references a version of the style, even if the client mistakenly shows an Edit button (stale images list, etc.).  
- Add logging or clear error messages when `STYLE_HAS_GENERATED_IMAGES` is thrown to aid debugging.  
- Verify via manual DB changes (or controlled generation) that after generating at least one image with a style, subsequent edit attempts fail on the backend while clone flows continue to work.  
Run `npm run build` for both `server/` and `client/` after implementation.

9. Update handoff notes and (if needed) documentation  
Status: Completed  
Testing:  
- Update `agents/handoff/handoff_04.md` (or the latest handoff file) with a short summary of the completed style edit/clone/immutability behavior and any follow-up work.  
- If the style editing API or workflows materially affect developers, update any relevant docs (e.g., a project README or a developer guide) to describe:  
  - The new `PATCH /api/spaces/:spaceId/styles/:styleId` endpoint and its immutability rule.  
  - The client-side edit/clone behavior and error semantics (`STYLE_HAS_GENERATED_IMAGES`).  
No code changes in this step; it is purely documentation and handoff.

---

## 3. Progress Tracking Notes

- Step 1 — Status: Completed.  
- Step 2 — Status: Completed.  
- Step 3 — Status: Completed.  
- Step 4 — Status: Completed.  
- Step 5 — Status: Completed.  
- Step 6 — Status: Completed.  
- Step 7 — Status: Completed.  
- Step 8 — Status: Completed.  
- Step 9 — Status: Completed.
