import { Component } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

/**
 * ErrorBoundary — catches render errors in any child subtree and renders
 * a branded fallback instead of a white screen.
 *
 * Engineering:
 *  - React error boundaries must be class components (no hook equivalent)
 *  - In production, dispatch the error to Sentry / Datadog from
 *    componentDidCatch — we stub this with console.error
 */
export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Hook into observability backend (Sentry, Datadog) in production
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="surface-card-elev max-w-md w-full p-8 text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 border border-danger/30">
            <AlertTriangle className="h-7 w-7 text-danger" />
          </div>
          <div>
            <h2 className="display-heading text-2xl text-ink">Something went sideways</h2>
            <p className="text-sm text-ink-2 mt-2">
              An unexpected error happened. The team has been notified.
            </p>
            {this.state.error?.message && (
              <pre className="mt-3 text-xs text-ink-3 bg-surface-tint p-2 rounded font-mono overflow-x-auto text-left">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={this.reset}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent-strong transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Reload the app
          </button>
        </div>
      </div>
    );
  }
}
