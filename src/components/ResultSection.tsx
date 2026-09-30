import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Search,
  Tag,
  Film,
  Terminal,
  Volume2,
  ShieldAlert,
  Info,
  Layers,
  Clock,
  Palette,
  Share2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  User,
  Lock,
  RefreshCw,
  PlusCircle,
  Star,
} from 'lucide-react';
import {
  AudioOption,
  PlatformOption,
  SceneCount,
  VideoDuration,
  VideoStyle,
  CharacterOption,
  UploadedImage,
  AnalysisResult,
} from '../types';

interface ResultSectionProps {
  hasGenerated: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  analysisResult: AnalysisResult | null;
  images: UploadedImage[];
  notes: string;
  duration: VideoDuration;
  sceneCount: SceneCount;
  style: VideoStyle;
  audio: AudioOption;
  platform: PlatformOption;
  characterOption?: CharacterOption;
  characterLock?: boolean;
  onRetry?: () => void;
  onGenerateUlang?: () => void;
  onProdukBaru?: () => void;
  onOpenChangeApiKey?: () => void;
  loadingProgressMessage?: string;
  showSuccessToast?: boolean;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  hasGenerated,
  isLoading,
  errorMessage,
  analysisResult,
  images,
  notes,
  duration,
  sceneCount,
  style,
  audio,
  platform,
  characterOption,
  characterLock = true,
  onRetry,
  onGenerateUlang,
  onProdukBaru,
  loadingProgressMessage,
  showSuccessToast,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Requirement #8 & #14: Format baku Salin Semua Prompt & Feedback
  const handleCopySemuaPrompt = () => {
    if (!analysisResult) return;
    const parts: string[] = [];

    // VIDEO PROMPT
    parts.push(`VIDEO PROMPT\n\n${analysisResult.promptVideo || ''}`.trim());

    // NEGATIVE PROMPT
    parts.push(`NEGATIVE PROMPT\n\n${analysisResult.negativePrompt || ''}`.trim());

    // VOICE OVER (jika digunakan)
    if (
      analysisResult.voiceOverTeks?.voiceOver &&
      analysisResult.voiceOverTeks.voiceOver.trim().length > 0
    ) {
      parts.push(`VOICE OVER\n\n${analysisResult.voiceOverTeks.voiceOver.trim()}`);
    }

    // ON-SCREEN TEXT (jika digunakan)
    if (
      analysisResult.voiceOverTeks?.teksVideo &&
      analysisResult.voiceOverTeks.teksVideo.length > 0
    ) {
      parts.push(`ON-SCREEN TEXT\n\n${analysisResult.voiceOverTeks.teksVideo.join('\n')}`);
    }

    const textToCopy = parts.join('\n\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedField('Semua Prompt');
        setCopyFeedback('✓ Tersalin');
        setTimeout(() => {
          setCopiedField(null);
          setCopyFeedback(null);
        }, 2000);
      });
    }
  };

  const handleCopySingle = (text: string, label: string) => {
    if (!text || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(label);
      setCopyFeedback('✓ Tersalin');
      setTimeout(() => {
        setCopiedField(null);
        setCopyFeedback(null);
      }, 2000);
    });
  };

  const handleCopyKonsep = () => {
    if (!analysisResult?.konsepVideo?.scenes) return;
    const scenesText = analysisResult.konsepVideo.scenes
      .map(
        (s) => `[${s.durationLabel || `Scene ${s.sceneNumber}`}]
- Visual: ${s.visual}
- Aksi: ${s.action}
- Kamera: ${s.camera}
- Fokus Produk: ${s.productFocus}${s.transition ? `\n- Transisi: ${s.transition}` : ''}`
      )
      .join('\n\n');

    const fullKonsep = `KONSEP VIDEO (${analysisResult.konsepVideo.totalScenes} Scene - ${analysisResult.konsepVideo.totalDuration})\n\n${scenesText}`;
    handleCopySingle(fullKonsep, 'Konsep Video');
  };

  const handleCopyVoTeks = () => {
    if (!analysisResult?.voiceOverTeks) return;
    const parts: string[] = [];
    if (analysisResult.voiceOverTeks.voiceOver) {
      parts.push(`VOICE OVER:\n${analysisResult.voiceOverTeks.voiceOver}`);
    }
    if (analysisResult.voiceOverTeks.teksVideo && analysisResult.voiceOverTeks.teksVideo.length > 0) {
      parts.push(`ON-SCREEN TEXT:\n${analysisResult.voiceOverTeks.teksVideo.join('\n')}`);
    }
    handleCopySingle(parts.join('\n\n'), 'VO / Teks');
  };

  if (!analysisResult && !isLoading && !errorMessage) {
    return (
      <div id="section-result-container" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
              Belum ada prompt. Masukkan ide atau referensi terlebih dahulu.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Unggah 1–5 foto produk atau screenshot marketplace di atas, tentukan preferensi video, lalu klik <strong>Buat Prompt Video</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="section-result-container" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-4 sm:p-7">
        
        {/* Top Header & Global Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Hasil Generator AI</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Hasil Analisis & Prompt Video
            </h2>
          </div>

          {/* Action buttons: Generate Ulang, Salin Semua Prompt, Produk Baru */}
          <div className="flex flex-wrap items-center gap-2">
            {analysisResult && onGenerateUlang && (
              <button
                type="button"
                id="btn-generate-ulang"
                onClick={onGenerateUlang}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${isLoading ? 'animate-spin' : ''}`} />
                <span>↻ Generate Ulang</span>
              </button>
            )}

            {analysisResult && (
              <button
                id="btn-copy-semua-prompt"
                type="button"
                onClick={handleCopySemuaPrompt}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs border cursor-pointer ${
                  copiedField === 'Semua Prompt'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700'
                }`}
              >
                {copiedField === 'Semua Prompt' ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>✓ Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>📋 Salin Semua Prompt</span>
                  </>
                )}
              </button>
            )}

            {onProdukBaru && (
              <button
                type="button"
                id="btn-produk-baru"
                onClick={onProdukBaru}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
                <span>+ Proyek Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* Copy Feedback notification */}
        {copyFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{copyFeedback}</span>
          </div>
        )}

        {/* Requirement #6: Success Toast */}
        {showSuccessToast && !isLoading && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>✓ Prompt video berhasil dibuat</span>
          </div>
        )}

        {/* Selected Parameters & Requirement #10 Character/Product Badges */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Parameter:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md">
              <Clock className="w-3 h-3 text-indigo-500" /> {duration}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md">
              <Layers className="w-3 h-3 text-indigo-500" /> {sceneCount}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md">
              <Palette className="w-3 h-3 text-indigo-500" /> {style}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md">
              <Volume2 className="w-3 h-3 text-indigo-500" /> {audio}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md">
              <Share2 className="w-3 h-3 text-indigo-500" /> {platform}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-medium">
              {images.length} Gambar Referensi
            </span>
          </div>

          {/* Requirement #10: Status Badges */}
          {analysisResult && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
              {analysisResult.analisisReferensi.characterLockAktif && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold text-xs shadow-2xs">
                  <Lock className="w-3 h-3 text-white" />
                  <span>🔒 Character Lock Aktif</span>
                </span>
              )}

              {analysisResult.analisisReferensi.visualProductLockAktif !== false && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-2xs">
                  <Lock className="w-3 h-3 text-white" />
                  <span>🔒 Product Lock Aktif</span>
                </span>
              )}

              {characterOption === 'Upload Character Sheet' || analysisResult.analisisReferensi.sumberKarakter?.includes('Character Sheet') ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-slate-800 border border-slate-300 rounded-lg font-bold text-xs shadow-2xs">
                  <User className="w-3 h-3 text-indigo-600" />
                  <span>Karakter: Character Sheet</span>
                </span>
              ) : characterOption === 'Buat Karakter dari Teks' || analysisResult.analisisReferensi.sumberKarakter?.includes('Teks') ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-slate-800 border border-slate-300 rounded-lg font-bold text-xs shadow-2xs">
                  <User className="w-3 h-3 text-indigo-600" />
                  <span>Karakter: Deskripsi Teks</span>
                </span>
              ) : characterOption === 'Tanpa Model' || !analysisResult.analisisReferensi.modelTerdeteksi ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-slate-800 border border-slate-300 rounded-lg font-bold text-xs shadow-2xs">
                  <Tag className="w-3 h-3 text-slate-600" />
                  <span>Mode: Product Only</span>
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Error State Banner (Requirement #11 & #12) */}
        {errorMessage && (
          <div
            id="analysis-error-banner"
            className="mt-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold text-rose-900 leading-relaxed">{errorMessage}</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="px-3.5 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer text-xs shadow-2xs"
                  >
                    Coba Lagi
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-byok-change-modal'))}
                  className="px-3.5 py-1.5 bg-white border border-rose-300 text-rose-700 font-bold rounded-lg hover:bg-rose-100 transition-colors cursor-pointer text-xs shadow-2xs"
                >
                  Ganti API Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Requirement #6: Loading State Banner with progressive steps */}
        {isLoading && (
          <div
            id="analysis-loading-banner"
            className="mt-4 p-5 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <span>{loadingProgressMessage || 'Menganalisis gambar referensi...'}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  AI sedang memproses gambar referensi produk, model, dan screenshot marketplace secara mendalam.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Card Grid (Requirement #9) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* 1. Analisis Referensi */}
          <div id="section-analisis-referensi" className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>1. Analisis Referensi</span>
              </div>
              {analysisResult && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {analysisResult.analisisReferensi.jumlahGambar} Gambar
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Ringkasan pemahaman AI terhadap kombinasi gambar produk, model, dan screenshot marketplace.
            </p>

            {analysisResult ? (
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3 rounded-lg bg-white border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">Ringkasan AI:</span>
                  <p className="leading-relaxed text-slate-700">{analysisResult.analisisReferensi.ringkasan}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-white border border-slate-100">
                    <span className="text-slate-500 block">Kategori:</span>
                    <span className="font-bold text-slate-800">{analysisResult.analisisReferensi.kategoriProduk}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-100">
                    <span className="text-slate-500 block">Status Model:</span>
                    <span className="font-bold text-slate-800">
                      {analysisResult.analisisReferensi.modelTerdeteksi ? 'Model Terdeteksi' : 'Product-Only (Tanpa Model)'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-100 col-span-2">
                    <span className="text-slate-500 block">Produk Utama:</span>
                    <span className="font-bold text-slate-800">{analysisResult.analisisReferensi.produkUtama}</span>
                  </div>
                </div>

                {analysisResult.analisisReferensi.detailModel && (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="font-semibold text-indigo-900 block text-[11px] mb-0.5">Karakteristik Model Terkunci:</span>
                    <p className="text-[11px] text-slate-600">{analysisResult.analisisReferensi.detailModel}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-white text-xs text-slate-400 italic">
                Hasil analisis referensi akan muncul di sini setelah proses generate.
              </div>
            )}
          </div>

          {/* 2. Produk Terdeteksi */}
          <div id="section-produk-terdeteksi" className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>2. Produk Terdeteksi</span>
              </div>
              {analysisResult && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {analysisResult.produkTerdeteksi.length} Item
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Daftar objek fisik dan atribut visual produk yang dikunci secara konsisten ke dalam video.
            </p>

            {analysisResult?.produkTerdeteksi && analysisResult.produkTerdeteksi.length > 0 ? (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {analysisResult.produkTerdeteksi.map((prod) => (
                  <div
                    key={prod.nomor}
                    className="p-3 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-900">
                        #{prod.nomor} {prod.nama}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                        {prod.jenis}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mb-1">
                      <strong className="text-slate-700">Warna/Varian:</strong> {prod.warna}
                    </p>
                    {prod.detailVisual && (
                      <p className="text-slate-500 text-[11px] mb-1 italic">
                        <strong className="text-slate-700 not-italic">Visual Lock:</strong> {prod.detailVisual}
                      </p>
                    )}
                    <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
                      <span>Sumber: {prod.sumber}</span>
                      <span>Info: {prod.informasiTerbaca}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-white text-xs text-slate-400 italic">
                Daftar produk terdeteksi akan muncul di sini.
              </div>
            )}
          </div>

          {/* 3. Konsep Video */}
          <div id="section-konsep-video" className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Film className="w-4 h-4 text-indigo-600" />
                <span>3. Konsep Video</span>
              </div>
              <div className="flex items-center gap-2">
                {analysisResult?.konsepVideo && (
                  <>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                      {analysisResult.konsepVideo.totalScenes} Scene ({analysisResult.konsepVideo.totalDuration})
                    </span>
                    <button
                      type="button"
                      id="btn-salin-konsep"
                      onClick={handleCopyKonsep}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {copiedField === 'Konsep Video' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>✓ Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Salin Konsep</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Rancangan storytelling per scene (hook visual, demo produk, sudut kamera, dan call-to-action).
            </p>

            {analysisResult?.konsepVideo?.scenes && analysisResult.konsepVideo.scenes.length > 0 ? (
              <div className="space-y-3">
                {analysisResult.konsepVideo.scenes.map((scene) => (
                  <div
                    key={scene.sceneNumber}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                          {scene.sceneNumber}
                        </span>
                        Scene {scene.sceneNumber}: {scene.durationLabel}
                      </span>
                      <span className="text-[11px] font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Fokus: {scene.productFocus}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <strong className="text-slate-800">Visual:</strong>{' '}
                        <span className="text-slate-600">{scene.visual}</span>
                      </div>
                      <div>
                        <strong className="text-slate-800">Aksi/Gerakan:</strong>{' '}
                        <span className="text-slate-600">{scene.action}</span>
                      </div>
                      <div>
                        <strong className="text-slate-800">Kamera & Sudut:</strong>{' '}
                        <span className="text-slate-600">{scene.camera}</span>
                      </div>
                      {scene.transition && (
                        <div>
                          <strong className="text-slate-800">Transisi:</strong>{' '}
                          <span className="text-slate-600">{scene.transition}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-white text-xs text-slate-400 italic">
                Konsep alur per scene akan muncul di sini.
              </div>
            )}
          </div>

          {/* 4. Prompt Video - HIGHLIGHTED AS THE PRIMARY OUTPUT (Requirement #9) */}
          <div
            id="section-prompt-video"
            className="p-4 sm:p-5 rounded-2xl border-2 border-indigo-500 bg-gradient-to-b from-indigo-50/60 via-white to-white shadow-md md:col-span-2 relative"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-extrabold text-sm sm:text-base">
                      4. Prompt Video
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] tracking-wide uppercase border border-amber-200">
                      <Star className="w-3 h-3 text-amber-600 fill-amber-500" /> Output Utama
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold hidden sm:inline">
                  Google Flow / Veo Ready
                </span>
                {analysisResult?.promptVideo && (
                  <button
                    type="button"
                    id="btn-salin-prompt-video"
                    onClick={() => handleCopySingle(analysisResult.promptVideo!, 'Prompt Video')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedField === 'Prompt Video' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>✓ Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white" />
                        <span>Salin Prompt Video</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Prompt utama siap di-copy ke AI video generator (Google Flow, Veo, Kling, Runway Gen-3, Luma Dream Machine, Sora, Pika). Diformulasikan dalam Bahasa Inggris teknis terstruktur dengan visual lock.
            </p>

            {analysisResult?.promptVideo ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-indigo-200 bg-slate-950 font-mono text-xs text-slate-100 leading-relaxed select-all whitespace-pre-wrap shadow-inner">
                  {analysisResult.promptVideo}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-800 font-semibold">
                    <Lock className="w-3 h-3 text-indigo-600" /> Visual Product Lock
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-800 font-semibold">
                    <User className="w-3 h-3 text-indigo-600" /> Character Lock
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-slate-700">
                    Vertical 9:16 Safe Area
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-slate-700">
                    English Generation Prompt
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-dashed border-indigo-200 bg-white font-mono text-xs text-slate-400 italic min-h-[64px] flex items-center">
                Hasil analisis dan prompt video utama akan muncul di sini.
              </div>
            )}
          </div>

          {/* 5. Voice Over / Teks Video */}
          <div id="section-vo-teks" className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span>5. Voice Over / Teks Video</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                  Opsi: {audio}
                </span>
                {analysisResult?.voiceOverTeks && (
                  <button
                    type="button"
                    id="btn-salin-vo-teks"
                    onClick={handleCopyVoTeks}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {copiedField === 'VO / Teks' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✓ Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Salin VO / Teks</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-2 leading-relaxed">
              Skrip narasi persuasif Bahasa Indonesia dan teks overlay untuk video {duration}.
            </p>

            {analysisResult?.voiceOverTeks ? (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 space-y-3">
                {analysisResult.voiceOverTeks.voiceOver ? (
                  <div>
                    <span className="font-bold text-slate-900 block text-xs mb-1">
                      Skrip Voice Over (Bahasa Indonesia):
                    </span>
                    <p className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-slate-800 italic leading-relaxed">
                      &ldquo;{analysisResult.voiceOverTeks.voiceOver}&rdquo;
                    </p>
                  </div>
                ) : null}

                {analysisResult.voiceOverTeks.teksVideo && analysisResult.voiceOverTeks.teksVideo.length > 0 ? (
                  <div className={analysisResult.voiceOverTeks.voiceOver ? 'pt-2 border-t border-slate-100' : ''}>
                    <span className="font-bold text-slate-900 block text-xs mb-1.5">
                      Teks Overlay di Layar:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.voiceOverTeks.teksVideo.map((txt, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                        >
                          {txt}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!analysisResult.voiceOverTeks.voiceOver && (!analysisResult.voiceOverTeks.teksVideo || analysisResult.voiceOverTeks.teksVideo.length === 0) && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Mode Tanpa Voice Over aktif. Video berfokus pada daya tarik visual produk dan latar musik.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-white text-xs text-slate-400 italic">
                Skrip voice over dan teks video akan muncul di sini.
              </div>
            )}
          </div>

          {/* 6. Negative Prompt */}
          <div id="section-negative-prompt" className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>6. Negative Prompt</span>
              </div>
              {analysisResult?.negativePrompt && (
                <button
                  type="button"
                  id="btn-salin-negative-prompt"
                  onClick={() => handleCopySingle(analysisResult.negativePrompt!, 'Negative Prompt')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:border-amber-400 text-slate-700 hover:text-amber-800 transition-colors cursor-pointer"
                >
                  {copiedField === 'Negative Prompt' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin Negative Prompt</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-2 leading-relaxed">
              Instruksi penghindaran kecacatan (distorsi produk, logo buram, glitch, perubahan model, jari cacat).
            </p>

            {analysisResult?.negativePrompt ? (
              <div className="p-3 rounded-xl border border-amber-200 bg-white text-xs font-mono text-slate-700 leading-relaxed select-all whitespace-pre-wrap">
                {analysisResult.negativePrompt}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-white text-xs text-slate-400 italic">
                Negative prompt pencegah distorsi akan muncul di sini.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar (when result exists) */}
        {analysisResult && (
          <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Waktu selesai: <span className="font-semibold text-slate-700">{analysisResult.waktuAnalisis || 'Selesai'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onGenerateUlang && (
                <button
                  type="button"
                  onClick={onGenerateUlang}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>↻ Generate Ulang</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopySemuaPrompt}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
              >
                {copiedField === 'Semua Prompt' ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>✓ Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>📋 Salin Semua Prompt</span>
                  </>
                )}
              </button>

              {onProdukBaru && (
                <button
                  type="button"
                  onClick={onProdukBaru}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
                  <span>＋ Produk Baru</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
