import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Dashboard error:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 14, marginBottom: 24 }}>
            An unexpected error occurred. Please refresh the page.
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            style={{
              padding: '8px 20px',
              background: '#4F6EF7',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
