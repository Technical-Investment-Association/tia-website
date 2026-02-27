import type { ReactNode } from "react";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { cn } from "@/lib/utils";
import { FinisherBackground } from "@/components/ui/finisher-background";
import { themeColors } from "@/theme/tokens";

type BeigeSplitCardVariant = "standard" | "quote";

interface BeigeSplitCardProps {
  variant?: BeigeSplitCardVariant;
  /**
   * Small heading above the title (e.g. section label).
   */
  eyebrow?: string;
  /**
   * Main heading or quote text.
   */
  title: ReactNode;
  /**
   * Supporting body text (one or more paragraphs).
   */
  body?: ReactNode;
  /**
   * Optional call-to-action (link + arrow style, e.g. "Explore our events").
   * Renders below the body on the text side.
   */
  cta?: ReactNode;
  /**
   * Which side the text should appear on for desktop.
   * Default is "left" (text left, visual right).
   */
  textSide?: "left" | "right";
  /**
   * Visual element for the non-text side (e.g. FinisherBackground or an image).
   */
  visual?: ReactNode;
  /**
   * Optional built-in Finisher animation colours (3 recommended).
   * When provided and no `visual` is passed, the card renders
   * the animation automatically on the visual side.
   */
  animationColors?: string[];
  className?: string;
}

/**
 * BeigeSplitCard
 *
 * Two-column beige card used for “text + image/animation” sections.
 * - Background: section-cream
 * - Columns: built on top of SplitLayout (12‑col grid).
 *
 * Variants:
 * - "standard": eyebrow (optional), title, body, cta.
 * - "quote": larger title styling intended for quotes; body can be attribution.
 */
export const BeigeSplitCard = ({
  variant = "standard",
  eyebrow,
  title,
  body,
  cta,
  textSide = "left",
  visual,
  animationColors,
  className,
}: BeigeSplitCardProps) => {
  const textContent = (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 py-12 lg:px-10 lg:py-16">
      <div className="flex w-full max-w-xl flex-col items-center gap-4 text-center">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/60">
            {eyebrow}
          </p>
        )}

        {variant === "quote" ? (
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium leading-tight text-[hsl(var(--section-light-foreground))]">
            {title}
          </h2>
        ) : (
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium leading-tight text-[hsl(var(--section-light-foreground))]">
            {title}
          </h2>
        )}

        {body && (
          <div className="space-y-3 text-sm md:text-base text-[hsl(var(--section-light-foreground))]/80 leading-relaxed">
            {body}
          </div>
        )}

        {cta && <div className="mt-2">{cta}</div>}
      </div>
    </div>
  );

  const resolvedVisual = visual ? (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
        style={{ transform: "scale(1.15)" }}
      >
        {visual}
      </div>
    </div>
  ) : (
    animationColors &&
    animationColors.length ? (
      <div
        className="absolute inset-0"
        style={{ transform: "scale(1.15)", transformOrigin: "center center" }}
      >
        <FinisherBackground
          className="finisher-header-card absolute inset-0 h-full w-full"
          backgroundColor={themeColors.sectionCream}
          particleColors={animationColors.slice(0, 2)}
          count={2}
          particleSize={{ min: 260, max: 520, pulse: 0 }}
          speed={{
            x: { min: 0.1, max: 0.3 },
            y: { min: 0.1, max: 0.3 },
          }}
          opacity={{ center: 0.9, edge: 0 }}
          showDotOverlay={true}
        />
      </div>
    )
      : null
  );

  const visualContent = (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden">
      {resolvedVisual}
    </div>
  );

  const left = textSide === "left" ? textContent : visualContent;
  const right = textSide === "left" ? visualContent : textContent;

  return (
    <div className="grid-inner">
      <div className="col-span-12">
        <div className={cn("bg-section-cream", className)}>
          <SplitLayout noGap left={left} right={right} />
        </div>
      </div>
    </div>
  );
};

