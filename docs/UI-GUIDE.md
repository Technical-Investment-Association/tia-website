# UI components guide

High-level overview of the UI components used on the TIA website, what they are, and when to use them. This is written for people who are new to building websites.

The main idea: **reuse existing components** instead of creating new one-off designs.

---

## 1. Layout components

These control **where** things sit on the page.

- **`Container`** (`src/components/layout/Container.tsx`)
  - Keeps content centred with consistent side margins.
  - Used for page bodies and sections that should align to the main grid.

- **`Section`** (`src/components/layout/Section.tsx`)
  - Wraps a full-width section (e.g. “Upcoming events”, “What we do”, “Partnerships”).
  - Controls the vertical spacing and background colour.
  - `background` options:
    - `"default"` – transparent / normal page background.
    - `"cream"` – soft cream background for highlighted sections.
    - `"light"` / `"dark"` – other surface options from the design tokens.

- **Grid helpers** (`grid-outer`, `grid-inner`)
  - `grid-outer` sets the vertical spacing between sections.
  - `grid-inner` is the 12-column grid used inside each section.
  - You will mostly see these used **inside** `Section`.

**When to use:**  
- Every new “block” of content on a page (hero, events, mission, partnerships) should live inside a `Section`, and the content inside should use the `grid-inner` 12‑column grid.

---

## 2. Basic UI primitives

These are the building blocks of the interface (buttons, cards, inputs, etc.). Most live under `src/components/ui/`.

- **Button** (`button.tsx`)
  - Used for actions (e.g. “Join the network”, “Express interest”).
  - Variants:
    - `variant="default"` – main action (primary colour).
    - `variant="secondary"` – secondary actions.
    - `variant="outline"` – subtle, bordered button.
    - `variant="ghost"` – text-like button with hover background.
    - `variant="link"` – looks like a text link.
  - Sizes:
    - `size="default"` – normal.
    - `size="sm"` – smaller.
    - `size="lg"` – larger (used for main CTAs).
  - **Shape rule**:
    - By default buttons are **sharp** (0px radius).
    - Make them pill-shaped only when we intentionally want that look (add `rounded-full` in `className` for a hero CTA or key primary button).

- **Card** (`card.tsx`)
  - A simple sharp-cornered box with border and background.
  - Used for content groupings like admin panels, resource summaries, etc.
  - Composed of:
    - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

- **Inputs & form fields** (`input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `label.tsx`)
  - All share the same sharp-cornered, minimal style.
  - Use these rather than raw `<input>` to get consistent spacing, fonts and focus styles.

- **Feedback & overlays**
  - **Toast (Sonner)** – `src/components/ui/sonner.tsx`
    - Used for global feedback: success / error messages after actions.
    - Call `toast("Message")` from code.
  - **Alert** – `alert.tsx`
    - Inline callouts within a page (e.g. info or warning blocks).
  - **AlertDialog / Modal** – `alert-dialog.tsx`
    - Used in admin flows when confirming destructive actions.

- **Typography & decoration**
  - **`Separator`** (`separator.tsx`) – a horizontal line to separate content.
  - **`Badge`** (`badge.tsx`) – small label, often pill-shaped (status, tags).
  - **`Tooltip`** (`tooltip.tsx`) – hover helper for icons or short labels.

**When to use:**  
- For any clickable action, use `Button` or a `Link` styled as `variant="link"`.  
- For anything that looks like a “box” around content, start with `Card`.  
- Use the existing form components instead of inventing new styles for inputs and selects.

---

## 3. Page-level components (composites)

These are larger components composed from the primitives above and are specific to this website.

- **Hero** (`ui/hero.tsx`)
  - The large top section on pages like the homepage and Join.
  - Includes:
    - Background animation (Finisher header).
    - A big serif headline.
    - Optional description and actions.
  - **When to use:** Top of major pages (Index, Join, About). There should only be one main hero per page.

- **EventCard** (`event-card.tsx`) and **EventCardCompact** (`event-card-compact.tsx`)
  - Full card: used on the Events page.
  - Compact: used on the homepage (“Upcoming events”).
  - Show event title, date, location, and sign-up button when registration is external.

- **EventCardSkeleton** (`event-card-skeleton.tsx`)
  - Placeholder while events are loading.

- **AdminEventCard** (`admin-event-card.tsx`)
  - Used in admin to view and manage events.

- **PartnershipLogoGrid** (`PartnershipLogoGrid.tsx`)
  - Displays logos for corporate and student club partners.
  - Used on the homepage and partnerships page.

- **Navigation & Footer**
  - **Navigation** (`Navigation.tsx`): top navigation bar with public routes and admin drawer.
  - **Footer** (`Footer.tsx`): site footer with links and contact details.

**When to use:**  
- Use these composites whenever you need to show events, partner logos, or standard top/bottom of the page. Don’t recreate similar structures by hand.

---

## 4. How this maps to the homepage (Index.tsx)

On the homepage:

- **Hero** – top Finisher background with title and main CTA button (pill-shaped).
- **Section: Upcoming events**
  - `Section` + `grid-inner` + `EventCardCompact` list.
- **Section: Community / skills**
  - `Section` + `grid-inner`.
  - Left: metric card (sharp box) using motion (AnimatedCounter).
  - Right: text explaining the value proposition.
- **Section: What we do**
  - `Section` with `background="cream"`.
  - Right-aligned text + left Finisher background visual.
- **Section: Partnerships**
  - `Section` + `Separator`, heading, partner logo grids, and a CTA button.

If you add a new section, think: “Is this like an existing one (events, partnerships, CTA)?” and see if it can be built by reusing and slightly adapting these patterns.

---

## 5. Shape rules in practice (sharp vs pill)

- **Sharp corners (default)**
  - Cards, admin panels, event cards, navigation, footer, sections, modals, inputs, tooltips.
  - Achieved by:
    - Design tokens: `--radius: 0px` in `index.css`.
    - Tailwind config: `borderRadius.lg/md/sm = 0px`.

- **Pill shapes (intentional)**
  - Primary CTA buttons:
    - E.g. “Join the network” on the homepage.
    - Use `Button` with `className="rounded-full ..."`.
  - Small badges or status pills when needed.

**Rule of thumb:** If it’s structural (container, card, layout), keep it square. If it’s a primary CTA or a small label that needs visual emphasis, it can be a pill.

---

## 6. For new contributors

When you build or change a page:

1. **Wrap content in `Section`** and use `grid-inner` inside to align to the grid.
2. **Use existing primitives** (`Button`, `Card`, inputs) rather than new CSS.
3. **Respect shape rules**: sharp by default; pill only when it’s clearly a CTA or badge.
4. **Re-use composites** like `Hero`, `EventCard`, `PartnershipLogoGrid` where possible.
5. If you think you need a new component:
   - Check this guide and `STYLEGUIDE.md`.
   - Add a short note in `docs/UI-GUIDE.md` once the new component is stable.

This keeps the website consistent, easier to extend, and friendly for both designers and developers. 

