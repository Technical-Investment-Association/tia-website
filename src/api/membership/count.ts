/**
 * GET /api/membership/count
 * Returns the number of documents in member_signups (public, for homepage counter).
 */
import { adminDb } from "../../server/firebaseAdmin";

export default async function handler(
  _req: { method?: string },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void; end: () => void } }
): Promise<void> {
  if (_req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end();
    return;
  }

  try {
    const snapshot = await adminDb.collection("member_signups").get();
    const count = snapshot.size;
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ count });
  } catch (err) {
    console.error("[membership/count]", err);
    res.status(500).json({ count: 0 });
  }
}
