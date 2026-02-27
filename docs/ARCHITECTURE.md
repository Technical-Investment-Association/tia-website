# Architecture

High-level structure of the TIA website codebase and how the main pieces fit together.

## Directory structure

```
src/
├── App.tsx                 # Router, lazy routes, global providers
├── main.tsx                # React root, AuthProvider
├── index.css               # Global styles, design tokens (:root)
│
├── api/                    # API / serverless helpers (e.g. membership)
├── components/             # React components
│   ├── navigation/         # Nav config (nav-config.ts)
│   ├── modals/             # Large edit/view modals (admin)
│   └── ui/                 # Shared UI (buttons, cards, hero, etc.)
├── contexts/               # React context (Auth, RequireAdmin)
├── hooks/                  # Custom hooks (useUpcomingEvents, useToast, etc.)
├── lib/                    # Utilities and Firebase init
│   ├── utils.ts            # cn() and helpers
│   └── firebase/           # Firebase app, auth, firestore
├── page-builder/            # CMS-like page renderer (e.g. Handbook)
├── pages/                  # Route-level pages (one per route)
├── services/               # Data layer (e.g. resources CRUD)
├── theme/                  # Design tokens (hex for JS; CSS in index.css)
└── types/                  # Shared TypeScript types
```

## Routing

- **Router**: React Router v7 in `App.tsx`.
- **Eager (critical path)**: `Index`, `NotFound` — imported directly for fast first load.
- **Lazy**: All other pages are loaded with `React.lazy()` when the user navigates to them. Admin pages are behind `RequireAdmin` and only load for users who hit admin routes.

**Public routes**: `/`, `/events`, `/about`, `/partnerships`, `/research`, `/join`, `/handbook`, `/handbook/*`.  
**Admin**: `/admin/login`, then under `RequireAdmin`: `/admin`, `/admin/events`, `/admin/members`, `/admin/content`, `/admin/partnerships`, `/admin/resources`, `/admin/research`, `/admin/education`, `/admin/insights`.  
**404**: Any other path → `NotFound`.

To add a new page: create a page component in `pages/`, add a lazy import and a `Route` in `App.tsx`. If it’s an admin page, wrap the route in `RequireAdmin` and add the link to `src/components/navigation/nav-config.ts` (`adminNavItems`).

## Authentication and admin

- **Auth**: Firebase Authentication; state and helpers in `contexts/AuthContext.tsx`.
- **Admin check**: Firestore `users/{uid}.role === "admin"`. Enforced in the app by `RequireAdmin` (redirects to `/admin/login` if not admin). Actual security relies on **Firebase Security Rules** for Firestore and Storage.

## Design system and tokens

- **Single source of truth**: `src/index.css` — all design tokens are defined in `:root` as HSL values (e.g. `--section-cream`, `--primary`, `--nav-active`). Tailwind is extended in `tailwind.config.ts` to use these tokens (e.g. `bg-section-cream`, `text-nav-active`).
- **JS/Canvas**: Components that need hex values (e.g. FinisherHeader) use `src/theme/tokens.ts`, which exports the same colours as hex. Keep `tokens.ts` in sync with `index.css` when adding or changing colours.

## Data and services

- **Firebase**: Primary backend. Firestore for events, resources (research/education/insights), partnerships, members, etc. Storage for uploads.
- **React Query**: Used for server state (e.g. upcoming events). Defaults: 5 min stale time, 10 min cache, 1 retry.
- **Services**: `services/resources.ts` provides CRUD and helpers for education/insight/research resources. Other data access is either in hooks (e.g. `useUpcomingEvents`) or directly in pages/modals.

## Performance

- **Code splitting**: Lazy routes; Vite `manualChunks` split large vendors (`react-vendor`, `firebase`, `ui-vendor`) for better caching.
- **Tailwind**: `content` in `tailwind.config.ts` is set to `./index.html` and `./src/**/*.{ts,tsx}` so only used styles are included.

## Things to improve (tech debt)

- **Two toast systems**: Both Radix Toaster and Sonner are mounted in `App.tsx`. Prefer consolidating on one (e.g. Sonner) and removing the other to reduce bundle and complexity.
- **Large modals**: `event-edit-modal.tsx` and the resource edit modals (research, education, insight) are large single files. Consider splitting into smaller components (e.g. form sections, image upload) and/or a shared “resource edit” base.
- **Navigation**: Logic is still mostly in one file (`Navigation.tsx`). Config is in `navigation/nav-config.ts`; further splitting (e.g. desktop nav vs. drawer) could improve maintainability.

These are documented so they can be tackled incrementally without blocking day-to-day work.
