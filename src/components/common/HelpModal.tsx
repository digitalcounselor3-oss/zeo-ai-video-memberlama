import React from 'react';
import { X, HelpCircle, ArrowDown, Sparkles, ShoppingBag, Clapperboard, Layers, Image as ImageIcon, Video } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const creativeFlow = [
    { label: 'IDE', desc: 'Konsep atau cerita video' },
    { label: 'PROMPT KARAKTER', desc: 'Master Character Sheet' },
    { label: 'PROMPT LOKASI', desc: 'Master Setting & Suasana' },
    { label: 'PROMPT GAMBAR SCENE', desc: 'Visual awal tiap adegan' },
    { label: 'BUAT GAMBAR REFERENSI', desc: 'Generate di AI Image generator' },
    { label: 'PROMPT VIDEO', desc: 'Instruksi gerak & kamera' },
    { label: 'BUAT VIDEO', desc: 'Render di Kling, Veo, Luma, Minimax, dll' },
  ];

  return (
    <div
      id="modal-bantuan-zeo"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          id="btn-close-help-modal"
          onClick={onClose}
          aria-label="Tutup bantuan"
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Cara Menggunakan ZEO
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Panduan alur pembuatan prompt video AI
            </p>
          </div>
        </div>

        <div className="space-y-6 text-slate-700">
          {/* Section 1: Alur Dua Studio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Affiliate */}
            <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-2">
              <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span>Affiliate & Seller</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                Upload produk/referensi → atur video → Generate → Copy Prompt.
              </p>
            </div>

            {/* Creative */}
            <div className="p-4 rounded-2xl border border-violet-100 bg-violet-50/40 space-y-2">
              <div className="flex items-center gap-2 text-violet-800 font-bold text-sm">
                <Clapperboard className="w-4 h-4 text-violet-600" />
                <span>Creative Video</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                Pilih preset atau ZEO AUTO → upload referensi → tulis ide → Generate → buat gambar referensi → gunakan Prompt Video.
              </p>
            </div>
          </div>

          {/* Section 2: Kenapa ada Prompt Gambar & Apa itu Prompt Video */}
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <h3>Kenapa ada Prompt Gambar?</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong>Prompt Gambar digunakan untuk membantu membuat Character Sheet, lokasi, dan frame referensi agar visual video lebih konsisten.</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Video className="w-4 h-4 text-violet-600" />
                <h3>Apa itu Prompt Video?</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong>Prompt Video berisi instruksi gerakan, kamera, aksi, dialog, audio, dan kontinuitas untuk membantu membuat video AI.</strong>
              </p>
            </div>
          </div>

          {/* Section 3: Workflow Creative Diagram */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Alur Workflow Creative
              </span>
              <span className="text-[11px] font-semibold text-indigo-600">
                Langkah Demi Langkah
              </span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 pt-1">
              {creativeFlow.map((step, idx) => (
                <React.Fragment key={step.label}>
                  <div className="w-full max-w-sm py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-2xs hover:border-indigo-300 transition-colors">
                    <div className="text-xs font-black text-slate-800 tracking-wide">
                      {step.label}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {step.desc}
                    </div>
                  </div>
                  {idx < creativeFlow.length - 1 && (
                    <div className="text-indigo-500 py-0.5">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Footer button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm cursor-pointer transition-colors shadow-2xs"
          >
            Tutup Bantuan
          </button>
        </div>
      </div>
    </div>
  );
};
