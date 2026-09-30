import React, { useState } from 'react';
import {
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Music,
  Video,
  User,
  MapPin,
  ListOrdered,
  Eye,
  Camera,
  Layers,
  ShieldAlert,
  ArrowRight,
  FileText,
  Clock,
  Sliders,
  CheckCircle2,
  Mic,
  Disc,
  Type,
  Share2,
  Volume2,
  Heart,
  Palette,
  Film,
} from 'lucide-react';
import { CreativeAnalysisResult, MusicLyricResult } from '../../creativeTypes';

interface MusicLyricResultViewerProps {
  result: CreativeAnalysisResult;
  onEditKonsep: () => void;
  onBackToPilihStudio: () => void;
  userName: string;
}

export const MusicLyricResultViewer: React.FC<MusicLyricResultViewerProps> = ({
  result,
  onEditKonsep,
  onBackToPilihStudio,
  userName,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedScenes, setExpandedScenes] = useState<Record<number, boolean>>({ 1: true });
  const [activeTab, setActiveTab] = useState<'all' | 'scenes' | 'character' | 'lyrics' | 'storyboard'>('all');

  const musicData: MusicLyricResult | undefined = result.musicLyricData;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleScene = (idx: number) => {
    setExpandedScenes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAllScenes = (open: boolean) => {
    const totalScenes = musicData?.storyboard?.length || result.storyboard?.length || 6;
    const next: Record<number, boolean> = {};
    for (let i = 1; i <= totalScenes; i++) {
      next[i] = open;
    }
    setExpandedScenes(next);
  };

  // Helper copy handlers
  const handleCopyAllImagePrompts = () => {
    if (!musicData?.sceneImagePrompts) return;
    const all = musicData.sceneImagePrompts
      .map((p) => `[SCENE ${p.sceneNumber} — IMAGE PROMPT]\n${p.prompt}`)
      .join('\n\n---\n\n');
    handleCopy(all, 'all-image-prompts');
  };

  const handleCopyAllVideoPrompts = () => {
    if (!musicData?.sceneVideoPrompts) return;
    const all = musicData.sceneVideoPrompts
      .map((p) => `[SCENE ${p.sceneNumber} — VIDEO PROMPT]\n${p.prompt}${p.singerLockNotes ? `\n\n[SINGER LOCK]: ${p.singerLockNotes}` : ''}`)
      .join('\n\n---\n\n');
    handleCopy(all, 'all-video-prompts');
  };

  const handleCopyStoryboard = () => {
    if (!musicData?.storyboard) return;
    const rows = musicData.storyboard.map(
      (s) =>
        `SCENE ${s.sceneNumber} (${s.songSection} | ${s.duration})\n- Lyric Cue: "${s.lyricCue}"\n- Location: ${s.location}\n- Character: ${s.character}\n- Visual Idea: ${s.visualIdea}\n- Action: ${s.action}\n- Camera: ${s.camera}\n- Transition: ${s.transition}\n- Text Overlay: ${s.textLyricDisplay}\n- Continuity: ${s.continuity}`
    );
    handleCopy(rows.join('\n\n'), 'storyboard-all');
  };

  const handleCopyAll = () => {
    if (!musicData) return;
    const text = `# ZEO CREATIVE STUDIO — MUSIC & LYRIC VISUAL PLAN

## 1. MUSIC & LYRIC ANALYSIS
- Sumber: ${musicData.musicLyricAnalysis.sourceType}
- Tema: ${musicData.musicLyricAnalysis.theme}
- Mood: ${musicData.musicLyricAnalysis.mood}
- Genre: ${musicData.musicLyricAnalysis.genre}
- Alur Emosi: ${musicData.musicLyricAnalysis.emotionalProgression}
- Simbol Visual: ${musicData.musicLyricAnalysis.symbolsAndMetaphors.join(', ')}

### LIRIK LAGU:
${musicData.musicLyricAnalysis.songLyrics}

---

## 2. MUSIC VIDEO CONCEPT
${musicData.conceptSummary}

---

## 3. MASTER VISUAL STYLE
Gaya Visual: ${musicData.masterVisualStyle}

---

## 4. MASTER CHARACTER & CHARACTER SHEET PROMPT
${musicData.masterCharacters.map((c) => `### ${c.name}\n- Profil: ${JSON.stringify(c.visualIdentity, null, 2)}\n\n[CHARACTER SHEET PROMPT]:\n${c.characterSheetPrompt}`).join('\n\n')}

---

## 5. MASTER LOCATIONS & PROMPTS
${musicData.masterLocations.map((l) => `### ${l.name}\n[LOCATION PROMPT]:\n${l.locationLockPrompt}`).join('\n\n')}

---

## 6. SONG STRUCTURE
${musicData.songStructure.map((st) => `- [${st.section}] ${st.title} (${st.timingOrCue}): ${st.description}`).join('\n')}

---

## 7. STORYBOARD & SCENE PROMPTS (${musicData.storyboard.length} SCENE)
${musicData.storyboard.map((s, idx) => {
  const imgPrompt = musicData.sceneImagePrompts.find((p) => p.sceneNumber === s.sceneNumber)?.prompt || '';
  const vidPrompt = musicData.sceneVideoPrompts.find((p) => p.sceneNumber === s.sceneNumber)?.prompt || '';
  const overlay = musicData.lyricOverlayPlan.find((o) => o.sceneNumber === s.sceneNumber);
  return `### SCENE ${s.sceneNumber} — ${s.songSection} (${s.duration})
- Lyric Cue: "${s.lyricCue}"
- Location: ${s.location}
- Character: ${s.character}
- Visual Idea: ${s.visualIdea}
- Action: ${s.action}
- Camera: ${s.camera}
- Transition: ${s.transition}
- Continuity: ${s.continuity}

[IMAGE PROMPT]:
${imgPrompt}

[VIDEO PROMPT]:
${vidPrompt}

[LYRIC OVERLAY PLAN]:
- Teks: "${overlay?.text || s.lyricCue}"
- Posisi: ${overlay?.position || 'Bottom-Center'}
- Animasi: ${overlay?.animation || 'Fade in'}
- Mood Font: ${overlay?.fontMood || 'Modern Clean'}
`;
}).join('\n---\n\n')}

---

## 8. AUDIO & SFX NOTES
- Gaya Musik: ${musicData.audioSfxNotes.musicStyle}
- SFX Ambience: ${musicData.audioSfxNotes.sfxLayers.join(', ')}
${musicData.audioSfxNotes.vocalNotes ? `- Catatan Vokal: ${musicData.audioSfxNotes.vocalNotes}` : ''}

---

## 9. FINAL HERO SHOT
- Judul: ${musicData.finalShot.title}
- Deskripsi: ${musicData.finalShot.description}
- Prompt: ${musicData.finalShot.prompt}

---

## 10. NEGATIVE PROMPT
${musicData.negativePrompt}
`;
    handleCopy(text, 'all-full-markdown');
  };

  if (!musicData) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-300">
        <p>Data Music & Lyric Visual tidak tersedia.</p>
        <button
          onClick={onEditKonsep}
          className="mt-4 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-sm font-medium"
        >
          Kembali ke Form
        </button>
      </div>
    );
  }

  const analysis = musicData.musicLyricAnalysis;
  const scenes = musicData.storyboard;
  const imagePrompts = musicData.sceneImagePrompts;
  const videoPrompts = musicData.sceneVideoPrompts;

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-fuchsia-950/20 to-slate-900 border border-fuchsia-800/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-semibold tracking-wide uppercase">
              <Music className="w-3.5 h-3.5" />
              <span>ZEO MUSIC VIDEO PRODUCTION PLAN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              🎵 {analysis.theme || 'Music & Lyric Visual'}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {musicData.conceptSummary}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200 font-medium">
                🎭 Mood: <strong className="text-fuchsia-400">{analysis.mood}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200 font-medium">
                🎶 Genre: <strong className="text-purple-400">{analysis.genre}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200 font-medium">
                🎨 Gaya: <strong className="text-pink-400">{musicData.masterVisualStyle}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-fuchsia-900/40 border border-fuchsia-600/50 text-fuchsia-200 font-semibold">
                🎬 {scenes.length} Scene Terstruktur
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              id="btn-music-salin-semua"
              onClick={handleCopyAll}
              className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copiedKey === 'all-full-markdown' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>BERHASIL DISALIN!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>SALIN SEMUA (LENGKAP)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onEditKonsep}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Parameter</span>
            </button>
            <button
              type="button"
              onClick={onBackToPilihStudio}
              className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>← Pilih Studio Lain</span>
            </button>
          </div>
        </div>

        {/* Global Quick Copy Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 mr-2 flex items-center gap-1">
            <Copy className="w-3 h-3 text-fuchsia-400" /> Tombol Salin Cepat:
          </span>
          <button
            type="button"
            id="btn-copy-lirik"
            onClick={() => handleCopy(analysis.songLyrics, 'quick-lyrics')}
            className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedKey === 'quick-lyrics' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-fuchsia-400" />}
            <span>SALIN LIRIK</span>
          </button>
          <button
            type="button"
            id="btn-copy-all-img"
            onClick={handleCopyAllImagePrompts}
            className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedKey === 'all-image-prompts' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Camera className="w-3.5 h-3.5 text-blue-400" />}
            <span>SALIN SEMUA PROMPT GAMBAR</span>
          </button>
          <button
            type="button"
            id="btn-copy-all-vid"
            onClick={handleCopyAllVideoPrompts}
            className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedKey === 'all-video-prompts' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Video className="w-3.5 h-3.5 text-emerald-400" />}
            <span>SALIN SEMUA PROMPT VIDEO</span>
          </button>
          <button
            type="button"
            id="btn-copy-storyboard"
            onClick={handleCopyStoryboard}
            className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedKey === 'storyboard-all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ListOrdered className="w-3.5 h-3.5 text-purple-400" />}
            <span>SALIN STORYBOARD</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          Semua Output (Lengkap 1-13)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('scenes')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'scenes'
              ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          🎬 Scene & Prompts ({scenes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('lyrics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'lyrics'
              ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          📝 Analisis & Lirik Lagu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('character')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'character'
              ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          👤 Character Sheet & Lokasi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('storyboard')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'storyboard'
              ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30'
              : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          🎼 Struktur Lagu & Transisi
        </button>
      </div>

      {/* SECTION 1: MUSIC / LYRIC ANALYSIS */}
      {(activeTab === 'all' || activeTab === 'lyrics') && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">1. MUSIC / LYRIC ANALYSIS</h2>
                <p className="text-xs text-slate-400">Analisis mendalam emosi, struktur, metafora simbolik, dan karakter lagu</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(analysis.songLyrics, 'sec1-lirik')}
              className="px-3 py-1.5 bg-fuchsia-950/60 hover:bg-fuchsia-900/80 border border-fuchsia-700/50 text-fuchsia-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'sec1-lirik' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-fuchsia-300" />}
              <span>SALIN LIRIK</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Inti Cerita & Alur Emosi</span>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {analysis.story}
              </p>
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-xs font-medium text-fuchsia-400">Perkembangan Emosi:</span>
                <p className="text-xs text-slate-300 mt-1 italic leading-relaxed">
                  "{analysis.emotionalProgression}"
                </p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Simbol & Metafora Visual</span>
              <div className="flex flex-wrap gap-2">
                {analysis.symbolsAndMetaphors?.map((sym, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-200"
                  >
                    ✨ {sym}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-4 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500 block">Karakter Teridentifikasi:</span>
                  <span className="text-slate-300 font-medium">{analysis.charactersIdentified?.join(', ') || 'Tokoh Utama'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lokasi Utama:</span>
                  <span className="text-slate-300 font-medium">{analysis.locationsIdentified?.join(', ') || 'Lokasi Terpilih'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lyrics Box */}
          <div className="bg-slate-950 border border-fuchsia-950/50 rounded-xl p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-fuchsia-300 flex items-center gap-1.5 uppercase tracking-wide">
                <FileText className="w-3.5 h-3.5 text-fuchsia-400" /> Teks Lirik Lagu (Source of Truth)
              </span>
              <span className="text-[11px] text-slate-500">Teks orisinal terpelihara tanpa manipulasi hak cipta</span>
            </div>
            <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 max-h-60 overflow-y-auto">
              {analysis.songLyrics}
            </pre>
          </div>
        </section>
      )}

      {/* SECTION 2 & 3: CONCEPT & MASTER VISUAL STYLE */}
      {(activeTab === 'all' || activeTab === 'character') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SECTION 2: MUSIC VIDEO CONCEPT */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">2. MUSIC VIDEO CONCEPT</h2>
                <p className="text-xs text-slate-400">Pendekatan sutradara dan storytelling</p>
              </div>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {musicData.conceptSummary}
            </p>
            <div className="p-3 bg-violet-950/20 border border-violet-900/40 rounded-xl text-xs text-violet-200">
              💡 <strong>Tiga Pendekatan Visual:</strong> Mengombinasikan <em>LITERAL</em> (adegan nyata lirik), <em>EMOTIONAL</em> (refleksi batin tokoh), dan <em>SYMBOLIC</em> (metafora puitis) agar alur video tidak monoton.
            </div>
          </section>

          {/* SECTION 3: MASTER VISUAL STYLE */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">3. MASTER VISUAL STYLE</h2>
                <p className="text-xs text-slate-400">Master Visual Style Lock di semua scene</p>
              </div>
            </div>
            <div className="p-4 bg-slate-950/80 border border-pink-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Style Lock</span>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold text-xs border border-pink-500/40">
                  {musicData.masterVisualStyle}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seluruh prompt gambar (Character Sheet, Lokasi, Scene Keyframes) dan video generation terkunci menggunakan konsistensi render, palet warna, dan tekstur <strong>{musicData.masterVisualStyle}</strong> tanpa deviasi gaya visual di tengah alur lagu.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* SECTION 4 & 5: MASTER CHARACTER & CHARACTER SHEET PROMPT */}
      {(activeTab === 'all' || activeTab === 'character') && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">4. MASTER CHARACTER & 5. CHARACTER SHEET PROMPT</h2>
                <p className="text-xs text-slate-400">Profil karakter konsisten dan prompt multi-angle neutral reference pose</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {musicData.masterCharacters?.map((char, cIdx) => (
              <div key={cIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-fuchsia-400 uppercase tracking-wide">
                      {char.sumberKarakter}
                    </span>
                    <h3 className="text-base font-bold text-white">{char.name}</h3>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                    Style: {char.visualIdentity?.visualStyle || musicData.masterVisualStyle}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Wajah & Ekspresi:</span>
                    <span className="text-slate-200 font-medium">{char.visualIdentity?.facialAppearance || 'Hangat & tulus'}</span>
                  </div>
                  <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Rambut / Hijab:</span>
                    <span className="text-slate-200 font-medium">{char.visualIdentity?.hairstyleOrHijab || 'Natural'}</span>
                  </div>
                  <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Busana:</span>
                    <span className="text-slate-200 font-medium">{char.visualIdentity?.outfitAndColor || 'Kasual konsisten'}</span>
                  </div>
                  <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Proporsi:</span>
                    <span className="text-slate-200 font-medium">{char.visualIdentity?.bodyProportions || 'Alami & proporsional'}</span>
                  </div>
                </div>

                {/* Character Sheet Prompt in English */}
                <div className="bg-slate-900/90 border border-purple-900/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase">
                      <Camera className="w-3.5 h-3.5 text-purple-400" /> PROMPT GAMBAR CHARACTER SHEET (ENGLISH)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(char.characterSheetPrompt, `char-prompt-${cIdx}`)}
                      className="px-2.5 py-1 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-purple-200 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === `char-prompt-${cIdx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Salin Prompt Sheet</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-950/80 p-3 rounded-lg border border-slate-800/90 leading-relaxed">
                    {char.characterSheetPrompt}
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    ℹ️ Prompt ini menghasilkan lembar referensi karakter multi-sudut (front, 3/4, side, full body, close-up) dengan busana identik untuk menjaga kontinuitas di generator gambar/video AI.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 6 & 7: MASTER LOCATIONS & PROMPTS */}
      {(activeTab === 'all' || activeTab === 'character') && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">6. MASTER LOCATIONS & 7. LOCATION IMAGE PROMPTS</h2>
                <p className="text-xs text-slate-400">Lingkungan sinematik bersih tanpa karakter (Location Lock)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {musicData.masterLocations?.map((loc, lIdx) => (
              <div key={lIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {loc.name}
                  </h3>
                  <span className="text-[11px] text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    Location Lock
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {loc.environmentDetails?.locationType} • {loc.environmentDetails?.timeOfDayOrEra}
                </p>
                <div className="bg-slate-900/90 border border-emerald-950 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase">Prompt Gambar Lokasi (English):</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(loc.locationLockPrompt, `loc-prompt-${lIdx}`)}
                      className="px-2 py-0.5 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-700/40 text-emerald-300 rounded text-[11px] flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === `loc-prompt-${lIdx}` ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                      <span>Salin</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-950/80 p-2.5 rounded border border-slate-800 leading-relaxed">
                    {loc.locationLockPrompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 8: SONG STRUCTURE TIMELINE */}
      {(activeTab === 'all' || activeTab === 'storyboard') && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Disc className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">8. SONG STRUCTURE BREAKDOWN</h2>
              <p className="text-xs text-slate-400">Pembagian seksi lagu, durasi, dan dinamika emosional</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {musicData.songStructure?.map((sec, sIdx) => (
              <div
                key={sIdx}
                className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-colors rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                    {sec.section}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{sec.timingOrCue}</span>
                </div>
                <h4 className="text-xs font-semibold text-white">{sec.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                  {sec.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 9 & 10: STORYBOARD & DETAILED SCENES */}
      {(activeTab === 'all' || activeTab === 'scenes' || activeTab === 'storyboard') && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ListOrdered className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">9. STORYBOARD & 10. SCENE PROMPTS ({scenes.length} SCENE)</h2>
                <p className="text-xs text-slate-400">
                  Lengkap: Song Cue, Prompt Gambar (Keyframe), Prompt Video/Animasi, Transition, dan Lyric Overlay Plan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleAllScenes(true)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md transition-colors"
              >
                Buka Semua
              </button>
              <button
                type="button"
                onClick={() => toggleAllScenes(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md transition-colors"
              >
                Tutup Semua
              </button>
            </div>
          </div>

          {/* Scene Cards Stack */}
          <div className="space-y-5">
            {scenes.map((scene) => {
              const isExpanded = expandedScenes[scene.sceneNumber] !== false;
              const imgPrompt = imagePrompts.find((p) => p.sceneNumber === scene.sceneNumber);
              const vidPrompt = videoPrompts.find((p) => p.sceneNumber === scene.sceneNumber);
              const overlay = musicData.lyricOverlayPlan?.find((o) => o.sceneNumber === scene.sceneNumber);

              return (
                <div
                  key={scene.sceneNumber}
                  className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-md"
                >
                  {/* Scene Accordion Header */}
                  <div
                    onClick={() => toggleScene(scene.sceneNumber)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                        {scene.sceneNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 font-semibold text-xs border border-fuchsia-500/30">
                            {scene.songSection}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            ⏱️ {scene.duration}
                          </span>
                          <span className="text-xs text-slate-300">
                            📍 {scene.location}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white mt-1 italic">
                          "{scene.lyricCue}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const fullSceneText = `SCENE ${scene.sceneNumber} (${scene.songSection} | ${scene.duration})\nLyric Cue: "${scene.lyricCue}"\nLocation: ${scene.location}\nCharacter: ${scene.character}\nVisual Idea: ${scene.visualIdea}\nAction: ${scene.action}\nCamera: ${scene.camera}\nTransition: ${scene.transition}\n\n[IMAGE PROMPT]:\n${imgPrompt?.prompt || ''}\n\n[VIDEO PROMPT]:\n${vidPrompt?.prompt || ''}\n\n[LYRIC PLAN]:\n${overlay?.text || scene.lyricCue} (${overlay?.position || 'Bottom-Center'}, ${overlay?.animation || 'Fade in'})`;
                          handleCopy(fullSceneText, `full-scene-${scene.sceneNumber}`);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        {copiedKey === `full-scene-${scene.sceneNumber}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Salin Scene</span>
                      </button>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Scene Expanded Body */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-slate-800/80 bg-slate-900/40 space-y-5">
                      {/* Meta Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                          <span className="text-slate-500 font-medium block">Ide Visual & Emosi:</span>
                          <span className="text-slate-200 font-semibold">{scene.visualIdea}</span>
                          <span className="text-fuchsia-400 block pt-1">Emosi: {scene.emotion}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                          <span className="text-slate-500 font-medium block">Aksi Fisik & Karakter:</span>
                          <span className="text-slate-200 leading-relaxed block">{scene.action}</span>
                          <span className="text-slate-400 text-[11px] block">Tokoh: {scene.character}</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                          <span className="text-slate-500 font-medium block">Kamera & Transisi:</span>
                          <span className="text-slate-200 font-medium block">🎥 {scene.camera}</span>
                          <span className="text-purple-400 font-medium block">🔄 {scene.transition}</span>
                        </div>
                      </div>

                      {/* Prompts Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Image Prompt */}
                        <div className="bg-slate-950 border border-blue-900/30 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 uppercase">
                              <Camera className="w-3.5 h-3.5 text-blue-400" /> PROMPT GAMBAR KEYFRAME (ENGLISH)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(imgPrompt?.prompt || '', `img-p-${scene.sceneNumber}`)}
                              className="px-2 py-0.5 bg-blue-950/60 hover:bg-blue-900 border border-blue-800/50 text-blue-200 rounded text-xs flex items-center gap-1 transition-colors"
                            >
                              {copiedKey === `img-p-${scene.sceneNumber}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Salin Gambar</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed">
                            {imgPrompt?.prompt || 'Image prompt tidak tersedia'}
                          </p>
                          <span className="text-[11px] text-slate-400 block">
                            Rasio: {imgPrompt?.aspectRatio || '9:16'} • Anchor untuk AI Video Generation
                          </span>
                        </div>

                        {/* Video Prompt */}
                        <div className="bg-slate-950 border border-emerald-900/30 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase">
                              <Video className="w-3.5 h-3.5 text-emerald-400" /> PROMPT VIDEO / ANIMASI (ENGLISH)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(vidPrompt?.prompt || '', `vid-p-${scene.sceneNumber}`)}
                              className="px-2 py-0.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/50 text-emerald-200 rounded text-xs flex items-center gap-1 transition-colors"
                            >
                              {copiedKey === `vid-p-${scene.sceneNumber}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Salin Video</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed">
                            {vidPrompt?.prompt || 'Video prompt tidak tersedia'}
                          </p>
                          {vidPrompt?.singerLockNotes && (
                            <div className="p-2 bg-emerald-950/30 border border-emerald-800/40 rounded text-[11px] text-emerald-300">
                              🎤 {vidPrompt.singerLockNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Text / Lyric Overlay Plan */}
                      <div className="bg-slate-950/90 border border-purple-950/60 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase">
                            <Type className="w-3.5 h-3.5 text-purple-400" /> LYRIC / TEXT OVERLAY PLAN
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{overlay?.timestampCue || scene.duration}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 text-[10px] block">Teks Ditampilkan:</span>
                            <span className="text-white font-medium italic">"{overlay?.text || scene.lyricCue}"</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 text-[10px] block">Posisi Layar:</span>
                            <span className="text-slate-200">{overlay?.position || 'Bottom-Center'}</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 text-[10px] block">Animasi Entry/Exit:</span>
                            <span className="text-slate-200">{overlay?.animation || 'Fade in/out'}</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 text-[10px] block">Tipografi / Font Mood:</span>
                            <span className="text-slate-200">{overlay?.fontMood || 'Modern Clean'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Continuity Note */}
                      <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                        <span className="text-fuchsia-400 font-semibold shrink-0">🔗 Continuity Check:</span>
                        <span>{scene.continuity}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 11, 12, 13: AUDIO NOTES, FINAL SHOT, NEGATIVE PROMPT */}
      {(activeTab === 'all' || activeTab === 'storyboard') && (
        <div className="space-y-6">
          {/* SECTION 11: AUDIO & SFX NOTES */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">11. AUDIO / SFX NOTES</h2>
                <p className="text-xs text-slate-400">Gaya musik, perlapisan suara taktil, dan catatan vokal</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block uppercase">Gaya Musik:</span>
                <p className="text-slate-200">{musicData.audioSfxNotes.musicStyle}</p>
                {musicData.audioSfxNotes.vocalNotes && (
                  <p className="text-cyan-300 pt-1">🎤 {musicData.audioSfxNotes.vocalNotes}</p>
                )}
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold block uppercase">Layer SFX Ambient Taktil:</span>
                <ul className="space-y-1 text-slate-300">
                  {musicData.audioSfxNotes.sfxLayers?.map((layer, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>{layer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 12: FINAL SHOT */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">12. FINAL HERO SHOT</h2>
                  <p className="text-xs text-slate-400">{musicData.finalShot.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(musicData.finalShot.prompt, 'final-shot')}
                className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-800/50 text-amber-200 rounded text-xs flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'final-shot' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Salin Final Shot</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {musicData.finalShot.description}
            </p>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-950 font-mono text-xs text-slate-300">
              {musicData.finalShot.prompt}
            </div>
          </section>

          {/* SECTION 13: NEGATIVE PROMPT */}
          <section className="bg-slate-900 border border-rose-950/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">13. NEGATIVE PROMPT KHUSUS MUSIC VIDEO</h2>
                  <p className="text-xs text-slate-400">Proteksi karakter, kontinuitas wajah, pakaian, dan lokasi konsisten</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(musicData.negativePrompt, 'neg-prompt')}
                className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-200 rounded text-xs flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'neg-prompt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Salin Negative Prompt</span>
              </button>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-900/30 font-mono text-xs text-rose-200/90 leading-relaxed">
              {musicData.negativePrompt}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
