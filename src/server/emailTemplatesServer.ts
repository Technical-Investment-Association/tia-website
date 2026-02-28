/**
 * Server-only: resolve system email templates from Firestore or built-in.
 */
import { adminDb } from "./firebaseAdmin";
import {
  getWelcomeEmailHtml,
  getProfileUpdatedEmailHtml,
  getConfirmEmailHtml,
  buildWelcomeFromContent,
  buildProfileUpdatedFromContent,
  buildConfirmEmailFromContent,
  type WelcomeEmailData,
  type ProfileUpdatedEmailData,
  type ConfirmEmailData,
} from "@/lib/email-templates";

const COLLECTION = "email_templates";

export async function getWelcomeEmailHtmlResolved(
  data: WelcomeEmailData
): Promise<string> {
  try {
    const snap = await adminDb.collection(COLLECTION).doc("welcome").get();
    const content = snap.exists ? (snap.data()?.content_html as string) : null;
    if (content?.trim()) {
      return buildWelcomeFromContent(content, data);
    }
  } catch (_) {
    // fall through to built-in
  }
  return getWelcomeEmailHtml(data);
}

export async function getProfileUpdatedEmailHtmlResolved(
  data: ProfileUpdatedEmailData
): Promise<string> {
  try {
    const snap = await adminDb.collection(COLLECTION).doc("profile_updated").get();
    const content = snap.exists ? (snap.data()?.content_html as string) : null;
    if (content?.trim()) {
      return buildProfileUpdatedFromContent(content, data);
    }
  } catch (_) {
    // fall through to built-in
  }
  return getProfileUpdatedEmailHtml(data);
}

export async function getConfirmEmailHtmlResolved(
  data: ConfirmEmailData
): Promise<string> {
  try {
    const snap = await adminDb.collection(COLLECTION).doc("confirm_email").get();
    const content = snap.exists ? (snap.data()?.content_html as string) : null;
    if (content?.trim()) {
      return buildConfirmEmailFromContent(content, data);
    }
  } catch (_) {
    // fall through to built-in
  }
  return getConfirmEmailHtml(data);
}
