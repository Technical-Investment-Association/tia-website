/**
 * EventCard.tsx
 *
 * Purpose: Event card for Events page
 *
 * Features:
 * - Clean horizontal layout with separator lines
 * - Logo display with max dimensions (maintains aspect ratio)
 * - Click-to-expand description (not hover)
 * - Scrollable description if too long
 * - Same fonts, colors, spacing as homepage
 *
 * Layout:
 * - 12-column grid
 * - Columns 1-2: Logo (max-width, max-height, aspect-ratio preserved)
 * - Columns 3-9: Content (company, title, metadata, description)
 * - Column 10-12: CTA button (if showSignup)
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, MapPin, ChevronDown } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string | null;
    short_description?: string | null;
    location?: string | null;
    company?: string | null;
    starts_at: Timestamp;
    ends_at?: Timestamp | null;
    image_url?: string | null;
    apply_url?: string | null;
  };
  showSignup?: boolean;
}

const formatDate = (ts: Timestamp): string => {
  const date = ts.toDate();
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (ts: Timestamp): string => {
  const date = ts.toDate();
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const EventCard = ({ event, showSignup = true }: EventCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize description: replace <br> tags with newlines
  const normalizedDescription = event.description
    ? event.description.replace(/<br\s*\/?>/gi, "\n")
    : null;

  return (
    <article className="border-b border-[hsl(var(--divider))]/40 last:border-b-0">
      {/* 12-column grid */}
      <div className="grid grid-cols-12 gap-6 py-8">
        {/* Logo column (2 cols) - max dimensions with aspect ratio preserved */}
        <div className="col-span-12 md:col-span-2 flex items-start justify-center">
          {event.image_url ? (
            <div className="w-full max-w-[160px] max-h-[160px] flex items-center justify-center">
              <img
                src={event.image_url}
                alt={`${event.title} logo`}
                loading="lazy"
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            </div>
          ) : (
            <div className="w-32 h-32 bg-[hsl(var(--divider))]/20" />
          )}
        </div>

        {/* Content column (7 cols) */}
        <div className="col-span-12 md:col-span-7">
          {/* Company tag */}
          {event.company && (
            <span className="inline-block text-sm font-medium text-[hsl(var(--section-light-foreground))]/60 mb-2 uppercase tracking-[0.16em]">
              {event.company}
            </span>
          )}

          {/* Event title */}
          <h3 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--section-light-foreground))] mb-3">
            {event.title}
          </h3>

          {/* Metadata row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[hsl(var(--section-light-foreground))]/70 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <time dateTime={event.starts_at.toDate().toISOString()}>
                {formatDate(event.starts_at)}
              </time>
            </div>
            {event.starts_at && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>{formatTime(event.starts_at)}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {/* Short description (always visible) */}
          {event.short_description && (
            <p className="text-base text-[hsl(var(--section-light-foreground))]/70 leading-relaxed mb-4">
              {event.short_description}
            </p>
          )}

          {/* Expandable full description */}
          {normalizedDescription && (
            <>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: isExpanded ? "400px" : "0px",
                }}
              >
                <div className="pb-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-900 scrollbar-track-transparent">
                  <p className="text-base text-[hsl(var(--section-light-foreground))]/70 leading-relaxed whitespace-pre-line">
                    {normalizedDescription}
                  </p>
                </div>
              </div>

              {/* Read more / Show less button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center text-sm font-medium text-[hsl(var(--section-light-foreground))]/70 hover:text-[hsl(var(--section-light-foreground))] transition-colors mt-2"
                aria-expanded={isExpanded}
              >
                {isExpanded ? "Show less" : "Read more"}
                <ArrowRight
                  className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
            </>
          )}
        </div>

        {/* CTA column (3 cols, desktop only) */}
        {showSignup && (
          <div className="hidden md:flex md:col-span-3 items-start justify-end">
            {event.apply_url ? (
              <a
                href={event.apply_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="rounded-full px-4 py-1 text-xs font-medium bg-transparent border border-foreground/40 text-[hsl(var(--section-light-foreground))] hover:bg-foreground hover:text-background transition-colors"
                >
                  Sign up
                </Button>
              </a>
            ) : (
              <Link to="/events">
                <Button
                  size="sm"
                  className="rounded-full px-4 py-1 text-xs font-medium bg-transparent border border-foreground/40 text-[hsl(var(--section-light-foreground))] hover:bg-foreground hover:text-background transition-colors"
                >
                  Details
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
