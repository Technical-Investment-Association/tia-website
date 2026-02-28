/**
 * GET /api/membership/update-profile?token=xxx – return current member data for form pre-fill.
 * POST /api/membership/update-profile – body: { token, data }. Validate token, update member, set email_confirmed, mark token used.
 */
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../server/firebaseAdmin";

const TOKEN_COLLECTION = "membership_update_tokens";
const MEMBER_COLLECTION = "member_signups";

export default async function handler(req: any, res: any): Promise<void> {
  const resJson = (code: number, body: object) => {
    res.status(code);
    res.setHeader?.("Content-Type", "application/json");
    res.json?.(body) ?? res.send(JSON.stringify(body));
  };

  const token =
    req.method === "GET"
      ? (req.query?.token as string)
      : (req.body?.token as string);

  if (!token?.trim()) {
    resJson(400, { error: "Missing token" });
    return;
  }

  const tokenStr = String(token).trim();

  try {
    const tokenRef = adminDb.collection(TOKEN_COLLECTION).doc(tokenStr);
    const tokenSnap = await tokenRef.get();

    if (!tokenSnap.exists) {
      resJson(401, { error: "Invalid or expired link" });
      return;
    }

    const tokenData = tokenSnap.data() as { email: string; used?: boolean };
    if (tokenData.used) {
      resJson(401, { error: "This link has already been used" });
      return;
    }

    const email = tokenData.email?.toLowerCase();
    if (!email) {
      resJson(401, { error: "Invalid token" });
      return;
    }

    const memberRef = adminDb.collection(MEMBER_COLLECTION).doc(email);
    const memberSnap = await memberRef.get();

    if (!memberSnap.exists) {
      resJson(404, { error: "Member not found" });
      return;
    }

    // ---------- GET: return profile for pre-fill ----------
    if (req.method === "GET") {
      const d = memberSnap.data() as Record<string, unknown>;
      resJson(200, {
        email: d.email ?? email,
        full_name: d.full_name ?? "",
        university: d.university ?? "",
        study_field: d.study_field ?? "",
        study_level: d.study_level ?? "",
        grad_year: d.grad_year ?? null,
        interests: Array.isArray(d.interests) ? d.interests : [],
        engagement_level: d.engagement_level ?? "",
        motivation: d.motivation ?? null,
        newsletter_consent: Boolean(d.newsletter_consent),
      });
      return;
    }

    // ---------- POST: update profile ----------
    if (req.method !== "POST") {
      res.setHeader?.("Allow", "GET, POST");
      resJson(405, { error: "Method not allowed" });
      return;
    }

    const data = req.body?.data;
    if (!data || typeof data !== "object") {
      resJson(400, { error: "Missing data" });
      return;
    }

    const cleanData: Record<string, unknown> = {
      full_name: data.full_name != null ? String(data.full_name).trim() : "",
      university: data.university != null ? String(data.university).trim() : "",
      study_field: data.study_field != null ? String(data.study_field).trim() : "",
      study_level: data.study_level != null ? String(data.study_level).trim() : "",
      grad_year:
        data.grad_year != null && data.grad_year !== ""
          ? Number(data.grad_year) || null
          : null,
      interests: Array.isArray(data.interests) ? data.interests : [],
      engagement_level: data.engagement_level != null ? String(data.engagement_level).trim() : "",
      motivation:
        data.motivation != null && String(data.motivation).trim() !== ""
          ? String(data.motivation).trim()
          : null,
      newsletter_consent: Boolean(data.newsletter_consent),
      email,
      email_confirmed: true,
      updated_at: FieldValue.serverTimestamp(),
    };

    await memberRef.update(cleanData);
    await tokenRef.update({
      used: true,
      used_at: FieldValue.serverTimestamp(),
    });

    resJson(200, { status: "updated" });
  } catch (err) {
    console.error("[update-profile]", err);
    resJson(500, { error: "Internal server error" });
  }
}
