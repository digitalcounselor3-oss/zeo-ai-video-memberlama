import React from 'react';
import { Palette, Check, Sparkles, UserCheck, Video, Shirt, Minimize2, Crown, Moon, Flame, Heart, Box } from 'lucide-react';
import { VideoStyle, StyleOptionMeta } from '../types';

interface StyleSelectorProps {
  selectedStyle: VideoStyle;
  onChangeStyle: (style: VideoStyle) => void;
}

const STYLES: (StyleOptionMeta & { icon: React.FC<{ className?: string }> })[] = [
  {
    id: 'Otomatis',
    label: 'Otomatis',
    description: 'AI menentukan gaya visual paling optimal sesuai jenis produk.',
    badge: 'Rekomendasi',
    popular: true,
    icon: Sparkles,
  },
  {
    id: 'Affiliate Natural',
    label: 'Affiliate Natural',
    description: 'Suasana santai sehari-hari, autentik dan terpercaya ala review kreator.',
    icon: UserCheck,
  },
  {
    id: 'UGC',
    label: 'UGC',
    description: 'User-Generated Content hand-held, sudut pandang orang pertama (POV).',
    icon: Video,
  },
  {
    id: 'Fashion Commercial',
    label: 'Fashion Commercial',
    description: 'Pencahayaan studio catwalk, pose dinamis, elegan menonjolkan fitting baju.',
    icon: Shirt,
  },
  {
    id: 'Clean Minimalist',
    label: 'Clean Minimalist',
    description: 'Latar belakang bersih, komposisi rapi dan fokus pada detail utama barang.',
    icon: Minimize2,
  },
  {
    id: 'Luxury Cinematic',
    label: 'Luxury Cinematic',
    description: 'Grading film sinematik hangat, depth of field tinggi, visual mahal.',
    icon: Crown,
  },
  {
    id: 'Dark Premium',
    label: 'Dark Premium',
    description: 'Nuansa gelap dramatis dengan rim light tajam untuk gadget & aksesoris.',
    icon: Moon,
  },
  {
    id: 'Street Fashion',
    label: 'Street Fashion',
    description: 'Urban outdoor, transisi cepat, energik dan trendi untuk audiens muda.',
    icon: Flame,
  },
  {
    id: 'Aesthetic',
    label: 'Aesthetic',
    description: 'Tone pastel lembut, ambient sunlight dreamy dan nyaman dipandang.',
    icon: Heart,
  },
  {
    id: 'Product Showcase',
    label: 'Product Showcase',
    description: 'Rotasi 360°, close-up tekstur, dan sorotan fitur fungsional produk.',
    icon: Box,
  },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onChangeStyle,
}) => {
  return (
    <section id="style-selection-section" className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-600" />
          <span>Gaya Video</span>
        </h2>
        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
          Pilihan: {selectedStyle}
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Tentukan mood dan atmosfer visual promosi. Jika memilih &ldquo;Otomatis&rdquo;, AI akan menyesuaikan dengan gambar produk.
      </p>

      {/* Grid Cards for Mobile & Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;
          const IconComp = style.icon;

          return (
            <div
              key={style.id}
              id={`style-card-${style.id.replace(/\s+/g, '-').toLowerCase()}`}
              role="button"
              tabIndex={0}
              onClick={() => onChangeStyle(style.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onChangeStyle(style.id);
                }
              }}
              className={`relative p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none flex items-start gap-3 min-h-[58px] ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/30'
                  : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50/70'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50'
                }`}
              >
                <IconComp className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {style.label}
                  </span>
                  {style.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold bg-indigo-100 text-indigo-700">
                      {style.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                  {style.description}
                </p>
              </div>

              {/* Selection Indicator */}
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
