/**
 * EventCardCompact.tsx
 *
 * External signup behavior:
 * - If registration.type === "external" AND registration.external_url exists:
 *     show a button linking directly to that URL (new tab)
 * - Otherwise, show a button linking to /events (fallback)
 */

import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Timestamp } from "firebase/firestore";

type RegistrationType = "none" | "external" | "email" | "single" | "team";

interface EventCardCompactProps {
  event: {
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
}

export const EventCardCompact = ({ event }: EventCardCompactProps) => {
  const startDate = event.starts_at.toDate();
  const day = startDate.getDate();
  const month = startDate.toLocaleDateString("en-GB", { month: "short" });
  const eyebrow = event.company || "Event";

  const normalizedDescription = event.description
    ? event.description.replace(/<br\s*\/?>/gi, "\n")
    : null;

  const externalUrl =
    event.registration?.type === "external"
      ? event.registration?.external_url?.trim() || null
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

          {/* Expandable details */}
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
                {externalUrl ? (
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full px-4 py-1 text-xs font-medium bg-transparent border border-foreground/40 text-[hsl(var(--section-light-foreground))] hover:bg-foreground hover:text-background transition-colors"
                  >
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Sign up
                      <ArrowRight className="ml-1.5 h-3 w-3" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full px-4 py-1 text-xs font-medium bg-transparent border border-foreground/40 text-[hsl(var(--section-light-foreground))] hover:bg-foreground hover:text-background transition-colors"
                  >
                    <Link to="/events">
                      View event
                      <ArrowRight className="ml-1.5 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
