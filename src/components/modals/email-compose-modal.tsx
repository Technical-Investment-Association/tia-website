/**
 * Modal to create, edit (draft), or view (sent) an email.
 * Subject under Audience. Preview replaces the main body area; Back to return to editing.
 */
import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GreyPillSelect } from "@/components/ui/grey-pill-select";
import type { AdminEmail } from "@/services/admin-emails";
import {
  saveDraft,
  updateDraft,
  markAsSent,
  createSentEmail,
} from "@/services/admin-emails";

const AUDIENCES = [
  { value: "all_members", label: "All members (member_signups)" },
  { value: "newsletter_consent", label: "Members with newsletter consent" },
  { value: "newsletter_signups", label: "Newsletter signups only" },
] as const;

const defaultBody =
  "<p>Hi everyone,</p>\n\n<p>Your message here. You can use <strong>HTML</strong>.</p>\n\n<p>Best,<br>TIA Team</p>";

export interface EmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** null = new email; draft/sent = existing */
  email: AdminEmail | null;
  onSaved?: () => void;
  onSent?: () => void;
}

export function EmailComposeModal({
  isOpen,
  onClose,
  email,
  onSaved,
  onSent,
}: EmailComposeModalProps) {
  const { user } = useAuth();
  const isViewOnly = email?.status === "sent";
  const isNew = email === null;

  const [audience, setAudience] = useState(email?.audience ?? "all_members");
  const [subject, setSubject] = useState(email?.subject ?? "");
  const [html, setHtml] = useState(email?.html ?? defaultBody);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ sent: number; total?: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setAudience(email?.audience ?? "all_members");
    setSubject(email?.subject ?? "");
    setHtml(email?.html ?? defaultBody);
    setShowPreview(false);
    setPreviewKey((k) => k + 1);
    setError(null);
    setSendResult(null);
  }, [isOpen, email]);

  const previewUrl = `/api/admin/email-preview?template=campaign&body=${encodeURIComponent(html)}`;

  const resetForm = useCallback(() => {
    setAudience(email?.audience ?? "all_members");
    setSubject(email?.subject ?? "");
    setHtml(email?.html ?? defaultBody);
    setShowPreview(false);
    setPreviewKey((k) => k + 1);
    setError(null);
    setSendResult(null);
  }, [email]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSaveDraft = async () => {
    setError(null);
    setSaving(true);
    try {
      if (isNew) {
        await saveDraft({ audience, subject, html });
      } else {
        await updateDraft(email.id, { audience, subject, html });
      }
      onSaved?.();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!user || !subject.trim() || !html.trim()) {
      setError("Subject and body are required.");
      return;
    }
    setError(null);
    setSendResult(null);
    setSending(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          audience,
          subject: subject.trim(),
          html: html.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || res.statusText || "Failed to send");
        return;
      }
      setSendResult({ sent: data.sent ?? 0, total: data.total });
      if (!isNew && email) {
        await markAsSent(email.id, user.email ?? user.uid);
      } else if (isNew) {
        await createSentEmail({
          audience,
          subject: subject.trim(),
          html: html.trim(),
          sentBy: user.email ?? user.uid,
        });
      }
      onSent?.();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const title = isNew
    ? "New email"
    : isViewOnly
      ? "Sent email"
      : "Edit draft";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[hsl(var(--divider))] px-6 py-4">
          <h2 className="text-xl font-semibold text-[hsl(var(--section-light-foreground))]">
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content: either edit form or preview */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {showPreview ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-[hsl(var(--section-light-foreground))] hover:bg-gray-300"
                >
                  Back to editing
                </button>
              </div>
              <div className="rounded-lg bg-gray-50/50">
                <iframe
                  key={previewKey}
                  title="Email preview"
                  src={previewUrl}
                  className="h-[480px] w-full border-0 bg-white"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[hsl(var(--section-light-foreground))]">Audience</Label>
                {isViewOnly ? (
                  <p className="rounded-lg bg-gray-100/80 px-3 py-2 text-sm text-[hsl(var(--section-light-foreground))]">
                    {AUDIENCES.find((a) => a.value === audience)?.label ?? audience}
                  </p>
                ) : (
                  <GreyPillSelect
                    value={audience}
                    onValueChange={setAudience}
                    options={AUDIENCES}
                    triggerClassName="w-full rounded-full border-0 bg-gray-200 pr-10 text-sm outline-none focus:ring-0 focus:ring-offset-0"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[hsl(var(--section-light-foreground))]">Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Upcoming TIA event"
                  readOnly={isViewOnly}
                  className="border-0 bg-gray-100/80 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[hsl(var(--section-light-foreground))]">Body (HTML)</Label>
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  readOnly={isViewOnly}
                  rows={14}
                  className="w-full resize-y rounded-lg border-0 bg-gray-100/80 p-3 font-mono text-sm text-[hsl(var(--section-light-foreground))] outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="<p>Hi everyone,</p>..."
                />
                {!isViewOnly && (
                  <p className="text-xs text-[hsl(var(--section-light-foreground))]/60">
                    Use HTML (e.g. &lt;p&gt;, &lt;strong&gt;, &lt;a href="..."&gt;). Use Preview to see how it looks.
                  </p>
                )}
              </div>
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              {sendResult != null && (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                  Sent to {sendResult.sent} recipient(s){sendResult.total != null ? ` (${sendResult.total} total)` : ""}.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-[hsl(var(--divider))] px-6 py-4">
          {!showPreview && (
            <button
              type="button"
              role="switch"
              aria-checked={showPreview}
              onClick={() => {
                setPreviewKey((k) => k + 1);
                setShowPreview(true);
              }}
              className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-[hsl(var(--section-light-foreground))] hover:bg-gray-300"
            >
              Preview
            </button>
          )}
          {!isViewOnly && !showPreview && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving || sending}
                className="rounded-full border-[hsl(var(--divider))]"
              >
                {saving ? "Saving…" : "Save draft"}
              </Button>
              <Button
                type="button"
                onClick={handleSend}
                disabled={saving || sending}
                className="rounded-full"
              >
                {sending ? "Sending…" : "Send email"}
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={saving || sending}
            className="ml-auto rounded-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
