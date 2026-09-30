import React, { useState, useMemo } from 'react';
import { TopUserBar } from './TopUserBar';
import {
  Film,
  Sparkles,
  ArrowLeft,
  Search,
  Clapperboard,
  SlidersHorizontal,
  Wand2,
  ArrowRight,
} from 'lucide-react';
import { CreativeVideoTypeMeta, CreativeCategory, CreativeFormState } from '../creativeTypes';
import { CREATIVE_VIDEO_TYPES } from '../data/creativeTypesData';
import { CreativeTypeCard } from './creative/CreativeTypeCard';
import { CreativeFormUniversal } from './creative/CreativeFormUniversal';
import { ShortDramaForm } from './creative/ShortDramaForm';
import { TeacherPresenterForm } from './creative/TeacherPresenterForm';
import { FoodPreparationForm } from './creative/FoodPreparationForm';
import { MusicLyricVisualForm } from './creative/MusicLyricVisualForm';
import { ZeoAutoStudio } from './creative/ZeoAutoStudio';
import { AppFooter } from './common/AppFooter';
import { HelpModal } from './common/HelpModal';
import { AboutModal } from './common/AboutModal';

interface CreativeStudioProps {
  userName: string;
  onBackToPilihStudio: () => void;
  onLogout: () => void;
  initialZeoAuto?: boolean;
}

export const CreativeStudio: React.FC<CreativeStudioProps> = ({
  userName,
  onBackToPilihStudio,
  onLogout,
  initialZeoAuto = false,
}) => {
  // Navigation & Selection State
  const [isZeoAutoActive, setIsZeoAutoActive] = useState<boolean>(initialZeoAuto);
  const [selectedVideoType, setSelectedVideoType] = useState<CreativeVideoTypeMeta | null>(null);
  const [autoTransferredData, setAutoTransferredData] = useState<Partial<CreativeFormState> | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  // Sync if initialZeoAuto changes from outside
  React.useEffect(() => {
    setIsZeoAutoActive(initialZeoAuto);
  }, [initialZeoAuto]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CreativeCategory>('Semua');

  const categories: CreativeCategory[] = [
    'Semua',
    'Story',
    'Creator',
    'Education',
    'Animation',
    'Visual',
  ];

  // Filtered Cards Logic
  const filteredTypes = useMemo(() => {
    return CREATIVE_VIDEO_TYPES.filter((item) => {
      const matchCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenPresetFromAuto = (
    videoType: CreativeVideoTypeMeta,
    initialData?: Partial<CreativeFormState>
  ) => {
    setIsZeoAutoActive(false);
    setAutoTransferredData(initialData || null);
    setSelectedVideoType(videoType);
  };

  return (
    <div
      id="page-creative-studio"
      className="min-h-screen bg-gradient-to-b from-slate-50 via-purple-50/15 to-slate-100 flex flex-col justify-between font-sans selection:bg-purple-500 selection:text-white"
    >
      {/* Top User Bar */}
      <TopUserBar
        userName={userName}
        onLogout={onLogout}
        onBackToPilihStudio={onBackToPilihStudio}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        currentStudioName={
          isZeoAutoActive
            ? 'Creative Studio: ✨ ZEO AUTO'
            : selectedVideoType
            ? `Creative Studio: ${selectedVideoType.title}`
            : 'Creative Video Studio'
        }
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {isZeoAutoActive ? (
          /* Sub-Page: ZEO AUTO */
          <ZeoAutoStudio
            userName={userName}
            onBackToCreativeStudio={() => setIsZeoAutoActive(false)}
            onBackToPilihStudio={onBackToPilihStudio}
            onOpenPresetMode={handleOpenPresetFromAuto}
          />
        ) : selectedVideoType ? (
          /* Sub-Page: Buat [Nama Jenis Video] */
          selectedVideoType.id === 'short-drama' ? (
            <ShortDramaForm
              videoType={selectedVideoType}
              userName={userName}
              onBackToCreativeStudio={() => {
                setSelectedVideoType(null);
                setAutoTransferredData(null);
              }}
              onBackToPilihStudio={onBackToPilihStudio}
              initialFormData={autoTransferredData || undefined}
            />
          ) : selectedVideoType.id === 'teacher-presenter' ? (
            <TeacherPresenterForm
              videoType={selectedVideoType}
              userName={userName}
              onBackToCreativeStudio={() => {
                setSelectedVideoType(null);
                setAutoTransferredData(null);
              }}
              onBackToPilihStudio={onBackToPilihStudio}
              initialFormData={autoTransferredData || undefined}
            />
          ) : selectedVideoType.id === 'food-preparation' ? (
            <FoodPreparationForm
              videoType={selectedVideoType}
              userName={userName}
              onBackToPilihStudio={() => {
                setSelectedVideoType(null);
                setAutoTransferredData(null);
              }}
            />
          ) : selectedVideoType.id === 'lyric-visual' ? (
            <MusicLyricVisualForm
              videoType={selectedVideoType}
              userName={userName}
              onBackToPilihStudio={() => {
                setSelectedVideoType(null);
                setAutoTransferredData(null);
              }}
            />
          ) : (
            <CreativeFormUniversal
              videoType={selectedVideoType}
              userName={userName}
              onBackToCreativeStudio={() => {
                setSelectedVideoType(null);
                setAutoTransferredData(null);
              }}
              onBackToPilihStudio={onBackToPilihStudio}
              initialFormData={autoTransferredData || undefined}
            />
          )
        ) : (
          /* Main Page: Daftar 18 Jenis Video Kreatif dengan ZEO AUTO Paling Atas */
          <div className="space-y-6 sm:space-y-8">
            {/* Top Navigation Strip */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                id="btn-creative-back-to-pilih"
                onClick={onBackToPilihStudio}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-violet-600" />
                <span>← Pilih Studio</span>
              </button>

              <span className="text-xs font-semibold text-slate-500">
                18 Preset + Mode Auto Tersedia
              </span>
            </div>

            {/* Header */}
            <div className="text-center space-y-2.5 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/80 text-violet-700 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                <span>by Ms. Inggid</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Film className="w-7 h-7 sm:w-8 sm:h-8 text-violet-600 shrink-0" />
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  <span className="bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                    ZEO — Creative Video Studio
                  </span>
                </h1>
              </div>

              <p className="text-sm sm:text-base font-semibold text-slate-700 max-w-lg mx-auto leading-relaxed">
                Pilih konsep, masukkan referensi, lalu ZEO membantu menyusun prompt video AI.
              </p>

              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Eksplorasi cerita, drama, vlog, edukasi, animasi, dan berbagai konsep video kreatif tanpa batas produk.
              </p>
            </div>

            {/* ZEO AUTO — FEATURE CARD PALING ATAS & LEBIH MENONJOL */}
            <div
              id="card-zeo-auto-featured"
              onClick={() => setIsZeoAutoActive(true)}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-950 p-6 sm:p-7 text-white shadow-xl border-2 border-violet-500/50 hover:border-violet-300 transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:-translate-y-0.5"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-violet-600/30 blur-3xl pointer-events-none group-hover:bg-violet-500/40 transition-all" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-xs tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                      <span>RECOMMENDED</span>
                    </span>
                    <span className="text-xs font-bold text-violet-300">
                      Paling Praktis
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>✨ ZEO AUTO</span>
                  </h2>

                  <p className="text-sm sm:text-base font-bold text-violet-100 leading-snug">
                    Belum tahu harus memilih preset yang mana? Ceritakan idemu dan biarkan ZEO memilihkannya.
                  </p>

                  <p className="text-xs text-violet-300 leading-relaxed">
                    Tidak perlu bingung memilih preset terlebih dahulu. Cukup upload referensi gambar dan tulis idemu, ZEO akan menganalisis kebutuhan dan menyusun Storyboard, Character Sheet, Master Location, serta Prompt Video AI secara lengkap.
                  </p>
                </div>

                <div className="shrink-0 flex items-center">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all group-hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>Mulai dengan ZEO AUTO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Separator / Subtitle for Presets */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  Atau Pilih Preset Manual (18 Jenis Video)
                </h3>
                <p className="text-xs text-slate-500">
                  Gunakan preset spesifik jika Anda sudah tahu format video yang diinginkan.
                </p>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="space-y-3">
              {/* Search Box */}
              <div className="relative max-w-xl mx-auto">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="input-search-creative-type"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔎 Cari Jenis Video (contoh: vlog, drama, edukasi, ASMR...)"
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white shadow-2xs placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:bg-violet-50/20'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 18 Grid Cards */}
            {filteredTypes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pt-2">
                {filteredTypes.map((item) => (
                  <CreativeTypeCard
                    key={item.id}
                    item={item}
                    onSelect={(selected) => setSelectedVideoType(selected)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Clapperboard className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">
                  Tidak ada jenis video yang cocok dengan pencarian "{searchQuery}"
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Semua');
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-50 text-violet-700 font-bold text-xs hover:bg-violet-100 transition-colors cursor-pointer"
                >
                  Tampilkan Semua Jenis Video
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* App Footer */}
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
