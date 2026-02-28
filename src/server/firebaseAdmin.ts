// src/server/firebaseAdmin.ts
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

/** Ensure PEM private key has newlines so Firebase cert() accepts it (Vercel often strips newlines when pasting). */
function normalizePrivateKey(key: string): string {
  let out = key.replace(/\\n/g, "\n").trim();
  if (!out.includes("\n") && out.includes("-----BEGIN") && out.includes("-----END")) {
    const match = out.match(/-----BEGIN PRIVATE KEY-----(.*?)-----END PRIVATE KEY-----/s);
    if (match) {
      const middle = match[1].replace(/\s/g, "");
      out = `-----BEGIN PRIVATE KEY-----\n${middle}\n-----END PRIVATE KEY-----`;
    }
  }
  return out;
}

function getAppOrInit() {
  if (getApps().length > 0) {
    return getApp();
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawKey) {
    throw new Error(
      "Missing Firebase Admin env. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in Vercel (or .env.local for dev)."
    );
  }
  const privateKey = normalizePrivateKey(rawKey);
  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const app = getAppOrInit();

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
