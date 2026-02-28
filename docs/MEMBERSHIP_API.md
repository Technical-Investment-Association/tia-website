# Membership API – Why it exists and how to set it up

## Why use an API instead of writing to Firestore from the browser?

The Join page could write directly to Firestore (your rules allow `create: if true` on `member_signups`), but the API is used because it provides:

1. **“Already have this email?” check** – Firestore rules allow only admins to **read** `member_signups`. So the browser cannot check “does this email already exist?” The API runs with the Firebase Admin SDK and can read the collection, then tell the frontend whether to show “Update existing membership?” or create new.

2. **Rate limiting** – The API enforces: max 1 signup per minute, max 3 per 24 hours per email. That reduces abuse and accidental duplicate submissions. This needs server-side state (e.g. `last_signup_at`, `signup_count` in the doc).

3. **Emails** – Welcome emails and “Your profile was updated” emails (with the “Not me” link) are sent from the server using Resend. The browser cannot send these without exposing an API key.

4. **“Not me” flow** – When someone updates an existing email, the API creates a one-time token in `membership_not_me_tokens` and sends a link. Only the server can create/read that collection (client has no access). Clicking the link flags the membership for review.

So you need the API for the current Join flow (check → create/update, rate limit, emails, not-me).

---

## Do you need to change Firebase or the rules?

**No.** Your current Firestore rules are already correct:

- **`member_signups`** – `create: if true` (anyone can create; the API uses Admin SDK and can read/update). `get, list, update, delete` only for admins. No change needed.
- **`newsletter_signups`** – Same pattern. No change needed.
- **`membership_not_me_tokens`** – There is no rule for this collection, so the default deny applies. Only the backend (Firebase Admin SDK) can read/write it. You do **not** need to add a rule for it; the API runs on your server and bypasses rules.

You only need to:

- Have a **Firebase service account** (or the same credentials you use for Admin SDK) and put them in the environment where the API runs (see below).
- Optionally create the **Resend** API key and set `RESEND_API_KEY` if you want welcome/update emails. See **[docs/RESEND_SETUP.md](docs/RESEND_SETUP.md)** for step-by-step Resend setup (account, API key, domain verification). TIA uses Squarespace for the domain, ImprovMX for receiving (aliases), and Resend for sending.

---

## How to set up the API

The app expects the API at **`/api/membership`** (and **`/api/membership/not-me`** for the “Not me” link). The implementation lives under `src/api/` and is exposed via the root **`api/`** folder so Vercel runs it as serverless functions.

### 1. Local development

For local dev, the Vite app and the membership API can run **without** `vercel dev` (which often breaks Vite’s dev server due to rewrites). Use either:

**Option A – Recommended: Vite + local API server**

```bash
pnpm install
pnpm run dev:full
```

This starts:
- **Vite** at http://localhost:8080 (site + HMR)
- **Local API server** at http://localhost:3001; Vite proxies `/api` to it.

Open **http://localhost:8080**. The Join form will call `/api/membership` and the proxy forwards to the local API. Ensure `.env.local` has the Firebase Admin vars (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).

To run only the API server (e.g. with Vite in another terminal):

```bash
pnpm run dev:api-server
```

**Option B – Vercel CLI**

```bash
pnpm run dev:api
# or: pnpm exec vercel dev
```

If prompted, log in with `vercel login` (device flow). Then open the URL Vercel prints. Note: `vercel dev` can hit 404s for Vite assets because of how rewrites are applied; if that happens, use Option A instead.

### 2. Production (Vercel)

- **Deploy** as usual (e.g. `vercel` or Git integration). The root **`api/`** folder is deployed as serverless functions:
  - `api/membership.ts` → **`/api/membership`**
  - `api/membership/not-me.ts` → **`/api/membership/not-me`**

- **Environment variables** (in Vercel → Project → Settings → Environment Variables):

  - **Firebase Admin (required for the API to read/write Firestore)**  
    - `FIREBASE_PROJECT_ID`  
    - `FIREBASE_CLIENT_EMAIL`  
    - `FIREBASE_PRIVATE_KEY` (full key; if you paste from Firebase Console, keep newlines or use `\n` in one line and the code will replace `\\n`)

  - If you see **500 / "This Serverless Function has crashed"** when opening confirm-email or when signing up: check that all three Firebase vars are set in Vercel for the correct environment (Production/Preview). The private key must be the full PEM including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. If you pasted it as one line (e.g. Vercel stripped newlines), the code will try to normalize it; if it still fails, open **Vercel → Project → Logs**, find the failed request, and read the error message to see whether it’s a cert/key error or something else.

  - **Optional**  
    - `RESEND_API_KEY` – If set, the API sends welcome and “profile updated” emails via Resend.  
    - `PUBLIC_BASE_URL` – Full site URL (e.g. `https://tiaassociation.com`) for email links (confirm, “Not me”, unsubscribe, deactivate). If unset, the code falls back to `http://localhost:3000`.

- **Rewrites**  
  Your `vercel.json` currently rewrites all routes to `/`. Vercel runs **API routes before rewrites**, so `/api/membership` and `/api/membership/not-me` are still served by the serverless functions. No change to `vercel.json` is required for the API to work.

- **405 on POST /api/membership**  
  If the Join form gets **405 Method Not Allowed** in production, the request may be hitting the static app instead of the serverless function. In **Vercel → Project → Settings → Build & Development**:
  - Ensure **Output Directory** is **empty** or set to **`.`** (project root). If it is set to **`dist`** only, Vercel deploys only the contents of `dist/` and the **`api/`** folder is not included, so `/api/membership` has no function and falls through to the SPA (which returns 405 for POST).
  - Build command should be **`pnpm run build`** (or `vite build && node scripts/build-api.mjs`) so that `api/*.js` bundles are produced before deploy. The repo’s `vercel.json` sets `buildCommand` to `pnpm run build` so the API bundle step runs.

### 3. Getting Firebase Admin credentials

1. Firebase Console → Project → **Project settings** → **Service accounts**.  
2. **Generate new private key** (or use an existing service account).  
3. In the JSON file you get:  
   - `project_id` → `FIREBASE_PROJECT_ID`  
   - `client_email` → `FIREBASE_CLIENT_EMAIL`  
   - `private_key` → `FIREBASE_PRIVATE_KEY`  

Never commit this JSON or put these values in the repo; use env vars only.

---

## Summary

- **Why API:** Check existing email, rate limiting, emails, and “Not me” flow; all require server-side logic and Admin SDK.  
- **Firebase:** No rule changes needed.  
- **Setup:** Use root **`api/`** for Vercel serverless; set Firebase (+ optional Resend and `PUBLIC_BASE_URL`) env vars; for local dev use `vercel dev` (or your own proxy to the same handlers).
