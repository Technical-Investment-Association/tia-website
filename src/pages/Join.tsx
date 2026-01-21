// Temporary Join Page (Google Form redirect)
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Hero } from "@/components/ui/hero";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Join = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <Hero
        title="Join TIA"
        description="Become part of a community of technically minded students across finance and technology."
        height={400}
      />

      <main className="grid-outer bg-white">
        <section>
          <div className="grid-inner py-16 md:py-24">
            <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4 text-center space-y-6">
              <p className="text-base md:text-lg text-[hsl(var(--section-light-foreground))]/75 leading-relaxed">
                While our full membership form is being finalised, you can
                express interest in joining TIA through a short form. We will
                notify you when membership opens formally.
              </p>

              <Button
                asChild
                size="lg"
                className="
                  group rounded-full px-7 py-2 text-base font-medium
                  bg-white text-black border border-[hsl(var(--divider))]/60
                  hover:bg-primary hover:text-white hover:border-primary
                  transition-colors duration-200
                "
              >
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfdjqQXcTbdAB4WqCfq2vBo5yeGOIinAqqsVrv7vU-dsSiq8A/viewform?ref=join-invite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Express interest
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </Button>

              <p className="text-xs text-[hsl(var(--section-light-foreground))]/60 leading-relaxed mt-2">
                The form takes under a minute.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Join;
