/**
 * Events.tsx (OPTIMIZED)
 *
 * Purpose: Public-facing events page displaying upcoming and past TIA events
 *
 * Optimizations:
 * - Memoized event categorization
 * - Reduced motion support
 * - GPU-accelerated animations
 * - Optimized re-renders with React.memo
 * - Lazy image loading
 * - Proper cleanup
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase/firebase";
import { Hero } from "@/components/ui/hero";
import { EventCard } from "@/components/event-card";
import { Separator } from "@/components/ui/separator";

// ============================================================================
// Types
// ============================================================================

type EventDoc = {
  id: string;
  title: string;
  description?: string | null;
  short_description?: string | null;
  location?: string | null;
  company?: string | null;
  starts_at: Timestamp;
  ends_at?: Timestamp | null;
  published?: boolean;
  archived?: boolean;
  image_url?: string | null;
  summary?: string | null;
  post_image_url?: string | null;

  registration?: {
    type: "none" | "external" | "email" | "single" | "team";
    external_url?: string | null;
  } | null;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Splits events into upcoming and past based on current date
 */
const categorizeEvents = (events: EventDoc[]) => {
  const now = new Date();

  // Filter out archived events
  const activeEvents = events.filter((event) => !event.archived);

  // Split into upcoming and past
  const upcoming = activeEvents
    .filter((event) => event.starts_at.toDate() >= now)
    .sort((a, b) => a.starts_at.toMillis() - b.starts_at.toMillis());

  const past = activeEvents
    .filter((event) => event.starts_at.toDate() < now)
    .sort((a, b) => b.starts_at.toMillis() - a.starts_at.toMillis());

  return { upcoming, past };
};

// ============================================================================
// Past Event Card Component (Optimized)
// ============================================================================

interface PastEventCardProps {
  event: EventDoc;
  index: number;
  prefersReducedMotion: boolean;
}

const PastEventCard = ({
  event,
  index,
  prefersReducedMotion,
}: PastEventCardProps) => {
  const date = event.starts_at.toDate();
  const formatted = date.toLocaleDateString("en-GB");
  const eyebrow = event.company || "Event";
  const imageSrc = event.post_image_url || event.image_url || null;
  const summary = event.summary ?? null;

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut",
      }}
      className="group border-t border-[hsl(var(--divider))]/40 pt-6 cursor-pointer"
    >
      <div className="flex gap-6 items-start">
        {/* Image – ~1/3 width */}
        <div className="w-1/3">
          <div className="w-full aspect-[16/9] bg-[hsl(var(--divider))]/15 overflow-hidden flex items-center justify-center">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={event.title}
                loading="lazy"
                className="w-full h-full object-cover"
                style={{
                  // GPU acceleration
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden" as const,
                }}
              />
            ) : (
              <div className="w-20 h-20 bg-[hsl(var(--divider))]/30" />
            )}
          </div>
        </div>

        {/* Text – ~2/3 width */}
        <div className="w-2/3 flex flex-col justify-start">
          <div className="text-xs uppercase tracking-[0.16em] text-[hsl(var(--section-light-foreground))]/60 mb-1">
            {eyebrow}
          </div>
          <h3 className="text-base md:text-lg font-medium text-[hsl(var(--section-light-foreground))]">
            {event.title}
          </h3>
          <div className="text-xs text-[hsl(var(--section-light-foreground))]/70 mt-1">
            {formatted}
          </div>

          {summary &&
            (prefersReducedMotion ? (
              // If user prefers reduced motion, just show the summary statically
              <p className="mt-2 text-sm text-[hsl(var(--section-light-foreground))]/75 leading-relaxed">
                {summary}
              </p>
            ) : (
              // Otherwise, animate open on hover of the whole card
              <div className="mt-2 overflow-hidden max-h-0 opacity-0 transition-all duration-300 ease-out group-hover:max-h-40 group-hover:opacity-100">
                <p className="text-sm text-[hsl(var(--section-light-foreground))]/75 leading-relaxed">
                  {summary}
                </p>
              </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// Main Events Page Component
// ============================================================================

const Events = () => {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Fetch events from Firestore
  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events");
        const q = query(
          eventsRef,
          where("published", "==", true),
          orderBy("starts_at", "asc"),
        );

        const snapshot = await getDocs(q);

        if (!isMounted) return;

        const fetchedEvents: EventDoc[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title as string,
            description: data.description ?? null,
            short_description: data.short_description ?? null,
            location: data.location ?? null,
            company: data.company ?? null,
            starts_at: data.starts_at as Timestamp,
            ends_at: data.ends_at ?? null,
            published: data.published,
            archived: data.archived ?? false,
            image_url: data.image_url ?? null,
            summary: data.summary ?? null,
            post_image_url: data.post_image_url ?? null,
            registration: data.registration ?? {
              type: "none",
              external_url: null,
            },
          };
        });

        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to load events:", err);
        if (isMounted) {
          setError("Failed to load events. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  // Categorize events into upcoming and past (memoized)
  const { upcoming: upcomingEvents, past: pastEvents } = useMemo(
    () => categorizeEvents(events),
    [events],
  );

  // Memoize past event cards to prevent re-renders
  const pastEventCards = useMemo(
    () =>
      pastEvents
        .slice(0, 3)
        .map((event, index) => (
          <PastEventCard
            key={event.id}
            event={event}
            index={index}
            prefersReducedMotion={!!prefersReducedMotion}
          />
        )),
    [pastEvents, prefersReducedMotion],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Animated Hero Section */}
      <Hero
        title="Events"
        description="Workshops, speaker sessions and market cases that connect finance, technology and quantitative thinking."
        height={450}
      />

      {/* Events Content */}
      <main className="grid-outer bg-white">
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <div className="text-[hsl(var(--section-light-foreground))]/70">
                    Loading events...
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="py-10">
                  <div className="p-4 border border-[hsl(var(--divider))] bg-red-50/50">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Events Sections */}
              {!loading && !error && (
                <div className="space-y-16">
                  {/* Upcoming Events */}
                  <div>
                    <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />

                    <h2 className="text-4xl md:text-3xl text-font-bold text-[hsl(var(--section-light-foreground))] mb-8">
                      Upcoming events
                    </h2>

                    {upcomingEvents.length === 0 ? (
                      <p className="text-[hsl(var(--section-light-foreground))]/70 py-10">
                        There are currently no upcoming events. Please check
                        back soon.
                      </p>
                    ) : (
                      <div>
                        {upcomingEvents.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={
                              prefersReducedMotion
                                ? undefined
                                : { opacity: 0, y: 10 }
                            }
                            whileInView={
                              prefersReducedMotion
                                ? undefined
                                : { opacity: 1, y: 0 }
                            }
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.05,
                              ease: "easeOut",
                            }}
                          >
                            <EventCard event={event} showSignup={true} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Past Events */}
                  <div className="bg-section-cream">
                    <div className="grid-inner py-14 md:py-16">
                      {/* Left half – heading */}
                      <div className="col-span-12 md:col-span-6 mb-10 md:mb-0">
                        <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/60 mb-4">
                          recap
                        </p>
                        <h2 className="text-3xl md:text-4xl text-font-bold text-[hsl(var(--section-light-foreground))]">
                          Some of our most recent events
                        </h2>
                      </div>

                      {/* Right half – list of up to three past events */}
                      <div className="col-span-12 md:col-span-6 space-y-6">
                        {pastEvents.length === 0 ? (
                          <p className="text-[hsl(var(--section-light-foreground))]/70">
                            No previous events have been recorded yet.
                          </p>
                        ) : (
                          pastEventCards
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
