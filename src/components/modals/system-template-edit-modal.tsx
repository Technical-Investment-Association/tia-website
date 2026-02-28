/**
 * Modal to edit a system email template (welcome, profile_updated).
 * Layout matches EmailComposeModal: Preview beside label, Back in preview, footer with Cancel + Save changes to template.
 * Shows disclaimer before saving: "You are permanently changing the standard mail sent out for [purpose]."
 */
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { SystemTemplateId } from "@/services/system-email-templates";
import {
  getSystemTemplate,
  setSystemTemplate,
} from "@/services/system-email-templates";
import {
  defaultWelcomeContentHtml,
  defaultProfileUpdatedContentHtml,
} from "@/lib/email-templates";

const TEMPLATE_META: Record<
  SystemTemplateId,
  { name: string; purpose: string; placeholders: string }
> = {
  welcome: {
    name: "Welcome email",
    purpose: "welcoming new members when they sign up",
    placeholders: "{{full_name}}, {{email}}",
  },
  profile_updated: {
    name: "Profile updated email",
    purpose: "notifying members when their profile is updated (with “Not me” link)",
    placeholders: "{{full_name}}, {{email}}, {{not_me_url}}",
  },
};

export interface SystemTemplateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** "welcome" or "profile_updated" or "profile-updated" (dropdown value) */
  templateId: SystemTemplateId | "profile-updated";
  onSaved?: () => void;
}

/** Normalize dropdown value to Firestore/system id. */
function normalizeTemplateId(id: SystemTemplateId | "profile-updated"): SystemTemplateId {
  return id === "profile-updated" ? "profile_updated" : id;
}

const templatePreviewSlug = (id: SystemTemplateId) =>
  id === "profile_updated" ? "profile-updated" : id;

export function SystemTemplateEditModal({
  isOpen,
  onClose,
  templateId,
  onSaved,
}: SystemTemplateEditModalProps) {
  const { user } = useAuth();
  const normalizedId = normalizeTemplateId(templateId);
  const meta = TEMPLATE_META[normalizedId];
  const previewUrl = `/api/admin/email-preview?template=${templatePreviewSlug(normalizedId)}`;
  const [contentHtml, setContentHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setShowSaveConfirm(false);
    setShowPreview(false);
    setLoading(true);
    getSystemTemplate(normalizedId)
      .then((t) => {
        const def =
          normalizedId === "welcome"
            ? defaultWelcomeContentHtml
            : defaultProfileUpdatedContentHtml;
        setContentHtml(t?.content_html?.trim() || def);
      })
      .catch(() => {
        const def =
          normalizedId === "welcome"
            ? defaultWelcomeContentHtml
            : defaultProfileUpdatedContentHtml;
        setContentHtml(def);
      })
      .finally(() => setLoading(false));
  }, [isOpen, normalizedId]);

  const handleSave = async () => {
    if (!user?.email && !user?.uid) return;
    setSaving(true);
    setError(null);
    try {
      await setSystemTemplate(
        normalizedId,
        {
          name: meta.name,
          description: meta.purpose,
          content_html: contentHtml.trim(),
        },
        user?.email ?? user?.uid ?? ""
      );
      onSaved?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
      setShowSaveConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {showSaveConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Save changes?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              You are permanently changing the standard mail sent out for{" "}
              <strong>{meta.purpose}</strong>. This will affect all future
              emails of this type. Continue?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                disabled={saving}
                className="text-sm font-medium text-gray-900 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[hsl(var(--divider))] px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit: {meta.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {showPreview ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="text-sm font-medium text-gray-900 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-900"
                >
                  Back
                </button>
              </div>
              <div className="rounded-lg bg-gray-50/50">
                <iframe
                  key={previewKey}
                  title="Template preview"
                  src={previewUrl}
                  className="h-[480px] w-full border-0 bg-white"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          ) : loading ? (
            <p className="text-sm text-gray-600">Loading…</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Placeholders: {meta.placeholders}. They are replaced when the
                email is sent.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-gray-900">HTML content</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewKey((k) => k + 1);
                      setShowPreview(true);
                    }}
                    className="text-sm text-gray-900 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-900"
                  >
                    Preview
                  </button>
                </div>
                <textarea
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  rows={16}
                  className="w-full resize-y rounded-lg border-0 bg-gray-100/80 p-3 font-mono text-sm text-gray-900 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Inner HTML with placeholders..."
                />
              </div>
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {!showPreview && (
          <div className="flex shrink-0 w-full flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--divider))] px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || saving}
              className="rounded-full border-[hsl(var(--divider))] focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={() => setShowSaveConfirm(true)}
              disabled={loading || saving}
              className="rounded-full border border-[hsl(var(--divider))] bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes to template"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
