/**
 * System email templates (welcome, profile_updated) in Firestore – client (admin) read/write.
 */
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export type SystemTemplateId = "welcome" | "profile_updated";

export interface SystemEmailTemplate {
  name: string;
  description?: string;
  content_html: string;
  updated_at: Date;
  updated_by: string;
}

const COLLECTION = "email_templates";

export async function getSystemTemplate(
  id: SystemTemplateId
): Promise<SystemEmailTemplate | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  const d = snap.data();
  const updated = d.updated_at as { toDate: () => Date };
  return {
    name: d.name ?? "",
    description: d.description,
    content_html: d.content_html ?? "",
    updated_at: updated?.toDate?.() ?? new Date(),
    updated_by: d.updated_by ?? "",
  };
}

export async function setSystemTemplate(
  id: SystemTemplateId,
  data: { name: string; description?: string; content_html: string },
  updatedBy: string
): Promise<void> {
  const now = Timestamp.now();
  await setDoc(doc(db, COLLECTION, id), {
    name: data.name,
    description: data.description ?? null,
    content_html: data.content_html,
    updated_at: now,
    updated_by: updatedBy,
  });
}
