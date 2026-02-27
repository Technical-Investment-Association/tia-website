import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionBackground = "default" | "light" | "cream" | "dark";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: SectionBackground;
}

const backgroundClassName: Record<SectionBackground, string> = {
  default: "",
  light: "bg-[hsl(var(--section-light))]",
  cream: "bg-section-cream",
  dark: "bg-[hsl(var(--section-dark))]",
};

/**
 * Section
 *
 * Controls vertical rhythm and an optional background colour.
 * Internally uses the existing `grid-outer` utility to keep spacing
 * consistent with other pages.
 */
export const Section = ({
  children,
  className,
  id,
  background = "default",
}: SectionProps) => {
  return (
    <section
      id={id}
      className={cn("grid-outer", backgroundClassName[background], className)}
    >
      {children}
    </section>
  );
};

