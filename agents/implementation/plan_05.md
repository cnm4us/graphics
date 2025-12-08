# Implementation Plan: Space-Scoped Left Drawer Navigation

## 1. Overview
Goal: Introduce a left-side drawer with an “active space” concept that is consistent across all pages, so characters, styles, scenes, generate, and images navigation always operates in the context of a specific space, while keeping `/spaces` as the place to create/manage spaces.

In scope:
- A responsive left drawer component with a hamburger toggle, present on all main pages.
- A small shared state mechanism (e.g., SpaceContext) to track the active space and synchronize it with the current URL and spaces list.
- Drawer menu sections for auth actions, high-level routes (Dashboard, Spaces), a selectable list of spaces, and space-scoped shortcuts (Characters, Styles, Scenes, Generate, Images).
- Behavior when no user is logged in (only Login/Register options) and when no active space is selected.

Out of scope:
- Visual theming beyond simple inline styles or reuse of existing style patterns.
- Mobile-specific animations or advanced accessibility beyond basic focus/aria labels for the drawer.
- Changes to backend APIs; this plan is purely frontend/navigation.

---

## 2. Step-by-Step Plan

1. Define drawer behavior and active space semantics  
Status: Completed  
Testing: Document the exact behavior for opening/closing the drawer, determining the active space (URL `:spaceId` vs last selection vs first space), and the enabled/disabled state of space-scoped links when no space is active. Confirm this behavior matches user expectations captured in this plan.  
Checkpoint: Wait for developer approval before proceeding.

2. Implement a SpaceContext to track active space  
Status: Pending  
Testing: Add a lightweight context/provider that exposes `activeSpaceId` and setters, plus helper hooks. Verify in a test component that changing `activeSpaceId` in the context is reflected across components, and that it can be initialized from a given `spaceId` prop.  
Checkpoint: Wait for developer approval before proceeding.

3. Synchronize activeSpaceId with the router and spaces list  
Status: Pending  
Testing: Add a small hook that watches the current route params and spaces list: when the user visits `/spaces/:spaceId/...`, update `activeSpaceId` if the space exists and belongs to the user. When `activeSpaceId` changes (via the drawer), navigate to the correct `/spaces/:id` route. Verify that direct deep links, refresh, and back/forward keep the drawer’s active space correct.  
Checkpoint: Wait for developer approval before proceeding.

4. Build the Drawer component and hamburger toggle  
Status: Pending  
Testing: Implement a drawer component (e.g., `LeftDrawer`) that renders a hamburger icon in the top layout, slides in/out on toggle, and traps focus within the drawer when open (basic accessibility). Verify that the drawer appears consistently on all authenticated pages, can be opened/closed, and does not break existing content layout.  
Checkpoint: Wait for developer approval before proceeding.

5. Populate drawer contents with auth + navigation + spaces list  
Status: Pending  
Testing: Using the existing auth state and spaces API, show:  
- Logged-out: Login + Register links.  
- Logged-in: Logout + “Dashboard” + “Spaces” (clickable to `/spaces`) + a list of space names (each linking to `/spaces/:id` and setting active space).  
Verify that clicking a space updates `activeSpaceId`, highlights that space entry, and navigates to `/spaces/:id`.  
Checkpoint: Wait for developer approval before proceeding.

6. Wire space-scoped shortcuts (Characters, Styles, Scenes, Generate, Images) to activeSpaceId  
Status: Pending  
Testing: Add drawer items for Characters, Styles, Scenes, Generate, and Images that:  
- When `activeSpaceId` is set, navigate to `/spaces/:activeId/characters|styles|scenes|generate|images`.  
- When `activeSpaceId` is not set, either disable the items with a “Select a space first” hint or redirect to `/spaces` with a visible message.  
Verify that for a selected space, each shortcut opens the correct route and that switching active spaces updates shortcut targets.  
Checkpoint: Wait for developer approval before proceeding.

7. Simplify top navigation and ensure consistency  
Status: Pending  
Testing: Remove or de-emphasize redundant top-level navigation links (e.g., direct `/characters`, `/styles`, `/generate` entries) as the drawer becomes the primary navigation, while keeping the app title and auth status. Confirm that the user can reach all main flows (Dashboard, Spaces, per-space pages) using the drawer on both desktop and smaller viewports.  
Checkpoint: Wait for developer approval before proceeding.

8. Final regression pass and cleanup  
Status: Pending  
Testing: Run `npm run build` for the client and manually verify:  
- Logged-out: hamburger shows only Login/Register; attempting to access protected routes still redirects to Login.  
- Logged-in: drawer shows spaces and shortcuts; deep links to `/spaces/:id/...` set the correct active space; navigating between characters/styles/scenes/generate/images stays in the same space; the drawer highlights the correct active space.  
Remove any leftover unused nav code or state that was superseded by the drawer.  
Checkpoint: Wait for developer approval before proceeding.

---

## 3. Progress Tracking Notes

- Step 1 — Status: Completed — Drawer behavior and active space semantics documented below.  
- Step 2 — Status: Completed — SpaceContext implemented with `activeSpaceId` state, setter, and localStorage persistence, and wired into the app root via `SpaceProvider`.  
- Step 3 — Status: Completed — Space-aware pages (SpaceDetailPage, CharactersPage, StylesPage, SpaceGeneratePage, SpaceImagesPage, SpaceScenesPage) now set `activeSpaceId` based on the current URL `:spaceId` and spaces list, keeping the shared active-space state synchronized with deep links and navigation.  
- Step 4 — Status: Completed — LeftDrawer component and hamburger toggle added to the app layout, rendering a slide-out navigation panel on all pages when opened.  
- Step 5 — Status: Completed — Drawer populated with auth actions (login/register or logout), Dashboard and Spaces links, and a spaces list that highlights and selects the active space.  
- Step 6 — Status: Completed — Space-scoped shortcuts (Characters, Styles, Scenes, Generate, Images) in the drawer now use `activeSpaceId` to navigate to `/spaces/:id/*` routes, and are disabled with guidance when no active space exists.  
- Step 7 — Status: Completed — Top navigation simplified to a hamburger, app title, and minimal auth links; primary navigation now lives in the drawer.  
- Step 8 — Status: Pending.

---

## 4. Drawer Behavior and Active Space Semantics

### 4.1 Drawer Presence and Toggle

- The app layout includes a hamburger icon in the upper-left corner on all main pages (including login/register).  
- Clicking the hamburger toggles a left-side drawer (`isDrawerOpen` true/false).  
- When the drawer is open:
  - A semi-transparent overlay covers the main content on smaller viewports; clicking the overlay closes the drawer.
  - Pressing `Escape` closes the drawer.
  - Clicking any navigation link inside the drawer closes it on small screens (on larger screens we may keep it open for convenience).

### 4.2 Auth-Specific Content

- When **not logged in**:
  - Drawer shows: `Login` → `/login`, `Register` → `/register`.
  - No space list or space-scoped shortcuts are shown.
- When **logged in**:
  - Drawer shows:
    - `Logout` action (using existing auth logout logic).
    - Application navigation (Dashboard, Spaces, spaces list, space-scoped shortcuts).

### 4.3 Active Space Semantics

- The app maintains a single `activeSpaceId` in a shared context (SpaceContext) that any page can read.
- `activeSpaceId` is determined as follows:
  - On route change:
    - If the current URL includes `:spaceId` (e.g., `/spaces/:spaceId`, `/spaces/:spaceId/characters`, etc.) and that space exists in the authenticated user’s spaces list, set `activeSpaceId` to that value.
    - If `:spaceId` is present but not found in the user’s spaces, `activeSpaceId` remains unchanged (or is set to `null` if we want to clear invalid context), and the page shows “Space not found or not accessible.”
  - On initial load / login when there is no `:spaceId`:
    - If a previously selected space ID is stored in localStorage and still exists in the current spaces list, use that as `activeSpaceId`.
    - Otherwise, if the user has at least one space, default `activeSpaceId` to the first space’s ID.
    - If the user has no spaces, `activeSpaceId` is `null`.
  - When the user clicks a space name in the drawer:
    - Set `activeSpaceId` to that space’s ID.
    - Navigate to `/spaces/:id` (space detail).
    - Persist the selection in localStorage so it can be restored later.
- When the user logs out:
  - `activeSpaceId` is cleared and any persisted active space entry is removed or ignored on the next login.

### 4.4 Drawer Navigation Structure (Logged-In)

- **Auth / high-level section**
  - `Dashboard` → `/dashboard` (read-only overview of spaces and their content).
  - `Spaces` (clickable heading) → `/spaces`
    - `/spaces` remains the place where the user can:
      - Create new spaces (with import options).
      - See and manage the full list of spaces (delete, etc.).

- **Spaces list**
  - Below `Spaces`, render each owned space:
    - Label: space name.
    - Action: clicking navigates to `/spaces/:id` and sets `activeSpaceId = id`.
    - The active space is visually highlighted (e.g., bold text and/or a left border).

- **Space-scoped shortcuts**
  - When `activeSpaceId` is set (and corresponds to a real space), shortcuts are enabled and link to:
    - `Characters` → `/spaces/:activeId/characters`
    - `Styles` → `/spaces/:activeId/styles`
    - `Scenes` → `/spaces/:activeId/scenes`
    - `Generate` → `/spaces/:activeId/generate`
    - `Images` → `/spaces/:activeId/images` (optional but recommended alongside Generate).
  - When `activeSpaceId` is `null` or there are no spaces:
    - The space-scoped shortcut items are visually disabled and show a small hint like “Select a space first” (e.g., via subdued text or tooltip).
    - Clicking a disabled shortcut either does nothing or navigates to `/spaces` and relies on `/spaces` to guide the user to create/select a space.

### 4.5 URL and Drawer Synchronization

- Rule: the URL is the source of truth for which space is being viewed; the drawer reflects that and provides shortcuts.
- When the user navigates via:
  - A direct URL like `/spaces/7/generate` or `/spaces/7/styles`, the drawer:
    - Sets `activeSpaceId` to `7` (assuming that space exists).
    - Highlights the space “7” in the spaces list.
    - Shows shortcuts pointing to `/spaces/7/*`.
  - The drawer:
    - Does not store separate state for the “current” space; it always mirrors `activeSpaceId`, which is derived from the route + persisted preferences.
- When the user changes the active space via the drawer:
  - The router navigates to `/spaces/:activeId`, and the existing per-space routes (`/spaces/:activeId/characters`, `/spaces/:activeId/styles`, etc.) can be reached via shortcuts without desynchronization.
