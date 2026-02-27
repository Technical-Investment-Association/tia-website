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
 *   count={6}
 * />
 */

import { useEffect, useRef } from "react";
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
  count = 6,
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

  useEffect(() => {
    if (!window.FinisherHeader || !containerRef.current) return;

    try {
      instanceRef.current = new window.FinisherHeader({
        className,
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

    return () => {
      instanceRef.current?.destroy?.();
    };
  }, [
    className,
    backgroundColor,
    particleColors,
    count,
    particleSize,
    speed,
    opacity,
  ]);

  return (
    <div ref={containerRef} className={`relative h-full w-full ${className}`}>
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
