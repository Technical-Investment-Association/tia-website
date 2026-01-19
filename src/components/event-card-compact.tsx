/**
 * EventCardCompact.tsx
 *
 * Purpose: Compact event card with hover-to-expand interaction
 * Used on homepage for upcoming events preview
 * Keeps exact styling from Index.tsx
 *
 * Features:
 * - Date display in sidebar
 * - Hover-triggered expansion
 * - Company/eyebrow text
 * - Location and description on expand
 * - Sign-up button
 */

import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Timestamp } from "firebase/firestore";

interface EventCardCompactProps {
  event: {
    id: string;
    title: string;
    description?: string | null;
    location?: string | null;
    company?: string | null;
    starts_at: Timestamp;
    apply_url?: string | null;
  };
}

export const EventCardCompact = ({ event }: EventCardCompactProps) => {
  const startDate = event.starts_at.toDate();
  const day = startDate.getDate();
  const month = startDate.toLocaleDateString("en-GB", {
    month: "short",
  });
  const eyebrow = event.company || "Event";

  // Normalize description: replace <br> tags with newlines
  const normalizedDescription = event.description
    ? event.description.replace(/<br\s*\/?>/gi, "\n")
    : null;

  return (
    <div className="group flex-1 px-4 py-5 md:px-6 md:py-6">
      <div className="flex gap-4 items-start">
        {/* Date sidebar */}
        <div className="min-w-[3.5rem] text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/70">
            {month}
          </div>
          <div className="text-2xl font-semibold leading-none mt-1 text-[hsl(var(--section-light-foreground))]">
            {day}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-[hsl(var(--section-light-foreground))]/60 mb-1">
                {eyebrow}
              </div>
              <h3 className="text-base md:text-lg font-medium text-[hsl(var(--section-light-foreground))]">
                {event.title}
              </h3>
            </div>
            <ChevronDown
              className="h-4 w-4 mt-1 text-[hsl(var(--section-light-foreground))]/70 transition-transform duration-300 group-hover:rotate-180"
              aria-hidden="true"
            />
          </div>

          {/* Expandable details (hidden by default, shown on group hover) */}
          <div className="mt-3 overflow-hidden transition-all duration-300 max-h-0 opacity-0 group-hover:max-h-80 group-hover:opacity-100">
            <div className="space-y-2 text-sm text-[hsl(var(--section-light-foreground))]/70 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-900 scrollbar-track-transparent">
              {event.location && (
                <p className="text-xs uppercase tracking-[0.16em]">
                  {event.location}
                </p>
              )}
              {normalizedDescription && (
                <p className="leading-relaxed whitespace-pre-line">
                  {normalizedDescription}
                </p>
              )}
              <div className="pt-1">
                <Button
                  asChild
                  size="sm"
                  className="rounded-full px-4 py-1 text-xs font-medium bg-transparent border border-foreground/40 text-[hsl(var(--section-light-foreground))] hover:bg-foreground hover:text-background transition-colors"
                >
                  {event.apply_url ? (
                    <a href={event.apply_url} target="_blank" rel="noreferrer">
                      Sign up
                      <ArrowRight className="ml-1.5 h-3 w-3" />
                    </a>
                  ) : (
                    <Link to="/events">
                      Sign up
                      <ArrowRight className="ml-1.5 h-3 w-3" />
                    </Link>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
