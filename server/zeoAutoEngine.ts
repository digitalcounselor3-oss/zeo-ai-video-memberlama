import { GoogleGenAI } from '@google/genai';
import {
  ZeoAutoResult,
  ZeoAutoDurationScope,
  ZeoAutoSceneCount,
  CreativeDuration,
  CreativeStyle,
  CreativeAudio,
  CreativePlatform,
} from '../src/creativeTypes';
import { generateZeoAutoFallbackResult } from '../src/utils/zeoAutoFallbackGenerator';

export interface ZeoAutoEngineParams {
  references: Array<{ mimeType?: string; base64: string; name?: string; id?: string }>;
  videoIdea: string;
  duration: CreativeDuration;
  customDurationSeconds?: number;
  durationScope: ZeoAutoDurationScope;
  sceneCount: ZeoAutoSceneCount;
  visualStyle: CreativeStyle;
  audio: CreativeAudio;
  platform: CreativePlatform;
  isAlternative?: boolean;
  apiKey?: string;
}

export async function processZeoAutoAnalysis(
  ai: GoogleGenAI,
  params: ZeoAutoEngineParams
): Promise<ZeoAutoResult> {
  const {
    references = [],
    videoIdea,
    duration,
    customDurationSeconds,
    durationScope = 'Setiap Scene',
    sceneCount = 'Otomatis',
    visualStyle = 'Otomatis',
    audio = 'Otomatis',
    platform = 'TikTok / Reels / Shorts',
    isAlternative = false,
  } = params;

  // Compute duration labels & values
  const baseSeconds =
    duration === 'Custom' && customDurationSeconds
      ? customDurationSeconds
      : parseInt(duration || '10 detik', 10) || 10;

  // Determine scene count
  let targetScenes = 3;
  if (sceneCount === '1') targetScenes = 1;
  else if (sceneCount === '2') targetScenes = 2;
  else if (sceneCount === '3') targetScenes = 3;
  else if (sceneCount === '4') targetScenes = 4;
  else if (sceneCount === '5') targetScenes = 5;
  else {
    // 'Otomatis' - decide smartly based on idea length and duration
    const ideaLower = (videoIdea || '').toLowerCase();
    if (ideaLower.includes('1 scene') || ideaLower.includes('satu scene')) {
      targetScenes = 1;
    } else if (ideaLower.includes('2 scene') || ideaLower.includes('dua scene')) {
      targetScenes = 2;
    } else if (ideaLower.includes('5 scene') || ideaLower.includes('lima scene')) {
      targetScenes = 5;
    } else if (baseSeconds <= 8 && durationScope === 'Total Video') {
      targetScenes = 1;
    } else if (baseSeconds <= 15 && durationScope === 'Total Video') {
      targetScenes = 2;
    } else {
      targetScenes = 3;
    }
  }

  // Calculate per-scene duration and total duration
  let perSceneSeconds = baseSeconds;
  let totalVideoSeconds = baseSeconds * targetScenes;

  if (durationScope === 'Total Video') {
    totalVideoSeconds = baseSeconds;
    perSceneSeconds = Math.max(3, Math.round(baseSeconds / targetScenes));
  } else {
    // 'Setiap Scene'
    perSceneSeconds = baseSeconds;
    totalVideoSeconds = baseSeconds * targetScenes;
  }

  const effectiveAspectRatio = platform.includes('Landscape')
    ? '16:9 landscape'
    : platform.includes('Semua Platform')
    ? '9:16 vertical (with safe area)'
    : '9:16 vertical';

  const effectiveStyle = visualStyle === 'Otomatis' ? 'Cinematic Realistic' : visualStyle;

  // Build multimodal image parts
  const imageParts = references
    .map((img, idx) => {
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

  const systemInstruction = `Anda adalah "ZEO AUTO ENGINE" — sutradara AI dan prompt engineer multimodal otomatis tercanggih di "ZEO — AI Video Studio by Ms. Inggid".

MISI UTAMA ZEO AUTO:
Menerima ide cerita bebas dan 0–6 gambar referensi dari pengguna, lalu secara OTOMATIS:
1. Menganalisis dan mengklasifikasikan setiap gambar referensi secara objektif (JANGAN menganggap semua gambar sebagai karakter!).
2. Mendeteksi jenis konsep video yang paling cocok dari 18 preset ZEO Creative Video:
   - short-drama (Short Drama)
   - vlog-ai (Vlog AI)
   - video-podcast (Video Podcast)
   - character-talk (Character Talk)
   - teacher-presenter (Teacher & Presenter)
   - educational-video (Video Edukasi)
   - history-story (Cerita Sejarah)
   - fact-mystery (Fakta Unik & Misteri)
   - emotional-story (Emotional Story)
   - flashback (Flashback / Jelajah Waktu)
   - ai-timelapse (AI Timelapse)
   - tiny-world (Tiny World)
   - asmr-video (ASMR Video)
   - food-preparation (Food Preparation)
   - school-promotion (School Promotion)
   - pop-up-story (Pop-Up Story)
   - lyric-visual (Lyric Visual)
   - dream-transition (Dream / Profession Transition)
3. Menggabungkan PRIMARY ENGINE dan SECONDARY STYLE / ENGINE jika ide memerlukan kombinasi (contoh: Guru masuk portal dinosaurus -> Primary: flashback, Secondary: Teacher & Presenter / Education).
4. Menentukan alur: STORY FLOW atau PROCESS FLOW:
   - STORY FLOW: drama, vlog, education, history, emotional story, character talk, flashback, school promotion, dream transition, lyric visual, pop-up story.
   - PROCESS FLOW: ai-timelapse, tiny-world, asmr-video, food-preparation.
5. Membangun MASTER CHARACTER & PROMPT CHARACTER SHEET (jika ada karakter).
   Jika karakter lebih dari 1, pisahkan menjadi "Character A", "Character B", dst. Kunci identitas karakter antar-scene (Character Lock).
6. Membangun MASTER LOCATION & PROMPT GAMBAR LOKASI (Clean Environment tanpa orang). Kunci lokasi antar-scene (Location Lock).
7. Membangun OBJECT / PROP PROMPT jika ada benda penting (hanya benda penting).
8. Menyusun STORYBOARD OTOMATIS (${targetScenes} scene) dengan durasi terhitung akurat.
9. Menghasilkan PROMPT GAMBAR LENGKAP:
   - Character Sheet Prompts
   - Master Location Prompts
   - Object Reference Prompts (jika ada)
   - Scene Image Prompts (per scene)
   - First Frame & Last Frame Prompts (jika transformasi/proses)
10. Menghasilkan PROMPT VIDEO PER SCENE siap copy-paste ke Google Flow / Veo (dalam BAHASA INGGRIS yang deskriptif, natural, dan konsisten).
11. Menghasilkan DIALOG / VOICE OVER terstruktur dengan kontrol pembicara (speaker attribution), SFX & Ambience, dan Negative Prompt.

${
  isAlternative
    ? `CATATAN GENERATE ALTERNATIF:
Pengguna meminta alternatif versi baru!
- UBAH: Sudut kamera, blocking pemain, hook visual awal, gaya transisi visual, pacing, dan lighting treatment.
- PERTAHANKAN: Karakter yang terkunci, lokasi yang terkunci, inti cerita pengguna, durasi, dan jumlah scene.`
    : ''
}

ATURAN KLASIFIKASI GAMBAR REFERENSI:
Periksa setiap gambar yang diunggah (${references.length} gambar).
Tentukan jenisnya salah satu dari:
- CHARACTER_REFERENCE (Foto orang/karakter tunggal atau wajah)
- CHARACTER_SHEET (Lembar referensi karakter multi-view)
- LOCATION_REFERENCE (Foto pemandangan, ruangan, latar, arsitektur)
- OUTFIT_REFERENCE (Pakaian, seragam, kostum)
- OBJECT_REFERENCE (Benda khusus, alat, buku, artefak)
- FOOD_REFERENCE (Makanan, minuman, bahan masakan)
- BUILDING_REFERENCE (Gedung, eksterior, fasad arsitektur)
- STYLE_REFERENCE (Ilustrasi atau gaya seni acuan)
- OTHER_REFERENCE (Screenshot, teks, atau referensi lainnya)
* JANGAN PERNAH mengasumsikan semua gambar adalah karakter!

ATURAN DURASI & SCENE:
- Durasi yang dipilih: ${duration} (Scope: ${durationScope}).
- Jumlah Scene: ${targetScenes} scene.
- Durasi per scene: ±${perSceneSeconds} detik per scene.
- Total durasi video: ±${totalVideoSeconds} detik.
- Dialog atau VO harus realistis dan TIDAK BOLEH melebihi waktu scene! (Rata-rata 2.5 kata per detik).

ATURAN KONSISTENSI VIDEO PROMPT (FLOW / VEO READY):
- Selalu dalam BAHASA INGGRIS untuk AI video generator.
- Prompt harus mencantumkan referensi: "Using the established character reference sheet as identity anchor... and established location reference as environment anchor..."
- Jika ada 2 karakter berbicara:
  "Character A says: '[dialog]'. Character B listens attentively with closed mouth. No lip movement for listener."
- Lip-sync instruction: "Accurate lip-sync synchronization with natural mouth movement."

FORMAT OUTPUT: HARUS JSON VALID SESUAI SKEMA BERIKUT TANPA TEKS LAIN!`;

  const userPrompt = `PROYEK ZEO AUTO:
- Ide Video Pengguna: "${videoIdea || 'Buatkan video kreatif sinematik berkualitas tinggi.'}"
- Gambar Referensi Diunggah: ${references.length} file
${
  references.length > 0
    ? references.map((r, i) => `  * Gambar ${i + 1}: ${r.name || 'Visual Reference'}`).join('\n')
    : '  * Tidak ada gambar referensi (buat konsep dari ide teks).'
}
- Konfigurasi Durasi: ${duration} (${durationScope}) -> Rencana: ±${perSceneSeconds}s per scene (Total: ±${totalVideoSeconds}s).
- Jumlah Scene yang Diinginkan: ${targetScenes} scene.
- Pilihan Visual Style: ${visualStyle} (Gaya efektif: ${effectiveStyle}).
- Pilihan Audio: ${audio}.
- Platform: ${platform} (${effectiveAspectRatio}).
${isAlternative ? '- MODE: GENERATE ALTERNATIF (Variasikan kamera, blocking, visual hook, transisi sambil menjaga konsistensi karakter dan lokasi).' : ''}

Silakan analisis ide dan referensi secara cerdas, tentukan Primary Engine dan Secondary Style, klasifikasikan gambar, lalu susun seluruh prompt gambar referensi, storyboard, video prompt, dialog, SFX, dan negative prompt dalam format JSON berikut:

{
  "detection": {
    "primaryEngineId": "string id dari 18 preset (contoh: 'flashback', 'character-talk', 'short-drama', dll)",
    "primaryEngineTitle": "Nama resmi preset (contoh: 'Flashback / Jelajah Waktu')",
    "secondaryEngineTitle": "Pendekatan tambahan (contoh: 'Teacher & Presenter / Educational Adventure') atau null",
    "flowType": "STORY FLOW atau PROCESS FLOW",
    "conceptExplanation": "Penjelasan mengapa ZEO memilih konsep dan perpaduan engine ini untuk ide pengguna.",
    "hasCharacter": boolean,
    "hasLocation": boolean,
    "hasImportantProp": boolean,
    "imageClassifications": [
      {
        "id": "ref-1",
        "name": "nama gambar",
        "classification": "CHARACTER_REFERENCE | CHARACTER_SHEET | LOCATION_REFERENCE | OUTFIT_REFERENCE | OBJECT_REFERENCE | FOOD_REFERENCE | BUILDING_REFERENCE | STYLE_REFERENCE | OTHER_REFERENCE",
        "functionDescription": "Fungsi gambar ini dalam video"
      }
    ]
  },
  "analisisIde": {
    "summary": "Ringkasan premis dan inti cerita video",
    "coreTheme": "Tema utama video",
    "visualPlan": "Rancangan visual terpadu (pencahayaan, palet warna, konsistensi gaya)"
  },
  "masterCharacters": [
    {
      "id": "char-1",
      "name": "Master Character / Character A",
      "sumberKarakter": "Referensi Pengguna | Deskripsi Teks | Tanpa Karakter",
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
      "characterSheetPrompt": "Clean professional multi-view character reference sheet in English (front, 3/4, side, facial close-up) in neutral studio light. Style: ${effectiveStyle}."
    }
  ],
  "masterLocations": [
    {
      "id": "loc-1",
      "name": "MASTER LOCATION 1 — [Nama Lokasi]",
      "environmentDetails": {
        "locationType": "string",
        "timeOfDayOrEra": "string",
        "architecture": "string",
        "furnitureAndLayout": "string",
        "importantElements": "string",
        "lightingAndAtmosphere": "string",
        "visualStyle": "${effectiveStyle}"
      },
      "locationLockPrompt": "Clean environment reference of [location] without human characters. Exact same architecture, layout, lighting, and camera angle. Ultra-detailed, ${effectiveStyle}, 8k resolution."
    }
  ],
  "masterProps": [
    {
      "id": "prop-1",
      "name": "Nama Benda / Objek Penting",
      "significance": "Fungsi objek dalam alur cerita",
      "propPrompt": "Detailed object reference prompt in English focusing on texture and material."
    }
  ],
  "storyboard": [
    {
      "sceneNumber": 1,
      "duration": "±${perSceneSeconds} detik",
      "location": "Nama Lokasi",
      "character": "Karakter yang terlibat",
      "visual": "Deskripsi visual adegan",
      "action": "Aksi fisik dan interaksi subjek",
      "expression": "Ekspresi wajah dan emosi mikro",
      "camera": "Framing kamera dan pergerakan lensa (${effectiveAspectRatio})",
      "dialogueOrVo": "Dialog atau narasi suara",
      "sfx": "Efek suara kunci",
      "transition": "Transisi ke scene berikutnya"
    }
  ],
  "transformationPlan": [
    {
      "stageNumber": 1,
      "title": "Tahap 1",
      "description": "Deskripsi tahap jika process flow, atau null"
    }
  ],
  "sceneImagePrompts": [
    {
      "sceneNumber": 1,
      "title": "Scene 1 — Starting Frame Image Prompt",
      "prompt": "Starting frame still photograph/render for Scene 1 in English. Incorporates character reference, location reference, lighting, and exact camera angle. Aspect ratio: ${effectiveAspectRatio}. Style: ${effectiveStyle}.",
      "aspectRatio": "${effectiveAspectRatio}"
    }
  ],
  "firstFramePrompt": {
    "title": "Start Frame Image Prompt",
    "type": "first-frame",
    "prompt": "Initial starting frame prompt if transformation/process, otherwise null",
    "aspectRatio": "${effectiveAspectRatio}"
  },
  "lastFramePrompt": {
    "title": "Final Frame Image Prompt",
    "type": "last-frame",
    "prompt": "Final completed frame prompt if transformation/process, otherwise null",
    "aspectRatio": "${effectiveAspectRatio}"
  },
  "sceneVideoPrompts": [
    {
      "sceneNumber": 1,
      "title": "Scene 1 — Video Prompt (AI Video Generator)",
      "prompt": "Cinematic AI video generation prompt in English ready for Flow/Veo. Detailed physical motion, camera tracking, consistent identity reference, and lighting. Style: ${effectiveStyle}. Aspect ratio: ${effectiveAspectRatio}."
    }
  ],
  "dialogVoiceOver": {
    "type": "${audio}",
    "script": "Ringkasan skrip",
    "voiceOver": "Skrip narasi VO bahasa Indonesia atau null",
    "dialogue": [
      {
        "speaker": "Nama Karakter",
        "text": "Kalimat yang diucapkan"
      }
    ],
    "timingNotes": "Catatan durasi dan pacing dialog"
  },
  "sfxAndAmbience": {
    "ambientSounds": ["Suara latar 1", "Suara latar 2"],
    "soundEffects": ["SFX 1", "SFX 2"],
    "musicMood": "Deskripsi mood musik latar"
  },
  "negativePrompt": "English negative prompt preventing face morphing, identity shift, camera jitter, low quality, and unwanted artifacts."
}`;

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
      console.log(`[ZeoAutoEngine] Trying Gemini model: ${modelName}`);
      response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: isAlternative ? 0.45 : 0.25,
        },
      });
      usedModel = modelName;
      console.log(`[ZeoAutoEngine] Succeeded with model: ${modelName}`);
      break;
    } catch (err: any) {
      lastError = err;
      const isAccessDenied =
        err?.status === 403 ||
        /PERMISSION_DENIED|denied access/i.test(String(err?.message || JSON.stringify(err || '')));
      if (isAccessDenied) {
        console.log(`[ZeoAutoEngine] Gemini key access restricted (403). Seamlessly activating ZEO Smart Engine.`);
        break;
      }
      console.log(`[ZeoAutoEngine] Model ${modelName} returned status ${err?.status || 'error'}, checking fallback model...`);
    }
  }

  if (!response) {
    if (params.apiKey) {
      // REQUIREMENT #6: STRICTLY NO FALLBACK FOR BYOK PILOT
      const err = new Error(
        'Generate gagal menggunakan Gemini API Key Anda. Periksa kuota atau izin project Anda.'
      );
      (err as any).originalError = lastError;
      throw err;
    }

    console.log('[ZeoAutoEngine] Gemini API unavailable or permission denied. Seamlessly activating Smart ZEO Fallback Engine...');
    const fallback = generateZeoAutoFallbackResult(
      {
        references: references.map((r, i) => ({
          id: r.id || `ref-${i + 1}`,
          name: r.name || `Referensi ${i + 1}`,
          previewUrl: '',
          size: 0,
          mimeType: r.mimeType || 'image/jpeg',
          base64: r.base64,
        })),
        videoIdea,
        duration,
        customDurationSeconds: customDurationSeconds || 10,
        durationScope,
        sceneCount,
        visualStyle,
        audio,
        platform,
      },
      isAlternative
    );
    return {
      ...fallback,
      modelUsed: 'ZEO Smart Engine (Auto Mode)',
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
    console.warn('[ZeoAutoEngine] Direct JSON parse failed, attempting regex extraction...');
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      parsedResult = JSON.parse(match[0]);
    } else {
      throw new Error('Hasil AI tidak dapat diparsing sebagai format JSON valid.');
    }
  }

  // Sanitize & normalize fields to ensure no empty sections or broken arrays
  if (!parsedResult.detection) {
    parsedResult.detection = {
      primaryEngineId: 'short-drama',
      primaryEngineTitle: 'Short Drama',
      secondaryEngineTitle: 'Cinematic Storytelling',
      flowType: 'STORY FLOW',
      conceptExplanation: 'ZEO mendeteksi ide cerita naratif dan menyusun prompt sinematik.',
      hasCharacter: true,
      hasLocation: true,
      hasImportantProp: false,
      imageClassifications: [],
    };
  }

  // Ensure imageClassifications map back to original references if missing
  if (
    (!parsedResult.detection.imageClassifications ||
      parsedResult.detection.imageClassifications.length === 0) &&
    references.length > 0
  ) {
    parsedResult.detection.imageClassifications = references.map((ref, idx) => ({
      id: ref.id || `ref-${idx + 1}`,
      name: ref.name || `Referensi ${idx + 1}`,
      classification: idx === 0 ? 'CHARACTER_REFERENCE' : 'LOCATION_REFERENCE',
      functionDescription: 'Referensi visual pendukung untuk konsistensi video.',
    }));
  }

  // Normalize Master Characters
  if (!Array.isArray(parsedResult.masterCharacters) || parsedResult.masterCharacters.length === 0) {
    if (parsedResult.detection?.hasCharacter !== false) {
      parsedResult.masterCharacters = [
        {
          id: 'char-master-1',
          name: 'Master Character',
          sumberKarakter: references.length > 0 ? 'Referensi Pengguna' : 'Deskripsi Teks',
          visualIdentity: {
            genderPresentation: 'Sesuai konsep cerita',
            ageGroup: 'Karakter utama terdefinisi',
            facialAppearance: 'Fitur wajah simetris dan konsisten',
            facialStructure: 'Struktur wajah terkunci antar scene',
            skinAppearance: 'Natural tone',
            hairstyleOrHijab: 'Rapi dan teratur',
            bodyProportions: 'Proporsional',
            outfitAndColor: 'Pakaian terkurasi rapi',
            visualStyle: effectiveStyle,
          },
          characterSheetPrompt: `Clean professional character reference sheet of the master character showing front, 3/4, side, and facial close-up in neutral lighting. Visual style: ${effectiveStyle}. Character identity lock.`,
        },
      ];
    } else {
      parsedResult.masterCharacters = [];
    }
  }

  // Normalize Master Locations
  if (!Array.isArray(parsedResult.masterLocations) || parsedResult.masterLocations.length === 0) {
    parsedResult.masterLocations = [
      {
        id: 'loc-master-1',
        name: 'MASTER LOCATION 1',
        environmentDetails: {
          locationType: 'Setting utama cerita',
          timeOfDayOrEra: 'Sesuai adegan',
          architecture: 'Arsitektur lingkungan terpadu',
          furnitureAndLayout: 'Tata letak stabil',
          importantElements: 'Latar belakang bersih',
          lightingAndAtmosphere: 'Pencahayaan sinematik',
          visualStyle: effectiveStyle,
        },
        locationLockPrompt: `Clean environment reference of the primary location without human characters. Consistent architectural details, lighting, and layout. Ultra-detailed, ${effectiveStyle}, 8k resolution.`,
      },
    ];
  }

  // Filter out empty props
  if (Array.isArray(parsedResult.masterProps)) {
    parsedResult.masterProps = parsedResult.masterProps.filter(
      (p: any) => p && p.name && p.propPrompt && p.propPrompt.trim().length > 10
    );
    if (parsedResult.masterProps.length === 0) {
      delete parsedResult.masterProps;
    }
  }

  // Clean first/last frame if null or empty
  if (
    !parsedResult.firstFramePrompt ||
    !parsedResult.firstFramePrompt.prompt ||
    parsedResult.firstFramePrompt.prompt === 'null'
  ) {
    delete parsedResult.firstFramePrompt;
  }
  if (
    !parsedResult.lastFramePrompt ||
    !parsedResult.lastFramePrompt.prompt ||
    parsedResult.lastFramePrompt.prompt === 'null'
  ) {
    delete parsedResult.lastFramePrompt;
  }

  // Ensure negative prompt is high standard
  const standardNegative =
    'no different person, no face replacement, no facial morphing, no inconsistent facial features, no changing environment layout, no inconsistent room architecture, no extra limbs, no deformed hands, no floating objects, no flickering, no low quality, no unwanted text or watermarks.';
  if (!parsedResult.negativePrompt || parsedResult.negativePrompt.length < 30) {
    parsedResult.negativePrompt = standardNegative;
  } else if (!parsedResult.negativePrompt.includes('no face replacement')) {
    parsedResult.negativePrompt = `${parsedResult.negativePrompt.trim()}, ${standardNegative}`;
  }

  return {
    ...parsedResult,
    modelUsed: usedModel,
    waktuAnalisis: new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    isAlternative: !!isAlternative,
  };
}
