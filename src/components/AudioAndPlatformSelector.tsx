import React from 'react';
import { Volume2, VolumeX, Mic, Type, FileAudio, Share2, Smartphone } from 'lucide-react';
import { AudioOption, PlatformOption } from '../types';

interface AudioAndPlatformSelectorProps {
  audio: AudioOption;
  onChangeAudio: (a: AudioOption) => void;
  platform: PlatformOption;
  onChangePlatform: (p: PlatformOption) => void;
}

const AUDIO_OPTIONS: { id: AudioOption; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'Tanpa VO', label: 'Tanpa VO', icon: VolumeX },
  { id: 'Pakai Voice Over', label: 'Pakai Voice Over', icon: Mic },
  { id: 'Teks di Video', label: 'Teks di Video', icon: Type },
  { id: 'VO + Teks Video', label: 'VO + Teks Video', icon: FileAudio },
];

const PLATFORM_OPTIONS: { id: PlatformOption; label: string; note: string }[] = [
  { id: 'Semua Platform', label: 'Semua Platform', note: 'Format serbaguna (9:16 vertical)' },
  { id: 'TikTok', label: 'TikTok', note: 'Hook dinamis & tren audio FYP' },
  { id: 'Instagram Reels', label: 'Instagram Reels', note: 'Estetik elegan & visual rapi' },
  { id: 'Shopee Video', label: 'Shopee Video', note: 'Fokus konversi beli & CTA keranjang' },
];

export const AudioAndPlatformSelector: React.FC<AudioAndPlatformSelectorProps> = ({
  audio,
  onChangeAudio,
  platform,
  onChangePlatform,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 6. Audio */}
      <section id="audio-selection-section" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>Audio & Narasi</span>
          </h2>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            {audio}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Tentukan format skrip suara dan teks overlay promosi.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {AUDIO_OPTIONS.map((item) => {
            const isSelected = audio === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`audio-btn-${item.id.replace(/\s+/g, '-').toLowerCase()}`}
                type="button"
                onClick={() => onChangeAudio(item.id)}
                className={`p-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all border text-left flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 7. Platform */}
      <section id="platform-selection-section" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>Target Platform</span>
          </h2>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            {platform}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          AI akan mengoptimalkan pacing & kata kunci sesuai algoritma platform.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {PLATFORM_OPTIONS.map((item) => {
            const isSelected = platform === item.id;
            return (
              <button
                key={item.id}
                id={`platform-btn-${item.id.replace(/\s+/g, '-').toLowerCase()}`}
                type="button"
                onClick={() => onChangePlatform(item.id)}
                className={`p-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all border text-left flex flex-col justify-center ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <Smartphone className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
