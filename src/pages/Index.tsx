/**
 * Index.tsx (Homepage)
 *
 * Purpose: Main landing page for TIA website
 *
 * Architecture:
 * - Uses custom hook (useUpcomingEvents) for data fetching
 * - Extracted components for reusability
 * - Clean, focused main component
 * - Keeps exact original styling (no changes)
 *
 * Extracted Components:
 * - AnimatedCounter: Number animation with trigger
 * - FinisherBackground: Animated particle background
 * - EventCardSkeleton: Loading skeleton
 * - EventCardCompact: Individual event card
 * - useUpcomingEvents: Data fetching hook
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  CorporatePartnershipLogoGrid,
  StudentClubPartnershipLogoGrid,
} from "@/components/PartnershipLogoGrid";
import { Hero } from "@/components/ui/hero";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { EventCardSkeleton } from "@/components/event-card-skeleton";
import { EventCardCompact } from "@/components/event-card-compact";
import { useUpcomingEvents } from "@/hooks/use-upcoming-events";
import { themeColors } from "@/theme/tokens";
import { Section } from "@/components/layout/Section";
import { BeigeSplitCard } from "@/components/layout/BeigeSplitCard";

const Index = () => {
  const { events, loading: eventsLoading, error } = useUpcomingEvents(3);
  const [counterActive, setCounterActive] = useState(false);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/membership/count")
      .then((res) => (res.ok ? res.json() : res.json().catch(() => ({ count: 0 }))))
      .then((data: { count: number }) => setMemberCount(data.count))
      .catch(() => setMemberCount(0));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero – full-width inside inner grid */}
      <section className="scroll-mt-[var(--header-height-mobile)] md:scroll-mt-[var(--header-height)]">
        <div className="col-span-12">
          <Hero
            showSeparator={false}
            wrapTitle={false}
            wrapDescription={false}
            height={600}
            title={
              <div className="h-full flex">
                <div className="w-full h-[66%] mt-auto flex flex-col items-center text-center gap-6 pb-10">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white">
                    Technical Investment Association
                  </h1>
                  <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                    Students passionate about finance and technology at the
                    intersection of markets, data, and innovation.
                  </p>
                  <div className="mt-4">
                    <Link to="/join">
                      <Button
                        size="lg"
                        className="rounded-full px-8 py-3 text-base font-medium
                               bg-primary text-white
                               hover:bg-gradient-to-r hover:from-primary hover:to-accent-mint
                               transition-all duration-200"
                      >
                        Join the network
                        <ArrowRight className="ml-2" size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            }
            actions={null}
          />
        </div>
      </section>

      {/* Unified grid layout for all sections */}
      <main className="bg-white">
        {/* ================================================================
            UPCOMING EVENTS SECTION (hidden when no upcoming events)
            ================================================================ */}
        {(eventsLoading || error || events.length > 0) && (
        <Section>
          <div className="grid-inner">
            <div className="col-span-12">
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-4xl md:text-3xl text-font-bold mb-10 text-[hsl(var(--section-light-foreground))]">
                  Upcoming events
                </h2>
              </div>

              {/* Loading skeleton */}
              {eventsLoading && <EventCardSkeleton count={3} />}

              {/* Error state */}
              {error && (
                <div className="py-10 text-sm text-red-600">
                  <p>{error}</p>
                </div>
              )}

              {/* Loaded with events */}
              {!eventsLoading && !error && events.length > 0 && (
                <>
                  <div className="md:flex md:divide-x divide-[hsl(var(--divider))] divide-y md:divide-y-0">
                    {events.map((event) => (
                      <EventCardCompact key={event.id} event={event} />
                    ))}
                  </div>

                  <div className="mt-4 text-right">
                    <Link
                      to="/events"
                      className="text-xs font-medium text-muted-foreground hover:text-[hsl(var(--section-light-foreground))] underline underline-offset-4"
                    >
                      view all events
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </Section>
        )}

        {/* ================================================================
            COMMUNITY / SKILLS SECTION
            ================================================================ */}
        <Section>
          <div className="grid-inner items-center gap-y-10">
            <div className="col-span-12 md:col-span-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                onViewportEnter={() => setCounterActive(true)}
                className="max-w-xs w-full bg-white/80 backdrop-blur-sm px-6 py-8"
              >
                <div className="flex flex-col items-center gap-4">
                  <span className="text-xs font-medium tracking-[0.2em] uppercase text-[hsl(var(--section-light-foreground))]/60 text-center">
                    Community
                  </span>
                  <p className="text-6xl sm:text-7xl font-light leading-none text-[hsl(var(--section-light-foreground))]">
                    <AnimatedCounter
                      target={memberCount ?? 0}
                      active={counterActive && memberCount !== null}
                    />
                  </p>
                  <p className="text-base text-[hsl(var(--section-light-foreground))]/70">
                    active members
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="col-span-12 md:col-span-6 md:col-start-7 space-y-4">
              <h2 className="text-3xl md:text-4xl font-medium text-[hsl(var(--section-light-foreground))]">
                Develop skills for the future of finance
              </h2>
              <p className="text-lg text-[hsl(var(--section-light-foreground))]/70 leading-relaxed">
                At TIA, students from diverse academic backgrounds come together
                to deepen their understanding of markets, technology, and
                quantitative analysis. We emphasize learning through projects,
                industry exposure, and collaborative initiatives across
                institutions.
              </p>
            </div>
          </div>
        </Section>

        {/* ================================================================
    WHAT WE DO SECTION
    ================================================================ */}
        <Section>
          <BeigeSplitCard
            title="What we do"
            body={
              <p>
                TIA is a community for students who want to go deeper into
                finance and technology than the standard curriculum. We organise
                a focused mix of talks, workshops and smaller sessions that
                combine academic thinking with practical insight from industry
                and alumni.
              </p>
            }
            cta={
              <Link
                to="/events"
                className="group inline-flex items-center text-sm md:text-base font-medium
                   text-[hsl(var(--section-light-foreground))]/80
                   hover:text-[hsl(var(--section-light-foreground))]"
              >
                <span>Explore our events</span>
                <ArrowRight
                  className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            }
            animationColors={[
              themeColors.accentTeal,
              themeColors.accentMint,
              themeColors.accentTaupe,
            ]}
          />
        </Section>

        {/* ================================================================
            PARTNERSHIPS SECTION
            ================================================================ */}
        <Section>
          <div className="grid-inner">
            <div className="col-span-12">
              <h2 className="text-4xl text-font-bold mb-20 text-center text-[hsl(var(--section-light-foreground))]">
                Partnerships
              </h2>

              <div className="space-y-28">
                {/* Corporate partnerships (no subheading – implied) */}
                <div>
                  <CorporatePartnershipLogoGrid />
                </div>

                {/* Allied student clubs block */}
                <div>
                  <h3 className="text-2xl font-normal mb-8 text-center text-[hsl(var(--section-light-foreground))]/65">
                    Allied student clubs
                  </h3>
                  <StudentClubPartnershipLogoGrid />
                </div>
              </div>

              <div className="text-center mt-28 mb-4">
                <Link to="/partnerships">
                  <Button
                    className="rounded-full px-8 py-3 text-base font-medium
                       bg-transparent border-2 border-black text-black
                       hover:bg-black hover:text-white
                       transition-all duration-200"
                  >
                    Partner with us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
