/**
 * AdminEventCard.tsx
 *
 * Purpose: Event card for admin interface
 * Similar to EventCard but with admin controls
 *
 * Features:
 * - Same layout as public EventCard
 * - Edit button at bottom
 * - View Signups button (if registration enabled)
 * - Shows published/archived status
 * - Shows signup statistics
 */

import { useState } from "react";
import {
  Edit,
  Users,
  Calendar,
  Clock,
  MapPin,
  Eye,
  EyeOff,
  Archive,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";

interface AdminEventCardProps {
  event: {
    id: string;
    title: string;
    description?: string | null;
    location?: string | null;
    company?: string | null;
    starts_at: Timestamp;
    ends_at?: Timestamp | null;
    image_url?: string | null;
    published?: boolean;
    archived?: boolean;
    registration?: {
      type: "none" | "external" | "email" | "single" | "team";
      status?: string;
    };
    stats?: {
      total_signups?: number;
      total_participants?: number;
    };
    summary?: string | null;
    post_image_url?: string | null;
  };
  onEdit: () => void;
  onViewSignups: () => void;
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

export const AdminEventCard = ({
  event,
  onEdit,
  onViewSignups,
}: AdminEventCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewImage = event.post_image_url || event.image_url || null;

  const hasRegistration =
    event.registration && event.registration.type !== "none";
  const hasSignups = (event.stats?.total_signups ?? 0) > 0;

  // Normalize description
  const normalizedDescription = event.description
    ? event.description.replace(/<br\s*\/?>/gi, "\n")
    : null;

  const hasSummary = event.summary && event.summary.trim().length > 0;

  return (
    <article className="border-b border-[hsl(var(--divider))]/40 last:border-b-0">
      {/* 12-column grid */}
      <div className="grid grid-cols-12 gap-6 py-8">
        {/* Logo column (2 cols) */}
        <div className="col-span-12 md:col-span-2 flex items-start justify-center">
          <div className="col-span-12 md:col-span-2 flex items-start justify-center">
            {previewImage ? (
              <div className="w-full max-w-[160px] max-h-[160px] flex items-center justify-center">
                <img
                  src={previewImage}
                  alt={`${event.title} logo`}
                  loading="lazy"
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-[hsl(var(--divider))]/20 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-[hsl(var(--divider))]/40" />
              </div>
            )}
          </div>
        </div>

        {/* Content column (7 cols) */}
        <div className="col-span-12 md:col-span-7">
          {/* Status badges */}
          <div className="flex gap-2 mb-2">
            {!event.published && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                <EyeOff className="w-3 h-3" />
                Unpublished
              </span>
            )}
            {event.archived && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                <Archive className="w-3 h-3" />
                Archived
              </span>
            )}
            {event.published && !event.archived && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                <Eye className="w-3 h-3" />
                Published
              </span>
            )}
          </div>

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
            {hasRegistration && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>
                  {event.stats?.total_signups ?? 0} signups
                  {event.registration?.type === "team" &&
                    ` (${event.stats?.total_participants ?? 0} people)`}
                </span>
              </div>
            )}
          </div>

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
                  <div className="text-base text-[hsl(var(--section-light-foreground))]/70 leading-relaxed whitespace-pre-line">
                    {normalizedDescription}
                  </div>

                  {hasSummary && (
                    <div className="mt-2 text-sm text-[hsl(var(--section-light-foreground))]/75 leading-relaxed">
                      <span className="font-semibold">Summary: </span>
                      {event.summary}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-medium text-[hsl(var(--section-light-foreground))]/70 hover:text-[hsl(var(--section-light-foreground))] transition-colors mb-4"
                aria-expanded={isExpanded}
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            </>
          )}

          {/* Admin action buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              onClick={onEdit}
              size="sm"
              variant="outline"
              className="border-[hsl(var(--section-light-foreground))]/40 text-[hsl(var(--section-light-foreground))] hover:bg-[hsl(var(--section-light-foreground))]/10"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Event
            </Button>

            {hasRegistration && (
              <Button
                onClick={onViewSignups}
                size="sm"
                variant="outline"
                className="border-primary-700 text-primary-700 hover:bg-primary-50"
              >
                <Users className="w-4 h-4 mr-2" />
                View Signups {hasSignups && `(${event.stats?.total_signups})`}
              </Button>
            )}
          </div>
        </div>

        {/* Right column - Registration info (3 cols) */}
        <div className="hidden md:flex md:col-span-3 flex-col items-end justify-start gap-2">
          {hasRegistration && (
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-[hsl(var(--section-light-foreground))]/60 mb-1">
                Registration
              </div>
              <div className="text-sm font-medium text-[hsl(var(--section-light-foreground))]">
                {event.registration?.type === "single" && "Individual"}
                {event.registration?.type === "team" && "Team"}
                {event.registration?.type === "external" && "External"}
                {event.registration?.type === "email" && "Email"}
              </div>
              {event.registration?.status && (
                <div className="text-xs text-[hsl(var(--section-light-foreground))]/70 mt-1">
                  Status: {event.registration.status}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
