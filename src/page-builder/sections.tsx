// src/page-builder/sections.tsx
import EditableTextBlock from "@/components/ui/editable-text-block";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SectionConfig,
  HeroSectionConfig,
  TextSectionConfig,
  ValuesGridSectionConfig,
  ContactSectionConfig,
  SectionType,
} from "./types";
import { Hero } from "@/components/ui/hero";

type RenderSectionProps = {
  section: SectionConfig;
  isAdminView?: boolean;
  onChangeSection?: (section: SectionConfig) => void;
};

const KNOWN_TYPES: SectionType[] = [
  "hero-light",
  "hero-dark",
  "hero-animated",
  "text-light",
  "text-dark",
  "values-grid-light",
  "values-grid-dark",
  "contact-section",
];

const isKnownType = (type: any): type is SectionType =>
  KNOWN_TYPES.includes(type as SectionType);

export const renderSectionComponent = ({
  section,
  isAdminView,
  onChangeSection,
}: RenderSectionProps) => {
  if (!section || !isKnownType((section as any).type)) {
    return null;
  }

  switch (section.type) {
    case "hero-light":
    case "hero-dark":
      return <HeroSection key={section.id} config={section} />;

    case "hero-animated":
      return <AnimatedHeroSection key={section.id} config={section} />;

    case "text-light":
    case "text-dark":
      return <TextSection key={section.id} config={section} />;

    case "values-grid-light":
    case "values-grid-dark":
      return (
        <ValuesGridSection
          key={section.id}
          config={section}
          isAdminView={isAdminView}
          onChangeSection={onChangeSection}
        />
      );

    case "contact-section":
      return (
        <ContactSection
          key={section.id}
          config={section}
          isAdminView={isAdminView}
          onChangeSection={onChangeSection}
        />
      );

    default:
      return null;
  }
};

/* ---------------------- HERO SECTION ---------------------- */

const HeroSection = ({ config }: { config: HeroSectionConfig }) => {
  const isDark = config.type === "hero-dark";

  return (
    <section
      className={cn(
        "pt-32 pb-20 px-4",
        isDark ? "bg-background" : "bg-[hsl(var(--section-light))]"
      )}
    >
      <div className="container mx-auto max-w-4xl">
        <Separator className="w-16 mb-8 bg-[hsl(var(--divider))]" />

        <EditableTextBlock
          contentId={`${config.contentPrefix}.title`}
          defaultText={config.titlePlaceholder}
          as="h1"
          className={cn(
            "text-5xl font-bold mb-6",
            isDark
              ? "text-foreground"
              : "text-[hsl(var(--section-light-foreground))]"
          )}
          variant={isDark ? "dark" : "light"}
        />

        <EditableTextBlock
          contentId={`${config.contentPrefix}.subtitle`}
          defaultText={config.subtitlePlaceholder}
          as="p"
          className={cn(
            "text-xl max-w-3xl",
            isDark
              ? "text-muted-foreground"
              : "text-[hsl(var(--section-light-foreground))]/70"
          )}
          variant={isDark ? "dark" : "light"}
        />
      </div>
    </section>
  );
};
/* ---------------------- ANIMATED HERO SECTION ---------------------- */

const AnimatedHeroSection = ({ config }: { config: HeroSectionConfig }) => {
  // Animated hero always uses the dark animated background,
  // with white separator + white text on top of the FinisherHeader canvas.

  return (
    <Hero
      height={360} // visually similar height to hero-light/hero-dark
      showSeparator
      separatorClassName="bg-white"
      wrapTitle={false}
      wrapDescription={false}
      title={
        <EditableTextBlock
          contentId={`${config.contentPrefix}.title`}
          defaultText={config.titlePlaceholder}
          as="h1"
          className="text-5xl font-bold mb-6 text-white"
          variant="dark"
        />
      }
      description={
        <EditableTextBlock
          contentId={`${config.contentPrefix}.subtitle`}
          defaultText={config.subtitlePlaceholder}
          as="p"
          className="text-xl max-w-3xl mx-auto text-white/90"
          variant="dark"
        />
      }
    />
  );
};

/* ---------------------- TEXT SECTION ---------------------- */

const TextSection = ({ config }: { config: TextSectionConfig }) => {
  const isLight = config.type === "text-light";

  return (
    <section
      className={cn(
        "py-24 px-4",
        isLight ? "bg-[hsl(var(--section-light))]" : "bg-background"
      )}
    >
      <div className="container mx-auto max-w-4xl">
        <Separator className="w-16 mb-8 bg-[hsl(var(--divider))]" />

        <EditableTextBlock
          contentId={`${config.contentPrefix}.heading`}
          defaultText={config.titlePlaceholder}
          as="h2"
          className={cn(
            "text-4xl font-bold mb-8",
            isLight
              ? "text-[hsl(var(--section-light-foreground))]"
              : "text-foreground"
          )}
          variant={isLight ? "light" : "dark"}
        />

        <EditableTextBlock
          contentId={`${config.contentPrefix}.body`}
          defaultText={config.bodyPlaceholder}
          as="p"
          className={cn(
            "text-lg leading-relaxed",
            isLight
              ? "text-[hsl(var(--section-light-foreground))]/70"
              : "text-muted-foreground"
          )}
          variant={isLight ? "light" : "dark"}
        />
      </div>
    </section>
  );
};

/* ------------------- VALUES GRID SECTION ------------------- */

const ValuesGridSection = ({
  config,
  isAdminView,
  onChangeSection,
}: {
  config: ValuesGridSectionConfig;
  isAdminView?: boolean;
  onChangeSection?: (section: ValuesGridSectionConfig) => void;
}) => {
  const isDark = config.type === "values-grid-dark";
  const basePrefix = config.contentPrefix;

  const handleAddTwoValues = () => {
    if (!onChangeSection) return;

    const updated: ValuesGridSectionConfig = {
      ...config,
      itemPlaceholders: [
        ...config.itemPlaceholders,
        {
          title: "New core value title",
          body: "Add description for this core value.",
        },
        {
          title: "New core value title",
          body: "Add description for this core value.",
        },
      ],
    };

    onChangeSection(updated);
  };

  return (
    <section
      className={cn(
        "py-24 px-4",
        isDark ? "bg-background" : "bg-[hsl(var(--section-light))]"
      )}
    >
      <div className="container mx-auto max-w-4xl">
        <Separator className="w-16 mb-8 mx-auto bg-[hsl(var(--divider))]" />

        {/* Section heading */}
        <EditableTextBlock
          contentId={`${basePrefix}.heading`}
          defaultText={config.titlePlaceholder}
          as="h2"
          className={cn(
            "text-4xl font-bold mb-16 text-center",
            isDark
              ? "text-foreground"
              : "text-[hsl(var(--section-light-foreground))]"
          )}
          variant={isDark ? "dark" : "light"}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {config.itemPlaceholders.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Value title */}
              <EditableTextBlock
                contentId={`${basePrefix}.${index + 1}.title`}
                defaultText={item.title}
                as="h3"
                className={cn(
                  "text-xl font-semibold mb-3",
                  isDark
                    ? "text-foreground"
                    : "text-[hsl(var(--section-light-foreground))]"
                )}
                variant={isDark ? "dark" : "light"}
              />
              {/* Value body */}
              <EditableTextBlock
                contentId={`${basePrefix}.${index + 1}.body`}
                defaultText={item.body}
                as="p"
                className={cn(
                  "text-lg leading-relaxed",
                  isDark
                    ? "text-muted-foreground"
                    : "text-[hsl(var(--section-light-foreground))]/70"
                )}
                variant={isDark ? "dark" : "light"}
              />
            </motion.div>
          ))}
        </div>

        {isAdminView && onChangeSection && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleAddTwoValues}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              + Add 2 more values
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

/* -------------------- CONTACT SECTION -------------------- */

const ContactSection = ({
  config,
  isAdminView,
  onChangeSection,
}: {
  config: ContactSectionConfig;
  isAdminView?: boolean;
  onChangeSection?: (section: ContactSectionConfig) => void;
}) => {
  const basePrefix = config.contentPrefix;
  const email = config.email ?? "";

  const updateEmail = (newEmail: string) => {
    if (!onChangeSection) return;
    const updated: ContactSectionConfig = { ...config, email: newEmail };
    onChangeSection(updated);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    if (!email) {
      e.preventDefault();
    }
  };

  return (
    <section className="py-24 px-4 bg-[hsl(var(--section-light))]">
      <div className="container mx-auto max-w-2xl text-center">
        <Separator className="w-16 mb-8 mx-auto bg-[hsl(var(--divider))]" />

        <EditableTextBlock
          contentId={`${basePrefix}.title`}
          defaultText={config.titlePlaceholder}
          as="h2"
          className="text-4xl font-bold mb-4 text-[hsl(var(--section-light-foreground))]"
          variant="light"
        />

        <EditableTextBlock
          contentId={`${basePrefix}.body`}
          defaultText={config.bodyPlaceholder}
          as="p"
          className="text-lg text-[hsl(var(--section-light-foreground))]/70 mb-8"
          variant="light"
        />

        {/* Button */}
        <div className="flex flex-col items-center gap-3">
          <a
            href={email ? `mailto:${email}` : "#"}
            onClick={handleButtonClick}
            aria-disabled={!email}
          >
            <Button size="lg" disabled={!email}>
              <EditableTextBlock
                contentId={`${basePrefix}.buttonLabel`}
                defaultText={config.buttonLabelPlaceholder}
                as="span"
                className="font-medium"
                variant="dark"
              />
            </Button>
          </a>

          {isAdminView && (
            <div className="mt-4 w-full max-w-md text-left text-xs text-muted-foreground space-y-2">
              <div className="font-medium">
                Contact email (only visible to admins)
              </div>
              <Input
                type="email"
                placeholder="tia@example.com"
                value={email}
                onChange={(e) => updateEmail(e.target.value)}
                className="bg-background border-border"
              />
              <p>
                The button above will open the visitor&apos;s email client with
                a
                <code className="mx-1 px-1 py-0.5 rounded bg-muted text-[10px]">
                  mailto:
                </code>
                link to this address.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
