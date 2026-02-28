/**
 * POST /api/membership/deactivate (body: { token }) or GET /api/membership/deactivate?token=xxx
 * Confirms profile deactivation (GDPR). Sets deactivated_at on member, marks token used, redirects to /profile/deactivated.
 */
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../server/firebaseAdmin";

const TOKEN_COLLECTION = "membership_deactivate_tokens";
const MEMBER_COLLECTION = "member_signups";

function getBaseUrl(): string {
  let base = process.env.PUBLIC_BASE_URL;
  if (!base && process.env.VERCEL) base = "https://tiaassociation.com";
  base = (base ?? "http://localhost:3000").replace(/\/$/, "");
  if (!/^https?:\/\//i.test(base)) base = `http://${base}`;
  return base;
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader?.("Allow", "GET, POST");
    res.status(405).send("Method not allowed");
    return;
  }

  let token: string | undefined;
  if (req.method === "GET") {
    token = (req.query?.token as string)?.trim();
  } else {
    const body = typeof req.body === "string" ? (req.body ? JSON.parse(req.body) : {}) : req.body ?? {};
    if (body && typeof body === "object" && "token" in body) {
      token = (body.token as string)?.trim();
    } else if (typeof req.body === "string" && req.body.includes("=")) {
      const params = new URLSearchParams(req.body);
      token = params.get("token")?.trim() ?? undefined;
    }
  }
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const tokenRef = adminDb.collection(TOKEN_COLLECTION).doc(token);
    const tokenSnap = await tokenRef.get();

    if (!tokenSnap.exists) {
      res.status(400).send("Invalid or expired link");
      return;
    }

    const tokenData = tokenSnap.data() as { email: string; used?: boolean };
    if (tokenData.used) {
      const baseUrl = getBaseUrl();
      const redirectUrl = `${baseUrl}/profile/deactivated`;
      if (typeof res.redirect === "function") {
        res.redirect(302, redirectUrl);
      } else {
        res.writeHead?.(302, { Location: redirectUrl });
        res.end?.();
      }
      return;
    }

    const email = (tokenData.email ?? "").toLowerCase();
    if (!email) {
      res.status(400).send("Invalid token");
      return;
    }

    const memberRef = adminDb.collection(MEMBER_COLLECTION).doc(email);
    const memberSnap = await memberRef.get();
    if (memberSnap.exists) {
      await memberRef.update({
        deactivated_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });
    }
    await tokenRef.update({
      used: true,
      used_at: FieldValue.serverTimestamp(),
    });

    const baseUrl = getBaseUrl();
    const redirectUrl = `${baseUrl}/profile/deactivated`;
    if (typeof res.redirect === "function") {
      res.redirect(302, redirectUrl);
    } else {
      res.writeHead?.(302, { Location: redirectUrl });
      res.end?.();
    }
  } catch (err) {
    console.error("[deactivate]", err);
    res.status(500).send("Internal server error");
  }
}
