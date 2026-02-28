/**
 * Server-only: throttled bulk email sender.
 * Use for campaigns, event mailouts, or any large send so we stay under Resend's
 * rate limit (~2 requests/second) and avoid timeouts.
 *
 * Reusable from:
 * - Admin send-mail (campaigns to members/newsletter)
 * - Event mailouts (sending to event registrants)
 * - Any future "send to list" feature
 */

import { Resend } from "resend";

export type BulkEmailItem = {
  to: string;
  subject: string;
  html: string;
  /** Optional; per-recipient override (e.g. from Resend React email) */
  replyTo?: string;
};

export type BulkSendOptions = {
  /** Resend instance or create from RESEND_API_KEY */
  resend?: Resend;
  /** "From" address (required by Resend) */
  from: string;
  /** List of emails to send */
  emails: BulkEmailItem[];
  /** Max emails per Resend batch (max 100). Default 50 to leave headroom. */
  batchSize?: number;
  /** Ms to wait between batches. Default 600 to stay under 2 req/s. */
  delayBetweenBatchesMs?: number;
};

export type BulkSendResult = {
  sent: number;
  failed: number;
  total: number;
  errors: Array<{ to: string; error: string }>;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send emails in batches with a delay between batches.
 * Resend allows ~2 requests/second; we send one batch per (delayBetweenBatchesMs) to avoid 429s.
 */
export async function sendBulkEmails(options: BulkSendOptions): Promise<BulkSendResult> {
  const {
    resend = new Resend(process.env.RESEND_API_KEY || ""),
    from,
    emails,
    batchSize = 50,
    delayBetweenBatchesMs = 600,
  } = options;

  const result: BulkSendResult = { sent: 0, failed: 0, total: emails.length, errors: [] };

  if (emails.length === 0) return result;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const payload = batch.map((item) => ({
      from,
      to: [item.to],
      subject: item.subject,
      html: item.html,
      ...(item.replyTo && { reply_to: item.replyTo }),
    }));

    try {
      const { data, error } = await resend.batch.send(payload);
      if (error) {
        batch.forEach((item) => {
          result.failed += 1;
          result.errors.push({ to: item.to, error: error.message });
        });
      } else {
        const ids = Array.isArray(data?.data) ? (data.data as Array<{ id?: string }>) : [];
        result.sent += ids.length;
        result.failed += batch.length - ids.length;
        if (ids.length < batch.length) {
          batch.slice(ids.length).forEach((item) => {
            result.errors.push({ to: item.to, error: "Batch returned fewer ids than requested" });
          });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      batch.forEach((item) => {
        result.failed += 1;
        result.errors.push({ to: item.to, error: message });
      });
    }

    if (i + batchSize < emails.length) {
      await sleep(delayBetweenBatchesMs);
    }
  }

  return result;
}
