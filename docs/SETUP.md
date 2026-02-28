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

# Deploy Firestore + Storage rules and indexes (see "Firestore and Storage rules" below)
pnpm run firebase:deploy-rules
```

## Environment variables

Create a **`.env.local`** file in the project root (copy from **`.env.example`**). Never commit `.env.local`.

You need two sets of values, both from your Firebase project:

### 1. Client (browser) – for the main site and admin

Firebase Console → your project → **Project settings** → **General** → **Your apps**.  
If you don’t have a web app, click “Add app” → Web (</>). Copy the config into `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...          # e.g. your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...       # e.g. your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 2. Server (API) – for the Join/membership API

Firebase Console → your project → **Project settings** → **Service accounts** → **Generate new private key**.  
Open the downloaded JSON and set in `.env.local`:

```env
FIREBASE_PROJECT_ID=...       # same as "project_id" in the JSON
FIREBASE_CLIENT_EMAIL=...     # "client_email" from the JSON
FIREBASE_PRIVATE_KEY=...      # "private_key" from the JSON (keep the \n as-is or paste the full key)
```

Optional: `RESEND_API_KEY` and `PUBLIC_BASE_URL` for membership emails (see **docs/MEMBERSHIP_API.md**).

These same variables must be set in your hosting platform (e.g. Vercel → Project → Environment Variables) for production. For the API to work locally, use `pnpm run dev:api` (Vercel CLI reads `.env.local`).

To add env vars from the terminal, use the project-installed CLI: `pnpm exec vercel env add VARIABLE_NAME production` (then paste the value when prompted). Run from the project root.

### If you switched to a new Firebase project

1. **Client config** — In the new project: Project settings → General → Your apps → use or create a Web app → copy the config into `.env.local` as all `VITE_FIREBASE_*` vars.
2. **Service account** — In the new project: Project settings → Service accounts → Generate new private key → use the JSON for `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` in `.env.local`.
3. **Vercel** — In your Vercel project → Settings → Environment Variables, add or update the same variables (all `VITE_FIREBASE_*` and the three `FIREBASE_*` server vars). Redeploy so the new values are used.
4. **Firestore & Auth** — In the new project: enable Email/Password auth, create Firestore, deploy rules and indexes from this repo (`firebase use <project-id>` then `pnpm run firebase:deploy-rules`), create an admin user and their `users/{uid}` doc with `role: "admin"`.

## Firebase setup checklist

To run the site with full functionality:

1. **Firebase project** — Create or use an existing project at [Firebase Console](https://console.firebase.google.com).
2. **Client config** — In Project settings → General → Your apps, add a Web app if needed. Copy the config into `.env.local` as the `VITE_FIREBASE_*` variables (see above).
3. **Service account (for API)** — In Project settings → Service accounts, generate a new private key. Use the JSON’s `project_id`, `client_email`, and `private_key` as `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in `.env.local`.
4. **Authentication** — Enable **Email/Password** sign-in (Build → Authentication → Sign-in method).
5. **Authorized domains (fixes Firestore “access control checks” in production)** — In **Project settings** → **General** → scroll to **Authorized domains**. Add every domain where the app runs:
   - `tiaassociation.com`
   - `www.tiaassociation.com`
   - `localhost` (usually already there)
   - For Vercel previews: `*.vercel.app` (or add each preview URL if needed).  
   If a domain is missing, the browser will block Firestore (and sometimes Auth) with “Fetch API cannot load … due to access control checks”.
6. **Firestore** — Create the database; deploy rules and indexes from this repo: run `pnpm run firebase:deploy-rules` from the project root (see **Firestore and Storage rules** below).
7. **Storage** — Create a Storage bucket if you use image/file uploads (e.g. events, partnerships). Rules are in `firebase/storage.rules` and deploy with `pnpm run firebase:deploy-rules`.
8. **Admin access** — Create at least one user (Authentication → Users → Add user), then in Firestore create a document:
   - Collection: `users`
   - Document ID: the user’s Firebase Auth **UID** (from Authentication → Users)
   - Field: `role` = `"admin"`

Without an admin user document, admin routes will redirect to `/admin/login`.

## Firestore and Storage rules — edit in repo, deploy with CLI

Rules and indexes are **not** maintained in the Firebase Console. They live in this repo and are deployed with the Firebase CLI. That way changes are versioned and you never have to copy-paste rules into the console.

### Where rules and indexes live

| What | File |
|------|------|
| Firestore rules | `firebase/firestore.rules` |
| Firestore indexes | `firebase/firestore.indexes.json` |
| Storage rules | `firebase/storage.rules` |

The root **`firebase.json`** tells the Firebase CLI to use these files when you deploy.

### Deploying rules and indexes

From the project root (with [Firebase CLI](https://firebase.google.com/docs/cli) installed and the project linked via `firebase use <project-id>`):

```bash
# Deploy Firestore rules + indexes and Storage rules only (no other Firebase services)
pnpm run firebase:deploy-rules
```

Or with the Firebase CLI directly:

```bash
firebase deploy --only firestore,storage
```

This updates Firestore (rules and compound indexes) and Storage rules from the local files. After changing any rule or index file, run the deploy command again; the Console will then reflect the same content.

### Adding or changing indexes

Edit **`firebase/firestore.indexes.json`**. The format is [Firestore index definition](https://firebase.google.com/docs/firestore/query-data/indexing). After editing, run `pnpm run firebase:deploy-rules` (or `firebase deploy --only firestore,storage`). New indexes may show as “Building” in the Console until Firestore finishes building them.

## Deployment

- **Frontend**: Typically Vercel. Push to `main` to trigger a build; ensure env vars are set in the project.
- **Backend**: Firebase only (Auth, Firestore, Storage). No separate backend server for the current app.

After deployment, run a quick smoke test: load the site, open an admin route, and confirm login and data load as expected.