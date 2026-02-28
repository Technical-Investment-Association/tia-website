# Importing members from CSV

Use the script to import member signups from a CSV (e.g. Google Form export) into Firestore `member_signups`.

## Quick start

1. **Clean the CSV**  
   Remove duplicate rows you don’t want. For each duplicate email, the script keeps the **last** row.

2. **Dry run (no Firebase needed)**  
   Check how many rows would be imported and how many are skipped:
   ```bash
   pnpm run import-members --dry-run "/path/to/your/Membership signup-2.csv"
   ```

3. **Run the import**  
   Ensure `.env` or `.env.local` has Firebase Admin credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`), then:
   ```bash
   pnpm run import-members "/path/to/your/Membership signup-2.csv"
   ```

## CSV format

The script expects the first row to be headers. It uses these columns (other columns are ignored):

| CSV column | Firestore field | Notes |
|------------|------------------|--------|
| Tidsmerke | `created_at` | Timestamp; parsed from format like `2025/07/20 3:43:22 p.m. CET` |
| First and Last name | `full_name` | |
| E-mail (Student or Private...) | `email` (and doc id) | Must contain `@`; normalized to lowercase. Rows without a valid email are **skipped**. |
| Where do you study? | `university` | e.g. DTU, Other international university/school |
| Level of education | `study_level` | e.g. Bachelor, Masters |
| Expected year of graduation | `grad_year` | Number or empty |
| Field of Study (Choose most similar) | `study_field` | |
| Why are you interested... | `interests` | Semicolon-separated → array |
| How involved do you wish to be... | `engagement_level` | |
| Would you like to receive monthly TIA newsletters... | `newsletter_consent` | “Yes please” → true, otherwise false |

**Skipped:** Instagram handle, terms & conditions column.

## Duplicates and skips

- **Duplicate emails:** If the same email appears more than once, only the **last** row is imported. Delete the duplicate rows you don’t want in the CSV before running, or accept that the last occurrence wins.
- **Invalid email:** Rows where the email cell is empty or does not contain `@` are skipped (e.g. “Private”, “S255212”). The script prints how many were skipped.

## What gets written

Each row becomes one document in `member_signups` with:

- **Document ID:** normalized email (lowercase, trimmed).
- **Fields:** `email`, `full_name`, `university`, `study_field`, `study_level`, `grad_year`, `interests`, `engagement_level`, `motivation` (null), `newsletter_consent`, `created_at`, `updated_at`, `signup_count`, `last_signup_at`.

Existing documents with the same email are **overwritten** (full replace, no merge).
