import React, { useState } from 'react';
import {
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Utensils,
  Volume2,
  Eye,
  Camera,
  Layers,
  ShieldAlert,
  ArrowRight,
  ListOrdered,
  FileText,
  Clock,
  Sparkle,
  Sliders,
  CheckCircle2,
  ShoppingBag,
  Droplets,
  Scissors,
  Box,
  Share2,
} from 'lucide-react';
import { CreativeAnalysisResult, FoodPrepResult } from '../../creativeTypes';

interface FoodPreparationResultViewerProps {
  result: CreativeAnalysisResult;
  onEditKonsep: () => void;
  onBackToPilihStudio: () => void;
  userName: string;
}

export const FoodPreparationResultViewer: React.FC<FoodPreparationResultViewerProps> = ({
  result,
  onEditKonsep,
  onBackToPilihStudio,
  userName,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedScenes, setExpandedScenes] = useState<Record<number, boolean>>({ 1: true });
  const [selectedIngredientFilter, setSelectedIngredientFilter] = useState<string>('all');

  const foodData: FoodPrepResult | undefined = result.foodPrepData;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleScene = (idx: number) => {
    setExpandedScenes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAllScenes = (open: boolean) => {
    const totalScenes = foodData?.processBoard?.length || result.storyboard?.length || 4;
    const next: Record<number, boolean> = {};
    for (let i = 1; i <= totalScenes; i++) {
      next[i] = open;
    }
    setExpandedScenes(next);
  };

  const handleCopyAll = () => {
    const lines: string[] = [];
    lines.push(`==================================================`);
    lines.push(`🥕 ZEO FOOD PREPARATION STUDIO — HASIL VIDEO LENGKAP`);
    lines.push(`Creator: ${userName} | Engine: ${result.modelUsed || 'Gemini Multimodal'}`);
    lines.push(`Waktu Analisis: ${result.waktuAnalisis || 'Terkini'}`);
    lines.push(`==================================================\n`);

    if (foodData) {
      lines.push(`1. ANALISIS FOTO BAHAN:`);
      lines.push(foodData.photoAnalysis);
      lines.push(`\n2. BAHAN TERDETEKSI:`);
      lines.push(foodData.detectedIngredients.map((ing) => `• ${ing}`).join('\n'));
      lines.push(`\n3. AKTIVITAS TERPILIH:`);
      lines.push(foodData.selectedActivities.join(' → '));
      lines.push(`\n4. KONSEP FOOD PREPARATION:`);
      lines.push(foodData.conceptSummary);
      lines.push(`\n5. INGREDIENT STATE MAP (PELACAKAN STATUS FISIK):`);
      foodData.ingredientStateMap.forEach((item) => {
        lines.push(`- ${item.ingredient}:`);
        item.statesPerScene.forEach((st) => {
          lines.push(`   Scene ${st.sceneNumber}: ${st.state}`);
        });
      });
      lines.push(`\n6. PROCESS BOARD / STORYBOARD:`);
      foodData.processBoard.forEach((sc) => {
        lines.push(`--- SCENE ${sc.sceneNumber}: ${sc.activity} ---`);
        lines.push(`Fokus Bahan: ${sc.ingredient}`);
        lines.push(`Start State: ${sc.startState}`);
        lines.push(`Action: ${sc.action}`);
        lines.push(`End State: ${sc.endState}`);
        lines.push(`Camera: ${sc.camera}`);
        lines.push(`Hand Action: ${sc.handAction}`);
        lines.push(`ASMR / SFX: ${sc.asmrSfx}`);
        lines.push(`Continuity Lock: ${sc.continuity}\n`);
      });
      lines.push(`7. PROMPT GAMBAR (REFERENCE / HERO FRAMES):`);
      foodData.imagePrompts.forEach((img, i) => {
        lines.push(`[${img.title}] (${img.aspectRatio}):\n${img.prompt}\n`);
      });
      lines.push(`8. PROMPT VIDEO PER SCENE (AI VIDEO GENERATOR):`);
      foodData.videoPrompts.forEach((vp) => {
        lines.push(`[Scene ${vp.sceneNumber}: ${vp.title}]:\n${vp.prompt}\n`);
      });
      lines.push(`9. ASMR / SFX PLAN:`);
      foodData.asmrPlan.forEach((plan) => {
        lines.push(`• ${plan.activity}: ${plan.sfxSounds.join(', ')} | Ruang: ${plan.ambientText}`);
      });
      lines.push(`\n10. FINAL SHOT:`);
      lines.push(`[${foodData.finalShot.title}]: ${foodData.finalShot.description}`);
      lines.push(`Prompt:\n${foodData.finalShot.prompt}`);
      lines.push(`\n11. NEGATIVE PROMPT:`);
      lines.push(foodData.negativePrompt);
    } else {
      // Fallback formatting
      lines.push(JSON.stringify(result, null, 2));
    }

    handleCopy(lines.join('\n'), 'copy-all-master');
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg shadow-inner">
            🥕
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Food Preparation Studio Output
              <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800">
                Kontinuitas Fisik Terkunci
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Model: <span className="font-medium text-slate-700">{result.modelUsed || 'Gemini Multimodal'}</span> • Waktu: {result.waktuAnalisis || 'Terkini'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEditKonsep}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            Edit Konsep
          </button>

          <button
            type="button"
            onClick={handleCopyAll}
            className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            {copiedKey === 'copy-all-master' ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                Tersalin Semua!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Salin Semua Hasil
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. ANALISIS FOTO */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-amber-50/50 to-orange-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              📸 Analisis Foto Bahan & Kondisi
            </h3>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(foodData?.photoAnalysis || result.analisisCerita?.premis || '', 'copy-photo-analysis')}
            className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            {copiedKey === 'copy-photo-analysis' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            Salin
          </button>
        </div>
        <div className="p-6 text-sm text-slate-700 leading-relaxed bg-amber-50/10">
          <p className="whitespace-pre-line">
            {foodData?.photoAnalysis ||
              result.analisisCerita?.premis ||
              'Bahan makanan dan sayuran berhasil dideteksi dengan kondisi segar di atas meja dapur.'}
          </p>
        </div>
      </section>

      {/* 2. BAHAN TERDETEKSI */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-emerald-50/50 to-teal-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              🧺 Bahan Terdeteksi & Terkonfirmasi
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {foodData?.detectedIngredients?.length || 0} Bahan Aktif
          </span>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2.5">
            {(foodData?.detectedIngredients || ['Wortel', 'Telur', 'Bawang bombai', 'Sayuran hijau']).map((ing, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium hover:border-emerald-300 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {ing}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AKTIVITAS TERPILIH (DENGAN URUTAN PROSES LOGIS) */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-blue-50/50 to-indigo-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              🥗 Urutan Alur Proses Logis
            </h3>
          </div>
          <span className="text-xs text-blue-700 font-medium">Reordered by Physical Sequence</span>
        </div>
        <div className="p-6 space-y-3">
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/70 text-blue-900 text-xs font-semibold flex items-center gap-2 flex-wrap">
            <span className="text-blue-600 font-bold uppercase tracking-wider text-2xs">Aktivitas dipilih:</span>
            {(foodData?.selectedActivities || ['Grocery / Unpacking', 'Sorting', 'Washing', 'Food Preparation', 'Storage']).map((act, i, arr) => (
              <React.Fragment key={i}>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-800 shadow-2xs font-bold">
                  {act}
                </span>
                {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-blue-400" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 4. KONSEP FOOD PREPARATION */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-purple-50/50 to-violet-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
              4
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              ✨ Konsep Food Preparation & Pengaturan Kontinuitas
            </h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {foodData?.conceptSummary || result.analisisCerita?.alurRingkas}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block font-semibold mb-1">Gaya Visual Terkunci:</span>
              <span className="font-bold text-slate-800">{result.analisisCerita?.gayaVisualTerkunci || 'Cinematic Kitchen'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block font-semibold mb-1">Format Tangan & Manusia:</span>
              <span className="font-bold text-slate-800">🤲 Tangan Saja (Tanpa Wajah Tiba-Tiba)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block font-semibold mb-1">Integritas Fisik:</span>
              <span className="font-bold text-emerald-700">Strict Physical Logic Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INGREDIENT STATE MAP (PELACAKAN STATUS FISIK BAHAN) */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-amber-500/10 to-orange-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
              5
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                🗺️ Ingredient State Map (Pelacakan Kondisi Fisik)
              </h3>
              <p className="text-xs text-slate-500">
                Menjamin setiap scene meneruskan wujud fisik bahan dari scene sebelumnya tanpa teleportasi atau morphing.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {foodData?.ingredientStateMap && foodData.ingredientStateMap.length > 0 ? (
            <div className="space-y-3">
              {foodData.ingredientStateMap.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h4 className="text-xs font-bold text-slate-900">{item.ingredient}</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {item.statesPerScene.map((st, sIdx) => (
                      <div key={sIdx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                        <span className="text-2xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                          Scene {st.sceneNumber}
                        </span>
                        <p className="text-slate-700 leading-snug">{st.state}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-600">
              Pelacakan kondisi fisik diterapkan otomatis pada setiap prompt scene.
            </div>
          )}
        </div>
      </section>

      {/* 6. PROCESS BOARD / STORYBOARD */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-emerald-50/60 to-cyan-50/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              6
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                📋 Process Board (Tahapan Adegan Lengkap)
              </h3>
              <p className="text-xs text-slate-500">
                Struktur berorientasi proses fisik: Start State → Action → End State.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleAllScenes(true)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer px-2 py-1 rounded-md hover:bg-emerald-50"
            >
              Buka Semua
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => toggleAllScenes(false)}
              className="text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100"
            >
              Tutup Semua
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {(foodData?.processBoard || []).map((scene) => {
            const isExpanded = !!expandedScenes[scene.sceneNumber];
            return (
              <div
                key={scene.sceneNumber}
                className="rounded-xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs transition-all"
              >
                <div
                  onClick={() => toggleScene(scene.sceneNumber)}
                  className="px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                      Scene {scene.sceneNumber}
                    </span>
                    <span className="font-bold text-slate-800 text-xs">
                      {scene.activity}
                    </span>
                    <span className="hidden sm:inline-block text-2xs text-slate-500 font-medium px-2 py-0.5 bg-white rounded-md border border-slate-200">
                      Bahan: {scene.ingredient}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/70">
                        <span className="font-bold text-amber-900 block mb-1 text-2xs uppercase tracking-wider">
                          🏁 Starting State (Kondisi Awal):
                        </span>
                        <p className="text-slate-700 leading-relaxed">{scene.startState}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/70">
                        <span className="font-bold text-emerald-900 block mb-1 text-2xs uppercase tracking-wider">
                          ⚡ Action (Gerakan & Aksi Fisik):
                        </span>
                        <p className="text-slate-700 leading-relaxed">{scene.action}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/70">
                        <span className="font-bold text-blue-900 block mb-1 text-2xs uppercase tracking-wider">
                          🎯 Ending State (Kondisi Akhir):
                        </span>
                        <p className="text-slate-700 leading-relaxed">{scene.endState}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-slate-500 font-semibold block text-2xs mb-0.5">🎥 Camera Treatment:</span>
                        <p className="text-slate-800 font-medium">{scene.camera}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-slate-500 font-semibold block text-2xs mb-0.5">🤲 Hand & Finger Action:</span>
                        <p className="text-slate-800 font-medium">{scene.handAction}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-slate-500 font-semibold block text-2xs mb-0.5">🔊 ASMR / SFX:</span>
                        <p className="text-slate-800 font-medium">{scene.asmrSfx}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-slate-500 font-semibold block text-2xs mb-0.5">🔒 Continuity Lock:</span>
                        <p className="text-slate-800 font-medium">{scene.continuity}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. PROMPT GAMBAR (REFERENCE / HERO FRAMES) */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-amber-50/50 to-orange-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
              7
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                🖼️ Prompt Gambar (Reference Frame & Hero Image)
              </h3>
              <p className="text-xs text-slate-500">
                Gunakan untuk Midjourney, Flux, Imagen 3, atau generator gambar sebagai visual anchor.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {(foodData?.imagePrompts || []).map((img, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  {img.title}
                  <span className="text-2xs font-normal text-slate-500 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                    Ratio {img.aspectRatio}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(img.prompt, `copy-image-prompt-${idx}`)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === `copy-image-prompt-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  Salin Prompt
                </button>
              </div>
              <p className="text-xs font-mono text-slate-800 bg-white p-3 rounded-lg border border-slate-200 select-all leading-relaxed">
                {img.prompt}
              </p>
              {img.notes && (
                <p className="text-2xs text-slate-500 italic">Catatan: {img.notes}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. PROMPT VIDEO PER SCENE */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-indigo-50/60 to-purple-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              8
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                🎬 Prompt Video per Scene (AI Video Generator)
              </h3>
              <p className="text-xs text-slate-500">
                Format lengkap dalam bahasa Inggris untuk Kling, Runway Gen-3, Luma Dream Machine, Sora, atau Hailuo.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {(foodData?.videoPrompts || []).map((vp) => (
            <div key={vp.sceneNumber} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-2xs font-bold">
                    Scene {vp.sceneNumber}
                  </span>
                  {vp.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(vp.prompt, `copy-video-prompt-${vp.sceneNumber}`)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  {copiedKey === `copy-video-prompt-${vp.sceneNumber}` ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Salin Video Prompt
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800 select-all leading-relaxed whitespace-pre-wrap">
                {vp.prompt}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. ASMR / SFX PLAN */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-teal-50/50 to-emerald-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
              9
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              🔊 ASMR & SFX Sound Architecture
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(foodData?.asmrPlan || []).map((plan, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-teal-800 block">
                  {plan.activity}
                </span>
                <div className="space-y-1">
                  <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">Sound Effects:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.sfxSounds.map((snd, sI) => (
                      <span key={sI} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-2xs text-slate-700 font-medium">
                        {snd}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Ruang & Ambient:</span>
                  <p className="text-xs text-slate-600">{plan.ambientText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL SHOT */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-amber-500/10 to-yellow-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
              10
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              🏆 Final Shot (Hero Finish Frame)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(foodData?.finalShot?.prompt || '', 'copy-final-shot')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            {copiedKey === 'copy-final-shot' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            Salin Prompt
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div>
            <h4 className="font-bold text-xs text-slate-900">{foodData?.finalShot?.title}</h4>
            <p className="text-xs text-slate-600 mt-1">{foodData?.finalShot?.description}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed select-all">
            {foodData?.finalShot?.prompt}
          </div>
        </div>
      </section>

      {/* 11. NEGATIVE PROMPT */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-rose-50/50 to-red-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
              11
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Negative Prompt (Pelindung Kualitas & Logika Fisik)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(foodData?.negativePrompt || result.negativePrompt, 'copy-negative-prompt')}
            className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            {copiedKey === 'copy-negative-prompt' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            Salin Negative Prompt
          </button>
        </div>

        <div className="p-6">
          <p className="font-mono text-xs text-rose-950 bg-rose-50/40 p-3.5 rounded-xl border border-rose-200/60 leading-relaxed select-all">
            {foodData?.negativePrompt || result.negativePrompt}
          </p>
        </div>
      </section>

      {/* Bottom Back Button */}
      <div className="pt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onBackToPilihStudio}
          className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          ← Kembali ke Studio
        </button>

        <button
          type="button"
          onClick={handleCopyAll}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 active:scale-95"
        >
          <Copy className="w-4 h-4" />
          Salin Semua Hasil Food Preparation
        </button>
      </div>
    </div>
  );
};
