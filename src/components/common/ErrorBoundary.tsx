import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onBackToStudio?: () => void;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Terjadi kesalahan tidak terduga.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ZEO ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          id="generator-error-boundary"
          className="p-6 sm:p-10 max-w-xl mx-auto my-8 bg-white rounded-3xl border border-rose-200 shadow-xl text-center space-y-4 animate-in fade-in duration-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Terjadi kendala pada generator ini.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Sistem mendeteksi kendala pada komponen ini, namun sesi dan pengaturan studio Anda tetap aman.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              id="btn-error-retry"
              onClick={this.handleRetry}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>

            {this.props.onBackToStudio && (
              <button
                type="button"
                id="btn-error-back-to-studio"
                onClick={() => {
                  this.setState({ hasError: false, errorMessage: '' });
                  this.props.onBackToStudio?.();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Kembali ke Studio</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
