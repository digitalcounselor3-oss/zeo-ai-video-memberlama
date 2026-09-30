import { GoogleGenAI } from '@google/genai';
import { CreativeAnalysisResult } from '../src/creativeTypes';
import { CREATIVE_VIDEO_TYPES } from '../src/data/creativeTypesData';
import { generateCreativeFallbackResult } from '../src/utils/creativeFallbackGenerator';

interface CreativeAnalyzeParams {
  videoTypeId: string;
  videoTypeTitle: string;
  videoTypeCategory: string;
  references: Array<{ mimeType?: string; base64: string; name?: string }>;
  characterChoice: string;
  characterTypeChoice?: string;
  characterSheetImage?: { mimeType?: string; base64: string; name?: string } | null;
  characterDescription?: string;
  videoIdea: string;
  timelineEra?: string;
  timeTransition?: string;
  timelapseStartCondition?: string;
  timelapseEndResult?: string;
  tinyWorldConcept?: string;
  tinyWorldScale?: string;
  asmrSubject?: string;
  foodDishName?: string;
  foodStageOption?: string;
  foodPersonMode?: string;
  duration: string;
  customDurationSeconds?: number;
  sceneCount: string;
  visualStyle: string;
  audio: string;
  platform: string;
  apiKey?: string;
  genre?: string;
  viralTheme?: string;
  characterCount?: string | number;
  characters?: Array<{ id?: string; name?: string; role?: string; description?: string; image?: any }>;
  totalDuration?: string;
  sceneDuration?: string;
  estimatedSceneCount?: number;
  aspectRatio?: string;
  productionMode?: string;
  storyIdea?: string;
  presentationMode?: string;
  targetUser?: string;
  videoGoal?: string;
  topicContent?: string;
  targetAudience?: string;
  presenterName?: string;
  optionalBrief?: string;
  confirmedIngredients?: string[];
  selectedActivities?: string[];
  foodVideoGoal?: string;
  foodHumanMode?: string;
  foodLocation?: string;
  foodLocationImage?: { mimeType?: string; base64: string; name?: string } | null;
  foodAudioMode?: string;
  foodDurationPerScene?: string;
  foodSceneCount?: string;
  // Music & Lyric Visual specific inputs
  musicSourceType?: string;
  musicAudioFile?: { mimeType?: string; base64: string; name?: string; duration?: number } | null;
  musicAudioDescription?: string;
  musicAudioMood?: string;
  musicAudioDuration?: string;
  musicLyrics?: string;
  musicTheme?: string;
  musicMood?: string;
  musicGenre?: string;
  musicStoryIdea?: string;
  musicVideoType?: string;
  musicVisualStyle?: string;
  musicCharacterMode?: string;
  musicCharacters?: any[];
  musicDuration?: string;
  musicSceneDuration?: string;
  musicProductionMode?: string;
  musicPlatform?: string;
}

export async function processCreativeVideoAnalysis(
  ai: GoogleGenAI,
  params: CreativeAnalyzeParams
): Promise<CreativeAnalysisResult> {
  const {
    videoTypeId,
    videoTypeTitle,
    videoTypeCategory,
    references = [],
    characterChoice,
    characterTypeChoice = 'Otomatis',
    characterSheetImage,
    characterDescription = '',
    videoIdea,
    timelineEra = '',
    timeTransition = 'Otomatis',
    timelapseStartCondition = '',
    timelapseEndResult = '',
    tinyWorldConcept = '',
    tinyWorldScale = 'Otomatis',
    asmrSubject = 'Tangan Saja',
    foodDishName = '',
    foodStageOption = 'Dari Bahan Awal sampai Penyajian',
    foodPersonMode = 'Tangan Saja',
    duration,
    customDurationSeconds,
    sceneCount,
    visualStyle,
    audio,
    platform,
    genre = '',
    viralTheme = '',
    characterCount = 'Auto',
    characters = [],
    totalDuration = '',
    sceneDuration = '',
    estimatedSceneCount,
    productionMode = 'HEMAT',
    storyIdea = '',
    presentationMode = 'Hologram',
    targetUser = 'Guru',
    videoGoal = 'Mengajar',
    topicContent = '',
    targetAudience = 'SMA',
    presenterName = '',
    optionalBrief = '',
    confirmedIngredients = [],
    selectedActivities = [],
    foodVideoGoal = 'Auto',
    foodHumanMode = 'Tangan Saja',
    foodLocation = 'Dapur Modern',
    foodLocationImage,
    foodAudioMode = 'ASMR + Ambient',
    foodDurationPerScene = '10 detik',
    foodSceneCount = 'Auto',
    // Music & Lyric Visual specific inputs
    musicSourceType = 'lirik',
    musicAudioFile,
    musicAudioDescription = '',
    musicAudioMood = '',
    musicAudioDuration = '',
    musicLyrics = '',
    musicTheme = '',
    musicMood = '',
    musicGenre = '',
    musicStoryIdea = '',
    musicVideoType = 'Animated Music Video',
    musicVisualStyle = '',
    musicCharacterMode = 'Auto',
    musicCharacters = [],
    musicDuration = '60 detik',
    musicSceneDuration = '10 detik',
    musicProductionMode = 'NORMAL',
    musicPlatform = '',
  } = params;

  // Determine effective duration string & number
  const effectiveDuration =
    videoTypeId === 'lyric-visual'
      ? musicDuration || '60 detik'
      : totalDuration ||
        (videoTypeId === 'food-preparation'
          ? `${foodDurationPerScene || '10 detik'} per scene`
          : duration === 'Custom' && customDurationSeconds
          ? `${customDurationSeconds} detik`
          : duration || '15 detik');
  const durationNum = parseInt(effectiveDuration, 10) || 15;

  // Determine effective scene count number
  let targetScenes = 1;
  if (videoTypeId === 'lyric-visual') {
    let durSec = 60;
    const durStr = musicDuration || totalDuration || duration || '60 detik';
    if (durStr.includes('30')) durSec = 30;
    else if (durStr.includes('60')) durSec = 60;
    else if (durStr.includes('2')) durSec = 120;
    else if (durStr.includes('3')) durSec = 180;
    else if (durStr.includes('5')) durSec = 300;

    let sceneSec = 10;
    const sceneDurStr = musicSceneDuration || sceneDuration || '10 detik';
    if (sceneDurStr.includes('5')) sceneSec = 5;
    else if (sceneDurStr.includes('8')) sceneSec = 8;
    else if (sceneDurStr.includes('10')) sceneSec = 10;
    else if (sceneDurStr.includes('15')) sceneSec = 15;

    targetScenes = Math.max(3, Math.min(12, Math.round(durSec / sceneSec) || 6));
  } else if (videoTypeId === 'food-preparation') {
    if (foodSceneCount && foodSceneCount !== 'Auto') {
      const parsed = parseInt(foodSceneCount, 10);
      if (!isNaN(parsed) && parsed > 0) targetScenes = parsed;
    } else {
      // Auto: determined based on selected activities count
      const actsCount = (selectedActivities || []).length;
      if (selectedActivities.some((a) => a.toLowerCase().includes('full'))) {
        targetScenes = 6;
      } else if (actsCount <= 1) {
        targetScenes = 3;
      } else if (actsCount === 2) {
        targetScenes = 4;
      } else if (actsCount === 3) {
        targetScenes = 5;
      } else {
        targetScenes = Math.min(8, actsCount + 2);
      }
    }
  } else if (estimatedSceneCount && estimatedSceneCount > 0) {
    targetScenes = estimatedSceneCount;
  } else if (sceneCount && sceneCount.includes('Scene')) {
    const parsed = parseInt(sceneCount, 10);
    if (!isNaN(parsed) && parsed > 0) targetScenes = parsed;
  } else if (sceneCount === '1 Scene') targetScenes = 1;
  else if (sceneCount === '2 Scene') targetScenes = 2;
  else if (sceneCount === '3 Scene') targetScenes = 3;
  else if (sceneCount === '5 Scene') targetScenes = 5;
  else {
    // Otomatis
    targetScenes = durationNum <= 10 ? 1 : durationNum <= 20 ? 2 : 3;
  }

  // Determine aspect ratio label
  const effectiveAspectRatio =
    platform.includes('Landscape') ? '16:9 landscape' : '9:16 vertical';

  // Prepare multimodal parts from uploaded references & character sheet
  const imageParts = references
    .map((img, index) => {
      let mime = (img.mimeType || '').trim().toLowerCase();
      let rawBase64 = img.base64 || '';
      if (rawBase64.includes(';base64,')) {
        const parts = rawBase64.split(';base64,');
        const match = parts[0].match(/:(.*?)$/);
        if (match && match[1]) mime = match[1].toLowerCase();
        rawBase64 = parts[1];
      }
      if (mime === 'image/jpg') mime = 'image/jpeg';
      if (!mime || !mime.startsWith('image/')) mime = 'image/jpeg';
      rawBase64 = rawBase64.replace(/\s+/g, '');
      if (!rawBase64) return null;
      return {
        inlineData: {
          mimeType: mime,
          data: rawBase64,
        },
      };
    })
    .filter((part): part is { inlineData: { mimeType: string; data: string } } => part !== null);

  if (characterChoice === 'Upload Character Sheet' && characterSheetImage?.base64) {
    let csMime = (characterSheetImage.mimeType || '').trim().toLowerCase();
    let csRaw = characterSheetImage.base64 || '';
    if (csRaw.includes(';base64,')) {
      const parts = csRaw.split(';base64,');
      const match = parts[0].match(/:(.*?)$/);
      if (match && match[1]) csMime = match[1].toLowerCase();
      csRaw = parts[1];
    }
    if (csMime === 'image/jpg') csMime = 'image/jpeg';
    if (!csMime || !csMime.startsWith('image/')) csMime = 'image/jpeg';
    csRaw = csRaw.replace(/\s+/g, '');
    if (csRaw) {
      imageParts.push({
        inlineData: {
          mimeType: csMime,
          data: csRaw,
        },
      });
    }
  }

  // Multimodal support for uploaded Short Drama characters
  if (characters && Array.isArray(characters)) {
    characters.forEach((char) => {
      if (char?.image?.base64) {
        let charMime = (char.image.mimeType || '').trim().toLowerCase();
        let charRaw = char.image.base64 || '';
        if (charRaw.includes(';base64,')) {
          const parts = charRaw.split(';base64,');
          const match = parts[0].match(/:(.*?)$/);
          if (match && match[1]) charMime = match[1].toLowerCase();
          charRaw = parts[1];
        }
        if (charMime === 'image/jpg') charMime = 'image/jpeg';
        if (!charMime || !charMime.startsWith('image/')) charMime = 'image/jpeg';
        charRaw = charRaw.replace(/\s+/g, '');
        if (charRaw) {
          imageParts.push({
            inlineData: {
              mimeType: charMime,
              data: charRaw,
            },
          });
        }
      }
    });
  }

  // Multimodal support for uploaded Food Location reference
  if (foodLocationImage?.base64) {
    let locMime = (foodLocationImage.mimeType || '').trim().toLowerCase();
    let locRaw = foodLocationImage.base64 || '';
    if (locRaw.includes(';base64,')) {
      const parts = locRaw.split(';base64,');
      const match = parts[0].match(/:(.*?)$/);
      if (match && match[1]) locMime = match[1].toLowerCase();
      locRaw = parts[1];
    }
    if (locMime === 'image/jpg') locMime = 'image/jpeg';
    if (!locMime || !locMime.startsWith('image/')) locMime = 'image/jpeg';
    locRaw = locRaw.replace(/\s+/g, '');
    if (locRaw) {
      imageParts.push({
        inlineData: {
          mimeType: locMime,
          data: locRaw,
        },
      });
    }
  }

  const effectiveStyle = visualStyle === 'Otomatis' ? 'Cinematic Realistic' : visualStyle;

  const systemInstruction = `Anda adalah asisten AI visual sutradara & prompt engineer profesional kelas dunia untuk "ZEO Creative Video Studio by Ms. Inggid".

TUGAS UTAMA:
Menyusun arsitektur prompt lengkap untuk pembuatan video AI berkualitas tinggi (terutama Google Flow / Veo).
ALUR KERJA WAJIB (WORKFLOW PENGGUNA):
IDE CERITA -> ZEO ANALISIS -> PROMPT CHARACTER SHEET -> PROMPT LOCATION -> PROMPT SCENE IMAGE -> PROMPT VIDEO (SIAP FLOW/VEO).

ATURAN UTAMA & IMAGE REFERENCE PROMPT ARCHITECTURE:
Sebelum menghasilkan Prompt Video, Anda WAJIB membuat prompt gambar referensi untuk:
1. MASTER CHARACTER (Character Sheet)
2. MASTER LOCATION / ENVIRONMENT (Clean environment reference TANPA karakter)
3. OBJECT / PROP REFERENCE (Jika terdapat objek/properti penting dalam cerita)
4. SCENE IMAGE PROMPT (Frame awal setiap scene)
5. PROMPT VIDEO (Per scene, mengacu ke Character Reference & Location Reference yang sudah dibuat)

ATURAN DETAIL:
1. VISUAL STYLE LOCK (${effectiveStyle}):
   Gaya visual WAJIB SAMA PERSIS dan TERKUNCI pada:
   - Character Sheet
   - Master Location
   - Scene Image Prompts
   - Video Prompts
   Jangan mencampur gaya kartun dengan realistis kecuali diminta.

2. MASTER CHARACTER & CHARACTER SHEET:
   - Jika terdapat 1 karakter: namai "Master Character"
   - Jika beberapa karakter: buat terpisah "Character A", "Character B", dst.
   - Sumber Karakter: jika ada referensi gambar diunggah gunakan "Referensi Pengguna", jika dari teks gunakan "Deskripsi Teks", jika tanpa karakter "Tanpa Karakter".
   - Jelaskan identitas fisik: gender presentation, visual age group, facial appearance & structure, skin appearance, hairstyle / hijab, body proportions, outfit & outfit colors, footwear, accessories, visual style (${effectiveStyle}). JANGAN mengarang nama KTP/data pribadi.
   - PROMPT GAMBAR KARAKTER / CHARACTER SHEET:
     * Dibuat dalam BAHASA INGGRIS untuk AI Image Generator (Midjourney / Imagen 3 / Flux).
     * Konsep "full-body character reference sheet" menampilkan karakter yang sama dalam beberapa tampilan: front view, 3/4 view, side view, dan optional close-up facial reference.
     * Karakter dalam neutral standing pose, clean studio background, even soft lighting, unobstructed face, full outfit visible, consistent proportions.
     * JANGAN membuat karakter melakukan aksi cerita pada Character Sheet! Character Sheet adalah identitas, bukan adegan video.
     * Sertakan instruksi bahasa Inggris ketat:
       "Create a clean professional character reference sheet of the exact same character shown consistently across all views. Maintain identical facial features, hairstyle or hijab, body proportions, outfit, accessories, and visual identity. No character variation between views."

3. MASTER LOCATION & LOCATION LOCK:
   - Buat prompt gambar khusus lokasi/environment TANPA KARAKTER terlebih dahulu (clean environment reference).
     Contoh: ruang kelas kosong, studio podcast kosong, lanskap kota/jalan tanpa orang.
   - Jelaskan: jenis lokasi, waktu/era, architecture/environment, furniture, important objects, background, lighting, atmosphere, visual style (${effectiveStyle}), camera perspective, composition.
   - LOCATION LOCK: Jika scene menggunakan lokasi yang sama, gunakan "MASTER LOCATION 1" sebagai referensi semua scene terkait dan sertakan:
     "Maintain the exact same environment layout, architecture, furniture placement, lighting direction, and major background elements."
   - Jika cerita berpindah lokasi, buat terpisah "Location 1", "Location 2".

4. PROMPT GAMBAR PROPERTI (Jika relevan):
   - Jika terdapat benda penting (misal mikrofon podcast, buku tua, surat masa lalu, stetoskop, pisau sabun ASMR, alat peraga guru), buat "PROMPT GAMBAR PROPERTI". Jika tidak ada yang signifikan, boleh kosongkan atau objek utama video.

5. STORYBOARD:
   - Rinci ${targetScenes} scene sesuai target durasi total ${effectiveDuration}.
   - Setiap scene berisi visual, action realistis, camera framing, dan transisi.

6. PROMPT GAMBAR ADEGAN (SCENE IMAGE PROMPT):
   - Untuk FRAME AWAL SETIAP SCENE.
   - Menggabungkan: MASTER CHARACTER + MASTER LOCATION + OUTFIT + PROPS + POSE + COMPOSITION + CAMERA ANGLE + LIGHTING + ASPECT RATIO (${effectiveAspectRatio}).
   - TIDAK BOLEH mengubah identitas karakter atau lokasi tanpa alasan cerita.

7. PROMPT VIDEO (SIAP AI VIDEO GENERATOR / FLOW / VEO):
   - Per scene dalam BAHASA INGGRIS yang koheren, natural, dan deskriptif.
   - WAJIB MENGACU KE REFERENSI:
     "Use the established character reference sheet as the strict identity anchor. Maintain identical facial structure, hairstyle or hijab, and outfit. Use the established location reference as the environment anchor..."
   - Mencakup: subjek, aksi/gerakan, pergerakan kamera, pencahayaan, aspect ratio (${effectiveAspectRatio}), dan pacing.

8. DIALOG / VOICE OVER:
   - Sesuai opsi Audio (${audio}):
     * Jika "Tanpa Dialog": voiceOver = null, dialogue = []
     * Jika "Voice Over": buat teks narasi VO bahasa Indonesia yang emosional/inspiratif/informatif sesuai jenis video ${videoTypeTitle}.
     * Jika "Dialog Karakter" atau "VO + Dialog": tulis dialog antar karakter yang natural.
     * Jika "ASMR / SFX": instruksi audio detail suara mikrofon dan tekstur suara.

9. SFX & AMBIENCE:
   - Suara latar sekitar (ambient sounds), sound effects (SFX), dan mood musik.

10. NEGATIVE PROMPT:
    - Dalam BAHASA INGGRIS.
    - Menjamin Character Lock & Location Lock:
      "no different person, no face replacement, no facial morphing, no hairstyle inconsistency, no distorted face, no extra limbs, no deformed hands, no floating objects, no changing environment layout, no inconsistent room architecture, no flickering, no low quality, no unwanted text or watermarks."

11. ATURAN KHUSUS BERDASARKAN JENIS PRESET:
    A. JIKA PRESET "CHARACTER TALK" (ID: character-talk):
       - Karakter dapat berupa Hewan, Benda/Objek, Makanan, Karakter Fantasi, Mascot, Robot, atau Manusia (Pilihan Pengguna: ${characterTypeChoice}).
       - Character Sheet MULTI-VIEW TETAP WAJIB:
         * Untuk hewan: tampilkan front view, 3/4 view, side view, dan facial expression. Pertahankan warna bulu, pola bulu, bentuk mata, ukuran tubuh, proporsi, pakaian/aksesori.
         * Untuk benda/robot/makanan: pertahankan bentuk dasar, warna, material, logo/tekstur, dan fitur wajah/mulut jika ada. Jangan merubah desain antarscene!
       - SPEECH SYNCHRONIZATION:
         * Wajib tambahkan kalimat ini ke prompt video:
           "Accurate Indonesian dialogue synchronization with natural mouth movement appropriate to the character."
         * Gerakan mulut harus natural sesuai jenis karakter (believable stylized mouth movement untuk hewan/benda, natural lip-sync untuk manusia).
       - ACTING: Sertakan eye movement, head movement, subtle expression, body gesture, reaction, dan interaction dengan objek sekitar.
       - NEGATIVE PROMPT KHUSUS: Wajib menyertakan "no character redesign, no inconsistent fur or pattern, no random accessories, no unnatural mouth deformation, no duplicate character."

    B. JIKA PRESET "EMOTIONAL STORY" (ID: emotional-story):
       - EMOTIONAL ARC: Analisis ide pengguna dan tentukan tahapan emosional:
         SETUP → EMOTIONAL TRIGGER → REACTION → RESOLUTION. Masukkan ringkasan arc ini ke dalam "emotionalArc" pada "analisisCerita".
       - JANGAN otomatis membuat cerita sedih. Ikuti emosi yang diminta pengguna (keluarga, persahabatan, haru, bahagia, perjuangan, rasa syukur, dsb).
       - EXPRESSION CONTROL VISUAL: Jelaskan ekspresi secara visual dan mikro pada prompt video (misal: subtle smile, eyes beginning to tear, surprised pause, gentle eye contact, restrained sadness, relieved expression). Hindari akting melodramatis berlebihan.
       - CAMERA EMOTIONAL: Utamakan pergerakan kamera pendukung emosi (close-up, slow push-in, medium shot, reaction shot, over-the-shoulder, gentle handheld, static intimate framing).
       - DIALOG: Pendek, menyentuh, dan natural.
       - NEGATIVE PROMPT KHUSUS: Wajib menyertakan "no exaggerated facial deformation, no random crying, no identity changes, no unnatural expression transition."

    C. JIKA PRESET "FLASHBACK / JELAJAH WAKTU" (ID: flashback):
       - TIMELINE: Gunakan tahapan waktu "${timelineEra || 'Dianalisis otomatis dari ide cerita'}".
       - IDENTITY ACROSS AGES LOCK:
         Jika karakter sama muncul pada usia berbeda (contoh anak-anak -> remaja -> dewasa), identitas dasar wajah (bentuk mata, senyum, struktur rahang khas) HARUS KONSISTEN dan dapat dikenali.
         Hasilkan dalam "masterCharacters":
         1) Master Character Identity (Core Anchor)
         2) Character — Era 1 (Prompt gambar sesuai usia & era)
         3) Character — Era 2 (Prompt gambar sesuai usia & era berikutnya)
         dst.
       - ERA ACCURACY: Pakaian, gaya rambut, interior, kendaraan, teknologi, dan properti harus 100% akurat sesuai era tanpa memunculkan benda modern anakronistik pada adegan masa lalu.
       - MASTER LOCATION PER ERA: Jika lokasi yang sama berubah seiring waktu (contoh sekolah/rumah era 1990an vs sekarang), buat Master Location terpisah per era dengan mempertahankan tata letak dasarnya.
       - TIME TRANSITION: Terapkan teknik transisi waktu "${timeTransition || 'Match Cut / Memory Fade'}" (seperti Portal, Match Cut, Morphing, Flash of Light, Photo Transition, Memory Fade, Cinematic Transition) ke dalam action dan transisi prompt video.
       - NEGATIVE PROMPT KHUSUS: Wajib menyertakan "no identity replacement between ages, no inconsistent facial identity, no incorrect era objects, no random modern objects in historical scenes, no unintended outfit changes."

    D. JIKA PRESET "AI TIMELAPSE" (ID: ai-timelapse):
       - PROCESS & TRANSFORMATION ENGINE: Fokus pada START STATE → PROCESS → TRANSFORMATION → FINAL STATE.
       - JANGAN memaksakan dialog, karakter manusia, atau konflik cerita. Jika tidak ada karakter, set "characterNotRequired": true dan "masterCharacters": [].
       - KONDISI AWAL & HASIL AKHIR: "${timelapseStartCondition ? `Kondisi Awal: ${timelapseStartCondition}. ` : ''}${timelapseEndResult ? `Hasil Akhir: ${timelapseEndResult}.` : ''}".
       - TRANSFORMATION PLAN: Tentukan tahap transformasi bertahap (State 1, State 2, ..., State Final) sesuai durasi dan jumlah scene.
       - SPATIAL CONTINUITY LOCK: Pertahankan camera position, object position, perspective, environment geometry, dan major background elements. Transformasi harus terlihat terjadi pada lokasi yang persis sama.
       - CAMERA: Default locked-off camera / fixed camera. Hindari kamera berpindah-pindah kecuali slow cinematic push-in.
       - PROMPT GAMBAR: Wajib buat "firstFramePrompt" (Start Frame) dan "lastFramePrompt" (Final Frame) dengan perspektif kamera yang identik.
       - NEGATIVE PROMPT KHUSUS: "no camera position change, no geometry shift, no random building relocation, no inconsistent perspective, no unwanted object teleportation."

    E. JIKA PRESET "TINY WORLD" (ID: tiny-world):
       - KONSEP DUNIA MINIATUR: "${tinyWorldConcept || 'Aktivitas dunia miniatur proporsional'}". Skala: "${tinyWorldScale}".
       - SCALE CONSISTENCY LOCK: Karakter mini/pekerja harus memiliki skala konsisten terhadap objek makro besar di sekitarnya. Jangan membuat karakter berubah ukuran antarscene.
       - TINY CHARACTER REFERENCE: Buat Mini Character Reference Prompt jika pekerja/karakter penting. Jika pekerja mini generik dalam jumlah banyak, deskripsikan proporsinya secara konsisten.
       - MACRO LOCATION PROMPT: Lokasi harus mendeskripsikan dunia makro (contoh: oversized cup, giant tabletop, macro food surface) dengan estetika macro photography, shallow depth of field, dan close-up.
       - NEGATIVE PROMPT KHUSUS: "no inconsistent miniature scale, no giant miniature workers, no changing character scale, no floating workers, no incorrect macro perspective."

    F. JIKA PRESET "ASMR VIDEO" (ID: asmr-video):
       - ASMR SUBJECT: "${asmrSubject}".
       - JIKA "Tangan Saja": JANGAN menampilkan wajah atau tubuh penuh sama sekali. Buat "masterCharacters" dengan deskripsi Hand Reference (skin appearance, clean nails, no distracting jewelry, sleeve/cuff fabric).
       - ASMR SOUND DESIGN: Efek suara (SFX) adalah elemen UTAMA (crisp cutting sound, gentle pouring, soft tapping, packaging crinkle, paper rustling, subtle stirring). JANGAN menambahkan musik jika menginginkan pure ASMR audio.
       - CAMERA ASMR: Gunakan macro close-up, top-down flat lay, extreme close-up, locked camera, slow controlled movement. Hindari gerakan kamera cepat.
       - ACTION CONTROL & MOTION REALISM: Urutan aksi harus berurutan secara fisik dan jelas (hand enters frame → holds object → cuts/pours slowly → separates pieces → places them neatly). Tidak ada objek teleportasi.
       - NEGATIVE PROMPT KHUSUS: "no extra fingers, no malformed hands, no duplicated hands, no floating objects, no jerky motion, no random face appearing."

    G. JIKA PRESET "FOOD PREPARATION" (ID: food-preparation):
       - WORKFLOW WAJIB: Food Preparation bekerja berdasarkan FOTO BAHAN / BELANJAAN, BAHAN TERDETEKSI, dan AKTIVITAS YANG DIPILIH PENGGUNA.
       - BAHAN TERKONFIRMASI: "${confirmedIngredients && confirmedIngredients.length > 0 ? confirmedIngredients.join(', ') : (foodDishName || 'Bahan makanan hasil deteksi foto')}".
       - AKTIVITAS YANG DIPILIH: "${selectedActivities && selectedActivities.length > 0 ? selectedActivities.join(' → ') : (foodStageOption || 'Full Preparation')}".
       - URUTAN LOGIS PROSES: Susun adegan HANYA berdasarkan aktivitas yang dipilih pengguna dengan urutan fisik logis:
         1. 🛍️ GROCERY / UNPACKING: Mengeluarkan dan menata belanjaan dari tas/kantong, suara kertas/plastik kemasan, meletakkan di atas meja counter kayu/granit.
         2. 🧺 SORTING: Mengelompokkan sayur, telur, buah, bumbu, dan produk kemasan secara rapi.
         3. 💧 WASHING: Mencuci HANYA bahan yang memang sesuai dan aman untuk dicuci (sayuran/buah segar). JANGAN mencuci produk kemasan, bahan kering, atau bahan yang tidak higienis dicuci.
         4. 🔪 PEELING & CUTTING: Mengupas dan memotong bahan yang sesuai (wortel, bawang, mentimun, dsb). ASMR bunyi pisau tajam dan talenan kayu.
         5. 🥕 FOOD PREPARATION: Mempersiapkan bahan agar siap dimasak (potong, iris, kupas, buang bagian tak terpakai, pisahkan bahan, siapkan bumbu, masukkan ke wadah preparation).
         6. ⚖️ PORTIONING: Membagi bahan menjadi beberapa porsi (meal prep wadah kaca, porsi keluarga, freezer preparation).
         7. 🧊 STORAGE / FRIDGE RESTOCK: Memasukkan bahan ke wadah kedap udara/kaca bening dan menata ke kulkas atau pantry.
         8. ✨ FULL PREPARATION: Jika dipilih, pilih tahapan yang relevan secara cerdas berdasarkan bahan yang ada.
       - TUJUAN VIDEO: "${foodVideoGoal || 'Auto'}".
       - TAMPILAN ORANG: "${foodHumanMode || foodPersonMode || 'Tangan Saja'}".
         * Jika 'Tangan Saja': TIDAK PERNAH memunculkan wajah. Fokus pada sepasang tangan bersih (manicured, kuku pendek higienis, lengan baju digulung), bahan makanan, pisau/alat masak, dan interaksi fisik realistis.
         * Jika 'Dengan Karakter': Fokus pada interaksi karakter dengan persiapan dapur.
         * Jika 'Tanpa Manusia': Fokus kamera makro pada objek, bahan, dan peralatan tanpa tangan manusia.
       - LOKASI: "${foodLocation || 'Dapur Modern'}". Kunci countertop, kompor, wadah kaca/plastik, pencahayaan alami, dan background.
       - LOGIKA FISIK & KEAMANAN MAKANAN (STRICT PHYSICAL CONTINUITY):
         * TIDAK ADA telur tiba-tiba pecah tanpa proses pecah.
         * Sayuran TIDAK berubah jenis antar scene.
         * Jumlah bahan TIDAK bertambah atau berkurang tanpa sebab fisik.
         * Bahan yang sudah dipotong TIDAK BOLEH kembali utuh di scene selanjutnya.
         * Objek tidak boleh teleportasi atau melayang.
         * Wadah penyimpanan konsisten dan tidak berubah bentuk secara ajaib.
         * Pisau memotong dengan kontak nyata pada talenan. Tangan tidak menembus bahan makanan.
         * Setiap scene WAJIB meneruskan STATE dari scene sebelumnya!
       - INGREDIENT STATE TRACKING:
         * Buat pelacakan status fisik setiap bahan makanan dari scene ke scene ("ingredientStateMap").
       - PROCESS BOARD (STORYBOARD PROSES):
         * Susun setiap scene dalam format PROCESS BOARD: SCENE, ACTIVITY, INGREDIENT, START STATE, ACTION, END STATE, CAMERA, HAND ACTION, ASMR/SFX, CONTINUITY.
       - PROMPT GAMBAR & VIDEO:
         * Prompt Gambar: Reference frame dan scene image prompt dalam bahasa Inggris yang mengunci keselarasan bahan, warna, bentuk, dapur, tools, dan lighting.
         * Prompt Video per Scene: Bahasa Inggris detail dengan struktur: INGREDIENT REFERENCE, LOCATION, STARTING STATE, HAND / CHARACTER, ACTION, PHYSICAL INTERACTION, CAMERA, LIGHTING, ASMR, ENDING STATE, CONTINUITY.
       - ASMR / SFX PLANNING:
         * Rancang sound design spesifik per aktivitas (Grocery: paper rustling, packaging movement; Sorting: vegetable wooden contact; Washing: running water, gentle splashing; Cutting: crisp knife chop; Storage: container lid click, fridge door/drawer slide).
       - NEGATIVE PROMPT KHUSUS FOOD PREPARATION:
         "wrong ingredients, ingredient duplication, ingredient morphing, food changing type, extra hands, extra fingers, deformed hands, floating objects, object teleportation, knife deformation, unsafe cutting motion, container morphing, kitchen changing layout, flickering, unrealistic physics, random text, watermark."

    H. JIKA PRESET "SHORT DRAMA" (ID: short-drama):
       - GENRE DRAMA: "${genre || 'Dianalisis dari alur cerita'}".
       - TEMA VIRAL: "${viralTheme || 'Dianalisis dari alur cerita'}".
       - MODE PRODUKSI: "${productionMode || 'HEMAT'}"
         * SUPER HEMAT: Gunakan aset & lokasi minimum (1-2 lokasi utama yang digunakan ulang), optimalkan dialog tajam dan variasi sudut pengambilan gambar pada lokasi yang sama.
         * HEMAT: Aset lebih efisien (2-3 lokasi), visual tetap bervariasi dan memikat penonton.
         * NORMAL: Keseimbangan optimal antara pergantian setting, visual bervariasi, dan dinamika adegan.
         * PREMIUM: Sinematografi kelas atas, scene-specific visual, dynamic multi-angle camera shots, dan visual storytelling maksimal.
       - JUMLAH & DESKRIPSI KARAKTER (${characterCount} Karakter):
         ${characters && characters.length > 0 ? characters.map((c, i) => `* Karakter ${i + 1}: ${c.name || 'Tokoh ' + (i + 1)} | Peran: ${c.role || 'Dinamis'} | Detail: ${c.description || 'Sesuai naskah'}`).join('\n         ') : 'Rancang karakter dramatis yang kuat, kontras, dan emosional sesuai genre dan tema viral.'}
       - STRUKTUR DRAMA VIRAL:
         * Hook dramatis di Scene 1 yang langsung memancing emosi penonton.
         * Escalation konflik & tensi antar karakter.
         * Plot twist / pembalikan nasib / momen emosional yang memuaskan penonton.
         * Dialog bahasa Indonesia yang natural, tajam, dan memiliki resonansi tinggi.
       - ESTIMASI SCENE & DURASI: Rancang tepat ${targetScenes} scene (Durasi total ${effectiveDuration}, estimasi ~${sceneDuration || '10 detik'} per scene).
       - NEGATIVE PROMPT KHUSUS: "no character facial inconsistency, no unwanted outfit morphing, no disappearing props, no unnatural body gestures, no flat lighting, no generic low quality, no random background changes between consecutive scene angles."

     I. JIKA PRESET "TEACHER & PRESENTER" (ID: teacher-presenter):
        - MODE PRESENTASI (MASTER STYLE UTAMA): "${presentationMode || 'Hologram'}"
          MODE PRESENTASI INI ADALAH MASTER STYLE YANG MEMENGARUHI SELURUH OUTPUT:
          Storyboard, prompt gambar referensi (Character Sheet, Master Location, Scene Image), prompt video (motion, background, lighting, camera movement, HUD/Hologram), audio dialog, SFX, dan ambience WAJIB tunduk pada Mode Presentasi yang dipilih.

          * 1. Hologram (Default):
            Output visual: presenter hologram biru transparan (semi-transparent glowing digital human hologram), floating neon HUD widgets, holographic data overlays & projection ring on floor, futuristic volumetric lighting, deep dark high-tech backdrop, glowing cybernetic particles.
            Camera: slow orbit tracking, smooth push-in to holographic panels, cinematic depth of field.
            Prompt Video Mandat: Wajib memuat "floating holographic interface, volumetric blue projection, transparent digital body, neon HUD, slow orbit camera, glowing digital particles".
            Ambience & SFX: High-tech holographic hum, digital telemetry pulses, subtle interface clicks.

          * 2. Realistis Studio:
            Output visual: presenter manusia nyata berwibawa, studio penyiaran profesional (professional TV broadcast studio), giant curved LED screen displaying high-resolution presentation slides, soft flattering 3-point studio lighting, clean elegant presentation look.
            Camera: smooth broadcast pedestal, slow push-in, stable tripod pan, medium close-up.
            Prompt Video Mandat: Wajib memuat "real human presenter in high-end broadcast studio, curved LED video wall, soft 3-point studio lighting, clean presentation, professional broadcast look".

          * 3. Virtual Studio:
            Output visual: studio digital futuristik modern, virtual LED volume stage, floating 3D broadcast graphics & lower-thirds, modern newsroom / TEDx aesthetic.
            Camera: sweeping virtual jib shot, smooth tracking, dynamic transition cuts.

          * 4. Whiteboard:
            Output visual: papan tulis putih bersih (clean whiteboard), guru/presenter menjelaskan materi sambil aktif menunjuk dan menulis, animasi coretan spidol tangan dinamis (hand-drawn animated marker doodles), gaya edukasi ramah & jelas.
            Camera: static medium shot with smooth push-in to marker drawings, dynamic focus on hand gestures.
            Prompt Video Mandat: Wajib memuat "whiteboard explanation, marker animation, clean classroom, hand-drawn effect, engaging tutor pointing at educational diagrams".

          * 5. Apple Event:
            Output visual: panggung hitam minimalis ala Apple Keynote / Steve Jobs Theater, dramatic overhead spotlight menyorot presenter berbusana sleek gelap, giant high-contrast dark screen di belakang menampilkan tipografi & diagram ultra-minimalis, suasana panggung prestige.
            Camera: slow majestic push-in, wide keynote auditorium angle, dramatic low-angle hero framing.
            Prompt Video Mandat: Wajib memuat "minimalist black auditorium stage, dramatic keynote spotlight, giant presentation screen, Apple event keynote style, sleek premium aesthetic".

          * 6. Iron Man JARVIS:
            Output visual: interface melayang canggih ala Stark JARVIS, HUD merah-oranye-biru elektrik berputar di udara, 3D wireframe models & biometric data rings yang dimanipulasi dengan gestur tangan presenter, scan effect berdenyut pada wajah dan objek.
            Camera: dynamic cuts through floating holographic layers, rapid tech whip-pan, intimate eye-reflection close-ups.
            Prompt Video Mandat: Wajib memuat "Stark tech JARVIS HUD, floating red and blue holographic interface, rotating holographic rings manipulated by presenter hand gestures, volumetric sci-fi glow".

          * 7. Corporate Futuristic:
            Output visual: ruang meeting eksekutif kaca premium di gedung pencakar langit, layar kaca digital interaktif (smart glass interactive displays), warna tema biru-putih elegan, pencahayaan alami terang dipadu garis cyan digital.
            Camera: steadi-cam orbital movement around boardroom table, rack focus between glass charts and presenter.

          * 8. Sci-Fi Lab:
            Output visual: laboratorium sains futuristik, hologram ilmiah melayang (scientific holograms, molecular models, quantum formulas), tabung penelitian bercahaya, monitor digital berdinding transparan, ambience teknologi mutakhir.
            Camera: smooth gimbal glide past research consoles, slow upward tilt to holographic specimen.

          * 9. Medical Laboratory:
            Output visual: laboratorium medis steril ultra-modern, dokter/peneliti dengan jas medis putih, anatomi hologram 3D melayang (organ jantung berdetak, model otak & jaringan saraf, heliks DNA, pembuluh darah transparan), panel diagnosis kesehatan.
            Camera: macro close-up on rotating 3D anatomical organ hologram, smooth orbital dolly around doctor explaining medical mechanisms.
            Prompt Video Mandat: Wajib memuat "clinical medical laboratory, floating 3D holographic anatomy, rotating transparent organ model, surgical clean lighting, medical doctor presenter".

          * 10. NASA Command Center:
            Output visual: ruang pusat kendali misi antariksa (aerospace mission control), giant central screen displaying planet Earth & orbital telemetry, deretan konsol komputer dengan operator, dashboard satelit & data real-time.
            Camera: slow dramatic pullback from main earth screen to mission flight director presenting at console.

          * 11. Classroom Modern:
            Output visual: ruang kelas kontemporer yang cerah dan bersahabat, smartboard interaktif menampilkan grafis pelajaran penuh warna, meja siswa modular rapi, pencahayaan alami hangat dari jendela.
            Camera: natural eye-level framing, friendly pans following teacher's energetic hand gestures.

          * 12. Cartoon 3D:
            Output visual: presenter karakter kartun 3D yang lucu, ekspresif, dan ramah, warna cerah ceria (vibrant stylized colors), alat peraga 3D bermata besar atau berbentuk pop-up kartun.
            Camera: lively animated camera angles, bouncy zoom, expressive animated timing.

          * 13. Pixar Style:
            Output visual: karakter 3D berkualitas film animasi Pixar (subsurface scattering skin, expressive animated eyes, lifelike hair strands), pencahayaan sinematik hangat, proporsi konsisten, visual storytelling berkelas tinggi.
            Camera: cinematic virtual lenses, gentle emotional breathing motion, warm bounce light.

          * 14. Disney Style:
            Output visual: karakter 3D lembut penuh pesona magis ala film animasi dongeng modern, senyum ramah menyapa penonton, elemen visual berkilau lembut (subtle magical sparkles), nuansa ramah keluarga (family-friendly).
            Camera: gentle sweeping camera paths, fairy-tale soft atmosphere.

          * 15. Mixed Reality (AR):
            Output visual: presenter manusia nyata di lingkungan fisik nyata, objek hologram 3D dan diagram infografis melayang tepat di depan presenter di udara, interaksi fisik AR langsung (presenter menyentuh, memutar, dan memperbesar objek AR secara nyata).
            Camera: handheld or steadicam with realistic physical parallax between presenter, floating AR elements, and room environment.

        - DETAIL SPESIFIKASI KELAS & MATERI:
          * Target Pengguna: "${targetUser || 'Guru'}"
          * Tujuan Video: "${videoGoal || 'Mengajar'}"
          * Materi / Topik: "${topicContent || videoIdea}"
          * Target Penonton: "${targetAudience || 'Umum'}"
          * Detail Karakter Presenter: ${presenterName ? `Nama: ${presenterName}, ` : ''}${characterDescription || 'Presenter profesional yang ramah, artikulatif, dan percaya diri'}
          * Brief Sutradara: "${optionalBrief || 'Pastikan gestur mengajar natural, kontak mata ke kamera kuat, dan transisi visual teratur'}"

        - ATURAN KONSISTENSI TOTAL:
          * Jika mode adalah "Hologram" dan materi adalah "Sistem Saraf", hasilkan presenter hologram biru transparan, HUD melayang, anatomi sistem saraf/neuron hologram, lighting futuristik, dan seluruh storyboard konsisten dari scene awal hingga akhir.
          * Jangan sekali-kali menghasilkan visual yang melenceng dari Mode Presentasi terpilih!

      J. JIKA PRESET "MUSIC & LYRIC VISUAL" (ID: lyric-visual):
        ZEO adalah sutradara musik video & visualizer animasi kelas dunia.
        Tugas ZEO:
        1. SUMBER AUDIO / LIRIK:
           - Tipe Sumber: "${musicSourceType || 'lirik'}"
           - Lirik Asli / Konsep: "${(musicLyrics || videoIdea || '').slice(0, 1500)}"
           - Tema Musik: "${musicTheme || 'Perjalanan Hidup / Cinta / Harapan'}"
           - Mood Musik: "${musicMood || 'Haru'}"
           - Genre Musik: "${musicGenre || 'Acoustic / Pop'}"
           - Ide Cerita / Pesan Tambahan: "${musicStoryIdea || ''}"
           - Jenis Video: "${musicVideoType || 'Animated Music Video'}"
           - Gaya Visual Terkunci: "${effectiveStyle}"
           - Mode Karakter: "${musicCharacterMode || characterChoice || 'Auto'}"
           - Mode Produksi: "${musicProductionMode || 'NORMAL'}"

        2. ATURAN ANALISIS MUSIK & LIRIK:
           - Jika lirik diberikan pengguna: GUNAKAN LIRIK TERSEBUT SECARA UTUH. JANGAN mengubah arti atau mengambil lirik berhak cipta lain dari internet.
           - Jika "Buatkan Lirik Baru": Buat lirik baru yang orisinal, puitis, dan berirama menyentuh hati.
           - Jika "Instrumental / Tanpa Lirik": Fokus pada mood, denyut ritme, energi dinamis, dan visual progression sinematik tanpa teks lirik vokal.
           - Analisis tema, cerita, emosi, simbol metafora (kursi kosong, jendela berembun, fajar, dll.), karakter, dan lokasi.

        3. ATURAN MASTER VISUAL STYLE & MASTER CHARACTER:
           - Gaya visual "${effectiveStyle}" TERKUNCI sebagai Master Visual Style Lock di seluruh scene, keyframe prompt, dan video prompt.
           - MASTER CHARACTER PROFILE: Deskripsikan penampilan fisik, busana konsisten, dan ekspresi mikro.
           - PROMPT GAMBAR CHARACTER SHEET (Bahasa Inggris): Tampilkan karakter yang sama persis dalam multi-angle: front view, 3/4 view, profile side view, full body standing pose, dan facial expression close-up. Clean minimalist studio background, soft even studio lighting.
           - Jika jenis video adalah "Character Singing": Aktifkan SINGER LOCK (wajah konsisten, gestur bernyanyi natural, gerakan bibir halus, ritme pernapasan lembut).

        4. ATURAN MASTER LOCATIONS:
           - Tentukan lokasi utama (LOCATION A, LOCATION B, dst.) dari narasi lagu.
           - PROMPT GAMBAR LOKASI (Bahasa Inggris): Clean cinematic environment TANPA karakter (Location Lock).

        5. STRUKTUR LAGU & STORYBOARD BERTAHAP (${targetScenes} SCENE):
           - Pecah struktur lagu sesuai durasi (INTRO, VERSE 1, PRE-CHORUS, CHORUS, VERSE 2, BRIDGE, FINAL CHORUS, OUTRO).
           - Storyboard mencakup: SCENE NUMBER, SONG SECTION, LYRIC CUE, DURATION, LOCATION, CHARACTER, VISUAL IDEA (campuran seimbang LITERAL, EMOTIONAL, dan SYMBOLIC), EMOTION, ACTION, CAMERA, TRANSITION, TEXT / LYRIC DISPLAY, CONTINUITY.
           - PROMPT GAMBAR PER SCENE (Bahasa Inggris): Keyframe visual pembuka dengan referensi karakter & lokasi terkunci.
           - PROMPT VIDEO PER SCENE (Bahasa Inggris): Pergerakan fisik nyata yang mengalir dinamis mengikuti tempo lagu.
           - TRANSITION PLAN: Transisi ritmis (Match Cut, Whip Pan, Dissolve, Light Flash, Beat Cut).
           - LYRIC OVERLAY PLAN: Posisi, animasi text, entry/exit, dan mood font.
           - AUDIO SFX NOTES & FINAL HERO SHOT.

    ATURAN MOTION REALISM UNTUK SEMUA VIDEO PROMPT:
    - Objects move only through believable physical interaction.
    - Hands must correctly grip and manipulate objects.
    - No teleporting objects.
    - No spontaneous object transformation unless transformation itself is the intended effect.
    - Maintain realistic physics appropriate to the selected visual style.

OUTPUT FORMAT HARUS JSON SESUAI STRUKTUR BERIKUT TANPA TEKS LAIN:
{
  "analisisCerita": {
    "premis": "string",
    "tema": "string",
    "alurRingkas": "string",
    "emosiSuasana": "string",
    "emotionalArc": "string jika emotional-story, atau null",
    "timeTransitionUsed": "string jika flashback, atau null",
    "characterTypeIdentified": "string jika character-talk, atau null",
    "isProcessEngine": ${['ai-timelapse', 'tiny-world', 'asmr-video', 'food-preparation'].includes(videoTypeId)},
    "processEngineType": "${['ai-timelapse', 'tiny-world', 'asmr-video', 'food-preparation'].includes(videoTypeId) ? (videoTypeId === 'ai-timelapse' ? 'timelapse' : videoTypeId === 'tiny-world' ? 'tiny-world' : videoTypeId === 'asmr-video' ? 'asmr' : 'food') : null}",
    "characterNotRequired": ${videoTypeId === 'ai-timelapse' && characterChoice === 'Tanpa Karakter'},
    "processHeadline": "string ringkasan alur proses atau transformasi",
    "gayaVisualTerkunci": "${effectiveStyle}"
  },
  "transformationPlan": [
    {
      "stageNumber": 1,
      "title": "Tahap 1: [Nama Tahap / State]",
      "description": "Deskripsi wujud fisik dan aktivitas perubahan pada tahap ini",
      "cameraTreatment": "Locked-off fixed camera / Top-down macro"
    }
  ],
  "firstFramePrompt": {
    "title": "Start Frame Image Prompt (Kondisi Awal)",
    "type": "first-frame",
    "prompt": "Starting frame still photograph/render showing initial state. [Subject in starting condition, location environment, exact camera perspective]. Style: ${effectiveStyle}. Aspect ratio: ${effectiveAspectRatio}.",
    "description": "Frame awal referensi visual sebelum proses transformasi berlangsung",
    "aspectRatio": "${effectiveAspectRatio}"
  },
  "lastFramePrompt": {
    "title": "${videoTypeId === 'food-preparation' ? 'Final Dish Image Prompt (Hero Frame)' : 'Final Frame Image Prompt (Hasil Akhir)'}",
    "type": "last-frame",
    "prompt": "Final completed frame still photograph/render. [Subject in finished state, exact same camera perspective as start frame, identical location geometry, finished presentation]. Style: ${effectiveStyle}. Aspect ratio: ${effectiveAspectRatio}.",
    "description": "Frame akhir referensi visual hasil transformasi lengkap",
    "aspectRatio": "${effectiveAspectRatio}"
  },
  "objectReferences": [
    {
      "id": "obj-1",
      "name": "string nama objek/bahan/alat",
      "category": "Bahan / Ingredient | Objek / Benda | Peralatan / Tool | Properti",
      "prompt": "Prompt referensi detail objek/bahan dengan tekstur dan material jelas",
      "details": "string"
    }
  ],
  "masterCharacters": [
    {
      "id": "char-1",
      "name": "${videoTypeId === 'asmr-video' || (videoTypeId === 'food-preparation' && foodPersonMode === 'Tangan Saja') ? 'Hand Reference Sheet' : 'Master Character — [Nama/Peran]'}",
      "sumberKarakter": "${characterChoice === 'Upload Character Sheet' || references.length > 0 ? 'Referensi Pengguna' : characterChoice === 'Karakter dari Teks' ? 'Deskripsi Teks' : 'Tanpa Karakter'}",
      "visualIdentity": {
        "genderPresentation": "string",
        "ageGroup": "string",
        "facialAppearance": "string",
        "facialStructure": "string",
        "skinAppearance": "string",
        "hairstyleOrHijab": "string",
        "bodyProportions": "string",
        "outfitAndColor": "string",
        "footwear": "string",
        "accessories": "string",
        "visualStyle": "${effectiveStyle}"
      },
      "characterSheetPrompt": "Create a clean professional reference sheet. [Full view / Hand reference details with clean nails, natural skin texture, sleeve details]. Style: ${effectiveStyle}."
    }
  ],
  "masterLocations": [
    {
      "id": "loc-1",
      "name": "MASTER LOCATION 1 — [Nama Tempat]",
      "environmentDetails": {
        "locationType": "string",
        "timeOfDayOrEra": "string",
        "architecture": "string",
        "furnitureAndLayout": "string",
        "importantElements": "string",
        "lightingAndAtmosphere": "string",
        "visualStyle": "${effectiveStyle}"
      },
      "locationLockPrompt": "A clean environment reference of [location name] with exact same architecture, layout, lighting, and camera angle. Ultra-detailed, ${effectiveStyle}, 8k resolution."
    }
  ],
  "masterProps": [
    {
      "id": "prop-1",
      "name": "string",
      "significance": "string",
      "propPrompt": "string"
    }
  ],
  "storyboard": [
    {
      "sceneNumber": 1,
      "durationLabel": "Scene 1 — [waktu]",
      "visual": "string",
      "action": "string",
      "camera": "string",
      "transition": "string",
      "characterInvolved": "string",
      "locationUsed": "string"
    }
  ],
  "sceneImagePrompts": [
    {
      "sceneNumber": 1,
      "title": "Scene 1 — Image Prompt (Starting Frame)",
      "prompt": "Starting frame still photograph/render for Scene 1. [Subject, location, camera angle, composition, lighting]. Aspect ratio: ${effectiveAspectRatio}. Style: ${effectiveStyle}.",
      "aspectRatio": "${effectiveAspectRatio}"
    }
  ],
  "sceneVideoPrompts": [
    {
      "sceneNumber": 1,
      "title": "Scene 1 — Video Prompt (AI Video Generator)",
      "prompt": "Cinematic AI video generation prompt for Scene 1. [Reference image anchor, Starting state, Physical action, Object interaction, Camera motion, Lighting, SFX timing, Ending state]. Realistic physics, believable motion. Style: ${effectiveStyle}. Aspect ratio: ${effectiveAspectRatio}."
    }
  ],
  "dialogVoiceOver": {
    "type": "${audio}",
    "script": "string atau null",
    "voiceOver": "string atau null",
    "dialogue": [
      {
        "speaker": "string",
        "text": "string"
      }
    ],
    "timingNotes": "string"
  },
  "sfxAndAmbience": {
    "ambientSounds": ["string"],
    "soundEffects": ["string"],
    "musicMood": "string"
  },
  "negativePrompt": "string negative prompt yang menggabungkan larangan spesifik preset dan standar kualitas ZEO.",
  "foodPrepData": ${videoTypeId === 'food-preparation' ? `{
    "photoAnalysis": "string deskripsi analisis bahan dan foto",
    "detectedIngredients": ["string nama bahan"],
    "selectedActivities": ["string nama aktivitas berurutan"],
    "conceptSummary": "string ringkasan alur food preparation",
    "ingredientStateMap": [
      {
        "ingredient": "string nama bahan",
        "statesPerScene": [
          { "sceneNumber": 1, "state": "string kondisi bahan di scene ini" }
        ]
      }
    ],
    "processBoard": [
      {
        "sceneNumber": 1,
        "activity": "string nama aktivitas",
        "ingredient": "string bahan yang difokuskan",
        "startState": "string kondisi awal sebelum aksi",
        "action": "string aksi spesifik yang dilakukan",
        "endState": "string kondisi fisik setelah aksi selesai",
        "camera": "string perlakuan kamera",
        "handAction": "string pergerakan tangan dan jari presisi",
        "asmrSfx": "string suara ASMR taktil dan ambient",
        "continuity": "string elemen continuity yang diteruskan ke scene berikutnya"
      }
    ],
    "imagePrompts": [
      {
        "title": "Reference Frame: [Judul]",
        "aspectRatio": "${effectiveAspectRatio}",
        "prompt": "English image prompt...",
        "notes": "string catatan visual"
      }
    ],
    "videoPrompts": [
      {
        "sceneNumber": 1,
        "title": "Scene 1: [Judul]",
        "prompt": "Cinematic AI video prompt in English with [INGREDIENT REFERENCE: ...], [LOCATION: ...], [STARTING STATE: ...], [HAND / CHARACTER: ...], [ACTION: ...], [PHYSICAL INTERACTION: ...], [CAMERA: ...], [LIGHTING: ...], [ASMR: ...], [ENDING STATE: ...], [CONTINUITY: ...]"
      }
    ],
    "asmrPlan": [
      {
        "activity": "string nama aktivitas",
        "sfxSounds": ["string suara taktil spesifik"],
        "ambientText": "string suasana ruang dapur"
      }
    ],
    "finalShot": {
      "title": "Final Shot: [Judul]",
      "description": "string penjelasan hasil akhir",
      "prompt": "English prompt for final hero shot of organized ingredients / restocked fridge / prepared food"
    },
    "negativePrompt": "wrong ingredients, ingredient duplication, ingredient morphing, food changing type, extra hands, extra fingers, deformed hands, floating objects, object teleportation, knife deformation, unsafe cutting motion, container morphing, kitchen changing layout, flickering, unrealistic physics, random text, watermark."
  }` : 'null'},
  "musicLyricData": ${videoTypeId === 'lyric-visual' ? `{
    "musicLyricAnalysis": {
      "sourceType": "${musicSourceType || 'lirik'}",
      "theme": "string tema lagu",
      "mood": "${musicMood || 'Haru'}",
      "genre": "${musicGenre || 'Acoustic / Pop'}",
      "story": "string cerita lagu",
      "emotionalProgression": "string perkembangan emosi dari awal hingga akhir",
      "symbolsAndMetaphors": ["string simbol visual yang digunakan"],
      "charactersIdentified": ["string karakter yang terlibat"],
      "locationsIdentified": ["string lokasi utama"],
      "songLyrics": "string teks lirik utuh"
    },
    "conceptSummary": "string ringkasan konsep MV",
    "masterVisualStyle": "${effectiveStyle}",
    "masterCharacters": [
      {
        "id": "char-1",
        "name": "Master Character",
        "sumberKarakter": "Deskripsi AI",
        "visualIdentity": {
          "genderPresentation": "string",
          "ageGroup": "string",
          "facialAppearance": "string",
          "facialStructure": "string",
          "skinAppearance": "string",
          "hairstyleOrHijab": "string",
          "bodyProportions": "string",
          "outfitAndColor": "string",
          "footwear": "string",
          "accessories": "string",
          "visualStyle": "${effectiveStyle}"
        },
        "characterSheetPrompt": "Clean professional character reference sheet of the exact same character shown consistently across all views: front view, 3/4 view, profile side view, full body standing pose, and facial expression close-up. Identical facial features, hair, outfit, accessories. Neutral standing pose, clean minimalist studio background, soft even studio lighting. Style: ${effectiveStyle}, ultra-detailed, 8k resolution."
      }
    ],
    "masterLocations": [
      {
        "id": "loc-1",
        "name": "LOCATION A",
        "environmentDetails": {
          "locationType": "string",
          "timeOfDayOrEra": "string",
          "architecture": "string",
          "furnitureAndLayout": "string",
          "importantElements": "string",
          "lightingAndAtmosphere": "string",
          "visualStyle": "${effectiveStyle}"
        },
        "locationLockPrompt": "A clean cinematic environment reference without characters. Style: ${effectiveStyle}, 8k resolution."
      }
    ],
    "songStructure": [
      {
        "section": "INTRO",
        "title": "string judul seksi",
        "timingOrCue": "00:00 - 00:10",
        "description": "string deskripsi seksi"
      }
    ],
    "storyboard": [
      {
        "sceneNumber": 1,
        "songSection": "INTRO",
        "lyricCue": "string bait lirik pada scene ini",
        "duration": "${musicSceneDuration || '10 detik'}",
        "location": "LOCATION A",
        "character": "Master Character",
        "visualIdea": "string ide visual [LITERAL / EMOTIONAL / SYMBOLIC]",
        "emotion": "string emosi scene",
        "action": "string aksi nyata karakter",
        "camera": "string pergerakan kamera",
        "transition": "string jenis transisi",
        "textLyricDisplay": "string penataan teks lirik",
        "continuity": "string kontinuitas visual ke scene berikutnya"
      }
    ],
    "sceneImagePrompts": [
      {
        "sceneNumber": 1,
        "title": "Scene 1 — Keyframe Starting Visual",
        "aspectRatio": "${effectiveAspectRatio}",
        "prompt": "Cinematic starting keyframe image in English. [SUBJECT], [LOCATION], [POSE & ACTION], [COMPOSITION], [LIGHTING]. Visual Style: ${effectiveStyle}. Aspect Ratio: ${effectiveAspectRatio}."
      }
    ],
    "sceneVideoPrompts": [
      {
        "sceneNumber": 1,
        "title": "Scene 1 — Video / Animation Prompt",
        "prompt": "Cinematic AI video generation prompt in English. [REFERENCE], [ENVIRONMENT], [STARTING STATE], [MOVEMENT & ACTION], [FACIAL EXPRESSION], [CAMERA MOVEMENT], [LIGHTING], [ENDING STATE]. Style: ${effectiveStyle}.",
        "singerLockNotes": "string catatan singer lock jika character singing atau null"
      }
    ],
    "transitionPlan": [
      {
        "fromScene": 1,
        "toScene": 2,
        "transitionType": "Match Cut",
        "motionDescription": "string deskripsi transisi ritmis"
      }
    ],
    "lyricOverlayPlan": [
      {
        "sceneNumber": 1,
        "timestampCue": "00:00 - 00:10",
        "text": "string bait lirik",
        "position": "Bottom-Center",
        "animation": "Smooth Fade In",
        "entry": "0.5s fade",
        "exit": "0.3s fade",
        "fontMood": "string tipografi sesuai suasana"
      }
    ],
    "audioSfxNotes": {
      "musicStyle": "string deskripsi gaya musik dan mood",
      "sfxLayers": ["string layer sfx taktil ambient"],
      "vocalNotes": "string catatan vokal"
    },
    "finalShot": {
      "title": "string judul shot penutup",
      "prompt": "Cinematic wide-angle final hero shot in English. Style: ${effectiveStyle}.",
      "description": "string kesan akhir penutup"
    },
    "negativePrompt": "character identity change, face morphing, outfit inconsistency, location inconsistency, extra limbs, bad hands, duplicate character, flickering, background morphing, object teleportation, random text, unreadable generated typography, watermark, unmotivated camera motion, style inconsistency."
  }` : 'null'}
}`;

  const userPrompt = `KONFIGURASI VIDEO KREATIF ZEO:
- Kategori Studio: ${videoTypeCategory}
- Jenis Video: ${videoTypeTitle} (ID: ${videoTypeId})
- Ide Cerita Pengguna: "${videoIdea || 'Ide kreatif seputar konsep ' + videoTypeTitle}"
- Pilihan Karakter: ${characterChoice} ${characterDescription ? `(Deskripsi: ${characterDescription})` : ''}
${videoTypeId === 'character-talk' ? `- Pilihan Spesies/Jenis Karakter: ${characterTypeChoice}` : ''}
${videoTypeId === 'flashback' ? `- Tahapan Waktu / Era: ${timelineEra || 'Dianalisis otomatis dari ide'}\n- Transisi Waktu Pilihan: ${timeTransition}` : ''}
${videoTypeId === 'ai-timelapse' ? `- Kondisi Awal (Start State): ${timelapseStartCondition || 'Dianalisis dari ide'}\n- Hasil Akhir (Final State): ${timelapseEndResult || 'Dianalisis dari ide'}\n- Aturan Kamera: Locked-off fixed camera dengan Spatial Continuity Lock` : ''}
${videoTypeId === 'tiny-world' ? `- Konsep Dunia Miniatur: ${tinyWorldConcept || 'Miniature activity'}\n- Skala Miniatur: ${tinyWorldScale}\n- Aturan Kamera: Macro lens, shallow DOF, Scale Consistency Lock` : ''}
${videoTypeId === 'asmr-video' ? `- Subjek ASMR: ${asmrSubject}\n- Desain Suara: Pure SFX tactile audio tanpa musik pengganggu\n- Kontrol Gerakan: Urutan gerak fisik logis tanpa teleportasi objek` : ''}
${videoTypeId === 'food-preparation' ? `- Bahan Makanan Terkonfirmasi: ${confirmedIngredients.length > 0 ? confirmedIngredients.join(', ') : 'Bahan terdeteksi dari foto'}\n- Aktivitas yang Dipilih (Urutan Proses): ${selectedActivities.length > 0 ? selectedActivities.join(' → ') : 'Full Preparation'}\n- Tujuan Video: ${foodVideoGoal || 'Auto'}\n- Tampilan Orang: ${foodHumanMode || 'Tangan Saja'}\n- Lokasi Dapur: ${foodLocation || 'Dapur Modern'}\n- Durasi per Scene: ${foodDurationPerScene || '10 detik'}\n- Format Audio: ${foodAudioMode || 'ASMR + Ambient'}` : ''}
${videoTypeId === 'short-drama' ? `- Genre Drama: ${genre || 'Dianalisis dari alur cerita'}\n- Tema Viral: ${viralTheme || 'Dianalisis dari alur cerita'}\n- Mode Produksi: ${productionMode || 'HEMAT'}\n- Jumlah Karakter: ${characterCount}\n- Durasi per Scene: ${sceneDuration || '10 detik'}\n- Ide Cerita Tambahan: ${storyIdea || '(Otomatis disusun ZEO)'}` : ''}
${videoTypeId === 'teacher-presenter' ? `- Mode Presentasi (MASTER STYLE): ${presentationMode || 'Hologram'}\n- Target Pengguna: ${targetUser || 'Guru'}\n- Tujuan Video: ${videoGoal || 'Mengajar'}\n- Materi / Topik: ${topicContent || videoIdea}\n- Target Penonton: ${targetAudience || 'Umum'}\n- Detail Karakter: ${presenterName ? `Nama: ${presenterName}, ` : ''}${characterDescription || 'Presenter profesional'}\n- Brief Sutradara: ${optionalBrief || 'Konsisten mengikuti Master Style'}` : ''}
${videoTypeId === 'lyric-visual' ? `- Sumber Musik/Lirik: ${musicSourceType}\n- Lirik/Ide: "${(musicLyrics || videoIdea || '').slice(0, 500)}"\n- Tema Lagu: ${musicTheme || 'Auto'}\n- Mood: ${musicMood || 'Haru'}\n- Genre: ${musicGenre || 'Pop/Acoustic'}\n- Jenis MV: ${musicVideoType}\n- Mode Produksi: ${musicProductionMode || 'NORMAL'}\n- Mode Karakter: ${musicCharacterMode}\n- Durasi Total: ${musicDuration || '60 detik'}\n- Durasi per Scene: ${musicSceneDuration || '10 detik'}` : ''}
- Referensi Gambar Diunggah: ${references.length} file visual
- Durasi: ${effectiveDuration}
- Jumlah Scene yang Diinginkan: ${targetScenes} scene
- Gaya Visual yang Dikunci: ${effectiveStyle}
- Format Audio: ${audio}
- Platform Target & Rasio: ${platform} (${effectiveAspectRatio})

Lakukan analisis mendalam dan hasilkan seluruh prompt gambar referensi (Character/Hand Sheet, Master Location, Object/Ingredient Reference, First Frame Prompt, Scene Image Prompts, Final/Last Frame Prompt) serta prompt video per scene dan audio sesuai instruksi di atas dalam format JSON yang valid.`;

  const contents = [
    {
      role: 'user',
      parts: [
        ...imageParts,
        { text: userPrompt },
      ],
    },
  ];

  const modelsToTry = [
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.6-flash',
    'gemini-3.1-pro-preview',
  ];

  let response: any = null;
  let usedModel = '';
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[CreativeEngine] Calling Gemini model: ${modelName}`);
      response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });
      usedModel = modelName;
      console.log(`[CreativeEngine] Success with model: ${modelName}`);
      break;
    } catch (err: any) {
      lastError = err;
      const isAccessDenied =
        err?.status === 403 ||
        /PERMISSION_DENIED|denied access/i.test(String(err?.message || JSON.stringify(err || '')));
      if (isAccessDenied && !params.apiKey) {
        console.log(`[CreativeEngine] Gemini key access restricted (403). Seamlessly activating Creative Smart Engine.`);
        break;
      }
      console.log(`[CreativeEngine] Model ${modelName} returned status ${err?.status || 'error'}, checking fallback model...`);
    }
  }

  if (!response) {
    if (params.apiKey) {
      // REQUIREMENT #5: STRICTLY NO FALLBACK FOR BYOK SESSIONS
      const err = new Error(
        'Generate gagal menggunakan Gemini API Key Anda. Periksa kuota atau izin project Anda.'
      );
      (err as any).originalError = lastError;
      throw err;
    }

    console.log('[CreativeEngine] Gemini API unavailable or permission denied. Activating Creative Smart Fallback Engine...');
    const foundType = CREATIVE_VIDEO_TYPES.find((t) => t.id === videoTypeId) || {
      id: videoTypeId,
      title: videoTypeTitle || 'Creative Video',
      desc: 'Video kreatif dengan prompt sinematik terstruktur.',
      category: (videoTypeCategory as any) || 'Story',
      iconType: 'film' as const,
      defaultPlaceholder: '“Cerita sinematik visual kreatif.”',
      badge: 'Creative',
      color: 'from-indigo-600 to-violet-600',
    };

    const fallback = generateCreativeFallbackResult(
      foundType,
      {
        references: references.map((r, i) => ({
          id: `ref-${i + 1}`,
          name: r.name || `Referensi ${i + 1}`,
          previewUrl: '',
          size: 0,
          mimeType: r.mimeType || 'image/jpeg',
          base64: r.base64,
        })),
        characterChoice: characterChoice as any,
        characterTypeChoice: characterTypeChoice as any,
        characterSheetImage: characterSheetImage
          ? {
              id: 'sheet-1',
              name: characterSheetImage.name || 'Character Sheet',
              previewUrl: '',
              size: 0,
              mimeType: characterSheetImage.mimeType || 'image/jpeg',
              base64: characterSheetImage.base64,
            }
          : null,
        characterDescription: characterDescription || '',
        characterLock: true,
        videoIdea,
        timelineEra,
        timeTransition: timeTransition as any,
        timelapseStartCondition,
        timelapseEndResult,
        tinyWorldConcept,
        tinyWorldScale: tinyWorldScale as any,
        asmrSubject: asmrSubject as any,
        foodDishName,
        foodStageOption: foodStageOption as any,
        foodPersonMode: foodPersonMode as any,
        duration: duration as any,
        customDurationSeconds: customDurationSeconds || 20,
        sceneCount: sceneCount as any,
        visualStyle: visualStyle as any,
        audio: audio as any,
        platform: platform as any,
      },
      'Pengguna'
    );

    return {
      ...fallback,
      modelUsed: 'Creative Smart Engine (Fallback Mode)',
      waktuAnalisis: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  }

  const rawText =
    typeof response.text === 'string'
      ? response.text
      : typeof (response as any).text === 'function'
        ? (response as any).text()
        : (response as any).candidates?.[0]?.content?.parts?.[0]?.text || '';
  let parsedResult: any = null;
  try {
    parsedResult = JSON.parse(rawText);
  } catch (jsonErr) {
    console.warn('[CreativeEngine] JSON parse failed, trying regex extraction...');
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      parsedResult = JSON.parse(match[0]);
    } else {
      throw new Error('Hasil AI tidak dapat dibaca sebagai format JSON valid.');
    }
  }

  return {
    ...parsedResult,
    modelUsed: usedModel,
    waktuAnalisis: new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}
