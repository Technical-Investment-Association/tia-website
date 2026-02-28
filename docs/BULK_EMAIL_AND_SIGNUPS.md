# Bulk email and signup handling

This doc describes how we send many emails without overloading Resend or crashing, and how to handle many simultaneous signups.

## Throttled bulk email sender

**Location:** `src/server/emailSender.ts`

A reusable helper that sends emails in batches with a delay between batches so we stay under Resend’s rate limit (~2 requests per second).

- **Used by:** Admin send-mail (campaigns to members/newsletter), and can be used by any “send to list” feature (e.g. event mailouts).
- **Options:** `from`, `emails` (array of `{ to, subject, html }`), `batchSize` (default 50), `delayBetweenBatchesMs` (default 600).
- **Returns:** `{ sent, failed, total, errors }`.

**Example (e.g. for a future event mailout):**

```ts
import { sendBulkEmails } from "@/server/emailSender";

const result = await sendBulkEmails({
  from: "Events <events@tiaassociation.com>",
  emails: recipients.map((email) => ({ to: email, subject, html })),
  batchSize: 50,
  delayBetweenBatchesMs: 600,
});
```

## Admin send-mail API

**POST /api/admin/send-mail**

- **Audiences:** `all_members`, `newsletter_consent`, `newsletter_signups`, `event_registrants`.
- For **event_registrants** you must pass `event_id` in the body; the API collects all emails from `event_registrations` for that event (single: `user_email`, team: `team_lead_email` + `team_members[].email`) and sends using the same throttled sender.
- Response includes `sent`, `failed`, `total`, and up to 20 `errors` for debugging.

## Membership signup rate limiting (existing)

The Join form uses **per-email** limits in `src/api/membership.ts`:

- Max 1 signup per minute per email.
- Max 3 signups per 24 hours per email.

So many different people can sign up at once; the limit is per address. No change needed for “many simultaneous signups” unless you want a **global** cap (e.g. max N signups per minute across all users). That would require a shared counter (e.g. Firestore doc `system/signup_rate` with a timestamp and count, updated in a transaction) and returning 429 when over the cap.

## Event signup forms and mailing lists

- **Event registration config** is stored on each event doc (`registration.type`: none, external, email, single, team). The public Events page currently only supports **external** (link to another URL). Single/team signups would need a public registration form that writes to `event_registrations` (and optionally calls the throttled sender to email a confirmation).
- **Sending to event registrants:** Use the send-mail API with `audience: "event_registrants"` and `event_id: "<eventId>"`. You can add an “Event registrants” option and event selector in the Admin Mail compose UI that sets these fields.
- **Reusable submit handler:** For a generic “event signup form” you could add an API (e.g. `POST /api/events/:eventId/register`) that validates the event’s registration config, writes to `event_registrations`, and optionally queues or sends a confirmation email via `sendBulkEmails` (one email per signup). The same throttled sender keeps bulk mailouts safe.

## Summary

| Need | Solution |
|------|----------|
| Send many campaign emails without crashing | Use `sendBulkEmails()` (already used by admin send-mail). |
| Send to event registrants | Use send-mail API with `audience: "event_registrants"` and `event_id`. |
| Many people sign up at once (Join form) | Per-email rate limit already in place; add global cap in Firestore if needed. |
| Reusable event signup form + confirmations | Add register API + optional confirmation emails via `sendBulkEmails` (one per signup is fine; bulk mailouts use the spacer). |
