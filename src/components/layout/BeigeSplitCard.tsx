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
   * Optional call-to-action element (typically a Button wrapped in a Link or <a>).
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
    <div className="flex px-5 py-10 lg:items-center lg:px-10">
      <div className="flex flex-col gap-4 lg:mx-auto lg:w-[80%] text-left">
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

  const resolvedVisual =
    visual ||
    (animationColors && animationColors.length
      ? (
        <figure className="relative w-full h-full">
          <FinisherBackground
            className="finisher-header-card"
            backgroundColor={themeColors.sectionCream}
            particleColors={animationColors}
            count={6}
            particleSize={{ min: 260, max: 520, pulse: 0 }}
            speed={{
              x: { min: 0.1, max: 0.3 },
              y: { min: 0.1, max: 0.3 },
            }}
            opacity={{ center: 0.9, edge: 0 }}
            showDotOverlay={true}
          />
        </figure>
      )
      : null);

  const visualContent = (
    <div className="w-full h-full">
      {resolvedVisual}
    </div>
  );

  const left = textSide === "left" ? textContent : visualContent;
  const right = textSide === "left" ? visualContent : textContent;

  return (
    <div className="grid-inner">
      <div className="col-span-12">
        <div className={cn("bg-section-cream", className)}>
          <SplitLayout alignCenter left={left} right={right} />
        </div>
      </div>
    </div>
  );
};

