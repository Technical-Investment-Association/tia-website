/**
 * POST /api/admin/send-mail
 * Admin-only: send an email to an audience (all members, newsletter consent, or newsletter signups).
 * Uses throttled bulk sender to stay under Resend rate limits.
 * Body: { audience, subject, html }. Header: Authorization: Bearer <Firebase ID token>.
 */

import { adminDb, adminAuth } from "../../server/firebaseAdmin";
import { getCampaignEmailHtml } from "../../lib/email-templates";
import { sendBulkEmails } from "../../server/emailSender";

// Temporary switch to disable outbound admin campaign emails while keeping UI intact.
// Set EMAILS_ENABLED to true later if/when bulk email sending should be re-enabled.
const EMAILS_ENABLED = false;

function getFrom(): string {
  return process.env.RESEND_FROM_EMAIL || "Technical Investment Association <membership@tiaassociation.com>";
}

type Audience = "all_members" | "newsletter_consent" | "newsletter_signups" | "event_registrants";

async function getRecipientEmails(audience: Audience, eventId?: string): Promise<string[]> {
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
      if (data.deactivated_at != null) return null; // GDPR: do not email deactivated profiles
      if (audience === "newsletter_consent" && !(data.newsletter_consent === true)) return null;
      const email = (data.email as string) || d.id;
      return email && email.includes("@") ? email : null;
    })
    .filter((e): e is string => e != null);
  return [...new Set(emails)];
}

async function getEventRegistrantEmails(eventId: string): Promise<string[]> {
  const snap = await adminDb.collection("event_registrations").where("event_id", "==", eventId).get();
  const emails: string[] = [];
  snap.docs.forEach((d) => {
    const data = d.data();
    if (data.user_email && typeof data.user_email === "string" && data.user_email.includes("@")) {
      emails.push((data.user_email as string).trim().toLowerCase());
    }
    if (data.team_lead_email && typeof data.team_lead_email === "string" && data.team_lead_email.includes("@")) {
      emails.push((data.team_lead_email as string).trim().toLowerCase());
    }
    const members = data.team_members as Array<{ email?: string }> | undefined;
    if (Array.isArray(members)) {
      members.forEach((m) => {
        if (m?.email && typeof m.email === "string" && m.email.includes("@")) {
          emails.push((m.email as string).trim().toLowerCase());
        }
      });
    }
  });
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
  const eventId = typeof req.body?.event_id === "string" ? req.body.event_id.trim() : undefined;

  if (!audience || !subject || !htmlBody) {
    res.status(400).json({
      error: "Missing audience, subject, or html",
      expected: { audience: "all_members | newsletter_consent | newsletter_signups | event_registrants", subject: "string", html: "string", event_id: "required when audience is event_registrants" },
    });
    return;
  }

  if (audience === "event_registrants" && !eventId) {
    res.status(400).json({ error: "event_id is required when audience is event_registrants" });
    return;
  }

  if (!["all_members", "newsletter_consent", "newsletter_signups", "event_registrants"].includes(audience)) {
    res.status(400).json({ error: "Invalid audience" });
    return;
  }

  if (!EMAILS_ENABLED || !process.env.RESEND_API_KEY) {
    res.status(503).json({ error: "Email sending is temporarily disabled" });
    return;
  }

  try {
    const emails = audience === "event_registrants"
      ? await getEventRegistrantEmails(eventId!)
      : await getRecipientEmails(audience);
    if (emails.length === 0) {
      res.status(200).json({ sent: 0, failed: 0, total: 0, message: "No recipients for this audience" });
      return;
    }

    const from = getFrom();
    const html = getCampaignEmailHtml({ subject, body_html: htmlBody });
    const bulkItems = emails.map((to) => ({ to, subject, html }));
    const result = await sendBulkEmails({
      from,
      emails: bulkItems,
      batchSize: 50,
      delayBetweenBatchesMs: 600,
    });

    res.status(200).json({
      sent: result.sent,
      failed: result.failed,
      total: result.total,
      errors: result.errors.length > 0 ? result.errors.slice(0, 20) : undefined,
    });
  } catch (err) {
    console.error("admin send-mail error", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to send emails",
    });
  }
}
