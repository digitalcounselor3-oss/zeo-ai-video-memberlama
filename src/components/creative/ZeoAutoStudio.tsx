import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  X,
  Sparkles,
  ArrowLeft,
  Clock,
  Layers,
  Palette,
  Volume2,
  Smartphone,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy,
  Check,
  Clapperboard,
  Film,
  Camera,
  User,
  MapPin,
  Package,
  Wand2,
  FileCheck,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  ZeoAutoFormState,
  ZeoAutoResult,
  CreativeDuration,
  CreativeStyle,
  CreativeAudio,
  CreativePlatform,
  ZeoAutoDurationScope,
  ZeoAutoSceneCount,
  CreativeVideoTypeMeta,
  CreativeFormState,
} from '../../creativeTypes';
import { UploadedImage } from '../../types';
import { generateZeoAutoFallbackResult } from '../../utils/zeoAutoFallbackGenerator';
import { CREATIVE_VIDEO_TYPES } from '../../data/creativeTypesData';

interface ZeoAutoStudioProps {
  userName: string;
  onBackToCreativeStudio: () => void;
  onOpenPresetMode: (videoType: CreativeVideoTypeMeta, initialData?: Partial<CreativeFormState>) => void;
  onBackToPilihStudio?: () => void;
}

const ZEO_AUTO_LOADING_STEPS = [
  'Menganalisis referensi...',
  'Menyusun storyboard...',
  'Menghasilkan prompt gambar...',
  'Menghasilkan prompt video...',
  'Menyelaraskan konsistensi karakter...',
];

export const ZeoAutoStudio: React.FC<ZeoAutoStudioProps> = ({
  userName,
  onBackToCreativeStudio,
  onOpenPresetMode,
  onBackToPilihStudio,
}) => {
  // Form States
  const [formData, setFormData] = useState<ZeoAutoFormState>({
    references: [],
    videoIdea: '',
    duration: '10 detik',
    customDurationSeconds: 20,
    durationScope: 'Setiap Scene',
    sceneCount: 'Otomatis',
    visualStyle: 'Otomatis',
    audio: 'Otomatis',
    platform: 'TikTok / Reels / Shorts',
  });

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const [result, setResult] = useState<ZeoAutoResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false);

  const handlePilihStudioClick = () => {
    const hasWork = formData.references.length > 0 || formData.videoIdea.trim().length > 0 || !!result;
    if (hasWork) {
      setShowUnsavedWarning(true);
    } else {
      onBackToPilihStudio?.();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Loading steps animation
  useEffect(() => {
    let timer: any = null;
    if (isLoading) {
      setLoadingStepIndex(0);
      timer = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % ZEO_AUTO_LOADING_STEPS.length);
      }, 2200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  // Upload handler
  const handleUploadFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = 6 - formData.references.length;
    if (remaining <= 0) return;

    const validFiles = Array.from(files).slice(0, remaining);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const newImg: UploadedImage = {
          id: `ref-auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
          size: file.size,
          mimeType: file.type,
          base64,
        };
        setFormData((prev) => ({
          ...prev,
          references: [...prev.references, newImg],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveReference = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references.filter((r) => r.id !== id),
    }));
  };

  // Copy handler
  const handleCopy = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Aggregated copy strings
  const getAllImagePrompts = (res: ZeoAutoResult): string => {
    const parts: string[] = [];
    parts.push(`=== ZEO AUTO — SEMUA PROMPT GAMBAR REFERENSI ===\n`);
    if (res.masterCharacters?.length) {
      res.masterCharacters.forEach((c) => {
        parts.push(`[PROMPT CHARACTER SHEET: ${c.name}]`);
        parts.push(c.characterSheetPrompt);
        parts.push('');
      });
    }
    if (res.masterLocations?.length) {
      res.masterLocations.forEach((l) => {
        parts.push(`[PROMPT MASTER LOCATION: ${l.name}]`);
        parts.push(l.locationLockPrompt);
        parts.push('');
      });
    }
    if (res.masterProps?.length) {
      res.masterProps.forEach((p) => {
        parts.push(`[PROMPT PROPERTI: ${p.name}]`);
        parts.push(p.propPrompt);
        parts.push('');
      });
    }
    if (res.firstFramePrompt) {
      parts.push(`[FIRST FRAME IMAGE PROMPT (${res.firstFramePrompt.aspectRatio})]`);
      parts.push(res.firstFramePrompt.prompt);
      parts.push('');
    }
    if (res.sceneImagePrompts?.length) {
      res.sceneImagePrompts.forEach((s) => {
        parts.push(`[${s.title}]`);
        parts.push(s.prompt);
        parts.push('');
      });
    }
    if (res.lastFramePrompt) {
      parts.push(`[LAST FRAME IMAGE PROMPT (${res.lastFramePrompt.aspectRatio})]`);
      parts.push(res.lastFramePrompt.prompt);
      parts.push('');
    }
    return parts.join('\n');
  };

  const getAllVideoPrompts = (res: ZeoAutoResult): string => {
    const parts: string[] = [];
    parts.push(`=== ZEO AUTO — SEMUA PROMPT VIDEO AI (FLOW / VEO) ===\n`);
    if (res.sceneVideoPrompts?.length) {
      res.sceneVideoPrompts.forEach((v) => {
        parts.push(`[${v.title}]`);
        parts.push(v.prompt);
        parts.push('');
      });
    }
    parts.push(`[NEGATIVE PROMPT]`);
    parts.push(res.negativePrompt);
    return parts.join('\n');
  };

  const getAllContent = (res: ZeoAutoResult): string => {
    const parts: string[] = [];
    parts.push(`=======================================================`);
    parts.push(`ZEO AUTO — AI VIDEO STUDIO by Ms. Inggid`);
    parts.push(`Konsep Terdeteksi: ${res.detection.primaryEngineTitle}${res.detection.secondaryEngineTitle ? ` (${res.detection.secondaryEngineTitle})` : ''}`);
    parts.push(`Alur: ${res.detection.flowType}`);
    parts.push(`=======================================================\n`);

    parts.push(`1. ANALISIS IDE:`);
    parts.push(`Ringkasan: ${res.analisisIde.summary}`);
    parts.push(`Tema: ${res.analisisIde.coreTheme}`);
    parts.push(`Rencana Visual: ${res.analisisIde.visualPlan}\n`);

    if (res.masterCharacters?.length) {
      parts.push(`2. MASTER CHARACTER & CHARACTER SHEET:`);
      res.masterCharacters.forEach((c) => {
        parts.push(`- ${c.name} (${c.sumberKarakter}):\n${c.characterSheetPrompt}\n`);
      });
    }

    if (res.masterLocations?.length) {
      parts.push(`3. MASTER LOCATION (CLEAN ENVIRONMENT):`);
      res.masterLocations.forEach((l) => {
        parts.push(`- ${l.name}:\n${l.locationLockPrompt}\n`);
      });
    }

    if (res.masterProps?.length) {
      parts.push(`4. PROPERTI / OBJEK PENTING:`);
      res.masterProps.forEach((p) => {
        parts.push(`- ${p.name}: ${p.propPrompt}\n`);
      });
    }

    parts.push(`5. STORYBOARD:`);
    res.storyboard.forEach((sb) => {
      parts.push(`Scene ${sb.sceneNumber} (${sb.duration}):`);
      parts.push(`Visual: ${sb.visual}`);
      parts.push(`Aksi: ${sb.action}`);
      if (sb.expression) parts.push(`Ekspresi: ${sb.expression}`);
      parts.push(`Kamera: ${sb.camera}`);
      if (sb.dialogueOrVo) parts.push(`Audio/Dialog: ${sb.dialogueOrVo}`);
      if (sb.sfx) parts.push(`SFX: ${sb.sfx}`);
      parts.push(`Transisi: ${sb.transition}\n`);
    });

    parts.push(`6. PROMPT GAMBAR SCENE:`);
    res.sceneImagePrompts.forEach((s) => {
      parts.push(`[${s.title}]:\n${s.prompt}\n`);
    });

    parts.push(`7. PROMPT VIDEO SCENE (FLOW / VEO):`);
    res.sceneVideoPrompts.forEach((v) => {
      parts.push(`[${v.title}]:\n${v.prompt}\n`);
    });

    if (res.dialogVoiceOver?.voiceOver || res.dialogVoiceOver?.dialogue?.length) {
      parts.push(`8. DIALOG / VOICE OVER:`);
      if (res.dialogVoiceOver.voiceOver) parts.push(`VO: ${res.dialogVoiceOver.voiceOver}`);
      if (res.dialogVoiceOver.dialogue) {
        res.dialogVoiceOver.dialogue.forEach((d) => parts.push(`${d.speaker}: "${d.text}"`));
      }
      parts.push('');
    }

    parts.push(`9. SFX & AMBIENCE:`);
    parts.push(`Ambience: ${res.sfxAndAmbience.ambientSounds.join(', ')}`);
    parts.push(`SFX: ${res.sfxAndAmbience.soundEffects.join(', ')}`);
    parts.push(`Mood Musik: ${res.sfxAndAmbience.musicMood}\n`);

    parts.push(`10. NEGATIVE PROMPT:`);
    parts.push(res.negativePrompt);

    return parts.join('\n');
  };

  // Submit to ZEO AUTO
  const handleGenerate = async (isAlternative: boolean = false) => {
    if (!formData.videoIdea.trim() && formData.references.length === 0) {
      setErrorMessage('Silakan tulis ide video atau unggah minimal 1 gambar referensi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        references: formData.references.map((r) => ({
          id: r.id,
          name: r.name,
          mimeType: r.mimeType,
          base64: r.base64,
        })),
        videoIdea: formData.videoIdea,
        duration: formData.duration,
        customDurationSeconds: formData.customDurationSeconds,
        durationScope: formData.durationScope,
        sceneCount: formData.sceneCount,
        visualStyle: formData.visualStyle,
        audio: formData.audio,
        platform: formData.platform,
        isAlternative: isAlternative,
        apiKey: sessionStorage.getItem('ai_affiliate_session_key') || undefined,
      };

      const res = await fetch('/api/zeo-auto-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.error ||
          'Generate gagal menggunakan Gemini API Key Anda. Periksa kuota atau izin project Anda.'
        );
      }

      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        throw new Error(
          json.error ||
          'Generate gagal menggunakan Gemini API Key Anda. Periksa kuota atau izin project Anda.'
        );
      }
    } catch (err: any) {
      console.warn('[ZeoAuto] API call encountered error:', err);
      const userSessionKey = sessionStorage.getItem('ai_affiliate_session_key');
      if (userSessionKey) {
        // REQUIREMENT #6: STRICTLY NO FALLBACK FOR BYOK PILOT
        setErrorMessage(
          err.message ||
          'Generate gagal menggunakan Gemini API Key Anda. Periksa kuota atau izin project Anda.'
        );
        setResult(null);
        return;
      }

      // Non-BYOK fallback
      const fallbackResult = generateZeoAutoFallbackResult(formData, isAlternative);
      setResult(fallbackResult);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } finally {
      setIsLoading(false);
    }
  };

  // Open detected preset in manual mode
  const handleOpenPreset = () => {
    if (!result) return;
    const targetId = result.detection.primaryEngineId;
    const presetMeta =
      CREATIVE_VIDEO_TYPES.find((t) => t.id === targetId) ||
      CREATIVE_VIDEO_TYPES[0];

    // Map ZeoAuto inputs to CreativeFormState without wiping inputs!
    const transferredData: Partial<CreativeFormState> = {
      references: formData.references,
      videoIdea: formData.videoIdea,
      duration: formData.duration,
      customDurationSeconds: formData.customDurationSeconds,
      sceneCount:
        formData.sceneCount === '1'
          ? '1 Scene'
          : formData.sceneCount === '2'
          ? '2 Scene'
          : formData.sceneCount === '3'
          ? '3 Scene'
          : formData.sceneCount === '5'
          ? '5 Scene'
          : 'Otomatis',
      visualStyle: formData.visualStyle,
      audio: formData.audio,
      platform: formData.platform,
    };

    onOpenPresetMode(presetMeta, transferredData);
  };

  return (
    <div id="zeo-auto-studio" className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onBackToPilihStudio && (
            <button
              type="button"
              id="btn-auto-back-to-pilih-studio"
              onClick={handlePilihStudioClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <span>← Pilih Studio</span>
            </button>
          )}
          <button
            type="button"
            id="btn-back-to-creative-studio"
            onClick={onBackToCreativeStudio}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-violet-600" />
            <span>← Creative Studio</span>
          </button>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Mode Otomatisasi AI</span>
        </span>
      </div>

      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-violet-700/50">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/30 border border-violet-400/40 text-violet-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Fitur Unggulan ZEO</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
            <span>✨ ZEO AUTO</span>
          </h1>
          <p className="text-sm sm:text-base font-semibold text-violet-200 leading-relaxed">
            Ceritakan idemu. ZEO akan memilih jenis video dan menyusun semuanya secara otomatis.
          </p>
          <p className="text-xs text-violet-300/80 leading-relaxed pt-1">
            Cukup unggah referensi visual dan tuliskan ide cerita secara bebas. ZEO akan mengklasifikasikan gambar, mengunci karakter & lokasi, memilih preset yang sesuai, serta menghasilkan prompt gambar dan video AI siap pakai.
          </p>
        </div>
      </div>

      {/* Error notification (does NOT clear inputs) */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm font-medium flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3 flex-1 min-w-[200px]">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Perhatian</p>
              <p>{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-byok-change-modal'))}
            className="px-3.5 py-1.5 bg-white border border-amber-300 text-amber-800 font-bold rounded-xl hover:bg-amber-100 transition-colors cursor-pointer text-xs shrink-0 shadow-2xs"
          >
            Ganti API Key
          </button>
        </div>
      )}

      {/* MAIN FORM */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-sm space-y-6">
        {/* Step 1: Upload Referensi */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 inline-flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>Upload Referensi (Maksimal 6 Gambar)</span>
            </label>
            <span className="text-xs font-semibold text-slate-500">
              {formData.references.length} / 6 gambar
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Dapat berupa foto karakter, Character Sheet, lokasi, outfit, benda, makanan, gedung, produk, screenshot, ilustrasi, atau style acuan. AI menganalisis fungsi setiap gambar secara objektif.
          </p>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-violet-500 rounded-2xl p-5 text-center cursor-pointer bg-slate-50/60 hover:bg-violet-50/20 transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUploadFiles(e.target.files)}
            />
            <div className="flex flex-col items-center justify-center gap-1.5 text-slate-600">
              <UploadCloud className="w-8 h-8 text-violet-500 group-hover:scale-110 transition-transform" />
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Klik atau seret gambar referensi ke sini
              </p>
              <p className="text-[11px] text-slate-500">
                Mendukung JPG, PNG, WEBP hingga 6 file
              </p>
            </div>
          </div>

          {/* Image Previews */}
          {formData.references.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
              {formData.references.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square shadow-2xs"
                >
                  <img
                    src={img.previewUrl || img.base64}
                    alt={img.name || `Referensi ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveReference(img.id)}
                      className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm cursor-pointer"
                      title="Hapus gambar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Ide Video */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 inline-flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>Ceritakan Video yang Ingin Dibuat</span>
          </label>

          <textarea
            id="textarea-zeo-auto-idea"
            rows={4}
            value={formData.videoIdea}
            onChange={(e) => setFormData({ ...formData, videoIdea: e.target.value })}
            placeholder="“Contoh: Saya ingin seorang guru masuk ke portal waktu lalu tiba di zaman dinosaurus. Buat 3 scene dengan karakter yang sama.”"
            className="w-full p-4 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs sm:text-sm text-slate-800 bg-white shadow-2xs placeholder:text-slate-400 leading-relaxed"
          />
          <p className="text-[11px] text-slate-500">
            💡 Tuliskan alur cerita, karakter, aksi, atau suasana dengan bebas. ZEO AUTO akan membaca kebutuhan video Anda secara otomatis.
          </p>
        </div>

        {/* Step 3: Durasi & Jumlah Scene */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 inline-flex items-center justify-center text-xs font-black">
              3
            </span>
            <label className="text-sm font-extrabold text-slate-800">
              Pilih Durasi & Jumlah Scene
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Durasi */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-violet-600" />
                <span>Durasi Video</span>
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {(['8 detik', '10 detik', '15 detik', '30 detik', 'Custom'] as CreativeDuration[]).map(
                  (d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setFormData({ ...formData, duration: d })}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formData.duration === d
                          ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300'
                      }`}
                    >
                      {d}
                    </button>
                  )
                )}
              </div>

              {formData.duration === 'Custom' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={formData.customDurationSeconds}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customDurationSeconds: parseInt(e.target.value, 10) || 20,
                      })
                    }
                    className="w-24 p-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <span className="text-xs text-slate-600 font-semibold">detik</span>
                </div>
              )}

              {/* Durasi berlaku untuk */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  Durasi berlaku untuk:
                </span>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="durationScope"
                      checked={formData.durationScope === 'Setiap Scene'}
                      onChange={() => setFormData({ ...formData, durationScope: 'Setiap Scene' })}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <span>Setiap Scene (Default)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="durationScope"
                      checked={formData.durationScope === 'Total Video'}
                      onChange={() => setFormData({ ...formData, durationScope: 'Total Video' })}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <span>Total Video</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Jumlah Scene */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-violet-600" />
                <span>Jumlah Scene</span>
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {(['1', '2', '3', '4', '5', 'Otomatis'] as ZeoAutoSceneCount[]).map((sc) => (
                  <button
                    type="button"
                    key={sc}
                    onClick={() => setFormData({ ...formData, sceneCount: sc })}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.sceneCount === sc
                        ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                Pilih 'Otomatis' agar ZEO menentukan jumlah scene paling proporsional untuk alur cerita Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Step 4 & 5: Visual Style & Audio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          {/* Visual Style */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 inline-flex items-center justify-center text-xs font-black">
                4
              </span>
              <span>Visual Style</span>
            </label>
            <select
              value={formData.visualStyle}
              onChange={(e) =>
                setFormData({ ...formData, visualStyle: e.target.value as CreativeStyle })
              }
              className="w-full p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs font-bold text-slate-800 bg-white shadow-2xs cursor-pointer"
            >
              {[
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
              ].map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Audio */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 inline-flex items-center justify-center text-xs font-black">
                5
              </span>
              <span>Format Audio</span>
            </label>
            <select
              value={formData.audio}
              onChange={(e) =>
                setFormData({ ...formData, audio: e.target.value as CreativeAudio })
              }
              className="w-full p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs font-bold text-slate-800 bg-white shadow-2xs cursor-pointer"
            >
              {[
                'Otomatis',
                'Tanpa Dialog',
                'Voice Over',
                'Dialog Karakter',
                'VO + Dialog',
                'ASMR / SFX',
              ].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Settings */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-violet-700 transition-colors cursor-pointer"
          >
            <span>Pengaturan Lanjutan</span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Platform Target & Rasio Video
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      'TikTok / Reels / Shorts',
                      'Landscape Video',
                      'Semua Platform',
                    ] as CreativePlatform[]
                  ).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setFormData({ ...formData, platform: p })}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formData.platform === p
                          ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="pt-4">
          <button
            type="button"
            id="btn-zeo-auto-generate"
            disabled={isLoading}
            onClick={() => handleGenerate(false)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>{ZEO_AUTO_LOADING_STEPS[loadingStepIndex]}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>✨ BUAT OTOMATIS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Requirement #8: Friendly Empty State */}
      {!result && !isLoading && !errorMessage && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-800">
              Ceritakan dulu video yang ingin Anda buat.
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tuliskan ide bebas, topik, atau cerita video Anda pada kolom di atas. ZEO AUTO akan secara cerdas menentukan workflow, karakter, lokasi, dan prompt yang sesuai.
            </p>
          </div>
        </div>
      )}

      {/* RESULT SECTION */}
      {result && (
        <div ref={resultRef} className="space-y-6 pt-4 animate-in fade-in duration-500">
          {/* Detection Banner */}
          <div className="bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-violet-700/50 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/30 border border-violet-400/40 text-violet-200 text-xs font-bold">
                  <Clapperboard className="w-3.5 h-3.5 text-amber-300" />
                  <span>ZEO mendeteksi konsep:</span>
                </div>

                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>🎬 {result.detection.primaryEngineTitle}</span>
                </h2>

                {result.detection.secondaryEngineTitle && (
                  <p className="text-xs sm:text-sm text-amber-200 font-bold">
                    Pendekatan tambahan: {result.detection.secondaryEngineTitle}
                  </p>
                )}

                <p className="text-xs sm:text-sm text-violet-200/90 max-w-2xl leading-relaxed">
                  {result.detection.conceptExplanation}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-violet-800/80 text-violet-200 text-[11px] font-bold border border-violet-600/50">
                    Alur: {result.detection.flowType}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-violet-800/80 text-violet-200 text-[11px] font-bold border border-violet-600/50">
                    {result.storyboard.length} Scene Terstruktur
                  </span>
                  {result.detection.hasCharacter && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 text-emerald-200 text-[11px] font-bold border border-emerald-600/50">
                      ✓ Character Lock Aktif
                    </span>
                  )}
                  {result.detection.hasLocation && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-900/60 text-blue-200 text-[11px] font-bold border border-blue-600/50">
                      ✓ Location Lock Aktif
                    </span>
                  )}
                </div>
              </div>

              {/* Action: Open in Manual Preset */}
              <div className="shrink-0 flex flex-col gap-2">
                <button
                  type="button"
                  id="btn-open-in-detected-preset"
                  onClick={handleOpenPreset}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Buka di Mode {result.detection.primaryEngineTitle}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-violet-300 text-center">
                  Bawa input ke preset tanpa menghapus data
                </p>
              </div>
            </div>

            {/* Quick Aggregated Copy Buttons & Generate Alternatif */}
            <div className="pt-4 border-t border-violet-800/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-copy-all-image-prompts"
                  onClick={() => handleCopy('all-image-prompts', getAllImagePrompts(result))}
                  className="px-3.5 py-2 rounded-xl bg-violet-800/80 hover:bg-violet-700 text-white font-bold text-xs border border-violet-600/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedId === 'all-image-prompts' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Salin Semua Prompt Gambar</span>
                </button>

                <button
                  type="button"
                  id="btn-copy-all-video-prompts"
                  onClick={() => handleCopy('all-video-prompts', getAllVideoPrompts(result))}
                  className="px-3.5 py-2 rounded-xl bg-violet-800/80 hover:bg-violet-700 text-white font-bold text-xs border border-violet-600/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedId === 'all-video-prompts' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Salin Semua Prompt Video</span>
                </button>

                <button
                  type="button"
                  id="btn-copy-all-content"
                  onClick={() => handleCopy('all-content', getAllContent(result))}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-violet-50 text-violet-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copiedId === 'all-content' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Salin Semua</span>
                </button>
              </div>

              {/* Generate Alternatif */}
              <button
                type="button"
                id="btn-generate-alternatif"
                disabled={isLoading}
                onClick={() => handleGenerate(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-600 hover:to-purple-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Generate Alternatif</span>
              </button>
            </div>
          </div>

          {/* Section 1: Klasifikasi Gambar Referensi (if uploaded) */}
          {result.detection.imageClassifications &&
            result.detection.imageClassifications.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-violet-600" />
                  <span>Analisis & Klasifikasi Gambar Referensi</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {result.detection.imageClassifications.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {item.name || `Referensi ${idx + 1}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-100 text-violet-800">
                          {item.classification}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {item.functionDescription}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Section 2 & 3: Analisis Ide & Visual Plan */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-violet-600" />
              <span>Analisis Ide & Rencana Visual</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100 space-y-1">
                <span className="text-[11px] font-extrabold text-violet-800 uppercase tracking-wide">
                  Premis / Cerita
                </span>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {result.analisisIde.summary}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                <span className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wide">
                  Tema Utama
                </span>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {result.analisisIde.coreTheme}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                  Visual Plan & Lighting
                </span>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {result.analisisIde.visualPlan}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 & 5: Master Character & Character Sheet Prompt */}
          {result.masterCharacters && result.masterCharacters.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-600" />
                  <span>Master Character & Prompt Character Sheet (Multi-View)</span>
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  ✓ Character Lock Aktif
                </span>
              </div>

              {result.masterCharacters.map((char, cIdx) => (
                <div
                  key={char.id || cIdx}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{char.name}</h4>
                      <p className="text-xs text-slate-500">
                        Sumber:{' '}
                        <span className="font-bold text-violet-700">{char.sumberKarakter}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(`char-sheet-${cIdx}`, char.characterSheetPrompt)}
                      className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold border border-violet-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedId === `char-sheet-${cIdx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Salin Prompt Character Sheet</span>
                    </button>
                  </div>

                  {/* Character visual breakdown */}
                  {char.visualIdentity && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      {char.visualIdentity.genderPresentation && (
                        <div>
                          <span className="text-slate-400 block font-bold">Gender/Figur</span>
                          <span className="font-semibold text-slate-700">
                            {char.visualIdentity.genderPresentation}
                          </span>
                        </div>
                      )}
                      {char.visualIdentity.facialAppearance && (
                        <div>
                          <span className="text-slate-400 block font-bold">Wajah</span>
                          <span className="font-semibold text-slate-700">
                            {char.visualIdentity.facialAppearance}
                          </span>
                        </div>
                      )}
                      {char.visualIdentity.hairstyleOrHijab && (
                        <div>
                          <span className="text-slate-400 block font-bold">Rambut / Hijab</span>
                          <span className="font-semibold text-slate-700">
                            {char.visualIdentity.hairstyleOrHijab}
                          </span>
                        </div>
                      )}
                      {char.visualIdentity.outfitAndColor && (
                        <div>
                          <span className="text-slate-400 block font-bold">Outfit</span>
                          <span className="font-semibold text-slate-700">
                            {char.visualIdentity.outfitAndColor}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Character Sheet Prompt Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed space-y-2">
                    <span className="text-[10px] font-bold text-violet-400 tracking-wide uppercase block font-sans">
                      PROMPT CHARACTER SHEET (FRONT, 3/4, SIDE, CLOSE-UP)
                    </span>
                    <p>{char.characterSheetPrompt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 6 & 7: Master Location & Prompt Location */}
          {result.masterLocations && result.masterLocations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Master Location & Prompt Gambar Lokasi (Clean Environment)</span>
                </h3>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                  ✓ Location Lock Aktif
                </span>
              </div>

              {result.masterLocations.map((loc, lIdx) => (
                <div
                  key={loc.id || lIdx}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{loc.name}</h4>
                      <p className="text-xs text-slate-500">
                        Lingkungan tanpa orang untuk acuan latar belakang yang konsisten
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(`loc-${lIdx}`, loc.locationLockPrompt)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedId === `loc-${lIdx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Salin Prompt Lokasi</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed space-y-2">
                    <span className="text-[10px] font-bold text-blue-400 tracking-wide uppercase block font-sans">
                      PROMPT MASTER LOCATION (CLEAN ENVIRONMENT)
                    </span>
                    <p>{loc.locationLockPrompt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 8: Master Props (if any) */}
          {result.masterProps && result.masterProps.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span>Objek / Properti Penting</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.masterProps.map((prop, pIdx) => (
                  <div
                    key={prop.id || pIdx}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-800">{prop.name}</h4>
                      <button
                        type="button"
                        onClick={() => handleCopy(`prop-${pIdx}`, prop.propPrompt)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 cursor-pointer"
                        title="Salin Prompt Properti"
                      >
                        {copiedId === `prop-${pIdx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600">{prop.significance}</p>
                    <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed">
                      {prop.propPrompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 9: Storyboard Otomatis */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-violet-600" />
              <span>Storyboard Otomatis ({result.storyboard.length} Scene)</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {result.storyboard.map((sc) => (
                <div
                  key={sc.sceneNumber}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-violet-600 text-white font-black text-xs">
                        SCENE {sc.sceneNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        ⏱️ {sc.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      {sc.location && <span>📍 {sc.location}</span>}
                      {sc.character && <span>👤 {sc.character}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <span className="font-extrabold text-slate-700">Visual:</span>
                      <p className="text-slate-600 leading-relaxed">{sc.visual}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-extrabold text-slate-700">Aksi & Gerakan:</span>
                      <p className="text-slate-600 leading-relaxed">{sc.action}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                    {sc.expression && (
                      <div>
                        <span className="font-bold text-slate-500 block">Ekspresi Mikro:</span>
                        <span className="text-slate-700 font-medium">{sc.expression}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-500 block">Kamera:</span>
                      <span className="text-slate-700 font-medium">{sc.camera}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block">Transisi:</span>
                      <span className="text-slate-700 font-medium">{sc.transition}</span>
                    </div>
                  </div>

                  {sc.dialogueOrVo && (
                    <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-100 text-xs text-violet-950 font-medium flex items-start gap-2">
                      <Volume2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                      <span>{sc.dialogueOrVo}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 10: Prompt Gambar Scene (Frame Awal) */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-fuchsia-600" />
              <span>Prompt Gambar Scene (Starting Frame Wajib)</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {result.sceneImagePrompts.map((si, idx) => (
                <div
                  key={si.sceneNumber || idx}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{si.title}</h4>
                      <span className="text-[11px] font-bold text-slate-500">
                        Rasio: {si.aspectRatio}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(`sc-img-${idx}`, si.prompt)}
                      className="px-3 py-1.5 rounded-xl bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 text-xs font-bold border border-fuchsia-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedId === `sc-img-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Salin Prompt Gambar Scene {si.sceneNumber}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed">
                    {si.prompt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 11: First/Last Frame (if transformation) */}
          {(result.firstFramePrompt || result.lastFramePrompt) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.firstFramePrompt && (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-800">
                      {result.firstFramePrompt.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopy('first-frame', result.firstFramePrompt!.prompt)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      {copiedId === 'first-frame' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs">
                    {result.firstFramePrompt.prompt}
                  </div>
                </div>
              )}

              {result.lastFramePrompt && (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-800">
                      {result.lastFramePrompt.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopy('last-frame', result.lastFramePrompt!.prompt)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      {copiedId === 'last-frame' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs">
                    {result.lastFramePrompt.prompt}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 12: Prompt Video Wajib per Scene (FLOW / VEO READY) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-violet-600" />
                <span>Prompt Video AI per Scene (Siap Copy-Paste ke Flow / Veo)</span>
              </h3>
              <span className="text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full">
                English Prompt
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {result.sceneVideoPrompts.map((vp, idx) => (
                <div
                  key={vp.sceneNumber || idx}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{vp.title}</h4>
                      <p className="text-xs text-slate-500">
                        Mengacu ke Character Sheet & Master Location yang terkunci
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(`sc-vid-${idx}`, vp.prompt)}
                      className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      {copiedId === `sc-vid-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Salin Prompt Video Scene {vp.sceneNumber}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed">
                    {vp.prompt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 13: Dialog / Voice Over */}
          {(result.dialogVoiceOver?.voiceOver ||
            (result.dialogVoiceOver?.dialogue && result.dialogVoiceOver.dialogue.length > 0)) && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-violet-600" />
                <span>Dialog & Voice Over (Bahasa Indonesia)</span>
              </h3>

              {result.dialogVoiceOver.voiceOver && (
                <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-1.5">
                  <span className="text-[11px] font-extrabold text-violet-800 uppercase tracking-wide">
                    Voice Over Script:
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    “{result.dialogVoiceOver.voiceOver}”
                  </p>
                </div>
              )}

              {result.dialogVoiceOver.dialogue && result.dialogVoiceOver.dialogue.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                    Dialog Karakter (Speaker Attribution & Lip-Sync):
                  </span>
                  <div className="space-y-2">
                    {result.dialogVoiceOver.dialogue.map((dlg, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2"
                      >
                        <span className="font-extrabold text-violet-700 min-w-[120px]">
                          {dlg.speaker}:
                        </span>
                        <span className="text-slate-800 font-medium">“{dlg.text}”</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Catatan: Pendengar tetap diam tanpa gerakan bibir untuk menjaga lip-sync alami.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Section 14: SFX & Ambience */}
          {result.sfxAndAmbience && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>SFX & Audio Ambience</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-500 block mb-1">Ambient Sounds:</span>
                  <span className="text-slate-700 font-semibold">
                    {result.sfxAndAmbience.ambientSounds.join(', ')}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-500 block mb-1">Sound Effects (SFX):</span>
                  <span className="text-slate-700 font-semibold">
                    {result.sfxAndAmbience.soundEffects.join(', ')}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-500 block mb-1">Mood Musik:</span>
                  <span className="text-slate-700 font-semibold">
                    {result.sfxAndAmbience.musicMood}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 15: Negative Prompt */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Negative Prompt (Universal Lock)</span>
              </h3>
              <button
                type="button"
                onClick={() => handleCopy('negative-prompt', result.negativePrompt)}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedId === 'negative-prompt' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Salin Negative Prompt</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed">
              {result.negativePrompt}
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
                  onBackToPilihStudio?.();
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
