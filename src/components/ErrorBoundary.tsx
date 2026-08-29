import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lumière Application Error Caught by Boundary:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6" style={{ fontFamily: 'var(--font-sans, sans-serif)' }}>
          <div className="max-w-lg w-full bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-xl">
            {/* Logo Icon */}
            <div className="w-16 h-16 bg-warm-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-warm-600">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-3xl text-stone-900 font-semibold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display, serif)' }}>
              Something Went Wrong
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed mb-8">
              We encountered an unexpected error while loading this section. Please try refreshing the page or returning to the home page.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={this.handleReload}
                className="bg-stone-900 text-white px-7 py-3 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="border border-stone-200 text-stone-700 px-7 py-3 rounded-xl text-sm font-medium hover:border-stone-400 hover:bg-stone-50 transition-colors"
              >
                Return to Home
              </button>
            </div>

            {/* Error detail accordion for development */}
            {this.state.error && (
              <details className="text-left bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs text-stone-600 mt-4 cursor-pointer">
                <summary className="font-medium text-stone-700 select-none">Technical error details</summary>
                <pre className="mt-2 overflow-x-auto text-[11px] text-red-600 whitespace-pre-wrap font-mono">
                  {this.state.error.message || String(this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
