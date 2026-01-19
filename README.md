# Technical Investment Association Website

This project aims to provide:
- A clean and professional public-facing website  
- A secure admin portal for managing content (events, news, research, members)  
- A maintainable CMS-like system for static text (EditableTextBlock)  
- A future-proof platform for TIA to build on

---

## Tech Stack

**Frontend**
- React 18 + TypeScript  
- Vite  
- Tailwind CSS design system  
- shadcn/ui component library  
- Framer Motion  
- React Router v6  

**Backend / Infrastructure**
- Firebase Authentication  
- Firebase Firestore  
- Firebase Storage  

---

## Authentication & Roles

- Admins sign in with Firebase email/password  
- Each admin must have a Firestore document under:  
  `users/{uid} → role: "admin"`  
- Admin-only pages are protected via:
  - React (`RequireAdmin`)
  - Firebase Security Rules

---

## Project Structure

```

public/
src/
components/
    ui/
    contexts/
    hooks/
    lib/
        firebase/
        pages/
    index.css
    App.tsx

```

---

## Environment Variables

Create `.env.local`:

```

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

```

These must also be added in **Vercel → Project → Environment Variables**.

---

## Development

### Install dependencies
```

npm install

```

### Run Dev Server
```

npm run dev

```

### Build for Production
```

npm run build

```

---

## Firebase Setup Checklist

To run the site fully you need:

✔ A Firebase project  
✔ Auth enabled (Email/Password)  
✔ Firestore database (rules included in handbook)  
✔ Storage bucket  
✔ At least one admin user  
✔ Admin’s Firestore role set:  
`users/{uid}.role = "admin"`  

---

## Website Handbook

A full handbook is included on the website at `/handbook`. 

---

## CMS Static Content

Static text on pages is editable using:

`<EditableTextBlock contentId="page.section.key" />`

Admins can toggle “Preview Mode” to view the site as visitors.

---

## Contributing

1. Create a new branch from `main`  
2. Commit small, clear changes  
3. Create a pull request  
4. Another team member approves  
5. Merge into `main`  

Never push directly to `main`.

---

## Deployment

**Vercel** is used for hosting the frontend.  
Firebase is used only as the backend.

To deploy:

- Push to `main`  
- Vercel builds and deploys automatically  
- Ensure environment variables match your `.env.local`  

---

## Contact

For any questions or onboarding of new developers, see the **handbook** or contact the website team.

```

This project is maintained by the Technical Investment Association (TIA).
Curent contact 25/26: Nora Johannessen | johannessen.nora@gmail.com | +47 90807591

```

---