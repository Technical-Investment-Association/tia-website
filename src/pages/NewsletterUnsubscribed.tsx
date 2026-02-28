/**
 * NewsletterUnsubscribed.tsx – Shown after clicking "Unsubscribe from newsletters" in an email.
 */
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/Section";

export default function NewsletterUnsubscribed() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero title="Unsubscribed" description="You have been unsubscribed from our newsletters." height={220} />
      <main className="grid-outer bg-white">
        <Section>
          <div className="grid-inner py-16 md:py-20">
            <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
              <div className="py-12 text-center">
                <h2 className="mb-4 text-3xl font-semibold text-[hsl(var(--section-light-foreground))]">Unsubscribed from newsletters</h2>
                <p className="mb-8 text-lg text-[hsl(var(--section-light-foreground))]/70">
                  You will no longer receive TIA newsletters. You can update your preferences or re-subscribe anytime from your profile if you are a member.
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
