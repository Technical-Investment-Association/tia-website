/**
 * useUpcomingEvents.ts
 *
 * Purpose: Custom hook to fetch upcoming events from Firestore
 * Returns events, loading state, and error
 *
 * Features:
 * - Filters for published, non-archived events
 * - Returns only future events
 * - Limits results
 * - Proper cleanup to prevent memory leaks
 *
 * Usage:
 * const { events, loading, error } = useUpcomingEvents(3);
 */

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface UpcomingEvent {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  company?: string | null;
  starts_at: Timestamp;
  ends_at?: Timestamp | null;
  apply_url?: string | null;
  published?: boolean;
  archived?: boolean;
}

interface UseUpcomingEventsReturn {
  events: UpcomingEvent[];
  loading: boolean;
  error: string | null;
}

export const useUpcomingEvents = (
  limit: number = 3
): UseUpcomingEventsReturn => {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUpcoming = async () => {
      try {
        const eventsRef = collection(db, "events");
        const q = query(
          eventsRef,
          where("published", "==", true),
          orderBy("starts_at", "asc")
        );

        const snap = await getDocs(q);

        if (!isMounted) return;

        const now = new Date();

        const all: UpcomingEvent[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            title: d.title as string,
            description: d.description ?? null,
            location: d.location ?? null,
            company: d.company ?? null,
            starts_at: d.starts_at as Timestamp,
            ends_at: (d.ends_at as Timestamp | null) ?? null,
            apply_url: d.apply_url ?? null,
            published: d.published ?? false,
            archived: d.archived ?? false,
          };
        });

        // Filter for upcoming, non-archived events
        const upcoming = all
          .filter((ev) => !ev.archived && ev.starts_at.toDate() >= now)
          .slice(0, limit);

        if (isMounted) {
          setEvents(upcoming);
        }
      } catch (err) {
        console.error("Failed to load upcoming events", err);
        if (isMounted) {
          setError("Unable to load events. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUpcoming();

    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { events, loading, error };
};
