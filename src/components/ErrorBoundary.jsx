import React from 'react'

/**
 * Error boundary that gracefully handles crashes in visualization components.
 * Shows a friendly fallback instead of a blank screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-900/50 border border-red-800/30 rounded-lg p-6 text-center">
          <div className="text-red-400 text-sm font-semibold mb-2">
            {this.props.label || 'Visualization'} failed to load
          </div>
          <p className="text-xs text-slate-500">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700 transition"
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
