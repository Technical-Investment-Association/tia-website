/**
 * Email templates for membership and campaign emails.
 * Inline CSS for email client compatibility. Used by the API and preview.
 */

export type WelcomeEmailData = {
  full_name?: string;
  email: string;
};

export type ProfileUpdatedEmailData = {
  full_name?: string;
  email: string;
  not_me_url: string;
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
  const content = `
    <h1 style="${headingStyle}">Welcome to Technical Investment Association</h1>
    <p style="${textStyle}">Hi ${escapeHtml(name)},</p>
    <p style="${textStyle}">Thank you for joining Technical Investment Association. We're glad to have you.</p>
    <p style="${textStyle}">We look forward to seeing you at our events and keeping you updated on opportunities within investing and finance.</p>
    <p style="${textStyle}">If you have any questions, just reply to this email.</p>
    <p style="${footerStyle}">Technical Investment Association</p>
  `;
  return wrapBody(content, "Welcome to TIA");
}

/** Profile updated email (with "Not me" link). */
export function getProfileUpdatedEmailHtml(
  data: ProfileUpdatedEmailData,
  _opts: { from_label?: string } = {}
): string {
  const name = data.full_name || "there";
  const content = `
    <h1 style="${headingStyle}">Your membership profile was updated</h1>
    <p style="${textStyle}">Hi ${escapeHtml(name)},</p>
    <p style="${textStyle}">Your membership information with Technical Investment Association has just been updated.</p>
    <p style="${textStyle}">If this was you, no further action is required.</p>
    <p style="${textStyle}">If this was <strong>not</strong> you, please click the link below so we can review it:</p>
    <p style="margin: 16px 0 0 0;">
      <a href="${escapeHtml(data.not_me_url)}" style="${buttonStyle}">This was not me</a>
    </p>
    <p style="${footerStyle}">Technical Investment Association</p>
  `;
  return wrapBody(content, "Your TIA profile was updated");
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

/** Build welcome email from custom content with placeholders {{full_name}}, {{email}}. */
export function buildWelcomeFromContent(
  contentHtml: string,
  data: WelcomeEmailData
): string {
  const name = data.full_name || "there";
  const replaced = contentHtml
    .replace(/\{\{full_name\}\}/g, escapeHtml(name))
    .replace(/\{\{email\}\}/g, escapeHtml(data.email));
  return wrapBody(replaced, "Welcome to TIA");
}

/** Build profile-updated email from custom content with placeholders {{full_name}}, {{email}}, {{not_me_url}}. */
export function buildProfileUpdatedFromContent(
  contentHtml: string,
  data: ProfileUpdatedEmailData
): string {
  const name = data.full_name || "there";
  const replaced = contentHtml
    .replace(/\{\{full_name\}\}/g, escapeHtml(name))
    .replace(/\{\{email\}\}/g, escapeHtml(data.email))
    .replace(/\{\{not_me_url\}\}/g, escapeHtml(data.not_me_url));
  return wrapBody(replaced, "Your TIA profile was updated");
}

/** Default inner content for welcome email (with placeholders). Used when no custom template in Firestore. */
export const defaultWelcomeContentHtml = `
    <h1 style="${headingStyle}">Welcome to Technical Investment Association</h1>
    <p style="${textStyle}">Hi {{full_name}},</p>
    <p style="${textStyle}">Thank you for joining Technical Investment Association. We're glad to have you.</p>
    <p style="${textStyle}">We look forward to seeing you at our events and keeping you updated on opportunities within investing and finance.</p>
    <p style="${textStyle}">If you have any questions, just reply to this email.</p>
    <p style="${footerStyle}">Technical Investment Association</p>
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
    <p style="${footerStyle}">Technical Investment Association</p>
  `.trim();

/** Sample data for previewing templates. */
export const sampleWelcomeData: WelcomeEmailData = {
  full_name: "Alex Johnson",
  email: "alex@example.com",
};

export const sampleProfileUpdatedData: ProfileUpdatedEmailData = {
  full_name: "Alex Johnson",
  email: "alex@example.com",
  not_me_url:
    "https://example.com/api/membership/not-me?email=alex%40example.com&token=sample-token",
};

export const sampleCampaignData: CampaignEmailData = {
  subject: "Upcoming event",
  body_html:
    "<p>Hi everyone,</p><p>We have an exciting event next week. Save the date!</p><p>Best,<br>TIA Team</p>",
  from_label: "Technical Investment Association",
};
