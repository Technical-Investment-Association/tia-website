/**
 * Join.tsx
 *
 * Purpose: Membership signup page
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

const Join = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    university: "",
    studyLine: "",
    yearOfGraduation: "",
    motivation: "",
    gdprConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate GDPR consent
    if (!formData.gdprConsent) {
      setError("Please accept the terms to continue.");
      return;
    }

    setSubmitting(true);

    try {
      // TODO: Submit to your backend/Firestore
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit:", err);
      setError("Failed to submit. Please try again.");
    } finally {
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
                    Application Received
                  </h2>
                  <p className="text-lg text-[hsl(var(--section-light-foreground))]/70 mb-8">
                    Thank you for your interest in joining TIA. We will review
                    your application and get back to you soon.
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
                Membership Application
              </p>

              <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-6">
                Apply for membership
              </h2>

              <p className="text-base text-[hsl(var(--section-light-foreground))]/70 leading-relaxed mb-8">
                We welcome students from DTU and other universities who share
                our interest in finance, technology and analytical thinking.
                Fill in the form below and we will get back to you.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="university">University *</Label>
                    <Input
                      id="university"
                      type="text"
                      required
                      placeholder="e.g., DTU"
                      value={formData.university}
                      onChange={(e) =>
                        setFormData({ ...formData, university: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearOfGraduation">
                      Year of Graduation *
                    </Label>
                    <Input
                      id="yearOfGraduation"
                      type="number"
                      required
                      placeholder="e.g., 2027"
                      value={formData.yearOfGraduation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearOfGraduation: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="studyLine">Line of Study *</Label>
                  <Input
                    id="studyLine"
                    type="text"
                    required
                    placeholder="e.g., Industrial Economics, Computer Science"
                    value={formData.studyLine}
                    onChange={(e) =>
                      setFormData({ ...formData, studyLine: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="motivation">
                    Why do you want to join TIA? *
                  </Label>
                  <Textarea
                    id="motivation"
                    required
                    rows={5}
                    placeholder="Tell us about your interest in finance, technology and what you hope to gain from being part of TIA..."
                    value={formData.motivation}
                    onChange={(e) =>
                      setFormData({ ...formData, motivation: e.target.value })
                    }
                  />
                  <p className="text-xs text-[hsl(var(--section-light-foreground))]/60 mt-2">
                    2-3 sentences is fine. We want to know what drives your
                    interest.
                  </p>
                </div>

                <div className="border-t border-[hsl(var(--divider))] pt-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="gdprConsent"
                      checked={formData.gdprConsent}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          gdprConsent: checked as boolean,
                        })
                      }
                    />
                    <Label
                      htmlFor="gdprConsent"
                      className="text-sm text-[hsl(var(--section-light-foreground))]/70 leading-relaxed cursor-pointer"
                    >
                      I consent to TIA storing my personal information for the
                      purpose of processing this membership application. My data
                      will be stored securely and I can request deletion at any
                      time by contacting us.
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting || !formData.gdprConsent}
                    className="px-8"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
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
      </main>

      <Footer />
    </div>
  );
};

export default Join;
