/**
 * GET /api/admin/email-preview?template=welcome|profile-updated|confirm-email|campaign
 * Returns HTML for the given template (for admin preview). Optional: &body= for campaign body.
 */

import {
  getCampaignEmailHtml,
  sampleCampaignData,
  sampleWelcomeData,
  sampleProfileUpdatedData,
  sampleConfirmEmailData,
} from "../../lib/email-templates";
import {
  getWelcomeEmailHtmlResolved,
  getProfileUpdatedEmailHtmlResolved,
  getConfirmEmailHtmlResolved,
} from "../../server/emailTemplatesServer";

export default async function handler(req: { method?: string; query?: Record<string, string> }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void; send: (s: string) => void; end: () => void } }): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end();
    return;
  }

  const template = (req.query?.template as string) || "";
  const bodyParam = req.query?.body;
  const body = (typeof bodyParam === "string" ? bodyParam : Array.isArray(bodyParam) ? bodyParam[0] : undefined) || sampleCampaignData.body_html;

  let html: string;
  switch (template) {
    case "welcome":
      html = await getWelcomeEmailHtmlResolved(sampleWelcomeData);
      break;
    case "profile-updated":
      html = await getProfileUpdatedEmailHtmlResolved(sampleProfileUpdatedData);
      break;
    case "confirm-email":
      html = await getConfirmEmailHtmlResolved(sampleConfirmEmailData);
      break;
    case "campaign":
      html = getCampaignEmailHtml({
        ...sampleCampaignData,
        body_html: body ? decodeURIComponent(body) : sampleCampaignData.body_html,
      });
      break;
    default:
      res.status(400).json({ error: "Missing or invalid template. Use welcome, profile-updated, confirm-email, or campaign." });
      return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
