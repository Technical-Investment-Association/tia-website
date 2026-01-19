// src/lib/firebase-firestore.ts
import { db } from "./firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";

// Example: save a “join TIA” form
export async function submitJoinForm(data: {
  name: string;
  email: string;
  studyProgram?: string;
  message?: string;
}) {
  const docRef = await addDoc(collection(db, "joinApplications"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}
