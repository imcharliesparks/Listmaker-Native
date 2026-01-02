# Implementation Plan – Integrating Backend and Shipping MVP

Purpose: align the Expo app with the new backend (Clerk-authenticated Node/Express API) and ship a working MVP with authenticated board/item CRUD.

## 1) Environment & Configuration
- Add `.env` samples and docs for `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_BACKEND_URL` (include `/api` prefix), and any platform-specific base URLs (device LAN vs. simulator). Ensure `process.env` wiring via Expo config.
- Update `constants/Config.ts` to reference the new public env var name and fail fast when missing; document expected shapes (e.g., `http://192.168.x.x:3001/api`).
- Verify Axios instance timeouts and CORS expectations (`credentials: true` unnecessary because we use bearer tokens).

## 2) Auth Handshake with Backend
- Extend the Clerk auth flow to call `POST /api/auth/sync` immediately after session establishment (email/password and OAuth). Pass `displayName`/`photoUrl` if available.
- Add `GET /api/auth/me` client helper to fetch the user profile for UI/header use; store lightweight profile in context/state.
- Harden request interceptor to gracefully sign out or surface an auth prompt on repeated 401s; ensure token provider always returns a fresh bearer token.
- Add loading/error UI for auth bootstrap and sign-out path cleanup.

## 3) API Client Alignment
- Update Axios base path to match backend routes (`/api/*`), confirm type parity (snake_case fields, `item_count`, `is_public`), and remove reliance on non-existent endpoints (e.g., `GET /items/:id`).
- Implement typed helpers for all surfaced routes: `lists` CRUD, `items` list/create/delete, `auth` sync/me. Return normalized shapes for the UI.
- Centralize error normalization (network vs. validation vs. auth) for consistent toasts/alerts.

## 4) Boards UX (List CRUD)
- Replace placeholder FAB action with a real “Create board” sheet/modal (title, optional description, visibility toggle -> `isPublic`).
- Wire board listing to `/api/lists` and ensure pull-to-refresh calls refetch; show empty/error states with retry.
- Add board edit/delete actions on the board detail screen (or board card long-press menu) calling `PUT /api/lists/:id` and `DELETE /api/lists/:id`; confirm local state updates and navigation after delete.
- Show accurate counts and timestamps using backend fields; ensure “Recent” filter uses `created_at`.

## 5) Items UX (Add/Delete/Display)
- Update board detail FAB to open “Add item” sheet with URL (and optional note/label for future); call `POST /api/items` and append response to the grid respecting `position`.
- Wire item list to `/api/items/list/:listId`; ensure loading/empty/error states per-board; support pull-to-refresh.
- Implement delete action (card long-press or item screen) using `DELETE /api/items/:id` with optimistic UI rollback.
- Remove dependency on missing `GET /items/:id`: pass item payload through navigation params or hydrate from board cache; adjust Item screen to handle absent detail fetch.
- Display scraped metadata (title/thumbnail/source_type); add fallbacks when metadata fields are missing.

## 6) Navigation & State Management
- Ensure auth gating routes to `/authentication` when unauthenticated and back to tabs after login; avoid flicker by blocking until Clerk + `/auth/me` resolve.
- Consider light shared state (or query library) to avoid prop-drilling boards/items; at minimum, co-locate refetch triggers after mutations.
- Add global toasts/alerts for mutation success/failure to guide users through flows.

## 7) Visual & UX Polish for MVP
- Refine headers to show user avatar/email (from Clerk or `/auth/me`), add a sign-out button, and remove template/demo screens from navigation.
- Add loading spinners/placeholders to cards and grids; ensure consistent theming with `Colors`.
- Tighten accessibility: pressable hitSlops, role/label text, and keyboard handling on forms.

## 8) Testing & Validation
- Manual test matrix: sign-up/sign-in (email + OAuth), sync call success, board create/list/update/delete, add/delete items, error states (401, 400 validation), pull-to-refresh, and navigation redirects.
- Add lightweight unit/integration tests for API helpers (mock Axios) and AuthContext token provider; snapshot critical UI changes if feasible.
- Provide a “run backend locally” note (env, port 3001) and Expo start instructions for devices/emulators.
