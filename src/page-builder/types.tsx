// src/page-builder/types.ts

export type SectionType =
  | "hero-light"
  | "hero-dark"
  | "hero-animated"
  | "text-light"
  | "text-dark"
  | "values-grid-light"
  | "values-grid-dark"
  | "contact-section"; // ← NEW

export interface BaseSectionConfig {
  id: string;
  type: SectionType;
  contentPrefix: string;
}
export interface HeroSectionConfig extends BaseSectionConfig {
  type: "hero-light" | "hero-dark" | "hero-animated";
  titlePlaceholder: string;
  subtitlePlaceholder: string;
}

export interface TextSectionConfig extends BaseSectionConfig {
  type: "text-light" | "text-dark";
  titlePlaceholder: string;
  bodyPlaceholder: string;
}

export interface ValuesGridItemPlaceholder {
  title: string;
  body: string;
}

export interface ValuesGridSectionConfig extends BaseSectionConfig {
  type: "values-grid-light" | "values-grid-dark";
  titlePlaceholder: string;
  itemPlaceholders: ValuesGridItemPlaceholder[];
}

// NEW: contact section
export interface ContactSectionConfig extends BaseSectionConfig {
  type: "contact-section";
  titlePlaceholder: string;
  bodyPlaceholder: string;
  buttonLabelPlaceholder: string;
  email?: string | null; // stored config, edited only by admin
}

export type SectionConfig =
  | HeroSectionConfig
  | TextSectionConfig
  | ValuesGridSectionConfig
  | ContactSectionConfig;

export interface PageConfig {
  slug: string;
  sections: SectionConfig[];
}
