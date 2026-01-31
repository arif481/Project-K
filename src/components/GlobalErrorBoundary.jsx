import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', backgroundColor: '#000', color: '#ff003c', minHeight: '100vh', fontFamily: 'monospace' }}>
                    <h1>⚠️ CRITICAL SYSTEM FAILURE</h1>
                    <p>The application encountered a fatal error and has halted.</p>
                    <hr style={{ borderColor: '#333' }} />
                    <h3 style={{ color: '#00f0ff' }}>ERROR LOG:</h3>
                    <pre style={{ backgroundColor: '#111', padding: '10px', overflow: 'auto' }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <h3 style={{ color: '#00f0ff' }}>STACK TRACE:</h3>
                    <pre style={{ backgroundColor: '#111', padding: '10px', overflow: 'auto', fontSize: '10px' }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '20px', padding: '10px 20px', background: '#00f0ff', color: '#000', border: 'none', fontWeight: 'bold' }}
                    >
                        ATTEMPT SYSTEM REBOOT
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
