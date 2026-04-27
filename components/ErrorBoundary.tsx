import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Crash capturé :', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-10 text-center">
            {/* Robot confus */}
            <div className="w-24 h-24 mx-auto mb-6 bg-indigo-50 rounded-full flex items-center justify-center">
              <span className="text-6xl" role="img" aria-hidden="true">
                🤖
              </span>
            </div>

            {/* Message principal */}
            <h1 className="text-xl font-bold text-slate-800 mb-3">
              Oups ! Quelque chose s'est mal passé...
            </h1>

            <p className="text-slate-500 text-base mb-8 leading-relaxed">
              Pas de panique ! Ça arrive même aux meilleurs robots.
              <br />
              Clique sur le bouton pour recommencer.
            </p>

            {/* Bouton recommencer */}
            <button
              onClick={this.handleReload}
              className="
                px-8 py-4 rounded-2xl font-semibold text-lg
                bg-indigo-600 text-white
                hover:bg-indigo-700
                shadow-md shadow-indigo-200
                transition-all duration-200
                active:scale-95
                flex items-center justify-center gap-3
                mx-auto
              "
            >
              <span className="text-2xl">🔄</span>
              Recommencer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
