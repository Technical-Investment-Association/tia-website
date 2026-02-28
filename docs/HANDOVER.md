# Handover and onboarding

A practical guide for handing over the TIA website to another developer or team, and for new developers joining the project.

## Quick start for a new developer

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd website-new
   pnpm install
   ```
2. **Environment** — Copy or create `.env.local` with Firebase env vars (see [SETUP.md](./SETUP.md)). Without them, the app will run but auth and data will not work.
3. **Run**
   ```bash
   pnpm run dev
   ```
   Open http://localhost:8080. Use an admin account (Firestore `users/{uid}.role = "admin"`) to access `/admin/*` routes.
4. **Read** [SETUP.md](./SETUP.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) for structure and conventions.

## Where things live

| I want to… | Look here |
|------------|-----------|
| **Domain / email** | **Domain:** Squarespace. **Receiving:** ImprovMX (aliases). **Sending:** Resend (membership API emails). See [RESEND_SETUP.md](./RESEND_SETUP.md). |
| Add or change a **public nav link** | `src/components/navigation/nav-config.ts` → `navLinks` |
| Add or change an **admin menu item** | `src/components/navigation/nav-config.ts` → `adminNavItems`, then add the route in `App.tsx` |
| Add a **new page** | Create `src/pages/YourPage.tsx`, add lazy import + `<Route>` in `App.tsx` |
| Change **colors / design tokens** | `src/index.css` (`:root`) and optionally `src/theme/tokens.ts` (hex for JS). Then Tailwind classes like `bg-section-cream` work. |
| Change **Firebase** config | `.env.local` (and hosting env vars). Init in `src/lib/firebase/firebase.ts`. |
| Change **auth / who is admin** | `contexts/AuthContext.tsx`; admin check is Firestore `users/{uid}.role === "admin"`. |
| Add **CRUD for a new resource type** | `services/` for data layer, `types/` for types, then a page + modal under `pages/` and `components/modals/`. |
| Edit **static/cms-like content** | Page builder lives in `page-builder/`; editable blocks use `EditableTextBlock` with a `contentId`. |

## Common tasks

- **New admin section**: Add route in `App.tsx` (wrapped in `RequireAdmin`), add entry to `adminNavItems` in `nav-config.ts`, create the page under `pages/`.
- **New public page**: New file in `pages/`, lazy import and route in `App.tsx`. Add to `navLinks` in `nav-config.ts` if it should appear in the nav.
- **New design token**: Add variable in `:root` in `index.css` (HSL). Add to `theme.extend.colors` in `tailwind.config.ts` if you want a Tailwind class. If a JS component needs the colour (e.g. canvas), add the hex to `theme/tokens.ts`.

## Handover checklist

Use this when transferring ownership or onboarding a new maintainer:

- [ ] **Access**: Repo, hosting (e.g. Vercel), Firebase project, and any other services.
- [ ] **Secrets**: Env vars (dev and prod) documented or passed securely; `.env.local` not committed.
- [ ] **Docs**: README and `docs/` (SETUP, ARCHITECTURE, HANDOVER) up to date; contact/ownership updated.
- [ ] **Deploy**: Confirm deploy pipeline (e.g. push to `main` → Vercel build), and that production env vars are set.
- [ ] **Firebase**: Auth, Firestore rules, Storage rules, and at least one admin user documented or created.
- [ ] **Run through**: New person can run `pnpm install`, `pnpm run dev`, log in as admin, and see data.
- [ ] **Tech debt**: Known issues (e.g. two toasts, large modals) noted in ARCHITECTURE or a ticket so they’re not forgotten.

## Contact and maintenance

- The project is maintained by the Technical Investment Association (TIA).
- Update the contact section in the root README when ownership or main contacts change.
- Prefer small, reviewable changes; use branches and avoid pushing directly to `main`.
