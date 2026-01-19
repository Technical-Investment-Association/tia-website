// src/pages/Admin.tsx
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-4 bg-[hsl(var(--section-light))]">
        <div className="container mx-auto max-w-5xl">
          <Separator className="w-16 mb-8 bg-[hsl(var(--divider))]" />

          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-3 text-[hsl(var(--section-light-foreground))]">
              Admin Panel
            </h1>
            <p className="text-[hsl(var(--section-light-foreground))]/70 max-w-2xl">
              Manage dynamic content for the Technical Investment Association —
              including events, news, and research reports. This area is intended
              only for authorized administrators.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Events */}
            <Card className="p-6 bg-white border-[hsl(var(--divider))]">
              <h2 className="text-xl font-semibold mb-2 text-[hsl(var(--section-light-foreground))]">
                Events
              </h2>
              <p className="text-sm mb-4 text-[hsl(var(--section-light-foreground))]/70">
                Create, edit, and remove upcoming events displayed on the public
                events page.
              </p>
              <Button asChild size="sm" className="w-full" variant="outline">
                <Link to="/admin/events">Open events admin</Link>
              </Button>
            </Card>

            {/* News */}
            <Card className="p-6 bg-white border-[hsl(var(--divider))]">
              <h2 className="text-xl font-semibold mb-2 text-[hsl(var(--section-light-foreground))]">
                News & Announcements
              </h2>
              <p className="text-sm mb-4 text-[hsl(var(--section-light-foreground))]/70">
                Publish short updates, announcements, and news items for members.
              </p>
              <Button asChild size="sm" className="w-full" variant="outline">
                <Link to="/admin/news">Open news admin</Link>
              </Button>
            </Card>

            {/* Research */}
            <Card className="p-6 bg-white border-[hsl(var(--divider))]">
              <h2 className="text-xl font-semibold mb-2 text-[hsl(var(--section-light-foreground))]">
                Research & Reports
              </h2>
              <p className="text-sm mb-4 text-[hsl(var(--section-light-foreground))]/70">
                Upload research reports, set recommendations, and manage analyst
                credits.
              </p>
              <Button asChild size="sm" className="w-full" variant="outline">
                <Link to="/admin/research">Open research admin</Link>
              </Button>
            </Card>

            {/* Members & Newsletter */}
            <Card className="p-6 bg-white border-[hsl(var(--divider))]">
              <h2 className="text-xl font-semibold mb-2 text-[hsl(var(--section-light-foreground))]">
                Members & Newsletter
              </h2>
              <p className="text-sm mb-4 text-[hsl(var(--section-light-foreground))]/70">
                View member signups and newsletter subscribers, and export data for communication
                and onboarding.
              </p>
              <Button asChild size="sm" className="w-full" variant="outline">
                <Link to="/admin/members">Open members overview</Link>
              </Button>
            </Card>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Admin;
