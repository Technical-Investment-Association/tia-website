// api/membership/not-me.ts
import { adminDb } from "../../server/firebaseAdmin"; // adjust path if needed
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }

  const { email, token } = req.query;

  if (!email || !token) {
    res.status(400).send("Missing email or token");
    return;
  }

  const emailStr = String(email).toLowerCase();
  const tokenStr = String(token);

  try {
    const tokenRef = adminDb
      .collection("membership_not_me_tokens")
      .doc(tokenStr);
    const tokenSnap = await tokenRef.get();

    if (!tokenSnap.exists) {
      res.status(400).send("Invalid token");
      return;
    }

    const tokenData = tokenSnap.data() as {
      email: string;
      used?: boolean;
    };

    if (tokenData.used) {
      res.status(400).send("Token already used");
      return;
    }

    if (tokenData.email !== emailStr) {
      res.status(400).send("Token does not match email");
      return;
    }

    // Mark token as used
    await tokenRef.update({
      used: true,
      used_at: FieldValue.serverTimestamp(),
    });

    // Flag the member profile for review
    const memberRef = adminDb.collection("member_signups").doc(emailStr);
    await memberRef.set(
      {
        flagged_not_me: true,
        flagged_not_me_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // You could also send an internal notification email here if you like.

    res
      .status(200)
      .send(
        "Thank you for letting us know. We have flagged this membership for review."
      );
  } catch (err) {
    console.error("not-me handler error", err);
    res.status(500).send("Internal server error");
  }
}
