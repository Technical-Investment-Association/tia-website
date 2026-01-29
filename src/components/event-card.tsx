/**
 * event-card.tsx
 *
 * External signup behavior:
 * - If registration.type === "external" AND registration.external_url exists:
 *     show a "Sign up" button linking directly to that URL (new tab)
 * - Otherwise: no external sign-up button (your internal flows can be added later)
 */

import { useState, useMemo, useCallback } from "react";
import { ChevronDown, Clock } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

type RegistrationType = "none" | "external" | "email" | "single" | "team";

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
    registration?: {
      type: RegistrationType;
      external_url?: string | null;
    } | null;
  };
  showSignup?: boolean;
}

const getDateParts = (ts: Timestamp) => {
  const d = ts.toDate();
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("en-GB", { month: "short" }),
  };
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
  const prefersReducedMotion = useReducedMotion();

  const { day, month } = useMemo(
    () => getDateParts(event.starts_at),
    [event.starts_at],
  );

  const eyebrow = useMemo(() => event.company || "Event", [event.company]);

  const normalizedDescription = useMemo(() => {
    return event.description
      ? event.description.replace(/<br\s*\/?>/gi, "\n")
      : null;
  }, [event.description]);

  const formattedTime = useMemo(
    () => (event.starts_at ? formatTime(event.starts_at) : null),
    [event.starts_at],
  );

  const externalUrl = useMemo(() => {
    if (event.registration?.type !== "external") return null;
    return event.registration?.external_url?.trim() || null;
  }, [event.registration]);

  const hasDetails = !!(
    normalizedDescription ||
    event.location ||
    event.starts_at
  );

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const transitionDuration = prefersReducedMotion ? 0 : 300;

  return (
    <article className="border-y border-[hsl(var(--divider))]/40">
      <div className="grid grid-cols-12 gap-6 py-8">
        {/* LEFT HALF – logo + text */}
        <div className="col-span-12 md:col-span-6">
          <div className="flex gap-6 items-start">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 md:w-28 md:h-28">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={`${event.title} logo`}
                  loading="lazy"
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden" as const,
                  }}
                />
              ) : (
                <div className="w-full h-full bg-[hsl(var(--divider))]/20" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 max-w-full">
              <div className="text-xs uppercase tracking-[0.16em] text-[hsl(var(--section-light-foreground))]/60 mb-1">
                {eyebrow}
              </div>

              <h3 className="text-base md:text-lg font-medium text-[hsl(var(--section-light-foreground))] mb-1">
                {event.title}
              </h3>

              {hasDetails && (
                <>
                  <div
                    style={{
                      maxHeight: isExpanded ? "260px" : "0px",
                      opacity: isExpanded ? 1 : 0,
                      overflow: "hidden",
                      transition: prefersReducedMotion
                        ? "none"
                        : `max-height ${transitionDuration}ms ease-out, opacity ${
                            transitionDuration - 50
                          }ms ease-out`,
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden" as const,
                      willChange: isExpanded ? "max-height, opacity" : "auto",
                    }}
                  >
                    <div className="pt-3 pr-2 space-y-2 text-sm text-[hsl(var(--section-light-foreground))]/75 leading-relaxed max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-900 scrollbar-track-transparent">
                      {event.location && (
                        <p className="text-xs uppercase tracking-[0.16em]">
                          {event.location}
                        </p>
                      )}

                      {formattedTime && (
                        <p className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          <span>{formattedTime}</span>
                        </p>
                      )}

                      {normalizedDescription && (
                        <p className="text-sm whitespace-pre-line">
                          {normalizedDescription}
                        </p>
                      )}

                      {showSignup && externalUrl && (
                        <div className="pt-3">
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
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggle}
                    className="mt-3 inline-flex items-center text-xs md:text-sm font-medium text-[hsl(var(--section-light-foreground))]/70 hover:text-[hsl(var(--section-light-foreground))] transition-colors"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? "Show less" : "View more"}
                    <ChevronDown
                      className="ml-1 h-4 w-4"
                      style={{
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: prefersReducedMotion
                          ? "none"
                          : `transform ${transitionDuration}ms ease-out`,
                      }}
                      aria-hidden="true"
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT HALF – date */}
        <div className="col-span-12 md:col-span-6 flex md:items-center">
          <div className="text-left md:text-center min-w-[3.5rem]">
            <div className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/70">
              {month}
            </div>
            <div className="text-2xl font-semibold leading-none mt-1 text-[hsl(var(--section-light-foreground))]">
              {day}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
