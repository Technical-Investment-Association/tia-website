/**
 * AdminPartnerships.tsx
 *
 * Admin interface for managing partnerships
 * Layout intentionally mirrors AdminEvents.tsx:
 * - Navigation + Hero + white content section
 * - Sections for Current + Archived
 * - "Create new" button in Hero
 * - Edit handled through a modal
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { Plus } from "lucide-react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { PartnershipEditModal } from "@/components/modals/partnership-edit-modal";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type PartnershipKind = "corporate" | "student_club";

export type PartnershipDoc = {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  established_at?: Timestamp | null;
  logo_url?: string | null;
  published: boolean;
  archived: boolean;
  kind?: PartnershipKind;
  created_at?: Timestamp | null;
  updated_at?: Timestamp | null;
};

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

const AdminPartnerships = () => {
  const { isAdmin } = useAuth();

  const [partnerships, setPartnerships] = useState<PartnershipDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPartnership, setSelectedPartnership] =
    useState<PartnershipDoc | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, "partnerships"),
      orderBy("created_at", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: PartnershipDoc[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name,
            description: data.description ?? null,
            website: data.website ?? null,
            established_at: data.established_at ?? null,
            logo_url: data.logo_url ?? null,
            published: data.published ?? false,
            archived: data.archived ?? false,
            kind: data.kind ?? "corporate",
            created_at: data.created_at ?? null,
            updated_at: data.updated_at ?? null,
          };
        });

        setPartnerships(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Failed to load partnerships:", err);
        setError("Failed to load partnerships. Please try again later.");
        setLoading(false);
      },
    );

    return () => unsub();
  }, [isAdmin]);

  const { current, archived } = useMemo(() => {
    const current = partnerships.filter((p) => !p.archived);
    const archived = partnerships.filter((p) => p.archived);
    return { current, archived };
  }, [partnerships]);

  const handleCreateNew = () => {
    setSelectedPartnership(null);
    setEditModalOpen(true);
  };

  const handleEdit = (p: PartnershipDoc) => {
    setSelectedPartnership(p);
    setEditModalOpen(true);
  };

  const handleUpdated = () => {
    // onSnapshot keeps this live; no manual refresh required
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-neutral-600">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <Hero
        title="Manage Partnerships"
        description="Create, edit, and manage TIA partnerships and logos."
        height={450}
        actions={
          <Button
            size="lg"
            onClick={handleCreateNew}
            className="bg-primary-800 hover:bg-primary-900 text-white"
          >
            <Plus className="mr-2 w-5 h-5" />
            Create New Partnership
          </Button>
        }
      />

      <main className="grid-outer bg-white">
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <div className="text-[hsl(var(--section-light-foreground))]/70">
                    Loading partnerships...
                  </div>
                </div>
              )}

              {error && (
                <div className="py-10">
                  <div className="p-4 border border-[hsl(var(--divider))]">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {!loading && !error && (
                <div className="space-y-16">
                  {/* Current */}
                  <div>
                    <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />
                    <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-8">
                      Current Partnerships
                    </h2>

                    {current.length === 0 ? (
                      <p className="text-[hsl(var(--section-light-foreground))]/70 py-10">
                        No current partnerships.
                      </p>
                    ) : (
                      <div className="border-t border-[hsl(var(--divider))]/40">
                        {current.map((p, index) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <AdminPartnershipRow
                              partnership={p}
                              onEdit={() => handleEdit(p)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Archived */}
                  {archived.length > 0 && (
                    <div>
                      <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />
                      <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-8">
                        Archived Partnerships
                      </h2>

                      <div className="border-t border-[hsl(var(--divider))]/40">
                        {archived.map((p, index) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <AdminPartnershipRow
                              partnership={p}
                              onEdit={() => handleEdit(p)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <PartnershipEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        partnership={selectedPartnership}
        onPartnershipUpdated={handleUpdated}
      />
    </div>
  );
};

export default AdminPartnerships;

// ----------------------------------------------------------------------------
// Row component (mirrors “AdminEventCard” vibe but simpler)
// ----------------------------------------------------------------------------

function kindLabel(kind?: PartnershipKind) {
  if (kind === "student_club") return "Student club";
  return "Corporate";
}

function statusLabel(p: PartnershipDoc) {
  if (p.archived) return "Archived";
  if (p.published) return "Published";
  return "Unpublished";
}

function AdminPartnershipRow({
  partnership,
  onEdit,
}: {
  partnership: PartnershipDoc;
  onEdit: () => void;
}) {
  return (
    <div className="py-6 border-b border-[hsl(var(--divider))]/40 flex flex-col md:flex-row md:items-center gap-5">
      {/* Logo */}
      <div className="w-full md:w-44 flex-shrink-0">
        {partnership.logo_url ? (
          <div className="h-20 border border-[hsl(var(--divider))] bg-white flex items-center justify-center p-3">
            <img
              src={partnership.logo_url}
              alt={partnership.name}
              className="max-h-14 w-full object-contain"
            />
          </div>
        ) : (
          <div className="h-20 border border-dashed border-[hsl(var(--divider))] bg-white flex items-center justify-center text-xs text-[hsl(var(--section-light-foreground))]/60">
            No logo
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-lg font-semibold text-[hsl(var(--section-light-foreground))]">
            {partnership.name}
          </h3>
          <span className="text-xs px-2 py-1 border border-[hsl(var(--divider))] text-[hsl(var(--section-light-foreground))]/70">
            {kindLabel(partnership.kind)}
          </span>
          <span className="text-xs px-2 py-1 border border-[hsl(var(--divider))] text-[hsl(var(--section-light-foreground))]/70">
            {statusLabel(partnership)}
          </span>
        </div>

        {partnership.description ? (
          <p className="mt-2 text-sm text-[hsl(var(--section-light-foreground))]/70 line-clamp-2">
            {partnership.description}
          </p>
        ) : (
          <p className="mt-2 text-sm text-[hsl(var(--section-light-foreground))]/50">
            No description.
          </p>
        )}

        {partnership.website ? (
          <p className="mt-2 text-xs text-[hsl(var(--section-light-foreground))]/60 break-all">
            {partnership.website}
          </p>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex gap-3 md:justify-end">
        <Button variant="outline" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  );
}
