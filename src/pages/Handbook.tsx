import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLocation, Link } from "react-router-dom";

type SectionId =
  | "introduction"
  | "architecture"
  | "auth-security"
  | "cms"
  | "admin"
  | "design-system"
  | "deployment"
  | "next-steps";

type Section = {
  id: SectionId;
  label: string;
  description: string;
};

const sections: Section[] = [
  {
    id: "introduction",
    label: "1. Introduction",
    description: "Purpose of the handbook and a high-level overview of the TIA website.",
  },
  {
    id: "architecture",
    label: "2. Architecture & Data Model",
    description: "How the frontend, backend and data are structured.",
  },
  {
    id: "auth-security",
    label: "3. Authentication & Security",
    description: "Admin roles, Firestore rules, and access control.",
  },
  {
    id: "cms",
    label: "4. CMS & Static Content",
    description: "Editable text blocks, static_content and admin preview mode.",
  },
  {
    id: "admin",
    label: "5. Admin Interfaces & Dynamic Content",
    description: "How admins manage events, members, news, and more.",
  },
  {
    id: "design-system",
    label: "6. Styling & Design System",
    description: "Colors, typography, and how to keep things consistent.",
  },
  {
    id: "deployment",
    label: "7. Deployment & Git Workflow",
    description: "How we deploy with Vercel and work in Git.",
  },
  {
    id: "next-steps",
    label: "8. Roadmap & Next Steps",
    description: "Planned improvements and suggested future work.",
  },
];

function useCurrentSectionId(): SectionId {
  const location = useLocation();
  const parts = location.pathname.split("/"); // ["", "handbook", "architecture?"]
  const slug = parts[2] || "";
  if (!slug) return "introduction";

  const match = sections.find((s) => s.id === slug);
  return match ? match.id : "introduction";
}

const Handbook = () => {
  const currentId = useCurrentSectionId();
  const currentSection = sections.find((s) => s.id === currentId) ?? sections[0];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 border border-border rounded-lg bg-card p-4">
              <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
                Handbook
              </h2>
              <nav className="space-y-1 text-sm">
                {sections.map((section) => {
                  const active = section.id === currentId;
                  const to = section.id === "introduction" ? "/handbook" : `/handbook/${section.id}`;
                  return (
                    <Link
                      key={section.id}
                      to={to}
                      className={`block rounded-md px-2 py-1.5 ${
                        active
                          ? "bg-[hsl(var(--section-light))] text-[hsl(var(--section-light-foreground))] font-medium"
                          : "text-muted-foreground hover:bg-[hsl(var(--section-light))]/60 hover:text-foreground"
                      }`}
                    >
                      {section.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <section className="flex-1 max-w-3xl">
            <header className="mb-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                TIA Website – Internal Handbook
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold mb-2">
                {currentSection.label.replace(/^\d+\.\s*/, "")}
              </h1>
              <p className="text-sm text-muted-foreground">{currentSection.description}</p>
            </header>

            <div className="prose prose-invert max-w-none text-sm leading-relaxed">
              {currentId === "introduction" && <Introduction />}
              {currentId === "architecture" && <Architecture />}
              {currentId === "auth-security" && <AuthSecurity />}
              {currentId === "cms" && <CMS />}
              {currentId === "admin" && <AdminInterfaces />}
              {currentId === "design-system" && <DesignSystem />}
              {currentId === "deployment" && <Deployment />}
              {currentId === "next-steps" && <NextSteps />}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

/* 1. Introduction */
const Introduction = () => (
  <>
    <p>
      This handbook is for developers, admins, and future board members working on the Technical
      Investment Association (TIA) website. It explains how the system is built, how content is
      managed, and how to work safely with Firebase, Git, and deployments.
    </p>
    <p>
      The goal is that anyone reasonably familiar with programming and web basics can take over the
      site, extend it, and keep it secure – without having to reverse-engineer everything from
      scratch.
    </p>
    <h3>High-level stack</h3>
    <ul>
      <li>Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion.</li>
      <li>Backend: Firebase Auth, Firestore, Firebase Storage.</li>
      <li>Hosting: Vercel for the frontend; Firebase as backend services.</li>
      <li>Routing: React Router with public and admin-only routes.</li>
    </ul>
    <h3>Two key ideas</h3>
    <ul>
      <li>
        <strong>Admins manage content</strong> via Firestore + admin pages (events, news, members,
        research, static text).
      </li>
      <li>
        <strong>Security is enforced server-side</strong> by Firestore / Storage rules using role
        documents in the <code>users</code> collection.
      </li>
    </ul>
  </>
);

/* 2. Architecture & Data Model */
const Architecture = () => (
  <>
    <h3>Frontend architecture</h3>
    <ul>
      <li>The app is a single-page React application built with Vite.</li>
      <li>Routing is handled by <code>react-router-dom</code> (public + admin routes).</li>
      <li>
        Most pages live under <code>src/pages</code>, and shared UI components under{" "}
        <code>src/components</code> and <code>src/components/ui</code>.
      </li>
      <li>
        Firebase is initialised once in <code>src/lib/firebase/firebase.ts</code> and imported where needed
        (Auth, Firestore, Storage).
      </li>
    </ul>

    <h3>Data model: main collections</h3>
    <ul>
      <li>
        <code>events</code> – workshops, talks, case nights; fields include:
        <ul>
          <li>
            <code>title</code>, <code>starts_at</code>, <code>ends_at</code>,{" "}
            <code>location</code>, <code>description</code>, <code>short_description</code>,{" "}
            <code>apply_url</code>, <code>company</code>, <code>published</code>,{" "}
            <code>reg_status</code>, etc.
          </li>
        </ul>
      </li>
      <li>
        <code>news</code> – updates about TIA; fields such as <code>header</code>,{" "}
        <code>text</code>, <code>summary</code>, <code>date</code>, <code>imageUrl</code>.
      </li>
      <li>
        <code>members</code> – people shown on the website; <code>name</code>, <code>title</code>,{" "}
        <code>publish</code>, plus optional <code>email</code>, <code>linkedin</code>,{" "}
        <code>imageUrl</code>.
      </li>
      <li>
        <code>member_signups</code> – submissions from the join form on the site (internal only).
      </li>
      <li>
        <code>newsletter_signups</code> – email addresses collected for newsletters.
      </li>
      <li>
        <code>static_content</code> – CMS text blocks used by the editable text system.
      </li>
      <li>
        <code>users</code> – role information for authenticated users (e.g. <code>role: "admin"</code>).
      </li>
    </ul>

    <h3>Request flow</h3>
    <ul>
      <li>Browser loads the React app from Vercel.</li>
      <li>Public pages read from Firestore (events, news, members) with read-only rules.</li>
      <li>Admins sign in via Firebase Auth, which sets <code>request.auth</code> in rules.</li>
      <li>
        When an admin uses the admin pages, writes go to Firestore (and Storage) and are checked by
        security rules.
      </li>
    </ul>
  </>
);

/* 3. Authentication & Security */
const AuthSecurity = () => (
  <>
    <h3>Firebase Auth</h3>
    <ul>
      <li>Admins log in with email/password via the route <code>/admin/login</code>.</li>
      <li>
        The React app uses a shared <code>AuthContext</code> to:
        <ul>
          <li>Listen to Firebase Auth state changes.</li>
          <li>Fetch the corresponding <code>users/{`{uid}`}</code> document.</li>
          <li>Expose <code>user</code>, <code>role</code>, and <code>loading</code> to the app.</li>
        </ul>
      </li>
      <li>
        Roles are currently simple: <code>role: "admin"</code> for administrators, otherwise{" "}
        <code>role</code> is null/unknown.
      </li>
    </ul>

    <h3>Admin protection in the frontend</h3>
    <ul>
      <li>
        Admin routes (e.g. <code>/admin</code>, <code>/admin/events</code>,{" "}
        <code>/admin/content</code>) are wrapped in a <code>&lt;RequireAdmin&gt;</code> component.
      </li>
      <li>
        <code>RequireAdmin</code> checks:
        <ul>
          <li>Is auth done loading?</li>
          <li>Is there a <code>user</code>?</li>
          <li>Is <code>role === "admin"</code>?</li>
        </ul>
      </li>
      <li>
        If any check fails, the user is redirected to <code>/admin/login</code>.
      </li>
    </ul>

    <h3>Firestore rules and roles</h3>
    <p>
      Firestore rules define helpers like <code>isSignedIn()</code> and <code>isAdmin()</code>:
    </p>
    <ul>
      <li>
        <code>isSignedIn()</code> – checks that <code>request.auth != null</code>.
      </li>
      <li>
        <code>isAdmin()</code> – checks that there is a{" "}
        <code>users/{`{request.auth.uid}`}</code> document with <code>role == "admin"</code>.
      </li>
    </ul>
    <p>Collections follow a consistent pattern:</p>
    <ul>
      <li>
        Public read (for published data) – e.g. <code>events</code>, <code>news</code>, published{" "}
        <code>members</code>.
      </li>
      <li>
        Admin-only write (create / update / delete) with validation functions like{" "}
        <code>isValidEvent</code>, <code>isValidNews</code>, <code>isValidMember</code>.
      </li>
      <li>
        Sensitive collections like <code>member_signups</code> and{" "}
        <code>newsletter_signups</code> are readable only by admins.
      </li>
    </ul>

    <h3>Users collection</h3>
    <ul>
      <li>
        The <code>users</code> collection is the source of truth for admin roles.
      </li>
      <li>
        The first admin is created manually in the Firebase console:
        <ul>
          <li>Create a user in Auth.</li>
          <li>
            Create <code>users/{`{uid}`}</code> with <code>role: "admin"</code>.
          </li>
        </ul>
      </li>
      <li>Later, admin role changes can be exposed via an admin UI if needed.</li>
    </ul>
  </>
);

/* 4. CMS & Static Content */
const CMS = () => (
  <>
    <h3>Goal: content without redeploys</h3>
    <p>
      The site uses a light CMS-style system for managing static text (headings, paragraphs,
      descriptions) without touching code. Admins can edit text directly on the page or through an
      admin content overview.
    </p>

    <h3>Data model: static_content</h3>
    <ul>
      <li>
        Collection: <code>static_content</code>
      </li>
      <li>
        Document ID: semantic keys like <code>about.hero.title</code>,{" "}
        <code>index.hero.subtitle</code>, <code>events.hero.description</code>.
      </li>
      <li>
        Typical fields:
        <ul>
          <li>
            <code>text: string</code>
          </li>
          <li>
            <code>updated_at: timestamp</code> (optional)
          </li>
          <li>
            <code>updated_by: string (uid)</code> (optional)
          </li>
        </ul>
      </li>
    </ul>

    <h3>EditableTextBlock component</h3>
    <p>
      Static text on the site is wired through an <code>EditableTextBlock</code> component. It
      accepts:
    </p>
    <ul>
      <li>
        <code>contentId</code> – key in <code>static_content</code>.
      </li>
      <li>
        <code>defaultText</code> – guidance text only visible for admins (placeholder or “what
        should go here”).
      </li>
      <li>
        <code>as</code> – which HTML tag to render (<code>p</code>, <code>h1</code>, etc.).
      </li>
      <li>
        <code>editByDefault</code> – for pages under heavy editing (like the About page).
      </li>
      <li>
        Visual variant handling for light/dark backgrounds.
      </li>
    </ul>

    <h3>Behaviour by role</h3>
    <ul>
      <li>
        <strong>Public visitor:</strong> sees only the saved <code>text</code> if present. If empty,
        nothing is shown (no placeholder leaks).
      </li>
      <li>
        <strong>Admin (normal mode):</strong>
        <ul>
          <li>Sees current text plus an “Edit text” button.</li>
          <li>Can open inline textarea, change and save content.</li>
          <li>
            <code>defaultText</code> is used as placeholder / instructions but never shown to normal
            visitors.
          </li>
        </ul>
      </li>
      <li>
        <strong>Admin (preview mode):</strong> sees the page exactly as a visitor, with no edit
        controls or placeholders.
      </li>
    </ul>

    <h3>Admin static content page</h3>
    <p>
      The <code>/admin/content</code> page lists all <code>static_content</code> entries, allowing
      admins to:
    </p>
    <ul>
      <li>See all keys and texts in one place.</li>
      <li>Quick-edit text blocks without navigating through the site.</li>
      <li>Inspect updated timestamps and potentially who last changed them.</li>
    </ul>
  </>
);

/* 5. Admin Interfaces & Dynamic Content */
const AdminInterfaces = () => (
  <>
    <h3>Admin navigation</h3>
    <ul>
      <li>
        When logged in as admin, the main navigation shows an <strong>Admin section</strong> with
        links such as:
        <ul>
          <li>Dashboard (<code>/admin</code>)</li>
          <li>Events (<code>/admin/events</code>)</li>
          <li>News (<code>/admin/news</code>, if implemented)</li>
          <li>Members (<code>/admin/members</code>)</li>
          <li>Static text (<code>/admin/content</code>)</li>
        </ul>
      </li>
      <li>A “Preview as visitor / Exit preview” toggle.</li>
      <li>A “Sign Out” button that calls <code>signOut(auth)</code>.</li>
    </ul>

    <h3>Events admin</h3>
    <ul>
      <li>
        The events admin page lets admins create and edit events in the <code>events</code>{" "}
        collection.
      </li>
      <li>
        Events are displayed publicly on the Events page as:
        <ul>
          <li>“Upcoming events” – based on <code>starts_at</code> in the future.</li>
          <li>“Previous events” – <code>starts_at</code> in the past, often without apply buttons.</li>
        </ul>
      </li>
      <li>
        Optional fields like <code>short_description</code> are used for summaries, with “More”
        toggles revealing the full <code>description</code>.
      </li>
    </ul>

    <h3>Members and newsletter admin</h3>
    <ul>
      <li>
        Member applications from the Join page go into <code>member_signups</code>, which admins can
        review on a dedicated admin page.
      </li>
      <li>
        Newsletter signups from the homepage are stored in <code>newsletter_signups</code>, also
        available via an admin view for exporting.
      </li>
      <li>
        Publicly presented members are stored in <code>members</code> with a <code>publish</code>{" "}
        flag to control visibility.
      </li>
    </ul>

    <h3>Research and other content</h3>
    <ul>
      <li>
        Research pages are designed to show investment theses with:
        <ul>
          <li>Title, date, recommendation, company.</li>
          <li>List of researchers + roles.</li>
          <li>Preview of a PDF report (stored in Storage).</li>
        </ul>
      </li>
      <li>
        An admin page for research can manage metadata and link uploaded PDFs.</li>
    </ul>
  </>
);

/* 6. Styling & Design System */
const DesignSystem = () => (
  <>
    <h3>Design tokens</h3>
    <p>
      The design system is defined in <code>index.css</code> using CSS variables (HSL) and Tailwind
      layers. Important tokens:
    </p>
    <ul>
      <li><code>--background</code>, <code>--foreground</code> – base dark theme colors.</li>
      <li><code>--section-light</code>, <code>--section-light-foreground</code> – for light sections.</li>
      <li><code>--card</code>, <code>--card-foreground</code> – surfaces for cards.</li>
      <li><code>--accent</code>, <code>--primary</code>, <code>--muted</code> – accent and muted colors.</li>
      <li><code>--divider</code>, <code>--border</code> – borders and separators.</li>
      <li><code>--radius</code> – base rounding for components.</li>
    </ul>

    <h3>Base typography</h3>
    <ul>
      <li>Body font is a modern sans-serif, applied globally.</li>
      <li>Headings use a consistent scale (h1–h3 set via Tailwind utilities in base layer).</li>
      <li>
        Tailwind utility classes are used for spacing, layout and responsive behaviour rather than
        custom CSS per component.
      </li>
    </ul>

    <h3>Light vs dark sections</h3>
    <p>
      The site primarily uses a dark theme, but many sections (especially content-heavy ones) use a
      light background for readability.
    </p>
    <ul>
      <li>
        Dark sections use <code>bg-background</code>, <code>text-foreground</code>.
      </li>
      <li>
        Light sections use <code>--section-light</code> + <code>--section-light-foreground</code> for
        base text.
      </li>
      <li>
        Components that need special handling (like <code>EditableTextBlock</code> textareas) have
        simple internal variants for light/dark surfaces.
      </li>
    </ul>

    <h3>Goal</h3>
    <p>
      The long-term goal is to rely more on semantic helpers (e.g. <code>.section-light</code>,{" "}
      <code>.section-dark</code>) and simple component variants instead of ad-hoc color overrides.
      This keeps the UI consistent and easier to maintain.
    </p>
  </>
);

/* 7. Deployment & Git Workflow */
const Deployment = () => (
  <>
    <h3>Hosting and deployment</h3>
    <ul>
      <li>The React app is hosted on Vercel.</li>
      <li>Firebase is used purely as backend services (Auth, Firestore, Storage).</li>
      <li>
        Environment variables (Firebase config, etc.) are set both in{" "}
        <code>.env.local</code> for local dev and in Vercel project settings for production.
      </li>
    </ul>

    <h3>Git workflow</h3>
    <ul>
      <li>
        Recommended: keep <code>main</code> as the production branch and avoid direct pushes except
        for urgent fixes.
      </li>
      <li>Create feature branches for changes and open pull requests.</li>
      <li>Use Vercel preview deployments to review changes before merging.</li>
    </ul>

    <h3>When deploying</h3>
    <ul>
      <li>Ensure Firebase rules are in sync with the code (especially new collections/fields).</li>
      <li>Verify new admin features are protected by <code>RequireAdmin</code> and rules.</li>
      <li>Smoke test the site in production: login, events listing, and key content pages.</li>
    </ul>
  </>
);

/* 8. Roadmap & Next Steps */
const NextSteps = () => (
  <>
    <h3>Design system & components</h3>
    <ul>
      <li>
        Introduce simple semantic helpers in CSS (e.g. <code>.section-light</code>,{" "}
        <code>.section-dark</code>, <code>.card-surface</code>) and gradually migrate pages to use
        them.
      </li>
      <li>
        Review core UI components (Card, Button, Input, EditableTextBlock) and add light/dark{" "}
        <code>variant</code> props where needed.
      </li>
      <li>Clean up leftover boilerplate styles (e.g. old Vite starter CSS) from the project.</li>
    </ul>

    <h3>CMS rollout</h3>
    <ul>
      <li>Define and document a naming convention for <code>static_content</code> IDs.</li>
      <li>Replace hardcoded text on all main pages with <code>EditableTextBlock</code>.</li>
      <li>
        Enhance <code>/admin/content</code> with search, filtering by prefix (e.g.{" "}
        <code>about.*</code>) and clearer last-updated metadata.
      </li>
    </ul>

    <h3>Admin & content management</h3>
    <ul>
      <li>Finish and refine the admin pages for events, news, members, and research.</li>
      <li>
        Build robust admin pages for:
        <ul>
          <li>Member signups (<code>member_signups</code>)</li>
          <li>Newsletter signups (<code>newsletter_signups</code>) with CSV export</li>
        </ul>
      </li>
      <li>Optionally add an admin UI to manage user roles in the <code>users</code> collection.</li>
    </ul>

    <h3>Security & robustness</h3>
    <ul>
      <li>Update Storage rules to mirror the role-based admin logic (instead of hardcoded UIDs).</li>
      <li>Double-check all new collections are covered by appropriate Firestore rules.</li>
      <li>Add better error handling and toasts for admin actions.</li>
    </ul>

    <h3>Longer-term ideas</h3>
    <ul>
      <li>Add version history for <code>static_content</code> or manual backup processes.</li>
      <li>Add markdown support for richer text formatting where needed.</li>
      <li>Build a “Career hub” page aggregating relevant jobs and internships.</li>
      <li>Explore a members-only area for additional resources or applications.</li>
    </ul>

    <p>
      The handbook should be updated whenever you change the architecture, security model, or
      editorial workflows. Think of it as the internal “map” of the system that helps future TIA
      members take over smoothly.
    </p>
  </>
);

export default Handbook;
