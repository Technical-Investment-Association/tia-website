/**
 * GET /api/membership/confirm-email?token=xxx
 * Sets email_confirmed = true for the member and marks the token used.
 * Used from the welcome email "Confirm your email" link for new signups.
 */
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../server/firebaseAdmin";

const TOKEN_COLLECTION = "membership_confirm_tokens";
const MEMBER_COLLECTION = "member_signups";

function getBaseUrl(): string {
  let base = process.env.PUBLIC_BASE_URL;
  if (!base && process.env.VERCEL) base = "https://tiaassociation.com";
  base = (base ?? "http://localhost:3000").replace(/\/$/, "");
  if (!/^https?:\/\//i.test(base)) base = `http://${base}`;
  return base;
}

function doRedirect(res: any, url: string, status = 302): void {
  try {
    if (typeof res.redirect === "function") {
      res.redirect(status, url);
    } else if (typeof res.writeHead === "function" && typeof res.end === "function") {
      res.writeHead(status, { Location: url });
      res.end();
    } else {
      res.status(302).setHeader?.("Location", url);
      res.end?.();
    }
  } catch (_) {
    try {
      res.status(302);
      res.setHeader?.("Location", url);
      res.end?.();
    } catch (_) {}
  }
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader?.("Allow", "GET");
    res.status(405).send("Method not allowed");
    return;
  }

  const token = req.query?.token as string;
  const tokenFromUrl =
    typeof req.url === "string" && req.url.includes("token=")
      ? new URL(req.url, "http://localhost").searchParams.get("token")
      : null;
  const tokenValue = (token?.trim() || tokenFromUrl?.trim() || "") as string;
  if (!tokenValue) {
    res.status(400).send("Missing token");
    return;
  }

  const redirectOk = () => doRedirect(res, `${getBaseUrl()}/profile/confirmed`);
  const redirectError = () => doRedirect(res, `${getBaseUrl()}/profile/confirmed?error=1`);

  try {
    const tokenRef = adminDb.collection(TOKEN_COLLECTION).doc(tokenValue);
    const tokenSnap = await tokenRef.get();

    if (!tokenSnap.exists) {
      res.status(400).send("Invalid or expired link");
      return;
    }

    const tokenData = tokenSnap.data() as { email: string; used?: boolean };
    if (tokenData.used) {
      redirectOk();
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
        email_confirmed: true,
        updated_at: FieldValue.serverTimestamp(),
      });
    }
    await tokenRef.update({
      used: true,
      used_at: FieldValue.serverTimestamp(),
    });

    redirectOk();
  } catch (err) {
    console.error("[confirm-email]", err);
    redirectError();
  }
}
