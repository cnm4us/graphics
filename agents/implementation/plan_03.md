# Implementation Plan: Normalize Space Routes and Page Responsibilities

## 1. Overview
Goal: Align both backend API routes and frontend pages with a clear collection/detail separation for spaces (e.g., `/spaces` vs `/spaces/:id`), so that each page has the correct feature set, URLs are stable and shareable, and space-specific behavior no longer depends on fragile in-memory state or query params.

In scope:
- Backend API route adjustments for spaces to follow RESTful patterns (list/create vs detail/edit/delete/clone).
- Frontend routing changes to introduce a dedicated spaces list page and a per-space detail view driven by `:spaceId` in the URL.
- Minimal wiring to keep existing character/style/scene/image features working within the new per-space route.
- Identifying where UI behavior should move from the generic dashboard into the new `/spaces` and `/spaces/:spaceId` pages.

Out of scope (for this plan):
- Deep redesign of the visual layout or styling of the dashboard.
- Major changes to the underlying data model for spaces, characters, styles, scenes, or images.
- Implementing new domain features beyond what already exists (e.g., new generators, advanced permissions).

---

## 2. Step-by-Step Plan

1. Document current routes and page responsibilities  
Status: Completed  
Testing: N/A (documentation step). Verify that the plan captures how `/dashboard`, `/spaces`, `/generate`, `/characters`, `/styles`, and `/scenes` currently map to components and which APIs they call.  
Checkpoint: Wait for developer approval before proceeding.

2. Introduce backend space detail and update routes  
Status: Pending  
Testing: After adding `GET /api/spaces/:id` and `PATCH /api/spaces/:id`, use curl/Postman to confirm that a space owned by the current user can be fetched and updated (name/description) and that unauthorized/foreign spaces are rejected.  
Checkpoint: Wait for developer approval before proceeding.

3. Add backend space clone endpoint  
Status: Pending  
Testing: Call `POST /api/spaces/:id/clone` with a space that has characters/styles/scenes; verify that a new space is created for the same user and that selected related entities are cloned as intended, without mutating the original space.  
Checkpoint: Wait for developer approval before proceeding.

4. Create a dedicated SpacesListPage for `/spaces`  
Status: Completed  
Testing: Run the frontend dev server and navigate to `/spaces`; verify that it shows the list of spaces, allows creating a space, and provides navigation actions (e.g., “Open space”, “Clone”, “Delete”) without breaking existing behavior elsewhere.  
Checkpoint: Wait for developer approval before proceeding.

5. Create a SpaceDetailPage bound to `/spaces/:spaceId`  
Status: Completed  
Testing: Navigate to `/spaces/:spaceId` for an existing space; verify that the page loads the space via `GET /api/spaces/:id`, handles invalid IDs with a clear error or redirect, and exposes basic edit/delete/clone actions at the top of the page.  
Checkpoint: Wait for developer approval before proceeding.

6. Move space-specific features from DashboardPage into SpaceDetailPage  
Status: Pending  
Testing: Ensure that characters, styles, scenes, and image generation for a space all work when accessed via `/spaces/:spaceId`, including refresh and direct URL entry; confirm that the previous “selectedSpaceId” state in the dashboard is no longer required for core workflows.  
Checkpoint: Wait for developer approval before proceeding.

7. Simplify or repurpose the existing Dashboard and related routes  
Status: Pending  
Testing: Decide whether `/dashboard` remains as a high-level overview or redirects to `/spaces`; verify that links in the nav bar (`/spaces`, `/characters`, `/styles`, `/scenes`, `/generate`) still lead to sensible, non-duplicated experiences under the new routing (e.g., possibly routing through `/spaces/:spaceId` when a space is selected).  
Checkpoint: Wait for developer approval before proceeding.

8. Clean up obsolete patterns and update docs/handoff notes  
Status: Pending  
Testing: Run a full TypeScript build for server and client, and run the app manually to exercise main flows (login, create space, open space, generate image); confirm there are no lingering references to deprecated routes such as `/spaces?spaceId=...` or unused state like `selectedSpaceId` in old locations.  
Checkpoint: Wait for developer approval before proceeding.

---

## 3. Progress Tracking Notes

- Step 1 — Status: Completed — Current routing and page responsibilities documented below.  
- Step 2 — Status: Pending.  
- Step 3 — Status: Pending.  
- Step 4 — Status: Completed — SpacesListPage implemented and wired to `/spaces`, with create/import and per-space gallery behavior.  
- Step 5 — Status: Completed — Minimal SpaceDetailPage implemented and wired to `/spaces/:spaceId` so deep links resolve to a per-space view.  
- Step 6 — Status: Pending.  
- Step 7 — Status: Pending.  
- Step 8 — Status: Pending.

---

## 4. Current Routing and Page Responsibilities (Pre-Change Snapshot)

### 4.1 Frontend Routes (`client/src/App.tsx`)

- `/login` → `LoginPage`  
  - Purpose: User login form and auth bootstrap.
- `/register` → `RegisterPage`  
  - Purpose: User registration form.
- `/dashboard` → `DashboardPage`  
  - Responsibilities:
    - Load all spaces for the current user via `GET /api/spaces`.
    - Create spaces via `POST /api/spaces`.
    - Select a space in local React state (`selectedSpaceId`) and, for the selected space:
      - Load characters via `GET /api/spaces/:spaceId/characters`.
      - Load styles via `GET /api/spaces/:spaceId/styles`.
      - Load images via `GET /api/spaces/:spaceId/images`.
      - Create characters via `POST /api/spaces/:spaceId/characters`.
      - Create styles via `POST /api/spaces/:spaceId/styles`.
      - Generate images via `POST /api/images/generate` (with `spaceId`, character/style version IDs, etc.).
      - Delete images via `DELETE /api/spaces/:spaceId/images/:imageId`.
    - Delete spaces via `DELETE /api/spaces/:id`.
    - Acts as a combined “spaces list + per-space detail + generate + gallery” page, driven entirely by internal state rather than URL parameters.
- `/spaces` → `DashboardPage`  
  - Currently an alias of `/dashboard`, with the same combined responsibilities and reliance on `selectedSpaceId` in state (no `:spaceId` in URL).
- `/generate` → `DashboardPage`  
  - Also mapped to `DashboardPage`, effectively another alias with the same feature set (spaces list, per-space metadata, generate, gallery).
- `/characters` → `CharactersPage`  
  - Responsibilities:
    - Load all spaces for the current user via `GET /api/spaces`.
    - Maintain its own `selectedSpaceId` in local state (independent of `DashboardPage`).
    - For the selected space:
      - List characters via `GET /api/spaces/:spaceId/characters`.
      - Create characters via `POST /api/spaces/:spaceId/characters`.
    - Provides a focused character-management view, but still duplicates “select a space” logic that also exists in `DashboardPage`.
- `/styles` → `StylesPage`  
  - Responsibilities:
    - Load all spaces for the current user via `GET /api/spaces`.
    - Maintain its own `selectedSpaceId` in local state.
    - For the selected space:
      - List styles via `GET /api/spaces/:spaceId/styles`.
      - Create styles via `POST /api/spaces/:spaceId/styles`.
    - Similar to `CharactersPage`, but focused on styles; also duplicates “select a space” behavior.
- `/scenes` → `DashboardPage`  
  - Currently mapped to `DashboardPage` rather than a dedicated scenes page.
  - `DashboardPage` does not yet expose explicit scenes UI, so this route effectively shows the generic dashboard feature set instead of focused scene management.
- `*` → `LoginPage`  
  - Fallback route for unknown paths.

### 4.2 Backend API Routes (High-Level)

- `/api/spaces` (`spacesRouter`)  
  - `GET /api/spaces` — List spaces for the authenticated user (used by Dashboard, CharactersPage, StylesPage).  
  - `POST /api/spaces` — Create a new space for the user.  
  - `DELETE /api/spaces/:id` — Delete a space owned by the user.  
  - `GET /api/spaces/:spaceId/images` — List images for a given space (used by DashboardPage).  
  - `POST /api/spaces/:id/import` — Import characters/styles from other spaces into the target space.  
  - `DELETE /api/spaces/:spaceId/images/:imageId` — Delete an image in a given space.
  - Note: There is currently no `GET /api/spaces/:id` or `PATCH /api/spaces/:id`; per-space details and edits are not first-class in the API.

- `/api/spaces/:spaceId/characters` (`charactersRouter`)  
  - `GET /` — List characters for a space, asserting space ownership.  
  - `POST /` — Create a character in a space.  
  - `GET /:characterId/versions` — List versions for a character in a space.  
  - `POST /:characterId/versions` — Create a new character version.  
  - `POST /:characterId/versions/clone` — Clone an existing character version.

- `/api/spaces/:spaceId/styles` (`stylesRouter`)  
  - `GET /` — List styles for a space.  
  - `POST /` — Create a style in a space.  
  - `GET /:styleId/versions` — List versions for a style.  
  - `POST /:styleId/versions` — Create a new style version.  
  - `POST /:styleId/versions/clone` — Clone an existing style version.

- `/api/spaces/:spaceId/scenes` (`scenesRouter`)  
  - `GET /` — List scenes for a space (currently list-only; no create/edit UI wired on the frontend).

- `/api/images` (`imagesRouter`)  
  - `POST /generate` — Generate an image for a space given character/style (and optional scene) version IDs; used by `DashboardPage` for the generate flow.

### 4.3 Observed Mismatches / Sources of Confusion

- Multiple frontend routes (`/dashboard`, `/spaces`, `/generate`, `/scenes`) currently point to `DashboardPage`, which combines “spaces list”, per-space detail, generation, and gallery. This makes it unclear which route is the canonical entry for space-specific work.
- The selected space is tracked in component state (`selectedSpaceId`) rather than in the URL; refreshing or navigating via history can lead to confusing “reversion” behavior when the implied active space changes.
- `/characters` and `/styles` each implement their own space selection and management flows, duplicating logic that also exists in `DashboardPage`, and reinforcing the lack of a single per-space detail canonical route.
- The backend provides list/create/delete operations on `/api/spaces`, but lacks a clear `GET/PATCH /api/spaces/:id` pair for treating a single space as a first-class resource, which would align better with a `/spaces/:spaceId` detail page.
