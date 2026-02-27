import { Timestamp } from "firebase/firestore";

export type ResourceType = "research" | "education" | "insight";

export type ResearchAssetClass =
  | "equity"
  | "fixed_income"
  | "macro"
  | "fx"
  | "commodities"
  | "crypto"
  | "multi_asset"
  | "other";

export type ResearchSector =
  | "financials"
  | "industrials"
  | "energy"
  | "technology"
  | "healthcare"
  | "consumer"
  | "real_estate"
  | "materials"
  | "telecom"
  | "utilities"
  | "other";

export type ResearchRegion =
  | "denmark"
  | "nordics"
  | "europe"
  | "us"
  | "global"
  | "other";

export type ResearchMethodology =
  | "dcf"
  | "comps"
  | "lbo"
  | "macroscenario"
  | "quant"
  | "credit"
  | "other";

export type EduLevel = "beginner" | "intermediate" | "advanced";

export type EduFormat =
  | "slides"
  | "workshop"
  | "guide"
  | "cheatsheet"
  | "reading_list"
  | "template"
  | "other";

export type EduTopic =
  | "valuation"
  | "accounting"
  | "markets"
  | "fixed_income"
  | "fx"
  | "derivatives"
  | "portfolio"
  | "private_equity"
  | "consulting"
  | "investing"
  | "excel"
  | "python"
  | "other";

export type InsightKind =
  | "partner_quote"
  | "speaker_takeaways"
  | "market_note"
  | "club_update"
  | "career_note"
  | "other";

export type ResourceDocBase = {
  id: string;

  type: ResourceType;

  title: string;
  summary: string;

  tags: string[]; // normalized (lowercase trimmed)
  year: number;

  published: boolean;
  archived: boolean;

  published_at: Timestamp;

  file_url: string;
  file_path: string;

  created_at?: Timestamp | null;
  updated_at?: Timestamp | null;
};

export type ResearchResource = ResourceDocBase & {
  type: "research";
  research: {
    authors: string[]; // required
    affiliation?: string | null;

    asset_class: ResearchAssetClass;
    sector: ResearchSector;
    region: ResearchRegion;

    ticker?: string | null;
    company_name?: string | null;

    methodology?: ResearchMethodology[]; // optional
  };
};

export type EducationResource = ResourceDocBase & {
  type: "education";
  edu: {
    level: EduLevel;
    format: EduFormat;
    topic: EduTopic;

    duration_minutes?: number | null;
    presenter?: string | null;
  };
};

export type InsightResource = ResourceDocBase & {
  type: "insight";
  insight: {
    kind: InsightKind;

    source_name?: string | null; // partner/speaker/company
    quote?: string | null;

    related_partner_id?: string | null;
    event_id?: string | null;
    location?: string | null;
  };
};

export type AnyResource =
  | ResearchResource
  | EducationResource
  | InsightResource;

// Strict option lists for selects
export const RESEARCH_ASSET_CLASSES: ResearchAssetClass[] = [
  "equity",
  "fixed_income",
  "macro",
  "fx",
  "commodities",
  "crypto",
  "multi_asset",
  "other",
];

export const RESEARCH_SECTORS: ResearchSector[] = [
  "financials",
  "industrials",
  "energy",
  "technology",
  "healthcare",
  "consumer",
  "real_estate",
  "materials",
  "telecom",
  "utilities",
  "other",
];

export const RESEARCH_REGIONS: ResearchRegion[] = [
  "denmark",
  "nordics",
  "europe",
  "us",
  "global",
  "other",
];

export const RESEARCH_METHODOLOGIES: ResearchMethodology[] = [
  "dcf",
  "comps",
  "lbo",
  "macroscenario",
  "quant",
  "credit",
  "other",
];

export const EDU_LEVELS: EduLevel[] = ["beginner", "intermediate", "advanced"];
export const EDU_FORMATS: EduFormat[] = [
  "slides",
  "workshop",
  "guide",
  "cheatsheet",
  "reading_list",
  "template",
  "other",
];

export const EDU_TOPICS: EduTopic[] = [
  "valuation",
  "accounting",
  "markets",
  "fixed_income",
  "fx",
  "derivatives",
  "portfolio",
  "private_equity",
  "consulting",
  "investing",
  "excel",
  "python",
  "other",
];

export const INSIGHT_KINDS: InsightKind[] = [
  "partner_quote",
  "speaker_takeaways",
  "market_note",
  "club_update",
  "career_note",
  "other",
];

export const MAX_TAGS = 8;
export const MAX_TAG_LEN = 24;

export const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50MB
