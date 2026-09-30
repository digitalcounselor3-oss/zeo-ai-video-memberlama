import React from 'react';
import { Sparkles, Video, Wand2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header id="app-header" className="relative pt-6 pb-4 px-4 sm:px-6 text-center max-w-2xl mx-auto">
      {/* Decorative gradient glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none -z-10" 
      />

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-3 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
        <span>by Ms. Inggid</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
        <Video className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 inline-block shrink-0" />
        <span className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
          ZEO — Affiliate & Seller Studio
        </span>
      </h1>

      <p className="mt-1 text-sm sm:text-base font-bold text-slate-800 tracking-wide">
        Video Prompt Generator for Affiliate & Seller
      </p>

      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
        Buat prompt video promosi dari gambar produk, model, Character Sheet, dan screenshot marketplace dengan bantuan AI.
      </p>

      <p className="mt-1.5 text-[11px] font-medium text-slate-400">
        Created by Ms. Inggid
      </p>
    </header>
  );
};
