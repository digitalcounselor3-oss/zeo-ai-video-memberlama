import React, { useState } from 'react';
import { Sparkles, ShoppingBag, Image as ImageIcon, Copy, ArrowRight, Check } from 'lucide-react';
import { APP_NAME } from '../../config/appConfig';

interface OnboardingGuideModalProps {
  isOpen: boolean;
  onClose: (dontShowAgainThisSession: boolean) => void;
}

export const OnboardingGuideModal: React.FC<OnboardingGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleStart = () => {
    onClose(dontShowAgain);
  };

  return (
    <div
      id="modal-onboarding-zeo"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative my-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Selamat Datang di {APP_NAME} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Tiga langkah mudah menyusun prompt video AI profesional
          </p>
        </div>

        {/* 3 Langkah */}
        <div className="space-y-3.5 mb-6">
          {/* Langkah 1 */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              1
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pilih Studio
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                Affiliate & Seller atau Creative Video.
              </p>
            </div>
          </div>

          {/* Langkah 2 */}
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Masukkan Referensi
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                Upload gambar dan ceritakan video yang ingin dibuat.
              </p>
            </div>
          </div>

          {/* Langkah 3 */}
          <div className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-100 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              3
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Copy Prompt
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                Gunakan prompt gambar/video yang dihasilkan pada AI generator pilihan Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Don't show again checkbox */}
        <div className="mb-5 flex items-center justify-center">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              id="cb-dont-show-onboarding"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Jangan tampilkan lagi selama sesi ini</span>
          </label>
        </div>

        {/* Action Button */}
        <button
          type="button"
          id="btn-mulai-zeo"
          onClick={handleStart}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <span>Mulai Menggunakan ZEO</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
