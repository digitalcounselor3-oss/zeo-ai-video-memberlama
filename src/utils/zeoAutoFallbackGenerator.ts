import {
  ZeoAutoResult,
  ZeoAutoFormState,
  ZeoAutoImageClassification,
  MasterCharacterItem,
  MasterLocationItem,
  ZeoAutoStoryboardItem,
  SceneImagePromptItem,
  SceneVideoPromptItem,
} from '../creativeTypes';

export function generateZeoAutoFallbackResult(
  formData: ZeoAutoFormState,
  isAlternative: boolean = false
): ZeoAutoResult {
  const idea = formData.videoIdea.trim() || 'Seorang penjelajah menemukan rahasia tersembunyi.';
  const ideaLower = idea.toLowerCase();

  // Detect Primary & Secondary Engine
  let primaryId = 'short-drama';
  let primaryTitle = 'Short Drama';
  let secondaryTitle: string | undefined = 'Cinematic Storytelling';
  let flowType: 'STORY FLOW' | 'PROCESS FLOW' = 'STORY FLOW';

  if (
    ideaLower.includes('dinosaurus') ||
    ideaLower.includes('portal') ||
    ideaLower.includes('masa lalu') ||
    ideaLower.includes('waktu') ||
    ideaLower.includes('flashback') ||
    ideaLower.includes('zaman')
  ) {
    primaryId = 'flashback';
    primaryTitle = 'Flashback / Jelajah Waktu';
    if (ideaLower.includes('guru') || ideaLower.includes('sekolah') || ideaLower.includes('edukasi') || ideaLower.includes('belajar')) {
      secondaryTitle = 'Teacher & Presenter / Educational Adventure';
    } else {
      secondaryTitle = 'Sci-Fi Time Distortion';
    }
  } else if (
    ideaLower.includes('kucing') ||
    ideaLower.includes('hewan') ||
    ideaLower.includes('bicara') ||
    ideaLower.includes('ngomong') ||
    ideaLower.includes('berbicara')
  ) {
    primaryId = 'character-talk';
    primaryTitle = 'Character Talk';
    if (ideaLower.includes('jual') || ideaLower.includes('drama') || ideaLower.includes('makanan')) {
      secondaryTitle = 'Short Drama & Social Comedy';
    } else {
      secondaryTitle = 'Expressive Mascot Animation';
    }
  } else if (ideaLower.includes('timelapse') || ideaLower.includes('tumbuh') || ideaLower.includes('berubah') || ideaLower.includes('proses')) {
    primaryId = 'ai-timelapse';
    primaryTitle = 'AI Timelapse';
    secondaryTitle = 'Evolutionary Sequence';
    flowType = 'PROCESS FLOW';
  } else if (ideaLower.includes('miniatur') || ideaLower.includes('kecil') || ideaLower.includes('tiny')) {
    primaryId = 'tiny-world';
    primaryTitle = 'Tiny World';
    secondaryTitle = 'Macro Cinematic Environment';
    flowType = 'PROCESS FLOW';
  } else if (ideaLower.includes('asmr') || ideaLower.includes('sabun') || ideaLower.includes('suara')) {
    primaryId = 'asmr-video';
    primaryTitle = 'ASMR Video';
    secondaryTitle = 'Tactile Texture Immersion';
    flowType = 'PROCESS FLOW';
  } else if (ideaLower.includes('masak') || ideaLower.includes('makanan') || ideaLower.includes('resep') || ideaLower.includes('food')) {
    primaryId = 'food-preparation';
    primaryTitle = 'Food Preparation';
    secondaryTitle = 'Culinary Artistry';
    flowType = 'PROCESS FLOW';
  } else if (ideaLower.includes('podcast') || ideaLower.includes('interview') || ideaLower.includes('bincang')) {
    primaryId = 'video-podcast';
    primaryTitle = 'Video Podcast';
    secondaryTitle = 'Creator Studio Dynamics';
  } else if (ideaLower.includes('vlog') || ideaLower.includes('jalan') || ideaLower.includes('travel')) {
    primaryId = 'vlog-ai';
    primaryTitle = 'Vlog AI';
    secondaryTitle = 'Dynamic Creator Journal';
  } else if (ideaLower.includes('guru') || ideaLower.includes('presenter') || ideaLower.includes('materi')) {
    primaryId = 'teacher-presenter';
    primaryTitle = 'Teacher & Presenter';
    secondaryTitle = 'Interactive Educational Guide';
  } else if (ideaLower.includes('sejarah') || ideaLower.includes('kerajaan') || ideaLower.includes('abad')) {
    primaryId = 'history-story';
    primaryTitle = 'Cerita Sejarah';
    secondaryTitle = 'Historical Epic Realism';
  } else if (ideaLower.includes('misteri') || ideaLower.includes('fakta') || ideaLower.includes('aneh')) {
    primaryId = 'fact-mystery';
    primaryTitle = 'Fakta Unik & Misteri';
    secondaryTitle = 'Investigative Documentary';
  } else if (ideaLower.includes('sedih') || ideaLower.includes('haru') || ideaLower.includes('ibu') || ideaLower.includes('kakek') || ideaLower.includes('cinta')) {
    primaryId = 'emotional-story';
    primaryTitle = 'Emotional Story';
    secondaryTitle = 'Heartwarming Human Bond';
  }

  // Calculate Scene counts & durations
  const baseSeconds =
    formData.duration === 'Custom' && formData.customDurationSeconds
      ? formData.customDurationSeconds
      : parseInt(formData.duration || '10 detik', 10) || 10;

  let sceneCountNum = 3;
  if (formData.sceneCount === '1') sceneCountNum = 1;
  else if (formData.sceneCount === '2') sceneCountNum = 2;
  else if (formData.sceneCount === '3') sceneCountNum = 3;
  else if (formData.sceneCount === '4') sceneCountNum = 4;
  else if (formData.sceneCount === '5') sceneCountNum = 5;
  else sceneCountNum = baseSeconds <= 10 ? 1 : baseSeconds <= 20 ? 2 : 3;

  let perSceneSeconds = baseSeconds;
  let totalSeconds = baseSeconds * sceneCountNum;

  if (formData.durationScope === 'Total Video') {
    totalSeconds = baseSeconds;
    perSceneSeconds = Math.max(3, Math.round(baseSeconds / sceneCountNum));
  } else {
    perSceneSeconds = baseSeconds;
    totalSeconds = baseSeconds * sceneCountNum;
  }

  const effectiveStyle = formData.visualStyle === 'Otomatis' ? 'Cinematic Realistic' : formData.visualStyle;
  const effectiveAspect = formData.platform.includes('Landscape')
    ? '16:9 landscape'
    : '9:16 vertical';

  // Classify uploaded images safely
  const imageClassifications = formData.references.map((ref, idx) => {
    let cl: ZeoAutoImageClassification = 'OTHER_REFERENCE';
    let desc = 'Visual reference';
    const nameLower = (ref.name || '').toLowerCase();

    if (nameLower.includes('karakter') || nameLower.includes('orang') || nameLower.includes('model') || idx === 0) {
      cl = 'CHARACTER_REFERENCE';
      desc = 'Acuan identitas wajah, postur tubuh, dan karakter utama.';
    } else if (nameLower.includes('sheet')) {
      cl = 'CHARACTER_SHEET';
      desc = 'Acuan turn-around multi-view karakter.';
    } else if (nameLower.includes('lokasi') || nameLower.includes('ruang') || nameLower.includes('latar')) {
      cl = 'LOCATION_REFERENCE';
      desc = 'Acuan arsitektur lingkungan dan pencahayaan latar.';
    } else if (nameLower.includes('baju') || nameLower.includes('outfit')) {
      cl = 'OUTFIT_REFERENCE';
      desc = 'Acuan gaya busana dan palet warna pakaian.';
    } else if (nameLower.includes('makanan') || nameLower.includes('food')) {
      cl = 'FOOD_REFERENCE';
      desc = 'Acuan sajian kuliner dan tekstur bahan.';
    } else if (nameLower.includes('gedung') || nameLower.includes('building')) {
      cl = 'BUILDING_REFERENCE';
      desc = 'Acuan fasad dan skala arsitektur gedung.';
    } else if (nameLower.includes('style') || nameLower.includes('gaya')) {
      cl = 'STYLE_REFERENCE';
      desc = 'Acuan tone warna, estetika seni, dan mood visual.';
    } else {
      cl = 'OBJECT_REFERENCE';
      desc = 'Acuan properti atau objek penting dalam adegan.';
    }

    return {
      id: ref.id,
      name: ref.name || `Gambar ${idx + 1}`,
      classification: cl,
      functionDescription: desc,
    };
  });

  const hasCharacter = !flowType.includes('PROCESS') || ideaLower.includes('guru') || ideaLower.includes('karakter');

  // Master Characters
  const masterCharacters: MasterCharacterItem[] = hasCharacter
    ? [
        {
          id: 'char-auto-1',
          name: 'Master Character',
          sumberKarakter: formData.references.length > 0 ? 'Referensi Pengguna' : 'Deskripsi Teks',
          visualIdentity: {
            genderPresentation: 'Sesuai dengan figur pada ide/referensi',
            ageGroup: 'Karakter utama dengan proporsi seimbang',
            facialAppearance: 'Wajah berkarakter tajam dan ekspresif dengan detail mata yang jelas',
            facialStructure: 'Struktur tulang wajah stabil dan konsisten antar scene',
            skinAppearance: 'Tekstur kulit alami berdefinisi tinggi',
            hairstyleOrHijab: 'Rambut tertata rapi sesuai tema cerita',
            bodyProportions: 'Proporsional dan dinamis',
            outfitAndColor: 'Busana terkurasi selaras dengan nuansa visual video',
            visualStyle: effectiveStyle,
          },
          characterSheetPrompt: `Professional multi-view character reference sheet of the master character showing front view, 3/4 angle, profile side view, and facial close-up expression. Neutral studio lighting, clean minimal background, realistic anatomy. Visual style: ${effectiveStyle}. 8k resolution character lock.`,
        },
      ]
    : [];

  // Master Locations
  const masterLocations: MasterLocationItem[] = [
    {
      id: 'loc-auto-1',
      name: 'MASTER LOCATION 1 — Setting Utama Cerita',
      environmentDetails: {
        locationType: 'Setting utama yang mendukung alur cerita',
        timeOfDayOrEra: 'Waktu dan pencahayaan disesuaikan dengan mood video',
        architecture: 'Tata ruang arsitektur terstruktur dengan kedalaman sinematik',
        furnitureAndLayout: 'Elemen latar belakang teratur dan tidak berubah antar-shot',
        importantElements: 'Latar belakang bersih bebas distorsi visual',
        lightingAndAtmosphere: 'Pencahayaan dramatis natural dengan kontras lembut',
        visualStyle: effectiveStyle,
      },
      locationLockPrompt: `Clean environment reference of the main location without human characters. Exact same architecture, room geometry, lighting angle, and props layout. Cinematic depth, ${effectiveStyle}, photorealistic 8k.`,
    },
  ];

  // Storyboard
  const storyboard: ZeoAutoStoryboardItem[] = [];
  const sceneImagePrompts: SceneImagePromptItem[] = [];
  const sceneVideoPrompts: SceneVideoPromptItem[] = [];

  const cameraAngles = isAlternative
    ? [
        'Dynamic low-angle wide establishing shot with smooth pedestal tracking',
        'Over-the-shoulder intimate reaction shot with subtle rack focus',
        'Dramatic circular camera glide moving toward centered subject hero shot',
        'High-angle perspective capturing environment scale and subject blocking',
        'Cinematic tracking dolly-in focusing on subject emotion and environment',
      ]
    : [
        'Vertical 9:16 eye-level medium establishing shot with gentle slow push-in',
        'Close-up tracking shot moving steadily alongside subject action',
        'Wide cinematic angle capturing subject interaction with background environment',
        'Intimate medium close-up highlighting expression and key visual detail',
        'Hero final composition framing subject at center of frame with calm stabilization',
      ];

  for (let i = 1; i <= sceneCountNum; i++) {
    const cam = cameraAngles[(i - 1) % cameraAngles.length];
    const isFirst = i === 1;
    const isLast = i === sceneCountNum;

    storyboard.push({
      sceneNumber: i,
      duration: `±${perSceneSeconds} detik`,
      location: 'MASTER LOCATION 1',
      character: hasCharacter ? 'Master Character' : undefined,
      visual: isFirst
        ? `Opening Hook: Pengenalan subjek dan situasi awal cerita dengan estetika visual memikat.`
        : isLast
        ? `Resolusi Klimaks: Adegan penutup yang memperkuat pesan inti dan memberikan kesan visual mendalam.`
        : `Eskalasi Narasi: Interaksi dinamis subjek terhadap peristiwa cerita dengan gestur alami.`,
      action: isFirst
        ? `Karakter melangkah masuk ke dalam frame, mengamati sekitar dengan rasa ingin tahu.`
        : isLast
        ? `Karakter menyelesaikan aksinya dan menatap ke arah depan dengan ekspresi percaya diri.`
        : `Karakter melakukan aksi utama yang mendorong jalannya cerita secara realistis.`,
      expression: isFirst
        ? 'Ekspresi penasaran bercampur kagum dengan fokus mata yang hidup'
        : isLast
        ? 'Senyum tenang dan tatapan mantap penuh kepuasan'
        : 'Fokus intens pada momen penting dengan respons mikro natural',
      camera: `${cam} (${effectiveAspect})`,
      dialogueOrVo:
        formData.audio === 'Tanpa Dialog'
          ? undefined
          : isFirst
          ? `“Semuanya bermula dari sini, ketika sebuah rahasia tak terduga terbuka...”`
          : isLast
          ? `“Dan perjalanan ini akhirnya menemukan jawabannya.”`
          : `“Langkah demi langkah membawa kita semakin dekat dengan kebenaran.”`,
      sfx: isFirst ? 'Ambience ruangan sunyi, gesekan langkah halus' : 'Suara dengung misterius, nada instrumen naik',
      transition: isLast ? 'Slow fade out' : 'Smooth match cut / whip pan cinematic',
    });

    sceneImagePrompts.push({
      sceneNumber: i,
      title: `Scene ${i} — Starting Frame Image Prompt (${effectiveAspect})`,
      prompt: `Starting frame photograph for Scene ${i}. Master character framed in Master Location 1. Action: ${
        isFirst ? 'Beginning the journey' : isLast ? 'Final resolved pose' : 'In the middle of the narrative action'
      }. ${cam}. Lighting: Balanced atmospheric lighting with natural highlights. Style: ${effectiveStyle}. Aspect ratio: ${effectiveAspect}. 8k resolution, cinematic color grading.`,
      aspectRatio: effectiveAspect,
    });

    sceneVideoPrompts.push({
      sceneNumber: i,
      title: `Scene ${i} — Video Prompt (AI Video Generator / Flow / Veo)`,
      prompt: `Cinematic AI video generation prompt for Scene ${i}. Use the established character reference sheet as strict identity anchor. Maintain identical facial bone structure, hairstyle, and outfit throughout the shot. Use the established master location reference as environment anchor. ${cam}. Action: The character performs smooth, realistic physical motion. Believable body mechanics, consistent environmental lighting, and natural pacing over ${perSceneSeconds} seconds. Style: ${effectiveStyle}. Aspect ratio: ${effectiveAspect}. 4k photorealistic, stable cinematic motion.`,
    });
  }

  return {
    detection: {
      primaryEngineId: primaryId,
      primaryEngineTitle: primaryTitle,
      secondaryEngineTitle: secondaryTitle,
      flowType: flowType,
      conceptExplanation: `ZEO menganalisis ide cerita Anda dan mendeteksi format "${primaryTitle}" sebagai fondasi utama${
        secondaryTitle ? ` dengan penguatan elemen "${secondaryTitle}"` : ''
      }. Alur disusun dalam ${flowType} untuk menjaga ritme visual yang harmonis.`,
      hasCharacter: hasCharacter,
      hasLocation: true,
      hasImportantProp: false,
      imageClassifications: imageClassifications,
    },
    analisisIde: {
      summary: idea,
      coreTheme: `Eksplorasi visual konsep ${primaryTitle}`,
      visualPlan: `Tone warna sinematik dengan saturasi terkontrol, pencahayaan alami, dan konsistensi gaya ${effectiveStyle} di seluruh ${sceneCountNum} scene.`,
    },
    masterCharacters: masterCharacters,
    masterLocations: masterLocations,
    storyboard: storyboard,
    sceneImagePrompts: sceneImagePrompts,
    sceneVideoPrompts: sceneVideoPrompts,
    dialogVoiceOver: {
      type: formData.audio,
      script: 'Skrip narasi sinematik yang proporsional dengan durasi scene.',
      voiceOver:
        formData.audio !== 'Tanpa Dialog'
          ? `Sebuah perjalanan bermula ketika langkah kaki membawa kita ke tempat yang belum pernah terbayangkan sebelumnya.`
          : null,
      dialogue:
        formData.audio === 'Dialog Karakter' || formData.audio === 'VO + Dialog'
          ? [
              {
                speaker: 'Master Character',
                text: 'Kita sudah sampai di sini... dan tidak ada jalan untuk mundur lagi.',
              },
            ]
          : undefined,
      timingNotes: `Panjang kalimat disesuaikan dengan durasi ±${perSceneSeconds} detik per scene.`,
    },
    sfxAndAmbience: {
      ambientSounds: ['Subtle room ambience', 'Soft wind atmospheric tone', 'Low cinematic sub-drone'],
      soundEffects: ['Footsteps on textured ground', 'Gentle fabric rustle', 'Acoustic reverb resonance'],
      musicMood: 'Cinematic, intriguing, inspiring ambient orchestra',
    },
    negativePrompt:
      'no different person, no face replacement, no facial morphing, no inconsistent facial features, no changing environment layout, no inconsistent room architecture, no extra limbs, no deformed hands, no floating objects, no flickering, no low quality, no unwanted text or watermarks.',
    modelUsed: 'ZEO Smart Engine (Optimized Fallback)',
    waktuAnalisis: new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    isAlternative: isAlternative,
  };
}
