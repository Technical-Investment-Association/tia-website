/**
 * ProfileDeactivated.tsx – Shown after confirming profile deactivation (GDPR).
 */
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/Section";

export default function ProfileDeactivated() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero title="Profile deactivated" description="Your membership profile has been deactivated." height={220} />
      <main className="grid-outer bg-white">
        <Section>
          <div className="grid-inner py-16 md:py-20">
            <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
              <div className="py-12 text-center">
                <h2 className="mb-4 text-3xl font-semibold text-[hsl(var(--section-light-foreground))]">Profile deactivated</h2>
                <p className="mb-8 text-lg text-[hsl(var(--section-light-foreground))]/70">
                  Your membership profile has been deactivated. You will no longer receive membership emails. If you change your mind, you can sign up again via the Join page.
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
