import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Terjadi gangguan tak terduga.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let friendly = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message) as { error?: string };
        if (parsed?.error) {
          friendly = parsed.error.includes('Quota exceeded')
            ? 'Kuota harian layanan Cloud Save telah tercapai dan akan direset besok.'
            : parsed.error;
        }
      } catch {
        // Keep original message
      }

      return (
        <div className="fixed inset-0 z-[200] bg-[#16201C] flex items-center justify-center p-6">
          <div className="w-full max-w-md wood-menu-panel rounded-2xl border-[3px] border-[#6E3B1B] shadow-[inset_0_3px_0_#FFFBF2,0_8px_0_#5E2F12] p-6 text-center space-y-4">
            <h2 className="font-display text-xl font-extrabold text-[#5A2D12]">
              Ups, Terjadi Kendala
            </h2>
            <p className="text-sm font-medium text-[#7A4928] break-words">{friendly}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-b from-[#7BB453] to-[#4D8130] border-[2.5px] border-[#385926] shadow-[inset_0_2px_0_#B4E08E,0_3px_0_#385926] text-white font-display font-extrabold text-sm hover:brightness-105 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
