// api/membership.ts
import { Resend } from "resend";
import crypto from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
// Adjust this path if your firebaseAdmin file is in a different place:
import { adminDb } from "../server/firebaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

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

export default async function handler(req: any, res: any) {
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

  try {
    const snap = await memberRef.get();

    const ipHeader = req.headers["x-forwarded-for"] as string | undefined;
    const ip = ipHeader?.split(",")[0];
    const ipHash = hashIp(ip);
    const ua = (req.headers["user-agent"] as string | undefined) ?? null;

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

    // ---------- MODE: "create_or_update" ----------
    if (mode === "create_or_update") {
      const now = FieldValue.serverTimestamp();

      // New member profile
      if (!snap.exists) {
        await memberRef.set({
          ...data,
          email,
          created_at: now,
          updated_at: now,
          signup_count: 1,
          last_signup_at: now,
          last_ip_hash: ipHash,
          last_user_agent: ua,
        });

        // Welcome email
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: "Technical Investment Association <membership@tiaassociation.com>",
            to: email,
            subject: "Welcome to Technical Investment Association",
            html: `
              <p>Hi ${data.full_name || ""},</p>
              <p>Thank you for joining Technical Investment Association.</p>
              <p>We look forward to seeing you at our events and keeping you updated on opportunities within investing and finance.</p>
            `,
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
        ...data,
        email,
        updated_at: now,
        signup_count: signupCount + 1,
        last_signup_at: now,
        last_ip_hash: ipHash,
        last_user_agent: ua,
      });

      const baseUrl = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"; // fallback for dev
      const notMeUrl = `${baseUrl.replace(
        /\/$/,
        ""
      )}/api/membership/not-me?email=${encodeURIComponent(
        email
      )}&token=${token}`;

      // "Profile updated" email with "Not me" link
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: "Technical Investment Association <membership@tiaassociation.com>",
          to: email,
          subject: "Your TIA membership profile has been updated",
          html: `
            <p>Hi ${data.full_name || ""},</p>
            <p>Your membership information with Technical Investment Association has just been updated.</p>
            <p>If this was you, no further action is required.</p>
            <p>If this was <strong>not</strong> you, please click the link below so we can review it:</p>
            <p><a href="${notMeUrl}">This was not me</a></p>
          `,
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
