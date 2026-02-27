# Technical Investment Association — Website

Public-facing website and admin portal for the Technical Investment Association (TIA).

## What this project provides

- **Public site**: Home, Events, About, Partnerships, Research, Join, Handbook
- **Admin portal**: Manage events, members, partnerships, resources (research, education, insights), and content
- **Design system**: Single source of truth for colours and tokens in `src/index.css` and `src/theme/tokens.ts`
- **Tech stack**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Firebase (Auth, Firestore, Storage)

## Quick start

```bash
pnpm install
# Create .env.local with your Firebase config (see docs/SETUP.md)
pnpm run dev
```

Open http://localhost:8080. Full setup steps and env vars are in **[docs/SETUP.md](docs/SETUP.md)**.

## Documentation

| Doc | Purpose |
|-----|---------|
| [**docs/SETUP.md**](docs/SETUP.md) | Environment, Firebase, commands, deployment |
| [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md) | Structure, routing, auth, design tokens, performance |
| [**docs/HANDOVER.md**](docs/HANDOVER.md) | Onboarding, where things live, handover checklist |

Start with **docs/SETUP.md** to get running; use **docs/HANDOVER.md** when handing over to someone new.

## Authentication and roles

- Admins sign in with Firebase (email/password).
- Admin status: Firestore document `users/{uid}` with `role: "admin"`.
- Admin routes are protected by `RequireAdmin`; security is enforced by Firebase Security Rules.

## Project structure (high level)

```
src/
├── App.tsx           # Routes and global providers
├── index.css         # Design tokens and global styles
├── components/      # Shared components (navigation, modals, ui)
├── contexts/        # Auth and RequireAdmin
├── hooks/            # e.g. useUpcomingEvents, useToast
├── lib/              # Utils and Firebase init
├── pages/            # One component per route
├── services/         # Data layer (e.g. resources)
├── theme/            # Design tokens for JS (e.g. FinisherHeader)
└── types/            # Shared TypeScript types
```

Details and conventions are in **docs/ARCHITECTURE.md**.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start dev server (port 8080) |
| `pnpm run build` | Production build |
| `pnpm run preview` | Preview production build locally |
| `pnpm run lint` | Run ESLint |

## Deployment

The frontend is typically deployed on **Vercel**. Push to `main` to trigger a build. Set the same Firebase env vars in the Vercel project. Backend is Firebase only (no separate server).

## Contributing

1. Create a branch from `main`.
2. Make small, clear changes.
3. Open a pull request.
4. Get a review, then merge.

Avoid pushing directly to `main`.

## Contact

This project is maintained by the Technical Investment Association (TIA).  
For questions or onboarding, see **docs/HANDOVER.md** or contact the website team.

---

*Current contact (2025/26): Nora Johannessen — johannessen.nora@gmail.com | +47 90807591*
