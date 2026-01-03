# Listmaker Native - Project Specification

## Overview
- Expo/React Native (TypeScript) mobile app for Pinterest-style boards (lists) and items (links/videos/images).
- Routing with Expo Router using route groups: `(auth)` for Clerk auth flows and `(home)` for the main app.
- UI built with NativeWind + Tailwind + React Native Reusables (ShadCN RN primitives).
- Data fetched from a REST backend at `API_BASE_URL` (`constants/Config.ts`), currently `http://localhost:3000/api`. API calls are not yet authenticated.
- Authentication handled with Clerk Expo SDK; custom sign-in/up/forgot/reset screens using Clerk hooks. Sessions cached with `expo-secure-store`.

## Tech Stack
- React Native 0.81, React 19, Expo SDK 54, Expo Router 6.
- State: React hooks only.
- Networking: Axios.
- UI: NativeWind + TailwindCSS + ShadCN RN components (Reusables); lucide-react-native icons.
- Auth: Clerk Expo (`@clerk/clerk-expo`) with SecureStore token cache.

## Configuration & External Resources
- `constants/Config.ts`
  - `API_BASE_URL`: `http://localhost:3000/api` (update per backend host/device).
  - `TEST_USER_ID`: legacy placeholder; API calls currently unauthenticated.
- Environment
  - `.env` expects `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Auth token cache: `config/clerk.ts` re-exports Clerk’s `tokenCache` (SecureStore).

## API Surface (Consumed)
- Base client: `services/api.ts` (Axios, JSON headers, no auth headers yet).
- Boards (`boardsApi`):
  - `getBoards() -> GET /lists` expects `{ lists: Board[] }`.
  - `getBoard(id) -> GET /lists/:id` expects `{ list: Board }`.
  - `createBoard(data) -> POST /lists` expects `{ list: Board }`.
  - `updateBoard(id, data) -> PUT /lists/:id` expects `{ list: Board }`.
  - `deleteBoard(id) -> DELETE /lists/:id`.
- Items (`itemsApi`):
  - `getItems(listId) -> GET /items/list/:listId` expects `{ items: Item[] }`.
  - `getItem(id) -> GET /items/:id` expects `{ item: Item }` (backend endpoint may be missing).
  - `addItem(data) -> POST /items` expects `{ item: Item }`.
  - `deleteItem(id) -> DELETE /items/:id`.

## Data Models (`services/types.ts`)
- `Board`: id, user_id, title, description?, is_public, cover_image?, created_at, updated_at, item_count?.
- `Item`: id, list_id, url, title?, description?, thumbnail_url?, source_type?, metadata?, position, created_at, updated_at.
- Requests: `CreateBoardRequest`, `AddItemRequest`.
- Filters: `FilterType` (all/recent/favorites), `ItemFilterType` (all/videos/images/links).

## Navigation & Screens
- Root stack (`app/_layout.tsx`): groups `(auth)` and `(home)`; Clerk provider + theme + PortalHost.
- Auth group (`app/(auth)`):
  - `sign-in.tsx`: ShadCN SignInForm (Clerk `useSignIn`), links to forgot/reset/sign-up.
  - `sign-up.tsx`: ShadCN SignUpForm (Clerk `useSignUp`), links to sign-in.
  - `forgot-password.tsx`: ShadCN ForgotPasswordForm, routes to reset.
  - `reset-password.tsx`: ShadCN ResetPasswordForm, completes reset and routes home.
  - `_layout.tsx`: redirects signed-in users to `/`.
- Home group (`app/(home)`):
  - `_layout.tsx`: redirects signed-out users to `/sign-in`.
  - `index.tsx`: SignedIn/Out gate with SignOutButton or links to auth; redirects signed-in to tabs.
  - `(tabs)/_layout.tsx`: tab layout.
  - `(tabs)/index.tsx` (Boards): ShadCN header, filter buttons, grid of BoardCard, EmptyState, FAB placeholder alert for create board.
  - `board/[id].tsx`: loads board via `boardsApi.getBoard`, items via `useItems`; ShadCN header, filters, item grid, FAB placeholder alert for add item.
  - `item/[id].tsx`: loads item via `itemsApi.getItem`; ShadCN header, thumbnail, metadata, open-source button (may fail if backend endpoint missing).
  - `modal.tsx`, `(tabs)/two.tsx`: template/demo screens (not primary flow).
  - `user-menu.tsx`: ShadCN UserMenu from Reusables.

## Hooks
- `hooks/useBoards.ts`: fetches boards; exposes filtered list, loading/error, `filter`, `setFilter`, `refetch`. “Recent” = created in last 7 days; “Favorites” returns none.
- `hooks/useItems.ts`: fetches items for a list; exposes filtered list, loading/error, `filter`, `setFilter`, `refetch`. Filters by `source_type`.

## Components (key, ShadCN/NW)
- `Header`: ShadCN buttons/avatar/icons with subtitle on boards.
- `BoardCard`: Card with cover images/placeholder icon, title, item count.
- `ItemCard`: Card with thumbnail/placeholder icon, source icon, bookmark icon.
- `FilterTabs`: ShadCN buttons styled as pills.
- `FloatingActionButton`: ShadCN button with plus icon.
- `EmptyState`: Card with icon/title/description.
- Auth: `sign-in-form`, `sign-up-form`, `forgot-password-form`, `reset-password-form`, `social-connections`, `user-menu`, `SignOutButton`.
- UI primitives: `components/ui/*` from Reusables (card, button, input, label, separator, text, avatar, popover, icon, etc.).

## Styling & Theming
- NativeWind + Tailwind with ShadCN tokens (`global.css`, `tailwind.config.js`); dark mode via `class`.
- `lib/theme.ts` maps tokens to React Navigation themes.
- Icons: `lucide-react-native` via `components/ui/icon`.

## Known Limitations
- API calls unauthenticated; backend auth not wired.
- Item detail GET may be missing on backend.
- Create board / add item actions still show placeholder alerts.
- Favorites filter has no data logic.
- Legacy `constants/Colors.ts` remains but primary UI now uses Tailwind tokens.

## Scripts (package.json)
- `bunx expo start`, `bunx expo start --android`, `--ios`, `--web` (via `bun` scripts `start/android/ios/web`).
