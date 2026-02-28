/**
 * Join.tsx – Membership signup page
 *
 * Submits to /api/membership (check → create or update). Styled to match the rest of the site.
 */

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/utils";

type EngagementLevel = "attend" | "help" | "lead";
type NewsletterConsent = "yes" | "no";

const interestOptions = [
  "Investing & capital markets",
  "Private equity / venture capital",
  "Investment banking / M&A",
  "Quant / trading / data-driven finance",
  "Startups & entrepreneurship",
  "Technology & product in finance",
  "Consulting & strategy",
  "Community / networking / social events",
  "Not sure / Just an introduction to finance",
];

const universityOptions = [
  "DTU – Technical University of Denmark",
  "CBS – Copenhagen Business School",
  "KU – University of Copenhagen",
  "AAU – Aalborg University",
  "SDU – University of Southern Denmark",
  "AU – Aarhus University",
  "ITU – IT University of Copenhagen",
  "RUC – Roskilde University",
  "Exchange student at DTU",
  "Other",
];

const studyFieldOptions = [
  "General Engineering", "Mechanical Engineering", "Civil Engineering",
  "Industrial Engineering and Management", "Mathematical Engineering",
  "Applied Mathematics and Computer Science", "Computer Science and Engineering",
  "Software Technology", "Data Science and Management", "Electrical Engineering",
  "Physics and Nanotechnology", "Biomedical Engineering", "Design and Innovation",
  "Sustainable Energy", "Quantitative Biology and Disease Modelling",
  "Economics", "Finance", "Business Administration", "Business & Economics",
  "Law", "Medicine", "Pharmacy", "Political Science", "Other",
];

const inputLikeSelectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm text-[hsl(var(--section-light-foreground))]";

export default function Join() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    university: "",
    studyField: "",
    gradYear: "",
    studyLevel: "" as "bachelor" | "master" | "other" | "",
    otherUniversity: "",
    otherStudyField: "",
    interests: [] as string[],
    engagementLevel: "" as EngagementLevel | "",
    motivation: "",
    newsletterConsent: "" as NewsletterConsent | "",
    gdprConsent: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatePrompt, setUpdatePrompt] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{
    full_name: string;
    email: string;
    university: string;
    study_field: string;
    study_level: "bachelor" | "master" | "other" | "";
    grad_year: number | null;
    interests: string[];
    engagement_level: EngagementLevel;
    motivation: string | null;
    newsletter_consent: boolean;
  } | null>(null);

  const toggleArrayValue = (key: "interests", value: string) => {
    setFormData((prev) => {
      const current = prev[key];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  async function callMembershipApi(body: {
    mode: "check" | "create_or_update";
    data: {
      full_name: string;
      email: string;
      university: string;
      study_field: string;
      study_level: "bachelor" | "master" | "other" | "";
      grad_year: number | null;
      interests: string[];
      engagement_level: EngagementLevel;
      motivation: string | null;
      newsletter_consent: boolean;
    };
  }) {
    const res = await fetch("/api/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Request failed");
    }
    return res.json();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.gdprConsent) {
      setError("Please accept the data and terms notice to continue.");
      return;
    }
    if (!formData.engagementLevel) {
      setError("Please select how you would like to engage with TIA.");
      return;
    }
    if (!formData.newsletterConsent) {
      setError("Please let us know if we may contact you by email.");
      return;
    }

    const university =
      formData.university === "Other"
        ? formData.otherUniversity.trim() || "Other"
        : formData.university;
    const studyField =
      formData.studyField === "Other"
        ? formData.otherStudyField.trim() || "Other"
        : formData.studyField;

    const payload = {
      mode: "check" as const,
      data: {
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        university,
        study_field: studyField,
        study_level: formData.studyLevel,
        grad_year: formData.gradYear ? Number(formData.gradYear) : null,
        interests: formData.interests,
        engagement_level: formData.engagementLevel,
        motivation: formData.motivation.trim() || null,
        newsletter_consent: formData.newsletterConsent === "yes",
      },
    };

    try {
      setSubmitting(true);
      const result = await callMembershipApi(payload);
      if (result.status === "rate_limited") {
        setError(
          "We have received several signups from this email recently. Please try again a bit later."
        );
        setSubmitting(false);
        return;
      }
      if (result.status === "exists") {
        setPendingPayload(payload.data);
        setUpdatePrompt(true);
        setSubmitting(false);
        return;
      }
      if (result.status === "created") {
        // "created" from check means no existing profile; now actually create it in Firestore
        const createResult = await callMembershipApi({
          mode: "create_or_update",
          data: payload.data,
        });
        if (createResult.status === "created") {
          setSubmitted(true);
        } else if (createResult.status === "rate_limited") {
          setError(
            "We have received several signups from this email recently. Please try again a bit later."
          );
        } else {
          setError("Unexpected response from server.");
        }
        setSubmitting(false);
        return;
      }
      setError("Unexpected response from server.");
      setSubmitting(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to submit. Please try again."
      );
      setSubmitting(false);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!pendingPayload) return;
    try {
      setSubmitting(true);
      const result = await callMembershipApi({
        mode: "create_or_update",
        data: pendingPayload,
      });
      if (result.status === "updated" || result.status === "created") {
        setSubmitted(true);
      } else if (result.status === "rate_limited") {
        setError(
          "We have received several updates from this email recently. Please try again later."
        );
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update membership."
      );
    } finally {
      setSubmitting(false);
      setUpdatePrompt(false);
      setPendingPayload(null);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Hero
          title="Join TIA"
          description="Become part of a community of technically minded students interested in finance and innovation."
          height={300}
        />
        <main className="grid-outer bg-white">
          <Section>
            <div className="grid-inner py-16 md:py-20">
              <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
                <div className="py-12 text-center">
                  <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" />
                  <h2 className="mb-4 text-3xl font-semibold text-[hsl(var(--section-light-foreground))]">
                    Membership registered
                  </h2>
                  <p className="mb-8 text-lg text-[hsl(var(--section-light-foreground))]/70">
                    Thank you for joining Technical Investment Association. We
                    will be in touch with upcoming events and opportunities.
                  </p>
                  <Button
                    variant="outline"
                    className="border-[hsl(var(--divider))] text-[hsl(var(--section-light-foreground))] hover:bg-[hsl(var(--section-light-foreground))]/10"
                    onClick={() => (window.location.href = "/")}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          </Section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero
        title="Join TIA"
        description="Become part of a community of technically minded students interested in finance and innovation."
        height={300}
      />
      <main className="grid-outer bg-white">
        <Section>
          <div className="grid-inner py-16 md:py-20">
            <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
              <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/60">
                Membership signup
              </p>
              <h2 className="mb-4 text-2xl font-semibold text-[hsl(var(--section-light-foreground))] md:text-3xl">
                A community at the intersection of finance and technology
              </h2>
              <p className="mb-8 leading-relaxed text-[hsl(var(--section-light-foreground))]/70">
                We welcome students from DTU and other universities who are
                curious about investing, finance, entrepreneurship and how
                technology shapes markets. The form below takes about a minute
                to complete and helps us design better programmes for you.
              </p>
              <p className="mb-8 text-sm text-[hsl(var(--section-light-foreground))]/60">
                By signing up you apply for membership in Technical Investment
                Association and agree to our{" "}
                <a
                  href="/terms"
                  className="underline underline-offset-2 hover:text-[hsl(var(--section-light-foreground))]"
                >
                  membership terms and data policy
                </a>
                .
              </p>

              {error && (
                <div className="mb-6 flex gap-3 border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--section-light-foreground))]/70">
                    About you
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[hsl(var(--section-light-foreground))]">Full name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="border-[hsl(var(--divider))] bg-white text-[hsl(var(--section-light-foreground))]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[hsl(var(--section-light-foreground))]">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="border-[hsl(var(--divider))] bg-white text-[hsl(var(--section-light-foreground))]"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="university" className="text-[hsl(var(--section-light-foreground))]">University *</Label>
                      <select
                        id="university"
                        required
                        className={cn(inputLikeSelectClass)}
                        value={formData.university}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            university: e.target.value,
                            otherUniversity: e.target.value === "Other" ? formData.otherUniversity : "",
                          })
                        }
                      >
                        <option value="">Select your university</option>
                        {universityOptions.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                      {formData.university === "Other" && (
                        <Input
                          placeholder="Please specify"
                          value={formData.otherUniversity}
                          onChange={(e) => setFormData({ ...formData, otherUniversity: e.target.value })}
                          className="mt-2 border-[hsl(var(--divider))] bg-white"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studyField" className="text-[hsl(var(--section-light-foreground))]">Field of study *</Label>
                      <select
                        id="studyField"
                        required
                        className={cn(inputLikeSelectClass)}
                        value={formData.studyField}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studyField: e.target.value,
                            otherStudyField: e.target.value === "Other" ? formData.otherStudyField : "",
                          })
                        }
                      >
                        <option value="">Select field of study</option>
                        {studyFieldOptions.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                      {formData.studyField === "Other" && (
                        <Input
                          placeholder="Please specify"
                          value={formData.otherStudyField}
                          onChange={(e) => setFormData({ ...formData, otherStudyField: e.target.value })}
                          className="mt-2 border-[hsl(var(--divider))] bg-white"
                        />
                      )}
                    </div>
                  </div>
                  <div className="max-w-xs space-y-2">
                    <Label htmlFor="gradYear" className="text-[hsl(var(--section-light-foreground))]">Expected graduation year *</Label>
                    <Input
                      id="gradYear"
                      type="number"
                      required
                      placeholder="e.g. 2027"
                      value={formData.gradYear}
                      onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
                      className="border-[hsl(var(--divider))] bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-[hsl(var(--section-light-foreground))]">Study level *</Label>
                  <div className="space-y-1 text-sm text-[hsl(var(--section-light-foreground))]/80">
                    {[
                      { value: "bachelor" as const, label: "Bachelor student" },
                      { value: "master" as const, label: "Master student" },
                      { value: "other" as const, label: "Other" },
                    ].map((option) => (
                      <label key={option.value} className="flex cursor-pointer items-start gap-2">
                        <input
                          type="radio"
                          name="studyLevel"
                          className="mt-1 border-[hsl(var(--divider))]"
                          checked={formData.studyLevel === option.value}
                          onChange={() => setFormData({ ...formData, studyLevel: option.value })}
                          required
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--section-light-foreground))]/70">Your interests</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {interestOptions.map((option) => (
                      <label key={option} className="flex cursor-pointer items-start gap-3 text-sm text-[hsl(var(--section-light-foreground))]/80">
                        <Checkbox
                          checked={formData.interests.includes(option)}
                          onCheckedChange={() => toggleArrayValue("interests", option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--section-light-foreground))]/70">How you would like to engage</h3>
                  <div className="space-y-2">
                    {[
                      { value: "attend" as EngagementLevel, label: "I primarily want to attend events and learn" },
                      { value: "help" as EngagementLevel, label: "I am open to occasionally helping with events or tasks" },
                      { value: "lead" as EngagementLevel, label: "I am interested in contributing actively or taking on a role in TIA" },
                    ].map((option) => (
                      <label key={option.value} className="flex cursor-pointer items-start gap-3 text-sm text-[hsl(var(--section-light-foreground))]/80">
                        <input
                          type="radio"
                          name="engagementLevel"
                          className="mt-1 border-[hsl(var(--divider))]"
                          checked={formData.engagementLevel === option.value}
                          onChange={() => setFormData({ ...formData, engagementLevel: option.value })}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--section-light-foreground))]/70">Anything you would like to add (optional)</h3>
                  <Textarea
                    id="motivation"
                    rows={3}
                    placeholder="Briefly share what you hope to get out of TIA, or topics you would like us to cover."
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    className="border-[hsl(var(--divider))] bg-white text-[hsl(var(--section-light-foreground))]"
                  />
                </div>

                <div className="space-y-6 border-t border-[hsl(var(--divider))] pt-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--section-light-foreground))]/70">Email updates</h3>
                    <p className="text-sm text-[hsl(var(--section-light-foreground))]/70">
                      We send a concise newsletter with upcoming events and relevant opportunities.
                    </p>
                    <div className="flex flex-col gap-2">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-[hsl(var(--section-light-foreground))]/80">
                        <input
                          type="radio"
                          name="newsletter"
                          className="border-[hsl(var(--divider))]"
                          checked={formData.newsletterConsent === "yes"}
                          onChange={() => setFormData({ ...formData, newsletterConsent: "yes" })}
                        />
                        <span>Yes, I would like to receive TIA newsletters</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-[hsl(var(--section-light-foreground))]/80">
                        <input
                          type="radio"
                          name="newsletter"
                          className="border-[hsl(var(--divider))]"
                          checked={formData.newsletterConsent === "no"}
                          onChange={() => setFormData({ ...formData, newsletterConsent: "no" })}
                        />
                        <span>No, only essential information about my membership</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="gdprConsent"
                      checked={formData.gdprConsent}
                      onCheckedChange={(checked) => setFormData({ ...formData, gdprConsent: Boolean(checked) })}
                    />
                    <Label htmlFor="gdprConsent" className="cursor-pointer text-sm leading-relaxed text-[hsl(var(--section-light-foreground))]/70">
                      I consent to TIA storing and processing my personal data for the purpose of administering my membership, events and communications, in line with the membership terms and data policy. I understand that I can request access or deletion of my data at any time.
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={submitting || !formData.gdprConsent} className="px-8">
                    {submitting ? "Submitting..." : "Submit membership"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[hsl(var(--divider))] text-[hsl(var(--section-light-foreground))]"
                    onClick={() => (window.location.href = "/")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Section>
        {updatePrompt && pendingPayload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-lg border border-[hsl(var(--divider))] bg-white p-6 shadow-lg">
              <h3 className="mb-3 text-lg font-semibold text-[hsl(var(--section-light-foreground))]">
                Update existing membership?
              </h3>
              <p className="mb-4 text-sm text-[hsl(var(--section-light-foreground))]/80">
                We have already registered a membership with this email address.
                If you continue, we will update your profile with the information you have just entered.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="border-[hsl(var(--divider))]"
                  onClick={() => { setUpdatePrompt(false); setPendingPayload(null); }}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleConfirmUpdate}>
                  Update my profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
