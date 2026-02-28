// src/server/firebaseAdmin.ts
import { initializeApp, cert, getApps, getApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

let app: App | null = null;

function getAppOrInit(): App {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApp();
    return app;
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin env. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in Vercel (or .env.local for dev)."
    );
  }
  app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return app;
}

let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getDb(): Firestore {
  if (!_db) _db = getFirestore(getAppOrInit());
  return _db;
}
function getAuthInstance(): Auth {
  if (!_auth) _auth = getAuth(getAppOrInit());
  return _auth;
}

export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    const target = getDb() as unknown as Record<string, unknown>;
    const value = target[prop as string];
    if (typeof value === "function") {
      return value.bind(target);
    }
    return value;
  },
});
export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    const target = getAuthInstance() as unknown as Record<string, unknown>;
    const value = target[prop as string];
    if (typeof value === "function") {
      return value.bind(target);
    }
    return value;
  },
});
