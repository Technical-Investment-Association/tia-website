export type PartnershipKind = "corporate" | "student_club" | "university_club";

export type Partnership = {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  logo_url?: string | null;
  published: boolean;
  archived: boolean;
  kind?: PartnershipKind;
};
