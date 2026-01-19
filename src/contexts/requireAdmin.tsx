/**
 * requireAdmin.tsx
 *
 * Purpose: Route guard that protects admin pages by checking both authentication
 *          and admin role from Firestore.
 *
 * Security:
 * - MUST verify user has role: "admin" in /users/{uid} document
 * - Client-side only - backend Firestore rules provide actual security
 * - Shows loading state while checking auth to prevent flash of unauthorized content
 *
 * Dependencies:
 * - AuthContext: Provides user auth state and role from Firestore
 * - React Router: For navigation/redirects
 *
 * Usage: Wrap protected routes in App.tsx like:
 *   <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();

  // Show nothing while auth state loads (prevents flash of login page)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not admin → redirect to home with message
  // (Could also redirect to a "403 Forbidden" page)
  if (role !== "admin") {
    console.warn("Unauthorized access attempt to admin area");
    return <Navigate to="/" replace />;
  }

  // User is authenticated AND has admin role → allow access
  return <>{children}</>;
};

export default RequireAdmin;
