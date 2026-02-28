/**
 * AdminMemberAnalytics – Dashboard of member signup answers.
 * Aggregates member_signups by university, study field, level, grad year,
 * engagement, interests, career orientation, newsletter consent, and over time.
 */

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { BarChart3, Users } from "lucide-react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/card";
import type { MemberSignupDoc } from "@/components/modals/member-edit-modal";

function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = keyFn(item) || "(not set)";
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

function countByArray(items: { interests?: string[]; career_orientation?: string[] }[], field: "interests" | "career_orientation"): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const arr = field === "interests" ? (item.interests ?? []) : (item.career_orientation ?? []);
    for (const v of arr) {
      const k = (v && String(v).trim()) || "(empty)";
      out[k] = (out[k] ?? 0) + 1;
    }
  }
  return out;
}

function signupsByMonth(members: MemberSignupDoc[]): { month: string; count: number }[] {
  const byMonth: Record<string, number> = {};
  for (const m of members) {
    const ts = m.created_at;
    const date = ts instanceof Timestamp ? ts.toDate() : ts ? new Date(ts as unknown as string) : null;
    const key = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : "unknown";
    byMonth[key] = (byMonth[key] ?? 0) + 1;
  }
  const entries = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([month, count]) => ({ month, count }));
}

function sortCounts(counts: Record<string, number>): [string, number][] {
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export default function AdminMemberAnalytics() {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<MemberSignupDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const ref = collection(db, "member_signups");
        const q = query(ref, orderBy("created_at", "desc"));
        const snap = await getDocs(q);
        const data: MemberSignupDoc[] = snap.docs.map((d) => {
          const raw = d.data() as Record<string, unknown>;
          return {
            id: d.id,
            full_name: (raw.full_name as string) ?? "",
            email: (raw.email as string) ?? d.id,
            university: (raw.university as string) ?? "",
            study_field: (raw.study_field as string) ?? "",
            study_level: (raw.study_level as string) ?? "",
            grad_year: (raw.grad_year as number | null) ?? null,
            interests: (raw.interests as string[]) ?? [],
            career_orientation: (raw.career_orientation as string[]) ?? [],
            engagement_level: (raw.engagement_level as string) ?? "",
            motivation: (raw.motivation as string | null) ?? null,
            newsletter_consent: (raw.newsletter_consent as boolean) ?? false,
            created_at: (raw.created_at as Timestamp) ?? null,
          };
        });
        setMembers(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load member signups.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  const stats = useMemo(() => {
    const byUniversity = countBy(members, (m) => m.university);
    const byStudyField = countBy(members, (m) => m.study_field);
    const byStudyLevel = countBy(members, (m) => m.study_level);
    const byGradYear = countBy(members, (m) => (m.grad_year != null ? String(m.grad_year) : ""));
    const byEngagement = countBy(members, (m) => m.engagement_level);
    const newsletterYes = members.filter((m) => m.newsletter_consent).length;
    const newsletterNo = members.length - newsletterYes;
    const byInterest = countByArray(members, "interests");
    const byCareer = countByArray(members, "career_orientation");
    const byMonth = signupsByMonth(members);
    return {
      total: members.length,
      byUniversity,
      byStudyField,
      byStudyLevel,
      byGradYear,
      byEngagement,
      newsletterYes,
      newsletterNo,
      byInterest,
      byCareer,
      byMonth,
    };
  }, [members]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="grid-outer bg-white">
          <Section>
            <div className="grid-inner py-16">
              <p className="text-[hsl(var(--section-light-foreground))]/70">Access denied.</p>
            </div>
          </Section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="grid-outer bg-white">
        <Section>
          <div className="grid-inner py-16 md:py-20">
            <div className="col-span-12">
              <h1 className="mb-2 text-3xl font-semibold text-[hsl(var(--section-light-foreground))] md:text-4xl">
                Member analytics
              </h1>
              <p className="mb-8 max-w-2xl text-xl font-normal text-gray-900 text-[hsl(var(--section-light-foreground))]/70">
                Aggregated answers from the member signup form.
              </p>

              {loading && (
                <p className="text-sm text-[hsl(var(--section-light-foreground))]/60">Loading…</p>
              )}
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {!loading && !error && (
                <div className="space-y-8">
                  {/* Summary card */}
                  <Card className="border-[hsl(var(--divider))] bg-white p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--section-light))]">
                        <Users className="h-6 w-6 text-[hsl(var(--section-light-foreground))]/80" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-[hsl(var(--section-light-foreground))]">
                          {stats.total}
                        </p>
                        <p className="text-sm text-[hsl(var(--section-light-foreground))]/60">
                          Total member signups
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div className="grid gap-8 md:grid-cols-2">
                    {/* University */}
                    <Card className="overflow-hidden border-[hsl(var(--divider))] bg-white">
                      <div className="border-b border-[hsl(var(--divider))] px-6 py-4">
                        <h2 className="text-xl font-normal text-gray-900 text-[hsl(var(--section-light-foreground))]">
                          University
                        </h2>
                      </div>
                      <div className="max-h-64 overflow-y-auto px-6 py-4">
                        <BarList items={sortCounts(stats.byUniversity)} />
                      </div>
                    </Card>

                    {/* Study field */}
                    <Card className="overflow-hidden border-[hsl(var(--divider))] bg-white">
                      <div className="border-b border-[hsl(var(--divider))] px-6 py-4">
                        <h2 className="text-xl font-normal text-gray-900 text-[hsl(var(--section-light-foreground))]">
                          Study field
                        </h2>
                      </div>
                      <div className="max-h-64 overflow-y-auto px-6 py-4">
                        <BarList items={sortCounts(stats.byStudyField)} />
                      </div>
                    </Card>

                    {/* Study level */}
                    <Card className="overflow-hidden border-[hsl(var(--divider))] bg-white">
                      <div className="border-b border-[hsl(var(--divider))] px-6 py-4">
                        <h2 className="text-xl font-normal text-gray-900 text-[hsl(var(--section-light-foreground))]">
                          Study level
                        </h2>
                      </div>
                      <div className="px-6 py-4">
                        <BarList items={sortCounts(stats.byStudyLevel)} />
                      </div>
                    </Card>

                    {/* Graduation year */}
                    <Card className="overflow-hidden border-[hsl(var(--divider))] bg-white">
                      <div className="border-b border-[hsl(var(--divider))] px-6 py-4">
                        <h2 className="text-xl font-normal text-gray-900 text-[hsl(var(--section-light-foreground))]">
                          Graduation year
                        </h2>
                      </div>
                      <div className="max-h-64 overflow-y-auto px-6 py-4">
                        <BarList items={sortCounts(stats.byGradYear).filter(([k]) => k !== "(not set)")} />
                      </div>
                    </Card>

                    {/* Engagement level */}
                    <Card className="overflow-hidden border-[hsl(var(--divider))] bg-white">
                      <div className="border-b border-[hsl(var(--divider))] px-6 py-4">
                        <h2 className="text-xl font-normal text-gray-900 text-[hsl(var(--section-light-foreground))]">
                          Engagement level
                        </h2>
                      </div>
                      <div className="px-6 py-4">
                        <BarList items={sortCounts(stats.byEngagement)} />
                      </div>
                    </Card>

                    {/* Newsletter consent */}
                    <Card className="overflow-hidden border-[hsl(var(--divider))] bg-white">
                      <div className="border-b border-[hsl(var(--divider))] px-6 py-4">
                        <h2 className="text-xl font-normal text-gray-900 text-[hsl(var(--section-light-foreground))]">
                          Newsletter consent
                        </h2>
                      </div>
                      <div className="px-6 py-4">
                        <BarList
                          items={[
                            ["Yes", stats.newsletterYes],
                            ["No", stats.newsletterNo],
                          ]}
                        />
                      </div>
                    </Card>
                  </div>

                  {/* Interests (multi-select, so counts can be high) */}
                  <Card className="overflow-hidden border-[hsl(var(--divider))] bg-white">
                    <div className="border-b border-[hsl(var(--divider))] px-6 py-4">
                      <h2 className="text-xl font-normal text-gray-900 text-[hsl(var(--section-light-foreground))]">
                        Interests
                      </h2>
                      <p className="mt-1 text-sm text-[hsl(var(--section-light-foreground))]/60">
                        Members can select multiple; counts are total selections.
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto px-6 py-4">
                      <BarList items={sortCounts(stats.byInterest).filter(([k]) => k !== "(empty)")} />
                    </div>
                  </Card>

                  {/* Career orientation (if any) */}
                  {Object.keys(stats.byCareer).length > 0 && (
                    <Card className="overflow-hidden border-[hsl(var(--divider))] bg-white">
                      <div className="border-b border-[hsl(var(--divider))] px-6 py-4">
                        <h2 className="text-xl font-normal text-gray-900 text-[hsl(var(--section-light-foreground))]">
                          Career orientation
                        </h2>
                      </div>
                      <div className="max-h-64 overflow-y-auto px-6 py-4">
                        <BarList items={sortCounts(stats.byCareer).filter(([k]) => k !== "(empty)")} />
                      </div>
                    </Card>
                  )}

                  {/* Signups over time */}
                  <Card className="overflow-hidden border-[hsl(var(--divider))] bg-white">
                    <div className="border-b border-[hsl(var(--divider))] px-6 py-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[hsl(var(--section-light-foreground))]/70" />
                      <h2 className="text-xl font-normal text-gray-900 text-[hsl(var(--section-light-foreground))]">
                        Signups over time
                      </h2>
                    </div>
                    <div className="px-6 py-4">
                      {stats.byMonth.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--section-light-foreground))]/60">No data yet.</p>
                      ) : (
                        <BarList items={stats.byMonth.map(({ month, count }) => [month, count])} />
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

function BarList({ items }: { items: [string, number][] }) {
  const max = Math.max(1, ...items.map(([, c]) => c));
  return (
    <ul className="space-y-2">
      {items.map(([label, count]) => (
        <li key={label} className="flex items-center gap-3">
          <span className="min-w-0 flex-1 truncate text-sm text-[hsl(var(--section-light-foreground))]">
            {label}
          </span>
          <div className="h-5 flex-1 max-w-48 overflow-hidden rounded bg-[hsl(var(--section-light))]">
            <div
              className="h-full rounded bg-[hsl(var(--section-light-foreground))]/20"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm tabular-nums text-[hsl(var(--section-light-foreground))]/70">
            {count}
          </span>
        </li>
      ))}
      {items.length === 0 && (
        <li className="text-sm text-[hsl(var(--section-light-foreground))]/60">No data</li>
      )}
    </ul>
  );
}
