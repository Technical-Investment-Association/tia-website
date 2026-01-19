// src/pages/AdminContent.tsx
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type StaticContentDoc = {
  id: string;
  text: string;
  updated_at?: Timestamp | null;
  updated_by?: string | null;
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

const AdminContent = () => {
  const [docs, setDocs] = useState<StaticContentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const ref = collection(db, "static_content");
        // orderBy optional – you can skip or sort by id
        const q = query(ref, orderBy("updated_at", "desc"));
        const snap = await getDocs(q);
        const data: StaticContentDoc[] = snap.docs.map((doc) => {
          const d = doc.data() as any;
          return {
            id: doc.id,
            text: d.text ?? "",
            updated_at: d.updated_at ?? null,
            updated_by: d.updated_by ?? null,
          };
        });
        setDocs(data);
        const buf: Record<string, string> = {};
        data.forEach((d) => {
          buf[d.id] = d.text;
        });
        setEditBuffer(buf);
      } catch (err) {
        console.error(err);
        setError("Failed to load static content.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSave = async (id: string) => {
    const text = editBuffer[id] ?? "";
    const confirmed = window.confirm(
      "Warning: This will immediately update the public website for this section. " +
      "There is no built-in rollback. Continue?"
    );
    if (!confirmed) return;

    try {
      setSavingId(id);
      setError(null);
      await import("firebase/firestore").then(({ doc, setDoc, serverTimestamp }) =>
        setDoc(
          doc(db, "static_content", id),
          {
            text,
            updated_at: serverTimestamp(),
          },
          { merge: true }
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="pt-32 pb-20 px-4 bg-[hsl(var(--section-light))]">
        <div className="container mx-auto max-w-6xl">
          <Separator className="w-16 mb-8 bg-[hsl(var(--divider))]" />
          <h1 className="text-4xl font-bold mb-3 text-[hsl(var(--section-light-foreground))]">
            Admin · Static Content
          </h1>
          <p className="text-[hsl(var(--section-light-foreground))]/70 mb-8 max-w-3xl">
            Edit the static text displayed on each page. Changes are live immediately and affect all visitors.
          </p>

          {loading && <p>Loading…</p>}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {!loading && !docs.length && (
            <p className="text-sm text-muted-foreground">
              No static content entries found yet. They are created automatically when you save text via the page sections.
            </p>
          )}

          <div className="space-y-6">
            {docs.map((d) => (
              <Card key={d.id} className="p-6 bg-white border-border">
                <div className="mb-2 flex justify-between items-baseline gap-4">
                  <div>
                    <p className="text-sm font-mono text-muted-foreground">{d.id}</p>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {formatDateTime(d.updated_at)} {d.updated_by && `· by ${d.updated_by}`}
                    </p>
                  </div>
                </div>
                <Textarea
                  value={editBuffer[d.id] ?? ""}
                  onChange={(e) =>
                    setEditBuffer((prev) => ({ ...prev, [d.id]: e.target.value }))
                  }
                  className="min-h-[120px] mb-3"
                />
                <p className="text-xs text-amber-500 mb-2">
                  Warning: Saving will immediately update this text on the public site. There is no built-in rollback.
                </p>
                <Button
                  size="sm"
                  onClick={() => handleSave(d.id)}
                  disabled={savingId === d.id}
                >
                  {savingId === d.id ? "Saving…" : "Save changes"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminContent;
