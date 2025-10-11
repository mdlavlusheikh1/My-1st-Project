'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600">The application encountered an unexpected error.</p>
            </div>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Error Details:</h2>
                <p className="text-red-700 font-mono text-sm">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                  window.location.reload();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Reload Page
              </button>
              
              <button
                onClick={() => {
                  window.location.href = '/debug';
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Go to Debug Page
              </button>
            </div>

            {/* Technical Details (Collapsible) */}
            <details className="mt-6">
              <summary className="cursor-pointer text-gray-700 font-medium">
                Technical Details (Click to expand)
              </summary>
              <div className="mt-4 bg-gray-100 p-4 rounded border">
                <div className="text-sm">
                  <h3 className="font-semibold mb-2">Error Message:</h3>
                  <pre className="whitespace-pre-wrap text-red-600 mb-4">
                    {this.state.error?.message}
                  </pre>
                  
                  <h3 className="font-semibold mb-2">Stack Trace:</h3>
                  <pre className="whitespace-pre-wrap text-gray-600 text-xs overflow-auto max-h-40">
                    {this.state.error?.stack}
                  </pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h3 className="font-semibold mb-2 mt-4">Component Stack:</h3>
                      <pre className="whitespace-pre-wrap text-gray-600 text-xs overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;