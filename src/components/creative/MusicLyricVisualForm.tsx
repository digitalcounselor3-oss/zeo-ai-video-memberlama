import React, { useState, useRef } from 'react';
import {
  Upload,
  Music,
  Video,
  FileText,
  Sparkles,
  ArrowRight,
  Disc,
  User,
  Sliders,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Palette,
  Film,
  Camera,
  Play,
  Volume2,
} from 'lucide-react';
import { CreativeVideoTypeMeta, CreativeAnalysisResult } from '../../creativeTypes';
import { MusicLyricResultViewer } from './MusicLyricResultViewer';
import { generateCreativeFallbackResult } from '../../utils/creativeFallbackGenerator';

const getUserApiKey = (): string => {
  return (
    sessionStorage.getItem('ai_affiliate_session_key') ||
    localStorage.getItem('user_gemini_api_key') ||
    ''
  );
};

interface MusicLyricVisualFormProps {
  videoType: CreativeVideoTypeMeta;
  userName: string;
  onBackToPilihStudio: () => void;
}

export const MusicLyricVisualForm: React.FC<MusicLyricVisualFormProps> = ({
  videoType,
  userName,
  onBackToPilihStudio,
}) => {
  // 1. Sumber Musik / Lirik
  const [sourceType, setSourceType] = useState<'lirik' | 'audio' | 'buat-lirik' | 'instrumental'>('lirik');
  const [lyricsText, setLyricsText] = useState<string>(
    'Di sudut kamar ini,\nbayangmu masih tertinggal.\nHujan di luar jendela,\nseperti air mata yang tak sempat tumpah.'
  );

  // Audio file states
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<string>('03:20');
  const [audioMood, setAudioMood] = useState<string>('Haru / Emosional');
  const [audioBase64, setAudioBase64] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buatkan lirik baru states
  const [themeInput, setThemeInput] = useState<string>('Perjalanan Menemukan Diri & Cinta yang Hilang');
  const [moodInput, setMoodInput] = useState<string>('Haru, Penuh Harapan');
  const [genreInput, setGenreInput] = useState<string>('Acoustic Pop');
  const [storyIdeaInput, setStoryIdeaInput] = useState<string>('Seseorang yang berjalan menelusuri kota tua mengenang masa lalu hingga menyadari masa depan masih cerah');

  // Instrumental states
  const [instrumentalGenre, setInstrumentalGenre] = useState<string>('Lo-Fi Chill & Ambient');

  // 2. Pilihan Jenis Video Musik
  const [videoTypeChoice, setVideoTypeChoice] = useState<string>('Animated Music Video');

  // 3. Gaya Visual Terkunci
  const [visualStyle, setVisualStyle] = useState<string>('3D Animation');

  // 4. Konsistensi Karakter
  const [characterMode, setCharacterMode] = useState<'Otomatis' | 'Dengan Karakter' | 'Tanpa Karakter'>('Dengan Karakter');
  const [characterDesc, setCharacterDesc] = useState<string>(
    'Pemuda Indonesia usia 22 tahun, tatapan teduh, jaket denim cokelat vintage, rambut hitam sedikit berantakan'
  );

  // 5. Durasi & Produksi
  const [productionMode, setProductionMode] = useState<string>('NORMAL');
  const [totalDuration, setTotalDuration] = useState<string>('60 detik');
  const [sceneDuration, setSceneDuration] = useState<string>('10 detik');
  const [platform, setPlatform] = useState<string>('TikTok / Reels / Shorts (9:16)');

  // Engine & UI states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CreativeAnalysisResult | null>(null);

  // Audio Upload handler
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setAudioBase64(res);
    };
    reader.readAsDataURL(file);
  };

  // Test Wajib Preset
  const handleLoadTestWajib = () => {
    setSourceType('lirik');
    setLyricsText(
      'Di sudut kamar ini,\nbayangmu masih tertinggal.\nHujan di luar jendela,\nseperti air mata yang tak sempat tumpah.'
    );
    setVisualStyle('3D Animation');
    setTotalDuration('60 detik');
    setSceneDuration('10 detik');
    setVideoTypeChoice('Animated Music Video');
    setProductionMode('NORMAL');
    setPlatform('TikTok / Reels / Shorts (9:16)');
    setCharacterMode('Dengan Karakter');
    setCharacterDesc('Pemuda Indonesia usia 22 tahun, tatapan teduh, jaket denim cokelat vintage di kamar berhujan');
  };

  // Analyze & Generate Plan
  const handleGenerate = async () => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisProgress('ZEO Sutradara MV sedang menganalisis ritme emosi dan lirik...');

    const userKey = getUserApiKey();

    const requestPayload = {
      videoTypeId: 'lyric-visual',
      videoTypeTitle: '🎵 Music & Lyric Visual',
      videoTypeCategory: 'creative-modes',
      references: [],
      characterChoice: characterMode === 'Tanpa Karakter' ? 'Tanpa Karakter' : 'Karakter Baru',
      characterDescription: characterDesc,
      visualStyle,
      duration: totalDuration,
      totalDuration,
      sceneDuration,
      platform,
      productionMode,
      musicSourceType: sourceType,
      musicLyrics: sourceType === 'lirik' ? lyricsText : sourceType === 'buat-lirik' ? `Tema: ${themeInput}\nMood: ${moodInput}\nGenre: ${genreInput}\nCerita: ${storyIdeaInput}` : `Instrumental Track: ${instrumentalGenre}`,
      musicTheme: sourceType === 'buat-lirik' ? themeInput : 'Cinta & Kenangan',
      musicMood: sourceType === 'audio' ? audioMood : sourceType === 'buat-lirik' ? moodInput : 'Haru & Reflektif',
      musicGenre: sourceType === 'buat-lirik' ? genreInput : sourceType === 'instrumental' ? instrumentalGenre : 'Acoustic Pop',
      musicStoryIdea: sourceType === 'buat-lirik' ? storyIdeaInput : 'Perjalanan emosional di kamar berhujan',
      musicVideoType: videoTypeChoice,
      musicVisualStyle: visualStyle,
      musicCharacterMode: characterMode,
      musicDuration: totalDuration,
      musicSceneDuration: sceneDuration,
      musicProductionMode: productionMode,
      musicPlatform: platform,
      apiKey: userKey,
    };

    try {
      if (userKey) {
        setAnalysisProgress('Menghubungi Gemini dengan BYOK terverifikasi...');
        const response = await fetch('/api/creative-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });

        const data = await response.json();
        if (data.success && data.result) {
          setAnalysisResult(data.result);
          setIsAnalyzing(false);
          return;
        } else {
          console.warn('API returned error or fallback needed:', data.error);
        }
      }

      // Fallback engine if offline / bypass / key error
      setAnalysisProgress('Menyusun arsitektur Music Video lengkap...');
      const fallback = generateCreativeFallbackResult(
        videoType,
        {
          videoTypeId: 'lyric-visual',
          videoTypeTitle: '🎵 Music & Lyric Visual',
          videoTypeCategory: 'creative-modes',
          references: [],
          characterChoice: characterMode === 'Tanpa Karakter' ? 'Tanpa Karakter' : 'Karakter Baru',
          characterDescription: characterDesc,
          visualStyle,
          audio: 'Musik Orisinal & Ambient SFX',
          duration: totalDuration,
          sceneCount: '6 Scene',
          platform,
          videoIdea: lyricsText,
          productionMode,
          musicLyrics: lyricsText,
          musicVideoType: videoTypeChoice,
          musicDuration: totalDuration,
          musicSceneDuration: sceneDuration,
        } as any,
        userName
      );

      setAnalysisResult(fallback);
    } catch (err: any) {
      console.error('Error in handleGenerate:', err);
      // Fallback guarantees user never gets stuck
      const fallback = generateCreativeFallbackResult(
        videoType,
        {
          videoTypeId: 'lyric-visual',
          videoTypeTitle: '🎵 Music & Lyric Visual',
          videoTypeCategory: 'creative-modes',
          references: [],
          characterChoice: characterMode === 'Tanpa Karakter' ? 'Tanpa Karakter' : 'Karakter Baru',
          characterDescription: characterDesc,
          visualStyle,
          audio: 'Musik Orisinal & Ambient SFX',
          duration: totalDuration,
          sceneCount: '6 Scene',
          platform,
          videoIdea: lyricsText,
          productionMode,
          musicLyrics: lyricsText,
          musicVideoType: videoTypeChoice,
          musicDuration: totalDuration,
          musicSceneDuration: sceneDuration,
        } as any,
        userName
      );
      setAnalysisResult(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (analysisResult) {
    return (
      <MusicLyricResultViewer
        result={analysisResult}
        userName={userName}
        onEditKonsep={() => setAnalysisResult(null)}
        onBackToPilihStudio={onBackToPilihStudio}
      />
    );
  }

  const hasApiKey = !!getUserApiKey();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-fuchsia-950/30 to-slate-900 border border-fuchsia-800/40 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-semibold uppercase">
              <Music className="w-3.5 h-3.5" />
              <span>ZEO CREATIVE STUDIO — MUSIC & LYRIC ENGINE</span>
            </div>
            <button
              type="button"
              onClick={handleLoadTestWajib}
              className="px-3 py-1.5 bg-fuchsia-600/30 hover:bg-fuchsia-600/50 text-fuchsia-200 border border-fuchsia-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title="Isi otomatis dengan data skenario Test Wajib (60 detik, 3D Animation, 6 scene)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>⭐ Muat Skenario Uji (Test Wajib)</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            🎵 Music & Lyric Visual Studio
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Sutradara musik video & animator cerdas ZEO. Mengubah lagu, lirik, atau ide vokal menjadi konsep visual utuh, storyboard ritmis bertahap, prompt gambar karakter/lokasi, dan prompt video per scene.
          </p>
        </div>
      </div>

      {!hasApiKey && (
        <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">BYOK Mode Siap:</span> API Key pengguna belum terdeteksi di sesi ini. Generator akan menggunakan arsitektur orkestrasi internal berkecepatan tinggi ZEO. Anda juga dapat memasukkan API Key kapan saja.
          </div>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
        {/* STEP 1: SUMBER MUSIK / LIRIK */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-fuchsia-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Sumber Musik / Lirik</span>
            </h2>
            <span className="text-xs text-slate-400">Pilih salah satu metode input</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'lirik', label: 'Tempel Lirik', icon: FileText, desc: 'Teks lirik lagu lengkap' },
              { id: 'audio', label: 'Upload Audio', icon: Upload, desc: 'MP3, WAV, M4A, AAC' },
              { id: 'buat-lirik', label: 'Buatkan Lirik Baru', icon: Sparkles, desc: 'ZEO susun lirik puitis' },
              { id: 'instrumental', label: 'Instrumental', icon: Disc, desc: 'Tanpa vokal / beat visual' },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = sourceType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSourceType(item.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-fuchsia-950/40 border-fuchsia-500 shadow-md shadow-fuchsia-900/20 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-fuchsia-400' : 'text-slate-400'}`} />
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Source Form Content */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            {sourceType === 'lirik' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Teks Lirik Lagu (Lengkap atau Potongan):
                </label>
                <textarea
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value)}
                  rows={5}
                  placeholder="Tempelkan bait lirik lagu Anda di sini..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 font-sans leading-relaxed"
                />
                <span className="text-[11px] text-slate-400 block">
                  💡 Tips: Lirik asli Anda akan dipelihara utuh dan dipecah otomatis ke storyboard tiap scene.
                </span>
              </div>
            )}

            {sourceType === 'audio' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-700 hover:border-fuchsia-500 rounded-xl p-6 text-center transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/mp3,audio/wav,audio/m4a,audio/aac"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <Music className="w-8 h-8 text-fuchsia-400 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-white">
                    {audioFileName ? `File Terpilih: ${audioFileName}` : 'Klik untuk Unggah Audio (MP3 / WAV / M4A / AAC)'}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Pilih File Audio
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Durasi Audio:</label>
                    <input
                      type="text"
                      value={audioDuration}
                      onChange={(e) => setAudioDuration(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                      placeholder="contoh: 03:20 atau 60 detik"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Perkiraan Mood & Tempo:</label>
                    <input
                      type="text"
                      value={audioMood}
                      onChange={(e) => setAudioMood(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                      placeholder="contoh: Melankolis lambat / Upbeat ceria"
                    />
                  </div>
                </div>
              </div>
            )}

            {sourceType === 'buat-lirik' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Tema Lagu:</label>
                  <input
                    type="text"
                    value={themeInput}
                    onChange={(e) => setThemeInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Mood Lagu:</label>
                  <input
                    type="text"
                    value={moodInput}
                    onChange={(e) => setMoodInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Genre Musik:</label>
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Ide Cerita yang Diinginkan:</label>
                  <input
                    type="text"
                    value={storyIdeaInput}
                    onChange={(e) => setStoryIdeaInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            )}

            {sourceType === 'instrumental' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">
                  Genre & Suasana Instrumental:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Lo-Fi Chill & Ambient',
                    'Cinematic Orchestral',
                    'Retro Synthwave 80s',
                    'Cyberpunk High Energy Beat',
                    'Acoustic Guitar Serenade',
                    'Deep Sleep Meditation Drone',
                  ].map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setInstrumentalGenre(genre)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                        instrumentalGenre === genre
                          ? 'bg-fuchsia-950/40 border-fuchsia-500 text-white font-medium'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Fokus visual pada suasana denyut ritme, perubahan energi, dan pergerakan kamera sinematik tanpa teks vokal.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* STEP 2: PILIHAN JENIS VIDEO MUSIK */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-fuchsia-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Pilihan Jenis Video Musik</span>
            </h2>
            <span className="text-xs text-slate-400">Pilih format visual</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'Animated Music Video', title: 'Animated Music Video', desc: 'Cerita animasi penuh berkarakter' },
              { id: 'Lyric Video Visual', title: 'Lyric Video Visual', desc: 'Fokus tipografi kinetik + visual pendukung' },
              { id: 'Cinematic Story MV', title: 'Cinematic Story MV', desc: 'Seperti film pendek sinematik berirama' },
              { id: 'Mood / Vibe Visualizer', title: 'Mood / Vibe Visualizer', desc: 'Looping visual ambient santai' },
              { id: 'Character Singing / Performance', title: 'Character Singing', desc: 'Karakter bernyanyi (Singer Lock aktif)' },
              { id: 'Abstract / Experimental', title: 'Abstract / Surreal', desc: 'Metafora simbolik, dunia mimpi' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVideoTypeChoice(v.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  videoTypeChoice === v.id
                    ? 'bg-fuchsia-950/40 border-fuchsia-500 shadow-md text-white'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-xs font-bold">{v.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{v.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* STEP 3: GAYA VISUAL TERKUNCI (MASTER VISUAL STYLE) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-fuchsia-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Gaya Visual Terkunci (Master Visual Style)</span>
            </h2>
            <span className="text-xs text-fuchsia-400 font-semibold">Terkunci di semua scene</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {[
              '3D Animation',
              '3D Pixar / Disney Modern',
              '3D Anime / Shinkai Style',
              '2D Ghibli Aesthetic',
              'Cyberpunk Neon',
              'Dark Fantasy Gothic',
              'Realistic Cinematic',
              'Retro 80s Synthwave',
              'Lo-Fi Watercolor',
              'Claymation Stop Motion',
            ].map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setVisualStyle(style)}
                className={`p-3 rounded-xl border text-center transition-all text-xs ${
                  visualStyle === style
                    ? 'bg-pink-950/50 border-pink-500 text-white font-bold shadow-md shadow-pink-900/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </section>

        {/* STEP 4: KONSISTENSI KARAKTER */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-fuchsia-600 text-white text-xs flex items-center justify-center font-bold">4</span>
              <span>Karakter Utama (Master Character)</span>
            </h2>
            <span className="text-xs text-slate-400">Character Sheet Lock</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Dengan Karakter', label: 'Dengan Karakter' },
              { id: 'Otomatis', label: 'Otomatis Ditentukan' },
              { id: 'Tanpa Karakter', label: 'Tanpa Karakter (Landscape/Scenery)' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setCharacterMode(m.id as any)}
                className={`p-3 rounded-xl border text-center text-xs transition-colors ${
                  characterMode === m.id
                    ? 'bg-purple-950/40 border-purple-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {characterMode !== 'Tanpa Karakter' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Deskripsi Tokoh Utama (Wajah, Rambut, Busana, Usia):
              </label>
              <textarea
                value={characterDesc}
                onChange={(e) => setCharacterDesc(e.target.value)}
                rows={2}
                placeholder="Contoh: Gadis berjaket kuning, tatapan melankolis, rambut pendek terurai..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
              />
              <span className="text-[11px] text-slate-400 block">
                ℹ️ ZEO akan membuatkan prompt Character Sheet lengkap (front, 3/4, side, full body, close-up) dalam pose netral dan busana konsisten.
              </span>
            </div>
          )}
        </section>

        {/* STEP 5: DURASI, SCENE & MODE PRODUKSI */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-fuchsia-600 text-white text-xs flex items-center justify-center font-bold">5</span>
              <span>Durasi & Mode Produksi</span>
            </h2>
            <span className="text-xs text-slate-400">Struktur scene dan rasio</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Mode Produksi */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Mode Produksi:</label>
              <select
                value={productionMode}
                onChange={(e) => setProductionMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
              >
                <option value="SUPER HEMAT">SUPER HEMAT (3-4 scene)</option>
                <option value="HEMAT">HEMAT (5-6 scene)</option>
                <option value="NORMAL">NORMAL (6-8 scene)</option>
                <option value="PREMIUM">PREMIUM (10-12 scene)</option>
              </select>
            </div>

            {/* Durasi */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Durasi Total & Scene:</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={totalDuration}
                  onChange={(e) => setTotalDuration(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="30 detik">30 detik</option>
                  <option value="60 detik">60 detik</option>
                  <option value="2 menit">2 menit</option>
                  <option value="3 menit">3 menit</option>
                </select>
                <select
                  value={sceneDuration}
                  onChange={(e) => setSceneDuration(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="5 detik">5 detik</option>
                  <option value="10 detik">10 detik</option>
                  <option value="15 detik">15 detik</option>
                </select>
              </div>
              <span className="text-[10px] text-fuchsia-400 block">
                60 detik / 10s = perkiraan 6 scene terstruktur
              </span>
            </div>

            {/* Platform */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Platform Target:</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
              >
                <option value="TikTok / Reels / Shorts (9:16)">TikTok / Reels / Shorts (9:16)</option>
                <option value="YouTube Full MV (16:9)">YouTube Full MV (16:9)</option>
                <option value="Spotify Canvas (9:16)">Spotify Canvas (9:16 Loop)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToPilihStudio}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
          >
            ← Kembali ke Menu Studio
          </button>

          <button
            type="button"
            id="btn-generate-music-visual"
            disabled={isAnalyzing}
            onClick={handleGenerate}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{analysisProgress || 'Sedang Menyusun Visual Lagu...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>BUAT VISUAL & STORYBOARD MUSIK</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
