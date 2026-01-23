import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

/**
 * ============================================================================
 * Navigation.tsx — Global Navigation & Drawer System
 * ============================================================================
 *
 * PURPOSE
 * -------
 * This component implements the global navigation bar and side-drawer system
 * for the site, covering:
 *  - Public navigation (desktop + mobile)
 *  - Admin navigation (drawer-based, no top admin strip)
 *  - Route-aware navbar styling (hero vs. admin pages)
 *  - Future-proof support for subpages inside drawers (no dropdown menus)
 *
 *
 * KEY DESIGN PRINCIPLES
 * ---------------------
 * 1. NO DROPDOWN MENUS IN THE NAVBAR
 *    Dropdowns are intentionally avoided because they are:
 *      - fragile on mobile
 *      - hard to scan
 *      - messy when pages gain subpages
 *
 *    Instead, ALL subpages are displayed inside the side drawer.
 *
 *
 * 2. DRAWER-BASED NAVIGATION FOR HIERARCHY
 *    If a navbar page (e.g. "Partnerships") later gains subpages:
 *
 *      - The navbar remains flat and clean
 *      - Clicking the page in the drawer opens a *drawer section*
 *      - The drawer title switches to the parent page name
 *      - Subpages are listed as first-class navigation rows
 *
 *    This keeps navigation consistent across mobile and desktop.
 *
 *
 * 3. ROUTE-DRIVEN NAVBAR STATE (NO HACKS)
 *    - Public pages:
 *        • Navbar starts transparent on the home page
 *        • Becomes solid white on scroll
 *
 *    - Admin pages (/admin and subroutes):
 *        • Navbar is always solid white
 *        • No hero-style transparency or animation
 *
 *    This behavior is driven by the current route, not scroll tricks.
 *
 *
 * 4. ADMIN NAVIGATION IS DRAWER-ONLY
 *    - There is NO separate admin navigation bar
 *    - Clicking "Admin" opens an admin drawer
 *    - Admin drawer mirrors the public drawer layout for visual cohesion
 *    - Fonts, spacing, and alignment are intentionally identical
 *
 *
 * 5. MOBILE-FIRST CONSIDERATIONS
 *    - The "Join" button is ALWAYS visible on mobile
 *      (even at the top of the home page)
 *    - Reason: the fixed navbar covers the hero CTA on small screens
 *
 *
 * 6. SMOOTH, ACCESSIBLE INTERACTIONS
 *    - Drawer slides in from the side (not instant)
 *    - Burger icon smoothly morphs into an X
 *    - Drawer remains mounted during exit animation to prevent flicker
 *
 *
 * FUTURE EXTENSIONS
 * -----------------
 * - CMS / page-builder preview mode:
 *     A "Preview as visitor" toggle previously existed for admins.
 *     If a CMS is reintroduced, this logic can be safely added back
 *     inside the admin drawer without structural changes.
 *
 * - Subpage navigation:
 *     To add subpages under a navbar item:
 *
 *       1. Add `children` to the corresponding navLinks item
 *       2. The drawer will automatically render them as a section
 *       3. No dropdowns or navbar changes required
 *
 *
 * FILE OWNERSHIP NOTES
 * --------------------
 * This file intentionally contains more structure and comments than usual.
 * Please avoid:
 *  - Adding dropdowns to the navbar
 *  - Adding a second admin navigation bar
 *  - Styling admin navigation differently from public drawers
 *
 * These constraints are intentional and design-driven.
 * ============================================================================
 */

type DrawerMode = "main" | "admin";

type NavItem = {
  name: string;
  path: string;
  /**
   * Optional nested subpages.
   * If you later add subpages (e.g. Partnerships -> Corporate / Student clubs),
   * we intentionally show them inside the drawer (NOT as a dropdown in the navbar),
   * because dropdowns get messy on both mobile and desktop.
   *
   * When children exist:
   * - the drawer shows the parent page name as the drawer title
   * - the list shows the subpages
   * - the navbar stays clean (no dropdowns)
   */
  children?: NavItem[];
};

const NAVBAR_HEIGHT_PX = 96; // h-24

const Navigation = () => {
  const location = useLocation();
  const { role, loading } = useAuth();
  const isAdmin = role === "admin";

  // Route-driven navbar behavior
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isHome = location.pathname === "/";

  // Scroll state (disabled on admin routes)
  const [scrolled, setScrolled] = useState(false);
  const effectiveScrolled = isAdminRoute ? true : scrolled;

  // Drawer state with enter/exit animation (keep mounted while closing)
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const [drawerMode, setDrawerMode] = useState<DrawerMode>("main");

  // Drawer “section” state for subpages (future-proof).
  // If you add children to nav items, clicking the parent will show its children.
  const [drawerSectionTitle, setDrawerSectionTitle] = useState<string | null>(
    null
  );
  const [drawerSectionItems, setDrawerSectionItems] = useState<
    NavItem[] | null
  >(null);

  const closeTimerRef = useRef<number | null>(null);

  /**
   * NOTE (CMS preview):
   * We previously supported a “Preview as visitor” toggle (previewAsPublic) to temporarily
   * render the public-facing site while signed in as admin.
   *
   * If the page-builder / CMS is added back later, this is useful for verifying public content
   * without signing out. Re-introduce previewAsPublic + setPreviewAsPublic from AuthContext
   * and add the toggle back in the admin drawer.
   */

  const navLinks: NavItem[] = useMemo(
    () => [
      { name: "Events", path: "/events" },
      { name: "About", path: "/about" },
      {
        name: "Partnerships",
        path: "/partnerships",
        // Example (future):
        // children: [
        //   { name: "How TIA partners", path: "/partnerships/how-tia-partners" },
        //   { name: "Corporate partnerships", path: "/partnerships/corporate" },
        //   { name: "Student club partnerships", path: "/partnerships/student-clubs" },
        // ],
      },
    ],
    []
  );

  // Join button visibility:
  // - Desktop: keep your original behavior (only when not at top of home)
  // - Mobile: ALWAYS show Join (including at top of home), because the navbar covers the hero button.
  const showJoinDesktop = !isHome || effectiveScrolled;
  const showJoinMobile = true;

  useEffect(() => {
    if (isAdminRoute) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAdminRoute]);

  useEffect(() => {
    // Close drawer if route changes (prevents weird states)
    // but keep smooth animation by calling closeDrawer()
    if (isDrawerMounted) {
      closeDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openDrawer = (mode: DrawerMode) => {
    clearCloseTimer();
    setDrawerMode(mode);

    // Reset section view whenever drawer is opened
    setDrawerSectionTitle(null);
    setDrawerSectionItems(null);

    setIsDrawerMounted(true);
    // allow mount first, then animate in
    requestAnimationFrame(() => setIsDrawerVisible(true));
  };

  const closeDrawer = () => {
    clearCloseTimer();
    setIsDrawerVisible(false);

    // keep mounted until animation finishes
    closeTimerRef.current = window.setTimeout(() => {
      setIsDrawerMounted(false);
      setDrawerSectionTitle(null);
      setDrawerSectionItems(null);
    }, 260);
  };

  const openMainDrawer = () => openDrawer("main");
  const openAdminDrawer = () => openDrawer("admin");

  const toggleMainDrawer = () => {
    if (isDrawerMounted) closeDrawer();
    else openMainDrawer();
  };

  const enterSubpageSection = (parent: NavItem) => {
    if (!parent.children || parent.children.length === 0) return;
    setDrawerSectionTitle(parent.name);
    setDrawerSectionItems(parent.children);
  };

  const exitSubpageSection = () => {
    setDrawerSectionTitle(null);
    setDrawerSectionItems(null);
  };

  const Logo = () => (
    <Link
      to="/"
      className={`flex items-center gap-3 text-sm font-semibold tracking-tight transition-colors duration-300
        ${effectiveScrolled ? "text-slate-900" : "text-white"}`}
    >
      <div className="relative" style={{ width: 48, height: 48 }}>
        <img
          src="/logo-white.png"
          alt="TIA Logo white"
          className={`
            absolute top-0 left-0 object-contain origin-top-left
            transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(.22,1,.36,1)]
            ${
              effectiveScrolled
                ? "opacity-0 scale-100 translate-y-0"
                : "opacity-100 scale-[2.4] translate-y-[6px]"
            }
          `}
          style={{ width: 48, height: 48 }}
        />

        <img
          src="/logo-dark.png"
          alt="TIA Logo dark"
          className={`
            absolute top-0 left-0 object-contain origin-top-left
            transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(.22,1,.36,1)]
            ${
              effectiveScrolled
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-[0.9] translate-y-[2px]"
            }
          `}
          style={{ width: 48, height: 48 }}
        />
      </div>

      <img
        src="/Technical%20Investment%20Association-3.png"
        alt="Technical Investment Association"
        className={`hidden sm:block h-6 object-contain transition-opacity duration-300 ${
          effectiveScrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </Link>
  );

  const BurgerToX = ({
    open,
    colorClass,
    ariaLabel,
    onClick,
  }: {
    open: boolean;
    colorClass: string;
    ariaLabel: string;
    onClick: () => void;
  }) => {
    return (
      <button
        type="button"
        className={`relative h-10 w-10 grid place-items-center ${colorClass}`}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {/* Smooth morph (fade/rotate/scale) */}
        <Menu
          size={24}
          className={`absolute transition-all duration-300 ease-out
            ${
              open
                ? "opacity-0 rotate-45 scale-90"
                : "opacity-100 rotate-0 scale-100"
            }
          `}
        />
        <X
          size={24}
          className={`absolute transition-all duration-300 ease-out
            ${
              open
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-45 scale-90"
            }
          `}
        />
      </button>
    );
  };

  // Drawer title logic:
  // - If viewing subpages, show parent page name
  // - Else show Menu/Admin
  const drawerTitle = drawerSectionTitle
    ? drawerSectionTitle
    : drawerMode === "admin"
    ? "Admin"
    : "Menu";

  const drawerTitleClass =
    drawerMode === "admin" && !drawerSectionTitle
      ? "text-[#D2691E]"
      : "text-black";

  // Shared drawer alignment targets:
  // - Top title row aligns vertically with navbar content (same height as navbar)
  // - Close icon aligns where burger sits (top-right, centered in same row)
  // - Links start right under the navbar row (no extra top padding)
  const drawerHeaderStyle = { height: NAVBAR_HEIGHT_PX };

  // Item row styling to mirror the “clean list” look in your example
  const DrawerRow = ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <div
      className="flex items-center justify-between py-5 border-b border-slate-200"
      onClick={onClick}
    >
      {children}
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* White background: always visible on admin routes; slides in on public routes when scrolled */}
      <div
        className={`absolute inset-0 -z-10 transform transition-transform transition-opacity duration-500 ease-out
          ${
            effectiveScrolled
              ? "translate-y-0 opacity-100 bg-white"
              : "-translate-y-full opacity-0"
          }`}
      />

      <div className="relative container mx-auto px-4">
        <div className="relative h-24 md:h-24 transition-colors duration-300">
          {/* Desktop layout */}
          <div className="hidden lg:grid grid-cols-2 items-center h-full">
            <div className="flex items-center">
              <Logo />
            </div>

            <div className="flex items-center justify-between">
              <div
                className={`
                  flex items-center transition-[gap] duration-300
                  ${effectiveScrolled ? "gap-8" : "gap-10"}
                `}
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors duration-200
                      ${
                        effectiveScrolled
                          ? "text-slate-700 hover:text-slate-900"
                          : "text-white/80 hover:text-white"
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {!loading && isAdmin && (
                  <button
                    type="button"
                    onClick={openAdminDrawer}
                    className={`text-sm font-medium tracking-wide uppercase transition-colors
                      ${
                        effectiveScrolled
                          ? "text-[#D2691E] hover:text-[#b65916]"
                          : "text-[#FFD2A3] hover:text-[#FFE0BF]"
                      }`}
                    aria-label="Open admin menu"
                  >
                    Admin
                  </button>
                )}
              </div>

              {/* Desktop Join button */}
              {showJoinDesktop && (
                <div className="flex-shrink-0">
                  <Link to="/join">
                    <Button
                      size="sm"
                      className={`rounded-full border text-sm px-5 py-1.5 bg-transparent transition-colors duration-200
                        ${
                          effectiveScrolled
                            ? "border-black text-black hover:bg-black hover:text-white"
                            : "border-white text-white hover:bg-white hover:text-black"
                        }`}
                    >
                      Join
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile / tablet layout */}
          <div className="flex lg:hidden items-center justify-between h-full">
            <Logo />

            <div className="flex items-center gap-3">
              {/* Mobile Join button (always visible, including top of home) */}
              {showJoinMobile && (
                <Link to="/join" className="flex-shrink-0">
                  <Button
                    size="sm"
                    className={`rounded-full border text-sm px-4 py-1.5 bg-transparent transition-colors duration-200
                      ${
                        effectiveScrolled
                          ? "border-black text-black hover:bg-black hover:text-white"
                          : "border-white text-white hover:bg-white hover:text-black"
                      }`}
                  >
                    Join
                  </Button>
                </Link>
              )}

              <BurgerToX
                open={isDrawerMounted}
                onClick={toggleMainDrawer}
                ariaLabel="Toggle menu"
                colorClass={effectiveScrolled ? "text-slate-900" : "text-white"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {isDrawerMounted && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with fade */}
          <div
            className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
              isDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeDrawer}
          />

          {/* Panel: smooth slide from right */}
          <div
            className={`
              relative ml-auto h-full w-full md:w-1/2 bg-white text-slate-900 shadow-lg flex flex-col
              transform transition-transform duration-300 ease-out
              ${isDrawerVisible ? "translate-x-0" : "translate-x-full"}
            `}
          >
            {/* Header aligned with navbar row */}
            <div
              className="px-6 flex items-center justify-between"
              style={drawerHeaderStyle}
            >
              <span
                className={`text-sm font-medium tracking-wide uppercase ${drawerTitleClass}`}
              >
                {drawerTitle}
              </span>

              {/* Close icon positioned where burger would be */}
              <BurgerToX
                open={true}
                onClick={closeDrawer}
                ariaLabel="Close menu"
                colorClass="text-slate-900"
              />
            </div>

            {/* Links start exactly under the navbar row */}
            <div className="px-6">
              <div className="border-t border-slate-200" />
            </div>

            <nav className="flex-1 px-6 overflow-y-auto">
              {/* MAIN drawer */}
              {drawerMode === "main" && (
                <div className="pt-0">
                  {/* If we’re inside a subpage section, show children + a simple Back row */}
                  {drawerSectionItems && drawerSectionTitle ? (
                    <>
                      <DrawerRow onClick={exitSubpageSection}>
                        <button
                          type="button"
                          className="text-base font-medium text-slate-800 hover:text-slate-950"
                        >
                          Back
                        </button>
                      </DrawerRow>

                      {drawerSectionItems.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={closeDrawer}
                        >
                          <DrawerRow>
                            <span className="text-base font-medium text-slate-800 hover:text-slate-950">
                              {child.name}
                            </span>
                          </DrawerRow>
                        </Link>
                      ))}
                    </>
                  ) : (
                    <>
                      {navLinks.map((link) => {
                        const hasChildren = !!link.children?.length;

                        if (hasChildren) {
                          // Parent shows as a row; clicking opens children section in-drawer (no dropdown)
                          return (
                            <div key={link.path}>
                              <DrawerRow
                                onClick={() => enterSubpageSection(link)}
                              >
                                <button
                                  type="button"
                                  className="text-base font-medium text-slate-800 hover:text-slate-950 text-left"
                                >
                                  {link.name}
                                </button>
                              </DrawerRow>
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={closeDrawer}
                          >
                            <DrawerRow>
                              <span className="text-base font-medium text-slate-800 hover:text-slate-950">
                                {link.name}
                              </span>
                            </DrawerRow>
                          </Link>
                        );
                      })}

                      {!loading && isAdmin && (
                        <div className="pt-6">
                          <button
                            type="button"
                            onClick={openAdminDrawer}
                            className="text-sm font-medium tracking-wide uppercase text-[#D2691E] hover:text-[#b65916]"
                          >
                            Admin
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ADMIN drawer */}
              {drawerMode === "admin" && (
                <div className="pt-0">
                  {/* All same font/weight (no fat dashboard) */}
                  <Link to="/admin" onClick={closeDrawer}>
                    <DrawerRow>
                      <span className="text-base font-medium text-slate-800 hover:text-slate-950">
                        Dashboard
                      </span>
                    </DrawerRow>
                  </Link>

                  <Link to="/admin/members" onClick={closeDrawer}>
                    <DrawerRow>
                      <span className="text-base font-medium text-slate-800 hover:text-slate-950">
                        Admin members
                      </span>
                    </DrawerRow>
                  </Link>

                  <Link to="/admin/events" onClick={closeDrawer}>
                    <DrawerRow>
                      <span className="text-base font-medium text-slate-800 hover:text-slate-950">
                        Admin events
                      </span>
                    </DrawerRow>
                  </Link>

                  <Link to="/admin/partnerships" onClick={closeDrawer}>
                    <DrawerRow>
                      <span className="text-base font-medium text-slate-800 hover:text-slate-950">
                        Admin partnerships
                      </span>
                    </DrawerRow>
                  </Link>

                  <div className="pt-8">
                    <Button
                      type="button"
                      onClick={async () => {
                        await handleSignOut();
                        closeDrawer();
                      }}
                      className="w-full rounded-full bg-transparent border border-black text-black hover:bg-black hover:text-white"
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
