import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors in component tree and displays user-friendly error message.
 * Prevents the entire app from crashing and provides recovery options.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log error to error tracking service (if available)
    if (typeof window !== 'undefined' && (window as any).trackError) {
      (window as any).trackError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-6">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We're sorry for the inconvenience. An unexpected error has occurred.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                <h2 className="font-semibold text-sm text-foreground">
                  Error Details
                </h2>
                <pre className="overflow-auto rounded bg-background p-3 text-xs text-destructive">
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>
            </div>

            {/* Support Link */}
            <div className="text-center text-sm text-muted-foreground">
              If the problem persists, please{' '}
              <a
                href="mailto:support@example.com"
                className="text-primary hover:underline"
              >
                contact support
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * withErrorBoundary HOC
 * 
 * Higher-order component to wrap components with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorFallback?: ReactNode,
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
