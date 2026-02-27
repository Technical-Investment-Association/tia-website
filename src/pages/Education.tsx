import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/Section";
import { db } from "@/lib/firebase/firebase";
import type {
  AnyResource,
  EducationResource,
  EduLevel,
  EduFormat,
  EduTopic,
} from "@/types/resource";
import { cn } from "@/lib/utils";

type State = {
  items: EducationResource[];
  loading: boolean;
  error: string | null;
};

function isEducationResource(r: AnyResource): r is EducationResource {
  return r.type === "education";
}

const levelLabel: Record<EduLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const formatLabel: Record<EduFormat, string> = {
  slides: "Slides",
  workshop: "Workshop",
  guide: "Guide",
  cheatsheet: "Cheat sheet",
  reading_list: "Reading list",
  template: "Template",
  other: "Other",
};

const topicLabel: Record<EduTopic, string> = {
  valuation: "Valuation",
  accounting: "Accounting",
  markets: "Markets",
  fixed_income: "Fixed income",
  fx: "FX",
  derivatives: "Derivatives",
  portfolio: "Portfolio",
  private_equity: "Private equity",
  consulting: "Consulting",
  investing: "Investing",
  excel: "Excel",
  python: "Python",
  other: "Other",
};

const previewHeightByFormat: Record<EduFormat, string> = {
  // Slides / workshops tend to be wider decks
  slides: "h-40 md:h-56",
  workshop: "h-40 md:h-56",
  // Guides, cheat sheets, templates are usually single pages
  guide: "h-56 md:h-72",
  cheatsheet: "h-56 md:h-72",
  template: "h-56 md:h-72",
  // Reading lists can be longer, give them a bit more
  reading_list: "h-64 md:h-80",
  // Fallback
  other: "h-48 md:h-64",
};

const EducationCard = ({ resource }: { resource: EducationResource }) => {
  const { edu } = resource;

  return (
    <Card className="p-6 md:p-8 bg-white border-[hsl(var(--divider))]">
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <div className="flex-1 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--section-light-foreground))]/60">
            {topicLabel[edu.topic]} · {formatLabel[edu.format]} ·{" "}
            {levelLabel[edu.level]}
          </p>
          <h2 className="text-xl md:text-2xl font-serif font-medium leading-tight text-[hsl(var(--section-light-foreground))]">
            {resource.title}
          </h2>
          <p className="text-sm md:text-base text-[hsl(var(--section-light-foreground))]/80 leading-relaxed">
            {resource.summary}
          </p>

          <div className="flex flex-wrap gap-3 text-xs text-[hsl(var(--section-light-foreground))]/70">
            <span>
              Year{" "}
              <span className="font-medium text-[hsl(var(--section-light-foreground))]">
                {resource.year}
              </span>
            </span>
            {edu.duration_minutes ? (
              <span>
                Duration{" "}
                <span className="font-medium text-[hsl(var(--section-light-foreground))]">
                  {edu.duration_minutes} min
                </span>
              </span>
            ) : null}
            {edu.presenter ? (
              <span>
                Presenter{" "}
                <span className="font-medium text-[hsl(var(--section-light-foreground))]">
                  {edu.presenter}
                </span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="md:w-1/3 flex flex-col gap-3">
          <div
            className={cn(
              "w-full border border-[hsl(var(--divider))] bg-muted/10 overflow-hidden",
              previewHeightByFormat[edu.format],
            )}
          >
            <iframe
              src={resource.file_url}
              title={resource.title}
              className="w-full h-full"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[hsl(var(--section-light-foreground))]/60">
              Preview (PDF)
            </p>
            <Button
              asChild
              size="sm"
              className={cn(
                "rounded-full px-4 py-1 text-xs font-medium",
                "bg-white text-black border border-[hsl(var(--divider))]/60",
                "hover:bg-primary hover:text-white",
              )}
            >
              <a
                href={resource.file_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open PDF
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Education = () => {
  const [state, setState] = useState<State>({
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, "resources"),
          orderBy("published_at", "desc"),
        );
        const snap = await getDocs(q);
        const all = snap.docs.map(
          (d) =>
            ({
              id: d.id,
              ...(d.data() as any),
            }) as AnyResource,
        );

        const edu = all.filter(
          (r) => isEducationResource(r) && r.published && !r.archived,
        ) as EducationResource[];

        setState({ items: edu, loading: false, error: null });
      } catch (err) {
        console.error(err);
        setState({
          items: [],
          loading: false,
          error: "Failed to load educational content.",
        });
      }
    };

    void load();
  }, []);

  const { items, loading, error } = state;

  const hasItems = items.length > 0;

  const latestYear = useMemo(
    () => (hasItems ? items[0]?.year : undefined),
    [hasItems, items],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <Hero
        title="Education"
        description="Structured learning materials created within TIA – slides, guides, workshops and templates to deepen your understanding of finance and technology."
        height={360}
      />

      <main className="bg-white">
        <Section>
          <div className="grid-inner">
            <div className="col-span-12 space-y-8 md:space-y-10">
              <div className="space-y-4 md:space-y-5">
                <Separator className="w-16 bg-[hsl(var(--divider))]" />
                <div className="space-y-3 md:space-y-4 max-w-2xl">
                  <h1 className="text-3xl md:text-4xl font-serif font-medium text-[hsl(var(--section-light-foreground))]">
                    Educational content from the community
                  </h1>
                  <p className="text-sm md:text-base text-[hsl(var(--section-light-foreground))]/75 leading-relaxed">
                    These materials are created by TIA members and collaborators
                    and are meant to be practical tools: case slides, workshop
                    decks, guides and reference sheets you can reuse when
                    preparing for events, internships or your own projects.
                  </p>
                  {latestYear && (
                    <p className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--section-light-foreground))]/60">
                      Latest updates · {latestYear}
                    </p>
                  )}
                </div>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-20">
                  <p className="text-sm text-[hsl(var(--section-light-foreground))]/70">
                    Loading educational content…
                  </p>
                </div>
              )}

              {error && !loading && (
                <div className="py-10">
                  <div className="p-4 border border-[hsl(var(--divider))]">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {!loading && !error && !hasItems && (
                <div className="py-16 border-t border-[hsl(var(--divider))]">
                  <p className="text-sm text-[hsl(var(--section-light-foreground))]/70">
                    No educational content has been published yet. Check back
                    after upcoming workshops or events.
                  </p>
                </div>
              )}

              {!loading && !error && hasItems && (
                <div className="space-y-6 md:space-y-8">
                  {items.map((resource) => (
                    <EducationCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default Education;

