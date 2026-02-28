/**
 * Import member signups from a CSV (e.g. Google Form export) into Firestore member_signups.
 *
 * CSV columns expected (first row = headers):
 * - Tidsmerke (timestamp)
 * - First and Last name
 * - E-mail (Student or Private...)
 * - Where do you study?
 * - Level of education
 * - Expected year of graduation
 * - Field of Study (Choose most similar)
 * - (Instagram – skipped)
 * - Why are you interested... → interests (semicolon-separated)
 * - How involved... → engagement_level
 * - Would you like to receive monthly TIA newsletters... → newsletter_consent
 * - (Terms – skipped)
 *
 * Duplicates: same email appears multiple times → we keep the LAST row (so remove
 * the duplicate you don't want in the CSV before running, or the last occurrence wins).
 * Rows without a valid email (e.g. missing @) are skipped.
 *
 * Usage:
 *   pnpm run import-members [--dry-run] <path-to-csv>
 *
 * Example:
 *   pnpm run import-members --dry-run "/Users/you/Downloads/Membership signup-2.csv"
 *   pnpm run import-members "/Users/you/Downloads/Membership signup-2.csv"
 *
 * Requires .env or .env.local with Firebase Admin: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.
 */

import dotenv from "dotenv";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { parse } from "csv-parse/sync";

if (existsSync(join(process.cwd(), ".env.local"))) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const CSV_PATH = args.find((a) => !a.startsWith("--"));
if (!CSV_PATH) {
  console.error("Usage: pnpm run import-members [--dry-run] <path-to-csv>");
  process.exit(1);
}

const COL = {
  timestamp: "Tidsmerke",
  name: "First and Last name",
  email: "E-mail (Student or Private, where you would like to be reached out):",
  university: "Where do you study?",
  studyLevel: "Level of education",
  gradYear: "Expected year of graduation",
  studyField: "Field of Study (Choose most similar)",
  interests: "Why are you interested in becoming a TIA member? (Optional)",
  engagement: "How involved do you wish to be with the association? (Optional)",
  newsletter: "Would you like to receive monthly TIA newsletters by mail?",
} as const;

function trim(s: unknown): string {
  return (s != null && String(s).trim()) || "";
}

function parseEmail(raw: string): string | null {
  let s = raw.trim();
  // If the cell has extra text after " / " or space (e.g. "s255577@dtu.dk / already in talks..."), use only the email part
  const beforeSlash = s.split(/\s*\/\s*/)[0]?.trim();
  if (beforeSlash && beforeSlash.includes("@")) s = beforeSlash;
  const e = s.trim().toLowerCase();
  if (!e || !e.includes("@") || e.includes("/")) return null;
  return e;
}

function parseCreatedAt(raw: string): Date {
  const s = trim(raw);
  if (!s) return new Date();
  const normalized = s
    .replace(/\s+a\.m\.\s+/i, " AM ")
    .replace(/\s+p\.m\.\s+/i, " PM ");
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date() : d;
}

function parseGradYear(raw: string): number | null {
  const s = trim(raw);
  if (!s) return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function parseInterests(raw: string): string[] {
  const s = trim(raw);
  if (!s) return [];
  return s.split(";").map((x) => x.trim()).filter(Boolean);
}

function parseNewsletterConsent(raw: string): boolean {
  return /yes\s*please/i.test(trim(raw));
}

async function main() {
  const csvContent = readFileSync(CSV_PATH, "utf-8");
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const byEmail = new Map<string, Record<string, string>>();
  let skipped = 0;

  for (const row of rows) {
    const email = parseEmail(row[COL.email] ?? "");
    if (!email) {
      skipped++;
      continue;
    }
    byEmail.set(email, row);
  }

  const duplicatesRemoved = rows.length - skipped - byEmail.size;
  console.log(`Rows in CSV: ${rows.length}`);
  console.log(`Skipped (no valid email): ${skipped}`);
  console.log(`Duplicate emails (last kept): ${duplicatesRemoved}`);
  console.log(`To import: ${byEmail.size}`);

  const docs: { id: string; data: Record<string, unknown> }[] = [];

  for (const [email, row] of byEmail) {
    const created = parseCreatedAt(row[COL.timestamp] ?? "");
    docs.push({
      id: email,
      data: {
        email,
        full_name: trim(row[COL.name]),
        university: trim(row[COL.university]),
        study_field: trim(row[COL.studyField]),
        study_level: trim(row[COL.studyLevel]),
        grad_year: parseGradYear(row[COL.gradYear] ?? ""),
        interests: parseInterests(row[COL.interests] ?? ""),
        engagement_level: trim(row[COL.engagement]),
        motivation: null,
        newsletter_consent: parseNewsletterConsent(row[COL.newsletter] ?? ""),
        created_at: created,
        updated_at: created,
        signup_count: 1,
        last_signup_at: created,
      },
    });
  }

  if (DRY_RUN) {
    console.log("[DRY RUN] Would import", docs.length, "members. Run without --dry-run to write to Firestore.");
    return;
  }

  const { Timestamp } = await import("firebase-admin/firestore");
  const { adminDb } = await import("../src/server/firebaseAdmin");
  for (const doc of docs) {
    const d = doc.data;
    d.created_at = Timestamp.fromDate(d.created_at as Date);
    d.updated_at = Timestamp.fromDate(d.updated_at as Date);
    d.last_signup_at = Timestamp.fromDate(d.last_signup_at as Date);
  }

  const BATCH_SIZE = 500;
  let written = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = adminDb.batch();
    const chunk = docs.slice(i, i + BATCH_SIZE);
    for (const { id, data } of chunk) {
      const ref = adminDb.collection("member_signups").doc(id);
      batch.set(ref, data, { merge: false });
    }
    await batch.commit();
    written += chunk.length;
    console.log(`Written ${written}/${docs.length}...`);
  }

  console.log("Done. Imported", docs.length, "members.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
