import { useEffect, useState, ChangeEvent } from "react";
import { X, Upload, Trash2, Save, AlertCircle } from "lucide-react";
import { Timestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  AnyResource,
  ResearchAssetClass,
  ResearchMethodology,
  ResearchRegion,
  ResearchSector,
} from "@/types/resource";

import {
  RESEARCH_ASSET_CLASSES,
  RESEARCH_METHODOLOGIES,
  RESEARCH_REGIONS,
  RESEARCH_SECTORS,
  MAX_TAGS,
  MAX_TAG_LEN,
} from "@/types/resource";

import {
  createResourceBaseId,
  createResourceDoc,
  deleteResourceDoc,
  normalizeTags,
  updateResourceDoc,
  uploadResourcePdf,
  validatePdf,
  yearFromTimestamp,
} from "@/services/resources";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  resource: AnyResource | null;
};

type FormState = {
  title: string;
  summary: string;
  tagsInput: string;

  published: boolean;
  archived: boolean;

  publishedDate: string; // YYYY-MM-DD

  pdfFile: File | null;
  pdfName: string;

  authorsInput: string; // newline separated
  affiliation: string;

  asset_class: ResearchAssetClass;
  sector: ResearchSector;
  region: ResearchRegion;

  ticker: string;
  company_name: string;

  methodologies: ResearchMethodology[]; // optional
};

function nowDateInput() {
  return new Date().toISOString().slice(0, 10);
}

function splitLines(s: string) {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function validateTags(tags: string[]) {
  if (tags.length > MAX_TAGS) return `Max ${MAX_TAGS} tags.`;
  for (const t of tags) {
    if (t.length > MAX_TAG_LEN)
      return `Tag "${t}" is too long (max ${MAX_TAG_LEN}).`;
  }
  return null;
}

export const ResearchEditModal = ({ isOpen, onClose, resource }: Props) => {
  const [form, setForm] = useState<FormState>(getInitial());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (resource && resource.type === "research") {
      const r: any = resource;

      setForm({
        title: r.title ?? "",
        summary: r.summary ?? "",
        tagsInput: (r.tags ?? []).join(", "),

        published: r.published ?? true,
        archived: r.archived ?? false,

        publishedDate: r.published_at
          ? r.published_at.toDate().toISOString().slice(0, 10)
          : nowDateInput(),

        pdfFile: null,
        pdfName: r.file_path ? r.file_path.split("/").pop() : "",

        authorsInput: (r.research?.authors ?? []).join("\n"),
        affiliation: r.research?.affiliation ?? "",

        asset_class: r.research?.asset_class ?? "equity",
        sector: r.research?.sector ?? "other",
        region: r.research?.region ?? "global",

        ticker: r.research?.ticker ?? "",
        company_name: r.research?.company_name ?? "",

        methodologies: r.research?.methodology ?? [],
      });
    } else {
      setForm(getInitial());
    }

    setError(null);
    setLoading(false);
    setShowDeleteConfirm(false);
  }, [resource, isOpen]);

  if (!isOpen) return null;

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const msg = validatePdf(file);
    if (msg) {
      setError(msg);
      return;
    }

    setForm((p) => ({ ...p, pdfFile: file, pdfName: file.name }));
    setError(null);
  };

  const handleRemovePdf = () => {
    setForm((p) => ({ ...p, pdfFile: null, pdfName: "" }));
  };

  const toggleMethodology = (m: ResearchMethodology) => {
    setForm((p) => {
      const exists = p.methodologies.includes(m);
      return {
        ...p,
        methodologies: exists
          ? p.methodologies.filter((x) => x !== m)
          : [...p.methodologies, m],
      };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!form.title.trim()) throw new Error("Title is required.");
      if (!form.summary.trim()) throw new Error("Summary is required.");

      const authors = splitLines(form.authorsInput);
      if (authors.length === 0)
        throw new Error("At least one author is required.");

      // On create, PDF is required
      const isNew = !resource;
      if (isNew && !form.pdfFile) throw new Error("PDF upload is required.");

      const published_at = Timestamp.fromDate(
        new Date(`${form.publishedDate}T00:00:00`),
      );
      const year = yearFromTimestamp(published_at);

      const tags = normalizeTags(form.tagsInput);
      const tagErr = validateTags(tags);
      if (tagErr) throw new Error(tagErr);

      // If archived, force published false (clean behavior)
      const published = form.archived ? false : form.published;

      // Create ID first so storage path is deterministic
      const id = resource?.id ?? (await createResourceBaseId());

      // If PDF selected, upload/overwrite
      let file_url = (resource as any)?.file_url ?? "";
      let file_path = (resource as any)?.file_path ?? "";

      if (form.pdfFile) {
        const up = await uploadResourcePdf({
          type: "research",
          id,
          file: form.pdfFile,
        });
        file_url = up.file_url;
        file_path = up.file_path;
      }

      if (!file_url || !file_path)
        throw new Error("PDF upload missing. Please upload a PDF.");

      const payload = {
        type: "research",
        title: form.title.trim(),
        summary: form.summary.trim(),
        tags,
        year,
        published,
        archived: form.archived,
        published_at,
        file_url,
        file_path,
        research: {
          authors,
          affiliation: form.affiliation.trim() || null,
          asset_class: form.asset_class,
          sector: form.sector,
          region: form.region,
          ticker: form.ticker.trim() || null,
          company_name: form.company_name.trim() || null,
          methodology: form.methodologies.length ? form.methodologies : null,
        },
      };

      if (resource) {
        await updateResourceDoc({ id, data: payload });
      } else {
        await createResourceDoc({ id, data: payload });
      }

      onClose();
    } catch (err: any) {
      console.error("Failed to save research:", err);
      setError(err?.message || "Failed to save research.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resource) return;

    setLoading(true);
    setError(null);

    try {
      await deleteResourceDoc({
        id: resource.id,
        file_path: (resource as any).file_path,
      });
      onClose();
    } catch (err: any) {
      console.error("Failed to delete research:", err);
      setError(err?.message || "Failed to delete.");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-900 scrollbar-track-transparent">
        <div className="sticky top-0 bg-white border-b border-[hsl(var(--divider))] px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[hsl(var(--section-light-foreground))]">
            {resource ? "Edit Research" : "Upload Research"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="px-6 py-6 space-y-8">
          <section>
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--section-light-foreground))]">
              Metadata
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Novo Nordisk — Investment Thesis"
                />
              </div>

              <div>
                <Label htmlFor="summary">Summary *</Label>
                <Textarea
                  id="summary"
                  value={form.summary}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, summary: e.target.value }))
                  }
                  placeholder="1–2 lines used on the cards and search results."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated, max 8)</Label>
                <Input
                  id="tags"
                  value={form.tagsInput}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tagsInput: e.target.value }))
                  }
                  placeholder="e.g. valuation, dcf, nordics, healthcare"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Published date *</Label>
                  <Input
                    type="date"
                    value={form.publishedDate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, publishedDate: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="published"
                      checked={form.published}
                      onCheckedChange={(v) =>
                        setForm((p) => ({ ...p, published: v as boolean }))
                      }
                      disabled={form.archived}
                    />
                    <Label htmlFor="published" className="cursor-pointer">
                      Published
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="archived"
                      checked={form.archived}
                      onCheckedChange={(v) =>
                        setForm((p) => ({ ...p, archived: v as boolean }))
                      }
                    />
                    <Label htmlFor="archived" className="cursor-pointer">
                      Archived (auto unpublishes)
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--section-light-foreground))]">
              Research classification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Asset class *</Label>
                <Select
                  value={form.asset_class}
                  onValueChange={(v: any) =>
                    setForm((p) => ({ ...p, asset_class: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESEARCH_ASSET_CLASSES.map((x) => (
                      <SelectItem key={x} value={x}>
                        {x.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sector *</Label>
                <Select
                  value={form.sector}
                  onValueChange={(v: any) =>
                    setForm((p) => ({ ...p, sector: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESEARCH_SECTORS.map((x) => (
                      <SelectItem key={x} value={x}>
                        {x.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Region *</Label>
                <Select
                  value={form.region}
                  onValueChange={(v: any) =>
                    setForm((p) => ({ ...p, region: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESEARCH_REGIONS.map((x) => (
                      <SelectItem key={x} value={x}>
                        {x.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Company name (optional)</Label>
                <Input
                  value={form.company_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, company_name: e.target.value }))
                  }
                  placeholder="e.g. Novo Nordisk"
                />
              </div>
              <div>
                <Label>Ticker (optional)</Label>
                <Input
                  value={form.ticker}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ticker: e.target.value }))
                  }
                  placeholder="e.g. NOVO-B.CO"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Authors * (one per line)</Label>
              <Textarea
                value={form.authorsInput}
                onChange={(e) =>
                  setForm((p) => ({ ...p, authorsInput: e.target.value }))
                }
                rows={4}
                placeholder={"First Last\nFirst Last"}
              />
            </div>

            <div className="mt-4">
              <Label>Affiliation (optional)</Label>
              <Input
                value={form.affiliation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, affiliation: e.target.value }))
                }
                placeholder="e.g. TAA Research"
              />
            </div>

            <div className="mt-4">
              <Label>Methodology (optional)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {RESEARCH_METHODOLOGIES.map((m) => {
                  const active = form.methodologies.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMethodology(m)}
                      className={`text-xs px-3 py-2 border ${
                        active
                          ? "border-[hsl(var(--section-light-foreground))] text-[hsl(var(--section-light-foreground))]"
                          : "border-[hsl(var(--divider))] text-[hsl(var(--section-light-foreground))]/70"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--section-light-foreground))]">
              PDF upload
            </h3>

            {form.pdfName ? (
              <div className="border border-[hsl(var(--divider))] p-4 flex items-center justify-between">
                <div className="text-sm text-[hsl(var(--section-light-foreground))]/80">
                  {form.pdfName}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemovePdf}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[hsl(var(--divider))] p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--divider))]" />
                <Label htmlFor="pdf-upload" className="cursor-pointer">
                  <span className="text-sm text-[hsl(var(--section-light-foreground))]/70">
                    Click to upload PDF (max 50MB)
                  </span>
                </Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                />
              </div>
            )}
          </section>

          {resource && (
            <section className="border-t border-red-200 pt-6">
              <h3 className="text-lg font-semibold mb-2 text-red-700">
                Danger Zone
              </h3>
              <p className="text-sm text-[hsl(var(--section-light-foreground))]/70 mb-4">
                Deleting removes the document and attempts to delete the PDF
                from storage.
              </p>

              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-red-700">
                    Are you sure? This cannot be undone.
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
            {loading ? "Saving..." : resource ? "Save Changes" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
};

function getInitial(): FormState {
  return {
    title: "",
    summary: "",
    tagsInput: "",

    published: true,
    archived: false,

    publishedDate: nowDateInput(),

    pdfFile: null,
    pdfName: "",

    authorsInput: "",
    affiliation: "",

    asset_class: "equity",
    sector: "other",
    region: "global",

    ticker: "",
    company_name: "",

    methodologies: [],
  };
}
