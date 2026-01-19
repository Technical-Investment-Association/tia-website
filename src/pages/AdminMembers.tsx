// src/pages/AdminMembers.tsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase/firebase";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type MemberSignup = {
  id: string;
  name: string;
  email: string;
  study_place: string;
  interests: string[];
  involvement?: string | null;
  newsletter_opt_in?: boolean;
  created_at?: Timestamp | null;
};

type NewsletterSignup = {
  id: string;
  email: string;
  source?: string;
  created_at?: Timestamp | null;
};

const formatDateTime = (ts?: Timestamp | null) => {
  if (!ts) return "";
  const d = ts.toDate();
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminMembers = () => {
  const [members, setMembers] = useState<MemberSignup[]>([]);
  const [newsletterSubs, setNewsletterSubs] = useState<NewsletterSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const membersRef = collection(db, "member_signups");
        const membersQuery = query(membersRef, orderBy("created_at", "desc"));
        const membersSnap = await getDocs(membersQuery);
        const memberData: MemberSignup[] = membersSnap.docs.map((doc) => {
          const d = doc.data() as Record<string, unknown>;
          return {
            id: doc.id,
            name: d.name as string,
            email: d.email as string,
            study_place: d.study_place as string,
            interests: (d.interests ?? []) as string[],
            involvement: (d.involvement ?? null) as string | null,
            newsletter_opt_in: (d.newsletter_opt_in ?? false) as boolean,
            created_at: (d.created_at ?? null) as Timestamp | null,
          };
        });

        const newsletterRef = collection(db, "newsletter_signups");
        const newsletterQuery = query(
          newsletterRef,
          orderBy("created_at", "desc")
        );
        const newsletterSnap = await getDocs(newsletterQuery);
        const newsletterData: NewsletterSignup[] = newsletterSnap.docs.map(
          (doc) => {
            const d = doc.data() as Record<string, unknown>;
            return {
              id: doc.id,
              email: d.email as string,
              source: (d.source ?? "") as string,
              created_at: (d.created_at ?? null) as Timestamp | null,
            };
          }
        );

        setMembers(memberData);
        setNewsletterSubs(newsletterData);
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to load member and newsletter data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="pt-32 pb-20 px-4 bg-[hsl(var(--section-light))]">
        <div className="container mx-auto max-w-6xl">
          <Separator className="w-16 mb-8 bg-[hsl(var(--divider))]" />
          <h1 className="text-4xl font-bold mb-3 text-[hsl(var(--section-light-foreground))]">
            Members & Newsletter
          </h1>
          <p className="text-[hsl(var(--section-light-foreground))]/70 mb-8 max-w-2xl">
            Overview of TIA member signups and newsletter subscribers. Export
            this data to handle communication and onboarding.
          </p>

          {loading && <p>Loading…</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="space-y-12">
              {/* Members table */}
              <Card className="p-6 bg-white border-border overflow-x-auto">
                <h2 className="text-2xl font-semibold mb-4">Member signups</h2>
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No member signups yet.
                  </p>
                ) : (
                  <table className="w-full text-sm border-collapse">
                    <thead className="border-b border-border text-left">
                      <tr className="text-muted-foreground">
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Study place</th>
                        <th className="py-2 pr-4">Interests</th>
                        <th className="py-2 pr-4">Involvement</th>
                        <th className="py-2 pr-4">Newsletter</th>
                        <th className="py-2 pr-4">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.id} className="border-b border-border/50">
                          <td className="py-2 pr-4">{m.name}</td>
                          <td className="py-2 pr-4">{m.email}</td>
                          <td className="py-2 pr-4">{m.study_place}</td>
                          <td className="py-2 pr-4">
                            {m.interests && m.interests.length > 0
                              ? m.interests.join(", ")
                              : "-"}
                          </td>
                          <td className="py-2 pr-4">{m.involvement || "-"}</td>
                          <td className="py-2 pr-4">
                            {m.newsletter_opt_in ? "Yes" : "No"}
                          </td>
                          <td className="py-2 pr-4">
                            {formatDateTime(m.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>

              {/* Newsletter table */}
              <Card className="p-6 bg-white border-border overflow-x-auto">
                <h2 className="text-2xl font-semibold mb-4">
                  Newsletter signups
                </h2>
                {newsletterSubs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No newsletter signups yet.
                  </p>
                ) : (
                  <table className="w-full text-sm border-collapse">
                    <thead className="border-b border-border text-left">
                      <tr className="text-muted-foreground">
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Source</th>
                        <th className="py-2 pr-4">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsletterSubs.map((n) => (
                        <tr key={n.id} className="border-b border-border/50">
                          <td className="py-2 pr-4">{n.email}</td>
                          <td className="py-2 pr-4">{n.source || "-"}</td>
                          <td className="py-2 pr-4">
                            {formatDateTime(n.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminMembers;
