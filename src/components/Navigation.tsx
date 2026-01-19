import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

type DrawerMode = "main"; // later you can add "admin" here

const Navigation = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("main");
  const [isScrolled, setIsScrolled] = useState(false);
  const { role, loading, previewAsPublic, setPreviewAsPublic } = useAuth();
  const isAdmin = role === "admin";

  const location = useLocation();
  const isHome = location.pathname === "/";
  const showApply = !isHome || isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinks = [
    { name: "Events", path: "/events" },
    { name: "About", path: "/about" },
    { name: "Partnerships", path: "/partnerships" },
    // { name: "Research", path: "/research" },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/admin" },
    { name: "Events", path: "/admin/events" },
    { name: "News", path: "/admin/news" },
    { name: "Members", path: "/admin/members" },
    { name: "Partnerships", path: "/admin/partnerships" },
    { name: "Static text", path: "/admin/content" },
  ];

  const openMainDrawer = () => {
    setDrawerMode("main");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const Logo = () => (
    <Link
      to="/"
      className={`flex items-center gap-3 text-sm font-semibold tracking-tight transition-colors duration-300
        ${isScrolled ? "text-slate-900" : "text-white"}`}
    >
      {/* Fixed logo box, scale from top-left */}
      <div className="relative" style={{ width: 48, height: 48 }}>
        {/* Big white logo (hero state) */}
        <img
          src="/logo-white.png"
          alt="TIA Logo white"
          className={`
            absolute top-0 left-0 object-contain origin-top-left
            transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(.22,1,.36,1)]
            ${
              isScrolled
                ? "opacity-0 scale-100 translate-y-0"
                : "opacity-100 scale-[2.4] translate-y-[6px]"
            }
          `}
          style={{ width: 48, height: 48 }}
        />

        {/* Dark navbar logo */}
        <img
          src="/logo-dark.png"
          alt="TIA Logo dark"
          className={`
            absolute top-0 left-0 object-contain origin-top-left
            transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(.22,1,.36,1)]
            ${
              isScrolled
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-[0.9] translate-y-[2px]"
            }
          `}
          style={{ width: 48, height: 48 }}
        />
      </div>

      {/* Title image only visible when white navbar is in */}
      <img
        src="/Technical%20Investment%20Association-3.png"
        alt="Technical Investment Association"
        className={`hidden sm:block h-6 object-contain transition-opacity duration-300 ${
          isScrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Sliding white background (no shadow, no border) */}
      <div
        className={`absolute inset-0 -z-10 transform transition-transform transition-opacity duration-500 ease-out
        ${
          isScrolled
            ? "translate-y-0 opacity-100 bg-white"
            : "-translate-y-full opacity-0"
        }`}
      />

      <div className="relative container mx-auto px-4">
        {/* Main row – height fixed; we branch desktop vs mobile/tablet */}
        <div className="relative h-24 md:h-24 transition-colors duration-300">
          {/* Desktop layout: 2-column grid (perfect half alignment) */}
          <div className="hidden lg:grid grid-cols-2 items-center h-full">
            {/* Left half: logo */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Right half: nav links (left) + Apply (right) */}
            <div className="flex items-center justify-between">
              {/* Nav links, left-aligned within right half */}
              <div
                className={`
                  flex items-center transition-[gap] duration-300
                  ${isScrolled ? "gap-8" : "gap-10"}
                `}
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors duration-200
                      ${
                        isScrolled
                          ? "text-slate-700 hover:text-slate-900"
                          : "text-white/80 hover:text-white"
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`text-sm font-semibold tracking-wide uppercase
                      ${
                        isScrolled
                          ? "text-[#D2691E] hover:text-[#b65916]"
                          : "text-[#FFD2A3] hover:text-[#FFE0BF]"
                      }`}
                  >
                    Admin
                  </Link>
                )}
              </div>

              {/* Apply button – only desktop */}
              {showApply && (
                <div className="flex-shrink-0">
                  <Link to="/join">
                    <Button
                      size="sm"
                      className={`rounded-full border text-sm px-5 py-1.5 bg-transparent transition-colors duration-200
                        ${
                          isScrolled
                            ? "border-black text-black hover:bg-black hover:text-white"
                            : "border-white text-white hover:bg-white hover:text-black"
                        }`}
                    >
                      Apply
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile / tablet layout (no overlap) */}
          <div className="flex lg:hidden items-center justify-between h-full">
            {/* Logo on the left */}
            <Logo />

            {/* Right: mobile menu (and optionally Apply in future if you want) */}
            <div className="flex items-center gap-4">
              {/* Mobile / small-screen menu button */}
              <button
                className={`transition-colors duration-200 ${
                  isScrolled ? "text-slate-900" : "text-white"
                }`}
                onClick={openMainDrawer}
                aria-label="Toggle menu"
              >
                {isDrawerOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical drawer for mobile & small screens */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50">
          {/* dark backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />

          {/* panel */}
          <div className="relative ml-auto h-full w-full md:w-1/2 bg-white text-slate-900 shadow-lg flex flex-col">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">
                Menu
              </span>
              <button
                onClick={closeDrawer}
                aria-label="Close menu"
                className="text-slate-600 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer content */}
            <nav className="flex-1 px-6 py-6 flex flex-col gap-4 overflow-y-auto">
              {drawerMode === "main" && (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="text-base font-medium text-slate-800 hover:text-slate-950"
                      onClick={closeDrawer}
                    >
                      {link.name}
                    </Link>
                  ))}

                  {/* Admin link inside drawer as well (if admin) */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="mt-4 text-sm font-semibold tracking-[0.16em] uppercase text-[#D2691E] hover:text-[#b65916]"
                      onClick={closeDrawer}
                    >
                      Admin
                    </Link>
                  )}

                  {showApply && (
                    <div className="mt-6">
                      <Link to="/join" onClick={closeDrawer}>
                        <Button
                          size="sm"
                          className="w-full rounded-full border border-slate-900 bg-transparent text-sm py-2 text-slate-900 hover:bg-slate-900 hover:text-white"
                        >
                          Apply
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Existing admin strip */}
      {!loading && isAdmin && (
        <div className="relative container mx-auto px-4">
          <div className="mt-2 mb-3 rounded-lg border border-[#A6DAEA]/40 bg-[#A6DAEA]/5 px-3 py-2 text-xs flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-[#A6DAEA]">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-semibold tracking-wide uppercase">
                Admin mode
              </span>
              <span className="hidden sm:inline text-[11px] text-muted-foreground">
                You&apos;re seeing the site with admin tools.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/admin"
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <span className="hidden h-3 w-px bg-border md:inline-block" />
              <Link
                to="/admin/events"
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Events
              </Link>
              <Link
                to="/admin/news"
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                News
              </Link>
              <Link
                to="/admin/members"
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Members
              </Link>
              <Link
                to="/admin/partnerships"
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Partnerships
              </Link>
              <Link
                to="/admin/content"
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Static text
              </Link>

              <span className="hidden h-3 w-px bg-border md:inline-block" />

              <Button
                variant={previewAsPublic ? "outline" : "default"}
                size="sm"
                className="gap-1 px-2 text-[11px]"
                onClick={() => setPreviewAsPublic(!previewAsPublic)}
              >
                {previewAsPublic ? (
                  <>
                    <EyeOff className="h-3 w-3" />
                    Exit preview
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" />
                    Preview as visitor
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="px-2 text-[11px]"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
