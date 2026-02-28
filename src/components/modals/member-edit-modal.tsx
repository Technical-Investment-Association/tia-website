/**
 * MemberEditModal – Edit a member signup (admin).
 * Updates Firestore member_signups doc.
 */

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { Timestamp } from "firebase/firestore";

export type MemberSignupDoc = {
  id: string;
  full_name: string;
  email: string;
  university: string;
  study_field: string;
  study_level: string;
  grad_year: number | null;
  interests: string[];
  career_orientation?: string[]; // legacy; no longer collected or edited
  engagement_level: string;
  motivation: string | null;
  newsletter_consent: boolean;
  created_at?: Timestamp | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  member: MemberSignupDoc | null;
  onSaved: () => void;
};

export function MemberEditModal({
  isOpen,
  onClose,
  member,
  onSaved,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [studyField, setStudyField] = useState("");
  const [studyLevel, setStudyLevel] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [engagementLevel, setEngagementLevel] = useState("");
  const [motivation, setMotivation] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFullName(member.full_name || "");
      setUniversity(member.university || "");
      setStudyField(member.study_field || "");
      setStudyLevel(member.study_level || "");
      setGradYear(member.grad_year != null ? String(member.grad_year) : "");
      setEngagementLevel(member.engagement_level || "");
      setMotivation(member.motivation || "");
      setNewsletterConsent(member.newsletter_consent ?? false);
    }
    setError(null);
    setSaving(false);
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!member) return;
    setError(null);
    setSaving(true);
    try {
      const ref = doc(db, "member_signups", member.id);
      await updateDoc(ref, {
        full_name: fullName.trim(),
        university: university.trim(),
        study_field: studyField.trim(),
        study_level: studyLevel || null,
        grad_year: gradYear ? parseInt(gradYear, 10) : null,
        engagement_level: engagementLevel || null,
        motivation: motivation.trim() || null,
        newsletter_consent: newsletterConsent,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-[hsl(var(--divider))] bg-white shadow-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-[hsl(var(--divider))] bg-white px-6 py-4">
          <h3 className="text-lg font-semibold text-[hsl(var(--section-light-foreground))]">
            Edit member
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-black/5"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-[hsl(var(--section-light-foreground))]">Full name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-[hsl(var(--divider))]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[hsl(var(--section-light-foreground))]">Email</Label>
            <Input
              value={member?.email ?? ""}
              disabled
              className="border-[hsl(var(--divider))] bg-muted/50"
            />
            <p className="text-xs text-[hsl(var(--section-light-foreground))]/60">Document ID; cannot be changed.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[hsl(var(--section-light-foreground))]">University</Label>
              <Input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="border-[hsl(var(--divider))]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(var(--section-light-foreground))]">Field of study</Label>
              <Input
                value={studyField}
                onChange={(e) => setStudyField(e.target.value)}
                className="border-[hsl(var(--divider))]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[hsl(var(--section-light-foreground))]">Study level</Label>
              <Input
                value={studyLevel}
                onChange={(e) => setStudyLevel(e.target.value)}
                placeholder="e.g. bachelor, master"
                className="border-[hsl(var(--divider))]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(var(--section-light-foreground))]">Grad year</Label>
              <Input
                type="number"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                placeholder="e.g. 2027"
                className="border-[hsl(var(--divider))]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[hsl(var(--section-light-foreground))]">Engagement level</Label>
            <Input
              value={engagementLevel}
              onChange={(e) => setEngagementLevel(e.target.value)}
              placeholder="e.g. attend, help, lead"
              className="border-[hsl(var(--divider))]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[hsl(var(--section-light-foreground))]">Motivation (optional)</Label>
            <Textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={3}
              className="border-[hsl(var(--divider))]"
            />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="newsletter-edit"
              checked={newsletterConsent}
              onCheckedChange={(c) => setNewsletterConsent(Boolean(c))}
            />
            <Label htmlFor="newsletter-edit" className="cursor-pointer text-sm text-[hsl(var(--section-light-foreground))]">
              Newsletter signup (receive emails)
            </Label>
          </div>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[hsl(var(--divider))] bg-white px-6 py-4">
          <Button variant="outline" onClick={onClose} className="border-[hsl(var(--divider))]">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
