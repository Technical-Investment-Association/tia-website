/**
 * FinisherBackground.tsx
 *
 * Purpose: Reusable animated particle background using FinisherHeader library
 * Configurable colors, particle count, and speed
 *
 * Usage:
 * <FinisherBackground
 *   className="finisher-header-whatwedo"
 *   backgroundColor={themeColors.white}
 *   particleColors={[...defaultParticleColors]}
 *   count={4}
 * />
 *
 * Performance: Animation pauses when the tab is hidden or when the element
 * is off-screen (Intersection Observer) to reduce CPU/GPU load.
 */

import { useEffect, useRef, useId } from "react";
import { themeColors, defaultParticleColors } from "@/theme/tokens";

declare global {
  interface Window {
    FinisherHeader?: new (options: Record<string, unknown>) => {
      addParticles?: (count: number) => void;
      destroy?: () => void;
    };
  }
}

interface FinisherBackgroundProps {
  className?: string;
  backgroundColor?: string;
  particleColors?: string[];
  count?: number;
  particleSize?: { min: number; max: number; pulse: number };
  speed?: {
    x: { min: number; max: number };
    y: { min: number; max: number };
  };
  opacity?: { center: number; edge: number };
  showDotOverlay?: boolean;
}

export const FinisherBackground = ({
  className = "finisher-header-background",
  backgroundColor = themeColors.white,
  particleColors = [...defaultParticleColors],
  count = 4,
  particleSize = { min: 300, max: 600, pulse: 0 },
  speed = {
    x: { min: 0.1, max: 0.3 },
    y: { min: 0.1, max: 0.3 },
  },
  opacity = { center: 0.9, edge: 0 },
  showDotOverlay = true,
}: FinisherBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<{
    addParticles?: (count: number) => void;
    destroy?: () => void;
  }>();
  const uniqueClass = useId().replace(/:/g, "-");
  const resolvedClassName = `${className}-${uniqueClass}`.replace(/^--/, "");
  const inViewRef = useRef(false);
  const isVisibleRef = useRef(!document.hidden);

  useEffect(() => {
    if (!window.FinisherHeader || !containerRef.current) return;

    const runInit = () => {
      if (!containerRef.current) return;
      try {
        instanceRef.current = new window.FinisherHeader({
          className: resolvedClassName,
          count,
          size: particleSize,
          speed,
          colors: {
            background: backgroundColor,
            particles: particleColors,
          },
          opacity,
          blending: "overlay",
          shapes: ["c"],
        });
      } catch (err) {
        console.error("Failed to init FinisherHeader:", err);
      }
    };

    const destroy = () => {
      instanceRef.current?.destroy?.();
      instanceRef.current = undefined;
    };

    const maybeInit = () => {
      if (inViewRef.current && isVisibleRef.current) runInit();
    };

    const el = containerRef.current;

    // Only run when in viewport
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          maybeInit();
        } else {
          destroy();
        }
      },
      { rootMargin: "80px", threshold: 0 }
    );
    io.observe(el);

    // Pause when tab is hidden
    const onVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (document.hidden) {
        destroy();
      } else {
        maybeInit();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    if (!document.hidden) {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight + 80 && rect.bottom > -80;
      inViewRef.current = inView;
      if (inView) runInit();
    }

    let lastW = 0;
    let lastH = 0;
    const resizeObserver = new ResizeObserver(() => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (lastW && lastH && (w !== lastW || h !== lastH) && inViewRef.current && isVisibleRef.current) {
        destroy();
        runInit();
      }
      lastW = w;
      lastH = h;
    });
    resizeObserver.observe(el);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
      destroy();
    };
  }, [
    resolvedClassName,
    backgroundColor,
    particleColors,
    count,
    particleSize,
    speed,
    opacity,
  ]);

  return (
    <div ref={containerRef} className={`relative h-full w-full min-h-[280px] ${resolvedClassName}`}>
      {/* Optional dot overlay - creates hole/lace effect */}
      {showDotOverlay && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 1,
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0) 0, rgba(255,255,255,0) 3px, ${backgroundColor} 3px, ${backgroundColor} 100%)`,
            backgroundSize: "24px 24px",
            mixBlendMode: "normal",
          }}
        />
      )}
    </div>
  );
};
