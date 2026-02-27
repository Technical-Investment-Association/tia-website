/**
 * useUpcomingEvents.ts
 *
 * Fetches upcoming published, non-archived events for public pages.
 * Includes registration.external_url for external signup buttons.
 */

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

type RegistrationType = "none" | "external" | "email" | "single" | "team";

export type UpcomingEvent = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  company?: string | null;
  starts_at: Timestamp;

  registration?: {
    type: RegistrationType;
    external_url?: string | null;
  } | null;
};

export const useUpcomingEvents = (maxEvents = 3) => {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const now = Timestamp.now();

        const q = query(
          collection(db, "events"),
          where("published", "==", true),
          where("archived", "==", false),
          where("starts_at", ">", now),
          orderBy("starts_at", "asc"),
          limit(maxEvents),
        );

        const snapshot = await getDocs(q);

        const fetchedEvents: UpcomingEvent[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            title: data.title as string,
            description: data.description ?? null,
            location: data.location ?? null,
            company: data.company ?? null,
            starts_at: data.starts_at as Timestamp,

            // 🔑 THIS is the important part
            registration: data.registration ?? {
              type: "none",
              external_url: null,
            },
          };
        });

        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to load upcoming events:", err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [maxEvents]);

  return { events, loading, error };
};
