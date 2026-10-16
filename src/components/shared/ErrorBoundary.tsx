import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-em-surface text-em-text-primary text-center select-none">
          <div className="max-w-md w-full p-6 rounded-lg border border-em-error/40 bg-em-error/10 space-y-3">
            <div className="flex items-center justify-center gap-2 text-em-error">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">
                {this.props.fallbackTitle || 'Component Rendering Error'}
              </span>
            </div>
            <p className="text-2xs text-em-text-secondary">
              An error occurred while initializing this component.
            </p>
            <div className="p-2.5 rounded bg-black/60 border border-em-border font-mono text-2xs text-left text-em-text-muted overflow-x-auto max-h-32">
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-em-accent text-em-bg hover:bg-em-accent-hover transition-colors mx-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Render</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
