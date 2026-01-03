# Listmaker Native – Current Setup (Clerk + ShadCN RN)

This repo now uses Clerk for auth, Expo Router route groups, and ShadCN/NativeWind components from React Native Reusables.

## Key Points
- Stack: Expo SDK 54, React Native 0.81, React 19, Expo Router 6.
- Auth: Clerk Expo (`@clerk/clerk-expo`) with SecureStore token cache; env `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is required.
- Routing: `(auth)` group for sign-in/up/forgot/reset; `(home)` group for the main app (tabs, board, item, user menu). Root stack only includes these two groups.
- UI: NativeWind + Tailwind + ShadCN RN primitives (cards/buttons/inputs/avatar/popover/etc.) via React Native Reusables; icons via `lucide-react-native`.
- Networking: Axios, API base `http://localhost:3000/api` (`constants/Config.ts`), no auth headers yet.
- State: React hooks; data hooks `useBoards` and `useItems`.
- Scripts: use bun (`bunx expo start`, or `bun start` via package.json).

## Auth Screens
- `(auth)/sign-in`, `(auth)/sign-up`, `(auth)/forgot-password`, `(auth)/reset-password` use Clerk hooks and ShadCN forms. Signed-in users are redirected away from `(auth)`.
- `(home)/_layout` redirects signed-out users to `/sign-in`.
- `components/SignOutButton.tsx` calls Clerk `signOut` and redirects to `/sign-in`.

## UI Components (ShadCN)
- Cards: `BoardCard`, `ItemCard`, `EmptyState`.
- Controls: `FilterTabs`, `FloatingActionButton`, `Header`, `UserMenu`, plus primitives under `components/ui/*`.
- Styling tokens defined in `global.css` + `tailwind.config.js`; navigation theme in `lib/theme.ts`.

## Screens
- Tabs home: `(home)/(tabs)/index.tsx` boards grid with filters, empty state, FAB placeholder for create board.
- Board detail: `(home)/board/[id].tsx` header actions, filters, item grid, add-item placeholder.
- Item detail: `(home)/item/[id].tsx` header, thumbnail, metadata, open link.
- Auth and user menu as above; template `two.tsx` still present under tabs.

## Known Gaps
- API calls are unauthenticated; backend auth integration is pending.
- Item detail GET may be missing on backend.
- Create board/add item are still placeholder alerts; favorites filter has no data logic.

## Usage
- Install deps with bun (`bun install`), run with `bunx expo start -c` (or `--web -c`).
- Ensure `.env` has `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
