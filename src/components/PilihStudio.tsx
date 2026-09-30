import React, { useState } from 'react';
import { TopUserBar } from './TopUserBar';
import {
  Sparkles,
  ShoppingBag,
  Film,
  ArrowRight,
  ShieldCheck,
  Tag,
  Store,
  Layers,
  Clapperboard,
  BookOpen,
  UserCheck,
} from 'lucide-react';
import { AppFooter } from './common/AppFooter';
import { HelpModal } from './common/HelpModal';
import { AboutModal } from './common/AboutModal';

interface PilihStudioProps {
  userName: string;
  onSelectStudio: (studio: 'affiliate' | 'creative' | 'zeo-auto') => void;
  onLogout: () => void;
  onOpenByokTest?: () => void;
}

export const PilihStudio: React.FC<PilihStudioProps> = ({
  userName,
  onSelectStudio,
  onLogout,
  onOpenByokTest,
}) => {
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  return (
    <div
      id="page-pilih-studio"
      className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/15 to-slate-100/60 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white"
    >
      {/* Top User Bar */}
      <TopUserBar
        userName={userName}
        onLogout={onLogout}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Header Hero matching Requirement 2 */}
        <div className="text-center mb-8 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>by Ms. Inggid</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            ZEO
          </h1>

          <p className="text-sm sm:text-base font-bold text-indigo-700">
            AI Video Studio
          </p>

          <div className="pt-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Halo, {userName || 'Pengguna'} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Mau membuat video apa hari ini?
            </p>
          </div>
        </div>

        {/* 3 Main Access Cards Grid matching Requirement 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* CARD 1: Affiliate & Seller Studio */}
          <div
            id="card-studio-affiliate"
            className="group relative bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-indigo-500/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  Produk & Jualan
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <span>🛍️</span>
                  <span>Affiliate & Seller Studio</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Prompt video untuk produk, affiliate, seller, fashion, dan promosi.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                type="button"
                id="btn-buka-affiliate-studio"
                onClick={() => onSelectStudio('affiliate')}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer active:scale-[0.99]"
              >
                <span>Buka Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CARD 2: Creative Video Studio */}
          <div
            id="card-studio-creative"
            className="group relative bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-violet-500/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-200 group-hover:scale-105 transition-transform">
                  <Film className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200/80">
                  Preset Kreatif
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-violet-600 transition-colors flex items-center gap-1.5">
                  <span>🎬</span>
                  <span>Creative Video Studio</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Buat video kreatif, edukasi, storytelling, vlog, podcast, animasi, dan lainnya.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                type="button"
                id="btn-buka-creative-studio"
                onClick={() => onSelectStudio('creative')}
                className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-violet-200 transition-all cursor-pointer active:scale-[0.99]"
              >
                <span>Buka Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CARD 3: ZEO AUTO (RECOMMENDED) */}
          <div
            id="card-studio-zeo-auto"
            className="group relative bg-gradient-to-b from-white via-indigo-50/20 to-white rounded-3xl p-6 border-2 border-indigo-300 hover:border-indigo-600 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-300 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                  RECOMMENDED
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <span>✨</span>
                  <span>ZEO AUTO</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Ceritakan idemu dan biarkan ZEO menentukan workflow yang sesuai.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                type="button"
                id="btn-buka-zeo-auto"
                onClick={() => onSelectStudio('zeo-auto')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer active:scale-[0.99]"
              >
                <span>Buka ZEO AUTO</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Security & User Session Note */}
        <div className="mt-8 p-3 rounded-2xl bg-white/80 border border-slate-200/80 flex items-center justify-center gap-2 text-xs text-slate-500 shadow-2xs text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Sesi aktif untuk <strong className="text-slate-800">{userName || 'Pengguna'}</strong> • ZEO v1.0 by Ms. Inggid
          </span>
        </div>

        {/* Development Temporary Button: BYOK Connection Test */}
        {onOpenByokTest && (
          <div className="mt-4 flex justify-center pb-2">
            <button
              type="button"
              id="btn-dev-byok-test"
              onClick={onOpenByokTest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-100/80 hover:bg-indigo-50 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Buka Halaman Test BYOK"
            >
              <span>🧪</span>
              <span>BYOK Connection Test</span>
            </button>
          </div>
        )}
      </main>

      {/* Reusable Compact Footer */}
      <AppFooter
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
  );
};
