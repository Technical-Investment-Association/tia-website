# Setup

How to get the TIA website running locally and what you need to configure.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** (or npm/yarn — project uses pnpm by default)

## Commands

```bash
# Install dependencies
pnpm install

# Run development server (http://localhost:8080)
pnpm run dev

# Production build
pnpm run build

# Preview production build locally
pnpm run preview

# Lint
pnpm run lint
```

## Environment variables

Create a `.env.local` file in the project root (never commit this file). You need Firebase config from the [Firebase Console](https://console.firebase.google.com) → Project settings → General → Your apps.

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

These same variables must be set in your hosting platform (e.g. Vercel → Project → Environment Variables) for production builds.

## Firebase setup checklist

To run the site with full functionality:

1. **Firebase project** — Create or use an existing project.
2. **Authentication** — Enable **Email/Password** sign-in.
3. **Firestore** — Create the database; deploy rules (see project or handbook for rule examples).
4. **Storage** — Create a Storage bucket if you use image/file uploads (e.g. events, partnerships).
5. **Admin access** — Create at least one user and set their role in Firestore:
  - Collection: `users`
  - Document ID: the user’s Firebase Auth UID
  - Field: `role` = `"admin"`

Without an admin user document, admin routes will redirect to `/admin/login`.

## Deployment

- **Frontend**: Typically Vercel. Push to `main` to trigger a build; ensure env vars are set in the project.
- **Backend**: Firebase only (Auth, Firestore, Storage). No separate backend server for the current app.

After deployment, run a quick smoke test: load the site, open an admin route, and confirm login and data load as expected.