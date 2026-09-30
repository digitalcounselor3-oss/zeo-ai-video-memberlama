import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  X,
  Sparkles,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Clock,
  Layers,
  Palette,
  Volume2,
  Smartphone,
  Info,
  FileText,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Wand2,
} from 'lucide-react';
import {
  CreativeVideoTypeMeta,
  CreativeCharacterChoice,
  CreativeCharacterType,
  CreativeTimeTransition,
  CreativeDuration,
  CreativeSceneCount,
  CreativeStyle,
  CreativeAudio,
  CreativePlatform,
  CreativeAnalysisResult,
  CreativeFormState,
} from '../../creativeTypes';
import { UploadedImage } from '../../types';
import { CreativeResultViewer } from './CreativeResultViewer';
import { generateCreativeFallbackResult } from '../../utils/creativeFallbackGenerator';
import { getPresetsForVideoType } from '../../utils/creativeSampleGenerator';

interface CreativeFormUniversalProps {
  videoType: CreativeVideoTypeMeta;
  userName: string;
  onBackToCreativeStudio: () => void;
  onBackToPilihStudio: () => void;
  initialFormData?: Partial<CreativeFormState>;
}

const CREATIVE_LOADING_STEPS = [
  'Menganalisis referensi...',
  'Menyusun storyboard...',
  'Menghasilkan prompt gambar...',
  'Menghasilkan prompt video...',
  'Menyelaraskan konsistensi karakter...',
];

export const CreativeFormUniversal: React.FC<CreativeFormUniversalProps> = ({
  videoType,
  userName,
  onBackToCreativeStudio,
  onBackToPilihStudio,
  initialFormData,
}) => {
  // Unsaved Warning Modal state (Requirement #8)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false);

  // Form States (with support for initial transfer from ZEO AUTO)
  const [references, setReferences] = useState<UploadedImage[]>(
    initialFormData?.references || []
  );
  const [characterChoice, setCharacterChoice] =
    useState<CreativeCharacterChoice>(
      initialFormData?.characterChoice || 'Karakter dari Referensi'
    );
  const [characterTypeChoice, setCharacterTypeChoice] = useState<CreativeCharacterType>(
    videoType.id === 'character-talk' ? 'Hewan' : 'Otomatis'
  );
  const [characterSheet, setCharacterSheet] = useState<UploadedImage | null>(
    initialFormData?.characterSheetImage || null
  );
  const [characterText, setCharacterText] = useState<string>(
    initialFormData?.characterDescription || ''
  );
  const [videoIdea, setVideoIdea] = useState<string>(
    initialFormData?.videoIdea || ''
  );
  const [timelineEra, setTimelineEra] = useState<string>('');
  const [timeTransition, setTimeTransition] = useState<CreativeTimeTransition>('Otomatis');
  const [duration, setDuration] = useState<CreativeDuration>(
    initialFormData?.duration || '15 detik'
  );
  const [customDuration, setCustomDuration] = useState<number>(
    initialFormData?.customDurationSeconds || 20
  );
  const [sceneCount, setSceneCount] = useState<CreativeSceneCount>(
    initialFormData?.sceneCount || '3 Scene'
  );
  const [visualStyle, setVisualStyle] = useState<CreativeStyle>(
    initialFormData?.visualStyle || 'Otomatis'
  );
  const [audio, setAudio] = useState<CreativeAudio>(
    initialFormData?.audio || (videoType.id === 'character-talk' ? 'Dialog Karakter' : 'Voice Over')
  );
  const [platform, setPlatform] = useState<CreativePlatform>(
    initialFormData?.platform || 'TikTok / Reels / Shorts'
  );

  // Generation & Result State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<CreativeAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const charSheetInputRef = useRef<HTMLInputElement>(null);

  // Animate loading step ticker
  useEffect(() => {
    let interval: any = null;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % CREATIVE_LOADING_STEPS.length);
      }, 2400);
    } else {
      setLoadingStepIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // File Upload Handlers
  const handleUploadFiles = (files: FileList | null) => {
    if (!files) return;
    const remainingSlots = 6 - references.length;
    if (remainingSlots <= 0) return;

    const validFiles = Array.from(files).slice(0, remainingSlots);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const newImg: UploadedImage = {
          id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
          size: file.size,
          mimeType: file.type,
          base64: base64,
        };
        setReferences((prev) => [...prev, newImg]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadCharSheet = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const newImg: UploadedImage = {
        id: `charsheet-${Date.now()}`,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        size: file.size,
        mimeType: file.type,
        base64: base64,
      };
      setCharacterSheet(newImg);
    };
    reader.readAsDataURL(file);
  };

  const removeReference = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  // Preset loader
  const handleLoadPresets = () => {
    const preset = getPresetsForVideoType(videoType.id);
    setVideoIdea(preset.idea);
    setCharacterText(preset.characterDesc);
    setReferences(preset.sampleImages);
    if (videoType.id === 'character-talk') {
      setCharacterTypeChoice('Hewan');
      setAudio('Dialog Karakter');
    } else if (videoType.id === 'flashback') {
      setTimelineEra('SD 1995 → SMP 1998 → SMA 2001 → Kuliah 2004 → Sekarang');
      setTimeTransition('Memory Fade');
    } else if (videoType.id === 'emotional-story') {
      setVisualStyle('Cinematic');
      setAudio('Voice Over');
    }
    setErrorMessage(null);
  };

  // Reset form
  const handleResetForm = () => {
    setReferences([]);
    setCharacterSheet(null);
    setCharacterChoice('Karakter dari Referensi');
    setCharacterTypeChoice(videoType.id === 'character-talk' ? 'Hewan' : 'Otomatis');
    setCharacterText('');
    setVideoIdea('');
    setTimelineEra('');
    setTimeTransition('Otomatis');
    setDuration('15 detik');
    setSceneCount('3 Scene');
    setVisualStyle('Otomatis');
    setAudio(videoType.id === 'character-talk' ? 'Dialog Karakter' : 'Voice Over');
    setPlatform('TikTok / Reels / Shorts');
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  // Submit & Generate Prompts
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formDataState: CreativeFormState = {
      references,
      characterChoice,
      characterTypeChoice,
      characterSheetImage: characterSheet,
      characterDescription: characterText,
      characterLock: characterChoice !== 'Tanpa Karakter',
      videoIdea,
      timelineEra,
      timeTransition,
      duration,
      customDurationSeconds: customDuration,
      sceneCount,
      visualStyle,
      audio,
      platform,
    };

    try {
      const response = await fetch('/api/creative-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoTypeId: videoType.id,
          videoTypeTitle: videoType.title,
          videoTypeCategory: videoType.category,
          references,
          characterChoice,
          characterTypeChoice,
          characterSheetImage: characterSheet,
          characterDescription: characterText,
          videoIdea: videoIdea.trim() || videoType.defaultPlaceholder,
          timelineEra,
          timeTransition,
          duration,
          customDurationSeconds: customDuration,
          sceneCount,
          visualStyle,
          audio,
          platform,
          apiKey: sessionStorage.getItem('ai_affiliate_session_key') || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server status: ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setAnalysisResult(resJson.data);
        setErrorMessage(null);
      } else {
        throw new Error(resJson.error || 'Hasil tidak valid dari AI.');
      }
    } catch (err: any) {
      const activeUserKey = sessionStorage.getItem('ai_affiliate_session_key');
      if (activeUserKey) {
        // REQUIREMENT #5: STRICTLY NO FALLBACK FOR BYOK SESSIONS
        setErrorMessage(
          err?.message ||
            'Generate gagal menggunakan Gemini API Key Anda. Periksa kuota atau izin project Anda.'
        );
        setAnalysisResult(null);
      } else {
        console.warn('[CreativeFormUniversal] Backend error or quota issue, using client generator:', err);
        // Fallback to high quality client generator so user is NEVER blocked
        const fallbackData = generateCreativeFallbackResult(videoType, formDataState, userName);
        setAnalysisResult(fallbackData);
      }
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const characterChoices: CreativeCharacterChoice[] = [
    'Karakter dari Referensi',
    'Upload Character Sheet',
    'Karakter dari Teks',
    'Tanpa Karakter',
  ];

  const durationOptions: CreativeDuration[] = [
    '8 detik',
    '10 detik',
    '15 detik',
    '30 detik',
    'Custom',
  ];

  const sceneOptions: CreativeSceneCount[] = [
    '1 Scene',
    '2 Scene',
    '3 Scene',
    '5 Scene',
    'Otomatis',
  ];

  const styleOptions: CreativeStyle[] = [
    'Otomatis',
    'Realistic',
    'Semi Realistic',
    '3D Animation',
    'Cinematic',
    'Cute Cartoon',
    'Anime',
    'Miniature',
    'Paper Art',
    'Documentary',
  ];

  const audioOptions: CreativeAudio[] = [
    'Tanpa Dialog',
    'Voice Over',
    'Dialog Karakter',
    'VO + Dialog',
    'ASMR / SFX',
    'Otomatis',
  ];

  const platformOptions: CreativePlatform[] = [
    'TikTok / Reels / Shorts',
    'Landscape Video',
    'Semua Platform',
  ];

  const characterTypeOptions: CreativeCharacterType[] = [
    'Manusia',
    'Hewan',
    'Benda / Objek',
    'Karakter Fantasi',
    'Robot',
    'Otomatis',
  ];

  const timeTransitionOptions: CreativeTimeTransition[] = [
    'Portal',
    'Match Cut',
    'Morphing',
    'Flash of Light',
    'Photo Transition',
    'Memory Fade',
    'Cinematic Transition',
    'Otomatis',
  ];

  const handlePilihStudioClick = () => {
    const hasWork = references.length > 0 || videoIdea.trim().length > 0 || !!analysisResult;
    if (hasWork) {
      setShowUnsavedWarning(true);
    } else {
      onBackToPilihStudio();
    }
  };

  // If we already have results, show the full result viewer
  if (analysisResult) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-back-to-pilih-studio-result"
              onClick={handlePilihStudioClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <span>← Pilih Studio</span>
            </button>
            <button
              type="button"
              id="btn-back-to-form-edit"
              onClick={() => setAnalysisResult(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-violet-600" />
              <span>← Kembali ke Pengaturan {videoType.title}</span>
            </button>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-800">
            {videoType.title}
          </span>
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

        {/* Unsaved Warning Modal */}
        {showUnsavedWarning && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⚠️
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Perhatian</h4>
                  <p className="text-xs text-slate-500">Konfirmasi perpindahan halaman</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Proyek saat ini belum disimpan. Lanjutkan?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnsavedWarning(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Tetap di Sini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedWarning(false);
                    onBackToPilihStudio();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="form-creative-universal" className="space-y-6 sm:space-y-8">
      {/* Navigation Bars */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-back-to-pilih-studio"
            onClick={handlePilihStudioClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span>← Pilih Studio</span>
          </button>
          <button
            type="button"
            id="btn-back-to-creative-list"
            onClick={onBackToCreativeStudio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-violet-600" />
            <span>← Creative Studio</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadPresets}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Muat Contoh Ide & Gambar</span>
          </button>

          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Sub-Header Banner */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Creative Video Studio — {videoType.badge}</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            {videoType.title}
          </h1>

          <p className="text-xs sm:text-sm text-violet-100 max-w-xl leading-relaxed">
            {videoType.desc}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/20 text-violet-100 border border-white/10">
              <Lock className="w-3 h-3 text-amber-300" />
              <span>Image Reference Architecture (Character Sheet + Location Lock)</span>
            </span>
          </div>
        </div>

        <div className="absolute -right-6 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* ERROR NOTICE */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-byok-change-modal'))}
            className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 font-bold rounded-xl hover:bg-rose-100 transition-colors cursor-pointer text-xs shrink-0 shadow-2xs"
          >
            Ganti API Key
          </button>
        </div>
      )}

      {/* WORKFLOW REMINDER BOX */}
      <div className="bg-violet-50/70 border border-violet-200/80 rounded-2xl p-4 text-xs text-violet-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Alur Kerja ZEO Image Reference Prompt:</p>
          <p className="text-[11px] text-violet-800/90 leading-relaxed">
            1. Masukkan ide & referensi visual ➔ 2. ZEO menghasilkan Prompt Character Sheet & Master Location (Lingkungan Bersih) ➔ 3. Anda membuat gambar referensi di generator gambar ➔ 4. ZEO menghasilkan Prompt Video per scene untuk dimasukkan ke Google Flow / Veo.
          </p>
        </div>
      </div>

      {/* FORM INPUTS */}
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* A. GAMBAR REFERENSI (1-6) */}
        <section
          id="section-creative-upload"
          className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-violet-600" />
                <span>Gambar Referensi Visual (Opsional, 1–6 Gambar)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Unggah foto karakter, suasana lokasi, style visual, atau objek penting untuk dianalisis ZEO.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {references.length}/6 Gambar
            </span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-violet-400 bg-slate-50/60 hover:bg-violet-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5"
          >
            <div className="w-11 h-11 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                Klik atau seret gambar referensi ke sini
              </p>
              <p className="text-[11px] text-slate-400">
                Format JPG, PNG, WEBP hingga 6 gambar
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleUploadFiles(e.target.files)}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Uploaded Thumbnails */}
          {references.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
              {references.map((img, index) => (
                <div
                  key={img.id}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
                >
                  <img
                    src={img.previewUrl}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                    #{index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeReference(img.id);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* B. PILIHAN KARAKTER */}
        <section
          id="section-creative-character"
          className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4"
        >
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet-600" />
              <span>Pengaturan Karakter & Character Lock</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pilih bagaimana ZEO membangun Master Character Prompt dan Character Sheet.
            </p>
          </div>

          {/* KHUSUS CHARACTER TALK: PILIH JENIS KARAKTER */}
          {videoType.id === 'character-talk' && (
            <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-violet-600" />
                  <span>Pilih Jenis Karakter (Character Talk):</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-200/80 text-violet-800 font-semibold">
                  Multi-Species & Objects
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {characterTypeOptions.map((ctype) => (
                  <button
                    type="button"
                    key={ctype}
                    onClick={() => setCharacterTypeChoice(ctype)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      characterTypeChoice === ctype
                        ? 'bg-violet-600 border-violet-600 text-white shadow-2xs'
                        : 'bg-white border-violet-200 text-slate-700 hover:border-violet-400'
                    }`}
                  >
                    {ctype}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-violet-700 leading-relaxed">
                Jika Anda mengunggah gambar referensi, ZEO akan memprioritaskan visual tersebut. Untuk hewan, benda, mascot, atau robot, Character Sheet multi-view tetap dibuat untuk mengunci bentuk, warna, pola bulu/material, dan ekspresi.
              </p>
              <div className="pt-1 text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Speech & Lip-Sync Anchor aktif: gerakan mulut disinkronkan natural/stylized sesuai anatomi karakter.</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {characterChoices.map((choice) => (
              <button
                type="button"
                key={choice}
                onClick={() => setCharacterChoice(choice)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  characterChoice === choice
                    ? 'border-violet-600 bg-violet-50/50 ring-2 ring-violet-500/20 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-bold text-slate-800">{choice}</span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  {choice === 'Karakter dari Referensi' && 'Diambil konsisten dari gambar referensi di atas.'}
                  {choice === 'Upload Character Sheet' && 'Unggah lembar karakter referensi multi-sudut.'}
                  {choice === 'Karakter dari Teks' && 'Deskripsikan ciri fisik karakter dengan teks.'}
                  {choice === 'Tanpa Karakter' && 'Video pemandangan, benda, teks, atau voice-over saja.'}
                </span>
              </button>
            ))}
          </div>

          {/* Conditional Sub-Inputs */}
          {characterChoice === 'Upload Character Sheet' && (
            <div className="pt-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Unggah Lembar Karakter (Character Sheet):
                </span>
                {characterSheet && (
                  <button
                    type="button"
                    onClick={() => setCharacterSheet(null)}
                    className="text-[11px] text-rose-600 font-bold hover:underline"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {characterSheet ? (
                <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                  <img
                    src={characterSheet.previewUrl}
                    alt="Character Sheet"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-slate-800">{characterSheet.name}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Character Sheet Aktif
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => charSheetInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/40 text-violet-700 text-xs font-bold hover:bg-violet-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Pilih File Character Sheet (Front / Side / 3/4)</span>
                </button>
              )}
              <input
                type="file"
                ref={charSheetInputRef}
                onChange={(e) => handleUploadCharSheet(e.target.files)}
                accept="image/*"
                className="hidden"
              />
            </div>
          )}

          {characterChoice === 'Karakter dari Teks' && (
            <div className="pt-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Deskripsi Fisik Karakter (Usia, pakaian, rambut/hijab, ekspresi, warna):
              </label>
              <textarea
                value={characterText}
                onChange={(e) => setCharacterText(e.target.value)}
                placeholder="Contoh: Wanita Indonesia usia 26 tahun, berhijab krem elegan, kemeja putih linen, celana kulot sage green, ekspresi ramah dan berwibawa..."
                rows={2}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              />
            </div>
          )}

          {characterChoice !== 'Tanpa Karakter' && (
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>Kunci Karakter Otomatis Aktif:</strong> Wajah, proporsi tubuh, dan identitas visual karakter akan dikunci konsisten dari scene awal hingga scene penutup.
              </span>
            </div>
          )}
        </section>

        {/* KHUSUS FLASHBACK: SECTION TIMELINE & TRANSISI WAKTU */}
        {videoType.id === 'flashback' && (
          <section
            id="section-creative-flashback"
            className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4"
          >
            <div className="space-y-0.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-600" />
                <span>Tahapan Waktu / Era & Transisi (Flashback Engine)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Atur perjalanan usia karakter atau perubahan zaman agar identitas wajah tetap konsisten di setiap era.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Tahapan Waktu / Era (Opsional):
              </label>
              <input
                type="text"
                value={timelineEra}
                onChange={(e) => setTimelineEra(e.target.value)}
                placeholder="Contoh: SD 1995 → SMP 1998 → SMA 2001 → Kuliah 2004 → Sekarang"
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              />
              <p className="text-[11px] text-slate-500 italic">
                Opsional. Jika kosong, ZEO akan mengekstrak urutan waktu secara otomatis dari ide cerita Anda.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Pilih Jenis Transisi Waktu:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {timeTransitionOptions.map((trans) => (
                  <button
                    type="button"
                    key={trans}
                    onClick={() => setTimeTransition(trans)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      timeTransition === trans
                        ? 'bg-violet-600 border-violet-600 text-white shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-violet-300'
                    }`}
                  >
                    {trans}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Identity Across Ages Lock & Location Era Lock Aktif</span>
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                ZEO menghasilkan Master Character Identity, kemudian variasi per era (Character — Era 1, Era 2, dst) dengan ciri wajah konsisten antar usia. Objek dan pakaian juga disesuaikan secara akurat dengan zamannya tanpa benda modern anakronistik.
              </p>
            </div>
          </section>
        )}

        {/* C. IDE / KONSEP CERITA */}
        <section
          id="section-creative-idea"
          className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-600" />
              <span>Ide Video / Konsep Cerita / Skenario</span>
            </h2>
            <span className="text-[11px] text-slate-400">Fleksibel & Ekspresif</span>
          </div>

          {/* KHUSUS EMOTIONAL STORY: CALLOUT EMOSI */}
          {videoType.id === 'emotional-story' && (
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-rose-900">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Emotional Story Engine: Setup → Trigger → Reaksi → Resolusi</span>
              </p>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                ZEO menganalisis alur emosional dan kontrol ekspresi mikro visual (subtle smile, tearing eyes, gentle eye contact, restrained feelings) dengan framing kamera intim (close-up, slow push-in, over-the-shoulder).
                <strong> Catatan:</strong> ZEO tidak otomatis membuat cerita sedih, melainkan mengikuti tone emosi yang Anda inginkan (hangat, haru, perjuangan, rasa syukur, atau kebahagiaan).
              </p>
            </div>
          )}

          <textarea
            id="input-creative-idea"
            value={videoIdea}
            onChange={(e) => setVideoIdea(e.target.value)}
            placeholder={videoType.defaultPlaceholder}
            rows={3}
            className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white placeholder:text-slate-400 placeholder:italic leading-relaxed"
          />
        </section>

        {/* D & E. DURASI & JUMLAH SCENE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* D. DURASI */}
          <section
            id="section-creative-duration"
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3"
          >
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-600" />
              <span>Pilihan Durasi Video</span>
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {durationOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setDuration(opt)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    duration === opt
                      ? 'bg-violet-600 border-violet-600 text-white shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-violet-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {duration === 'Custom' && (
              <div className="pt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={customDuration}
                  onChange={(e) => setCustomDuration(parseInt(e.target.value, 10))}
                  className="flex-1 accent-violet-600"
                />
                <span className="text-xs font-bold px-3 py-1 bg-violet-100 text-violet-800 rounded-lg shrink-0">
                  {customDuration} detik
                </span>
              </div>
            )}
          </section>

          {/* E. JUMLAH SCENE */}
          <section
            id="section-creative-scenes"
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3"
          >
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-600" />
              <span>Jumlah Scene Video</span>
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {sceneOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setSceneCount(opt)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    sceneCount === opt
                      ? 'bg-violet-600 border-violet-600 text-white shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-violet-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* F. GAYA VISUAL (LOCKED STYLE) */}
        <section
          id="section-creative-style"
          className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-violet-600" />
              <span>Gaya Visual (Visual Style Lock)</span>
            </h2>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Dikunci pada Karakter, Lokasi & Scene
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {styleOptions.map((stl) => (
              <button
                type="button"
                key={stl}
                onClick={() => setVisualStyle(stl)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  visualStyle === stl
                    ? 'bg-violet-600 border-violet-600 text-white shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-violet-300'
                }`}
              >
                {stl}
              </button>
            ))}
          </div>
        </section>

        {/* G & H. AUDIO & PLATFORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* G. AUDIO */}
          <section
            id="section-creative-audio"
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3"
          >
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-violet-600" />
              <span>Format Audio / Dialog</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {audioOptions.map((aud) => (
                <button
                  type="button"
                  key={aud}
                  onClick={() => setAudio(aud)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    audio === aud
                      ? 'bg-violet-600 border-violet-600 text-white shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-violet-300'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </section>

          {/* H. PLATFORM */}
          <section
            id="section-creative-platform"
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3"
          >
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-violet-600" />
              <span>Rasio & Platform Target</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {platformOptions.map((plat) => (
                <button
                  type="button"
                  key={plat}
                  onClick={() => setPlatform(plat)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    platform === plat
                      ? 'bg-violet-600 border-violet-600 text-white shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-violet-300'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-buat-prompt-video-creative"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-violet-200 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Analisis Kreatif...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>✨ BUAT PROMPT VIDEO ({videoType.title.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-violet-200 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-600 mx-auto flex items-center justify-center relative">
              <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin absolute" />
              <Sparkles className="w-7 h-7 text-violet-600 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                ZEO Creative Video Studio
              </h3>
              <p className="text-xs text-slate-500">
                Membangun Image Reference Architecture & Prompt Video AI...
              </p>
            </div>

            {/* Step animation */}
            <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-100 text-xs font-bold text-violet-800 transition-all">
              {CREATIVE_LOADING_STEPS[loadingStepIndex]}
            </div>

            <div className="flex justify-center gap-1.5">
              {CREATIVE_LOADING_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === loadingStepIndex
                      ? 'w-6 bg-violet-600'
                      : i < loadingStepIndex
                      ? 'w-2.5 bg-violet-300'
                      : 'w-2.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                ⚠️
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Perhatian</h4>
                <p className="text-xs text-slate-500">Konfirmasi perpindahan halaman</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              Proyek saat ini belum disimpan. Lanjutkan?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnsavedWarning(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Tetap di Sini
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedWarning(false);
                  onBackToPilihStudio();
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
