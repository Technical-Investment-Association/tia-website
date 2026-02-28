/**
 * Admin emails: drafts and sent emails in Firestore (admin_emails collection).
 */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export type AdminEmailStatus = "draft" | "sent";

export interface AdminEmail {
  id: string;
  audience: string;
  subject: string;
  html: string;
  status: AdminEmailStatus;
  created_at: Date;
  updated_at: Date;
  sent_at?: Date;
  sent_by?: string;
}

const COLLECTION = "admin_emails";

function toAdminEmail(id: string, data: Record<string, unknown>): AdminEmail {
  const created = data.created_at as { toDate: () => Date };
  const updated = data.updated_at as { toDate: () => Date };
  const sent = data.sent_at as { toDate: () => Date } | undefined;
  return {
    id,
    audience: (data.audience as string) ?? "",
    subject: (data.subject as string) ?? "",
    html: (data.html as string) ?? "",
    status: (data.status as AdminEmailStatus) ?? "draft",
    created_at: created?.toDate?.() ?? new Date(),
    updated_at: updated?.toDate?.() ?? new Date(),
    sent_at: sent?.toDate?.() ?? undefined,
    sent_by: data.sent_by as string | undefined,
  };
}

export async function fetchDrafts(): Promise<AdminEmail[]> {
  const q = query(
    collection(db, COLLECTION),
    where("status", "==", "draft"),
    orderBy("updated_at", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toAdminEmail(d.id, d.data()));
}

export async function fetchRecentlySent(): Promise<AdminEmail[]> {
  const q = query(
    collection(db, COLLECTION),
    where("status", "==", "sent"),
    orderBy("sent_at", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toAdminEmail(d.id, d.data()));
}

export async function saveDraft(data: {
  audience: string;
  subject: string;
  html: string;
}): Promise<string> {
  const now = Timestamp.now();
  const ref = await addDoc(collection(db, COLLECTION), {
    audience: data.audience,
    subject: data.subject,
    html: data.html,
    status: "draft",
    created_at: now,
    updated_at: now,
  });
  return ref.id;
}

export async function updateDraft(
  id: string,
  data: { audience: string; subject: string; html: string }
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    audience: data.audience,
    subject: data.subject,
    html: data.html,
    updated_at: Timestamp.now(),
  });
}

export async function deleteDraft(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function markAsSent(
  id: string,
  sentBy: string
): Promise<void> {
  const now = Timestamp.now();
  await updateDoc(doc(db, COLLECTION, id), {
    status: "sent",
    sent_at: now,
    sent_by: sentBy,
    updated_at: now,
  });
}

export async function createSentEmail(data: {
  audience: string;
  subject: string;
  html: string;
  sentBy: string;
}): Promise<string> {
  const now = Timestamp.now();
  const ref = await addDoc(collection(db, COLLECTION), {
    audience: data.audience,
    subject: data.subject,
    html: data.html,
    status: "sent",
    created_at: now,
    updated_at: now,
    sent_at: now,
    sent_by: data.sentBy,
  });
  return ref.id;
}
