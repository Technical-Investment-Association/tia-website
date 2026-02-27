/**
 * About.tsx
 *
 * Purpose: About page introducing TIA's mission and approach
 */

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { motion, useReducedMotion, easeOut } from "framer-motion";
import { lazy, Suspense } from "react";
import { themeColors, aboutParticleColors } from "@/theme/tokens";
import { Section } from "@/components/layout/Section";
import { BeigeSplitCard } from "@/components/layout/BeigeSplitCard";

const FinisherBackground = lazy(() =>
  import("@/components/ui/finisher-background").then((module) => ({
    default: module.FinisherBackground,
  })),
);

const About = () => {
  const prefersReducedMotion = useReducedMotion();

  const fadeUp = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.6, ease: easeOut },
      };

  return (
    <div className="min-h-screen bg-white text-[hsl(var(--section-light-foreground))]">
      <Navigation />

      <Hero
        title="About TIA"
        description="A student-run community at the intersection of finance and technology."
        height={450}
      />

      <main className="bg-white">
        {/* Who we are / why founded */}
        <Section>
          <motion.div
            className="grid-inner py-16 md:py-20 space-y-8 md:space-y-0"
            {...fadeUp}
          >
            <div className="col-span-12 md:col-span-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/60 mb-4">
                The backstory
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-medium leading-tight">
                Why we were founded
              </h2>
            </div>

            <div className="col-span-12 md:col-span-6 space-y-4 text-base md:text-lg text-[hsl(var(--section-light-foreground))]/80 leading-relaxed">
              <p>
                TIA was founded to create a space for students who are serious
                about the connection between finance, technology and markets. We
                felt there was room for a community that treats these topics not
                only as career paths, but as areas of intellectual interest.
              </p>
              <p>
                Our members come from different academic backgrounds, but share
                a curiosity for how financial systems work, how decisions are
                made and how quantitative tools shape modern markets.
              </p>
              <p>
                As a student-run association, we operate with a long-term
                perspective: the quality of dialogue, the people involved and
                the projects we undertake matter more to us than scale or
                volume.
              </p>
            </div>
          </motion.div>
        </Section>

        {/* Mission section with FinisherBackground animation (Partnerships-style) */}
        <Section>
          <motion.div {...fadeUp}>
            <BeigeSplitCard
              title="Our mission"
              body={
                <>
                  <p>
                    Our mission is to build a community of technically minded
                    students who want to deepen their understanding of finance
                    and technology, and to create constructive touchpoints
                    between students, industry and academia.
                  </p>
                  <p>
                    We believe that strong analytical foundations and a
                    collaborative culture lead to better conversations, better
                    work and better decisions over time.
                  </p>
                </>
              }
              animationColors={[
                themeColors.particleBlue,
                themeColors.particleGreen,
                themeColors.particlePeach,
              ]}
              className="lg:h-section 3xl:h-section-lg"
            />
          </motion.div>
        </Section>

        {/* Core values */}
        <Section>
          <motion.div className="grid-inner py-16 md:py-20" {...fadeUp}>
            <div className="col-span-12 text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-serif font-medium">
                Our core values
              </h3>
            </div>

            <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 text-sm md:text-base leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-medium text-lg">Curiosity</h4>
                <p className="text-[hsl(var(--section-light-foreground))]/75">
                  We approach finance and technology as fields worth thinking
                  deeply about. We value questions, analysis and intellectual
                  honesty more than definitive answers.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-lg">Collaboration</h4>
                <p className="text-[hsl(var(--section-light-foreground))]/75">
                  TIA is built as a community, not a pipeline. We learn from
                  each other and treat knowledge as something to develop
                  together rather than compete over.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-lg">Impact</h4>
                <p className="text-[hsl(var(--section-light-foreground))]/75">
                  We care that what we do is felt over time. Whether it is a
                  clearer understanding of a topic, a project delivered with a
                  partner or a better decision about the next step after
                  university, activities at TIA should lead to something
                  concrete.
                </p>
              </div>
            </div>
          </motion.div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
