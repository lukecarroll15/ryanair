import { Component } from 'react'

export default class ErrorBoundary extends Component {
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
        <div className="flex items-center justify-center h-64">
          <div className="bg-[#0d1b2e] border border-red-500/30 rounded-xl p-8 text-center max-w-md">
            <p className="text-red-400 font-semibold mb-2">Something went wrong</p>
            <p className="text-gray-500 text-sm font-mono">{this.state.error.message}</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
