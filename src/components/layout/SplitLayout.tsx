import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
  /**
   * If true, the visual/text alignment is flipped on desktop:
   * left content moves to the right columns and vice versa.
   */
  reverseOnDesktop?: boolean;
  /**
   * Vertically center both columns on large screens.
   */
  alignCenter?: boolean;
  /**
   * If true, desktop uses a 50/50 split with no gap so content goes edge-to-edge
   * and meets in the middle (e.g. for full-bleed visuals).
   */
  noGap?: boolean;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
}

/**
 * SplitLayout
 *
 * 12‑column split layout used for “text + visual” sections.
 * - Mobile: stacks vertically (left first, then right).
 * - Desktop: left and right occupy 5 columns each, with a 2‑column gap.
 *
 * Default desktop columns:
 * - Left:  cols 1–5
 * - Right: cols 8–12
 */
export const SplitLayout = ({
  left,
  right,
  reverseOnDesktop = false,
  alignCenter = false,
  noGap = false,
  className,
  leftClassName,
  rightClassName,
}: SplitLayoutProps) => {
  const baseLeftCols = noGap
    ? "col-span-12 lg:col-span-6"
    : "col-span-12 lg:col-span-5";
  const baseRightCols = noGap
    ? "col-span-12 lg:col-span-6 lg:col-start-7"
    : "col-span-12 lg:col-span-5 lg:col-start-8";

  const leftCols = reverseOnDesktop ? baseRightCols : baseLeftCols;
  const rightCols = reverseOnDesktop ? baseLeftCols : baseRightCols;

  return (
    <div
      className={cn(
        "grid grid-cols-12 items-stretch gap-y-10",
        noGap && "lg:gap-x-0",
        alignCenter && "lg:items-center",
        className,
      )}
    >
      <div className={cn(leftCols, leftClassName)}>{left}</div>
      <div className={cn(rightCols, rightClassName)}>{right}</div>
    </div>
  );
};

