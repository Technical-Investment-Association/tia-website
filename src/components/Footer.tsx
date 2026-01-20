import { Linkedin, Instagram, Mail } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[hsl(var(--section-dark))] text-[hsl(var(--popover-foreground))] border-t border-[hsl(var(--divider))]/40">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] items-start">
          {/* About */}
          <div className="space-y-4">
            <h3 className="font-serif text-[22px] font-normal tracking-tight text-[hsl(var(--popover-foreground))]">
              Technical Investment Association
            </h3>
            <p className="text-sm leading-relaxed text-[hsl(var(--popover-foreground))]/70 max-w-[480px]">
              Founded in 2025 by technically minded students at DTU, Technical
              Investment Association was created from a shared belief that
              finance should also have a natural home at a technical university.
            </p>
            <p className="text-sm leading-relaxed text-[hsl(var(--popover-foreground))]/70 max-w-[480px]">
              We work to bridge the gap between finance, technology and
              innovation by connecting students, companies and ideas.
            </p>
            <p className="text-sm leading-relaxed text-[hsl(var(--popover-foreground))]/70 max-w-[480px]">
              Through events and partnerships, we aim to foster a community
              where future engineers navigate capital markets, data and products
              with curiosity and responsibility.
            </p>
          </div>

          {/* Quicklinks */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--popover-foreground))]/75">
              Quicklinks
            </h4>
            <ul className="space-y-2 text-sm text-[hsl(var(--popover-foreground))]/70">
              <li>
                <a
                  href="/events"
                  className="hover:text-[hsl(var(--popover-foreground))] transition-colors"
                >
                  Events
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="hover:text-[hsl(var(--popover-foreground))] transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/partnerships"
                  className="hover:text-[hsl(var(--popover-foreground))] transition-colors"
                >
                  Partnerships
                </a>
              </li>
              <li>
                <a
                  href="/join"
                  className="hover:text-[hsl(var(--popover-foreground))] transition-colors"
                >
                  Join TIA
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--popover-foreground))]/75">
              Contact
            </h4>
            <div className="space-y-2">
              <a
                href="mailto:partnerships@tiaassociation.com"
                className="inline-flex items-center gap-2 text-sm text-[hsl(var(--popover-foreground))]/70 hover:text-[hsl(var(--popover-foreground))] transition-colors"
              >
                <Mail className="h-4 w-4" />
                partnerships@tiaassociation.com
              </a>
            </div>

            <div className="pt-4">
              <h5 className="text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--popover-foreground))]/60 mb-2">
                Follow
              </h5>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/company/technical-investment-association/about/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--popover-foreground))]/60 hover:text-[hsl(var(--popover-foreground))] transition-colors"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://www.instagram.com/tia_dtu?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--popover-foreground))]/60 hover:text-[hsl(var(--popover-foreground))] transition-colors"
                >
                  <Instagram size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-[hsl(var(--popover-foreground))]/60">
          <span>&copy; {year} Technical Investment Association</span>
          <a
            href="/privacy"
            className="hover:text-[hsl(var(--popover-foreground))] transition-colors"
          >
            Privacy policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
