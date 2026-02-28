/**
 * ProfileDeactivate.tsx – Confirm deactivation (link from email). Token in URL; on confirm, POST to API then redirect.
 */
import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/Section";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function ProfileDeactivate() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Hero title="Deactivate profile" description="Invalid or missing link." height={220} />
        <main className="grid-outer bg-white">
          <Section>
            <div className="grid-inner py-16 md:py-20">
              <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
                <div className="py-12 text-center">
                  <p className="mb-8 text-lg text-[hsl(var(--section-light-foreground))]/70">
                    This link is invalid or has expired. If you want to deactivate your profile, use the link from your latest membership email.
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero title="Deactivate profile" description="No longer wish to be a member? You can deactivate your profile here." height={220} />
      <main className="grid-outer bg-white">
        <Section>
          <div className="grid-inner py-16 md:py-20">
            <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
              <div className="py-12 text-center">
                <h2 className="mb-4 text-3xl font-semibold text-[hsl(var(--section-light-foreground))]">Deactivate your membership profile</h2>
                <p className="mb-6 text-lg text-[hsl(var(--section-light-foreground))]/70">
                  This will deactivate your TIA membership profile. You will no longer receive membership emails. You can sign up again later if you change your mind.
                </p>
                <form action={`${API_BASE}/api/membership/deactivate`} method="POST" className="flex flex-wrap items-center justify-center gap-4">
                  <input type="hidden" name="token" value={token} />
                  <Button type="submit" variant="destructive">
                    Yes, deactivate my profile
                  </Button>
                  <Button asChild type="button" variant="outline" className="border-[hsl(var(--divider))] text-[hsl(var(--section-light-foreground))]">
                    <Link to="/">Cancel</Link>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
