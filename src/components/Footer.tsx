import { Linkedin, Instagram, Mail } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[hsl(var(--section-dark))] text-[hsl(var(--popover-foreground))] border-t border-[hsl(var(--divider))]/40">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
        {/* Top grid */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.2fr)] items-start">
          {/* About TIA */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">
              Technical Investment Association
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Founded in 2025 by technically minded students at DTU, Technical
              Investment Association was created from a shared belief that
              finance should also have a natural home at a technical university.
              We work to bridge the gap between finance, technology and
              innovation by connecting students, companies and ideas.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Through hands-on investing, events and partnerships, we aim to
              build a community where future engineers and economists learn to
              navigate capital markets, data and products with both curiosity
              and responsibility.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-[0.16em] text-[hsl(var(--popover-foreground))]/80">
              Quick links
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
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

          {/* Contact + social */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold mb-1 uppercase tracking-[0.16em] text-[hsl(var(--popover-foreground))]/80">
              Contact
            </h4>
            <p className="text-sm text-muted-foreground">
              For partnerships, events or general inquiries, reach out to us:
            </p>
            <a
              href="mailto:tecnicalinvestmentassociation@gmail.com"
              className="inline-flex items-center gap-2 text-sm hover:text-[hsl(var(--popover-foreground))] transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>tecnicalinvestmentassociation@gmail.com</span>
            </a>
            <a
              href="mailto:partnerships@tiaassociation.com"
              className="inline-flex items-center gap-2 text-sm hover:text-[hsl(var(--popover-foreground))] transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>partnerships@tiaassociation.com</span>
            </a>

            <div className="pt-4">
              <h5 className="text-xs font-semibold mb-2 uppercase tracking-[0.16em] text-[hsl(var(--popover-foreground))]/70">
                Follow
              </h5>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/company/technical-investment-association/about/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[hsl(var(--popover-foreground))] transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="https://www.instagram.com/tia_dtu?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[hsl(var(--popover-foreground))] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[hsl(var(--divider))]/40 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-muted-foreground">
          <p>
            &copy; {year} Technical Investment Association. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/privacy"
              className="hover:text-[hsl(var(--popover-foreground))] transition-colors"
            >
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
