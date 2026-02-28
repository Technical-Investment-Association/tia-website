/**
 * ProfileUpdate.tsx – Update membership profile via email link (token in URL).
 * GET /api/membership/update-profile?token=xxx returns profile; form submits via POST.
 */
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
  "Investing & capital markets", "Private equity / venture capital", "Investment banking / M&A",
  "Quant / trading / data-driven finance", "Startups & entrepreneurship", "Technology & product in finance",
  "Consulting & strategy", "Community / networking / social events", "Not sure / Just an introduction to finance",
];

const universityOptions = [
  "DTU – Technical University of Denmark", "CBS – Copenhagen Business School", "KU – University of Copenhagen",
  "AAU – Aalborg University", "SDU – University of Southern Denmark", "AU – Aarhus University",
  "ITU – IT University of Copenhagen", "RUC – Roskilde University", "Exchange student at DTU", "Other",
];

const studyFieldOptions = [
  "General Engineering", "Mechanical Engineering", "Civil Engineering", "Industrial Engineering and Management",
  "Mathematical Engineering", "Applied Mathematics and Computer Science", "Computer Science and Engineering",
  "Software Technology", "Data Science and Management", "Electrical Engineering", "Physics and Nanotechnology",
  "Biomedical Engineering", "Design and Innovation", "Sustainable Energy", "Quantitative Biology and Disease Modelling",
  "Economics", "Finance", "Business Administration", "Business & Economics", "Law", "Medicine", "Pharmacy", "Political Science", "Other",
];

const inputLikeSelectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm text-[hsl(var(--section-light-foreground))]";

type ProfileData = {
  email: string;
  full_name: string;
  university: string;
  study_field: string;
  study_level: string;
  grad_year: number | null;
  interests: string[];
  engagement_level: string;
  motivation: string | null;
  newsletter_consent: boolean;
};

export default function ProfileUpdate() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    newsletterConsent: "no" as NewsletterConsent,
  });

  useEffect(() => {
    if (!token.trim()) {
      setLoadError("Missing link. Please use the link from your email.");
      setLoading(false);
      return;
    }
    fetch(`/api/membership/update-profile?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) return res.json().then((b) => Promise.reject(new Error((b as { error?: string }).error ?? "Invalid link")));
        return res.json();
      })
      .then((data: ProfileData) => {
        setProfile(data);
        setFormData({
          fullName: data.full_name ?? "",
          email: data.email ?? "",
          university: data.university ?? "",
          studyField: data.study_field ?? "",
          gradYear: data.grad_year != null ? String(data.grad_year) : "",
          studyLevel: (data.study_level as "bachelor" | "master" | "other") || "",
          otherUniversity: "",
          otherStudyField: "",
          interests: Array.isArray(data.interests) ? data.interests : [],
          engagementLevel: (data.engagement_level as EngagementLevel) || "",
          motivation: data.motivation ?? "",
          newsletterConsent: data.newsletter_consent ? "yes" : "no",
        });
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Invalid or expired link"))
      .finally(() => setLoading(false));
  }, [token]);

  const toggleArrayValue = (key: "interests", value: string) => {
    setFormData((prev) => {
      const current = prev[key];
      const exists = current.includes(value);
      return { ...prev, [key]: exists ? current.filter((v) => v !== value) : [...current, value] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!formData.engagementLevel || !formData.newsletterConsent) {
      setSubmitError("Please complete all required fields.");
      return;
    }
    const university = formData.university === "Other" ? formData.otherUniversity.trim() || "Other" : formData.university;
    const studyField = formData.studyField === "Other" ? formData.otherStudyField.trim() || "Other" : formData.studyField;
    try {
      setSubmitting(true);
      const res = await fetch("/api/membership/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
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
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError((body as { error?: string }).error ?? "Update failed.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Hero title="Update profile" description="Your TIA membership profile" height={220} />
        <main className="grid-outer bg-white">
          <Section>
            <div className="grid-inner py-16 md:py-20">
              <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
                <div className="py-12 text-center">
                  <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" />
                  <h2 className="mb-4 text-3xl font-semibold text-[hsl(var(--section-light-foreground))]">Profile updated</h2>
                  <p className="mb-8 text-lg text-[hsl(var(--section-light-foreground))]/70">Your membership details have been saved. Your email is now confirmed.</p>
                  <Button asChild variant="outline" className="border-[hsl(var(--divider))] text-[hsl(var(--section-light-foreground))]">
                    <Link to="/">Back to Home</Link>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Hero title="Update profile" description="Loading…" height={220} />
        <main className="grid-outer bg-white">
          <Section>
            <div className="grid-inner py-16">
              <p className="text-center text-[hsl(var(--section-light-foreground))]/70">Loading…</p>
            </div>
          </Section>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Hero title="Update profile" description="Link invalid or expired" height={220} />
        <main className="grid-outer bg-white">
          <Section>
            <div className="grid-inner py-16 md:py-20">
              <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                  <p className="text-red-700">{loadError ?? "This link is invalid or has expired. Request a new link from the Join page."}</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link to="/join">Go to Join</Link>
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
      <Hero title="Update your profile" description="Update your TIA membership details and confirm your email." height={220} />
      <main className="grid-outer bg-white">
        <Section>
          <div className="grid-inner py-16 md:py-20">
            <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
              {submitError && (
                <div className="mb-6 flex gap-3 border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--section-light-foreground))]">Email</Label>
                  <Input value={formData.email} readOnly className="border-[hsl(var(--divider))] bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--section-light-foreground))]">Full name *</Label>
                  <Input required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="border-[hsl(var(--divider))] bg-white text-[hsl(var(--section-light-foreground))]" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[hsl(var(--section-light-foreground))]">University *</Label>
                    <select required className={cn(inputLikeSelectClass)} value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value, otherUniversity: e.target.value === "Other" ? formData.otherUniversity : "" })}>
                      <option value="">Select</option>
                      {universityOptions.map((u) => (<option key={u} value={u}>{u}</option>))}
                    </select>
                    {formData.university === "Other" && <Input placeholder="Specify" value={formData.otherUniversity} onChange={(e) => setFormData({ ...formData, otherUniversity: e.target.value })} className="mt-2 border-[hsl(var(--divider))] bg-white" />}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[hsl(var(--section-light-foreground))]">Field of study *</Label>
                    <select required className={cn(inputLikeSelectClass)} value={formData.studyField} onChange={(e) => setFormData({ ...formData, studyField: e.target.value, otherStudyField: e.target.value === "Other" ? formData.otherStudyField : "" })}>
                      <option value="">Select</option>
                      {studyFieldOptions.map((f) => (<option key={f} value={f}>{f}</option>))}
                    </select>
                    {formData.studyField === "Other" && <Input placeholder="Specify" value={formData.otherStudyField} onChange={(e) => setFormData({ ...formData, otherStudyField: e.target.value })} className="mt-2 border-[hsl(var(--divider))] bg-white" />}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--section-light-foreground))]">Expected graduation year *</Label>
                  <Input type="number" required placeholder="e.g. 2027" value={formData.gradYear} onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })} className="max-w-xs border-[hsl(var(--divider))] bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--section-light-foreground))]">Study level *</Label>
                  <div className="flex flex-wrap gap-4">
                    {(["bachelor", "master", "other"] as const).map((value) => (
                      <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input type="radio" name="studyLevel" checked={formData.studyLevel === value} onChange={() => setFormData({ ...formData, studyLevel: value })} required />
                        <span>{value === "bachelor" ? "Bachelor" : value === "master" ? "Master" : "Other"}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--section-light-foreground))]">Interests</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {interestOptions.map((option) => (
                      <label key={option} className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox checked={formData.interests.includes(option)} onCheckedChange={() => toggleArrayValue("interests", option)} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--section-light-foreground))]">How you would like to engage *</Label>
                  <div className="space-y-2">
                    {[{ value: "attend" as const, label: "Attend events and learn" }, { value: "help" as const, label: "Occasionally help with events or tasks" }, { value: "lead" as const, label: "Contribute actively or take on a role" }].map((option) => (
                      <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input type="radio" name="engagement" checked={formData.engagementLevel === option.value} onChange={() => setFormData({ ...formData, engagementLevel: option.value })} />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--section-light-foreground))]">Anything to add (optional)</Label>
                  <Textarea rows={3} value={formData.motivation} onChange={(e) => setFormData({ ...formData, motivation: e.target.value })} className="border-[hsl(var(--divider))] bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--section-light-foreground))]">Newsletter *</Label>
                  <div className="flex gap-6">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="radio" name="newsletter" checked={formData.newsletterConsent === "yes"} onChange={() => setFormData({ ...formData, newsletterConsent: "yes" })} />
                      <span>Yes, send me newsletters</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="radio" name="newsletter" checked={formData.newsletterConsent === "no"} onChange={() => setFormData({ ...formData, newsletterConsent: "no" })} />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save changes"}</Button>
                  <Button type="button" variant="outline" asChild><Link to="/">Cancel</Link></Button>
                </div>
              </form>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
