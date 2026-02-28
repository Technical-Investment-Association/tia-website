/**
 * AdminMembers – Admin page for member signups and newsletter subscribers.
 * - Member signups: search, edit, delete, newsletter toggle
 * - Newsletter-only signups: list and delete
 */

import { useEffect, useState, useMemo } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { Search, Pencil, Trash2 } from "lucide-react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MemberEditModal, type MemberSignupDoc } from "@/components/modals/member-edit-modal";

type NewsletterSignup = {
  id: string;
  email: string;
  source?: string;
  created_at?: Timestamp | null;
};

const formatDate = (ts?: Timestamp | null) => {
  if (!ts) return "—";
  return ts.toDate().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function AdminMembers() {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<MemberSignupDoc[]>([]);
  const [newsletterSubs, setNewsletterSubs] = useState<NewsletterSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberSignupDoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "member" | "newsletter"; id: string } | null>(null);

  const loadData = async () => {
    try {
      const membersRef = collection(db, "member_signups");
      const membersQuery = query(membersRef, orderBy("created_at", "desc"));
      const membersSnap = await getDocs(membersQuery);
      const memberData: MemberSignupDoc[] = membersSnap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          full_name: (data.full_name as string) ?? "",
          email: (data.email as string) ?? d.id,
          university: (data.university as string) ?? "",
          study_field: (data.study_field as string) ?? "",
          study_level: (data.study_level as string) ?? "",
          grad_year: (data.grad_year as number | null) ?? null,
          interests: (data.interests as string[]) ?? [],
          career_orientation: (data.career_orientation as string[]) ?? [],
          engagement_level: (data.engagement_level as string) ?? "",
          motivation: (data.motivation as string | null) ?? null,
          newsletter_consent: (data.newsletter_consent as boolean) ?? false,
          created_at: (data.created_at as Timestamp) ?? null,
        };
      });

      const newsletterRef = collection(db, "newsletter_signups");
      const newsletterQuery = query(newsletterRef, orderBy("created_at", "desc"));
      const newsletterSnap = await getDocs(newsletterQuery);
      const newsletterData: NewsletterSignup[] = newsletterSnap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          email: (data.email as string) ?? "",
          source: (data.source as string) ?? "",
          created_at: (data.created_at as Timestamp) ?? null,
        };
      });

      setMembers(memberData);
      setNewsletterSubs(newsletterData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const s = search.trim().toLowerCase();
    return members.filter(
      (m) =>
        m.email.toLowerCase().includes(s) ||
        (m.full_name && m.full_name.toLowerCase().includes(s))
    );
  }, [members, search]);

  const handleEdit = (member: MemberSignupDoc) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  const handleNewsletterToggle = async (member: MemberSignupDoc) => {
    try {
      const ref = doc(db, "member_signups", member.id);
      await updateDoc(ref, { newsletter_consent: !member.newsletter_consent });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "member") {
        await deleteDoc(doc(db, "member_signups", deleteTarget.id));
      } else {
        await deleteDoc(doc(db, "newsletter_signups", deleteTarget.id));
      }
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

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
                Members & Newsletter
              </h1>
              <p className="mb-8 max-w-2xl text-[hsl(var(--section-light-foreground))]/70">
                Member signups from the Join page and newsletter-only subscribers. You can edit members, toggle newsletter consent, and delete entries.
              </p>

              {loading && (
                <p className="text-sm text-[hsl(var(--section-light-foreground))]/60">Loading…</p>
              )}
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {!loading && !error && (
                <div className="space-y-12">
                  {/* Member signups */}
                  <Card className="overflow-hidden border-[hsl(var(--divider))] bg-white">
                    <div className="border-b border-[hsl(var(--divider))] px-6 py-4">
                      <h2 className="text-xl font-semibold text-[hsl(var(--section-light-foreground))]">
                        Member signups
                      </h2>
                      <div className="mt-3 flex gap-2">
                        <div className="relative flex-1 max-w-xs">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--section-light-foreground))]/50" />
                          <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border-[hsl(var(--divider))] pl-9"
                          />
                        </div>
                      </div>
                    </div>
                    {filteredMembers.length === 0 ? (
                      <div className="px-6 py-10 text-center text-sm text-[hsl(var(--section-light-foreground))]/60">
                        {members.length === 0
                          ? "No member signups yet."
                          : "No members match your search."}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[hsl(var(--divider))] text-left text-[hsl(var(--section-light-foreground))]/70">
                              <th className="px-6 py-3">Name</th>
                              <th className="px-6 py-3">Email</th>
                              <th className="px-6 py-3">University</th>
                              <th className="px-6 py-3">Engagement</th>
                              <th className="px-6 py-3">Newsletter</th>
                              <th className="px-6 py-3">Created</th>
                              <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMembers.map((m) => (
                              <tr
                                key={m.id}
                                className="border-b border-[hsl(var(--divider))]/50 hover:bg-[hsl(var(--section-light))]/30"
                              >
                                <td className="px-6 py-3 text-[hsl(var(--section-light-foreground))]">
                                  {m.full_name || "—"}
                                </td>
                                <td className="px-6 py-3 text-[hsl(var(--section-light-foreground))]/90">
                                  {m.email}
                                </td>
                                <td className="px-6 py-3 text-[hsl(var(--section-light-foreground))]/80">
                                  {m.university || "—"}
                                </td>
                                <td className="px-6 py-3 text-[hsl(var(--section-light-foreground))]/80">
                                  {m.engagement_level || "—"}
                                </td>
                                <td className="px-6 py-3">
                                  <label className="flex cursor-pointer items-center gap-2">
                                    <Checkbox
                                      checked={m.newsletter_consent}
                                      onCheckedChange={() => handleNewsletterToggle(m)}
                                    />
                                    <span className="text-sm text-[hsl(var(--section-light-foreground))]/80">
                                      {m.newsletter_consent ? "Yes" : "No"}
                                    </span>
                                  </label>
                                </td>
                                <td className="px-6 py-3 text-[hsl(var(--section-light-foreground))]/60">
                                  {formatDate(m.created_at)}
                                </td>
                                <td className="px-6 py-3 text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(m)}
                                      className="text-[hsl(var(--section-light-foreground))]/80"
                                      aria-label="Edit"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeleteTarget({ type: "member", id: m.id })}
                                      className="text-red-600 hover:text-red-700"
                                      aria-label="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>

                  {/* Newsletter-only signups */}
                  <Card className="overflow-hidden border-[hsl(var(--divider))] bg-white">
                    <div className="border-b border-[hsl(var(--divider))] px-6 py-4">
                      <h2 className="text-xl font-semibold text-[hsl(var(--section-light-foreground))]">
                        Newsletter signups (only)
                      </h2>
                      <p className="mt-1 text-sm text-[hsl(var(--section-light-foreground))]/60">
                        Emails that signed up for the newsletter without a full membership.
                      </p>
                    </div>
                    {newsletterSubs.length === 0 ? (
                      <div className="px-6 py-10 text-center text-sm text-[hsl(var(--section-light-foreground))]/60">
                        No newsletter-only signups yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[hsl(var(--divider))] text-left text-[hsl(var(--section-light-foreground))]/70">
                              <th className="px-6 py-3">Email</th>
                              <th className="px-6 py-3">Source</th>
                              <th className="px-6 py-3">Created</th>
                              <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newsletterSubs.map((n) => (
                              <tr
                                key={n.id}
                                className="border-b border-[hsl(var(--divider))]/50 hover:bg-[hsl(var(--section-light))]/30"
                              >
                                <td className="px-6 py-3 text-[hsl(var(--section-light-foreground))]">
                                  {n.email}
                                </td>
                                <td className="px-6 py-3 text-[hsl(var(--section-light-foreground))]/80">
                                  {n.source || "—"}
                                </td>
                                <td className="px-6 py-3 text-[hsl(var(--section-light-foreground))]/60">
                                  {formatDate(n.created_at)}
                                </td>
                                <td className="px-6 py-3 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteTarget({ type: "newsletter", id: n.id })}
                                    className="text-red-600 hover:text-red-700"
                                    aria-label="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </div>
          </div>
        </Section>
      </main>
      <Footer />

      <MemberEditModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedMember(null); }}
        member={selectedMember}
        onSaved={loadData}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "member"
                ? "This will remove the member signup from the database. This action cannot be undone."
                : "This will remove the newsletter signup. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(var(--divider))]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
