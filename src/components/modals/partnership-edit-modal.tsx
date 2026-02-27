/**
 * PartnershipEditModal.tsx
 *
 * Modal for creating and editing partnerships.
 * Matches the visual style of EventEditModal:
 * - fixed overlay
 * - sticky header + footer
 * - inline validation + error banner
 * - Danger zone for delete
 *
 * Fields kept the same, but "university_club" removed.
 */

import { useEffect, useState, ChangeEvent } from "react";
import { X, Upload, Trash2, Save, AlertCircle } from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage } from "@/lib/firebase/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  PartnershipDoc,
  PartnershipKind,
} from "@/pages/AdminPartnerships"; // adjust if your routes folder differs

type Props = {
  isOpen: boolean;
  onClose: () => void;
  partnership: PartnershipDoc | null;
  onPartnershipUpdated: () => void;
};

type FormState = {
  name: string;
  description: string;
  website: string;
  established_date: string; // YYYY-MM-DD
  published: boolean;
  archived: boolean;
  kind: PartnershipKind;

  logo_url: string;
  logo_file: File | null;
  logo_preview: string;
};

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

function toDateInput(ts?: Timestamp | null) {
  if (!ts) return "";
  const d = ts.toDate();
  return d.toISOString().slice(0, 10);
}

export const PartnershipEditModal = ({
  isOpen,
  onClose,
  partnership,
  onPartnershipUpdated,
}: Props) => {
  const [form, setForm] = useState<FormState>(getInitial());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (partnership) {
      setForm({
        name: partnership.name || "",
        description: partnership.description || "",
        website: partnership.website || "",
        established_date: toDateInput(partnership.established_at ?? null),
        published: partnership.published ?? false,
        archived: partnership.archived ?? false,
        kind: partnership.kind ?? "corporate",
        logo_url: partnership.logo_url || "",
        logo_file: null,
        logo_preview: partnership.logo_url || "",
      });
    } else {
      setForm(getInitial());
    }

    setError(null);
    setLoading(false);
    setShowDeleteConfirm(false);
  }, [partnership, isOpen]);

  if (!isOpen) return null;

  const validateLogo = (file: File) => {
    if (!file.type.startsWith("image/")) return "Please select an image file.";
    if (file.size > MAX_LOGO_BYTES) return "Logo must be less than 5MB.";
    return null;
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const msg = validateLogo(file);
    if (msg) {
      setError(msg);
      return;
    }

    setForm((prev) => ({
      ...prev,
      logo_file: file,
      logo_preview: URL.createObjectURL(file),
    }));
    setError(null);
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({
      ...prev,
      logo_file: null,
      logo_preview: "",
      logo_url: "",
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!form.name.trim()) throw new Error("Name is required.");

      // If archived, force published false
      const publishedValue = form.archived ? false : form.published;

      const established = form.established_date?.trim()
        ? new Date(`${form.established_date}T00:00:00`)
        : null;

      // Create or update doc
      if (partnership) {
        const docRef = doc(db, "partnerships", partnership.id);

        const updateData: any = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          website: form.website.trim() || null,
          established_at: established ? established : null,
          published: publishedValue,
          archived: form.archived,
          kind: form.kind,
          updated_at: serverTimestamp(),
        };

        // Upload logo if chosen
        if (form.logo_file) {
          const ext = form.logo_file.name.split(".").pop() || "png";
          const fileName = `logo.${ext}`;
          const storageRef = ref(
            storage,
            `partnerships/${partnership.id}/${fileName}`,
          );
          const snap = await uploadBytes(storageRef, form.logo_file);
          const url = await getDownloadURL(snap.ref);
          updateData.logo_url = url;
        } else if (form.logo_url === "" && partnership.logo_url) {
          // User removed logo in UI
          updateData.logo_url = null;
        }

        await updateDoc(docRef, updateData);
      } else {
        const created_at = serverTimestamp();

        const docRef = await addDoc(collection(db, "partnerships"), {
          name: form.name.trim(),
          description: form.description.trim() || null,
          website: form.website.trim() || null,
          established_at: established ? established : null,
          published: publishedValue,
          archived: form.archived,
          kind: form.kind,
          logo_url: null,
          created_at,
          updated_at: created_at,
        });

        // Upload logo if chosen
        if (form.logo_file) {
          const ext = form.logo_file.name.split(".").pop() || "png";
          const fileName = `logo.${ext}`;
          const storageRef = ref(
            storage,
            `partnerships/${docRef.id}/${fileName}`,
          );
          const snap = await uploadBytes(storageRef, form.logo_file);
          const url = await getDownloadURL(snap.ref);
          await updateDoc(docRef, { logo_url: url });
        }
      }

      onPartnershipUpdated();
      onClose();
    } catch (err: any) {
      console.error("Failed to save partnership:", err);
      setError(err?.message || "Failed to save partnership");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!partnership) return;

    setLoading(true);
    setError(null);

    try {
      await deleteDoc(doc(db, "partnerships", partnership.id));
      onPartnershipUpdated();
      onClose();
    } catch (err: any) {
      console.error("Failed to delete partnership:", err);
      setError(err?.message || "Failed to delete partnership");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-900 scrollbar-track-transparent">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[hsl(var(--divider))] px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[hsl(var(--section-light-foreground))]">
            {partnership ? "Edit Partnership" : "Create New Partnership"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="px-6 py-6 space-y-8">
          {/* Basic */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--section-light-foreground))]">
              Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="kind">Partnership type</Label>
                <Select
                  value={form.kind}
                  onValueChange={(v: PartnershipKind) =>
                    setForm((p) => ({ ...p, kind: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">
                      Corporate partnership
                    </SelectItem>
                    <SelectItem value="student_club">Student club</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Partnership name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. DNB"
                />
              </div>

              <div>
                <Label htmlFor="description">Info / description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  placeholder="Short description shown on the site..."
                />
              </div>

              <div>
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  value={form.website}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, website: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="established">Established (date)</Label>
                <Input
                  id="established"
                  type="date"
                  value={form.established_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, established_date: e.target.value }))
                  }
                />
              </div>
            </div>
          </section>

          {/* Logo */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--section-light-foreground))]">
              Logo
            </h3>

            {form.logo_preview ? (
              <div className="relative inline-block">
                <img
                  src={form.logo_preview}
                  alt="Logo preview"
                  className="max-w-xs max-h-48 object-contain border border-[hsl(var(--divider))] p-2"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[hsl(var(--divider))] p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--divider))]" />
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <span className="text-sm text-[hsl(var(--section-light-foreground))]/70">
                    Click to upload logo (max 5MB)
                  </span>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>
            )}
          </section>

          {/* Status */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--section-light-foreground))]">
              Status
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, published: e.target.checked }))
                  }
                  disabled={form.archived}
                />
                <span>Published (visible to public)</span>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.archived}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, archived: e.target.checked }))
                  }
                />
                <span>Archived (auto unpublishes)</span>
              </label>
            </div>
          </section>

          {/* Danger Zone */}
          {partnership && (
            <section className="border-t border-red-200 pt-6">
              <h3 className="text-lg font-semibold mb-2 text-red-700">
                Danger Zone
              </h3>
              <p className="text-sm text-[hsl(var(--section-light-foreground))]/70 mb-4">
                Once you delete a partnership, there is no going back. Please be
                certain.
              </p>

              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Partnership
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-red-700">
                    Are you sure you want to delete this partnership? This
                    action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      Yes, Delete
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[hsl(var(--divider))] px-6 py-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading
              ? "Saving..."
              : partnership
                ? "Save Changes"
                : "Create Partnership"}
          </Button>
        </div>
      </div>
    </div>
  );
};

function getInitial(): FormState {
  return {
    name: "",
    description: "",
    website: "",
    established_date: "",
    published: true,
    archived: false,
    kind: "corporate",
    logo_url: "",
    logo_file: null,
    logo_preview: "",
  };
}
