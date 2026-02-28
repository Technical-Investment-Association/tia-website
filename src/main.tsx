import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Suppress FinisherHeader async "element not found" errors (library looks up DOM in setTimeout after unmount)
const originalOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
  if (
    typeof message === "string" &&
    /No\s+\.[\w-]+\s+element\s+found/.test(message) &&
    source?.includes("finisher-header")
  ) {
    return true;
  }
  return originalOnError
    ? originalOnError(message, source, lineno, colno, error)
    : false;
};

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);