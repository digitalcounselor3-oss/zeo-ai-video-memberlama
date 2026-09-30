import React from 'react';
import { X, Sparkles, Shield, Info } from 'lucide-react';
import { APP_NAME, APP_SUBTITLE, APP_CREATOR, APP_VERSION } from '../../config/appConfig';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-tentang-zeo"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative my-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          id="btn-close-about-modal"
          onClick={onClose}
          aria-label="Tutup Tentang ZEO"
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-600 flex items-center justify-center text-white mx-auto shadow-md font-black text-lg tracking-wider">
            ZEO
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {APP_NAME}
          </h2>

          <p className="text-sm font-bold text-indigo-700">
            {APP_SUBTITLE}
          </p>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <span>{APP_VERSION}</span>
          </div>
        </div>

        {/* Core Description */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 text-center sm:text-left">
            <strong>ZEO adalah alat bantu penyusun prompt gambar dan video AI untuk creator, affiliate, seller, guru, dan pengguna kreatif.</strong>
          </p>

          <div className="text-center py-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200/80">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Created by {APP_CREATOR}</span>
            </span>
          </div>

          {/* Disclaimer Section */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2 text-[11px] sm:text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Disclaimer</span>
            </div>
            <p className="leading-relaxed">
              ZEO menggunakan teknologi AI untuk membantu penyusunan prompt. Hasil akhir dapat berbeda tergantung model AI, referensi, dan layanan yang digunakan.
            </p>
            <p className="leading-relaxed text-amber-800/90">
              ZEO bukan merupakan produk resmi Google.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm cursor-pointer transition-colors shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
