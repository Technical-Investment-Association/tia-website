import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/firebase";

type PartnershipKind = "corporate" | "student_club" | "university_club";

type Partnership = {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  established_at?: any;
  logo_url?: string | null;
  published: boolean;
  archived: boolean;
  created_at?: any;
  updated_at?: any;
  kind?: PartnershipKind;
};

const AdminPartnerships = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [establishedDate, setEstablishedDate] = useState(""); // "YYYY-MM-DD"
  const [published, setPublished] = useState(true);
  const [archived, setArchived] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [kind, setKind] = useState<PartnershipKind>("corporate");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // load partnerships
  useEffect(() => {
    const q = query(
      collection(db, "partnerships"),
      orderBy("created_at", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: Partnership[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setPartnerships(items);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Failed to load partnerships.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setWebsite("");
    setEstablishedDate("");
    setPublished(true);
    setArchived(false);
    setLogoFile(null);
    setKind("corporate");
  };

  const openCreateForm = () => {
    resetForm();
    setMessage(null);
    setError(null);
    setShowForm(true);
  };

  const openEditForm = (p: Partnership) => {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description || "");
    setWebsite(p.website || "");
    setEstablishedDate(
      p.established_at?.toDate
        ? p.established_at.toDate().toISOString().slice(0, 10)
        : ""
    );
    setPublished(p.published);
    setArchived(p.archived);
    setLogoFile(null);
    setKind(p.kind || "corporate");
    setMessage(null);
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      if (!name.trim()) throw new Error("Name is required.");

      // Archived items should never be published
      const publishedValue = archived ? false : published;

      let establishedTimestamp: Date | null = null;
      if (establishedDate) {
        establishedTimestamp = new Date(establishedDate + "T00:00:00");
      }

      if (editingId) {
        // update
        const docRef = doc(db, "partnerships", editingId);
        const updateData: any = {
          name: name.trim(),
          description: description.trim() || null,
          website: website.trim() || null,
          published: publishedValue,
          archived,
          established_at: establishedTimestamp ? establishedTimestamp : null,
          updated_at: serverTimestamp(),
          kind,
        };

        if (logoFile) {
          const ext = logoFile.name.split(".").pop() || "png";
          const fileName = `logo.${ext}`;
          const storageRef = ref(
            storage,
            `partnerships/${editingId}/${fileName}`
          );
          const snap = await uploadBytes(storageRef, logoFile);
          const url = await getDownloadURL(snap.ref);
          updateData.logo_url = url;
        }

        await updateDoc(docRef, updateData);
        setMessage("Partnership updated.");
      } else {
        // create
        const created_at = serverTimestamp();
        const docRef = await addDoc(collection(db, "partnerships"), {
          name: name.trim(),
          description: description.trim() || null,
          website: website.trim() || null,
          published: publishedValue,
          archived,
          established_at: establishedTimestamp ? establishedTimestamp : null,
          logo_url: null,
          created_at,
          updated_at: created_at,
          kind,
        });

        if (logoFile) {
          const ext = logoFile.name.split(".").pop() || "png";
          const fileName = `logo.${ext}`;
          const storageRef = ref(
            storage,
            `partnerships/${docRef.id}/${fileName}`
          );
          const snap = await uploadBytes(storageRef, logoFile);
          const url = await getDownloadURL(snap.ref);
          await updateDoc(docRef, { logo_url: url });
        }

        setMessage("Partnership created.");
      }

      closeForm();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save partnership.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveToggleById = async (
    id: string,
    currentArchived: boolean,
    currentPublished: boolean
  ) => {
    try {
      const docRef = doc(db, "partnerships", id);
      const newArchived = !currentArchived;

      await updateDoc(docRef, {
        archived: newArchived,
        published: newArchived ? false : currentPublished,
        updated_at: serverTimestamp(),
      });

      setMessage(
        newArchived ? "Partnership archived." : "Partnership unarchived."
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update archive state.");
    }
  };

  const handleDeleteById = async (id: string) => {
    const sure = window.confirm(
      "Deleting a partnership is permanent. Are you sure? You can also choose to archive it instead."
    );
    if (!sure) return;

    try {
      await deleteDoc(doc(db, "partnerships", id));
      setMessage("Partnership deleted.");
      closeForm();
    } catch (err) {
      console.error(err);
      setError("Failed to delete partnership.");
    }
  };

  // Published/Archived toggle stays as requested
  const visible = useMemo(
    () => partnerships.filter((p) => (showArchived ? p.archived : !p.archived)),
    [partnerships, showArchived]
  );

  // Split into sections: corporate + student_club
  // Note: we treat `university_club` as part of the student-club section for display purposes.
  const corporate = useMemo(
    () => visible.filter((p) => (p.kind || "corporate") === "corporate"),
    [visible]
  );

  const studentClubs = useMemo(
    () =>
      visible.filter((p) => {
        const k = p.kind || "corporate";
        return k === "student_club" || k === "university_club";
      }),
    [visible]
  );

  const kindLabel = (k?: PartnershipKind) => {
    if (k === "student_club") return "Student club";
    if (k === "university_club") return "University club";
    return "Corporate";
  };

  const statusLabel = (p: Partnership) => {
    if (p.archived) return "Archived";
    if (p.published) return "Published";
    return "Unpublished";
  };

  const AdminPartnershipCard = ({ p }: { p: Partnership }) => {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            {p.logo_url ? (
              <img
                src={p.logo_url}
                alt={p.name}
                className="h-12 w-12 object-contain rounded-md border border-slate-100"
              />
            ) : (
              <div className="h-12 w-12 rounded-md border border-slate-200 bg-slate-50" />
            )}

            <div className="min-w-0">
              <h3 className="text-lg font-medium text-slate-900 truncate">
                {p.name}
              </h3>

              {p.description ? (
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                  {p.description}
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-500 italic">
                  No description
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="uppercase tracking-wide">
                  {kindLabel(p.kind)}
                </span>
                <span className="uppercase tracking-wide">
                  {statusLabel(p)}
                </span>
                {p.website ? (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-slate-700"
                  >
                    Website
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* Edit only (archive/delete moved to edit form) */}
          <Button variant="outline" size="sm" onClick={() => openEditForm(p)}>
            Edit
          </Button>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-4 bg-[hsl(var(--section-light))]">
        <div className="container mx-auto max-w-5xl">
          <Separator className="w-16 mb-8 bg-[hsl(var(--divider))]" />

          <header className="mb-8 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-[hsl(var(--section-light-foreground))]">
                Partnerships Admin
              </h1>
              <p className="text-[hsl(var(--section-light-foreground))]/70 max-w-xl">
                Manage partnerships, logos and visibility. Archive to hide
                without deleting.
              </p>
            </div>

            <Button onClick={openCreateForm}>Add new partnership</Button>
          </header>

          {/* Toggle current vs archived (fixed formatting: explicit variants, no inherited text issues) */}
          <div className="flex items-center gap-3 mb-8">
            <Button
              variant={showArchived ? "outline" : "default"}
              size="sm"
              onClick={() => setShowArchived(false)}
            >
              Published
            </Button>
            <Button
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => setShowArchived(true)}
            >
              Archived
            </Button>
          </div>

          {message && (
            <p className="text-sm text-emerald-600 mb-4">{message}</p>
          )}
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          {/* Edit/Create form (archive + delete live here, NOT on the card) */}
          {showForm && (
            <Card className="p-6 mb-10 bg-white border-border">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="kind">Category</Label>
                  <select
                    id="kind"
                    className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm"
                    value={kind}
                    onChange={(e) => setKind(e.target.value as PartnershipKind)}
                  >
                    <option value="corporate">Corporate</option>
                    <option value="student_club">Student club</option>
                    <option value="university_club">University club</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Used for grouping on the admin page and presentation on the
                    public site.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Partnership name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="established">Established (date)</Label>
                  <Input
                    id="established"
                    type="date"
                    value={establishedDate}
                    onChange={(e) => setEstablishedDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setLogoFile(file);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional. PNG/SVG with transparent background works best.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      disabled={archived}
                    />
                    <span>Published</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={archived}
                      onChange={(e) => {
                        const next = e.target.checked;
                        setArchived(next);
                        if (next) setPublished(false);
                      }}
                    />
                    <span>Archived (auto-unpublishes)</span>
                  </label>
                </div>

                {/* Footer actions */}
                <div className="pt-4 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={closeForm}>
                      Cancel
                    </Button>

                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const current = partnerships.find(
                            (x) => x.id === editingId
                          );
                          if (!current) return;
                          handleArchiveToggleById(
                            current.id,
                            current.archived,
                            current.published
                          );
                        }}
                      >
                        {archived ? "Unarchive" : "Archive"}
                      </Button>
                    )}

                    {editingId && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDeleteById(editingId)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>

                  <Button type="submit" disabled={submitting}>
                    {submitting
                      ? editingId
                        ? "Saving..."
                        : "Creating..."
                      : editingId
                      ? "Save changes"
                      : "Create"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Lists split into Corporate + Student Club sections */}
          {loading ? (
            <p>Loading partnerships...</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No {showArchived ? "archived" : "published"} partnerships yet.
            </p>
          ) : (
            <div className="space-y-10">
              <div>
                <h2 className="text-xl font-medium text-[hsl(var(--section-light-foreground))] mb-4">
                  Corporate
                </h2>
                {corporate.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No corporate partnerships here.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {corporate.map((p) => (
                      <AdminPartnershipCard key={p.id} p={p} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-medium text-[hsl(var(--section-light-foreground))] mb-4">
                  Student clubs
                </h2>
                {studentClubs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No student club partnerships here.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {studentClubs.map((p) => (
                      <AdminPartnershipCard key={p.id} p={p} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminPartnerships;
