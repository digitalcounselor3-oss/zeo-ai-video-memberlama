import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  User,
  MapPin,
  Package,
  Film,
  Image as ImageIcon,
  Video,
  Volume2,
  Headphones,
  ShieldAlert,
  Download,
  Share2,
  Layers,
  Lock,
  ArrowDown,
  Camera,
  Compass,
  FileCheck2,
  Clock,
  Wand2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CreativeAnalysisResult, CreativeVideoTypeMeta } from '../../creativeTypes';
import { MusicLyricResultViewer } from './MusicLyricResultViewer';

interface CreativeResultViewerProps {
  result: CreativeAnalysisResult;
  videoType: CreativeVideoTypeMeta;
  userName: string;
  onEditConcept: () => void;
}

export const CreativeResultViewer: React.FC<CreativeResultViewerProps> = ({
  result,
  videoType,
  userName,
  onEditConcept,
}) => {
  if (result.musicLyricData) {
    return (
      <MusicLyricResultViewer
        result={result}
        userName={userName}
        onEditKonsep={onEditConcept}
        onBackToPilihStudio={onEditConcept}
      />
    );
  }

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAnalisisOpen, setIsAnalisisOpen] = useState<boolean>(true);
  const [isStoryboardOpen, setIsStoryboardOpen] = useState<boolean>(true);
  const [isNegativePromptOpen, setIsNegativePromptOpen] = useState<boolean>(true);

  const handleCopy = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Aggregated Copy Helpers
  const getAllImagePromptsText = (): string => {
    const parts: string[] = [];
    parts.push(`=== PROMPT GAMBAR REFERENSI ZEO (${videoType.title}) ===\n`);

    if (result.masterCharacters && result.masterCharacters.length > 0) {
      result.masterCharacters.forEach((char, idx) => {
        parts.push(`--- [1. CHARACTER SHEET: ${char.name}] ---`);
        parts.push(char.characterSheetPrompt);
        parts.push('');
      });
    }

    if (result.masterLocations && result.masterLocations.length > 0) {
      result.masterLocations.forEach((loc, idx) => {
        parts.push(`--- [2. MASTER LOCATION: ${loc.name}] ---`);
        parts.push(loc.locationLockPrompt);
        parts.push('');
      });
    }

    if (result.masterProps && result.masterProps.length > 0) {
      result.masterProps.forEach((prop, idx) => {
        parts.push(`--- [3. PROMPT PROPERTI: ${prop.name}] ---`);
        parts.push(prop.propPrompt);
        parts.push('');
      });
    }

    if (result.sceneImagePrompts && result.sceneImagePrompts.length > 0) {
      result.sceneImagePrompts.forEach((sc, idx) => {
        parts.push(`--- [4. SCENE ${sc.sceneNumber} IMAGE PROMPT (${sc.aspectRatio})] ---`);
        parts.push(sc.prompt);
        parts.push('');
      });
    }

    return parts.join('\n');
  };

  const getAllVideoPromptsText = (): string => {
    const parts: string[] = [];
    parts.push(`=== PROMPT VIDEO AI ZEO (SIAP FLOW / VEO) — ${videoType.title} ===\n`);

    if (result.sceneVideoPrompts && result.sceneVideoPrompts.length > 0) {
      result.sceneVideoPrompts.forEach((vp) => {
        parts.push(`--- [${vp.title}] ---`);
        parts.push(vp.prompt);
        parts.push('');
      });
    }

    parts.push('--- [NEGATIVE PROMPT] ---');
    parts.push(result.negativePrompt);

    return parts.join('\n');
  };

  const getFullProjectSummaryText = (): string => {
    const parts: string[] = [];
    parts.push(`=======================================================`);
    parts.push(`ZEO — CREATIVE VIDEO STUDIO by Ms. Inggid`);
    parts.push(`Proyek: ${videoType.title} | Kreator: ${userName || 'Kreator'}`);
    parts.push(`Waktu: ${result.waktuAnalisis || 'Terkini'} | Engine: ${result.modelUsed || 'ZEO AI'}`);
    parts.push(`=======================================================\n`);

    parts.push(`1. ANALISIS CERITA:`);
    parts.push(`- Premis: ${result.analisisCerita.premis}`);
    parts.push(`- Tema: ${result.analisisCerita.tema}`);
    parts.push(`- Alur Ringkas: ${result.analisisCerita.alurRingkas}`);
    parts.push(`- Suasana: ${result.analisisCerita.emosiSuasana}`);
    parts.push(`- Gaya Visual Terkunci: ${result.analisisCerita.gayaVisualTerkunci}\n`);

    if (result.masterCharacters && result.masterCharacters.length > 0) {
      parts.push(`2. MASTER CHARACTER & CHARACTER SHEET:`);
      result.masterCharacters.forEach((c) => {
        parts.push(`[${c.name}] (${c.sumberKarakter})`);
        parts.push(`Prompt Character Sheet:\n${c.characterSheetPrompt}\n`);
      });
    }

    if (result.masterLocations && result.masterLocations.length > 0) {
      parts.push(`3. MASTER LOCATION & ENVIRONMENT:`);
      result.masterLocations.forEach((l) => {
        parts.push(`[${l.name}]`);
        parts.push(`Prompt Lokasi Bersih:\n${l.locationLockPrompt}\n`);
      });
    }

    if (result.masterProps && result.masterProps.length > 0) {
      parts.push(`4. PROMPT PROPERTI:`);
      result.masterProps.forEach((p) => {
        parts.push(`[${p.name}]: ${p.propPrompt}\n`);
      });
    }

    parts.push(`5. STORYBOARD:`);
    result.storyboard.forEach((sb) => {
      parts.push(`Scene ${sb.sceneNumber} (${sb.durationLabel}):`);
      parts.push(`Visual: ${sb.visual}`);
      parts.push(`Aksi: ${sb.action}`);
      parts.push(`Kamera: ${sb.camera}`);
      parts.push(`Transisi: ${sb.transition}\n`);
    });

    parts.push(`6. SCENE IMAGE PROMPTS (FRAME AWAL):`);
    result.sceneImagePrompts.forEach((si) => {
      parts.push(`[${si.title} - ${si.aspectRatio}]:\n${si.prompt}\n`);
    });

    parts.push(`7. PROMPT VIDEO AI (FLOW / VEO):`);
    result.sceneVideoPrompts.forEach((sv) => {
      parts.push(`[${sv.title}]:\n${sv.prompt}\n`);
    });

    if (result.dialogVoiceOver?.voiceOver || (result.dialogVoiceOver?.dialogue && result.dialogVoiceOver.dialogue.length > 0)) {
      parts.push(`8. DIALOG & VOICE OVER:`);
      if (result.dialogVoiceOver.voiceOver) {
        parts.push(`Voice Over: ${result.dialogVoiceOver.voiceOver}`);
      }
      if (result.dialogVoiceOver.dialogue) {
        result.dialogVoiceOver.dialogue.forEach((d) => {
          parts.push(`${d.speaker}: "${d.text}"`);
        });
      }
      parts.push('');
    }

    parts.push(`9. SFX & AMBIENCE:`);
    parts.push(`- Ambience: ${result.sfxAndAmbience.ambientSounds.join(', ')}`);
    parts.push(`- SFX: ${result.sfxAndAmbience.soundEffects.join(', ')}`);
    parts.push(`- Music: ${result.sfxAndAmbience.musicMood}\n`);

    parts.push(`10. NEGATIVE PROMPT:`);
    parts.push(result.negativePrompt);

    return parts.join('\n');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* SUCCESS BANNER & TOP CONTROLS */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-violet-700/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/30 border border-violet-400/40 text-violet-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Arsitektur Image Reference & Video Prompt Lengkap</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Prompt Siap untuk {videoType.title}
            </h2>
            <p className="text-xs sm:text-sm text-violet-200/90 leading-relaxed max-w-2xl">
              Alur kerja terstruktur: Buat gambar referensi (Character Sheet, Lokasi, Scene Image) terlebih dahulu, lalu masukkan ke video generator (Flow / Veo) dengan Prompt Video di bawah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-copy-full-project"
              onClick={() => handleCopy('full-project', getFullProjectSummaryText())}
              className="px-4 py-2.5 rounded-xl bg-white text-violet-900 font-extrabold text-xs sm:text-sm hover:bg-violet-50 transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              {copiedId === 'full-project' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">✓ Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Lengkap Semua</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onEditConcept}
              className="px-3.5 py-2.5 rounded-xl bg-violet-800/80 hover:bg-violet-700 text-violet-100 font-bold text-xs transition-colors cursor-pointer border border-violet-600/60"
            >
              Ubah Parameter
            </button>
          </div>
        </div>

        {/* Badges Bar (Requirement #6: Status Lock Indicator) */}
        <div className="pt-3 border-t border-violet-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-300" />
            <span>🔒 Character Lock: Aktif</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/30 font-bold">
            <Lock className="w-3.5 h-3.5 text-blue-300" />
            <span>🔒 Location Lock: Aktif</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/30 font-semibold">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Style Lock: {result.analisisCerita.gayaVisualTerkunci || 'Terkunci'}</span>
          </span>
          {result.modelUsed && (
            <span className="text-[11px] text-violet-300 ml-auto font-medium">
              Engine: {result.modelUsed} • {result.waktuAnalisis}
            </span>
          )}
        </div>
      </div>

      {/* QUICK JUMP / ACTION BAR */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 font-semibold pl-2">
          <Layers className="w-4 h-4 text-violet-600" />
          <span>Aksi Cepat Salin:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-copy-all-images"
            onClick={() => handleCopy('all-images', getAllImagePromptsText())}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-700 font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedId === 'all-images' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">✓ Tersalin</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-violet-600" />
                <span>Salin Semua Prompt Gambar</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-copy-all-videos"
            onClick={() => handleCopy('all-videos', getAllVideoPromptsText())}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-700 font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedId === 'all-videos' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">✓ Tersalin</span>
              </>
            ) : (
              <>
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                <span>Salin Semua Prompt Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ANALISIS CERITA (Collapsible, Requirement #12) */}
      {/* ========================================================================= */}
      <section id="section-1-analisis-cerita" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => setIsAnalisisOpen(!isAnalisisOpen)}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center">
              1
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-violet-700 transition-colors flex items-center gap-2">
                <span>Analisis Cerita & Konsep</span>
                {isAnalisisOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </h3>
            </div>
          </button>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 border border-violet-200">
            {result.analisisCerita.tema}
          </span>
        </div>

        {isAnalisisOpen && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Premis Video
                </span>
                <p className="font-semibold text-slate-800 leading-relaxed">
                  {result.analisisCerita.premis}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Emosi & Suasana
                </span>
                <p className="font-semibold text-slate-800 leading-relaxed">
                  {result.analisisCerita.emosiSuasana}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100 space-y-1.5 text-xs sm:text-sm">
              <span className="text-[11px] font-bold text-violet-700 uppercase tracking-wider block">
                Alur Ringkas
              </span>
              <p className="text-slate-700 leading-relaxed">
                {result.analisisCerita.alurRingkas}
              </p>
            </div>

            {/* Info Tambahan Khusus Preset: Emotional Arc / Time Transition / Character Type */}
            {result.analisisCerita.emotionalArc && (
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1.5 text-xs sm:text-sm">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>Emotional Arc (Setup → Trigger → Reaksi → Resolusi)</span>
                </span>
                <p className="text-rose-950 font-medium leading-relaxed">
                  {result.analisisCerita.emotionalArc}
                </p>
              </div>
            )}

            {(result.analisisCerita.timeTransitionUsed || result.analisisCerita.characterTypeIdentified) && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                {result.analisisCerita.timeTransitionUsed && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Transisi Waktu: <strong>{result.analisisCerita.timeTransitionUsed}</strong></span>
                  </div>
                )}
                {result.analisisCerita.characterTypeIdentified && (
                  <div className="px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 font-semibold flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-violet-600" />
                    <span>Spesies/Tipe Karakter: <strong>{result.analisisCerita.characterTypeIdentified}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2 & 3. MASTER CHARACTER & CHARACTER SHEET PROMPT */}
      {/* ========================================================================= */}
      {result.masterCharacters && result.masterCharacters.length > 0 && (
        <section id="section-2-master-character" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center">
                2 & 3
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Master Character & Character Sheet Prompt
                </h3>
                <p className="text-xs text-slate-500">
                  Gunakan prompt ini pada AI Image Generator untuk membuat referensi gambar karakter multi-sudut pandang.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              Identity Lock
            </span>
          </div>

          <div className="space-y-6">
            {result.masterCharacters.map((char, index) => {
              const copyKey = `char-${char.id || index}`;
              const vi = char.visualIdentity || {};

              return (
                <div
                  key={char.id || index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-violet-600" />
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {char.name}
                      </h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {char.sumberKarakter}
                      </span>
                    </div>

                    <button
                      type="button"
                      id={`btn-copy-char-${index}`}
                      onClick={() => handleCopy(copyKey, char.characterSheetPrompt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      {copiedId === copyKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">✓ Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Character Sheet</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Character Physical Identity Table/Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                    {vi.ageGroup && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Usia Visual</span>
                        <span className="font-semibold text-slate-800">{vi.ageGroup}</span>
                      </div>
                    )}
                    {vi.facialAppearance && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Wajah & Mata</span>
                        <span className="font-semibold text-slate-800">{vi.facialAppearance}</span>
                      </div>
                    )}
                    {vi.hairstyleOrHijab && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Rambut / Hijab</span>
                        <span className="font-semibold text-slate-800">{vi.hairstyleOrHijab}</span>
                      </div>
                    )}
                    {vi.skinAppearance && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Kulit & Tekstur</span>
                        <span className="font-semibold text-slate-800">{vi.skinAppearance}</span>
                      </div>
                    )}
                    {vi.outfitAndColor && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 sm:col-span-2">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Pakaian & Warna</span>
                        <span className="font-semibold text-slate-800">{vi.outfitAndColor}</span>
                      </div>
                    )}
                    {vi.bodyProportions && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Proporsi Tubuh</span>
                        <span className="font-semibold text-slate-800">{vi.bodyProportions}</span>
                      </div>
                    )}
                    {vi.accessories && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Aksesoris</span>
                        <span className="font-semibold text-slate-800">{vi.accessories}</span>
                      </div>
                    )}
                  </div>

                  {/* Character Sheet Prompt Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-violet-800">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Prompt Gambar Karakter (Character Sheet Mode — English):</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Front • 3/4 • Side • Neutral Pose
                      </span>
                    </div>

                    <div className="relative group">
                      <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 overflow-x-auto selection:bg-violet-500 selection:text-white">
                        {char.characterSheetPrompt}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4 & 5. MASTER LOCATION & LOCATION LOCK PROMPT */}
      {/* ========================================================================= */}
      {result.masterLocations && result.masterLocations.length > 0 && (
        <section id="section-4-master-location" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center">
                4 & 5
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Master Location & Prompt Gambar Lokasi (Clean Environment)
                </h3>
                <p className="text-xs text-slate-500">
                  Lingkungan dibuat TANPA KARAKTER terlebih dahulu untuk dijadikan jangkar lokasi (Location Lock) di semua scene.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
              Clean Environment
            </span>
          </div>

          <div className="space-y-6">
            {result.masterLocations.map((loc, index) => {
              const copyKey = `loc-${loc.id || index}`;
              const env = loc.environmentDetails || ({} as any);

              return (
                <div
                  key={loc.id || index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {loc.name}
                      </h4>
                    </div>

                    <button
                      type="button"
                      id={`btn-copy-loc-${index}`}
                      onClick={() => handleCopy(copyKey, loc.locationLockPrompt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      {copiedId === copyKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">✓ Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Prompt Lokasi</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Environment Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {env.locationType && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Jenis Lokasi</span>
                        <span className="font-semibold text-slate-800">{env.locationType}</span>
                      </div>
                    )}
                    {env.timeOfDayOrEra && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Waktu & Era</span>
                        <span className="font-semibold text-slate-800">{env.timeOfDayOrEra}</span>
                      </div>
                    )}
                    {env.lightingAndAtmosphere && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Pencahayaan & Atmosfer</span>
                        <span className="font-semibold text-slate-800">{env.lightingAndAtmosphere}</span>
                      </div>
                    )}
                    {env.architecture && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 sm:col-span-2">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Arsitektur & Penataan</span>
                        <span className="font-semibold text-slate-800">{env.architecture}</span>
                      </div>
                    )}
                    {env.furnitureAndLayout && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Perabot & Elemen</span>
                        <span className="font-semibold text-slate-800">{env.furnitureAndLayout}</span>
                      </div>
                    )}
                  </div>

                  {/* Location Prompt Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                      <span className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-blue-600" />
                        <span>Prompt Gambar Lokasi Bersih (Tanpa Karakter — English):</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Location Lock Active
                      </span>
                    </div>

                    <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 overflow-x-auto selection:bg-blue-500 selection:text-white">
                      {loc.locationLockPrompt}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. PROMPT GAMBAR PROPERTI (JIKA ADA) */}
      {/* ========================================================================= */}
      {result.masterProps && result.masterProps.length > 0 && (
        <section id="section-6-master-props" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center">
                6
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Prompt Gambar Properti / Objek Kunci
                </h3>
                <p className="text-xs text-slate-500">
                  Referensi objek penting untuk menjaga konsistensi fisik prop di dalam video.
                </p>
              </div>
            </div>
            <Package className="w-5 h-5 text-violet-600" />
          </div>

          <div className="space-y-4">
            {result.masterProps.map((prop, idx) => {
              const copyKey = `prop-${prop.id || idx}`;
              return (
                <div key={prop.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{prop.name}</h4>
                      <p className="text-xs text-slate-500">{prop.significance}</p>
                    </div>
                    <button
                      type="button"
                      id={`btn-copy-prop-${idx}`}
                      onClick={() => handleCopy(copyKey, prop.propPrompt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {copiedId === copyKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">✓ Tersalin</span>
                        </>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Salin Properti</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {prop.propPrompt}
                  </pre>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* KHUSUS PRESET FOOD PREPARATION: PROCESS BOARD & INGREDIENT STATE MAP */}
      {/* ========================================================================= */}
      {result.foodPrepData && (
        <section id="section-food-prep-data" className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-300 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-amber-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                🥕
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Food Preparation Process Board & Ingredient State Map
                </h3>
                <p className="text-xs text-slate-500">
                  Urutan alur fisik berkesinambungan dan pelacakan wujud bahan antar scene.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Physical Logic Locked
            </span>
          </div>

          {/* Bahan & Aktivitas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
              <span className="text-2xs font-bold text-amber-800 uppercase tracking-wider block">
                🧺 Bahan Terdeteksi & Terkonfirmasi:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.foodPrepData.detectedIngredients.map((ing, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-slate-800 text-xs font-medium">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/70 space-y-2">
              <span className="text-2xs font-bold text-blue-800 uppercase tracking-wider block">
                🥗 Alur Proses Terpilih:
              </span>
              <p className="text-xs font-bold text-blue-900">
                {result.foodPrepData.selectedActivities.join(' → ')}
              </p>
            </div>
          </div>

          {/* Process Board Scenes */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              📋 Process Board Adegan:
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {result.foodPrepData.processBoard.map((sc) => (
                <div key={sc.sceneNumber} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-600 text-white text-2xs font-bold">
                        Scene {sc.sceneNumber}
                      </span>
                      {sc.activity} • <span className="text-slate-500 font-normal">{sc.ingredient}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-2xs font-bold text-amber-800 block mb-0.5">Start State:</span>
                      <p className="text-slate-700">{sc.startState}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-2xs font-bold text-emerald-800 block mb-0.5">Action:</span>
                      <p className="text-slate-700">{sc.action}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-2xs font-bold text-blue-800 block mb-0.5">End State:</span>
                      <p className="text-slate-700">{sc.endState}</p>
                    </div>
                  </div>
                  <div className="text-2xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                    <span>🎥 <strong>Camera:</strong> {sc.camera}</span>
                    <span>🤲 <strong>Hand:</strong> {sc.handAction}</span>
                    <span>🔊 <strong>SFX:</strong> {sc.asmrSfx}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 7. STORYBOARD (Collapsible, Requirement #12) */}
      {/* ========================================================================= */}
      <section id="section-7-storyboard" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => setIsStoryboardOpen(!isStoryboardOpen)}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center">
              7
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-violet-700 transition-colors flex items-center gap-2">
                <span>Storyboard Video ({result.storyboard.length} Scene)</span>
                {isStoryboardOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Rancangan visual, aksi karakter, framing kamera, dan transisi per scene.
              </p>
            </div>
          </button>
          <Film className="w-5 h-5 text-violet-600" />
        </div>

        {isStoryboardOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
            {result.storyboard.map((sb) => (
              <div
                key={sb.sceneNumber}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-violet-600 text-white shadow-2xs">
                      Scene {sb.sceneNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {sb.durationLabel.replace(/Scene \d+ — /i, '')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Visual</span>
                    <p className="text-xs text-slate-800 leading-relaxed">{sb.visual}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Aksi Realistis</span>
                    <p className="text-xs text-slate-700 leading-relaxed">{sb.action}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Kamera & Framing</span>
                    <p className="text-xs text-slate-600 font-mono leading-relaxed">{sb.camera}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Transisi:</span>
                  <span className="font-bold text-slate-700">{sb.transition}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 8. PROMPT GAMBAR ADEGAN (SCENE IMAGE PROMPT - STARTING FRAME) */}
      {/* ========================================================================= */}
      <section id="section-8-scene-image-prompts" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center">
              8
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Prompt Gambar Adegan (Starting Frame Setiap Scene)
              </h3>
              <p className="text-xs text-slate-500">
                Gabungan Master Character + Master Location + Outfit + Pose + Kamera + Lighting untuk frame awal video.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCopy('all-scene-images', result.sceneImagePrompts.map(p => `[${p.title}]\n${p.prompt}\n`).join('\n'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            {copiedId === 'all-scene-images' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">✓ Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Semua Gambar Scene</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {result.sceneImagePrompts.map((sip) => {
            const copyKey = `scene-img-${sip.sceneNumber}`;
            return (
              <div key={sip.sceneNumber} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-bold text-slate-900">{sip.title}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Rasio {sip.aspectRatio}
                    </span>
                  </div>

                  <button
                    type="button"
                    id={`btn-copy-scene-img-${sip.sceneNumber}`}
                    onClick={() => handleCopy(copyKey, sip.prompt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {copiedId === copyKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">✓ Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Gambar Scene {sip.sceneNumber}</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 selection:bg-violet-500 selection:text-white">
                  {sip.prompt}
                </pre>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. PROMPT VIDEO (AI VIDEO GENERATOR / FLOW / VEO) */}
      {/* ========================================================================= */}
      <section id="section-9-scene-video-prompts" className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              9
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Prompt Video AI (Google Flow / Veo Ready)
              </h3>
              <p className="text-xs text-slate-500">
                Prompt pergerakan video yang mengacu secara ketat pada referensi karakter dan lokasi yang telah dibuat sebelumnya.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-copy-all-scene-videos"
            onClick={() => handleCopy('all-scene-videos', result.sceneVideoPrompts.map(p => `[${p.title}]\n${p.prompt}\n`).join('\n'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            {copiedId === 'all-scene-videos' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">✓ Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Semua Video Scene</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {result.sceneVideoPrompts.map((svp) => {
            const copyKey = `scene-vid-${svp.sceneNumber}`;
            return (
              <div key={svp.sceneNumber} className="rounded-2xl border border-indigo-200/80 bg-indigo-50/20 p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-black text-slate-900">{svp.title}</span>
                  </div>

                  <button
                    type="button"
                    id={`btn-copy-scene-vid-${svp.sceneNumber}`}
                    onClick={() => handleCopy(copyKey, svp.prompt)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedId === copyKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">✓ Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Prompt Video {svp.sceneNumber}</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 selection:bg-emerald-600 selection:text-white">
                  {svp.prompt}
                </pre>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. DIALOG / VOICE OVER */}
      {/* ========================================================================= */}
      <section id="section-10-dialog-vo" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center">
              10
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Dialog & Voice Over ({result.dialogVoiceOver.type})
              </h3>
              <p className="text-xs text-slate-500">
                Skrip narasi atau percakapan karakter sesuai format audio yang dipilih.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-copy-dialog-vo"
            onClick={() => {
              const formattedDialogue = result.dialogVoiceOver.dialogue?.map(d => `${d.speaker}: "${d.text}"`).join('\n');
              const textToCopy = result.dialogVoiceOver.voiceOver || result.dialogVoiceOver.script || formattedDialogue || '';
              handleCopy('dialog-vo', textToCopy);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
          >
            {copiedId === 'dialog-vo' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">✓ Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Dialog / VO</span>
              </>
            )}
          </button>
        </div>

        {result.dialogVoiceOver.voiceOver && (
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Skrip Voice Over:
            </span>
            <p className="text-xs sm:text-sm font-medium text-slate-800 italic leading-relaxed">
              "{result.dialogVoiceOver.voiceOver}"
            </p>
          </div>
        )}

        {result.dialogVoiceOver.dialogue && result.dialogVoiceOver.dialogue.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Percakapan Karakter:
            </span>
            <div className="space-y-2">
              {result.dialogVoiceOver.dialogue.map((dlg, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex gap-2">
                  <span className="font-bold text-violet-700 shrink-0">{dlg.speaker}:</span>
                  <span className="text-slate-800">"{dlg.text}"</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.dialogVoiceOver.timingNotes && (
          <p className="text-[11px] text-slate-500 italic">
            Catatan Sinkronisasi: {result.dialogVoiceOver.timingNotes}
          </p>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 11. SFX & AMBIENCE */}
      {/* ========================================================================= */}
      <section id="section-11-sfx-ambience" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center">
              11
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                SFX & Ambience Audio
              </h3>
              <p className="text-xs text-slate-500">
                Penciptaan tekstur suara, foley, dan mood musik untuk editing pascaproduksi.
              </p>
            </div>
          </div>
          <Headphones className="w-5 h-5 text-violet-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ambient Sounds</span>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {result.sfxAndAmbience.ambientSounds.map((snd, idx) => (
                <li key={idx}>{snd}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sound Effects (SFX)</span>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {result.sfxAndAmbience.soundEffects.map((sfx, idx) => (
                <li key={idx}>{sfx}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Mood Musik Latar</span>
            <p className="text-slate-800 font-medium leading-relaxed">
              {result.sfxAndAmbience.musicMood}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. NEGATIVE PROMPT (Collapsible, Requirement #12) */}
      {/* ========================================================================= */}
      <section id="section-12-negative-prompt" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => setIsNegativePromptOpen(!isNegativePromptOpen)}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
              12
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors flex items-center gap-2">
                <span>Negative Prompt (Identity & Consistency Lock)</span>
                {isNegativePromptOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Menghindari mutasi wajah, distorsi perabot, artefak melayang, dan inkonsistensi scene.
              </p>
            </div>
          </button>

          <button
            type="button"
            id="btn-copy-negative-prompt"
            onClick={() => handleCopy('negative-prompt', result.negativePrompt)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
          >
            {copiedId === 'negative-prompt' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">✓ Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Negative Prompt</span>
              </>
            )}
          </button>
        </div>

        {isNegativePromptOpen && (
          <pre className="p-4 rounded-xl bg-slate-900 text-rose-300 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 selection:bg-rose-600 selection:text-white animate-in fade-in duration-200">
            {result.negativePrompt}
          </pre>
        )}
      </section>

      {/* BOTTOM ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-100 rounded-3xl border border-slate-200">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-slate-900">
            Selesai menyusun konsep untuk {videoType.title}?
          </h4>
          <p className="text-xs text-slate-500">
            Gunakan prompt gambar di generator gambar, lalu generate videonya di Google Flow / Veo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onEditConcept}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Edit Konsep / Buat Baru
          </button>

          <button
            type="button"
            onClick={() => handleCopy('bottom-full-project', getFullProjectSummaryText())}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            {copiedId === 'bottom-full-project' ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span className="text-white font-bold">✓ Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-violet-200" />
                <span>Salin Lengkap Semua</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
