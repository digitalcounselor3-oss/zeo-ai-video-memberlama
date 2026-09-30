import React from 'react';
import { X, Key, ExternalLink, AlertCircle } from 'lucide-react';
import { GOOGLE_AI_STUDIO_URL } from '../../config/appConfig';

interface ApiKeyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyGuideModal: React.FC<ApiKeyGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    '1. Buka Google AI Studio',
    '2. Login menggunakan akun Google Anda',
    '3. Buka menu API Keys',
    '4. Pilih Create API Key',
    '5. Pilih/buat project jika diminta',
    '6. Copy API Key yang dibuat',
    '7. Kembali ke ZEO',
    '8. Paste API Key pada kolom Gemini API Key',
    '9. Tekan TES & MASUK ZEO',
  ];

  return (
    <div
      id="modal-cara-dapat-key"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 relative my-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          id="btn-close-modal-guide"
          onClick={onClose}
          aria-label="Tutup panduan API Key"
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Cara Mendapatkan Gemini API Key
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Langkah mudah membuat key resmi di Google AI Studio
            </p>
          </div>
        </div>

        <ol className="space-y-2 text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-2">
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-4 p-3 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 text-xs leading-relaxed flex items-start gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Catatan:</strong> Tampilan Google AI Studio dapat berubah sewaktu-waktu. Cari menu API Keys jika posisi tombol berbeda.
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
          <a
            href={GOOGLE_AI_STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-buka-ai-studio"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <span>Buka Google AI Studio</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
