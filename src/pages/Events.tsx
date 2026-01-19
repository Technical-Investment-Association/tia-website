/**
 * Events.tsx
 *
 * Purpose: Public-facing events page displaying upcoming and past TIA events
 *
 * Features:
 * - Animated hero section with FinisherHeader background
 * - Separate sections for upcoming and past events
 * - Click-to-expand event descriptions (not hover)
 * - Event logos with proper aspect ratio
 * - Smooth animations on scroll
 * - Scrollable long descriptions
 * - Clean separator lines between events
 *
 * Data Read:
 * - /events: Fetches published, non-archived events ordered by starts_at
 *
 * Security:
 * - Only displays events with published: true
 * - Firestore rules prevent reading unpublished events
 * - XSS-safe: All user content escaped by React
 */

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase/firebase";
import { Hero } from "@/components/ui/hero";
import { EventCard } from "@/components/event-card";

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
  apply_url?: string | null;
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
// Main Events Page Component
// ============================================================================

const Events = () => {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from Firestore
  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events");
        const q = query(
          eventsRef,
          where("published", "==", true),
          orderBy("starts_at", "asc")
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
            apply_url: data.apply_url ?? null,
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
    [events]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Animated Hero Section */}
      <Hero
        title="Events"
        description="Workshops, speaker sessions and market cases that connect finance, technology and quantitative thinking."
        height={350}
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
                    <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-8">
                      Upcoming Events
                    </h2>

                    {upcomingEvents.length === 0 ? (
                      <p className="text-[hsl(var(--section-light-foreground))]/70 py-10">
                        There are currently no upcoming events. Please check
                        back soon.
                      </p>
                    ) : (
                      <div className="border-t border-[hsl(var(--divider))]/40">
                        {upcomingEvents.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <EventCard event={event} showSignup={true} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Previous Events */}
                  <div>
                    <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />
                    <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-8">
                      Previous Events
                    </h2>

                    {pastEvents.length === 0 ? (
                      <p className="text-[hsl(var(--section-light-foreground))]/70 py-10">
                        No previous events have been recorded yet.
                      </p>
                    ) : (
                      <div className="border-t border-[hsl(var(--divider))]/40">
                        {pastEvents.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <EventCard event={event} showSignup={false} />
                          </motion.div>
                        ))}
                      </div>
                    )}
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
