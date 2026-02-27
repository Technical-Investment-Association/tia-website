import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Plus } from "lucide-react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";

import type { AnyResource } from "@/types/resource";
import { AdminResourceRow } from "@/components/admin-resource-row";
import { ResearchEditModal } from "@/components/modals/research-edit-modal";

const AdminResearch = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<AnyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<AnyResource | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, "resources"),
      orderBy("published_at", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as AnyResource[];
        setItems(all.filter((r) => r.type === "research"));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError("Failed to load research.");
        setLoading(false);
      },
    );

    return () => unsub();
  }, [isAdmin]);

  const { published, unpublished, archived } = useMemo(() => {
    const archived = items.filter((r) => r.archived);
    const active = items.filter((r) => !r.archived);
    const published = active.filter((r) => r.published);
    const unpublished = active.filter((r) => !r.published);
    return { published, unpublished, archived };
  }, [items]);

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
        title="Manage Research"
        description="Upload student research reports (PDF) with strict metadata for clean filtering."
        height={300}
        actions={
          <Button
            size="lg"
            onClick={() => {
              setSelected(null);
              setEditOpen(true);
            }}
            className="bg-primary-800 hover:bg-primary-900 text-white"
          >
            <Plus className="mr-2 w-5 h-5" />
            Upload Research PDF
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
                    Loading research...
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
                  <div>
                    <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />
                    <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-8">
                      Published
                    </h2>
                    {published.length === 0 ? (
                      <p className="text-[hsl(var(--section-light-foreground))]/70 py-10">
                        No published research.
                      </p>
                    ) : (
                      <div className="border-t border-[hsl(var(--divider))]/40">
                        {published.map((r, i) => (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                          >
                            <AdminResourceRow
                              resource={r}
                              onEdit={() => {
                                setSelected(r);
                                setEditOpen(true);
                              }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />
                    <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-8">
                      Unpublished
                    </h2>
                    {unpublished.length === 0 ? (
                      <p className="text-[hsl(var(--section-light-foreground))]/70 py-10">
                        No unpublished research.
                      </p>
                    ) : (
                      <div className="border-t border-[hsl(var(--divider))]/40">
                        {unpublished.map((r, i) => (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                          >
                            <AdminResourceRow
                              resource={r}
                              onEdit={() => {
                                setSelected(r);
                                setEditOpen(true);
                              }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {archived.length > 0 && (
                    <div>
                      <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />
                      <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-8">
                        Archived
                      </h2>
                      <div className="border-t border-[hsl(var(--divider))]/40">
                        {archived.map((r, i) => (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                          >
                            <AdminResourceRow
                              resource={r}
                              onEdit={() => {
                                setSelected(r);
                                setEditOpen(true);
                              }}
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

      <ResearchEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        resource={selected}
      />
    </div>
  );
};

export default AdminResearch;
