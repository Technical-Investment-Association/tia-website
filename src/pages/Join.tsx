/**
 * Join.tsx
 *
 * Purpose: Membership signup page (new structure)
 *
 * Design: Clean, minimal, matching site aesthetic
 */

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle } from "lucide-react";

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
];

const careerOrientationOptions = [
  "Investment banking / corporate finance",
  "Private equity / venture capital / growth",
  "Hedge funds / trading / quant",
  "Consulting",
  "Tech / product / data",
  "Startups / entrepreneurship",
  "Still exploring",
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
  // DTU-style and technical programmes
  "General Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Industrial Engineering and Management",
  "Mathematical Engineering",
  "Applied Mathematics and Computer Science",
  "Computer Science and Engineering",
  "Software Technology",
  "Data Science and Management",
  "Electrical Engineering",
  "Physics and Nanotechnology",
  "Biomedical Engineering",
  "Design and Innovation",
  "Sustainable Energy",
  "Quantitative Biology and Disease Modelling",

  // Broader / non-DTU but relevant for partnerships
  "Economics",
  "Finance",
  "Business Administration",
  "Business & Economics",
  "Law",
  "Medicine",
  "Pharmacy",
  "Political Science",
  "Other",
];

const Join = () => {
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
    careerOrientation: [] as string[],
    engagementLevel: "" as EngagementLevel | "",
    motivation: "",
    newsletterConsent: "" as NewsletterConsent | "",
    gdprConsent: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatePrompt, setUpdatePrompt] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);

  const toggleArrayValue = (
    key: "interests" | "careerOrientation",
    value: string
  ) => {
    setFormData((prev) => {
      const current = prev[key];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

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

    const payload = {
      mode: "check",
      data: {
        full_name: formData.fullName,
        email: formData.email.trim(),
        university: formData.university,
        study_field: formData.studyField,
        study_level: formData.studyLevel,
        grad_year: formData.gradYear ? Number(formData.gradYear) : null,
        interests: formData.interests,
        career_orientation: formData.careerOrientation,
        engagement_level: formData.engagementLevel,
        motivation: formData.motivation || null,
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
        // Ask user if they want to update existing profile
        setPendingPayload(payload.data);
        setUpdatePrompt(true);
        setSubmitting(false);
        return;
      }

      if (result.status === "created") {
        setSubmitted(true);
        setSubmitting(false);
        return;
      }

      // Fallback
      setError("Unexpected response from server.");
      setSubmitting(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit. Please try again.");
      setSubmitting(false);
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
          <section>
            <div className="grid-inner">
              <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
                <div className="py-20 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
                  <h2 className="text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-4">
                    Membership registered
                  </h2>
                  <p className="text-lg text-[hsl(var(--section-light-foreground))]/70 mb-8">
                    Thank you for joining Technical Investment Association. We
                    will be in touch with upcoming events and opportunities.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/")}
                    variant="outline"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  async function callMembershipApi(body: any) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <Hero
        title="Join TIA"
        description="Become part of a community of technically minded students interested in finance and innovation."
        height={300}
      />

      <main className="grid-outer bg-white">
        <section>
          <div className="grid-inner">
            <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
              <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />

              <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/60 mb-6">
                Membership Signup
              </p>

              <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-4">
                A community at the intersection of finance and technology
              </h2>

              <p className="text-base text-[hsl(var(--section-light-foreground))]/70 leading-relaxed mb-8">
                We welcome students from DTU and other universities who are
                curious about investing, finance, entrepreneurship and how
                technology shapes markets. The form below takes about a minute
                to complete and helps us design better programmes for you.
              </p>

              <p className="text-sm text-[hsl(var(--section-light-foreground))]/60 mb-8">
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
                <div className="mb-6 p-4 bg-red-50 border border-red-200 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* About you */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-[0.18em] uppercase text-[hsl(var(--section-light-foreground))]/70">
                    About you
                  </h3>

                  <div>
                    <Label htmlFor="fullName">Full name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="university">University *</Label>
                      <select
                        id="university"
                        required
                        className="mt-1 block w-full border border-[hsl(var(--divider))]/70 bg-white px-3 py-2 text-sm text-[hsl(var(--section-light-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--section-light-foreground))]/60"
                        value={formData.university}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            university: e.target.value,
                            // reset other field if they move away from 'Other'
                            otherUniversity:
                              e.target.value === "Other"
                                ? formData.otherUniversity
                                : "",
                          })
                        }
                      >
                        <option value="" disabled>
                          Select your university
                        </option>
                        {universityOptions.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>

                      {formData.university === "Other" && (
                        <div className="mt-2">
                          <Input
                            id="otherUniversity"
                            type="text"
                            placeholder="Please specify your university"
                            value={formData.otherUniversity}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                otherUniversity: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="studyField">Field of study *</Label>
                      <select
                        id="studyField"
                        required
                        className="mt-1 block w-full border border-[hsl(var(--divider))]/70 bg-white px-3 py-2 text-sm text-[hsl(var(--section-light-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--section-light-foreground))]/60"
                        value={formData.studyField}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studyField: e.target.value,
                            otherStudyField:
                              e.target.value === "Other"
                                ? formData.otherStudyField
                                : "",
                          })
                        }
                      >
                        <option value="" disabled>
                          Select your field of study
                        </option>
                        {studyFieldOptions.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>

                      {formData.studyField === "Other" && (
                        <div className="mt-2">
                          <Input
                            id="otherStudyField"
                            type="text"
                            placeholder="Please specify your field of study"
                            value={formData.otherStudyField}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                otherStudyField: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="max-w-xs">
                    <Label htmlFor="gradYear">Expected graduation year *</Label>
                    <Input
                      id="gradYear"
                      type="number"
                      required
                      placeholder="e.g. 2027"
                      value={formData.gradYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gradYear: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                {/* Study level */}
                <div className="space-y-2">
                  <Label className="font-medium">Study level *</Label>
                  <div className="space-y-1 text-sm text-[hsl(var(--section-light-foreground))]/80">
                    {[
                      { value: "bachelor" as const, label: "Bachelor student" },
                      { value: "master" as const, label: "Master student" },
                      { value: "other" as const, label: "Other" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="studyLevel"
                          className="mt-1 h-3 w-3 border border-[hsl(var(--divider))]"
                          checked={formData.studyLevel === option.value}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              studyLevel: option.value,
                            })
                          }
                          required
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-[0.18em] uppercase text-[hsl(var(--section-light-foreground))]/70">
                    Your interests
                  </h3>
                  <p className="text-sm text-[hsl(var(--section-light-foreground))]/70">
                    Choose the topics you are most curious about. This helps us
                    design events and partnerships.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {interestOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-start gap-3 text-sm text-[hsl(var(--section-light-foreground))]/80 cursor-pointer"
                      >
                        <Checkbox
                          checked={formData.interests.includes(option)}
                          onCheckedChange={(checked) =>
                            toggleArrayValue("interests", option)
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Career orientation */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-[0.18em] uppercase text-[hsl(var(--section-light-foreground))]/70">
                    Career orientation (optional)
                  </h3>
                  <p className="text-sm text-[hsl(var(--section-light-foreground))]/70">
                    If you have a sense of where you might want to go, you can
                    share it here. This helps us bring in relevant companies.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {careerOrientationOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-start gap-3 text-sm text-[hsl(var(--section-light-foreground))]/80 cursor-pointer"
                      >
                        <Checkbox
                          checked={formData.careerOrientation.includes(option)}
                          onCheckedChange={() =>
                            toggleArrayValue("careerOrientation", option)
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Engagement level */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-[0.18em] uppercase text-[hsl(var(--section-light-foreground))]/70">
                    How you would like to engage
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        value: "attend" as EngagementLevel,
                        label: "I primarily want to attend events and learn",
                      },
                      {
                        value: "help" as EngagementLevel,
                        label:
                          "I am open to occasionally helping with events or tasks",
                      },
                      {
                        value: "lead" as EngagementLevel,
                        label:
                          "I am interested in contributing actively or taking on a role in TIA",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start gap-3 text-sm text-[hsl(var(--section-light-foreground))]/80 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="engagementLevel"
                          className="mt-1 h-3 w-3 border border-[hsl(var(--divider))]"
                          checked={formData.engagementLevel === option.value}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              engagementLevel: option.value,
                            })
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Motivation (optional) */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold tracking-[0.18em] uppercase text-[hsl(var(--section-light-foreground))]/70">
                    Anything you would like to add (optional)
                  </h3>
                  <Textarea
                    id="motivation"
                    rows={3}
                    placeholder="You can briefly share what you hope to get out of TIA, or topics you would like us to cover."
                    value={formData.motivation}
                    onChange={(e) =>
                      setFormData({ ...formData, motivation: e.target.value })
                    }
                  />
                </div>

                {/* Newsletter + consent */}
                <div className="space-y-6 border-t border-[hsl(var(--divider))] pt-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold tracking-[0.18em] uppercase text-[hsl(var(--section-light-foreground))]/70">
                      Email updates
                    </h3>
                    <p className="text-sm text-[hsl(var(--section-light-foreground))]/70">
                      We send a concise newsletter with upcoming events and
                      relevant opportunities.
                    </p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm text-[hsl(var(--section-light-foreground))]/80 cursor-pointer">
                        <input
                          type="radio"
                          name="newsletter"
                          className="h-3 w-3 border border-[hsl(var(--divider))]"
                          checked={formData.newsletterConsent === "yes"}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              newsletterConsent: "yes",
                            })
                          }
                        />
                        <span>
                          Yes, I would like to receive TIA newsletters
                        </span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[hsl(var(--section-light-foreground))]/80 cursor-pointer">
                        <input
                          type="radio"
                          name="newsletter"
                          className="h-3 w-3 border border-[hsl(var(--divider))]"
                          checked={formData.newsletterConsent === "no"}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              newsletterConsent: "no",
                            })
                          }
                        />
                        <span>
                          No, only essential information about my membership
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="gdprConsent"
                      checked={formData.gdprConsent}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          gdprConsent: Boolean(checked),
                        })
                      }
                    />
                    <Label
                      htmlFor="gdprConsent"
                      className="text-sm text-[hsl(var(--section-light-foreground))]/70 leading-relaxed cursor-pointer"
                    >
                      I consent to TIA storing and processing my personal data
                      for the purpose of administering my membership, events and
                      communications, in line with the membership terms and data
                      policy. I understand that I can request access or deletion
                      of my data at any time.
                    </Label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting || !formData.gdprConsent}
                    className="px-8"
                  >
                    {submitting ? "Submitting..." : "Submit membership"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => (window.location.href = "/")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
        {updatePrompt && pendingPayload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-[hsl(var(--section-light-foreground))] mb-3">
                Update existing membership?
              </h3>
              <p className="text-sm text-[hsl(var(--section-light-foreground))]/80 mb-4">
                We have already registered a membership with this email address.
                If you continue, we will update your profile with the
                information you have just entered and send you a confirmation
                email. If this was not you, you can click “Not me” in that
                email.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setUpdatePrompt(false);
                    setPendingPayload(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      setSubmitting(true);
                      const result = await callMembershipApi({
                        mode: "create_or_update",
                        data: pendingPayload,
                      });
                      if (
                        result.status === "updated" ||
                        result.status === "created"
                      ) {
                        setSubmitted(true);
                      } else if (result.status === "rate_limited") {
                        setError(
                          "We have received several updates from this email recently. Please try again later."
                        );
                      } else {
                        setError("Unexpected response from server.");
                      }
                    } catch (err: any) {
                      setError(err.message || "Failed to update membership.");
                    } finally {
                      setSubmitting(false);
                      setUpdatePrompt(false);
                      setPendingPayload(null);
                    }
                  }}
                >
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
};

export default Join;
