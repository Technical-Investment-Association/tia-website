# Admin UI standards

Consistent patterns for admin-area pages (e.g. Admin Mail, Admin Events, Admin Members).

## Do

- **No outlines**  
  Avoid focus rings and borders on inputs/buttons unless required for accessibility. Prefer `focus-visible:ring-0 focus-visible:ring-offset-0` where appropriate.

- **Grey dropdown for selects**  
  Use the **GreyPillSelect** component (`@/components/ui/grey-pill-select`) for dropdowns so all admin selects look the same (pill-shaped trigger, light grey background, no outline).

- **Pill bar for sub-page navigation**  
  For pages with multiple sections (e.g. Templates | Drafts | Recently sent), use a centred pill bar:
  - Wrapper: `flex justify-center gap-1 rounded-full bg-gray-100 p-1`
  - Active tab: `bg-white text-gray-900 shadow-sm`
  - Inactive tab: `text-gray-600 hover:text-gray-900`
  - Buttons: `rounded-full px-4 py-2 text-sm font-medium transition-colors`

- **Sub-page titles**  
  Section titles within an admin page (e.g. "System templates", "Drafts"):
  - Use: `text-xl font-normal text-gray-900` (larger, not bold).
  - Optional: wrap in `<h2 className="mb-3 text-xl font-normal text-gray-900">` for semantics.

## Reference

- **Admin Mail** (`src/pages/AdminMail.tsx`) implements these patterns: pill bar, GreyPillSelect, sub-page title style, primary CTA with white text and no focus ring.
