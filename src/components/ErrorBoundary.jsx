import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <p className="text-sm font-bold text-red-700 mb-1">Something went wrong</p>
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2 max-w-md mb-4 font-mono">
            {this.state.error.message}
          </p>
          <p className="text-xs text-np-muted mb-4 max-w-xs">
            This is usually caused by an invalid date or missing value in the Master Config Sheet.
            Check Column D (Joining Date) — use <strong>DD/MM/YYYY</strong> format.
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-np-blue text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={12} /> Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
