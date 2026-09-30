import {
  CreativeAnalysisResult,
  CreativeVideoTypeMeta,
  CreativeFormState,
  MasterCharacterItem,
  MusicLyricResult,
} from '../creativeTypes';

export function generateCreativeFallbackResult(
  videoType: CreativeVideoTypeMeta,
  formData: CreativeFormState,
  userName: string
): CreativeAnalysisResult {
  const effectiveStyle =
    formData.visualStyle === 'Otomatis' ? 'Cinematic Realistic' : formData.visualStyle;
  const effectiveAspect =
    formData.platform.includes('Landscape') ? '16:9 landscape' : '9:16 vertical';
  const effectiveDuration =
    formData.duration === 'Custom'
      ? `${formData.customDurationSeconds || 20} detik`
      : formData.duration;
  const durationNum = parseInt(effectiveDuration, 10) || 15;

  let sceneCountNum = 1;
  if (formData.sceneCount === '1 Scene') sceneCountNum = 1;
  else if (formData.sceneCount === '2 Scene') sceneCountNum = 2;
  else if (formData.sceneCount === '3 Scene') sceneCountNum = 3;
  else if (formData.sceneCount === '5 Scene') sceneCountNum = 5;
  else sceneCountNum = durationNum <= 10 ? 1 : durationNum <= 20 ? 2 : 3;

  const userIdea = formData.videoIdea.trim() || videoType.defaultPlaceholder.replace(/[“”"]/g, '');

  const charSourceName =
    formData.characterChoice === 'Upload Character Sheet' || formData.references.length > 0
      ? 'Referensi Pengguna'
      : formData.characterChoice === 'Karakter dari Teks'
      ? 'Deskripsi Teks'
      : 'Tanpa Karakter';

  // Master Character Data
  const isNoChar = formData.characterChoice === 'Tanpa Karakter';
  let masterCharacters: MasterCharacterItem[] = [];

  if (!isNoChar) {
    if (videoType.id === 'flashback') {
      // Flashback: Master Identity across ages + Era 1 + Era 2
      masterCharacters = [
        {
          id: 'char-master',
          name: 'Master Character — Core Identity (Across Ages Lock)',
          sumberKarakter: charSourceName as 'Referensi Pengguna' | 'Deskripsi Teks' | 'Tanpa Karakter',
          visualIdentity: {
            genderPresentation: 'Sesuai konsep video & referensi',
            ageGroup: 'Karakter utama dengan garis identitas wajah terstandarisasi',
            facialAppearance: 'Bentuk mata khas, senyum hangat, struktur rahang simetris yang konsisten sepanjang usia',
            facialStructure: 'Proporsi wajah seimbang yang tetap dapat dikenali saat muda maupun dewasa',
            skinAppearance: 'Tekstur kulit natural sesuai usia era bersangkutan',
            hairstyleOrHijab: 'Gaya rambut/hijab yang berevolusi sesuai zamannya namun menjaga siluet personal',
            bodyProportions: 'Proporsi tubuh tumbuh proporsional antar rentang waktu',
            outfitAndColor: 'Gaya busana terkurasi sesuai era zaman tanpa anakronisme modern',
            footwear: 'Alas kaki autentik sesuai dekade/era',
            accessories: 'Barang personal ikonik yang terbawa melintasi waktu',
            visualStyle: effectiveStyle,
          },
          characterSheetPrompt: `Master Character Reference Sheet establishing core facial identity, bone structure, eye shape, and smile across all ages. Turn-around sheet (front, 3/4, side, facial close-up) in neutral studio light. Visual style: ${effectiveStyle}. 8k resolution character identity lock.`,
        },
        {
          id: 'char-era1',
          name: 'Character — Era 1 (Masa Lalu / Masa Kecil-Remaja)',
          sumberKarakter: 'Deskripsi Teks',
          visualIdentity: {
            genderPresentation: 'Sesuai karakter utama masa kecil / era terdahulu',
            ageGroup: 'Anak-anak / Remaja di era masa lalu',
            facialAppearance: 'Wajah muda polos dengan bentuk mata dan senyum khas yang sama dengan Master Character',
            facialStructure: 'Wajah muda yang konsisten dengan struktur rahang masa dewasa',
            skinAppearance: 'Kulit muda segar natural',
            hairstyleOrHijab: 'Gaya rambut era masa lalu autentik',
            bodyProportions: 'Proporsi tubuh muda',
            outfitAndColor: 'Seragam sekolah / pakaian kasual era 1990-an/2000-an',
            footwear: 'Sepatu era klasik masa lalu',
            accessories: 'Tas sekolah klasik / barang kenangan',
            visualStyle: effectiveStyle,
          },
          characterSheetPrompt: `Character reference sheet of the younger version of the Master Character. Maintain identical eye shape, subtle facial landmarks, and smile. Authentic vintage/retro attire, clean studio neutral background, front and side views. Visual style: ${effectiveStyle}.`,
        },
        {
          id: 'char-era2',
          name: 'Character — Era 2 (Masa Sekarang / Masa Dewasa)',
          sumberKarakter: 'Deskripsi Teks',
          visualIdentity: {
            genderPresentation: 'Sesuai karakter utama masa dewasa',
            ageGroup: 'Dewasa matang masa kini',
            facialAppearance: 'Wajah dewasa dengan tatapan mata bijak yang identik dengan versi masa mudanya',
            facialStructure: 'Struktur rahang terdefinisi selaras dengan identitas dasar',
            skinAppearance: 'Tekstur kulit dewasa terawat natural',
            hairstyleOrHijab: 'Gaya rambut modern masa kini',
            bodyProportions: 'Proporsi dewasa proporsional',
            outfitAndColor: 'Pakaian kasual elegan kontemporer',
            footwear: 'Sepatu modern',
            accessories: 'Jam tangan modern / aksesoris minimalis',
            visualStyle: effectiveStyle,
          },
          characterSheetPrompt: `Character reference sheet of the adult modern version of the Master Character. Maintain identical eye shape, bone structure, and smile as the younger counterpart. Front, 3/4, and side views. Visual style: ${effectiveStyle}.`,
        },
      ];
    } else if (videoType.id === 'character-talk') {
      const ctype = formData.characterTypeChoice || 'Karakter Ekspresif';
      masterCharacters = [
        {
          id: 'char-1',
          name: `Master Character — ${ctype} Berbicara`,
          sumberKarakter: charSourceName as 'Referensi Pengguna' | 'Deskripsi Teks' | 'Tanpa Karakter',
          visualIdentity: {
            genderPresentation: `${ctype} dengan kepribadian kuat dan ekspresif`,
            ageGroup: 'Karakter ikonik bersuara natural',
            facialAppearance: 'Mata berbinar ekspresif, mulut artikulatif dengan rentang ekspresi berbicara natural/stylized',
            facialStructure: 'Bentuk kepala simetris, fitur wajah jelas dan konsisten di setiap sudut pandang',
            skinAppearance: ctype === 'Hewan' ? 'Bulu terawat rapi dengan pola warna konsisten' : ctype === 'Robot' ? 'Permukaan logam bersih dengan aksen lampu LED halus' : 'Tekstur material konsisten berkualitas tinggi',
            hairstyleOrHijab: ctype === 'Manusia' ? 'Gaya rambut rapi terdefinisi' : 'Fitur permukaan khas karakter',
            bodyProportions: 'Proporsi tubuh khas dan seimbang, mendukung gestur berbicara yang dinamis',
            outfitAndColor: 'Desain visual kontras dan menarik perhatian di platform video',
            footwear: 'Menyesuaikan konsep karakter',
            accessories: 'Aksen mikrofon mini atau ornamen karakter unik',
            visualStyle: effectiveStyle,
          },
          characterSheetPrompt: `Professional character model sheet of the exact same ${ctype} character shown consistently across multiple views: front view, 3/4 view, side view, and facial mouth expression chart (talking, smiling, surprised). Clean studio backdrop, even soft lighting, unobstructed view. Maintain identical proportions, colors, fur texture/materials, and eye design across all views. Visual style: ${effectiveStyle}. 8k resolution turn-around sheet.`,
        },
      ];
    } else if (videoType.id === 'ai-timelapse') {
      // Timelapse typically does not require human character
      if (formData.characterChoice === 'Tanpa Karakter' || !formData.characterChoice) {
        masterCharacters = [];
      } else {
        masterCharacters = [
          {
            id: 'char-builder',
            name: 'Master Craftsman / Worker Reference',
            sumberKarakter: 'Deskripsi Teks',
            visualIdentity: {
              genderPresentation: 'Pekerja profesional',
              ageGroup: 'Dewasa terampil',
              facialAppearance: 'Fokus pada pekerjaan, wajah natural',
              facialStructure: 'Proporsional',
              skinAppearance: 'Tekstur pekerja lapangan',
              hairstyleOrHijab: 'Helm pengaman / topi kerja',
              bodyProportions: 'Proporsional',
              outfitAndColor: 'Rompi safety high-visibility dan celana kerja kokoh',
              footwear: 'Safety boots',
              accessories: 'Sabuk perkakas konstruksi',
              visualStyle: effectiveStyle,
            },
            characterSheetPrompt: `Character reference sheet of a construction/landscape craftsman in safety gear, front and side views, neutral studio backdrop. Style: ${effectiveStyle}.`,
          },
        ];
      }
    } else if (videoType.id === 'tiny-world') {
      const scaleLabel = formData.tinyWorldScale || 'Miniature';
      masterCharacters = [
        {
          id: 'char-tiny-worker',
          name: `Mini Character Reference (${scaleLabel} Scale)`,
          sumberKarakter: charSourceName as 'Referensi Pengguna' | 'Deskripsi Teks' | 'Tanpa Karakter',
          visualIdentity: {
            genderPresentation: 'Pekerja miniatur mikro dengan proporsi realistis',
            ageGroup: 'Figur mungil detail tinggi',
            facialAppearance: 'Wajah miniatur realistis dengan ekspresi fokus bekerja',
            facialStructure: 'Proporsi tubuh skala 1:87 (HO scale) atau 1:12 terstandarisasi',
            skinAppearance: 'Material cat halus seperti diorama miniatur kolektor profesional',
            hairstyleOrHijab: 'Helm pekerja mikro atau topi fedora mungil',
            bodyProportions: 'Sangat kecil dibandingkan objek lingkungan makro di sekitarnya',
            outfitAndColor: 'Pakaian pekerja mikro berwarna kontras (oranye/biru navy/kuning) agar terlihat jelas',
            footwear: 'Sepatu boot mikro detail tinggi',
            accessories: 'Peralatan mikro (sekop mini, katrol mini, kuas kecil, tali temali)',
            visualStyle: effectiveStyle,
          },
          characterSheetPrompt: `Diorama miniature figure model reference sheet in ${scaleLabel} scale. Highly detailed miniature artisan worker with tiny hand tools. Clean studio background with a tiny scale reference coin. Macro focus, razor-sharp details, tilt-shift miniature realism. Visual style: ${effectiveStyle}.`,
        },
      ];
    } else if (videoType.id === 'asmr-video') {
      const isHandOnly = (formData.asmrSubject || 'Tangan Saja') === 'Tangan Saja';
      if (isHandOnly) {
        masterCharacters = [
          {
            id: 'char-asmr-hand',
            name: 'Master Hand Reference (Tangan Saja — ASMR Lock)',
            sumberKarakter: 'Deskripsi Teks',
            visualIdentity: {
              genderPresentation: 'Sepasang tangan terawat bersih',
              ageGroup: 'Dewasa muda dengan gerak jari luwes',
              facialAppearance: 'TIDAK MENAMPILKAN WAJAH — fokus hanya pada pergelangan dan jari tangan',
              facialStructure: 'Jari-jari proporsional, anatomi 5 jari sempurna per tangan',
              skinAppearance: 'Kulit bersih, lembab natural, kuku pendek terawat tanpa cat kuku mencolok',
              hairstyleOrHijab: 'Tidak relevan (area kepala di luar frame)',
              bodyProportions: 'Kedua tangan berukuran proporsional natural',
              outfitAndColor: 'Lengan baju kain linen rajut warna krem hangat di pergelangan tangan',
              footwear: 'Tidak relevan',
              accessories: 'Tanpa cincin atau perhiasan berisik agar audio SFX tetap murni',
              visualStyle: effectiveStyle,
            },
            characterSheetPrompt: `Reference sheet of a pair of elegant, perfectly proportioned human hands with clean trimmed nails, natural skin texture, and soft linen cuff sleeves. No rings or loud accessories. Shown in gentle resting pose and object-gripping pose. Neutral warm wooden backdrop. Style: ${effectiveStyle}. 8k resolution.`,
          },
        ];
      } else {
        masterCharacters = [
          {
            id: 'char-asmr-creator',
            name: 'Master ASMR Creator',
            sumberKarakter: charSourceName as 'Referensi Pengguna' | 'Deskripsi Teks' | 'Tanpa Karakter',
            visualIdentity: {
              genderPresentation: 'Pencipta konten ASMR berwajah tenang dan ramah',
              ageGroup: 'Dewasa muda (22-28 tahun)',
              facialAppearance: 'Ekspresi damai, mata rileks, senyum hangat menenangkan',
              facialStructure: 'Simetris lembut',
              skinAppearance: 'Tekstur kulit natural lembut',
              hairstyleOrHijab: 'Rambut rapi terikat atau hijab minimalis bernuansa earth-tone',
              bodyProportions: 'Proporsional',
              outfitAndColor: 'Pakaian knitwear hangat bernuansa sage green atau beige',
              footwear: 'Kasual santai',
              accessories: 'Mikrofon binaural ASMR profesional di meja',
              visualStyle: effectiveStyle,
            },
            characterSheetPrompt: `Character reference sheet of an ASMR creator seated at a calm acoustic wooden studio desk. Serene expression, soft knitwear outfit. Front, 3/4, and side views. Visual style: ${effectiveStyle}.`,
          },
        ];
      }
    } else if (videoType.id === 'food-preparation') {
      const personMode = formData.foodPersonMode || 'Tangan Saja';
      if (personMode === 'Tangan Saja' || personMode === 'Tanpa Orang') {
        masterCharacters = [
          {
            id: 'char-chef-hand',
            name: 'Master Chef Hand Reference (Culinary Lock)',
            sumberKarakter: 'Deskripsi Teks',
            visualIdentity: {
              genderPresentation: 'Sepasang tangan chef terampil dan higienis',
              ageGroup: 'Tangan juru masak cekatan',
              facialAppearance: 'TIDAK MENAMPILKAN WAJAH — fokus pada teknik tangan di atas talenan/wajan',
              facialStructure: 'Anatomi tangan kokoh dan stabil saat memegang pisau',
              skinAppearance: 'Kulit bersih, higienis, kuku pendek terawat tanpa cat kuku',
              hairstyleOrHijab: 'Tidak relevan',
              bodyProportions: 'Tangan proporsional dengan cengkeraman pisau presisi (claw grip)',
              outfitAndColor: 'Lengan baju chef jacket hitam bergaris putih digulung rapi',
              footwear: 'Tidak relevan',
              accessories: 'Tanpa cincin atau gelang untuk standar sanitasi kuliner',
              visualStyle: effectiveStyle,
            },
            characterSheetPrompt: `Culinary reference sheet of professional chef hands performing precision cuts with a Japanese chef knife on an oiled end-grain cutting board. Rolled black chef sleeves, clean manicured fingers, accurate chef knife grip. Visual style: ${effectiveStyle}.`,
          },
        ];
      } else {
        masterCharacters = [
          {
            id: 'char-chef',
            name: 'Master Chef / Food Stylist',
            sumberKarakter: charSourceName as 'Referensi Pengguna' | 'Deskripsi Teks' | 'Tanpa Karakter',
            visualIdentity: {
              genderPresentation: 'Koki profesional berpenampilan bersih dan ramah',
              ageGroup: 'Chef berusia 28-35 tahun',
              facialAppearance: 'Fokus, teliti, tersenyum bangga saat masakan matang',
              facialStructure: 'Rahang tegas, berwibawa di dapur',
              skinAppearance: 'Kulit sehat natural',
              hairstyleOrHijab: 'Rambut rapi di balik chef cap atau bandana dapur',
              bodyProportions: 'Tegap proporsional',
              outfitAndColor: 'Chef jacket linen premium warna abu-abu gelap dengan celemek kulit cokelat',
              footwear: 'Sepatu dapur antiselip',
              accessories: 'Pin koki minimalis',
              visualStyle: effectiveStyle,
            },
            characterSheetPrompt: `Professional chef character model sheet standing in a modern open kitchen. Clean front view, 3/4 angle, and action cooking view. Crisp chef uniform, leather apron. Visual style: ${effectiveStyle}.`,
          },
        ];
      }
    } else if (videoType.id === 'teacher-presenter') {
      const pMode = formData.presentationMode || 'Hologram';
      const isHolo = pMode === 'Hologram';
      masterCharacters = [
        {
          id: 'char-presenter-master',
          name: `Master Presenter Reference (${pMode} Mode Lock)`,
          sumberKarakter: charSourceName as 'Referensi Pengguna' | 'Deskripsi Teks' | 'Tanpa Karakter',
          visualIdentity: {
            genderPresentation: formData.targetUser || 'Presenter / Edukator Profesional',
            ageGroup: 'Dewasa muda berwibawa (26-32 tahun)',
            facialAppearance: isHolo
              ? 'Wajah tersusun dari partikel cahaya digital biru transparan, tatapan cerdas, ekspresi artikulatif'
              : 'Wajah ramah, artikulatif, kontak mata percaya diri ke arah kamera',
            facialStructure: 'Simetris, proporsional, tegas dan mudah dikenali',
            skinAppearance: isHolo
              ? 'Glowing semi-transparent holographic skin texture dengan aksen partikel cyan bercahaya'
              : 'Tekstur kulit natural bersih pencahayaan studio siaran',
            hairstyleOrHijab: formData.characterDescription?.includes('hijab')
              ? 'Hijab rapi beraksen garis neon tipis'
              : 'Gaya rambut rapi profesional',
            bodyProportions: 'Tegap, gestur tangan terbuka dan edukatif',
            outfitAndColor: isHolo
              ? 'Busana profesional digital transparan dengan rim light cyan dan proyeksi neon'
              : 'Blazer rapi atau pakaian formal-kasual modern',
            footwear: 'Sesuai gaya studio modern',
            accessories: isHolo ? 'Headset komunikasi futuristik tipis' : 'Mikrofon lavalier elegan',
            visualStyle: effectiveStyle,
          },
          characterSheetPrompt: isHolo
            ? `Turn-around character sheet of a professional educator as a semi-transparent blue digital hologram. Front view, 3/4 view, side view, and expressive facial view. Emitting subtle volumetric cyan glow, floating neon HUD data widgets beside face, projection ring pedestal on floor. High-tech particle stream. Style: ${effectiveStyle}. 8k resolution character consistency lock.`
            : `Professional presenter model sheet across front, 3/4, side, and talking expression views. Crisp formal attire, approachable confident demeanour, clean studio backdrop. Style: ${effectiveStyle}. 8k resolution character consistency lock.`,
        },
      ];
    } else {
      // Short Drama, Vlog AI, Emotional Story, etc.
      masterCharacters = [
        {
          id: 'char-1',
          name: `Master Character — Tokoh Utama (${videoType.title})`,
          sumberKarakter: charSourceName as 'Referensi Pengguna' | 'Deskripsi Teks' | 'Tanpa Karakter',
          visualIdentity: {
            genderPresentation: 'Sesuai konsep video & referensi',
            ageGroup: videoType.id === 'emotional-story' ? 'Karakter utama dengan ekspresi emosional mendalam' : 'Dewasa muda / profesional (24-30 tahun)',
            facialAppearance: videoType.id === 'emotional-story' ? 'Ekspresif, mata jernih berkaca-kaca penuh ketulusan, senyum samar haru' : 'Ekspresif, ramah, hangat, proporsional, tatapan mata hidup',
            facialStructure: 'Simetris natural, rahang lembut terdefinisi',
            skinAppearance: 'Tekstur kulit natural dengan pori-pori halus tanpa efek plastik',
            hairstyleOrHijab: formData.characterDescription?.includes('hijab')
              ? 'Hijab modern rapi elegan'
              : 'Gaya rambut terawat natural sesuai suasana adegan',
            bodyProportions: 'Proporsi tubuh atletis / kasual seimbang',
            outfitAndColor: 'Pakaian kasual elegan bernuansa warna selaras dengan konsep cerita',
            footwear: 'Alas kaki kasual rapi',
            accessories: 'Aksesoris minimalis fungsional sesuai peran',
            visualStyle: effectiveStyle,
          },
          characterSheetPrompt: `Create a clean professional character reference sheet of the exact same character shown consistently across all views (front view, 3/4 view, side view, and close-up facial view). Neutral standing pose, clean studio background, even soft lighting, unobstructed face, full outfit visible, consistent proportions. Maintain identical facial features, hairstyle or hijab, body proportions, outfit, accessories, and visual identity. No character variation between views. Visual style: ${effectiveStyle}. 8k resolution, photorealistic character turn-around sheet.`,
        },
      ];
    }
  }

  // Master Location Data
  const masterLocations = [
    {
      id: 'loc-1',
      name: `MASTER LOCATION 1 — Setting Utama ${videoType.title}`,
      environmentDetails: {
        locationType: `Ruang utama pendukung cerita (${videoType.title})`,
        timeOfDayOrEra: 'Pencahayaan siang hari lembut (golden soft diffused ambient light)',
        architecture: 'Tata ruang modern minimalis dengan aksen estetik natural',
        furnitureAndLayout: 'Penyusunan perabot proporsional, sudut kamera lapang dan berkedalaman',
        importantElements: 'Jendela berlatar lembut, pencahayaan bergradasi halus',
        lightingAndAtmosphere: 'Sinematik, bersih, nyaman, dan berfokus pada subjek',
        visualStyle: effectiveStyle,
      },
      locationLockPrompt: `A clean empty environment reference of the main location for ${videoType.title} with NO human characters present. Wide cinematic perspective showcasing detailed architectural elements, background depth, natural ambient lighting, textures, and furniture layout. Maintain the exact same environment layout, architecture, furniture placement, lighting direction, and major background elements. Ultra-detailed, ${effectiveStyle}, cinematic composition, 8k resolution, photorealistic textures.`,
    },
  ];

  // Master Prop (if applicable)
  const masterProps = [
    {
      id: 'prop-1',
      name: `Properti Utama Pendukung (${videoType.title})`,
      significance: 'Elemen fisik kunci untuk kontinuitas aksi karakter dan alur cerita.',
      propPrompt: `Clean studio macro still photograph of the key prop object for ${videoType.title}. High texture fidelity, studio soft lighting, plain background, ultra-detailed 8k render, style: ${effectiveStyle}.`,
    },
  ];

  // Storyboard Generation
  const storyboard = [];
  const sceneImagePrompts = [];
  const sceneVideoPrompts = [];

  const timePerScene = Math.floor(durationNum / sceneCountNum);

  for (let i = 1; i <= sceneCountNum; i++) {
    const startSec = (i - 1) * timePerScene;
    const endSec = i === sceneCountNum ? durationNum : i * timePerScene;
    const label = `Scene ${i} — ${startSec}–${endSec} detik (${i === 1 ? 'Opening & Hook' : i === sceneCountNum ? 'Klimaks & Penutup' : 'Perkembangan Aksi'})`;

    storyboard.push({
      sceneNumber: i,
      durationLabel: label,
      visual: `Visual Scene ${i}: Suasana ${masterLocations[0].name} dengan interaksi ${isNoChar ? 'kamera dan lingkungan' : 'Master Character'}.`,
      action: `Karakter melakukan aksi: ${i === 1 ? 'Membuka cerita dengan ekspresi menarik perhatian' : i === 2 ? 'Melanjutkan alur utama cerita secara mendalam' : 'Menyelesaikan aksi dengan pose penutup yang berkesan'}.`,
      camera: `${effectiveAspect} angle medium shot dengan pergerakan kamera sinematik stabil.`,
      transition: i === sceneCountNum ? 'Smooth fade out' : 'Match cut dinamis',
      characterInvolved: isNoChar ? 'Tanpa Karakter' : 'Master Character',
      locationUsed: masterLocations[0].name,
    });

    sceneImagePrompts.push({
      sceneNumber: i,
      title: `Scene ${i} — Image Prompt (Starting Frame)`,
      prompt: `Starting frame reference still for Scene ${i}. Featuring ${isNoChar ? 'the primary scene composition' : 'the Master Character'} inside ${masterLocations[0].name}. Clean lighting, crisp focus, expressive pose, detailed atmosphere. Camera angle: ${i === 1 ? 'eye-level medium shot' : i === 2 ? 'dynamic medium close-up' : 'wide cinematic hero framing'}. Aspect ratio: ${effectiveAspect}. Visual style: ${effectiveStyle}. Ultra-high detail, professional cinematography render.`,
      aspectRatio: effectiveAspect,
    });

    let specificVideoPrompt = `Cinematic AI video generation prompt for Scene ${i}. Use the established character reference sheet as the strict identity anchor and the established location reference as the environment anchor. Starting from Scene ${i} initial frame: ${isNoChar ? 'smooth visual exploration of the setting' : 'character performs natural purposeful movements with expressive emotion'}. Slow stable camera motion, steady focus tracking, cinematic lighting, ${effectiveAspect} aspect ratio. Style: ${effectiveStyle}. Smooth pacing, 24fps motion, no character deformation, seamless video render.`;

    if (videoType.id === 'character-talk') {
      specificVideoPrompt = `Cinematic AI video generation prompt for Scene ${i}. Use the established Character Reference Sheet as the strict identity anchor. Accurate Indonesian dialogue synchronization with natural mouth movement appropriate to the character. Starting from Scene ${i} initial frame: character speaks expressively directly toward camera with believable head movement, lively eye focus, natural body gestures, and engaging emotional pauses. Smooth camera tracking, soft studio illumination, ${effectiveAspect} aspect ratio. Style: ${effectiveStyle}. High-fidelity speech lip-sync, seamless animation.`;
    } else if (videoType.id === 'emotional-story') {
      specificVideoPrompt = `Intimate cinematic AI video generation prompt for Scene ${i}. Strict Character Sheet identity anchor and Master Location anchor. Scene ${i} captures intimate human emotion with micro-expression control: subtle smile, gentle eye contact, restrained breath, authentic emotional depth. Camera: slow cinematic push-in medium close-up, shallow depth of field, tender warm diffused lighting, ${effectiveAspect} aspect ratio. Style: ${effectiveStyle}. Nuanced acting without melodrama, poignant visual storytelling.`;
    } else if (videoType.id === 'flashback') {
      const trans = formData.timeTransition || 'Match Cut';
      specificVideoPrompt = `Cinematic time-travel / flashback video generation prompt for Scene ${i}. Strict adherence to Master Character Identity Across Ages and Era Accuracy. Scene ${i} features ${trans} visual transition bridging time periods. Character displays recognizable consistent facial structure and eye shape. Environment reflects authentic period aesthetics without modern anachronisms. Slow purposeful camera glide, atmospheric lighting, ${effectiveAspect} aspect ratio. Style: ${effectiveStyle}. Seamless timeline continuity.`;
    } else if (videoType.id === 'teacher-presenter') {
      const pMode = formData.presentationMode || 'Hologram';
      const topicText = formData.topicContent || userIdea;
      if (pMode === 'Hologram') {
        specificVideoPrompt = `Scene ${i} video generation prompt in master Hologram presentation mode: floating holographic interface, volumetric blue projection, transparent digital body of educator, neon HUD data panels hovering in 3D space, slow orbit camera, glowing digital particles. The presenter gestures articulately explaining "${topicText}". Cinematic push-in tracking, high-tech projection ring base, dark cybernetic background, ${effectiveAspect} aspect ratio. Style: ${effectiveStyle}. Seamless 24fps motion lock.`;
      } else if (pMode === 'Whiteboard') {
        specificVideoPrompt = `Scene ${i} video generation prompt in master Whiteboard presentation mode: whiteboard explanation, marker animation, clean classroom, hand-drawn effect, engaging tutor pointing at educational diagrams on whiteboard illustrating "${topicText}". Hand gestures follow natural teaching rhythm, vibrant marker doodles pop up dynamically, crisp studio illumination, ${effectiveAspect} aspect ratio. Style: ${effectiveStyle}.`;
      } else if (pMode === 'Apple Event') {
        specificVideoPrompt = `Scene ${i} video generation prompt in master Apple Event keynote mode: minimalist black auditorium stage, dramatic keynote spotlight on presenter, giant curved presentation screen in pitch black background displaying sleek typography for "${topicText}". Apple event keynote style, sleek premium aesthetic, slow majestic push-in camera, ${effectiveAspect} aspect ratio. Style: ${effectiveStyle}.`;
      } else if (pMode === 'Iron Man JARVIS') {
        specificVideoPrompt = `Scene ${i} video generation prompt in master JARVIS Tech mode: Stark tech JARVIS HUD, floating red and blue holographic interface, rotating holographic rings manipulated by presenter hand gestures, volumetric sci-fi glow. Presenter rotates 3D wireframe models representing "${topicText}", dynamic whip-pan, ${effectiveAspect} aspect ratio. Style: ${effectiveStyle}.`;
      } else if (pMode === 'Medical Laboratory') {
        specificVideoPrompt = `Scene ${i} video generation prompt in master Medical Laboratory mode: clinical medical laboratory, floating 3D holographic anatomy, rotating transparent organ model displaying "${topicText}", surgical clean lighting, medical doctor presenter gesturing with medical precision, smooth macro orbit camera, ${effectiveAspect} aspect ratio. Style: ${effectiveStyle}.`;
      } else {
        specificVideoPrompt = `Scene ${i} video generation prompt in master ${pMode} presentation mode: professional presenter explaining "${topicText}" with natural hand gestures and strong camera eye-contact. Authentic setting with dedicated graphics and backdrop for ${pMode}. Smooth camera movement, flattering lighting, ${effectiveAspect} aspect ratio. Style: ${effectiveStyle}. 24fps seamless flow.`;
      }
    }

    sceneVideoPrompts.push({
      sceneNumber: i,
      title: `Scene ${i} — Video Prompt (AI Video Generator)`,
      prompt: specificVideoPrompt,
    });
  }

  // Voice Over & Dialogue
  const hasVO = formData.audio.includes('Voice Over') || formData.audio.includes('VO');
  const hasDialogue = formData.audio.includes('Dialog');

  const dialogVoiceOver = {
    type: formData.audio,
    script: hasVO
      ? `[Voice Over]: "${userIdea}. Cerita ini membawa kita menyelami setiap momen secara nyata dan berkesan."`
      : null,
    voiceOver: hasVO
      ? `"${userIdea}. Pengalaman visual yang menginspirasi dari awal hingga akhir."`
      : null,
    dialogue: hasDialogue
      ? [
          { speaker: 'Karakter Utama', text: `Halo semuanya, selamat datang di perjalanan visual ${videoType.title} kita hari ini.` },
          { speaker: 'Respon / Narasi', text: 'Setiap detil membawa cerita yang mendalam dan penuh makna.' },
        ]
      : [],
    timingNotes: `Sinkronisasi narasi disesuaikan dengan durasi total ${effectiveDuration}.`,
  };

  // SFX & Ambience
  const sfxAndAmbience = {
    ambientSounds: [
      'Room room tone ambient yang hangat dan jernih',
      'Suasana latar sinematik bertekstur lembut',
    ],
    soundEffects: [
      'Foley gerakan kain pakaian dan langkah kaki natural',
      'Subtle swoosh saat transisi shot kamera',
    ],
    musicMood: `Musik latar instrumental ${effectiveStyle.toLowerCase()} yang selaras dengan tema ${videoType.title}.`,
  };

  // Negative Prompt tailored per preset
  let negativePrompt =
    'no different person, no face replacement, no facial morphing, no hairstyle inconsistency, no distorted face, no extra limbs, no deformed hands, no floating objects, no changing environment layout, no inconsistent room architecture, no flickering, no low quality, no unwanted text, watermark, signature, blurry background artifacts.';

  if (videoType.id === 'character-talk') {
    negativePrompt =
      'no character redesign, no inconsistent fur or pattern, no random accessories, no unnatural mouth deformation, no duplicate character, no face replacement, no facial morphing, no distorted anatomy, no flickering, no low quality, no unwanted text, watermark.';
  } else if (videoType.id === 'emotional-story') {
    negativePrompt =
      'no exaggerated facial deformation, no random crying, no identity changes, no unnatural expression transition, no face morphing, no distorted face, no extra limbs, no deformed hands, no floating objects, no changing environment layout, no flickering, no low quality, no unwanted text, watermark.';
  } else if (videoType.id === 'flashback') {
    negativePrompt =
      'no identity replacement between ages, no inconsistent facial identity, no incorrect era objects, no random modern objects in historical scenes, no unintended outfit changes, no face morphing, no extra limbs, no deformed hands, no floating objects, no flickering, no low quality, no unwanted text, watermark.';
  }

  let foodPrepData: any = undefined;
  if (videoType.id === 'food-preparation') {
    const rawIngs = (formData as any).confirmedIngredients || ['Wortel', 'Telur', 'Bawang bombai', 'Sayuran hijau', 'Alpukat', 'Cabai'];
    const rawActs = (formData as any).selectedActivities || ['Grocery / Unpacking', 'Sorting', 'Washing', 'Food Preparation', 'Storage / Restock'];
    negativePrompt =
      'wrong ingredients, ingredient duplication, ingredient morphing, food changing type, extra hands, extra fingers, deformed hands, floating objects, object teleportation, knife deformation, unsafe cutting motion, container morphing, kitchen changing layout, flickering, unrealistic physics, random text, watermark.';

    foodPrepData = {
      photoAnalysis: `Foto menampilkan kumpulan bahan belanjaan segar di atas meja dapur bersih, mencakup ${rawIngs.join(', ')}.`,
      detectedIngredients: rawIngs,
      selectedActivities: rawActs,
      conceptSummary: `Alur food preparation estetik dan higienis yang terstruktur dengan urutan ${rawActs.join(' → ')}, menjaga kontinuitas fisik bahan secara realistis.`,
      ingredientStateMap: rawIngs.map((ing: string) => ({
        ingredient: ing,
        statesPerScene: [
          { sceneNumber: 1, state: 'Kondisi awal utuh di dalam kantong/meja belanjaan' },
          { sceneNumber: 2, state: 'Dikelompokkan sesuai kategori pada nampan kayu' },
          { sceneNumber: 3, state: 'Dibersihkan / disiapkan higienis' },
          { sceneNumber: 4, state: 'Masuk ke wadah penyimpanan kaca kedap udara' },
        ],
      })),
      processBoard: [
        {
          sceneNumber: 1,
          activity: rawActs[0] || 'Grocery / Unpacking',
          ingredient: rawIngs.slice(0, 3).join(', '),
          startState: 'Bahan masih tersusun di dalam paper bag belanjaan di meja kayu',
          action: 'Sepasang tangan bersih membuka kantong belanja dan menata bahan satu per satu',
          endState: 'Bahan tersusun rapi di atas permukaan meja dapur',
          camera: 'Top-down 45-degree angle, steady macro shot',
          handAction: 'Tangan dengan kuku bersih dan lengan baju digulung memindahkan bahan dengan lembut',
          asmrSfx: 'Crisp paper bag rustle, soft wooden contact thud',
          continuity: 'Pencahayaan alami dan posisi meja kayu dipertahankan untuk scene berikutnya',
        },
        {
          sceneNumber: 2,
          activity: rawActs[1] || 'Sorting',
          ingredient: rawIngs.join(', '),
          startState: 'Bahan berada di atas meja',
          action: 'Mengelompokkan sayur, telur, dan bumbu ke dalam wadah dan partisi terpisah',
          endState: 'Semua bahan terkelompok rapi sesuai kategori',
          camera: 'Eye-level medium close-up, shallow depth of field',
          handAction: 'Jari-jari menyortir bahan secara teliti dan menempatkan pada nampan terpisah',
          asmrSfx: 'Vegetables touching wooden surface, soft container click',
          continuity: 'Kelompok bahan tetap konsisten tanpa ada bahan yang hilang atau bertambah',
        },
        {
          sceneNumber: 3,
          activity: rawActs[2] || 'Washing / Preparation',
          ingredient: rawIngs[0] || 'Sayuran segar',
          startState: 'Bahan yang aman dicuci disiapkan di dekat bak cuci keramik',
          action: 'Membasuh perlahan di bawah aliran air lembut lalu meniriskan di atas kain lap',
          endState: 'Bahan bersih segar dengan butiran air halus di permukaannya',
          camera: 'Close-up side angle, crisp water droplet macro',
          handAction: 'Tangan membasuh permukaan bahan dengan gerakan memutar lembut',
          asmrSfx: 'Gentle running water flow, droplet splash, crisp texture sound',
          continuity: 'Hanya mencuci bahan yang sesuai, bahan kering tetap di area meja terpisah',
        },
        {
          sceneNumber: 4,
          activity: rawActs[rawActs.length - 1] || 'Storage / Restock',
          ingredient: 'Semua bahan tertata',
          startState: 'Bahan bersih siap masuk wadah penyimpanan kaca transparan',
          action: 'Menutup wadah kedap udara dengan bunyi klik rapat dan menatanya ke rak kulkas',
          endState: 'Kulkas atau pantry tertata rapi sempurna (aesthetic fridge restock)',
          camera: 'Wide smooth push-in shot ke arah kulkas yang terbuka rapi',
          handAction: 'Menaruh wadah secara presisi ke dalam rak dan menutup pintu kulkas',
          asmrSfx: 'Airtight container snap lid click, refrigerator glass shelf slide',
          continuity: 'Semua bahan awal tersimpan lengkap dengan identitas visual yang sama',
        },
      ],
      imagePrompts: [
        {
          title: 'Reference Frame: Ingredients Overview & Setup',
          aspectRatio: formData.platform?.includes('Landscape') ? '16:9' : '9:16',
          prompt: `Top-down aesthetic food preparation setup. Fresh groceries (${rawIngs.join(', ')}) arranged beautifully on a clean Scandinavian oak wood countertop. Soft natural window morning light, organic shadows, shallow depth of field, ultra-detailed textures. Style: ${effectiveStyle}.`,
          notes: 'Hero frame untuk menjaga keselarasan bahan, warna, dan pencahayaan dapur',
        },
      ],
      videoPrompts: [
        {
          sceneNumber: 1,
          title: `Scene 1: ${rawActs[0] || 'Unpacking Fresh Groceries'}`,
          prompt: `Cinematic food preparation video. [INGREDIENT REFERENCE: fresh ${rawIngs.join(', ')}]. [LOCATION: clean Scandinavian wooden kitchen counter, morning sunlight]. [STARTING STATE: ingredients in brown paper grocery bag on counter]. [HAND / CHARACTER: clean manicured hands, sleeves rolled up, no face shown]. [ACTION: hands gently take out ingredients and place them on wooden table]. [PHYSICAL INTERACTION: realistic weight, soft touch]. [CAMERA: 45-degree angle, macro close-up, steady]. [LIGHTING: warm morning daylight, soft shadows]. [ASMR: crisp paper bag rustle, soft wooden contact]. [ENDING STATE: ingredients arranged in neat groups]. [CONTINUITY: maintain exact ingredient count and kitchen layout into next scene]. Style: ${effectiveStyle}.`,
        },
      ],
      asmrPlan: [
        {
          activity: 'Grocery & Sorting',
          sfxSounds: ['Paper bag rustling', 'Gentle placement on wood', 'Produce container touch'],
          ambientText: 'Calm morning kitchen room tone, quiet ambient atmosphere',
        },
        {
          activity: 'Storage & Restock',
          sfxSounds: ['Airtight container lid snap', 'Glass jar shelf contact', 'Smooth fridge drawer glide'],
          ambientText: 'Satisfying crisp acoustic clicks with minimal room echo',
        },
      ],
      finalShot: {
        title: 'Final Hero Shot: Perfectly Restocked & Organized Storage',
        description: 'Tampilan akhir kulkas tersusun rapi dengan wadah bening dan label minimalis',
        prompt: `Eye-level cinematic hero shot of perfectly organized modern refrigerator interior filled with clear glass containers, labeled produce, and fresh ingredients (${rawIngs.join(', ')}). Pristine clean aesthetic, soft interior LED glow, 8k resolution. Style: ${effectiveStyle}.`,
      },
      negativePrompt:
        'wrong ingredients, ingredient duplication, ingredient morphing, food changing type, extra hands, extra fingers, deformed hands, floating objects, object teleportation, knife deformation, unsafe cutting motion, container morphing, kitchen changing layout, flickering, unrealistic physics, random text, watermark.',
    };
  }

  let musicLyricData: MusicLyricResult | undefined = undefined;

  if (videoType.id === 'lyric-visual') {
    const rawData = formData as any;
    const sourceType = rawData.musicSourceType || 'lirik';
    const videoMode = rawData.musicVideoType || 'Animated Music Video';
    const mood = rawData.musicMood || 'Haru';
    const genre = rawData.musicGenre || 'Acoustic / Pop';
    const theme = rawData.musicTheme || 'Perjalanan Hidup & Memori Kasih';
    const story =
      rawData.musicStoryIdea ||
      'Kisah perjalanan emosional seorang tokoh menyusuri jejak kenangan hangat, menghadapi kerinduan yang mendalam, hingga menemukan kelegaan, harapan baru, dan penerimaan tulus.';
    const userLyrics =
      rawData.musicLyrics ||
      `Kala senja perlahan turun menyapa bayangmu
Menyimpan kenangan di antara detak waktu
Meski langkah terasa berat mengarungi rindu
Ada seberkas cahaya menuntun langkahku
Bersama derai angin kubisikkan doa
Bahwa kasih dan cinta takkan pernah sirna
Di ujung jalan kita kan saling menyapa
Dalam damai abadi, selamanya...`;

    // Dynamic scene count based on duration & scene duration
    let durSec = 60;
    const durStr = rawData.musicDuration || formData.duration || '60 detik';
    if (durStr.includes('30')) durSec = 30;
    else if (durStr.includes('60')) durSec = 60;
    else if (durStr.includes('2')) durSec = 120;
    else if (durStr.includes('3')) durSec = 180;
    else if (durStr.includes('5')) durSec = 300;

    let sceneSec = 10;
    const sceneDurStr = rawData.musicSceneDuration || '10 detik';
    if (sceneDurStr.includes('5')) sceneSec = 5;
    else if (sceneDurStr.includes('8')) sceneSec = 8;
    else if (sceneDurStr.includes('10')) sceneSec = 10;
    else if (sceneDurStr.includes('15')) sceneSec = 15;

    const totalScenes = Math.max(3, Math.min(12, Math.round(durSec / sceneSec) || 6));
    const aspectStr = formData.platform?.includes('Landscape') ? '16:9' : '9:16';

    const sectionNames = [
      'INTRO',
      'VERSE 1',
      'PRE-CHORUS',
      'CHORUS',
      'VERSE 2 / BRIDGE',
      'FINAL CHORUS / OUTRO',
      'OUTRO EXTENDED',
      'FINAL RESOLUTION',
    ];

    const lyricsLines = userLyrics.split('\n').filter((l: string) => l.trim().length > 0);

    const scenes: any[] = [];
    const imagePrompts: any[] = [];
    const videoPrompts: any[] = [];
    const transitionItems: any[] = [];
    const overlayItems: any[] = [];

    const visualMotifs = [
      {
        idea: 'Siluet tokoh memandang jendela berembun saat senja temaram',
        approach: 'EMOTIONAL',
        action: 'Tokoh menyentuh kaca jendela yang dingin saat tetesan air hujan mengalir perlahan',
        cam: 'Slow cinematic push-in dari medium shot ke close-up wajah reflektif',
        trans: 'Match Cut',
        loc: 'LOCATION A — Kamar Loteng Berselimut Senja',
      },
      {
        idea: 'Membuka buku album tua berisi foto-foto kenangan masa kecil yang hangat',
        approach: 'LITERAL & SYMBOLIC',
        action: 'Jari membelai lembut lembaran foto usang, debu keemasan menari ditiup angin jendela',
        cam: 'Top-down macro angle dengan shallow depth of field fokus pada foto',
        trans: 'Dissolve Fade',
        loc: 'LOCATION A — Kamar Loteng Berselimut Senja',
      },
      {
        idea: 'Melangkah keluar menyusuri jalanan kota berkabut dengan lampu jalan berpendar hangat',
        approach: 'EMOTIONAL',
        action: 'Tokoh berjalan perlahan mengenakan syal hangat, mengamati pantulan lampu di jalan basah',
        cam: 'Low-angle tracking shot mengikuti langkah kaki secara ritmis',
        trans: 'Whip Pan',
        loc: 'LOCATION B — Jalan Setapak Tepi Danau Berembun',
      },
      {
        idea: 'Angin kencang menerbangkan dedaunan kering keemasan seiring klimaks melodi lagu',
        approach: 'SYMBOLIC (CLIMAX)',
        action: 'Tokoh menatap ke atas langit luas saat cahaya keemasan fajar mulai merekah menembus awan',
        cam: 'Dynamic upward orbital pedestal shot mengelilingi karakter',
        trans: 'Light Flash / Beat Cut',
        loc: 'LOCATION B — Tepi Danau Berembun',
      },
      {
        idea: 'Momen hening penerimaan batin di dermaga kayu memandang danau tenang berbias fajar',
        approach: 'EMOTIONAL',
        action: 'Tokoh tersenyum tipis dengan mata berkaca-kaca haru, menghela napas lega dan damai',
        cam: 'Eye-level intimate close-up menangkap ekspresi mikro haru yang tulus',
        trans: 'Memory Fade',
        loc: 'LOCATION B — Tepi Danau Berembun',
      },
      {
        idea: 'Matahari terbit sempurna menyinari cakrawala baru penuh harapan dan kehangatan abadi',
        approach: 'LITERAL & SYMBOLIC',
        action: 'Tokoh melangkah mantap menuju ujung dermaga memandang bentang alam luas bersinar terang',
        cam: 'Slow majestic pull-back drone/wide shot memperlihatkan keindahan lanskap utuh',
        trans: 'Slow Fade to Light',
        loc: 'LOCATION B — Tepi Danau Berembun',
      },
    ];

    for (let i = 0; i < totalScenes; i++) {
      const sceneNum = i + 1;
      const motif = visualMotifs[i % visualMotifs.length];
      const section = sectionNames[Math.min(i, sectionNames.length - 1)];
      const lyricLine = lyricsLines[i % lyricsLines.length] || `Bait lirik musik bagian ${section}`;

      scenes.push({
        sceneNumber: sceneNum,
        songSection: section,
        lyricCue: lyricLine,
        duration: `${sceneSec} detik`,
        location: motif.loc,
        character: videoMode === 'Music Visualizer' ? 'Tanpa Karakter (Visual Abstrak Sinematik)' : 'Tokoh Utama (Master Character)',
        visualIdea: `[${motif.approach}] ${motif.idea}`,
        emotion: mood,
        action: motif.action,
        camera: motif.cam,
        transition: motif.trans,
        textLyricDisplay: `Teks lirik "${lyricLine}" ditampilkan di bagian bawah tengah layar dengan animasi fade-in lembut.`,
        continuity: `Mempertahankan pakaian karakter, palet warna pencahayaan hangat, dan gaya visual ${effectiveStyle}.`,
      });

      imagePrompts.push({
        sceneNumber: sceneNum,
        title: `Scene ${sceneNum} — Keyframe Starting Visual`,
        aspectRatio: aspectStr,
        prompt: `Cinematic starting keyframe image for music video Scene ${sceneNum}. [SUBJECT: Character from Master Reference]. [LOCATION: ${motif.loc}]. [POSE & ACTION: ${motif.action}]. [COMPOSITION: ${motif.cam}]. [LIGHTING: Emotional atmosphere, soft ambient glow, natural cinematic contrast]. Visual Style: ${effectiveStyle}. Aspect Ratio: ${aspectStr}. Ultra-detailed, photorealistic textures, 8k resolution.`,
      });

      videoPrompts.push({
        sceneNumber: sceneNum,
        title: `Scene ${sceneNum} — Video / Animation Prompt`,
        prompt: `Cinematic AI video generation prompt for Scene ${sceneNum}. [REFERENCE: Anchor to Scene ${sceneNum} Keyframe]. [ENVIRONMENT: ${motif.loc}]. [STARTING STATE: ${motif.idea}]. [MOVEMENT & ACTION: ${motif.action} with believable realistic physics]. [FACIAL EXPRESSION: Genuine emotion of ${mood}, subtle breathing, micro-expressions]. [CAMERA MOVEMENT: ${motif.cam}]. [ENVIRONMENTAL MOTION: Gentle breeze stirring hair and cloth, soft ambient particles]. [LIGHTING: Warm golden hour shifting naturally]. [ENDING STATE: Smooth transition into ${motif.trans}]. Style: ${effectiveStyle}. Aspect Ratio: ${aspectStr}.`,
        singerLockNotes: videoMode === 'Character Singing' ? 'SINGER LOCK ACTIVE: Natural lip movement, breathing rhythm, expressive singing gestures, identical facial features and hairstyle.' : undefined,
      });

      if (sceneNum < totalScenes) {
        transitionItems.push({
          fromScene: sceneNum,
          toScene: sceneNum + 1,
          transitionType: motif.trans,
          motionDescription: `Transisi ritmis dari Scene ${sceneNum} ke Scene ${sceneNum + 1} menggunakan teknik ${motif.trans} yang selaras dengan birama musik.`,
        });
      }

      overlayItems.push({
        sceneNumber: sceneNum,
        timestampCue: `00:${String((sceneNum - 1) * sceneSec).padStart(2, '0')} - 00:${String(sceneNum * sceneSec).padStart(2, '0')}`,
        text: lyricLine,
        position: 'Bottom-Center (Margin 15% dari batas bawah)',
        animation: 'Smooth Fade In & Subtle Floating Drift',
        entry: '0.5s Soft Gaussian Fade',
        exit: '0.4s Dissolve ke bait berikutnya',
        fontMood: 'Minimalist Sans / Serene Serif bernuansa hangat dan mudah dibaca',
      });
    }

    musicLyricData = {
      musicLyricAnalysis: {
        sourceType: sourceType as any,
        theme,
        mood,
        genre,
        story,
        emotionalProgression: 'Awal hening dan melankolis → timbul percikan memori indah → gelombang emosi memuncak haru → kelegaan dan harapan baru di akhir lagu.',
        symbolsAndMetaphors: [
          'Jendela berembun membiaskan tetes hujan (kerinduan & refleksi batin)',
          'Album foto tua berdebu cahaya (kenangan masa lalu yang abadi)',
          'Lampu jalan temaram di jalan basah (perjalanan sunyi mencari kedamaian)',
          'Cahaya fajar menyinari ufuk danau (harapan baru, kelegaan, dan cinta sejati)',
        ],
        charactersIdentified: [
          'Tokoh Utama (Sosok berbusana hangat dengan tatapan ekspresif dan tulus)',
          'Sosok Memori (Bayangan kenangan dalam foto dan refleksi batin)',
        ],
        locationsIdentified: [
          'LOCATION A — Kamar Loteng Berselimut Senja',
          'LOCATION B — Tepi Danau Berembun Saat Fajar',
        ],
        songLyrics: userLyrics,
      },
      conceptSummary: `Konsep ${videoMode} memadukan visual ${effectiveStyle} dengan interpretasi lirik bertingkat (Literal, Emotional, dan Symbolic). Menghasilkan visualisasi ${totalScenes} scene yang selaras dengan struktur melodi dan ketukan emosi lagu.`,
      masterVisualStyle: effectiveStyle,
      masterCharacters: [
        {
          id: 'char-1',
          name: 'Master Character — Tokoh Utama',
          sumberKarakter: formData.references?.length > 0 ? 'Referensi Pengguna' : 'Deskripsi Teks',
          visualIdentity: {
            genderPresentation: 'Karakter utama video musik',
            ageGroup: 'Muda dewasa',
            facialAppearance: 'Ekspresif, hangat, memancarkan tatapan emosional yang tulus',
            facialStructure: 'Proporsional dan konsisten di setiap sudut pandang',
            skinAppearance: 'Tekstur halus natural dengan pencahayaan hangat',
            hairstyleOrHijab: 'Rapi bersahaja mengikuti gaya visual terpilih',
            bodyProportions: 'Proporsi alami seimbang',
            outfitAndColor: 'Busana kasual hangat bernuansa earthy tones (beige, warm grey, deep navy)',
            footwear: 'Sepatu kanvas / santai',
            accessories: 'Syal tipis atau liontin sederhana',
            visualStyle: effectiveStyle,
          },
          characterSheetPrompt: `Clean professional character reference sheet of the exact same character shown consistently across all views: front view, 3/4 view, profile side view, full body standing pose, and facial expression close-up. Identical facial features, hair, outfit, accessories. Neutral standing pose, clean minimalist studio background, soft even studio lighting. No character variation between views. Style: ${effectiveStyle}, ultra-detailed, 8k resolution.`,
        },
      ],
      masterLocations: [
        {
          id: 'loc-1',
          name: 'LOCATION A — Kamar Loteng Berselimut Senja',
          environmentDetails: {
            locationType: 'Interior kamar loteng kayu',
            timeOfDayOrEra: 'Golden hour sunset',
            architecture: 'Vintage cozy attic with wooden floor & angled window',
            furnitureAndLayout: 'Meja tulis kayu kecil, cangkir teh hangat, jendela besar memandang atap kota',
            importantElements: 'Debu cahaya menari di udara, tirai tipis berkibar lembut',
            lightingAndAtmosphere: 'Pencahayaan hangat keemasan, suasana tenang dan reflektif',
            visualStyle: effectiveStyle,
          },
          locationLockPrompt: `A clean cinematic environment reference of a cozy vintage wooden attic room. Large angled skylight window overlooking city rooftops during golden hour sunset, empty rustic wooden desk with warm lamp, sheer curtains fluttering softly. No characters, clean architecture layout, photorealistic lighting, 8k resolution. Style: ${effectiveStyle}.`,
        },
        {
          id: 'loc-2',
          name: 'LOCATION B — Tepi Danau / Bukit Cakrawala Fajar',
          environmentDetails: {
            locationType: 'Landscape alam terbuka',
            timeOfDayOrEra: 'Early dawn sunrise',
            architecture: 'Dermaga kayu tua di tepi danau berembun tenang',
            furnitureAndLayout: 'Bangku kayu panjang memandang air tenang bercermin langit',
            importantElements: 'Kabut tipis melayang, dedaunan pinus berembun',
            lightingAndAtmosphere: 'Cahaya fajar pastel lembut (pink lavender to amber gold)',
            visualStyle: effectiveStyle,
          },
          locationLockPrompt: `A clean atmospheric landscape reference of a calm misty lake dock at early sunrise. Serene still water reflecting soft pastel pink and golden dawn light, empty wooden bench, pine trees in gentle mist. No characters, pristine composition, wide angle, 8k resolution. Style: ${effectiveStyle}.`,
        },
      ],
      songStructure: [
        { section: 'INTRO', title: 'Intro Suasana', timingOrCue: `00:00 - 00:${String(sceneSec).padStart(2, '0')}`, description: 'Membangun suasana visual hening dan memperkenalkan lingkungan cerita' },
        { section: 'VERSE 1', title: 'Bait Pertama', timingOrCue: `00:${String(sceneSec).padStart(2, '0')} - 00:${String(sceneSec * 2).padStart(2, '0')}`, description: 'Pengenalan karakter utama dan perasaan awal yang diungkapkan dalam lagu' },
        { section: 'PRE-CHORUS', title: 'Transisi Emosi', timingOrCue: `00:${String(sceneSec * 2).padStart(2, '0')} - 00:${String(sceneSec * 3).padStart(2, '0')}`, description: 'Eskalasi emosional, pergerakan karakter mencari jawaban atau makna' },
        { section: 'CHORUS', title: 'Puncak Lagu (Reff)', timingOrCue: `00:${String(sceneSec * 3).padStart(2, '0')} - 00:${String(sceneSec * 4).padStart(2, '0')}`, description: 'Klimaks visual dinamis, pencahayaan dramatis, resonansi tema lirik terbesar' },
        { section: 'VERSE 2 / BRIDGE', title: 'Jembatan Renungan', timingOrCue: `00:${String(sceneSec * 4).padStart(2, '0')} - 00:${String(sceneSec * 5).padStart(2, '0')}`, description: 'Kontemplasi batin, penerimaan, dan transformasi emosi tokoh' },
        { section: 'FINAL CHORUS / OUTRO', title: 'Puncak Resolusi & Penutup', timingOrCue: `00:${String(sceneSec * 5).padStart(2, '0')} - 00:${String(durSec).padStart(2, '0')}`, description: 'Kelegaan penuh harapan, visual fajar merekah, dan ending shot yang berkesan' },
      ],
      storyboard: scenes,
      sceneImagePrompts: imagePrompts,
      sceneVideoPrompts: videoPrompts,
      transitionPlan: transitionItems,
      lyricOverlayPlan: overlayItems,
      audioSfxNotes: {
        musicStyle: `${genre} dengan tempo mengalir lembut dan nuansa emosional ${mood}.`,
        sfxLayers: [
          'Suara tetes air hujan halus di kaca jendela (intro)',
          'Gemersik lembaran kertas album foto tua',
          'Langkah kaki perlahan di atas jalan basah',
          'Desir angin senja menyapu dedaunan',
          'Suasana hening dan kicau burung fajar yang damai (ending)',
        ],
        vocalNotes: videoMode === 'Character Singing' ? 'Vokal jernih dengan artikulasi lembut, tarikan napas natural di antara bait lirik.' : undefined,
      },
      finalShot: {
        title: 'Final Shot: Cakrawala Fajar Penuh Harapan',
        prompt: `Cinematic wide-angle final hero shot of the character standing peacefully on a wooden lake dock, gazing into a breathtaking golden sunrise breaking through misty lavender clouds. Golden light reflecting across still water, gentle breeze, serene and emotionally uplifting resolution. Style: ${effectiveStyle}, 8k resolution.`,
        description: 'Penutup visual yang memberikan rasa damai mendalam dan meninggalkan kesan haru yang abadi.',
      },
      negativePrompt:
        'character identity change, face morphing, outfit inconsistency, location inconsistency, extra limbs, bad hands, duplicate character, flickering, background morphing, object teleportation, random text, unreadable generated typography, watermark, unmotivated camera motion, style inconsistency.',
    };
  }

  return {
    analisisCerita: {
      premis: `Konsep video ${videoType.title} berfokus pada: ${userIdea}`,
      tema: `${videoType.category} — ${videoType.title}`,
      alurRingkas: `Mulai dari pengenalan konsep di Scene 1, pengembangan isi dan emosi di scene berikutnya, hingga klimaks penutup yang memikat.`,
      emosiSuasana: 'Inspiratif, terstruktur, sinematik, dan fokus pada kontinuitas visual.',
      emotionalArc:
        videoType.id === 'emotional-story'
          ? 'SETUP: Pengenalan tokoh dan kehangatan situasi → EMOTIONAL TRIGGER: Peristiwa yang menggetarkan hati → REACTION: Refleksi mendalam & ekspresi mikro haru → RESOLUTION: Kelegaan, pelukan tulus, dan makna mendalam.'
          : undefined,
      timeTransitionUsed: videoType.id === 'flashback' ? formData.timeTransition || 'Match Cut / Memory Fade' : undefined,
      characterTypeIdentified: videoType.id === 'character-talk' ? formData.characterTypeChoice || 'Hewan / Benda / Karakter' : undefined,
      gayaVisualTerkunci: effectiveStyle,
    },
    masterCharacters,
    masterLocations,
    masterProps,
    storyboard,
    sceneImagePrompts,
    sceneVideoPrompts,
    dialogVoiceOver,
    sfxAndAmbience,
    negativePrompt,
    foodPrepData,
    musicLyricData,
    modelUsed: 'ZEO Creative Engine v2.0',
    waktuAnalisis: new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}
