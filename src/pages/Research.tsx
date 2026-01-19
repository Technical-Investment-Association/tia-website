import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import ResearchCard, { ResearchItem } from "@/components/ui/research-card";

const Research = () => {
  const researchItems: ResearchItem[] = [
    {
      title: "Equity Research: Company A",
      date: "February 10, 2025",
      recommendation: "Buy",
      company: "Company A ASA",
      researchers: [
        { name: "Student One", role: "Lead Analyst" },
        { name: "Student Two", role: "Co-Analyst" },
      ],
      pdfUrl: "/research/company-a-equity-research.pdf",
    },
    {
      title: "Investment Thesis: Company B",
      date: "January 28, 2025",
      recommendation: "Hold",
      company: "Company B Group",
      researchers: [
        { name: "Student Three", role: "Lead Analyst" },
        { name: "Student Four", role: "Industry Specialist" },
      ],
      pdfUrl: "/research/company-b-investment-thesis.pdf",
    },
    {
      title: "Sector Overview: Nordic Tech",
      date: "December 15, 2024",
      recommendation: "Sector Overweight",
      company: "Nordic Tech Sector",
      researchers: [
        { name: "Student Five", role: "Sector Lead" },
        { name: "Student Six", role: "Quantitative Analyst" },
      ],
      pdfUrl: "/research/nordic-tech-sector-overview.pdf",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-4 bg-[hsl(var(--section-light))]">
        <div className="container mx-auto max-w-6xl">
          <Separator className="w-16 mb-8 bg-[hsl(var(--divider))]" />
          <h1 className="text-5xl font-bold mb-6 text-[hsl(var(--section-light-foreground))]">
            Research & Investment Theses
          </h1>
          <p className="text-xl text-[hsl(var(--section-light-foreground))]/70 mb-12 max-w-3xl">
            Explore research produced by TIA members, including equity research,
            sector overviews, and investment theses across public markets and
            private opportunities.
          </p>

          <div className="grid grid-cols-1 gap-6">
            {researchItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ResearchCard item={item} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Research;
