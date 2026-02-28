// api/membership.ts
import { Resend } from "resend";
import crypto from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../server/firebaseAdmin";
import {
  getWelcomeEmailHtmlResolved,
  getProfileUpdatedEmailHtmlResolved,
  getConfirmEmailHtmlResolved,
} from "../server/emailTemplatesServer";
import { getUpdateProfileLinkEmailHtml } from "@/lib/email-templates";

// Resend is optional: use placeholder when no key so the server can start (emails only sent when RESEND_API_KEY is set)
const resend = new Resend(process.env.RESEND_API_KEY || "re_local_dev_no_send");

const DEFAULT_FROM = "Technical Investment Association <membership@tiaassociation.com>";
function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
}

/** Base URL for links in emails (confirm, unsubscribe, deactivate, update profile).
 * Must be your public site URL (e.g. https://tiaassociation.com) so recipients can open links.
 * localhost is only used when unset (e.g. local dev); in production set PUBLIC_BASE_URL to your real domain. */
function getBaseUrl(): string {
  let base = process.env.PUBLIC_BASE_URL;
  if (!base && process.env.VERCEL) {
    base = "https://tiaassociation.com";
  }
  base = (base ?? "http://localhost:3000").replace(/\/$/, "");
  if (!/^https?:\/\//i.test(base)) {
    base = `http://${base}`;
  }
  return base;
}

// Hash IP so we don't store raw addresses (privacy-friendly)
function hashIp(ip: string | undefined): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex");
}

// Rate limiting: max 1 write per minute, max 3 writes per 24h
function isRateLimited(
  lastSignupAt: Timestamp | null,
  signupCount: number
): boolean {
  if (!lastSignupAt) return false;

  const now = Date.now();
  const last = lastSignupAt.toMillis();
  const diffMs = now - last;

  const oneMinute = 60 * 1000;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diffMs < oneMinute) return true;
  if (signupCount >= 3 && diffMs < oneDay) return true;

  return false;
}

/** Create one-time tokens for unsubscribe and deactivate; return URLs for use in email templates (GDPR). */
async function createUnsubscribeAndDeactivateUrls(email: string): Promise<{
  unsubscribeUrl: string;
  deactivateProfileUrl: string;
}> {
  const baseUrl = getBaseUrl();
  const unsubToken = crypto.randomBytes(32).toString("hex");
  const deactToken = crypto.randomBytes(32).toString("hex");
  await Promise.all([
    adminDb.collection("membership_unsubscribe_tokens").doc(unsubToken).set({
      email,
      created_at: FieldValue.serverTimestamp(),
      used: false,
    }),
    adminDb.collection("membership_deactivate_tokens").doc(deactToken).set({
      email,
      created_at: FieldValue.serverTimestamp(),
      used: false,
    }),
  ]);
  return {
    unsubscribeUrl: `${baseUrl}/api/membership/unsubscribe?token=${unsubToken}`,
    deactivateProfileUrl: `${baseUrl}/profile/deactivate?token=${deactToken}`,
  };
}

export default async function handler(req: any, res: any) {
  // Allow CORS preflight so browser POST can succeed
  if (req.method === "OPTIONS") {
    res.setHeader?.("Access-Control-Allow-Origin", "*");
    res.setHeader?.("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader?.("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end?.();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  const { mode, data } = req.body || {};

  if (!data || !data.email) {
    res.status(400).send("Missing data or email");
    return;
  }

  const email = String(data.email).trim().toLowerCase();
  const memberRef = adminDb.collection("member_signups").doc(email);

  // Firestore does not accept undefined; strip those keys from data
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  ) as Record<string, unknown>;

  try {
    const snap = await memberRef.get();

    const headers = req.headers ?? {};
    const ipHeader = headers["x-forwarded-for"] as string | undefined;
    const ip = ipHeader?.split(",")[0];
    const ipHash = hashIp(ip);
    const ua = (headers["user-agent"] as string | undefined) ?? null;

    // ---------- MODE: "check" ----------
    if (mode === "check") {
      if (!snap.exists) {
        // No existing profile; frontend can just proceed as "created"
        res.json({ status: "created" });
        return;
      }

      const docData = snap.data()!;
      const signupCount = (docData.signup_count as number) || 1;
      const lastSignupAt =
        (docData.last_signup_at as Timestamp | undefined) ?? null;

      if (isRateLimited(lastSignupAt, signupCount)) {
        res.json({ status: "rate_limited" });
        return;
      }

      res.json({ status: "exists" });
      return;
    }

    // ---------- MODE: "send_update_link" ----------
    if (mode === "send_update_link") {
      if (!snap.exists) {
        res.status(400).json({ error: "No membership found for this email." });
        return;
      }
      const baseUrl = getBaseUrl();
      const token = crypto.randomBytes(32).toString("hex");
      await adminDb.collection("membership_update_tokens").doc(token).set({
        email,
        created_at: FieldValue.serverTimestamp(),
        used: false,
      });
      const updateProfileUrl = `${baseUrl.replace(/\/$/, "")}/profile/update?token=${token}`;
      const { unsubscribeUrl, deactivateProfileUrl } = await createUnsubscribeAndDeactivateUrls(email);
      if (process.env.RESEND_API_KEY) {
        const docData = snap.data()!;
        const html = getUpdateProfileLinkEmailHtml({
          full_name: (docData.full_name as string) || undefined,
          email,
          update_profile_url: updateProfileUrl,
          unsubscribe_url: unsubscribeUrl,
          deactivate_profile_url: deactivateProfileUrl,
        });
        await resend.emails.send({
          from: getFromAddress(),
          to: email,
          subject: "Update your TIA membership profile",
          html,
        });
      }
      res.json({ status: "email_sent" });
      return;
    }

    // ---------- MODE: "create_or_update" ----------
    if (mode === "create_or_update") {
      const now = FieldValue.serverTimestamp();

      // New member profile
      if (!snap.exists) {
        await memberRef.set({
          ...cleanData,
          email,
          email_confirmed: false,
          created_at: now,
          updated_at: now,
          signup_count: 1,
          last_signup_at: now,
          last_ip_hash: ipHash,
          last_user_agent: ua,
        });

        // Welcome email (no confirm link in body) + separate Confirm email
        if (process.env.RESEND_API_KEY) {
          const baseUrlForConfirm = getBaseUrl();
          const { unsubscribeUrl, deactivateProfileUrl } = await createUnsubscribeAndDeactivateUrls(email);
          const welcomeHtml = await getWelcomeEmailHtmlResolved({
            full_name: data.full_name as string | undefined,
            email,
            unsubscribe_url: unsubscribeUrl,
            deactivate_profile_url: deactivateProfileUrl,
          });
          await resend.emails.send({
            from: getFromAddress(),
            to: email,
            subject: "Welcome to Technical Investment Association",
            html: welcomeHtml,
          });
          const confirmToken = crypto.randomBytes(32).toString("hex");
          await adminDb.collection("membership_confirm_tokens").doc(confirmToken).set({
            email,
            created_at: FieldValue.serverTimestamp(),
            used: false,
          });
          const confirmUrl = `${baseUrlForConfirm}/api/membership/confirm-email?token=${confirmToken}`;
          const confirmHtml = await getConfirmEmailHtmlResolved({
            full_name: data.full_name as string | undefined,
            email,
            confirm_email_url: confirmUrl,
            unsubscribe_url: unsubscribeUrl,
            deactivate_profile_url: deactivateProfileUrl,
          });
          await resend.emails.send({
            from: getFromAddress(),
            to: email,
            subject: "Confirm your email address",
            html: confirmHtml,
          });
        }

        res.json({ status: "created" });
        return;
      }

      // Existing member – enforce rate limit
      const docData = snap.data()!;
      const signupCount = (docData.signup_count as number) || 1;
      const lastSignupAt =
        (docData.last_signup_at as Timestamp | undefined) ?? null;

      if (isRateLimited(lastSignupAt, signupCount)) {
        res.json({ status: "rate_limited" });
        return;
      }

      // Generate "not me" token
      const token = crypto.randomBytes(32).toString("hex");
      await adminDb.collection("membership_not_me_tokens").doc(token).set({
        email,
        created_at: FieldValue.serverTimestamp(),
        used: false,
      });

      // Update profile
      await memberRef.update({
        ...cleanData,
        email,
        updated_at: now,
        signup_count: signupCount + 1,
        last_signup_at: now,
        last_ip_hash: ipHash,
        last_user_agent: ua,
      });

      const baseUrl = getBaseUrl();
      const notMeUrl = `${baseUrl.replace(
        /\/$/,
        ""
      )}/api/membership/not-me?email=${encodeURIComponent(
        email
      )}&token=${token}`;

      const { unsubscribeUrl, deactivateProfileUrl } = await createUnsubscribeAndDeactivateUrls(email);

      // "Profile updated" email with "Not me" link
      if (process.env.RESEND_API_KEY) {
        const html = await getProfileUpdatedEmailHtmlResolved({
          full_name: data.full_name as string | undefined,
          email,
          not_me_url: notMeUrl,
          unsubscribe_url: unsubscribeUrl,
          deactivate_profile_url: deactivateProfileUrl,
        });
        await resend.emails.send({
          from: getFromAddress(),
          to: email,
          subject: "Your TIA membership profile has been updated",
          html,
        });
      }

      res.json({ status: "updated" });
      return;
    }

    // ---------- Unknown mode ----------
    res.status(400).send("Unknown mode");
  } catch (err: any) {
    console.error("membership handler error", err);
    res.status(500).send("Internal server error");
  }
}
