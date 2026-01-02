# Listmaker Native – Project Specification

## Overview
- Expo/React Native (TypeScript) mobile app that lets a user view Pinterest-style “boards” (lists) and their “items” (links/videos/etc.).
- File-based navigation is handled by Expo Router with stack + tabs; theming uses React Navigation ThemeProvider.
- Data is fetched from a REST backend at `API_BASE_URL` (`constants/Config.ts`), currently `http://localhost:3000/api`. Authentication is not wired into API calls yet.
- Firebase is initialized for email/password auth (see `services/firebase.ts`) but not yet integrated into data fetching.

## Tech Stack
- React Native 0.81, React 19, Expo SDK 54, Expo Router 6.
- State: React hooks only.
- Networking: Axios.
- UI: React Native + @expo/vector-icons + react-native-safe-area-context + react-native-screens; basic custom components.
- Auth: @react-native-firebase/auth (email/password).

## Configuration & External Resources
- `constants/Config.ts`
  - `API_BASE_URL`: `http://localhost:3000/api` (change per backend host/device).
  - `TEST_USER_ID`: hardcoded placeholder for future auth.
- `services/firebase.ts`
  - Initializes Firebase app with project `listmaker-8e57e`; exports `FIREBASE_APP`, `FIREBASE_AUTH` (email/password). No token handling is wired into Axios.
- Assets: default Expo template fonts (`assets/fonts/SpaceMono-Regular.ttf`); other assets not referenced in code.

## API Surface (Consumed)
- Base client: `services/api.ts` creates Axios instance with JSON headers, no auth headers.
- Boards (`boardsApi`):
  - `getBoards() -> GET /lists` → expects `{ lists: Board[] }`.
  - `getBoard(id) -> GET /lists/:id` → expects `{ list: Board }`.
  - `createBoard(data) -> POST /lists` → expects `{ list: Board }`.
  - `updateBoard(id, data) -> PUT /lists/:id` → expects `{ list: Board }`.
  - `deleteBoard(id) -> DELETE /lists/:id`.
- Items (`itemsApi`):
  - `getItems(listId) -> GET /items/list/:listId` → expects `{ items: Item[] }`.
  - `getItem(id) -> GET /items/:id` → expects `{ item: Item }` (backend endpoint may be missing per comment).
  - `addItem(data) -> POST /items` → expects `{ item: Item }`.
  - `deleteItem(id) -> DELETE /items/:id`.

## Data Models (`services/types.ts`)
- `Board`: id, user_id, title, description?, is_public, cover_image?, created_at, updated_at, item_count?.
- `Item`: id, list_id, url, title?, description?, thumbnail_url?, source_type?, metadata?, position, created_at, updated_at.
- Request shapes: `CreateBoardRequest`, `AddItemRequest`.
- Filters: `FilterType` (all/recent/favorites), `ItemFilterType` (all/videos/images/links).

## Navigation & Screens
- Stack defined in `app/_layout.tsx`: screens `(tabs)`, `board/[id]`, `item/[id]`, `modal`; wraps ThemeProvider and font loading.
- Web shell: `app/+html.tsx`; not-found fallback `app/+not-found.tsx`.
- `app/(tabs)/_layout.tsx`: single tab “Boards”.
- `app/(tabs)/index.tsx` (BoardsScreen):
  - Shows header (`components/Header`) with search/avatar placeholders.
  - Filter tabs for boards (all/recent/favorites).
  - Grid of `BoardCard` components; pull-to-refresh triggers `useBoards().refetch`.
  - FAB triggers placeholder alert for board creation.
- `app/board/[id].tsx` (BoardScreen):
  - Loads board via `boardsApi.getBoard`; items via `useItems(boardId)`.
  - Header with back/share/ellipsis buttons.
  - Optional cover-image strip; item count/public badge.
  - Item filter tabs; two-column grid of `ItemCard`; pull-to-refresh refetches board/items.
  - FAB triggers placeholder alert for adding item.
- `app/item/[id].tsx` (ItemScreen):
  - Loads item via `itemsApi.getItem` (will fail until backend endpoint exists).
  - Header with back/share; thumbnail if present; tags (from metadata or defaults); saved info; actions to add note (alert) and open source URL; bookmark icon placeholder.
- `app/authentication.tsx`:
  - Renders `Header` and `components/AuthForm` (email/password sign-in/up).
- `app/(tabs)/two.tsx` and `app/modal.tsx`:
  - Default Expo template/demo screens (not linked in tab layout).

## Hooks
- `hooks/useBoards.ts`: fetches boards on mount; exposes filtered list, loading/error, `filter`, `setFilter`, `refetch`. “Recent” = created within last 7 days; “Favorites” currently returns none.
- `hooks/useItems.ts`: fetches items for a list; exposes filtered list, loading/error, `filter`, `setFilter`, `refetch`. Filters by `source_type` (youtube/image/website).

## Components (key)
- `components/Header.tsx`: page header with menu/search/avatar placeholders; shows “Your Boards” subtitle on Boards page.
- `components/BoardCard.tsx`: tappable board tile; shows up to 2 cover images, title, item count; navigates to board screen.
- `components/ItemCard.tsx`: tappable item tile with thumbnail or source icon, optional play overlay for YouTube, bookmark placeholder; navigates to item screen.
- `components/FilterTabs.tsx`: horizontal pressable tabs with active styling.
- `components/FloatingActionButton.tsx`: circular FAB with configurable Ionicon.
- `components/EmptyState.tsx`: centered icon/title/description placeholder.
- `components/AuthForm.tsx`: email/password form using `@react-native-firebase/auth` for sign-in/sign-up with basic alerts.
- Additional template utilities: `EditScreenInfo.tsx`, `ExternalLink.tsx`, `StyledText.tsx`, `Themed.tsx`, `useColorScheme` + web variants, `useClientOnlyValue` helpers, and a Jest snapshot test for StyledText.

## Styling & Theming
- Colors defined in `constants/Colors.ts`; used across screens/components.
- Pages typically set background to `Colors.background` and cards to `Colors.surface`; shadows/elevation applied manually.

## Known Limitations (from code)
- No API auth; Axios client ignores Firebase auth tokens.
- Item detail fetch endpoint may not exist; screen will alert error until backend provides `GET /items/:id`.
- FAB actions and note/bookmark/share/search/menu are placeholders (alerts or no-op).
- Favorites filter not implemented; avatar/logo placeholders use emoji.

## Scripts (package.json)
- `npm start`, `npm run android`, `npm run ios`, `npm run web` (all run `expo start` with platform flags).
