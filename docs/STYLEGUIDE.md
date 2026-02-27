# Visual styleguide

Scandinavian-inspired design system for the TIA website. This acts as the ruleset for layout, typography, motion and component shapes.

## 1. Overall feel

- **Inspiration**: Modern Nordic investment sites.
- **Tone**: calm, confident, analytical – never shouty.
- **Visual language**:
  - Clean layouts, strong grid, generous whitespace.
  - High-contrast typography, minimal decoration.
  - Motion is subtle and purposeful.

## 2. Shapes and corners

**Hard rule:** Things are either **perfectly sharp** (90° corners) or **fully pill-shaped**. No in-between radii.

- **Default**: `0px` border radius everywhere (cards, sections, inputs, nav, modals).
- **Exception**: pill elements that are intentionally round:
  - Primary CTAs (e.g. “Join the network” button)
  - Small status pills / badges / chips
  - Circular elements such as avatars or decorative dots
- **Migration rule**:
  - Existing `rounded-md`, `rounded-lg`, `rounded-xl`, etc. should be removed over time or converted to either `rounded-none` or `rounded-full`.
  - New components **must not** introduce arbitrary radii.

## 3. Layout system

### 3.1 Grid & container

- **Grid**
  - 12-column grid on desktop.
  - Gutter (column gap):
    - Desktop ≥ 1200px: **24px**
    - Tablet ~768–1199px: **16px**
    - Mobile < 768px: **12px**
- **Outer margins / padding**
  - Desktop: **120px** side padding
  - Tablet: **48px** side padding
  - Mobile: **20px** side padding
- **Max width**: 1440px, centered.

### 3.2 Layout primitives

Implemented as React components (and/or utility classes):

- `**Container`**
  - Centers content and applies responsive horizontal padding and max-width.
  - Used for all page content that should align to the main grid.
- `**Section**`
  - Handles vertical rhythm and optional background.
  - Default vertical spacing:
    - Mobile: ~48px top/bottom
    - Tablet: ~72px
    - Desktop: ~96px
  - Background variants:
    - `default` – transparent / page background
    - `light` – `--section-light`
    - `cream` – `--section-cream`
    - `dark` – `--section-dark`
- **Split layouts**
  - Use the 12-col grid to create consistent left/right content splits.
  - Standard pattern:
    - Left content: columns 1–6
    - Right content: columns 8–12
  - On mobile, splits stack vertically.
- **Utility patterns**
  - **Stack** – vertical spacing between children.
  - **Cluster** – horizontal row with gap and wrapping.
  - **Divider** – consistent use of `--divider` for section separators.

## 4. Spacing & typography

- **Base spacing unit**: 8px.
  - Preferred steps: 8, 16, 24, 32, 48, 64, 96.
- **Headings**
  - Serif (`Cormorant Garamond`), light weight, tight tracking.
  - H1–H3 scales already defined in `index.css` and should be reused.
- **Body text**
  - `Inter`, 14–18px, line-height 1.5–1.7.
  - Avoid long line lengths (>80 characters).

## 5. Colour system

- **Single source of truth**
  - HSL tokens in `src/index.css` → `:root`.
  - Exposed to Tailwind in `tailwind.config.ts` (e.g. `bg-section-cream`, `text-nav-active`).
  - Hex equivalents for JS/canvas in `src/theme/tokens.ts`.
- **Principles**
  - Palette is calm and Nordic: deep teals, creams, muted neutrals, a small number of warm accents.
  - At most **1–2 accent colours** visible in a single viewport.
  - Background/text combinations must pass WCAG AA for contrast.

## 6. Component taxonomy

Three layers:

1. **Layout primitives** (foundation)
  - `Container`, `Section`, grid utilities, SplitLayouts, Stack, Cluster, Divider.
2. **UI primitives** (atoms, in `components/ui`)
  - Button, Card, Badge, Input, Textarea, Select, Checkbox, Radio, Modal/Dialog, Tabs, Accordion, Toast, Skeleton.
3. **Composites** (domain-specific components)
  - EventCard family, AdminEventCard, PartnershipLogoGrid, Hero, CTASection, StatsRow, Quote/Testimonial, EmptyState, etc.

All new pages should be built as: **layout primitives → UI primitives → composites**, not arbitrary `div` trees.

## 7. Motion

- **Tone**: smooth and understated.
- **Durations**: 200–400ms for most UI interactions.
- **Use cases**:
  - Entrance animations for sections (once on scroll).
  - Micro-interactions on hover/focus (links, buttons, cards).
- **Avoid**:
  - Bouncy/springy transitions on large layout elements.
  - Infinite looping animations that distract from content.

## 8. Implementation status

- Design tokens and grid helpers live in `index.css` and `tailwind.config.ts`.
- `Container` and `Section` primitives are being introduced and applied first to `Index.tsx`.
- As we refactor, we will:
  - Remove non-pill radii (`rounded-md`, `rounded-lg`, etc.) and rely on `rounded-none` or `rounded-full`.
  - Migrate ad-hoc layout classes into the defined primitives.

