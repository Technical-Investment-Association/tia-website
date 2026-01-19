// src/page-builder/pageRenderer.tsx
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Hero } from "@/components/ui/hero";

import {
  SectionConfig,
  HeroSectionConfig,
  TextSectionConfig,
  ValuesGridSectionConfig,
  ContactSectionConfig,
  SectionType,
} from "./types";
import { renderSectionComponent } from "./sections";
import { createDefaultSection } from "./createDefaults";

type PageRendererProps = {
  pageSlug: string;
};

const KNOWN_TYPES: SectionType[] = [
  "hero-light",
  "hero-dark",
  "text-light",
  "text-dark",
  "values-grid-light",
  "values-grid-dark",
  "contact-section", // ← add this
  "hero-animated", // ← add this
];

const sanitizeSections = (raw: any): SectionConfig[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s: any): s is SectionConfig => {
    return (
      s &&
      typeof s === "object" &&
      typeof s.type === "string" &&
      KNOWN_TYPES.includes(s.type as SectionType)
    );
  });
};

const SECTION_CHOICES: {
  type: SectionType;
  label: string;
  description: string;
}[] = [
  {
    type: "hero-dark",
    label: "Hero – dark",
    description: "Large page title and description on dark background.",
  },
  {
    type: "hero-light",
    label: "Hero – light",
    description: "Large page title and description on light background.",
  },
  {
    type: "hero-animated",
    label: "Hero – animated",
    description:
      "Animated dark hero with white title and subtitle on FinisherHeader background.",
  },
  {
    type: "text-light",
    label: "Text – light",
    description: "Section heading with body text on light background.",
  },
  {
    type: "text-dark",
    label: "Text – dark",
    description: "Section heading with body text on dark background.",
  },
  {
    type: "values-grid-light",
    label: "Values grid – light",
    description: "2-column grid of value cards on light background.",
  },
  {
    type: "values-grid-dark",
    label: "Values grid – dark",
    description: "2-column grid of value cards on dark background.",
  },
  {
    type: "contact-section",
    label: "Contact section",
    description:
      "Title, optional text and a button that opens an email to a chosen address.",
  },
];

export const PageRenderer = ({ pageSlug }: PageRendererProps) => {
  const { role, previewAsPublic } = useAuth();
  const isAdminView = role === "admin" && !previewAsPublic;

  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [hoverType, setHoverType] = useState<SectionType | null>(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null
  );

  // Load page config from Firestore (or create default)
  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "pages", pageSlug);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as PageConfig;
        const sanitized = sanitizeSections((data as any).sections);
        setSections(sanitized);

        // If we stripped anything invalid, persist the clean version
        if (
          Array.isArray((data as any).sections) &&
          sanitized.length !== (data as any).sections.length
        ) {
          await setDoc(
            ref,
            {
              sections: sanitized,
              updated_at: serverTimestamp(),
            },
            { merge: true }
          );
        }
      } else {
        // No config yet → create default layout for this page
        const initialSections = buildInitialSectionsForPage(pageSlug);
        const sanitized = sanitizeSections(initialSections);
        setSections(sanitized);

        await setDoc(
          ref,
          {
            slug: pageSlug,
            sections: sanitized,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setLoading(false);
    };

    load();
  }, [pageSlug]);

  const saveSections = async (newSections: SectionConfig[]) => {
    const sanitized = sanitizeSections(newSections);
    setSections(sanitized);

    const ref = doc(db, "pages", pageSlug);
    await setDoc(
      ref,
      {
        slug: pageSlug,
        sections: sanitized,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const copy = [...sections];
    const [removed] = copy.splice(index, 1);
    copy.splice(newIndex, 0, removed);
    saveSections(copy);
  };

  const askRemoveSection = (index: number) => {
    setPendingDeleteIndex(index);
  };

  const confirmRemoveSection = () => {
    if (pendingDeleteIndex === null) return;
    const copy = [...sections];
    copy.splice(pendingDeleteIndex, 1);
    saveSections(copy);
    setPendingDeleteIndex(null);
  };

  const addSection = (type: SectionType) => {
    const newSection = createDefaultSection(type, pageSlug);
    const updated = [...sections, newSection];
    saveSections(updated);
    setAddMenuOpen(false);
  };

  if (loading) return null;

  const activePreviewType =
    hoverType ?? SECTION_CHOICES[0]?.type ?? "hero-dark";

  return (
    <div>
      {sections.map((section, index) => (
        <div key={section.id ?? index} className="relative group">
          {renderSectionComponent({
            section,
            isAdminView,
            onChangeSection: (updated) => {
              const copy = [...sections];
              const idx = copy.findIndex((s) => s.id === updated.id);
              if (idx !== -1) {
                copy[idx] = updated;
                saveSections(copy);
              }
            },
          })}

          {isAdminView && (
            <div className="absolute right-4 top-4 z-40">
              <div className="flex gap-1 rounded-full bg-background/80 border border-border px-2 py-1 text-[11px] shadow-sm">
                <span className="mr-2 text-muted-foreground">
                  {section.type}
                </span>
                <button
                  onClick={() => moveSection(index, "up")}
                  className={cn(
                    "px-1 hover:text-foreground",
                    index === 0 && "opacity-30 pointer-events-none"
                  )}
                  aria-label="Move section up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSection(index, "down")}
                  className={cn(
                    "px-1 hover:text-foreground",
                    index === sections.length - 1 &&
                      "opacity-30 pointer-events-none"
                  )}
                  aria-label="Move section down"
                >
                  ↓
                </button>
                <button
                  onClick={() => askRemoveSection(index)}
                  className="px-1 text-red-500 hover:text-red-600"
                  aria-label="Remove section"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Floating Add Section button */}
      {isAdminView && (
        <>
          <button
            type="button"
            onClick={() => setAddMenuOpen(true)}
            className="fixed bottom-6 right-6 z-40 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-lg hover:bg-primary/90"
          >
            + Add section
          </button>

          {/* Side Add Section drawer */}
          {addMenuOpen && (
            <div className="fixed inset-0 z-50">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setAddMenuOpen(false)}
              />

              {/* Drawer */}
              <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-xl flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h2 className="text-sm font-semibold">Add section</h2>
                  <button
                    type="button"
                    onClick={() => setAddMenuOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row">
                  {/* Section list */}
                  <div className="md:w-1/2 border-b md:border-b-0 md:border-r border-border">
                    <ul className="divide-y divide-border text-sm">
                      {SECTION_CHOICES.map((choice) => (
                        <li key={choice.type}>
                          <button
                            type="button"
                            className={cn(
                              "w-full text-left px-4 py-3 hover:bg-muted",
                              activePreviewType === choice.type && "bg-muted"
                            )}
                            onMouseEnter={() => setHoverType(choice.type)}
                            onClick={() => addSection(choice.type)}
                          >
                            <div className="font-medium">{choice.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {choice.description}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Preview area */}
                  <div className="md:w-1/2 p-4 hidden md:block">
                    <div className="text-xs text-muted-foreground mb-2">
                      Preview
                    </div>
                    <div className="border border-dashed border-border rounded-lg overflow-hidden text-xs">
                      {renderSidebarPreview(activePreviewType)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete confirmation dialog */}
          {pendingDeleteIndex !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setPendingDeleteIndex(null)}
              />
              <div className="relative z-10 w-full max-w-sm rounded-lg bg-background border border-border p-6 shadow-xl">
                <h2 className="text-sm font-semibold mb-2">Remove section?</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  This action cannot be undone. The section and its layout will
                  be removed from this page. (The text itself stays in
                  Firestore, but the section will no longer be visible.)
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingDeleteIndex(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={confirmRemoveSection}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Default layout for any page without config:
 * 1) Dark hero (title + description)
 * 2) Light text section (title + body)
 */
const buildInitialSectionsForPage = (slug: string): SectionConfig[] => {
  const pageName = slug.charAt(0).toUpperCase() + slug.slice(1);

  const sections: SectionConfig[] = [];

  sections.push({
    id: crypto.randomUUID(),
    type: "hero-dark",
    contentPrefix: `${slug}.hero`,
    titlePlaceholder: `Add ${pageName} page title`,
    subtitlePlaceholder: `Add a short introduction for the ${pageName} page.`,
  });

  sections.push({
    id: crypto.randomUUID(),
    type: "text-light",
    contentPrefix: `${slug}.intro`,
    titlePlaceholder: "Add section title",
    bodyPlaceholder: "Add section text for this page.",
  });

  return sections;
};

function renderSidebarPreview(type: SectionType) {
  switch (type) {
    case "hero-dark":
      return (
        <div className="bg-background px-4 py-6">
          <div className="h-1 w-10 bg-[hsl(var(--divider))] mb-4" />
          <div className="h-4 w-3/4 bg-muted mb-2 rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>
      );
    case "hero-light":
      return (
        <div className="bg-[hsl(var(--section-light))] px-4 py-6">
          <div className="h-1 w-10 bg-[hsl(var(--divider))] mb-4" />
          <div className="h-4 w-3/4 bg-muted mb-2 rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>
      );
    case "hero-animated":
      return (
        <div className="bg-background px-4 py-6">
          <div className="h-1 w-10 bg-white mb-4 mx-auto" />
          <div className="h-4 w-3/4 bg-muted mb-2 rounded mx-auto" />
          <div className="h-3 w-2/3 bg-muted/80 rounded mx-auto" />
        </div>
      );
    case "text-light":
      return (
        <div className="bg-[hsl(var(--section-light))] px-4 py-4">
          <div className="h-4 w-1/2 bg-muted mb-3 rounded" />
          <div className="h-3 w-full bg-muted/70 mb-2 rounded" />
          <div className="h-3 w-5/6 bg-muted/70 rounded" />
        </div>
      );
    case "text-dark":
      return (
        <div className="bg-background px-4 py-4">
          <div className="h-4 w-1/2 bg-muted mb-3 rounded" />
          <div className="h-3 w-full bg-muted/70 mb-2 rounded" />
          <div className="h-3 w-5/6 bg-muted/70 rounded" />
        </div>
      );
    case "values-grid-light":
      return (
        <div className="bg-[hsl(var(--section-light))] px-4 py-4">
          <div className="h-4 w-2/3 bg-muted mb-4 rounded mx-auto" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 bg-muted/70 rounded" />
            <div className="h-16 bg-muted/70 rounded" />
            <div className="h-16 bg-muted/70 rounded" />
            <div className="h-16 bg-muted/70 rounded" />
          </div>
        </div>
      );
    case "values-grid-dark":
      return (
        <div className="bg-background px-4 py-4">
          <div className="h-4 w-2/3 bg-muted mb-4 rounded mx-auto" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 bg-muted/70 rounded" />
            <div className="h-16 bg-muted/70 rounded" />
            <div className="h-16 bg-muted/70 rounded" />
            <div className="h-16 bg-muted/70 rounded" />
          </div>
        </div>
      );
    case "contact-section":
      return (
        <div className="bg-[hsl(var(--section-light))] px-4 py-4">
          <div className="h-4 w-1/2 bg-muted mb-3 rounded mx-auto" />
          <div className="h-3 w-5/6 bg-muted/70 mb-3 rounded mx-auto" />
          <div className="h-8 w-24 bg-muted mx-auto rounded" />
        </div>
      );
    default:
      return null;
  }
}
