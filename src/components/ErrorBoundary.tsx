/**
 * ErrorBoundary.tsx
 *
 * Catches JavaScript errors in the child tree and shows a fallback UI instead of a white screen.
 * Handles Firestore CORS / network errors and script load failures so users see a message.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error boundary caught:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const msg = this.state.error?.message ?? "Something went wrong";
    const isCorsOrNetwork =
      /access control|CORS|Failed to fetch|Load failed|octet-stream|MIME type/i.test(msg);

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
          {isCorsOrNetwork ? (
            <p className="text-sm text-muted-foreground">
              The site could not connect to its services. This often happens when the page is opened
              from a domain that is not yet authorized. Try:
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{msg}</p>
          )}
          {isCorsOrNetwork && (
            <ul className="text-left text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Add this exact domain in Firebase Console → Project settings → Authorized domains</li>
              <li>Use the full URL (e.g. https://www.tiaassociation.com)</li>
              <li>Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)</li>
            </ul>
          )}
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
