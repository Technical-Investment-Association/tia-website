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

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  CorporatePartnershipLogoGrid,
  StudentClubPartnershipLogoGrid,
} from "@/components/PartnershipLogoGrid";
import { Hero } from "@/components/ui/hero";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { FinisherBackground } from "@/components/ui/finisher-background";
import { EventCardSkeleton } from "@/components/event-card-skeleton";
import { EventCardCompact } from "@/components/event-card-compact";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";

const Index = () => {
  const { events, loading: eventsLoading, error } = useUpcomingEvents(3);
  const [counterActive, setCounterActive] = useState(false);

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
                               bg-[#173C40] text-white
                               hover:bg-gradient-to-r hover:from-[#173C40] hover:to-[#B0D5CD]
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
      <main className="grid-outer bg-white">
        {/* ================================================================
            UPCOMING EVENTS SECTION
            ================================================================ */}
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-4xl md:text-3xl text-font-bold mb-10 text-[hsl(var(--section-light-foreground))]">
                  Upcoming events
                </h2>
              </div>

              {/* Loading skeleton */}
              {eventsLoading && <EventCardSkeleton count={3} />}

              {/* Error state */}
              {error && (
                <div className="border-t border-b border-[hsl(var(--divider))] py-10 text-sm text-red-600">
                  <p>{error}</p>
                </div>
              )}

              {/* Loaded with events */}
              {!eventsLoading && !error && events.length > 0 && (
                <>
                  <div className="border-t border-b border-[hsl(var(--divider))]/40 md:flex md:divide-x divide-[hsl(var(--divider))]/40 divide-y md:divide-y-0">
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

              {/* Loaded, but no events */}
              {!eventsLoading && !error && events.length === 0 && (
                <div className="border-t border-b border-[hsl(var(--divider))] py-10 text-sm text-[hsl(var(--section-light-foreground))]/70">
                  <p>No upcoming events right now. Check back soon.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================================
            COMMUNITY / SKILLS SECTION
            ================================================================ */}
        <section>
          <div className="grid-inner items-center gap-y-10">
            <div className="col-span-12 md:col-span-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                onViewportEnter={() => setCounterActive(true)}
                className="max-w-xs w-full bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-8"
              >
                <div className="flex flex-col items-center gap-4">
                  <span className="text-xs font-medium tracking-[0.2em] uppercase text-[hsl(var(--section-light-foreground))]/60 text-center">
                    Community
                  </span>
                  <p className="text-6xl sm:text-7xl font-light leading-none text-[hsl(var(--section-light-foreground))]">
                    <AnimatedCounter target={130} active={counterActive} />
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
        </section>

        {/* ================================================================
    WHAT WE DO SECTION
    ================================================================ */}
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <div className="flex bg-[#f3f2ec] flex-col-reverse lg:flex-row-reverse lg:items-stretch xl:h-[540px] 3xl:h-[620px]">
                {/* Visual side */}
                <div className="w-full flex-grow lg:h-full lg:w-1/2">
                  <figure className="relative w-full overflow-hidden aspect-square lg:h-full">
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
                  </figure>
                </div>

                {/* Text side */}
                <div className="flex px-5 py-10 lg:w-1/2 lg:items-center lg:px-10">
                  <div className="flex flex-col gap-4 lg:mx-auto lg:w-[80%]">
                    <h2 className="text-3xl md:text-4xl font-serif font-medium mb-2 text-[hsl(var(--section-light-foreground))]">
                      What we do
                    </h2>

                    <p className="text-sm md:text-base text-[hsl(var(--section-light-foreground))]/75 leading-relaxed">
                      TIA is a community for students who want to go deeper into
                      finance and technology than the standard curriculum. We
                      organise a focused mix of talks, workshops and smaller
                      sessions that combine academic thinking with practical
                      insight from industry and alumni.
                    </p>

                    <div className="mt-2">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            PARTNERSHIPS SECTION
            ================================================================ */}
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <Separator className="w-16 mb-8 mx-auto bg-[hsl(var(--divider))]" />
              <h2 className="text-4xl text-font-bold mb-10 text-center text-[hsl(var(--section-light-foreground))]">
                Partnerships
              </h2>

              <div className="space-y-12">
                {/* Corporate partnerships block */}
                <div>
                  <CorporatePartnershipLogoGrid />
                </div>

                {/* Student club partnerships block*/}
                <div>
                  <h3 className="text-xl font-normal mb-3 text-center text-[hsl(var(--section-light-foreground))]">
                    Student club partnerships
                  </h3>
                  <StudentClubPartnershipLogoGrid />
                </div>
              </div>

              <div className="text-center mt-16">
                <Link to="/partnerships">
                  <Button
                    className="rounded-full px-8 py-3 text-base font-medium
                       bg-[#f3f2ec] text-light-foreground
                       hover:bg-[#B0D5CD]
                       transition-all duration-200"
                  >
                    Partner with us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
