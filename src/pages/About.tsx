/**
 * About.tsx
 *
 * Purpose: About page introducing TIA's mission and approach
 *
 * Design: Clean, understated Scandinavian aesthetic
 * Inspired by: Chr. Augustinus Fabrikker
 *
 * Layout:
 * - Hero section
 * - Two-column layout (desktop): text left, pillars right
 * - Generous spacing, no heavy shadows
 */

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Separator } from "@/components/ui/separator";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <Hero
        title="About"
        description="A student-run investment association where finance, technology and innovation meet."
        height={600}
      />

      {/* Main Content */}
      <main className="grid-outer bg-white">
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />

              {/* Two-column layout on desktop */}
              <div className="grid grid-cols-12 gap-12 lg:gap-16">
                {/* Left: Main content */}
                <div className="col-span-12 lg:col-span-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/60 mb-6">
                    About
                  </p>

                  <h2 className="text-3xl md:text-4xl font-semibold text-[hsl(var(--section-light-foreground))] mb-8 leading-tight">
                    Bringing finance to a technical university
                  </h2>

                  <div className="space-y-6 text-base md:text-lg text-[hsl(var(--section-light-foreground))]/70 leading-relaxed">
                    <p>
                      Technical Investment Association (TIA) was founded in 2025
                      by students at DTU who felt something was missing: a place
                      where finance, technology and innovation genuinely meet.
                    </p>

                    <p>
                      We are a student-run investment association with a
                      long-term mindset. Our members are technically oriented
                      students who want to understand capital markets, valuation
                      and risk – not just in theory, but through real decisions
                      and real portfolios.
                    </p>

                    <p>
                      By combining quantitative skills, product thinking and
                      finance, we aim to build a community that is curious,
                      analytical and grounded.
                    </p>
                  </div>
                </div>

                {/* Right: Pillars */}
                <div className="col-span-12 lg:col-span-6 lg:col-start-7">
                  <div className="space-y-8 lg:pt-20">
                    {/* Pillar 1 */}
                    <div className="border-l-2 border-[hsl(var(--divider))] pl-6">
                      <h3 className="text-lg font-semibold text-[hsl(var(--section-light-foreground))] mb-3">
                        Hands-on investing
                      </h3>
                      <p className="text-base text-[hsl(var(--section-light-foreground))]/70 leading-relaxed">
                        We maintain a student-managed portfolio and use it as a
                        practical framework for learning about companies,
                        industries and markets.
                      </p>
                    </div>

                    {/* Pillar 2 */}
                    <div className="border-l-2 border-[hsl(var(--divider))] pl-6">
                      <h3 className="text-lg font-semibold text-[hsl(var(--section-light-foreground))] mb-3">
                        Learning and development
                      </h3>
                      <p className="text-base text-[hsl(var(--section-light-foreground))]/70 leading-relaxed">
                        We host workshops, case evenings and talks with
                        practitioners from finance, consulting and technology to
                        build both technical and commercial skills.
                      </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="border-l-2 border-[hsl(var(--divider))] pl-6">
                      <h3 className="text-lg font-semibold text-[hsl(var(--section-light-foreground))] mb-3">
                        Community and network
                      </h3>
                      <p className="text-base text-[hsl(var(--section-light-foreground))]/70 leading-relaxed">
                        TIA is a place to meet like-minded students across years
                        and study lines, and to connect with companies and
                        organisations that share our curiosity for finance and
                        innovation.
                      </p>
                    </div>
                  </div>
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

export default About;
