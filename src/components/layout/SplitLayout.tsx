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
  className,
  leftClassName,
  rightClassName,
}: SplitLayoutProps) => {
  const baseLeftCols = "col-span-12 lg:col-span-5";
  const baseRightCols = "col-span-12 lg:col-span-5 lg:col-start-8";

  const leftCols = reverseOnDesktop ? baseRightCols : baseLeftCols;
  const rightCols = reverseOnDesktop ? baseLeftCols : baseRightCols;

  return (
    <div
      className={cn(
        "grid grid-cols-12 items-stretch gap-y-10",
        alignCenter && "lg:items-center",
        className,
      )}
    >
      <div className={cn(leftCols, leftClassName)}>{left}</div>
      <div className={cn(rightCols, rightClassName)}>{right}</div>
    </div>
  );
};

