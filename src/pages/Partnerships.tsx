// src/pages/Partnerships.tsx

/**
 * Partnerships.tsx (OPTIMIZED)
 *
 * Improvements:
 * - Debounced hover state to prevent glitchy transitions
 * - GPU-accelerated transforms for smoother animations
 * - Reduced re-renders with useMemo
 * - Pointer-events optimization to prevent hover interference
 * - Separated animation concerns to prevent conflicts
 * - Lazy-loaded FinisherBackground to reduce initial load
 */

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, useCallback, useMemo, lazy, Suspense } from "react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CorporatePartnershipLogoGrid,
  StudentClubPartnershipLogoGrid,
} from "@/components/PartnershipLogoGrid";

// Lazy load the heavy animation component
const FinisherBackground = lazy(() =>
  import("@/components/ui/finisher-background").then((module) => ({
    default: module.FinisherBackground,
  }))
);

type SectionConfig = {
  id: string;
  title: string;
  body: ReactNode;
};

const sections: SectionConfig[] = [
  {
    id: "perspective",
    title: "Our Perspective on Collaboration",
    body: (
      <>
        <p>
          TIA brings together students with strong analytical and quantitative
          abilities who are curious about finance, investment, strategy and the
          role of technology in modern markets. Partnerships allow these
          students to refine their skills on real problems, while offering
          companies a direct window into emerging talent and thinking.
        </p>
        <p>
          We engage with partners who recognise that excellence in finance
          increasingly draws from fields such as mathematical modelling,
          engineering, data science and computational methods. This intersection
          is where TIA operates.
        </p>
      </>
    ),
  },
  {
    id: "how-we-work",
    title: "How We Work with Partners",
    body: (
      <>
        <p>
          Our approach emphasises preparation, structure and reflection. Each
          collaboration—whether a case competition, technical workshop or
          company presentation—is developed jointly with partners and delivered
          with attention to academic rigour and professional relevance.
        </p>
        <p>
          We prioritise quality over volume. Events are designed to facilitate
          interaction, learning and engagement rather than passive consumption.
          Outcomes are evaluated and shared to ensure clarity, feedback and
          improvement over time.
        </p>
      </>
    ),
  },
  {
    id: "formats",
    title: "Formats of Collaboration",
    body: (
      <>
        <p>
          We work with partners across several formats, tailored to the
          substance and objectives of the collaboration:
        </p>
        <ul className="list-none space-y-2">
          <li>
            <span className="font-semibold">Case competitions</span> – short
            intensive or multi-day challenges designed with partners and judged
            collaboratively.
          </li>
          <li>
            <span className="font-semibold">Workshops</span> – technical
            sessions focused on topics such as financial modelling, valuation or
            data analysis tools.
          </li>
          <li>
            <span className="font-semibold">Company presentations</span> –
            conversations that combine insight, dialogue and networking with our
            member base.
          </li>
          <li>
            <span className="font-semibold">Annual partnerships</span> –
            structured, year-round collaboration with shared planning and direct
            access to TIA activities.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "student-orgs",
    title: "Collaboration with Student Organisations",
    body: (
      <>
        <p>
          We also work closely with other student organisations – at DTU, across
          Denmark and internationally – where finance intersects with
          engineering, computer science, entrepreneurship and adjacent
          disciplines. These collaborations bring together different academic
          perspectives while keeping a common focus on substance and
          professional development.
        </p>
        <p>
          Joint events, exchange visits and shared initiatives allow students to
          build cross-campus networks early in their studies. For partners, this
          creates access to a broader, yet still curated, community of students
          who are used to working across fields and institutions.
        </p>
      </>
    ),
  },
];

/**
 * ExpandableSection Component
 * Optimized with GPU acceleration and debouncing
 */
const ExpandableSection = ({
  section,
  index,
  isHovered,
  isDimmed,
  onMouseEnter,
  onMouseLeave,
}: {
  section: SectionConfig;
  index: number;
  isHovered: boolean;
  isDimmed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      key={section.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="border-t border-[hsl(var(--divider))]/40 pt-4 md:pt-6"
      style={{
        opacity: isDimmed ? 0.4 : 1,
        transition: prefersReducedMotion
          ? "none"
          : `opacity 200ms ease-out ${index * 30}ms`,
        // Use will-change sparingly for performance
        willChange: isDimmed || isHovered ? "opacity" : "auto",
      }}
    >
      <div className="flex items-center justify-between gap-4 cursor-default">
        <h2 className="text-lg md:text-xl font-medium text-[hsl(var(--section-light-foreground))]">
          {section.title}
        </h2>
        <ChevronDown
          className="h-4 w-4 text-[hsl(var(--section-light-foreground))]/60"
          style={{
            transform: isHovered ? "rotate(180deg)" : "rotate(0deg)",
            transition: prefersReducedMotion
              ? "none"
              : "transform 250ms ease-out",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Expandable content - GPU accelerated */}
      <div
        style={{
          maxHeight: isHovered ? "420px" : "0px",
          opacity: isHovered ? 1 : 0,
          overflow: "hidden",
          transition: prefersReducedMotion
            ? "none"
            : "max-height 300ms ease-out, opacity 250ms ease-out",
          // Use transform for GPU acceleration
          transform: "translateZ(0)",
          backfaceVisibility: "hidden" as const,
        }}
      >
        <div className="mt-3 space-y-3 text-sm md:text-base text-[hsl(var(--section-light-foreground))]/80 leading-relaxed lg:w-1/2 max-w-xl pb-4">
          {section.body}
        </div>
      </div>
    </div>
  );
};

const Partnerships = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverTimeoutId, setHoverTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );
  const prefersReducedMotion = useReducedMotion();

  // Debounced hover handlers to prevent glitches
  const handleMouseEnter = useCallback(
    (id: string) => {
      // Clear any pending timeout
      if (hoverTimeoutId) {
        clearTimeout(hoverTimeoutId);
      }

      // Set hover immediately
      setHoveredId(id);
      setHoverTimeoutId(null);
    },
    [hoverTimeoutId]
  );

  const handleMouseLeave = useCallback(() => {
    // Add small delay before removing hover to prevent flicker
    const timeoutId = setTimeout(() => {
      setHoveredId(null);
    }, 50);
    setHoverTimeoutId(timeoutId);
  }, []);

  // Memoize section renders to prevent unnecessary re-renders
  const sectionElements = useMemo(
    () =>
      sections.map((section, index) => {
        const isHovered = hoveredId === section.id;
        const isDimmed = hoveredId !== null && hoveredId !== section.id;

        return (
          <ExpandableSection
            key={section.id}
            section={section}
            index={index}
            isHovered={isHovered}
            isDimmed={isDimmed}
            onMouseEnter={() => handleMouseEnter(section.id)}
            onMouseLeave={handleMouseLeave}
          />
        );
      }),
    [hoveredId, handleMouseEnter, handleMouseLeave]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <Hero
        title="Partnerships"
        description="Thoughtful collaboration between industry and technical talent at DTU."
        height={600}
      />

      <main className="grid-outer bg-white">
        {/* INTRO – split 50/50 */}
        <section>
          <div className="grid-inner py-16 md:py-20">
            {/* Left column: heading / one-liner */}
            <div className="col-span-12 md:col-span-6 mb-10 md:mb-0">
              <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/60 mb-4">
                Partnerships at TIA
              </p>
              <h1 className="text-3xl md:text-4xl font-serif font-light text-[hsl(var(--section-light-foreground))] leading-tight">
                Working with industry to shape early talent.
              </h1>
            </div>

            {/* Right column: intro text */}
            <div className="col-span-12 md:col-span-6 space-y-4">
              <p className="text-base md:text-lg text-[hsl(var(--section-light-foreground))]/80 leading-relaxed">
                At the Technical Investment Association, partnerships are a
                natural extension of our mission: to connect technical talent
                with the financial sector in a way that is meaningful, rigorous
                and mutually rewarding. Our collaboration with industry is not
                transactional. It is a long-term investment in competence,
                relevance and shared value.
              </p>
              <p className="text-base md:text-lg text-[hsl(var(--section-light-foreground))]/80 leading-relaxed">
                We collaborate with organisations that value substance and
                preparation, and who see the benefit of engaging with students
                early—through real problems, careful dialogue and an eye on
                long-term development.
              </p>
            </div>
          </div>
        </section>

        {/* STACKED MENU – optimized with memoization */}
        <section>
          <div className="grid-inner pb-16 md:pb-20">
            <motion.div
              className="col-span-12 space-y-4"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {sectionElements}
            </motion.div>
          </div>
        </section>

        {/* BEIGE COLLAB SECTION – isolated from hover interactions */}
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <div className="flex bg-[#f3f2ec] flex-col-reverse lg:flex-row lg:items-stretch">
                {/* Animated side - lazy loaded and pointer-events isolated */}
                <div className="w-full flex-grow lg:w-1/2 pointer-events-none">
                  <figure className="relative w-full overflow-hidden aspect-square lg:h-full">
                    <Suspense
                      fallback={
                        <div className="w-full h-full bg-[#f3f2ec] flex items-center justify-center">
                          <div className="text-sm text-[hsl(var(--section-light-foreground))]/40">
                            Loading...
                          </div>
                        </div>
                      }
                    >
                      <FinisherBackground
                        className="finisher-header-whatwedo"
                        backgroundColor="#ffffff"
                        particleColors={["#328488", "#ffffff", "#b6a892"]}
                        count={6}
                        particleSize={{ min: 300, max: 600, pulse: 0 }}
                        speed={{
                          x: { min: 0.1, max: 0.3 },
                          y: { min: 0.1, max: 0.3 },
                        }}
                        opacity={{ center: 0.9, edge: 0 }}
                        showDotOverlay={true}
                      />
                    </Suspense>
                  </figure>
                </div>

                {/* Text side */}
                <div className="flex px-5 py-10 lg:w-1/2 lg:items-center lg:px-10">
                  <div className="flex flex-col gap-4 lg:mx-auto lg:w-[80%]">
                    <h2 className="text-2xl md:text-3xl text-[hsl(var(--section-light-foreground))] mb-2">
                      A Partnership Based on Shared Interest
                    </h2>
                    <div className="space-y-3 text-sm md:text-base text-[hsl(var(--section-light-foreground))]/80 leading-relaxed">
                      <p>
                        Industry collaboration at TIA is built on alignment.
                        Companies gain access to students with strong technical
                        and analytical backgrounds; students gain exposure to
                        the financial sector and to the realities of the work
                        they aspire to do. The result is not only recruitment
                        advantage but the development of informed, qualified
                        talent entering the field.
                      </p>
                      <p>
                        For our founding partners, this represents an
                        opportunity to shape an emerging initiative at DTU with
                        long-term ambition and a growing cohort of motivated
                        students at the intersection of finance and technology.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA – inviting, with button linked to mail */}
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <div className="pt-12 pb-16 flex flex-col items-start md:items-center gap-4 md:text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/60">
                  Start a conversation
                </p>
                <h2 className="text-2xl md:text-3xl font-medium text-[hsl(var(--section-light-foreground))]">
                  Explore what a partnership with TIA could look like.
                </h2>
                <p className="text-sm md:text-base text-[hsl(var(--section-light-foreground))]/75 max-w-xl leading-relaxed">
                  We are establishing long-term collaborations with
                  organisations who value thoughtful engagement with technical
                  talent. Share a brief note about your interests, and we will
                  follow up with suggested formats and next steps.
                </p>
                <div className="mt-2">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full px-7 py-2 text-sm md:text-base font-medium
                               bg-[#173C40] text-white
                               hover:bg-gradient-to-r hover:from-[#173C40] hover:to-[#B0D5CD]
                               transition-all duration-200"
                  >
                    <a href="mailto:partnerships@tiaassociation.com">
                      Email partnerships@tiaassociation.com
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR PARTNERS – logo section, like on the index page */}
        <section>
          <div className="grid-inner pb-20">
            <motion.div
              className="col-span-12"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Separator className="w-16 mb-8 mx-auto bg-[hsl(var(--divider))]" />
              <h2 className="text-3xl md:text-4xl text-font-bold mb-10 text-center text-[hsl(var(--section-light-foreground))]">
                Our partners
              </h2>

              <div className="space-y-12">
                <div>
                  <CorporatePartnershipLogoGrid />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-center text-[hsl(var(--section-light-foreground))]">
                    Student club partnerships
                  </h3>
                  <StudentClubPartnershipLogoGrid />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Partnerships;
