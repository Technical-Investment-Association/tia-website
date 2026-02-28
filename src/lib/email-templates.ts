/**
 * Email templates for membership and campaign emails.
 * Inline CSS for email client compatibility. Used by the API and preview.
 * System emails include GDPR-compliant footer: unsubscribe + deactivate profile.
 */

export type WelcomeEmailData = {
  full_name?: string;
  email: string;
  unsubscribe_url?: string;
  deactivate_profile_url?: string;
};

export type ProfileUpdatedEmailData = {
  full_name?: string;
  email: string;
  not_me_url: string;
  unsubscribe_url?: string;
  deactivate_profile_url?: string;
};

export type ConfirmEmailData = {
  full_name?: string;
  email: string;
  confirm_email_url: string;
  unsubscribe_url?: string;
  deactivate_profile_url?: string;
};

export type UpdateProfileLinkEmailData = {
  full_name?: string;
  email: string;
  update_profile_url: string;
  unsubscribe_url?: string;
  deactivate_profile_url?: string;
};

export type CampaignEmailData = {
  subject: string;
  body_html: string;
  from_label?: string;
};

const baseStyles = `
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #1a1a1a;
  background-color: #f5f5f5;
`;

const containerStyle =
  "max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff;";

const headingStyle = "font-size: 22px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0;";
const textStyle = "margin: 0 0 12px 0; color: #333333;";
const buttonStyle =
  "display: inline-block; margin: 20px 0 0 0; padding: 12px 24px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 500;";
const footerStyle = "margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 13px; color: #6b7280;";

/** GDPR-compliant footer for all membership emails: unsubscribe + deactivate profile. Use placeholders {{unsubscribe_url}} and {{deactivate_profile_url}}. */
export const GDPR_FOOTER_HTML = `
    <p style="${footerStyle}">
      <a href="{{unsubscribe_url}}" style="color: #2563eb;">Unsubscribe from newsletters</a>.
      No longer wish to be a member? <a href="{{deactivate_profile_url}}" style="color: #2563eb;">Deactivate your profile here</a>.
    </p>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 8px 0 0 0;">Technical Investment Association</p>
  `.trim();

function wrapBody(content: string, preheader?: string): string {
  const preheaderTag = preheader
    ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>`
    : "";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Technical Investment Association</title>
  ${preheaderTag}
</head>
<body style="${baseStyles}">
  <div style="${containerStyle}">
    ${content}
  </div>
</body>
</html>`.trim();
}

/** Welcome email (new member signup). */
export function getWelcomeEmailHtml(
  data: WelcomeEmailData,
  _opts: { from_label?: string } = {}
): string {
  const name = data.full_name || "there";
  const unsub = data.unsubscribe_url ?? "#";
  const deact = data.deactivate_profile_url ?? "#";
  const content = `
    <h1 style="${headingStyle}">Welcome to Technical Investment Association</h1>
    <p style="${textStyle}">Hi ${escapeHtml(name)},</p>
    <p style="${textStyle}">Thank you for joining Technical Investment Association. We're glad to have you.</p>
    <p style="${textStyle}">We look forward to seeing you at our events and keeping you updated on opportunities within investing and finance.</p>
    <p style="${textStyle}">If you have any questions, just reply to this email.</p>
    <p style="${footerStyle}"><a href="${escapeHtml(unsub)}" style="color: #2563eb;">Unsubscribe from newsletters</a>. No longer wish to be a member? <a href="${escapeHtml(deact)}" style="color: #2563eb;">Deactivate your profile here</a>.</p>
    <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">Technical Investment Association</p>
  `;
  return wrapBody(content, "Welcome to TIA");
}

/** Profile updated email (with "Not me" link). */
export function getProfileUpdatedEmailHtml(
  data: ProfileUpdatedEmailData,
  _opts: { from_label?: string } = {}
): string {
  const name = data.full_name || "there";
  const unsub = data.unsubscribe_url ?? "#";
  const deact = data.deactivate_profile_url ?? "#";
  const content = `
    <h1 style="${headingStyle}">Your membership profile was updated</h1>
    <p style="${textStyle}">Hi ${escapeHtml(name)},</p>
    <p style="${textStyle}">Your membership information with Technical Investment Association has just been updated.</p>
    <p style="${textStyle}">If this was you, no further action is required.</p>
    <p style="${textStyle}">If this was <strong>not</strong> you, please click the link below so we can review it:</p>
    <p style="margin: 16px 0 0 0;">
      <a href="${escapeHtml(data.not_me_url)}" style="${buttonStyle}">This was not me</a>
    </p>
    <p style="${footerStyle}"><a href="${escapeHtml(unsub)}" style="color: #2563eb;">Unsubscribe from newsletters</a>. No longer wish to be a member? <a href="${escapeHtml(deact)}" style="color: #2563eb;">Deactivate your profile here</a>.</p>
    <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">Technical Investment Association</p>
  `;
  return wrapBody(content, "Your TIA profile was updated");
}

/** Confirm email (sent after welcome; link to confirm email address). Stored in Firebase, editable like welcome. */
export function getConfirmEmailHtml(
  data: ConfirmEmailData,
  _opts: { from_label?: string } = {}
): string {
  const name = data.full_name || "there";
  const unsub = data.unsubscribe_url ?? "#";
  const deact = data.deactivate_profile_url ?? "#";
  const content = `
    <h1 style="${headingStyle}">Confirm your email address</h1>
    <p style="${textStyle}">Hi ${escapeHtml(name)},</p>
    <p style="${textStyle}">Please confirm your email address by clicking the link below. This helps us keep your membership secure.</p>
    <p style="margin: 20px 0 0 0;">
      <a href="${escapeHtml(data.confirm_email_url)}" style="${buttonStyle}">Confirm my email</a>
    </p>
    <p style="${footerStyle}"><a href="${escapeHtml(unsub)}" style="color: #2563eb;">Unsubscribe from newsletters</a>. No longer wish to be a member? <a href="${escapeHtml(deact)}" style="color: #2563eb;">Deactivate your profile here</a>.</p>
    <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">Technical Investment Association</p>
  `;
  return wrapBody(content, "Confirm your email");
}

/** Email sent when someone tries to sign up with an existing email – link to update profile or confirm it's them. */
export function getUpdateProfileLinkEmailHtml(
  data: UpdateProfileLinkEmailData,
  _opts: { from_label?: string } = {}
): string {
  const name = data.full_name || "there";
  const unsub = data.unsubscribe_url ?? "#";
  const deact = data.deactivate_profile_url ?? "#";
  const content = `
    <h1 style="${headingStyle}">Update your TIA membership profile</h1>
    <p style="${textStyle}">Hi ${escapeHtml(name)},</p>
    <p style="${textStyle}">We received a signup request for this email address. If this was you, click the button below to update your profile or confirm your details:</p>
    <p style="margin: 20px 0 0 0;">
      <a href="${escapeHtml(data.update_profile_url)}" style="${buttonStyle}">Update my profile</a>
    </p>
    <p style="${textStyle}">If you did not request this, you can ignore this email.</p>
    <p style="${footerStyle}"><a href="${escapeHtml(unsub)}" style="color: #2563eb;">Unsubscribe from newsletters</a>. No longer wish to be a member? <a href="${escapeHtml(deact)}" style="color: #2563eb;">Deactivate your profile here</a>.</p>
    <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">Technical Investment Association</p>
  `;
  return wrapBody(content, "Update your TIA profile");
}

/** Generic campaign / broadcast email (admin-composed). */
export function getCampaignEmailHtml(data: CampaignEmailData): string {
  const content = `
    <div style="${textStyle}">
      ${data.body_html}
    </div>
    <p style="${footerStyle}">Technical Investment Association</p>
  `;
  return wrapBody(content, data.subject);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build welcome email from custom content with placeholders {{full_name}}, {{email}}, {{unsubscribe_url}}, {{deactivate_profile_url}}. */
export function buildWelcomeFromContent(
  contentHtml: string,
  data: WelcomeEmailData
): string {
  const name = data.full_name || "there";
  const unsub = data.unsubscribe_url ?? "#";
  const deact = data.deactivate_profile_url ?? "#";
  const replaced = contentHtml
    .replace(/\{\{full_name\}\}/g, escapeHtml(name))
    .replace(/\{\{email\}\}/g, escapeHtml(data.email))
    .replace(/\{\{unsubscribe_url\}\}/g, escapeHtml(unsub))
    .replace(/\{\{deactivate_profile_url\}\}/g, escapeHtml(deact));
  return wrapBody(replaced, "Welcome to TIA");
}

/** Build profile-updated email from custom content with placeholders {{full_name}}, {{email}}, {{not_me_url}}, {{unsubscribe_url}}, {{deactivate_profile_url}}. */
export function buildProfileUpdatedFromContent(
  contentHtml: string,
  data: ProfileUpdatedEmailData
): string {
  const name = data.full_name || "there";
  const unsub = data.unsubscribe_url ?? "#";
  const deact = data.deactivate_profile_url ?? "#";
  const replaced = contentHtml
    .replace(/\{\{full_name\}\}/g, escapeHtml(name))
    .replace(/\{\{email\}\}/g, escapeHtml(data.email))
    .replace(/\{\{not_me_url\}\}/g, escapeHtml(data.not_me_url))
    .replace(/\{\{unsubscribe_url\}\}/g, escapeHtml(unsub))
    .replace(/\{\{deactivate_profile_url\}\}/g, escapeHtml(deact));
  return wrapBody(replaced, "Your TIA profile was updated");
}

/** Build confirm-email from custom content with placeholders {{full_name}}, {{email}}, {{confirm_email_url}}, {{unsubscribe_url}}, {{deactivate_profile_url}}. */
export function buildConfirmEmailFromContent(
  contentHtml: string,
  data: ConfirmEmailData
): string {
  const name = data.full_name || "there";
  const unsub = data.unsubscribe_url ?? "#";
  const deact = data.deactivate_profile_url ?? "#";
  const replaced = contentHtml
    .replace(/\{\{full_name\}\}/g, escapeHtml(name))
    .replace(/\{\{email\}\}/g, escapeHtml(data.email))
    .replace(/\{\{confirm_email_url\}\}/g, escapeHtml(data.confirm_email_url))
    .replace(/\{\{unsubscribe_url\}\}/g, escapeHtml(unsub))
    .replace(/\{\{deactivate_profile_url\}\}/g, escapeHtml(deact));
  return wrapBody(replaced, "Confirm your email");
}

/** Default inner content for welcome email (with placeholders). Used when no custom template in Firestore. */
export const defaultWelcomeContentHtml = `
    <h1 style="${headingStyle}">Welcome to Technical Investment Association</h1>
    <p style="${textStyle}">Hi {{full_name}},</p>
    <p style="${textStyle}">Thank you for joining Technical Investment Association. We're glad to have you.</p>
    <p style="${textStyle}">We look forward to seeing you at our events and keeping you updated on opportunities within investing and finance.</p>
    <p style="${textStyle}">If you have any questions, just reply to this email.</p>
    <p style="${footerStyle}"><a href="{{unsubscribe_url}}" style="color: #2563eb;">Unsubscribe from newsletters</a>. No longer wish to be a member? <a href="{{deactivate_profile_url}}" style="color: #2563eb;">Deactivate your profile here</a>.</p>
    <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">Technical Investment Association</p>
  `.trim();

/** Default inner content for profile-updated email (with placeholders). */
export const defaultProfileUpdatedContentHtml = `
    <h1 style="${headingStyle}">Your membership profile was updated</h1>
    <p style="${textStyle}">Hi {{full_name}},</p>
    <p style="${textStyle}">Your membership information with Technical Investment Association has just been updated.</p>
    <p style="${textStyle}">If this was you, no further action is required.</p>
    <p style="${textStyle}">If this was <strong>not</strong> you, please click the link below so we can review it:</p>
    <p style="margin: 16px 0 0 0;">
      <a href="{{not_me_url}}" style="${buttonStyle}">This was not me</a>
    </p>
    <p style="${footerStyle}"><a href="{{unsubscribe_url}}" style="color: #2563eb;">Unsubscribe from newsletters</a>. No longer wish to be a member? <a href="{{deactivate_profile_url}}" style="color: #2563eb;">Deactivate your profile here</a>.</p>
    <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">Technical Investment Association</p>
  `.trim();

/** Default inner content for confirm-email (with placeholders). Stored in Firestore, editable like welcome. */
export const defaultConfirmEmailContentHtml = `
    <h1 style="${headingStyle}">Confirm your email address</h1>
    <p style="${textStyle}">Hi {{full_name}},</p>
    <p style="${textStyle}">Please confirm your email address by clicking the link below. This helps us keep your membership secure.</p>
    <p style="margin: 20px 0 0 0;">
      <a href="{{confirm_email_url}}" style="${buttonStyle}">Confirm my email</a>
    </p>
    <p style="${footerStyle}"><a href="{{unsubscribe_url}}" style="color: #2563eb;">Unsubscribe from newsletters</a>. No longer wish to be a member? <a href="{{deactivate_profile_url}}" style="color: #2563eb;">Deactivate your profile here</a>.</p>
    <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">Technical Investment Association</p>
  `.trim();

/** Sample data for previewing templates. */
export const sampleWelcomeData: WelcomeEmailData = {
  full_name: "Alex Johnson",
  email: "alex@example.com",
  unsubscribe_url: "https://example.com/api/membership/unsubscribe?token=sample",
  deactivate_profile_url: "https://example.com/profile/deactivate?token=sample",
};

export const sampleProfileUpdatedData: ProfileUpdatedEmailData = {
  full_name: "Alex Johnson",
  email: "alex@example.com",
  not_me_url:
    "https://example.com/api/membership/not-me?email=alex%40example.com&token=sample-token",
  unsubscribe_url: "https://example.com/api/membership/unsubscribe?token=sample",
  deactivate_profile_url: "https://example.com/profile/deactivate?token=sample",
};

export const sampleConfirmEmailData: ConfirmEmailData = {
  full_name: "Alex Johnson",
  email: "alex@example.com",
  confirm_email_url: "https://example.com/api/membership/confirm-email?token=sample",
  unsubscribe_url: "https://example.com/api/membership/unsubscribe?token=sample",
  deactivate_profile_url: "https://example.com/profile/deactivate?token=sample",
};

export const sampleCampaignData: CampaignEmailData = {
  subject: "Upcoming event",
  body_html:
    "<p>Hi everyone,</p><p>We have an exciting event next week. Save the date!</p><p>Best,<br>TIA Team</p>",
  from_label: "Technical Investment Association",
};
