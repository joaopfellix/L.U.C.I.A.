import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[L.U.C.I.A. Error Boundary Caught Exception]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    try {
      // Clear potentially corrupt local storage entries if needed
      this.setState({ hasError: false, error: null, errorInfo: null });
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08090C] text-[#F5F7FA] flex items-center justify-center p-6 selection:bg-[#303036]">
          <div className="max-w-md w-full bg-[#101217] border border-[#292F3B] rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-[#F5F7FA] tracking-tight">
                Diagnóstico do Sistema L.U.C.I.A.
              </h1>
              <p className="text-xs text-[#A7AFBD] leading-relaxed">
                Ocorreu uma inconsistência na renderização. Os módulos de proteção isolaram o erro para preservar seus dados.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#08090C] border border-[#1E2430] rounded-xl text-left overflow-auto max-h-36">
                <p className="text-[11px] font-mono text-red-400 break-words">
                  {this.state.error.message || 'Erro desconhecido'}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5F7FA] hover:bg-white text-[#08090C] text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reiniciar L.U.C.I.A.</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
