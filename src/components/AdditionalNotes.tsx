import React from 'react';
import { MessageSquareText } from 'lucide-react';

interface AdditionalNotesProps {
  value: string;
  onChange: (val: string) => void;
}

export const AdditionalNotes: React.FC<AdditionalNotesProps> = ({ value, onChange }) => {
  return (
    <section id="additional-notes-section" className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="additional-notes-input" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 cursor-pointer">
          <MessageSquareText className="w-5 h-5 text-indigo-600" />
          <span>Catatan Tambahan</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-normal bg-slate-100 text-slate-500 border border-slate-200">
            Opsional
          </span>
        </label>
        <span className="text-xs text-slate-400">
          {value.length}/500
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-2.5">
        Instruksi khusus untuk AI dalam memformulasikan alur dan fokus visual video.
      </p>

      <textarea
        id="additional-notes-input"
        rows={3}
        maxLength={500}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Contoh: model memakai produk, tampilkan semua warna, buat gaya soft selling, jangan ubah motif produk."
        className="w-full text-sm p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
      />
    </section>
  );
};
