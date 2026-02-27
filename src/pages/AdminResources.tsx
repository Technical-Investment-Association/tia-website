import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const AdminResources = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-neutral-600">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <Hero
        title="Manage Research & Education"
        description="Upload PDFs, manage metadata, and publish resources to the website."
        height={300}
        actions={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-primary-800 hover:bg-primary-900 text-white"
            >
              <Link to="/admin/research">Research</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/90">
              <Link to="/admin/education">Education</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/90">
              <Link to="/admin/insights">Insights</Link>
            </Button>
          </div>
        }
      />

      <main className="grid-outer bg-white">
        <section>
          <div className="grid-inner">
            <div className="col-span-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-14">
                <Card className="p-6 bg-white border-[hsl(var(--divider))]">
                  <h2 className="text-xl font-semibold mb-2 text-[hsl(var(--section-light-foreground))]">
                    Research
                  </h2>
                  <p className="text-sm mb-4 text-[hsl(var(--section-light-foreground))]/70">
                    Student research reports, theses, and investment memos
                    (PDF).
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="w-full"
                    variant="outline"
                  >
                    <Link to="/admin/research">Open research admin</Link>
                  </Button>
                </Card>

                <Card className="p-6 bg-white border-[hsl(var(--divider))]">
                  <h2 className="text-xl font-semibold mb-2 text-[hsl(var(--section-light-foreground))]">
                    Education
                  </h2>
                  <p className="text-sm mb-4 text-[hsl(var(--section-light-foreground))]/70">
                    Presentation decks, workshops, guides, and learning
                    materials (PDF).
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="w-full"
                    variant="outline"
                  >
                    <Link to="/admin/education">Open education admin</Link>
                  </Button>
                </Card>

                <Card className="p-6 bg-white border-[hsl(var(--divider))]">
                  <h2 className="text-xl font-semibold mb-2 text-[hsl(var(--section-light-foreground))]">
                    Insights
                  </h2>
                  <p className="text-sm mb-4 text-[hsl(var(--section-light-foreground))]/70">
                    Low-maintenance updates and partner/speaker perspectives
                    (PDF for now).
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="w-full"
                    variant="outline"
                  >
                    <Link to="/admin/insights">Open insights admin</Link>
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminResources;
