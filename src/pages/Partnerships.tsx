// src/pages/Partnerships.tsx

import type { ReactNode } from "react";
import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CorporatePartnershipLogoGrid,
  StudentClubPartnershipLogoGrid,
} from "@/components/PartnershipLogoGrid";

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
    title: "Our perspective on collaboration",
    body: (
      <>
        <p>
          TIA brings together students with strong analytical and quantitative
          abilities who are curious about finance, investment, strategy and the
          role of technology in modern markets. Partnerships allow these
          students to work on real problems while giving companies a direct
          window into emerging talent and thinking.
        </p>
        <p>
          We engage with partners who recognise that excellence in finance
          increasingly draws from fields such as mathematical modelling,
          engineering, data science and computer science. Collaboration is most
          successful when it is based on shared curiosity, clear expectations
          and a long–term view.
        </p>
      </>
    ),
  },
  {
    id: "how-we-work",
    title: "How we work with partners",
    body: (
      <>
        <p>
          Each collaboration starts with a conversation. We map your objectives,
          the type of students you want to reach and the formats that make sense
          given your time and resources. From there, we design a concrete plan
          together.
        </p>
        <p>
          Throughout the collaboration we keep communication simple and
          transparent, with a single main point of contact on both sides.
          Feedback from students and partners is used to refine future
          activities so that the partnership gets better over time rather than
          starting from scratch each year.
        </p>
      </>
    ),
  },
  {
    id: "formats",
    title: "Formats of collaboration",
    body: (
      <>
        <p>
          We typically work with partners through a mix of case–based workshops,
          talks, panel discussions and deep–dive sessions. The exact format
          depends on the themes you wish to highlight and the topics our
          students are most interested in exploring.
        </p>
        <p>
          Rather than offering a fixed package, we develop each collaboration
          through a shared conversation. We aim to find a strong intellectual
          fit between what you want to showcase and what our members are curious
          about, and then shape the structure accordingly.
        </p>
      </>
    ),
  },
  {
    id: "student-orgs",
    title: "Collaboration with other student organisations",
    body: (
      <>
        <p>
          TIA is part of a wider ecosystem of student organisations within
          finance, technology and entrepreneurship. For some companies it is
          natural to engage across several groups in parallel.
        </p>
        <p>
          We are happy to coordinate with other clubs when it creates a better
          experience for students and partners – for example by co–hosting
          events, sharing insight on student engagement or linking initiatives
          across campuses and markets.
        </p>
      </>
    ),
  },
];

type ExpandableSectionProps = {
  section: SectionConfig;
  index: number;
  isHovered: boolean;
  isOpen: boolean;
  isDimmed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggle: () => void;
};

const ExpandableSection = ({
  section,
  index,
  isHovered,
  isOpen,
  isDimmed,
  onMouseEnter,
  onMouseLeave,
  onToggle,
}: ExpandableSectionProps) => {
  const prefersReducedMotion = useReducedMotion();
  const isActiveHeader = isOpen || isHovered;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="border-t border-[hsl(var(--divider))]/40 pt-4 md:pt-6"
      style={{
        opacity: isDimmed ? 0.4 : 1,
        transition: prefersReducedMotion
          ? "none"
          : `opacity 200ms ease-out ${index * 30}ms`,
        willChange: isDimmed || isActiveHeader ? "opacity" : "auto",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 cursor-pointer bg-transparent border-none p-0 text-left"
      >
        <h2 className="text-lg md:text-xl font-medium text-[hsl(var(--section-light-foreground))]">
          {section.title}
        </h2>
        <ChevronDown
          className="h-4 w-4 text-[hsl(var(--section-light-foreground))]/60"
          style={{
            transform: isActiveHeader ? "rotate(180deg)" : "rotate(0deg)",
            transition: prefersReducedMotion
              ? "none"
              : "transform 250ms ease-out",
          }}
          aria-hidden="true"
        />
      </button>

      <div
        style={{
          maxHeight: isOpen ? "420px" : "0px",
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: prefersReducedMotion
            ? "none"
            : "max-height 300ms ease-out, opacity 250ms ease-out",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
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
  const [openId, setOpenId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseEnter = useCallback((id: string) => {
    setHoveredId(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const handleToggleOpen = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  // Hover wins; if nothing is hovered, we fall back to the open section
  const activeId = hoveredId ?? openId;

  const sectionElements = useMemo(
    () =>
      sections.map((section, index) => {
        const isHovered = hoveredId === section.id;
        const isOpen = openId === section.id;
        const isDimmed = activeId !== null && activeId !== section.id;

        return (
          <ExpandableSection
            key={section.id}
            section={section}
            index={index}
            isHovered={isHovered}
            isOpen={isOpen}
            isDimmed={isDimmed}
            onMouseEnter={() => handleMouseEnter(section.id)}
            onMouseLeave={handleMouseLeave}
            onToggle={() => handleToggleOpen(section.id)}
          />
        );
      }),
    [
      activeId,
      hoveredId,
      openId,
      handleMouseEnter,
      handleMouseLeave,
      handleToggleOpen,
    ]
  );

  return (
    <div className="min-h-screen bg-white text-[hsl(var(--section-light-foreground))]">
      <Navigation />

      <Hero
        title="Partnerships"
        description="Thoughtful collaboration between industry and technical talent at DTU."
        height={600}
      />

      <main className="grid-outer bg-white">
        {/* Intro section */}
        <section>
          <div className="grid-inner py-16 md:py-20">
            <div className="col-span-12 md:col-span-6 mb-10 md:mb-0">
              <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/60 mb-4">
                Partnerships at TIA
              </p>
              <h1 className="text-3xl md:text-4xl font-serif font-medium text-[hsl(var(--section-light-foreground))] leading-tight">
                Working with industry to shape early talent.
              </h1>
            </div>

            <div className="col-span-12 md:col-span-6 space-y-4">
              <p className="text-base md:text-lg text-[hsl(var(--section-light-foreground))]/80 leading-relaxed">
                At the Technical Investment Association, partnerships are a
                natural extension of what we do: building a community of
                students who are serious about finance, technology and markets –
                and connecting them with organisations who value that mindset.
              </p>
              <p className="text-sm md:text-base text-[hsl(var(--section-light-foreground))]/70 leading-relaxed">
                Whether you are exploring long–term recruitment, want sharper
                discussions around a specific theme or simply wish to introduce
                your work to technically minded students, we aim to design
                collaborations that feel purposeful and well prepared.
              </p>
            </div>
          </div>
        </section>

        {/* Stacked sections (accordion) */}
        <section>
          <div className="grid-inner pb-16 md:pb-20">
            <motion.div
              className="col-span-12 space-y-4"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
              }
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {sectionElements}
            </motion.div>
          </div>
        </section>

        {/* Beige collaboration section with finisher background */}
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <div className="flex bg-[#f3f2ec] flex-col-reverse lg:flex-row lg:items-stretch">
                {/* Text side */}
                <div className="flex px-5 py-10 lg:w-1/2 lg:items-center lg:px-10">
                  <div className="flex flex-col gap-4 lg:mx-auto lg:w-[80%]">
                    <h2 className="text-2xl md:text-3xl text-[hsl(var(--section-light-foreground))] mb-2">
                      A partnership based on shared interest
                    </h2>
                    <p className="text-sm md:text-base text-[hsl(var(--section-light-foreground))]/80 leading-relaxed">
                      We are selective about the partnerships we enter. The most
                      successful collaborations tend to be those where there is
                      a clear intellectual fit between your work and the
                      questions our members are curious about.
                    </p>
                    <p className="text-sm md:text-base text-[hsl(var(--section-light-foreground))]/80 leading-relaxed">
                      If you are unsure whether TIA is the right forum, we are
                      happy to have an initial conversation to explore ideas
                      without any commitment. From there we can jointly decide
                      if and how to move forward.
                    </p>
                    <div className="mt-4">
                      <Button
                        asChild
                        size="lg"
                        className="
    group
    rounded-full px-7 py-2 text-sm md:text-base font-medium
    bg-white text-black border-none
    transition-colors duration-200
    hover:bg-primary hover:text-white
  "
                      >
                        <a
                          href="mailto:partnerships@tiaassociation.com"
                          className="inline-flex items-center gap-2"
                        >
                          Start a conversation
                          <span
                            className="
        inline-block transition-transform duration-200 
        group-hover:translate-x-1
      "
                          >
                            →
                          </span>
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Visual side */}
                <div className="relative h-[260px] w-full overflow-hidden lg:h-auto lg:w-1/2">
                  <figure className="absolute inset-0">
                    <Suspense
                      fallback={
                        <div className="w-full h-full bg-[#f3f2ec] flex items-center justify-center">
                          <div className="text-sm text-[hsl(var(--section-light-foreground))]/40">
                            Loading…
                          </div>
                        </div>
                      }
                    >
                      {!prefersReducedMotion && (
                        <FinisherBackground
                          className="finisher-header-whatwedo"
                          backgroundColor="#ffffff"
                          particleColors={["#328488", "#ffffff", "#9aa864"]}
                          count={5}
                          particleSize={{ min: 300, max: 600, pulse: 2 }}
                          speed={{
                            x: { min: 0.4, max: 1 },
                            y: { min: 0.4, max: 1 },
                          }}
                          opacity={{ center: 0.9, edge: 0 }}
                          showDotOverlay={true}
                        />
                      )}
                    </Suspense>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our partners */}
        <section>
          <div className="grid-inner pb-20">
            <motion.div
              className="col-span-12"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
              }
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Separator className="w-16 mb-8 mx-auto bg-[hsl(var(--divider))]" />
              <h2 className="text-3xl md:text-4xl mb-10 text-center text-[hsl(var(--section-light-foreground))]">
                Our partners
              </h2>

              <div className="space-y-12">
                <div>
                  <CorporatePartnershipLogoGrid />
                </div>
                {/* Student club partnerships*/}
                <div>
                  <h3 className="text-xl font-normal mb-3 text-center text-[hsl(var(--section-light-foreground))]">
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
