import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PageRenderer } from "@/page-builder/pageRenderer";
import {
  CorporatePartnershipLogoGrid,
  StudentClubPartnershipLogoGrid,
} from "@/components/PartnershipLogoGrid";

const Partnerships = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* CMS-driven content */}
      <PageRenderer pageSlug="partnerships" />

      {/* Dynamic logos */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Our Current Partners
          </h2>
          <p className="text-center text-muted-foreground mb-4">
            We collaborate with organizations at the intersection of finance and
            technology.
          </p>
          <CorporatePartnershipLogoGrid />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partnerships;
