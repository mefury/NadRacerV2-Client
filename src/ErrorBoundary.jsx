import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary p-6 bg-background rounded-lg max-w-xl mx-auto my-4 text-foreground shadow-lg border border-error">
          <h2 className="text-xl font-bold text-error mb-4">Something went wrong</h2>
          <div className="bg-muted p-4 rounded mb-4 overflow-auto max-h-60">
            <p className="text-error mb-2">{this.state.error && this.state.error.toString()}</p>
            <details className="text-muted-foreground text-sm">
              <summary className="cursor-pointer text-foreground mb-2">Error Details</summary>
              <pre className="whitespace-pre-wrap">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded"
            >
              Reload Page
            </button>
            {this.props.onClose && (
              <button
                onClick={this.props.onClose}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded"
              >
                Close
              </button>
            )}
          </div>
        </div>
      );
    }

    // If there's no error, render the children
    return this.props.children;
  }
}

export default ErrorBoundary; 