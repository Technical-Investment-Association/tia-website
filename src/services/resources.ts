import {
  Timestamp,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";

import { db, storage } from "@/lib/firebase/firebase";
import type { ResourceType } from "@/types/resource";
import { MAX_PDF_BYTES } from "@/types/resource";

export function normalizeTags(input: string): string[] {
  const raw = input
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  // de-dupe while preserving order
  const out: string[] = [];
  for (const t of raw) if (!out.includes(t)) out.push(t);

  return out;
}

export function validatePdf(file: File): string | null {
  const nameOk = file.name.toLowerCase().endsWith(".pdf");
  const typeOk = file.type === "application/pdf" || file.type.includes("pdf");
  if (!nameOk && !typeOk) return "Please select a PDF file.";
  if (file.size > MAX_PDF_BYTES) return "PDF must be less than 50MB.";
  return null;
}

export function storagePathFor(type: ResourceType, id: string) {
  const folder = type === "insight" ? "insights" : type; // storage folder uses "insights"
  return `resources/${folder}/${id}.pdf`;
}

export async function uploadResourcePdf(params: {
  type: ResourceType;
  id: string;
  file: File;
}): Promise<{ file_url: string; file_path: string }> {
  const { type, id, file } = params;

  const msg = validatePdf(file);
  if (msg) throw new Error(msg);

  const file_path = storagePathFor(type, id);
  const storageRef = ref(storage, file_path);

  const snap = await uploadBytes(storageRef, file);
  const file_url = await getDownloadURL(snap.ref);

  return { file_url, file_path };
}

export async function createResourceBaseId(): Promise<string> {
  const newRef = doc(collection(db, "resources"));
  return newRef.id;
}

export async function createResourceDoc(params: {
  id: string;
  data: any; // already validated in UI
}) {
  const docRef = doc(db, "resources", params.id);

  await setDoc(docRef, {
    ...params.data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function updateResourceDoc(params: { id: string; data: any }) {
  const docRef = doc(db, "resources", params.id);

  await updateDoc(docRef, {
    ...params.data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteResourceDoc(params: {
  id: string;
  file_path?: string | null;
}) {
  const docRef = doc(db, "resources", params.id);

  // Best-effort storage delete
  if (params.file_path) {
    try {
      await deleteObject(ref(storage, params.file_path));
    } catch (err) {
      console.warn("Could not delete resource file from storage:", err);
    }
  }

  await deleteDoc(docRef);
}

export function yearFromTimestamp(ts: Timestamp) {
  return ts.toDate().getFullYear();
}
