/**
 * Modal to create, edit (draft), or view (sent) an email.
 * Subject under Audience. Preview replaces the main body area; Back to return to editing.
 */
import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
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
  deleteDraft,
} from "@/services/admin-emails";

const AUDIENCES = [
  { value: "all_members", label: "All members (member_signups)" },
  { value: "newsletter_consent", label: "Members with newsletter consent" },
  { value: "newsletter_signups", label: "Newsletter signups only" },
  { value: "event_registrants", label: "Event registrants (choose event below)" },
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
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [subject, setSubject] = useState(email?.subject ?? "");
  const [html, setHtml] = useState(email?.html ?? defaultBody);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ sent: number; failed?: number; total?: number } | null>(null);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setAudience(email?.audience ?? "all_members");
    setSubject(email?.subject ?? "");
    setHtml(email?.html ?? defaultBody);
    setEventId("");
    setShowPreview(false);
    setShowSendConfirm(false);
    setShowDeleteConfirm(false);
    setPreviewKey((k) => k + 1);
    setError(null);
    setSendResult(null);
  }, [isOpen, email]);

  useEffect(() => {
    if (!isOpen || audience !== "event_registrants") return;
    setEventsLoading(true);
    const q = query(
      collection(db, "events"),
      where("published", "==", true),
      orderBy("starts_at", "asc")
    );
    getDocs(q)
      .then((snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          const startsAt = data.starts_at;
          const ms = startsAt?.toMillis?.() ?? startsAt?.seconds != null ? startsAt.seconds * 1000 : 0;
          return { id: d.id, title: (data.title as string) || d.id, ms };
        });
        list.sort((a, b) => b.ms - a.ms);
        setEvents(list.map(({ id, title }) => ({ id, title })));
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, [isOpen, audience]);

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
    if (audience === "event_registrants" && !eventId.trim()) {
      setError("Please select an event when sending to event registrants.");
      return;
    }
    setError(null);
    setSendResult(null);
    setSending(true);
    setShowSendConfirm(false);
    try {
      const token = await user.getIdToken();
      const body: Record<string, string> = {
        audience,
        subject: subject.trim(),
        html: html.trim(),
      };
      if (audience === "event_registrants") body.event_id = eventId.trim();
      const res = await fetch("/api/admin/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || res.statusText || "Failed to send");
        return;
      }
      setSendResult({
        sent: data.sent ?? 0,
        failed: data.failed,
        total: data.total,
      });
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

  const handleDeleteDraft = async () => {
    if (!email || isNew || isViewOnly) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteDraft(email.id);
      onSaved?.();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete draft");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  const audienceLabel = AUDIENCES.find((a) => a.value === audience)?.label ?? audience;
  const title = isNew
    ? "New email"
    : isViewOnly
      ? "Sent email"
      : "Edit draft";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Send confirmation */}
      {showSendConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Send email?</h3>
            <p className="mt-2 text-sm text-gray-600">
              You are sending this to <strong>{audienceLabel}</strong>. Are you sure? Once sent, it cannot be cancelled.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSendConfirm(false)}
                disabled={sending}
                className="text-sm font-medium text-gray-900 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete draft confirmation */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete draft?</h3>
            <p className="mt-2 text-sm text-gray-600">This draft will be permanently deleted. This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="text-sm font-medium text-gray-900 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <Button type="button" variant="destructive" onClick={handleDeleteDraft} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete draft"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  className="text-sm font-medium text-gray-900 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-900"
                >
                  {isViewOnly ? "Back" : "Back to editing"}
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
                    triggerClassName="w-full rounded-full border-0 bg-gray-200 pr-7 text-sm text-gray-900 outline-none focus:ring-0 focus:ring-offset-0"
                  />
                )}
              </div>
              {audience === "event_registrants" && !isViewOnly && (
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--section-light-foreground))]">Event</Label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full rounded-lg border-0 bg-gray-100/80 px-3 py-2 text-sm text-[hsl(var(--section-light-foreground))] outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <option value="">Select event…</option>
                    {eventsLoading ? (
                      <option disabled>Loading events…</option>
                    ) : (
                      events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
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
                <div className="flex items-center gap-2">
                  <Label className="text-[hsl(var(--section-light-foreground))]">Body (HTML)</Label>
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
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  readOnly={isViewOnly}
                  rows={14}
                  className="w-full resize-y rounded-lg border-0 bg-gray-100/80 p-3 font-mono text-sm text-[hsl(var(--section-light-foreground))] outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="<p>Hi everyone,</p>..."
                />
              </div>
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              {sendResult != null && (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                  Sent to {sendResult.sent} recipient(s)
                  {sendResult.total != null ? ` (${sendResult.total} total)` : ""}
                  {sendResult.failed != null && sendResult.failed > 0
                    ? `. ${sendResult.failed} failed to send.`
                    : ""}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer – only when editing (not view-only) and not in preview */}
        {!showPreview && !isViewOnly && (
          <div className="flex shrink-0 w-full flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--divider))] px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving || sending || deleting}
                className="rounded-full border-[hsl(var(--divider))] focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                {saving ? "Saving…" : "Save draft"}
              </Button>
              {!isNew && email && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={saving || sending || deleting}
                  className="text-sm font-medium text-red-600 underline decoration-red-600/50 underline-offset-2 hover:decoration-red-600 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete draft"}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowSendConfirm(true)}
              disabled={saving || sending || deleting}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send email"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
