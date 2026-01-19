/**
 * AdminEvents.tsx
 *
 * Purpose: Admin interface for managing events
 *
 * Features:
 * - Similar layout to public Events page
 * - Edit button at bottom of each event
 * - View Signups button (if event has registration)
 * - Delete/Archive moved into edit modal
 * - Create new event button
 *
 * Layout matches Events.tsx with admin controls
 */

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase/firebase";
import { Hero } from "@/components/ui/hero";
import { AdminEventCard } from "@/components/admin-event-card";
import { EventEditModal } from "@/components/modals/event-edit-modal";
import { SignupsViewModal } from "@/components/modals/signups-view-modal";
import { useAuth } from "@/contexts/AuthContext";

// ============================================================================
// Types
// ============================================================================

type EventDoc = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  company?: string | null;
  starts_at: Timestamp;
  ends_at?: Timestamp | null;
  published?: boolean;
  archived?: boolean;
  image_url?: string | null;
  registration?: {
    type: "none" | "external" | "email" | "single" | "team";
    status?: "closed" | "open" | "full";
    external_url?: string;
    // ... other registration fields
  };
  stats?: {
    total_signups?: number;
    total_participants?: number;
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

const categorizeEvents = (events: EventDoc[]) => {
  const now = new Date();

  const upcoming = events
    .filter((event) => event.starts_at.toDate() >= now)
    .sort((a, b) => a.starts_at.toMillis() - b.starts_at.toMillis());

  const past = events
    .filter((event) => event.starts_at.toDate() < now)
    .sort((a, b) => b.starts_at.toMillis() - a.starts_at.toMillis());

  const archived = events
    .filter((event) => event.archived)
    .sort((a, b) => b.starts_at.toMillis() - a.starts_at.toMillis());

  return { upcoming, past, archived };
};

// ============================================================================
// Main AdminEvents Component
// ============================================================================

const AdminEvents = () => {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [signupsModalOpen, setSignupsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDoc | null>(null);

  // Fetch all events (including unpublished and archived)
  useEffect(() => {
    if (!isAdmin) return;

    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, orderBy("starts_at", "desc"));

        const snapshot = await getDocs(q);

        if (!isMounted) return;

        const fetchedEvents: EventDoc[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title as string,
            description: data.description ?? null,
            location: data.location ?? null,
            company: data.company ?? null,
            starts_at: data.starts_at as Timestamp,
            ends_at: data.ends_at ?? null,
            published: data.published ?? false,
            archived: data.archived ?? false,
            image_url: data.image_url ?? null,
            registration: data.registration ?? { type: "none" },
            stats: data.stats ?? {},
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
  }, [isAdmin]);

  // Categorize events (memoized)
  const { upcoming, past, archived } = useMemo(
    () => categorizeEvents(events),
    [events]
  );

  // Handlers
  const handleEdit = (event: EventDoc) => {
    setSelectedEvent(event);
    setEditModalOpen(true);
  };

  const handleViewSignups = (event: EventDoc) => {
    setSelectedEvent(event);
    setSignupsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedEvent(null);
    setEditModalOpen(true);
  };

  const handleEventUpdated = () => {
    // Refresh events list
    setLoading(true);
    // Re-fetch logic here or pass callback
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-neutral-600">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <Hero
        title="Manage Events"
        description="Create, edit, and manage TIA events and registrations."
        height={300}
        actions={
          <Button
            size="lg"
            onClick={handleCreateNew}
            className="bg-primary-800 hover:bg-primary-900 text-white"
          >
            <Plus className="mr-2 w-5 h-5" />
            Create New Event
          </Button>
        }
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
                  <div className="p-4 border border-[hsl(var(--divider))]">
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

                    {upcoming.length === 0 ? (
                      <p className="text-[hsl(var(--section-light-foreground))]/70 py-10">
                        No upcoming events.
                      </p>
                    ) : (
                      <div className="border-t border-[hsl(var(--divider))]/40">
                        {upcoming.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <AdminEventCard
                              event={event}
                              onEdit={() => handleEdit(event)}
                              onViewSignups={() => handleViewSignups(event)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Past Events */}
                  <div>
                    <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />
                    <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-8">
                      Past Events
                    </h2>

                    {past.length === 0 ? (
                      <p className="text-[hsl(var(--section-light-foreground))]/70 py-10">
                        No past events.
                      </p>
                    ) : (
                      <div className="border-t border-[hsl(var(--divider))]/40">
                        {past.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <AdminEventCard
                              event={event}
                              onEdit={() => handleEdit(event)}
                              onViewSignups={() => handleViewSignups(event)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Archived Events */}
                  {archived.length > 0 && (
                    <div>
                      <Separator className="w-16 mb-6 bg-[hsl(var(--divider))]" />
                      <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-8">
                        Archived Events
                      </h2>

                      <div className="border-t border-[hsl(var(--divider))]/40">
                        {archived.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <AdminEventCard
                              event={event}
                              onEdit={() => handleEdit(event)}
                              onViewSignups={() => handleViewSignups(event)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modals */}
      <EventEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        event={selectedEvent}
        onEventUpdated={handleEventUpdated}
      />

      <SignupsViewModal
        isOpen={signupsModalOpen}
        onClose={() => setSignupsModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
};

export default AdminEvents;
