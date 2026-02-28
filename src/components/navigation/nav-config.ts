/**
 * Navigation configuration — single source of truth for nav links and layout constants.
 * Edit here to add/remove public or admin menu items.
 */

export type NavItem = {
  name: string;
  path: string;
  /**
   * Optional nested subpages. When present, the drawer shows the parent name
   * and lists children instead of using dropdowns in the navbar.
   */
  children?: NavItem[];
};

/** Height of the main navbar (px). Used for drawer header alignment. */
export const NAVBAR_HEIGHT_PX = 96;

/** Public site nav links (navbar + main drawer). */
export const navLinks: NavItem[] = [
  { name: "Events", path: "/events" },
  { name: "About", path: "/about" },
  { name: "Education", path: "/education" },
  {
    name: "Partnerships",
    path: "/partnerships",
    // Example for future subpages:
    // children: [
    //   { name: "How TIA partners", path: "/partnerships/how-tia-partners" },
    //   { name: "Corporate partnerships", path: "/partnerships/corporate" },
    // ],
  },
];

/** Admin drawer links (order matches this array). */
export const adminNavItems: { name: string; path: string }[] = [
  { name: "Dashboard", path: "/admin" },
  { name: "Admin members", path: "/admin/members" },
  { name: "Member analytics", path: "/admin/members/analytics" },
  { name: "Admin mail", path: "/admin/mail" },
  { name: "Admin events", path: "/admin/events" },
  { name: "Admin partnerships", path: "/admin/partnerships" },
  { name: "Admin education", path: "/admin/education" },
];
