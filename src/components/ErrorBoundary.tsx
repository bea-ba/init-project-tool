import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // In production, you could send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    this.handleReset();
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Card className="max-w-2xl w-full p-8 space-y-6 border-destructive/20">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                <p className="text-slate-400 mt-1">
                  The app encountered an unexpected error
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-300 mb-2">Error Details</h2>
                <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                  <p className="text-sm text-red-400 font-mono">
                    {this.state.error?.message || 'Unknown error'}
                  </p>
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="space-y-2">
                  <summary className="text-sm font-semibold text-slate-300 cursor-pointer hover:text-white">
                    Stack Trace (Development Only)
                  </summary>
                  <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800 overflow-auto max-h-64">
                    <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Don't worry, your data is safe. Try refreshing the page or going back to the home screen.
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 text-center">
                If this problem persists, please report it to the development team
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
