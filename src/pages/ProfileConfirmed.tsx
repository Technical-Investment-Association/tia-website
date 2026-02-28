/**
 * ProfileConfirmed.tsx – Shown after clicking "Confirm your email" in the welcome email.
 */
import { Link, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Section } from "@/components/layout/Section";

export default function ProfileConfirmed() {
  const [searchParams] = useSearchParams();
  const hasError = searchParams.get("error") === "1";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero
        title={hasError ? "Something went wrong" : "Email confirmed"}
        description={hasError ? "We couldn’t confirm your email." : "Your email address is confirmed."}
        height={220}
      />
      <main className="grid-outer bg-white">
        <Section>
          <div className="grid-inner py-16 md:py-20">
            <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
              <div className="py-12 text-center">
                {hasError ? (
                  <AlertCircle className="mx-auto mb-6 h-16 w-16 text-amber-600" />
                ) : (
                  <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" />
                )}
                <h2 className="mb-4 text-3xl font-semibold text-[hsl(var(--section-light-foreground))]">
                  {hasError ? "Confirmation failed" : "Email confirmed"}
                </h2>
                <p className="mb-8 text-lg text-[hsl(var(--section-light-foreground))]/70">
                  {hasError
                    ? "The confirmation link may have expired or already been used. You can try signing up again or contact us if the problem continues."
                    : "Thank you for confirming your email address. You are all set."}
                </p>
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
