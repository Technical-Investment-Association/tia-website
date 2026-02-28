/**
 * GET /api/membership/unsubscribe?token=xxx
 * One-click unsubscribe from newsletters (GDPR). Sets newsletter_consent = false, marks token used, redirects to /newsletter/unsubscribed.
 */
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../server/firebaseAdmin";

const TOKEN_COLLECTION = "membership_unsubscribe_tokens";
const MEMBER_COLLECTION = "member_signups";

function getBaseUrl(): string {
  let base = process.env.PUBLIC_BASE_URL;
  if (!base && process.env.VERCEL) base = "https://tiaassociation.com";
  base = (base ?? "http://localhost:3000").replace(/\/$/, "");
  if (!/^https?:\/\//i.test(base)) base = `http://${base}`;
  return base;
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader?.("Allow", "GET");
    res.status(405).send("Method not allowed");
    return;
  }

  const token = (req.query?.token as string)?.trim();
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
      const redirectUrl = `${baseUrl}/newsletter/unsubscribed`;
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
        newsletter_consent: false,
        updated_at: FieldValue.serverTimestamp(),
      });
    }
    await tokenRef.update({
      used: true,
      used_at: FieldValue.serverTimestamp(),
    });

    const baseUrl = getBaseUrl();
    const redirectUrl = `${baseUrl}/newsletter/unsubscribed`;
    if (typeof res.redirect === "function") {
      res.redirect(302, redirectUrl);
    } else {
      res.writeHead?.(302, { Location: redirectUrl });
      res.end?.();
    }
  } catch (err) {
    console.error("[unsubscribe]", err);
    res.status(500).send("Internal server error");
  }
}
