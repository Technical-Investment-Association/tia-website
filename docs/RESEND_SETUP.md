# Resend email setup (membership API)

The membership API sends two kinds of emails via [Resend](https://resend.com):

1. **Welcome email** – when someone signs up (new member).
2. **Profile updated email** – when someone updates an existing membership (includes a “Not me” link).

Follow these steps to enable them.

---

## Email stack (TIA)

For context, TIA’s email setup is:

- **Domain** – Hosted on **Squarespace** (DNS and domain registration).
- **Receiving** – **ImprovMX** for incoming mail and aliases (e.g. addresses like `membership@...` that forward to a mailbox).
- **Sending** – **Resend** for transactional emails from this site (welcome and “profile updated” emails from the membership API).

When verifying the domain in Resend (step 3), add the DNS records in **Squarespace** (Settings → Domains → DNS settings for your domain).

---

## 1. Create a Resend account

1. Go to [resend.com](https://resend.com) and sign up.
2. Verify your email if prompted.

---

## 2. Create an API key

1. In the Resend dashboard, go to **API Keys** (or [resend.com/api-keys](https://resend.com/api-keys)).
2. Click **Create API Key**.
3. Give it a name (e.g. `TIA website membership`).
4. Choose **Sending access** (no need for full access).
5. Copy the key (it starts with `re_`). You can only see it once.

---

## 3. Verify your sending domain

Resend only allows sending from addresses on a **verified domain**.

1. In Resend, go to **Domains** and click **Add Domain**.
2. Enter the domain you want to send from (e.g. `tiaassociation.com`).
3. Add the DNS records Resend shows (MX, TXT, etc.) in your domain’s DNS. **TIA:** DNS is managed in **Squarespace** (Settings → Domains → DNS settings for your domain); add Resend’s records there.
4. Wait until Resend shows the domain as **Verified**.

After that you can send from any address on that domain, e.g. `membership@tiaassociation.com`, without creating separate “senders” in Resend.

**If you don’t have a domain yet:** You can’t send from a custom address until the domain is verified. Use a domain you control (e.g. the same one as your site) and add the DNS records Resend gives you.

---

## 4. Set environment variables

### Local (`.env.local`)

Add (or uncomment) in your project root `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
```

Optional:

```env
# Sender shown in emails (must be from a verified domain in Resend)
RESEND_FROM_EMAIL=Technical Investment Association <membership@tiaassociation.com>

# Used for links in membership emails (confirm, update profile, unsubscribe, deactivate)
PUBLIC_BASE_URL=https://tiaassociation.com
```

If you omit `RESEND_FROM_EMAIL`, the API uses  
`Technical Investment Association <membership@tiaassociation.com>`.  
That address must be on a domain you’ve verified in Resend.

### Production (Vercel)

1. Vercel → your project → **Settings** → **Environment Variables**.
2. Add:
   - **`RESEND_API_KEY`** = your Resend API key (`re_...`).
   - **`RESEND_FROM_EMAIL`** (optional) = same format as above, from a verified domain.
   - **`PUBLIC_BASE_URL`** (optional) = your production URL, e.g. `https://tiaassociation.com`.
3. Redeploy so the new variables are used.

---

## 5. Test

1. **Local:** Restart the API (`pnpm run dev:full` or `pnpm run dev:api-server`) so it picks up `RESEND_API_KEY`.
2. Use the Join form:
   - **New email:** Complete signup → you should get the welcome email.
   - **Existing email:** Submit again (after 1+ minute) → choose “Update” → you should get the “profile updated” email with the “Not me” link.
3. Check the Resend dashboard **Emails** to see sent messages and status.

---

## Troubleshooting

- **“Domain not verified” / “Sender not allowed”**  
  The `from` address must use a domain you added and verified in Resend (step 3). Check **Domains** in the Resend dashboard.

- **No emails in inbox**  
  Check Resend **Emails** for delivery status. Look in spam. For testing you can send to your own address.

- **“Not me” link goes to wrong URL**  
  Set `PUBLIC_BASE_URL` to your real site URL (including `https://`) in both local and Vercel env.

- **API key invalid**  
  Ensure there are no extra spaces and the value is exactly `re_...`. Create a new key in Resend if needed.

---

## Summary

| Variable             | Required | Purpose |
|----------------------|----------|--------|
| `RESEND_API_KEY`     | Yes      | Resend API key (`re_...`) so the API can send emails. |
| `RESEND_FROM_EMAIL`  | No       | Sender address (default: `Technical Investment Association <membership@tiaassociation.com>`). Must be on a verified domain. |
| `PUBLIC_BASE_URL`    | No       | Base URL for email links (e.g. `https://tiaassociation.com`). |

Add `RESEND_API_KEY` (and optionally the others) in `.env.local` and in Vercel, verify your domain in Resend, and the membership emails will be sent automatically.
