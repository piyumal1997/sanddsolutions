// src/components/common/ErrorBoundary.jsx
import { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug, faHome, faRedo } from '@fortawesome/free-solid-svg-icons';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Optional: Send to Sentry, LogRocket, etc.
    // Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
          <div className="text-center max-w-lg">
            {/* Bug Icon */}
            <FontAwesomeIcon 
              icon={faBug} 
              className="text-red-600 text-9xl mb-8 animate-pulse" 
            />

            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-4">
              Oops! Something Broke
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              We're sorry, an unexpected error occurred. Our team has been notified.
            </p>

            {/* Helpful Actions */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-full font-medium text-lg hover:bg-green-700 transition shadow-lg transform hover:-translate-y-1"
              >
                <FontAwesomeIcon icon={faHome} />
                Back to Home
              </Link>

              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-full font-medium text-lg hover:bg-green-50 transition shadow-md"
              >
                <FontAwesomeIcon icon={faRedo} />
                Reload Page
              </button>
            </div>

            {/* Optional: Show error details in production? (hide in dev if you want) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-12 p-6 bg-red-50 rounded-xl text-left max-w-2xl mx-auto">
                <p className="text-red-800 font-medium mb-2">Error Details (Dev Mode):</p>
                <pre className="text-sm text-red-700 overflow-auto">
                  {this.state.error.toString()}
                  <br />
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;