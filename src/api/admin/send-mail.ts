/**
 * POST /api/admin/send-mail
 * Admin-only: send an email to an audience (all members, newsletter consent, or newsletter signups).
 * Body: { audience, subject, html }. Header: Authorization: Bearer <Firebase ID token>.
 */

import { Resend } from "resend";
import { adminDb, adminAuth } from "../../server/firebaseAdmin";
import { getCampaignEmailHtml } from "../../lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY || "");
const DEFAULT_FROM = "Technical Investment Association <membership@tiaassociation.com>";

function getFrom(): string {
  return process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
}

type Audience = "all_members" | "newsletter_consent" | "newsletter_signups";

async function getRecipientEmails(audience: Audience): Promise<string[]> {
  const from = getFrom();
  if (audience === "newsletter_signups") {
    const snap = await adminDb.collection("newsletter_signups").get();
    const emails = snap.docs
      .map((d) => (d.data().email as string) || d.id)
      .filter((e) => e && e.includes("@"));
    return [...new Set(emails)];
  }
  const membersSnap = await adminDb.collection("member_signups").get();
  const emails = membersSnap.docs
    .map((d) => {
      const data = d.data();
      const email = (data.email as string) || d.id;
      if (audience === "newsletter_consent" && !(data.newsletter_consent === true)) return null;
      return email && email.includes("@") ? email : null;
    })
    .filter((e): e is string => e != null);
  return [...new Set(emails)];
}

export default async function handler(
  req: { method?: string; headers?: Record<string, string>; body?: { audience?: string; subject?: string; html?: string } },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void; end: () => void } }
): Promise<void> {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const authHeader = req.headers?.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Missing Authorization header (Bearer token)" });
    return;
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const userDoc = await adminDb.collection("users").doc(uid).get();
  const role = userDoc.data()?.role;
  if (role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }

  const audience = req.body?.audience as Audience | undefined;
  const subject = req.body?.subject;
  const htmlBody = req.body?.html;

  if (!audience || !subject || !htmlBody) {
    res.status(400).json({
      error: "Missing audience, subject, or html",
      expected: { audience: "all_members | newsletter_consent | newsletter_signups", subject: "string", html: "string" },
    });
    return;
  }

  if (!["all_members", "newsletter_consent", "newsletter_signups"].includes(audience)) {
    res.status(400).json({ error: "Invalid audience" });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    res.status(503).json({ error: "Resend not configured (RESEND_API_KEY)" });
    return;
  }

  try {
    const emails = await getRecipientEmails(audience);
    if (emails.length === 0) {
      res.status(200).json({ sent: 0, message: "No recipients for this audience" });
      return;
    }

    const from = getFrom();
    const BATCH_SIZE = 100;
    let sent = 0;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const payload = batch.map((to) => ({
        from,
        to: [to],
        subject,
        html: getCampaignEmailHtml({ subject, body_html: htmlBody }),
      }));
      await resend.batch.send(payload);
      sent += batch.length;
    }

    res.status(200).json({ sent, total: emails.length });
  } catch (err) {
    console.error("admin send-mail error", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to send emails",
    });
  }
}
