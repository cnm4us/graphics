# Implementation Plan: Space-Scoped Routes for Characters, Styles, Scenes, and Images

## 1. Overview
Goal: Restructure the frontend routing and page responsibilities so that characters, styles, scenes, generation, and image galleries all live under space-scoped routes (e.g., `/spaces/:spaceId/characters`), matching the backend API shape and avoiding global pages with ambiguous space selection.

In scope:
- Introduce or refine frontend routes under `/spaces/:spaceId/*` for characters, styles, scenes, image gallery, and generation.
- Refactor existing pages (Dashboard, CharactersPage, StylesPage, etc.) to use `spaceId` from the URL instead of ad-hoc `selectedSpaceId` state where appropriate.
- Adjust global navigation to point users towards space-scoped pages while preserving a simple `/spaces` list.
- Remove or repurpose legacy routes that duplicate functionality (e.g., `/generate`, `/characters`, `/styles` as global entry points).

Out of scope:
- Backend API changes (we already have `/api/spaces/:spaceId/...` routes; only minimal adjustments may be needed later in a separate plan if semantics change).
- Deep UX redesign or visual restyling of pages.
- New domain features beyond routing / responsibilities reshaping.

---

## 2. Step-by-Step Plan

1. Define target route map and update navigation copy  
Status: Completed  
Testing: Confirm a written route map for `/spaces`, `/spaces/:spaceId`, and nested routes (`/spaces/:spaceId/characters|styles|scenes|generate|images`) is captured in this plan and mirrors existing backend API paths; verify the header/nav labels in `App.tsx` still make sense in light of these targets.  
Checkpoint: Wait for developer approval before proceeding.

2. Add nested frontend routes under `/spaces/:spaceId/*`  
Status: Pending  
Testing: Run the frontend dev server and manually hit `/spaces/:spaceId/characters`, `/spaces/:spaceId/styles`, `/spaces/:spaceId/scenes`, `/spaces/:spaceId/generate`, and `/spaces/:spaceId/images`; verify that each route renders a placeholder or existing component without causing routing errors or falling through to the wildcard login route.  
Checkpoint: Wait for developer approval before proceeding.

3. Adapt characters and styles pages to be space-scoped  
Status: Pending  
Testing: For an authenticated user with at least one space, navigate to `/spaces/:spaceId/characters` and `/spaces/:spaceId/styles`; verify these views use `spaceId` from `useParams` (rather than internal `selectedSpaceId`) to load and create characters/styles for that space. Confirm that refreshing the page preserves the selected space via the URL, and that attempting to access a space the user does not own results in a clear error or redirect.  
Checkpoint: Wait for developer approval before proceeding.

4. Introduce space-scoped generation and images pages  
Status: Pending  
Testing: Move or reuse the generate form and image gallery from `DashboardPage` into `/spaces/:spaceId/generate` and `/spaces/:spaceId/images`. Verify end-to-end that image generation still works for a valid space (characters/styles loaded for that space, generation succeeds, gallery updates) and that direct visits to these URLs behave correctly (no dependency on prior in-page state).  
Checkpoint: Wait for developer approval before proceeding.

5. Add or refine a scenes page under `/spaces/:spaceId/scenes`  
Status: Pending  
Testing: Wire a scenes list (and, if desired, create/edit UI) to `/spaces/:spaceId/scenes` using the existing `/api/spaces/:spaceId/scenes` endpoint; verify that listing works for owned spaces and that invalid/foreign spaces are handled gracefully. Confirm that scenes behavior is clearly scoped to the selected space.  
Checkpoint: Wait for developer approval before proceeding.

6. Simplify or redirect legacy global routes (`/characters`, `/styles`, `/scenes`, `/generate`)  
Status: Pending  
Testing: Decide per-route whether to keep a global view or redirect; for any redirects, verify that visiting the old URLs sends users to `/spaces` or to an appropriate `/spaces/:spaceId/...` route with a clear message if no space is selected. Confirm there are no remaining navigation links that point exclusively to legacy routes.  
Checkpoint: Wait for developer approval before proceeding.

7. Reduce DashboardPage responsibilities and align it with the new structure  
Status: Pending  
Testing: Update `/dashboard` to either become a lightweight overview (e.g., “recent spaces/images”) or to redirect to `/spaces`. Verify that core workflows (list spaces, open space, manage characters/styles/scenes, generate images, view gallery) no longer depend on `/dashboard` and are fully supported via the `/spaces` and `/spaces/:spaceId/*` routes.  
Checkpoint: Wait for developer approval before proceeding.

8. Clean up duplicated state/logic and run a full regression pass  
Status: Pending  
Testing: Remove now-redundant `selectedSpaceId` state and duplicated “select a space” logic from pages that have become space-scoped; run `npm run build` in both `client` and `server`, and do a manual regression: login, create space, import content, open per-space pages for characters/styles/scenes/generate/images, and confirm everything works via URL-driven routing.  
Checkpoint: Wait for developer approval before proceeding.

---

## 3. Progress Tracking Notes

- Step 1 — Status: Completed — Target space-scoped route map and navigation behavior documented below.  
- Step 2 — Status: Completed — Nested `/spaces/:spaceId/*` routes added in the frontend router, pointing to existing pages (characters/styles) and minimal space-scoped placeholders (scenes/generate/images).  
- Step 3 — Status: Completed — CharactersPage and StylesPage now read `spaceId` from the URL when present, use it as the active space, and navigate between `/spaces/:spaceId/characters` and `/spaces/:spaceId/styles` instead of relying solely on internal `selectedSpaceId` state.  
- Step 4 — Status: Completed — SpaceGeneratePage and SpaceImagesPage now host the generation form and image gallery for a specific space, using `spaceId` from the URL and the existing APIs; they mirror the behavior previously only available on DashboardPage but in a space-scoped, URL-driven way.  
- Step 5 — Status: Completed — SpaceScenesPage now lists scenes for a given space using the existing `/api/spaces/:spaceId/scenes` endpoint, showing name/description/latest version in a space-scoped view.  
- Step 6 — Status: Pending.  
- Step 7 — Status: Completed — DashboardPage has been simplified to a read-only overview: it loads all spaces and, for each, lists characters/styles/scenes using the space-scoped APIs, with all create/delete/generate/gallery behaviors removed in favor of the new `/spaces` and `/spaces/:spaceId/*` routes.  
- Step 8 — Status: Pending.

---

## 4. Target Route Map and Navigation Notes

### 4.1 Frontend Routes (Desired Structure)

- `/spaces` → `SpacesListPage`  
  - Responsibilities:
    - List all spaces for the current user.
    - Create new spaces (with optional character/style import).
    - Provide links into per-space pages, especially `/spaces/:spaceId` and `/spaces/:spaceId/images`.
    - Show a simple “images in this space” gallery for a selected space (optional helper, but not the primary images view long-term).

- `/spaces/:spaceId` → `SpaceDetailPage`  
  - Responsibilities:
    - Act as the “hub” for a single space.  
    - Display name/description/ID and high-level information.  
    - Provide local navigation (tabs or links) to:
      - `/spaces/:spaceId/characters`
      - `/spaces/:spaceId/styles`
      - `/spaces/:spaceId/scenes`
      - `/spaces/:spaceId/generate`
      - `/spaces/:spaceId/images`
    - Expose basic actions such as rename, delete, and (later) clone.

- `/spaces/:spaceId/characters`  
  - Responsibilities:
    - List characters belonging to this space.
    - Create new characters in this space.
    - (Later) Show version lists, cloning, and detail views per character.
  - Implementation notes:
    - Reuse and adapt the existing `CharactersPage` logic so that `spaceId` comes from `useParams` instead of internal `selectedSpaceId`.

- `/spaces/:spaceId/styles`  
  - Responsibilities:
    - List styles belonging to this space.
    - Create new styles in this space.
    - (Later) Show version lists, cloning, and detail views per style.
  - Implementation notes:
    - Reuse and adapt the existing `StylesPage` logic to read `spaceId` from the URL.

- `/spaces/:spaceId/scenes`  
  - Responsibilities:
    - List scenes for this space using `/api/spaces/:spaceId/scenes`.
    - (Later) Create/edit/clone scenes and manage scene versions.
  - Implementation notes:
    - New UI or reuse of a future scenes page, but always scoped by `spaceId` from `useParams`.

- `/spaces/:spaceId/generate`  
  - Responsibilities:
    - Provide the image generation UI for a specific space:
      - Load characters/styles (and scenes when applicable) for that space.
      - Select character/style/scene versions and seed.
      - Call `POST /api/images/generate` with the correct `spaceId` and version IDs.
    - Optionally display the last generated image for this space and link to `/spaces/:spaceId/images`.
  - Implementation notes:
    - Move the generate form currently in `DashboardPage` into this route.

- `/spaces/:spaceId/images`  
  - Responsibilities:
    - Display the full gallery of images for this space.
    - Support viewing images in a modal and deleting them.
  - Implementation notes:
    - Move the “Images in this space” gallery logic from `DashboardPage` (and the helper view in `SpacesListPage` if desired) into this dedicated per-space gallery route.

### 4.2 Legacy/Global Routes (Transitional Behavior)

- `/dashboard` → `DashboardPage` (for now)  
  - Short term:
    - Remains as-is while features are moved into the new `/spaces/:spaceId/*` routes.
  - Long term:
    - Becomes a light overview or redirects to `/spaces` once all core flows are space-scoped.

- `/characters`, `/styles`, `/scenes`, `/generate`  
  - Short term:
    - Continue to function as global entry points, but their responsibilities will gradually shift or shrink as `/spaces/:spaceId/*` routes mature.
  - Long term:
    - Each may either:
      - Redirect to `/spaces` (ask the user to choose a space), or
      - Redirect to the last-opened space’s corresponding `/spaces/:spaceId/...` route if such state is tracked.

### 4.3 Navigation Copy Notes

- Top-level nav in `App.tsx` remains:
  - `Dashboard`, `Spaces`, `Generate`, `Characters`, `Styles`, `Scenes`.
- As nested `/spaces/:spaceId/*` routes are implemented, the meaning of:
  - `Generate` should shift towards `/spaces/:spaceId/generate` (per-space) rather than a global `/generate` route.
  - `Characters`, `Styles`, and `Scenes` should guide users into per-space routes, likely via:
    - Space selection on `/spaces`, or
    - Direct links to `/spaces/:spaceId/characters|styles|scenes` when a space is already chosen.
- Local navigation inside `SpaceDetailPage` will provide clear per-space links that make the space context obvious, even if global nav still exposes legacy routes during the transition.
