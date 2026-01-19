/**
 * AuthContext.tsx
 *
 * Purpose: Global authentication state management for TIA website
 *
 * Provides:
 * - user: Firebase User object (null if not authenticated)
 * - role: User's role from /users/{uid} document ("admin" | "member" | null)
 * - loading: Whether auth state is still initializing
 * - previewAsPublic: Admin toggle to preview site as non-admin (future feature)
 *
 * Security:
 * - Role is fetched from Firestore /users/{uid} which only admins can write to
 * - Client-side role check is for UX only - Firestore rules enforce actual permissions
 * - Loading state prevents flash of wrong content during auth initialization
 *
 * Dependencies:
 * - Firebase Auth: Authentication state
 * - Firebase Firestore: User role storage
 *
 * Usage:
 * - Wrap app in <AuthProvider> in main.tsx or App.tsx
 * - Use `const { user, role, loading } = useAuth()` in components
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/firebase";

type Role = "admin" | "member" | null;

type AuthContextValue = {
  user: User | null;
  role: Role;
  loading: boolean;
  previewAsPublic: boolean;
  setPreviewAsPublic: (value: boolean) => void;
  // Helper functions
  isAdmin: () => boolean;
  getUserEmail: () => string | null;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
  previewAsPublic: false,
  setPreviewAsPublic: () => {
    throw new Error("AuthContext not initialized");
  },
  isAdmin: () => false,
  getUserEmail: () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const [previewAsPublic, setPreviewAsPublic] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch user's role from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          const userRole = data.role as Role;
          setRole(userRole ?? null);
        } else {
          // User doc doesn't exist - they're not assigned a role yet
          console.warn(`No user document found for UID: ${firebaseUser.uid}`);
          setRole(null);
        }
      } catch (err) {
        console.error("Failed to load user role:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // Helper: Check if current user is admin
  const isAdmin = () => {
    return role === "admin" && !previewAsPublic;
  };

  // Helper: Get current user's email (useful for audit logs)
  const getUserEmail = () => {
    return user?.email ?? null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        previewAsPublic,
        setPreviewAsPublic,
        isAdmin,
        getUserEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
