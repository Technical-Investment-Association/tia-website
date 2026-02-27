/**
 * Hero.tsx
 *
 * Reusable hero component with FinisherHeader animated background.
 *
 * Purpose:
 * - Displays a hero section with title, description, and optional action buttons
 * - Renders animated particle background using FinisherHeader library
 * - Content positioned in bottom 2/3 for better visual hierarchy
 * - Fully responsive and reusable across pages
 *
 * Dependencies:
 * - finisher-header.es5.min.js (loaded in index.html)
 * - Tailwind CSS for styling
 *
 * Usage (simple):
 * <Hero
 *   title="Welcome to TIA"
 *   description="Join our community"
 *   actions={<Button>Get Started</Button>}
 *   height={500}
 * />
 *
 * Usage (page-builder, with EditableTextBlock):
 * <Hero
 *   height={360}
 *   showSeparator
 *   wrapTitle={false}
 *   wrapDescription={false}
 *   title={<EditableTextBlock ... />}
 *   description={<EditableTextBlock ... />}
 * />
 */

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { themeColors } from "@/theme/tokens";

declare global {
  interface Window {
    FinisherHeader?: new (options: Record<string, unknown>) => {
      addParticles?: (count: number) => void;
      destroy?: () => void;
    };
  }
}

export type HeroProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  height?: number | string;

  /** Show a small horizontal line above the title */
  showSeparator?: boolean;
  /** Extra classes for the separator line (default: white line) */
  separatorClassName?: string;

  /**
   * If true (default), the component wraps `title` in an <h1>.
   * Set to false when you pass a full heading element (e.g. EditableTextBlock as="h1").
   */
  wrapTitle?: boolean;
  /**
   * If true (default), wraps `description` in a <p>.
   * Set to false when you pass your own <p> element.
   */
  wrapDescription?: boolean;
};

export function Hero({
  title,
  description,
  actions,
  height = 300,
  showSeparator = false,
  separatorClassName,
  wrapTitle = true,
  wrapDescription = true,
}: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Don't initialize twice
    if (initialized) return;

    const initFinisher = () => {
      if (!window.FinisherHeader) {
        console.warn(
          "[Hero] FinisherHeader not found on window. Make sure finisher-header.es5.min.js is loaded in index.html"
        );
        return false;
      }

      if (!containerRef.current) {
        console.warn("[Hero] Container ref not ready");
        return false;
      }

      try {
        new window.FinisherHeader({
          className: "finisher-header",
          count: 13,
          size: {
            min: 1300,
            max: 1500,
            pulse: 0,
          },
          speed: {
            x: { min: 0.3, max: 0.6 },
            y: { min: 0.3, max: 0.6 },
          },
          colors: {
            background: themeColors.sectionDark,
            particles: [themeColors.primaryDeep, themeColors.accentTeal],
          },
          blending: "overlay",
          opacity: {
            center: 0.6,
            edge: 0,
          },
          skew: 0,
          shapes: ["c"],
        });

        setInitialized(true);
        return true;
      } catch (error) {
        console.error("[Hero] Failed to initialize FinisherHeader:", error);
        return false;
      }
    };

    // Try immediately
    if (initFinisher()) return;

    // Poll if not ready
    const interval = setInterval(() => {
      if (initFinisher()) {
        clearInterval(interval);
      }
    }, 100);

    // Give up after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [initialized]);

  const resolvedHeight =
    typeof height === "number" ? `${height}px` : height ?? "300px";

  return (
    <section
      ref={containerRef}
      className="header finisher-header relative flex w-full items-end"
      style={{ width: "100%", height: resolvedHeight }}
    >
      {/* Gradient overlay for better text readability - darker at bottom */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Content - bottom-aligned with proper spacing */}
      <div className="relative z-10 w-full px-6 pb-12 pt-32 md:pb-16 md:pt-40 lg:px-10">
        {/* Centered wrapper for title/description/actions */}
        <div className="max-w-4xl mx-auto text-center">
          {showSeparator && (
            <div className="mb-6 flex justify-center">
              <div className={cn("h-px w-16 bg-white", separatorClassName)} />
            </div>
          )}

          {wrapTitle ? (
            <h1 className="mb-6 text-4xl font-serif font-light text-white md:text-5xl lg:text-6xl leading-tight tracking-tight">
              {title}
            </h1>
          ) : (
            title
          )}

          {description &&
            (wrapDescription ? (
              <p className="mb-8 text-lg text-white/90 md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed">
                {description}
              </p>
            ) : (
              description
            ))}

          {actions && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
