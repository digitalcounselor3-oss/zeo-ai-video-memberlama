import React, { useState, useId, useRef } from 'react';
import {
  Sparkles,
  ArrowLeft,
  UploadCloud,
  X,
  Lock,
  Film,
  Users,
  Clock,
  Smartphone,
  Palette,
  Coins,
  FileText,
  Paperclip,
  Dice5,
  AlertCircle,
  CheckCircle2,
  Check,
  ChevronRight,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import {
  CreativeAnalysisResult,
  CreativeVideoTypeMeta,
} from '../../creativeTypes';
import { UploadedImage } from '../../types';
import { CreativeResultViewer } from './CreativeResultViewer';

interface ShortDramaFormProps {
  videoType: CreativeVideoTypeMeta;
  userName: string;
  onBackToCreativeStudio: () => void;
  onBackToPilihStudio: () => void;
  initialFormData?: any;
}

const GENRE_OPTIONS = [
  'CEO',
  'Romantis',
  'Keluarga',
  'Balas Dendam',
  'Perselingkuhan',
  'Pernikahan Kontrak',
  'Miskin vs Kaya',
  'Sekolah',
  'Kampus',
  'Persahabatan',
  'Inspiratif',
  'Religi',
  'Komedi',
  'Horor',
  'Misteri',
  'Fantasi',
  'Kerajaan',
  'Mafia',
  'Aksi',
  'Custom',
  '🎲 Acak',
];

const VIRAL_THEME_OPTIONS = [
  'Orang Miskin Diremehkan',
  'CEO Menyamar',
  'Anak Durhaka',
  'Mertua Jahat',
  'Perselingkuhan',
  'Sahabat Pengkhianat',
  'Warisan Keluarga',
  'Cinta Beda Status',
  'Perebutan Harta',
  'Rahasia Keluarga',
  'Balas Dendam Mantan',
  'Bullying Sekolah',
  'Guru Inspiratif',
  'Anak Yatim',
  'Sedekah Berbuah Keajaiban',
  'Kehidupan Santri',
  'Kebaikan Dibalas Kebaikan',
  'Custom',
  '🎲 Acak',
];

const VISUAL_STYLE_OPTIONS = [
  'Realistic',
  'Cinematic',
  'Indonesian Drama',
  'K-Drama',
  'C-Drama',
  'Donghua',
  'Anime',
  'Manhwa',
  'Webtoon',
  'Pixar-style 3D',
  'Disney-inspired 3D',
  'Clay Animation',
  'Fantasy Cinematic',
  'Royal Kingdom',
  'Game Cinematic',
  'Semi Realistic Illustration',
  'Novel Cover Style',
  'Custom',
  '🎲 Acak',
];

const PLATFORMS = [
  { id: 'TikTok', name: 'TikTok', aspect: '9:16' },
  { id: 'YouTube Shorts', name: 'YouTube Shorts', aspect: '9:16' },
  { id: 'Facebook Reels', name: 'Facebook Reels', aspect: '9:16' },
  { id: 'Instagram Reels', name: 'Instagram Reels', aspect: '9:16' },
  { id: 'YouTube Landscape', name: 'YouTube Landscape', aspect: '16:9' },
];

const TOTAL_DURATIONS = [
  '1 menit',
  '2 menit',
  '3 menit',
  '5 menit',
  '10 menit',
  'Custom',
];

const SCENE_DURATIONS = [
  '5 detik',
  '8 detik',
  '10 detik',
  '15 detik',
  'Custom',
];

interface DramaCharacterSlot {
  id: string;
  name: string;
  role: string;
  description: string;
  image: UploadedImage | null;
}

export const ShortDramaForm: React.FC<ShortDramaFormProps> = ({
  videoType,
  userName,
  onBackToCreativeStudio,
  onBackToPilihStudio,
  initialFormData,
}) => {
  // 1. Cerita State
  const [genre, setGenre] = useState<string>('CEO');
  const [customGenre, setCustomGenre] = useState<string>('');

  const [viralTheme, setViralTheme] = useState<string>('Orang Miskin Diremehkan');
  const [customViralTheme, setCustomViralTheme] = useState<string>('');

  // 2. Karakter State (2, 3, 4, 5, Auto)
  const [characterCount, setCharacterCount] = useState<string>('3');
  const [characters, setCharacters] = useState<DramaCharacterSlot[]>([
    { id: 'char-1', name: '', role: 'Tokoh Utama / Protagonis', description: '', image: null },
    { id: 'char-2', name: '', role: 'Antagonis', description: '', image: null },
    { id: 'char-3', name: '', role: 'Keluarga / Pendukung', description: '', image: null },
  ]);

  // 3. Durasi State
  const [totalDuration, setTotalDuration] = useState<string>('3 menit');
  const [customTotalMinutes, setCustomTotalMinutes] = useState<number>(3);

  const [sceneDuration, setSceneDuration] = useState<string>('10 detik');
  const [customSceneSeconds, setCustomSceneSeconds] = useState<number>(10);

  // 4. Platform & Aspect Ratio
  const [platform, setPlatform] = useState<string>('TikTok');

  // 5. Visual Style
  const [visualStyle, setVisualStyle] = useState<string>('Indonesian Drama');
  const [customVisualStyle, setCustomVisualStyle] = useState<string>('');

  // 6. Mode Produksi (Super Hemat, Hemat, Normal, Premium)
  const [productionMode, setProductionMode] = useState<'SUPER HEMAT' | 'HEMAT' | 'NORMAL' | 'PREMIUM'>('HEMAT');

  // 7. Ide Cerita (Opsional)
  const [storyIdea, setStoryIdea] = useState<string>('');

  // 8. Referensi Tambahan (Max 6)
  const [references, setReferences] = useState<UploadedImage[]>([]);

  // Generation & Status State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStepText, setSubmitStepText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<CreativeAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false);
  const [pendingBackAction, setPendingBackAction] = useState<(() => void) | null>(null);

  // File upload input ref
  const refFileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper: Calculate Total Seconds
  const getTotalSeconds = (): number => {
    if (totalDuration === 'Custom') {
      return (customTotalMinutes || 1) * 60;
    }
    const mins = parseInt(totalDuration, 10);
    return (isNaN(mins) ? 3 : mins) * 60;
  };

  // Helper: Calculate Scene Seconds
  const getSceneSeconds = (): number => {
    if (sceneDuration === 'Custom') {
      return customSceneSeconds || 10;
    }
    const secs = parseInt(sceneDuration, 10);
    return isNaN(secs) ? 10 : secs;
  };

  // Calculate Scene Estimation
  const totalSecs = getTotalSeconds();
  const sceneSecs = getSceneSeconds();
  const estimatedSceneCount = Math.max(1, Math.ceil(totalSecs / sceneSecs));
  const remainder = totalSecs % sceneSecs;

  // Sync character slots count
  const handleCharacterCountChange = (countStr: string) => {
    setCharacterCount(countStr);
    if (countStr === 'Auto') return;

    const countNum = parseInt(countStr, 10);
    if (isNaN(countNum)) return;

    setCharacters((prev) => {
      const updated = [...prev];
      if (updated.length < countNum) {
        for (let i = updated.length; i < countNum; i++) {
          updated.push({
            id: `char-${i + 1}`,
            name: '',
            role: i === 0 ? 'Tokoh Utama' : i === 1 ? 'Antagonis' : `Karakter ${i + 1}`,
            description: '',
            image: null,
          });
        }
      } else if (updated.length > countNum) {
        return updated.slice(0, countNum);
      }
      return updated;
    });
  };

  // Helper to get platform aspect ratio
  const getSelectedAspectRatio = (): string => {
    const p = PLATFORMS.find((item) => item.id === platform);
    return p ? p.aspect : '9:16';
  };

  // Randomize helper
  const getRandomItem = <T,>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  // Single Randomizers
  const randomizeGenre = () => {
    const valid = GENRE_OPTIONS.filter((g) => g !== 'Custom' && g !== '🎲 Acak');
    setGenre(getRandomItem(valid));
  };

  const randomizeViralTheme = () => {
    const valid = VIRAL_THEME_OPTIONS.filter((t) => t !== 'Custom' && t !== '🎲 Acak');
    setViralTheme(getRandomItem(valid));
  };

  const randomizeVisual = () => {
    const valid = VISUAL_STYLE_OPTIONS.filter((v) => v !== 'Custom' && v !== '🎲 Acak');
    setVisualStyle(getRandomItem(valid));
  };

  // 10. ACAK SEMUA: Acak Genre, Tema Viral, Karakter, Visual (Durasi, Platform, Mode Produksi TIDAK diacak)
  const handleAcakSemua = () => {
    randomizeGenre();
    randomizeViralTheme();
    randomizeVisual();
    // Karakter: pick between 2, 3, 4, or Auto
    const randomCharCounts = ['2', '3', '4', 'Auto'];
    const chosenCount = getRandomItem(randomCharCounts);
    handleCharacterCountChange(chosenCount);
  };

  // Character file upload handler
  const handleCharacterImageUpload = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran file maksimal 15MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCharacters((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          image: {
            id: `char-img-${Date.now()}-${index}`,
            name: file.name,
            size: file.size,
            base64,
            previewUrl: base64,
            mimeType: file.type || 'image/jpeg',
          },
        };
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // References upload handler (Max 6)
  const handleAdditionalReferencesUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 6 - references.length;
    if (remainingSlots <= 0) {
      alert('Maksimal 6 file referensi tambahan');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    filesToProcess.forEach((file) => {
      if (file.size > 15 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setReferences((prev) => {
          if (prev.length >= 6) return prev;
          return [
            ...prev,
            {
              id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: file.name,
              size: file.size,
              base64,
              previewUrl: base64,
              mimeType: file.type || 'image/jpeg',
            },
          ];
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Remove reference
  const handleRemoveReference = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const effectiveGenre = genre === 'Custom' ? customGenre.trim() || 'Drama' : genre;
    const effectiveViralTheme = viralTheme === 'Custom' ? customViralTheme.trim() || 'Konflik Emosional' : viralTheme;
    const effectiveVisualStyle = visualStyle === 'Custom' ? customVisualStyle.trim() || 'Indonesian Drama' : visualStyle;
    const effectiveTotalDuration = totalDuration === 'Custom' ? `${customTotalMinutes} menit` : totalDuration;
    const effectiveSceneDuration = sceneDuration === 'Custom' ? `${customSceneSeconds} detik` : sceneDuration;
    const effectiveAspect = getSelectedAspectRatio();

    // Check BYOK Session Key
    const sessionKey = sessionStorage.getItem('ai_affiliate_session_key');
    if (!sessionKey) {
      setErrorMessage(
        'Gemini API Key pengguna tidak ditemukan dalam sesi aktif ZEO. Silakan masuk kembali dengan API Key Anda atau klik tombol "Ganti API Key" di bawah.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitStepText('Menghubungkan ke Gemini dengan API Key Anda...');

    try {
      const stepTimer1 = setTimeout(() => {
        setSubmitStepText(`Menganalisis Genre "${effectiveGenre}" & Tema Viral "${effectiveViralTheme}"...`);
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setSubmitStepText(`Menyusun ${estimatedSceneCount} Scene (@${effectiveSceneDuration}) dalam Mode ${productionMode}...`);
      }, 3000);

      const stepTimer3 = setTimeout(() => {
        setSubmitStepText('Mengunci Karakter, Lokasi & Merancang Prompt Video Siap Flow/Veo...');
      }, 5500);

      const payload = {
        videoTypeId: 'short-drama',
        videoTypeTitle: 'Short Drama',
        videoTypeCategory: 'Story',
        genre: effectiveGenre,
        viralTheme: effectiveViralTheme,
        characterCount,
        characters: characterCount === 'Auto' ? [] : characters,
        totalDuration: effectiveTotalDuration,
        sceneDuration: effectiveSceneDuration,
        estimatedSceneCount,
        platform,
        aspectRatio: effectiveAspect,
        visualStyle: effectiveVisualStyle,
        productionMode,
        storyIdea: storyIdea.trim(),
        references,
        // Also map standard creative fields for compatibility
        videoIdea: `[SHORT DRAMA] Genre: ${effectiveGenre} | Tema Viral: ${effectiveViralTheme} | Mode: ${productionMode} | Durasi Total: ${effectiveTotalDuration} (~${estimatedSceneCount} Scene @ ${effectiveSceneDuration})${storyIdea.trim() ? `\nIde Cerita: ${storyIdea.trim()}` : ''}`,
        duration: effectiveTotalDuration,
        sceneCount: `${estimatedSceneCount} Scene`,
        audio: 'Dialog Karakter',
        characterChoice: characterCount === 'Auto' ? 'Tanpa Karakter' : 'Karakter dari Referensi',
        apiKey: sessionKey,
      };

      const response = await fetch('/api/creative-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        const errText =
          resJson.error ||
          `Terjadi kesalahan saat memproses Short Drama (${response.status}). Pastikan API Key Anda valid.`;
        setErrorMessage(errText);
        setIsSubmitting(false);
        return;
      }

      setAnalysisResult(resJson.data);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('[ShortDramaForm] Error:', err);
      setErrorMessage(
        err?.message ||
          'Terjadi gangguan koneksi jaringan saat menghubungkan ke server ZEO. Silakan coba lagi.'
      );
      setIsSubmitting(false);
    }
  };

  // Safe navigation back
  const handlePilihStudioClick = () => {
    if (analysisResult || references.length > 0 || storyIdea.trim()) {
      setPendingBackAction(() => onBackToPilihStudio);
      setShowUnsavedWarning(true);
    } else {
      onBackToPilihStudio();
    }
  };

  const handleCreativeStudioClick = () => {
    if (analysisResult || references.length > 0 || storyIdea.trim()) {
      setPendingBackAction(() => onBackToCreativeStudio);
      setShowUnsavedWarning(true);
    } else {
      onBackToCreativeStudio();
    }
  };

  // If analysisResult exists, render the Result Viewer
  if (analysisResult) {
    return (
      <div className="space-y-6">
        {/* Top bar when viewing results */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePilihStudioClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <span>← Pilih Studio</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAnalysisResult(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-violet-600" />
              <span>Kembali ke Form Short Drama</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full">
              🎬 {genre} • {viralTheme} • {estimatedSceneCount} Scene
            </span>
          </div>
        </div>

        <CreativeResultViewer
          result={analysisResult}
          videoType={videoType}
          userName={userName}
          onEditConcept={() => {
            setAnalysisResult(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Modal Unsaved Warning */}
        {showUnsavedWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Tinggalkan Hasil Short Drama?
              </h3>
              <p className="text-xs text-slate-500">
                Hasil analisis prompt belum disimpan. Jika berpindah halaman, Anda perlu membuatnya kembali.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnsavedWarning(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Tetap di Sini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedWarning(false);
                    if (pendingBackAction) pendingBackAction();
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 cursor-pointer"
                >
                  Ya, Tinggalkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Navigation & Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-drama-back-to-pilih"
            onClick={handlePilihStudioClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span>← Pilih Studio</span>
          </button>

          <button
            type="button"
            id="btn-drama-back-to-creative"
            onClick={handleCreativeStudioClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-violet-600" />
            <span>Creative Studio</span>
          </button>
        </div>

        {/* Action: Acak Semua Button (Req 10) */}
        <button
          type="button"
          id="btn-drama-acak-semua-top"
          onClick={handleAcakSemua}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Dice5 className="w-4 h-4 text-slate-950" />
          <span>🎲 ACAK SEMUA</span>
        </button>
      </div>

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-violet-500/30">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-violet-600/20 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-xs tracking-wider">
            <Film className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>ZEO SHORT DRAMA STUDIO</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>🎬 Produksi Short Drama</span>
          </h1>

          <p className="text-xs sm:text-sm text-violet-100 max-w-2xl leading-relaxed">
            Atur genre, tema, karakter, durasi, dan gaya drama. ZEO akan menyusun cerita hingga prompt video per scene.
          </p>
        </div>
      </div>

      {/* Error Banner with BYOK Change Modal Trigger */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2.5">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-extrabold text-sm text-rose-900">Gagal Memproses Short Drama</p>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          <div className="pl-7 pt-1">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-byok-change-modal'));
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Ganti / Perbarui API Key</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Production Form */}
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* =========================================================================
            SECTION 1: CERITA (Genre & Tema Viral) - Desktop 2 Kolom
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1A: GENRE DRAMA */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>🎭 Genre Drama</span>
              </label>
              <button
                type="button"
                onClick={randomizeGenre}
                className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 cursor-pointer"
              >
                <Dice5 className="w-3.5 h-3.5" />
                <span>Acak Genre</span>
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {GENRE_OPTIONS.map((g) => {
                if (g === '🎲 Acak') {
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={randomizeGenre}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-all cursor-pointer"
                    >
                      🎲 Acak
                    </button>
                  );
                }
                const isSelected = genre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-xs scale-102 ring-2 ring-violet-400/50'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            {/* Custom Genre Text Field */}
            {genre === 'Custom' && (
              <div className="pt-2">
                <input
                  type="text"
                  id="input-custom-genre"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Tulis genre drama khusus Anda (contoh: Time-Loop Dokter Bedah)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  required
                />
              </div>
            )}
          </div>

          {/* 1B: TEMA VIRAL */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>🔥 Tema Viral</span>
              </label>
              <button
                type="button"
                onClick={randomizeViralTheme}
                className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 cursor-pointer"
              >
                <Dice5 className="w-3.5 h-3.5" />
                <span>Acak Tema</span>
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {VIRAL_THEME_OPTIONS.map((t) => {
                if (t === '🎲 Acak') {
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={randomizeViralTheme}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-all cursor-pointer"
                    >
                      🎲 Acak
                    </button>
                  );
                }
                const isSelected = viralTheme === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setViralTheme(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs scale-102 ring-2 ring-purple-400/50'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Custom Theme Text Field */}
            {viralTheme === 'Custom' && (
              <div className="pt-2">
                <input
                  type="text"
                  id="input-custom-viral-theme"
                  value={customViralTheme}
                  onChange={(e) => setCustomViralTheme(e.target.value)}
                  placeholder="Tulis tema viral Anda (contoh: Pewaris Konglomerat Menjadi OB Kantor)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: KARAKTER (Jumlah Karakter & Dynamic Slots)
            ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-600" />
                <span>👥 Jumlah Karakter</span>
              </label>
              <p className="text-xs text-slate-500">
                Pilih jumlah karakter yang ingin ditentukan secara spesifik, atau pilih Auto.
              </p>
            </div>

            {/* Selector: 2, 3, 4, 5, Auto */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit">
              {['2', '3', '4', '5', 'Auto'].map((c) => {
                const isSelected = characterCount === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCharacterCountChange(c)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Character Slots */}
          {characterCount === 'Auto' ? (
            <div className="p-5 rounded-2xl bg-violet-50/70 border border-violet-200 text-violet-900 text-xs flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-violet-600 shrink-0" />
              <div>
                <p className="font-bold">ZEO Membuat Karakter Otomatis</p>
                <p className="text-violet-700/90 text-2xs sm:text-xs">
                  Sistem AI ZEO akan merancang tokoh utama, antagonis, dan tokoh pendukung secara otomatis sesuai genre "{genre}" dan tema "{viralTheme}".
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <p className="text-2xs text-slate-500 italic">
                * Opsional: Jika dibiarkan kosong, ZEO akan mendesain karakter otomatis. Tidak wajib mengisi seluruh field.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((char, index) => {
                  return (
                    <div
                      key={char.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                        <span className="text-xs font-black text-violet-900">
                          KARAKTER {index + 1}
                        </span>
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                          {char.role || `Tokoh ${index + 1}`}
                        </span>
                      </div>

                      {/* Photo / Character Sheet Upload Slot */}
                      <div className="flex items-center gap-3">
                        {char.image ? (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-violet-500 shrink-0 shadow-2xs">
                            <img
                              src={char.image.base64}
                              alt={char.name || `Karakter ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setCharacters((prev) => {
                                  const n = [...prev];
                                  n[index] = { ...n[index], image: null };
                                  return n;
                                });
                              }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 shadow-xs cursor-pointer"
                              title="Hapus foto"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-violet-400 bg-white flex flex-col items-center justify-center text-slate-400 hover:text-violet-600 cursor-pointer shrink-0 transition-colors">
                            <UploadCloud className="w-5 h-5 mb-0.5" />
                            <span className="text-3xs font-bold">Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleCharacterImageUpload(index, e)}
                            />
                          </label>
                        )}

                        <div className="flex-1 space-y-1.5">
                          <input
                            type="text"
                            placeholder="Nama (opsional)"
                            value={char.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCharacters((prev) => {
                                const n = [...prev];
                                n[index] = { ...n[index], name: val };
                                return n;
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Peran (misal: CEO / Mertua / Ibu)"
                            value={char.role}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCharacters((prev) => {
                                const n = [...prev];
                                n[index] = { ...n[index], role: val };
                                return n;
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-2xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Deskripsi Karakter */}
                      <textarea
                        rows={2}
                        placeholder="Deskripsi fisik/busana (opsional)..."
                        value={char.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCharacters((prev) => {
                            const n = [...prev];
                            n[index] = { ...n[index], description: val };
                            return n;
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-2xs focus:ring-1 focus:ring-violet-500 focus:outline-none resize-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 3: DURASI (Durasi Total & Durasi per Scene + Estimasi Scene)
            ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3A: Durasi Total */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-600" />
                <span>🎞️ Durasi Total</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {TOTAL_DURATIONS.map((dur) => {
                  const isSelected = totalDuration === dur;
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setTotalDuration(dur)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {dur}
                    </button>
                  );
                })}
              </div>

              {totalDuration === 'Custom' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={customTotalMinutes}
                    onChange={(e) => setCustomTotalMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-center font-bold"
                  />
                  <span className="text-xs text-slate-600 font-bold">menit</span>
                </div>
              )}
            </div>

            {/* 3B: Durasi per Scene */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Film className="w-4 h-4 text-violet-600" />
                <span>🎬 Durasi per Scene</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {SCENE_DURATIONS.map((dur) => {
                  const isSelected = sceneDuration === dur;
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSceneDuration(dur)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {dur}
                    </button>
                  );
                })}
              </div>

              {sceneDuration === 'Custom' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min={3}
                    max={60}
                    value={customSceneSeconds}
                    onChange={(e) => setCustomSceneSeconds(Math.max(3, parseInt(e.target.value) || 10))}
                    className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-center font-bold"
                  />
                  <span className="text-xs text-slate-600 font-bold">detik per scene</span>
                </div>
              )}
            </div>
          </div>

          {/* Prominent Auto Calculation Badge (Req 4 & Req 15) */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-2 border-violet-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-violet-950">
                  Estimasi Produksi:{' '}
                  <span className="text-base font-black text-violet-700">
                    {estimatedSceneCount} Scene
                  </span>
                </p>
                <p className="text-2xs text-violet-700">
                  Total waktu {totalSecs} detik (~{Math.round(totalSecs / 60)} menit) dibagi rata ~{sceneSecs} detik per scene.
                  {remainder > 0 && (
                    <span className="ml-1 text-slate-500">
                      ({Math.floor(totalSecs / sceneSecs)} scene @ {sceneSecs} dtk + 1 scene penutup @ {remainder} dtk)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <span className="text-xs font-black text-violet-700 bg-white px-3 py-1.5 rounded-xl border border-violet-200 shrink-0 w-fit">
              {estimatedSceneCount} Prompt Video Veo/Flow
            </span>
          </div>
        </div>

        {/* =========================================================================
            SECTION 4 & 5: FORMAT VIDEO & GAYA VISUAL - Desktop 2 Kolom
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 4. PLATFORM & ASPECT RATIO */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-violet-600" />
                <span>📱 Platform & Rasio</span>
              </label>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                Aspect: {getSelectedAspectRatio()}
              </span>
            </div>

            <div className="space-y-2">
              {PLATFORMS.map((p) => {
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50/50 text-violet-950 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{p.name}</span>
                    <span
                      className={`text-2xs font-extrabold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.aspect}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. GAYA VISUAL */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Palette className="w-4 h-4 text-violet-600" />
                <span>🎨 Gaya Visual</span>
              </label>
              <button
                type="button"
                onClick={randomizeVisual}
                className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 cursor-pointer"
              >
                <Dice5 className="w-3.5 h-3.5" />
                <span>Acak Visual</span>
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {VISUAL_STYLE_OPTIONS.map((v) => {
                if (v === '🎲 Acak') {
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={randomizeVisual}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-all cursor-pointer"
                    >
                      🎲 Acak
                    </button>
                  );
                }
                const isSelected = visualStyle === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisualStyle(v)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-xs scale-102 ring-2 ring-violet-400/50'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>

            {visualStyle === 'Custom' && (
              <div className="pt-2">
                <input
                  type="text"
                  id="input-custom-visual-style"
                  value={customVisualStyle}
                  onChange={(e) => setCustomVisualStyle(e.target.value)}
                  placeholder="Tulis gaya visual khusus (contoh: Noir Cyberpunk Melodrama)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 6: MODE PRODUKSI (4 Cards: Super Hemat, Hemat, Normal, Premium)
            ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Coins className="w-4 h-4 text-violet-600" />
              <span>💰 Mode Produksi</span>
            </label>
            <p className="text-xs text-slate-500">
              Pilih efisiensi produksi aset gambar dan lokasi sesuai rencana pembuatan video AI Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {/* 1. SUPER HEMAT */}
            <div
              onClick={() => setProductionMode('SUPER HEMAT')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                productionMode === 'SUPER HEMAT'
                  ? 'border-amber-500 bg-amber-50/40 shadow-xs scale-101'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <span>⚡ SUPER HEMAT</span>
                </span>
                {productionMode === 'SUPER HEMAT' && (
                  <Check className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <p className="text-2xs text-slate-600 leading-relaxed">
                Aset minimum, lokasi dan reference lebih banyak digunakan ulang.
              </p>
            </div>

            {/* 2. HEMAT (Default) */}
            <div
              onClick={() => setProductionMode('HEMAT')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                productionMode === 'HEMAT'
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-xs scale-101'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <span>💚 HEMAT (Default)</span>
                </span>
                {productionMode === 'HEMAT' && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-2xs text-slate-600 leading-relaxed">
                Aset lebih sedikit tetapi visual tetap bervariasi.
              </p>
            </div>

            {/* 3. NORMAL */}
            <div
              onClick={() => setProductionMode('NORMAL')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                productionMode === 'NORMAL'
                  ? 'border-blue-500 bg-blue-50/40 shadow-xs scale-101'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                  <span>🎬 NORMAL</span>
                </span>
                {productionMode === 'NORMAL' && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <p className="text-2xs text-slate-600 leading-relaxed">
                Seimbang antara variasi visual dan jumlah aset.
              </p>
            </div>

            {/* 4. PREMIUM */}
            <div
              onClick={() => setProductionMode('PREMIUM')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                productionMode === 'PREMIUM'
                  ? 'border-violet-500 bg-violet-50/40 shadow-xs scale-101'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-violet-900 flex items-center gap-1.5">
                  <span>✨ PREMIUM</span>
                </span>
                {productionMode === 'PREMIUM' && (
                  <Check className="w-4 h-4 text-violet-600" />
                )}
              </div>
              <p className="text-2xs text-slate-600 leading-relaxed">
                Lebih banyak scene-specific visual, angle, props, dan cinematic planning.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 7: IDE CERITA (Opsional)
            ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-600" />
            <span>✍️ Ide Cerita — Opsional</span>
          </label>
          <p className="text-xs text-slate-500">
            Sudah punya ide? Tulis singkat di sini, atau kosongkan agar ZEO membuat ceritanya.
          </p>
          <textarea
            id="textarea-drama-story-idea"
            rows={3}
            value={storyIdea}
            onChange={(e) => setStoryIdea(e.target.value)}
            placeholder="Sudah punya ide? Tulis singkat di sini, atau kosongkan agar ZEO membuat ceritanya..."
            className="w-full p-4 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* =========================================================================
            SECTION 8: REFERENSI TAMBAHAN (Opsional, Max 6 file)
            ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-violet-600" />
              <span>📎 Referensi Tambahan — Opsional</span>
            </label>
            <span className="text-2xs font-bold text-slate-500">
              Maksimal 6 file ({references.length}/6 terunggah)
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Bisa digunakan untuk: lokasi, outfit, props, visual reference, dan referensi pendukung lainnya.
          </p>

          {/* Upload Dropzone & Thumbnails */}
          <div className="space-y-3">
            {references.length < 6 && (
              <label className="border-2 border-dashed border-slate-300 hover:border-violet-400 rounded-2xl p-5 flex flex-col items-center justify-center text-slate-500 hover:text-violet-600 transition-colors cursor-pointer bg-slate-50/50 hover:bg-violet-50/20">
                <UploadCloud className="w-7 h-7 mb-1.5 text-violet-500" />
                <span className="text-xs font-bold">
                  Klik atau drag file gambar referensi ke sini
                </span>
                <span className="text-3xs text-slate-400 mt-0.5">
                  Format JPG, PNG, WEBP hingga 15MB
                </span>
                <input
                  ref={refFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleAdditionalReferencesUpload}
                />
              </label>
            )}

            {references.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
                {references.map((refImg, i) => (
                  <div
                    key={refImg.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-300 shadow-2xs group"
                  >
                    <img
                      src={refImg.base64}
                      alt={refImg.name || `Referensi ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveReference(refImg.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                      title="Hapus referensi"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/70 text-white text-3xs truncate max-w-[90%]">
                      {refImg.name || `Ref ${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 9: SUBMIT BUTTON UTAMA (Req 11)
            ========================================================================= */}
        <div className="pt-2 space-y-3">
          <button
            type="submit"
            id="btn-buat-short-drama-submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-98 cursor-pointer ${
              isSubmitting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white shadow-violet-500/25 hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-slate-500" />
                <span>{submitStepText || 'Membuat Short Drama...'}</span>
              </>
            ) : (
              <>
                <Film className="w-5 h-5" />
                <span>🎬 BUAT SHORT DRAMA</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </>
            )}
          </button>

          <p className="text-center text-2xs text-slate-500">
            ZEO akan menghasilkan Storyboard {estimatedSceneCount} Scene, Master Character, Location Lock, Image Prompts, dan Prompt Video AI siap pakai.
          </p>
        </div>
      </form>
    </div>
  );
};
