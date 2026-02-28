/**
 * App.tsx
 *
 * Purpose: Main application component with routing and code splitting
 *
 * Features:
 * - React Router for navigation
 * - Code splitting with React.lazy() for performance
 * - Protected admin routes with RequireAdmin guard
 * - Global UI providers (Toaster, Tooltip, React Query)
 *
 * Performance:
 * - Lazy loads all pages except homepage for faster initial load
 * - Suspense fallback for smooth loading transitions
 * - Separate chunks for admin pages (not loaded by public users)
 *
 * Security:
 * - Admin routes protected by RequireAdmin component
 * - Relies on Firestore rules for actual data security
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ScrollToTop from "@/components/ScrollToTop";
import RequireAdmin from "@/contexts/requireAdmin";

// ============================================================================
// Eagerly Loaded Components (Critical Path)
// ============================================================================

// Load homepage immediately - it's the entry point for most users
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// ============================================================================
// Lazy Loaded Components (Loaded Only When Needed)
// ============================================================================

// Public pages - loaded when user navigates to them
const Events = lazy(() => import("./pages/Events"));
const About = lazy(() => import("./pages/About"));
const Partnerships = lazy(() => import("./pages/Partnerships"));
const Research = lazy(() => import("./pages/Research"));
const Education = lazy(() => import("./pages/Education"));
const Join = lazy(() => import("./pages/Join"));
const ProfileUpdate = lazy(() => import("./pages/ProfileUpdate"));
const ProfileConfirmed = lazy(() => import("./pages/ProfileConfirmed"));
const ProfileDeactivate = lazy(() => import("./pages/ProfileDeactivate"));
const ProfileDeactivated = lazy(() => import("./pages/ProfileDeactivated"));
const NewsletterUnsubscribed = lazy(() => import("./pages/NewsletterUnsubscribed"));
const Handbook = lazy(() => import("./pages/Handbook"));

// Admin pages - only loaded for admin users
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminEvents = lazy(() => import("./pages/AdminEvents"));
const AdminMembers = lazy(() => import("./pages/AdminMembers"));
const AdminMemberAnalytics = lazy(() => import("./pages/AdminMemberAnalytics"));
const AdminContent = lazy(() => import("./pages/AdminContent"));
const AdminPartnerships = lazy(() => import("./pages/AdminPartnerships"));
const AdminResources = lazy(() => import("./pages/AdminResources"));
const AdminResearch = lazy(() => import("./pages/AdminResearch"));
const AdminEducation = lazy(() => import("./pages/AdminEducation"));
const AdminInsights = lazy(() => import("./pages/AdminInsights"));
const AdminMail = lazy(() => import("./pages/AdminMail"));

// ============================================================================
// Configuration
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - consider data fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Only retry failed requests once
    },
  },
});

// ============================================================================
// Loading Fallback Component
// ============================================================================

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// ============================================================================
// Main App Component
// ============================================================================

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ========== Public Routes ========== */}
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<Events />} />
            <Route path="/about" element={<About />} />
            <Route path="/partnerships" element={<Partnerships />} />
            <Route path="/research" element={<Research />} />
            <Route path="/education" element={<Education />} />
            <Route path="/join" element={<Join />} />
            <Route path="/profile/update" element={<ProfileUpdate />} />
            <Route path="/profile/confirmed" element={<ProfileConfirmed />} />
            <Route path="/profile/deactivate" element={<ProfileDeactivate />} />
            <Route path="/profile/deactivated" element={<ProfileDeactivated />} />
            <Route path="/newsletter/unsubscribed" element={<NewsletterUnsubscribed />} />
            <Route path="/handbook" element={<Handbook />} />
            <Route path="/handbook/*" element={<Handbook />} />

            {/* ========== Admin Authentication ========== */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ========== Protected Admin Routes ========== */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <Admin />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/events"
              element={
                <RequireAdmin>
                  <AdminEvents />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/members"
              element={
                <RequireAdmin>
                  <AdminMembers />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/members/analytics"
              element={
                <RequireAdmin>
                  <AdminMemberAnalytics />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/content"
              element={
                <RequireAdmin>
                  <AdminContent />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/partnerships"
              element={
                <RequireAdmin>
                  <AdminPartnerships />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/resources"
              element={
                <RequireAdmin>
                  <AdminResources />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/research"
              element={
                <RequireAdmin>
                  <AdminResearch />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/education"
              element={
                <RequireAdmin>
                  <AdminEducation />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/insights"
              element={
                <RequireAdmin>
                  <AdminInsights />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/mail"
              element={
                <RequireAdmin>
                  <AdminMail />
                </RequireAdmin>
              }
            />

            {/* ========== Catch-All (404) ========== */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
