import { SectionConfig, SectionType } from "./types";

const uuid = () => crypto.randomUUID();

export const createDefaultSection = (
  type: SectionType,
  pageSlug: string
): SectionConfig => {
  const id = uuid();

  switch (type) {
    case "hero-light":
    case "hero-dark":
    case "hero-animated":
      return {
        id,
        type,
        contentPrefix: `${pageSlug}.hero.${id}`,
        titlePlaceholder: "Add hero title",
        subtitlePlaceholder: "Add hero subtitle/description",
      };

    case "text-light":
    case "text-dark":
      return {
        id,
        type,
        contentPrefix: `${pageSlug}.section.${id}`,
        titlePlaceholder: "Add section title",
        bodyPlaceholder: "Add section body text",
      };

    case "values-grid-light":
    case "values-grid-dark":
      return {
        id,
        type,
        contentPrefix: `${pageSlug}.values.${id}`,
        titlePlaceholder: "Add values section title",
        itemPlaceholders: [
          {
            title: "Core value 1 title",
            body: "Short description of core value 1.",
          },
          {
            title: "Core value 2 title",
            body: "Short description of core value 2.",
          },
        ],
      };

    // NEW: contact-section
    case "contact-section":
      return {
        id,
        type,
        contentPrefix: `${pageSlug}.contact.${id}`,
        titlePlaceholder: "Interested in partnering?",
        bodyPlaceholder:
          "Short description about how companies can collaborate with TIA.",
        buttonLabelPlaceholder: "Contact us",
        email: "", // admin sets this later
      };

    default:
      throw new Error(`Unknown section type: ${type}`);
  }
};
