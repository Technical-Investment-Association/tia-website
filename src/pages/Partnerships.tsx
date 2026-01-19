/**
 * Partnerships.tsx
 *
 * Purpose: Partnerships page explaining collaboration opportunities
 *
 * Design: Clean, professional, understated
 *
 * Layout:
 * - Hero section
 * - Introduction
 * - Corporate partnerships block
 * - Student & university partnerships block
 * - Logo grids under each block
 * - Simple CTA at bottom
 */

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Separator } from "@/components/ui/separator";
import {
  CorporatePartnershipLogoGrid,
  StudentClubPartnershipLogoGrid,
} from "@/components/PartnershipLogoGrid";

const Partnerships = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <Hero
        title="Partnerships"
        description="We work with companies and student organisations that share our interest in finance, technology and innovation."
        height={300}
      />

      {/* Main Content */}
      <main className="grid-outer bg-white">
        {/* Introduction */}
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />

              <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/60 mb-6">
                Partnerships
              </p>

              <h2 className="text-3xl md:text-4xl font-semibold text-[hsl(var(--section-light-foreground))] mb-8 max-w-3xl">
                Partnering with TIA
              </h2>

              <p className="text-base md:text-lg text-[hsl(var(--section-light-foreground))]/70 leading-relaxed max-w-3xl mb-16">
                We work with companies and student organisations that share our
                interest in finance, technology and innovation. Our partnerships
                are built around dialogue, relevance and a long-term perspective
                – not one-off events.
              </p>
            </div>
          </div>
        </section>

        {/* Corporate Partnerships */}
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <div className="border-t border-[hsl(var(--divider))]/40 pt-12">
                <h3 className="text-2xl font-semibold text-[hsl(var(--section-light-foreground))] mb-6">
                  Corporate partnerships
                </h3>

                <p className="text-base md:text-lg text-[hsl(var(--section-light-foreground))]/70 leading-relaxed max-w-3xl mb-6">
                  As a partner, you gain access to a focused community of
                  technically minded students who care about both numbers and
                  products. Together we design formats that create value on both
                  sides – from case evenings and deep-dive talks to smaller,
                  more targeted sessions.
                </p>

                <ul className="space-y-3 mb-12 max-w-3xl">
                  <li className="flex items-start gap-3 text-base text-[hsl(var(--section-light-foreground))]/70">
                    <span className="text-[hsl(var(--section-light-foreground))] mt-1">
                      —
                    </span>
                    <span>
                      Targeted exposure to students interested in finance,
                      quantitative roles and strategy.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-base text-[hsl(var(--section-light-foreground))]/70">
                    <span className="text-[hsl(var(--section-light-foreground))] mt-1">
                      —
                    </span>
                    <span>
                      Content-driven events where the focus is on substance
                      rather than promotion.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-base text-[hsl(var(--section-light-foreground))]/70">
                    <span className="text-[hsl(var(--section-light-foreground))] mt-1">
                      —
                    </span>
                    <span>
                      Early talent access, from first encounters to potential
                      internships and full-time roles.
                    </span>
                  </li>
                </ul>

                {/* Corporate Logo Grid */}
                <CorporatePartnershipLogoGrid />
              </div>
            </div>
          </div>
        </section>

        {/* Student & University Partnerships */}
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <div className="border-t border-[hsl(var(--divider))]/40 pt-12">
                <h3 className="text-2xl font-semibold text-[hsl(var(--section-light-foreground))] mb-6">
                  Student & university partnerships
                </h3>

                <p className="text-base md:text-lg text-[hsl(var(--section-light-foreground))]/70 leading-relaxed max-w-3xl mb-6">
                  We also collaborate with other student clubs and associations
                  – both at DTU and internationally – to create events and
                  initiatives where finance meets entrepreneurship, engineering,
                  data science and more.
                </p>

                <ul className="space-y-3 mb-12 max-w-3xl">
                  <li className="flex items-start gap-3 text-base text-[hsl(var(--section-light-foreground))]/70">
                    <span className="text-[hsl(var(--section-light-foreground))] mt-1">
                      —
                    </span>
                    <span>
                      Joint events that combine perspectives from different
                      study lines and disciplines.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-base text-[hsl(var(--section-light-foreground))]/70">
                    <span className="text-[hsl(var(--section-light-foreground))] mt-1">
                      —
                    </span>
                    <span>
                      Knowledge sharing on how to build and run serious student
                      organisations around finance and technology.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-base text-[hsl(var(--section-light-foreground))]/70">
                    <span className="text-[hsl(var(--section-light-foreground))] mt-1">
                      —
                    </span>
                    <span>
                      International connections to like-minded clubs and
                      communities at other universities.
                    </span>
                  </li>
                </ul>

                {/* Student Club Logo Grid */}
                <StudentClubPartnershipLogoGrid />
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <div className="border-t border-[hsl(var(--divider))]/40 pt-12 pb-8">
                <div className="max-w-3xl">
                  <p className="text-base text-[hsl(var(--section-light-foreground))]/70 leading-relaxed mb-2">
                    Interested in partnering with us?
                  </p>
                  <p className="text-base text-[hsl(var(--section-light-foreground))]/70 leading-relaxed">
                    Reach out at{" "}
                    <a
                      href="mailto:partnerships@tiaassociation.com"
                      className="text-[hsl(var(--section-light-foreground))] underline underline-offset-4 hover:text-[hsl(var(--section-light-foreground))]/80 transition-colors"
                    >
                      partnerships@tiaassociation.com
                    </a>{" "}
                    and we will be happy to discuss what a collaboration could
                    look like.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Partnerships;
