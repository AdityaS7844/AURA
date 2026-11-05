import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-aura-page)] flex items-center justify-center p-6 text-[var(--color-aura-text)]">
          <div className="max-w-md w-full bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] p-8 shadow-lg text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold font-[var(--font-heading)]">Something went wrong</h2>
              <p className="text-xs text-[var(--color-aura-muted)] mt-1.5 leading-relaxed">
                An unexpected interface error occurred. You can refresh the view or return safely to your dashboard.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-left font-mono text-[11px] text-gray-700 overflow-x-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--color-aura-border)] hover:bg-gray-50 text-[var(--color-aura-text)] transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] text-white shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
