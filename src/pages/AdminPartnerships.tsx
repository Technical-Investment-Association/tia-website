import { useEffect, useState } from "react";
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
  const [kind, setKind] = useState<PartnershipKind>("corporate"); // ✅ moved here

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
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      if (!name.trim()) throw new Error("Name is required.");

      const publishedValue = archived ? false : published;

      let establishedTimestamp = null;
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
          await updateDoc(docRef, {
            logo_url: url,
          });
        }

        setMessage("Partnership created.");
      }

      resetForm();
      setShowForm(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save partnership.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveToggle = async (p: Partnership) => {
    try {
      const docRef = doc(db, "partnerships", p.id);
      const newArchived = !p.archived;
      await updateDoc(docRef, {
        archived: newArchived,
        published: newArchived ? false : p.published,
        updated_at: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      setError("Failed to update archive state.");
    }
  };

  const handleDelete = async (p: Partnership) => {
    const sure = window.confirm(
      "Deleting a partnership is permanent. Are you sure? You can also choose to archive it instead."
    );
    if (!sure) return;

    try {
      await deleteDoc(doc(db, "partnerships", p.id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete partnership.");
    }
  };

  const filtered = partnerships.filter((p) =>
    showArchived ? p.archived : !p.archived
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-4 bg-[hsl(var(--section-light))]">
        <div className="container mx-auto max-w-5xl">
          <Separator className="w-16 mb-8 bg-[hsl(var(--divider))]" />
          <header className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-[hsl(var(--section-light-foreground))]">
                Partnerships Admin
              </h1>
              <p className="text-[hsl(var(--section-light-foreground))]/70 max-w-xl">
                Manage current and archived partnerships, including logos, info,
                and visibility.
              </p>
            </div>
            <Button onClick={openCreateForm} variant="default">
              Add new partnership
            </Button>
          </header>

          {/* Toggle current vs archived */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant={showArchived ? "outline" : "default"}
              size="sm"
              onClick={() => setShowArchived(false)}
            >
              Current partnerships
            </Button>
            <Button
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => setShowArchived(true)}
            >
              Archived partnerships
            </Button>
          </div>

          {message && (
            <p className="text-sm text-emerald-500 mb-4">{message}</p>
          )}
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          {/* Form */}
          {showForm && (
            <Card className="p-6 mb-8 bg-white border-border">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="kind">Partnership type</Label>
                  <select
                    id="kind"
                    className="border border-input bg-background rounded-md px-3 py-2 text-sm"
                    value={kind}
                    onChange={(e) => setKind(e.target.value as PartnershipKind)}
                  >
                    <option value="corporate">Corporate partnership</option>
                    <option value="student_club">Student club</option>
                    <option value="university_club">University club</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Choose how this partnership should appear on the public
                    site.
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
                  <Label htmlFor="description">Info / description</Label>
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
                    Optional, but recommended. PNG/SVG with transparent
                    background works best.
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
                      onChange={(e) => setArchived(e.target.checked)}
                    />
                    <span>Archived (auto unpublishes)</span>
                  </label>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting
                      ? editingId
                        ? "Saving..."
                        : "Creating..."
                      : editingId
                      ? "Save changes"
                      : "Create partnership"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* List */}
          {loading ? (
            <p>Loading partnerships...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No {showArchived ? "archived" : "current"} partnerships yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((p) => (
                <Card
                  key={p.id}
                  className="p-4 bg-white border-border flex gap-4 items-center"
                >
                  {p.logo_url && (
                    <img
                      src={p.logo_url}
                      alt={p.name}
                      className="w-20 h-20 object-contain rounded-md border border-muted"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="font-semibold">{p.name}</h2>
                    {p.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Status:{" "}
                      {p.archived
                        ? "Archived"
                        : p.published
                        ? "Published"
                        : "Unpublished"}
                    </p>
                    {p.kind && (
                      <p className="text-xs text-muted-foreground">
                        Type:{" "}
                        {p.kind === "student_club"
                          ? "Student club"
                          : p.kind === "university_club"
                          ? "University club"
                          : "Corporate"}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditForm(p)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={p.archived ? "outline" : "secondary"}
                      onClick={() => handleArchiveToggle(p)}
                    >
                      {p.archived ? "Unarchive" : "Archive"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(p)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminPartnerships;
