import { UploadedImage } from '../types';

export function generateCreativeSampleImage(
  title: string,
  badgeText: string,
  subtitle: string,
  bgColor: string,
  badgeBg: string
): UploadedImage {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 640);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 640);

    // Decorative inner frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, 592, 592);

    // Badge
    ctx.fillStyle = badgeBg;
    ctx.beginPath();
    ctx.roundRect(48, 48, 260, 48, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, 178, 79);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 320, 290);

    // Subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '18px sans-serif';
    ctx.fillText(subtitle, 320, 340);

    // Footer Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '14px sans-serif';
    ctx.fillText('ZEO AI Video Studio — Image Reference Anchor', 320, 560);
  }

  const base64 = canvas.toDataURL('image/png');

  return {
    id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: `${title.toLowerCase().replace(/\s+/g, '-')}.png`,
    previewUrl: base64,
    size: 24500,
    mimeType: 'image/png',
    base64: base64,
  };
}

export function getPresetsForVideoType(videoTypeId: string): {
  idea: string;
  characterDesc: string;
  sampleImages: UploadedImage[];
} {
  if (videoTypeId === 'short-drama') {
    return {
      idea: 'Pertemuan tak sengaja dua sahabat lama di sebuah kedai kopi vintage saat hujan deras di sore hari. Konflik rahasia masa lalu terungkap melalui sepucuk surat lama yang terselip di dalam buku.',
      characterDesc: 'Karakter A: Pria muda (26 tahun), jaket denim vintage, tatapan ekspresif. Karakter B: Wanita muda (25 tahun), mantel rajut krem, hijab pashmina rapi.',
      sampleImages: [
        generateCreativeSampleImage('Karakter A & B', 'CHARACTER REFERENCE', 'Sahabat Lama • Casual Vintage', '#4c1d95', '#7c3aed'),
        generateCreativeSampleImage('Kedai Kopi Hujan', 'LOCATION REFERENCE', 'Vintage Coffee Shop • Rain Window', '#1e1b4b', '#4338ca'),
      ],
    };
  }

  if (videoTypeId === 'vlog-ai') {
    return {
      idea: 'Vlog AI jalan-jalan sore menjelajahi gang estetik penuh lentera dan kedai teh tradisional. Karakter berbicara santai membagikan tips eksplorasi sudut kota tersembunyi ke penonton.',
      characterDesc: 'Wanita muda ramah dan periang (24 tahun), gaya kasual sporty dengan hoodie pastel, senyum hangat dan energik.',
      sampleImages: [
        generateCreativeSampleImage('Vlogger AI Rina', 'CHARACTER SHEET', 'Front & 3/4 View • Pastel Hoodie', '#064e3b', '#059669'),
        generateCreativeSampleImage('Gang Lentera Sore', 'LOCATION REFERENCE', 'Old Alley • Lanterns • Golden Hour', '#78350f', '#d97706'),
      ],
    };
  }

  if (videoTypeId === 'teacher-presenter') {
    return {
      idea: 'Guru sains menjelaskan fenomena aurora borealis dan medan magnet bumi dengan penuh semangat, menggunakan papan peraga interaktif di laboratorium modern berpenataan hangat.',
      characterDesc: 'Ibu Guru muda (28 tahun), berkacamata elegan, blazer rapi warna biru navy, hijab pashmina abu-abu terang, wibawa ramah dan artikulatif.',
      sampleImages: [
        generateCreativeSampleImage('Ibu Guru Sarah', 'PRESENTER REFERENCE', 'Formal Navy Blazer • Elegant Eyewear', '#1e3a8a', '#2563eb'),
        generateCreativeSampleImage('Laboratorium Sains', 'LOCATION REFERENCE', 'Modern Classroom • Science Boards', '#134e4a', '#0d9488'),
      ],
    };
  }

  if (videoTypeId === 'character-talk') {
    return {
      idea: 'Seekor kucing oranye bercelemek mini kain tradisional berdiri di samping gerobak cilok, berbicara ramah menawarkan cilok hangat kepada pembeli saat sore hari.',
      characterDesc: 'Kucing oranye (ginger cat) berbulu lebat bersih, celemek kain batik mini, mata bulat ekspresif, ekspresi tersenyum ramah dengan pergerakan mulut berbicara natural.',
      sampleImages: [
        generateCreativeSampleImage('Kucing Penjual Cilok', 'CHARACTER SHEET', 'Front, 3/4 & Side • Mini Apron', '#065f46', '#059669'),
        generateCreativeSampleImage('Gerobak Cilok Sore', 'LOCATION REFERENCE', 'Street Food Cart • Warm Sunset Light', '#78350f', '#d97706'),
      ],
    };
  }

  if (videoTypeId === 'emotional-story') {
    return {
      idea: 'Seorang kakek pengrajin kayu menyelesaikan ukiran meja belajar pertama untuk cucu perempuannya yang akan masuk sekolah. Momen haru saat cucunya berlari memeluk sang kakek di teras bengkel kayu.',
      characterDesc: 'Karakter Utama: Kakek berusia 68 tahun, kemeja flanel pudar, tangan terampil penuh guratan kerja keras, senyum hangat penuh haru. Cucu: Anak perempuan ceria usia 7 tahun berambut kuncir dua.',
      sampleImages: [
        generateCreativeSampleImage('Kakek & Cucu Tercinta', 'CHARACTER REFERENCE', 'Elderly Artisan & Young Granddaughter', '#831843', '#db2777'),
        generateCreativeSampleImage('Bengkel Kayu Hangat', 'LOCATION REFERENCE', 'Artisan Woodshop • Golden Sunbeam', '#7c2d12', '#ea580c'),
      ],
    };
  }

  if (videoTypeId === 'flashback') {
    return {
      idea: 'Perjalanan hidup seorang dokter desa mulai dari masa SD tahun 1995 membaca buku di bawah lampu minyak, masa SMA tahun 2001 mengayuh sepeda tua, hingga kini membuka klinik kesehatan gratis bagi warga.',
      characterDesc: 'Master Character across ages: Dokter Budi dari usia 8 tahun (anak SD), 16 tahun (remaja SMA), hingga 38 tahun (dokter dewasa). Fitur wajah khas: tatapan mata teduh, lesung pipi tipis, senyum tulus yang konsisten.',
      sampleImages: [
        generateCreativeSampleImage('Dokter Budi Across Ages', 'IDENTITY ACROSS AGES', 'Child 1995 → Teen 2001 → Adult Now', '#713f12', '#ca8a04'),
        generateCreativeSampleImage('Klinik Desa Dua Zaman', 'LOCATION REFERENCE', 'Village Clinic • 1995 vs Present Era', '#1e3a8a', '#3b82f6'),
      ],
    };
  }

  if (videoTypeId === 'ai-timelapse') {
    return {
      idea: 'Transformasi bertahap pembangunan rumah tropis modern dua lantai dari tanah kosong berumput liar hingga hunian selesai lengkap dengan taman asri.',
      characterDesc: 'Karakter: Tidak diperlukan untuk konsep ini (Pure architectural landscape timelapse).',
      sampleImages: [
        generateCreativeSampleImage('Start: Tanah Kosong', 'START FRAME REFERENCE', 'Overgrown Wild Grass • Wood Stakes', '#14532d', '#22c55e'),
        generateCreativeSampleImage('End: Rumah Jadi Tropis', 'FINAL FRAME REFERENCE', 'Two-Story Modern Villa • Landscaped Garden', '#1e3a8a', '#0284c7'),
      ],
    };
  }

  if (videoTypeId === 'tiny-world') {
    return {
      idea: 'Kru pekerja miniatur berseragam keselamatan menyeduh secangkir cappuccino raksasa, mengoperasikan derek mini untuk mengangkat balok gula dan tangga tali di bibir cangkir porselen putih.',
      characterDesc: 'Kru pekerja miniatur (tiny workers) berseragam helm keselamatan kuning dan jumpsuit jingga neon, skala mini konsisten terhadap objek makro.',
      sampleImages: [
        generateCreativeSampleImage('Tiny Workers Sheet', 'MINI CHARACTER REFERENCE', 'Micro Human Scale • Orange Uniforms', '#c2410c', '#f97316'),
        generateCreativeSampleImage('Giant Coffee Macro World', 'MACRO LOCATION REFERENCE', 'Oversized Ceramic Cup • Latte Art Surface', '#78350f', '#d97706'),
      ],
    };
  }

  if (videoTypeId === 'asmr-video') {
    return {
      idea: 'Sesi ASMR presisi: memotong balok sabun handmade marmer dengan pisau khusus menghasilkan potongan renyah melengkung, dilanjutkan menuang tetesan minyak aroma mawar ke wadah kaca kristal.',
      characterDesc: 'Hand Reference: Sepasang tangan bersih terawat, kuku natural rapi tanpa cat kuku, mengenakan manset rajut krem lembut tanpa perhiasan yang mengalihkan perhatian.',
      sampleImages: [
        generateCreativeSampleImage('Hand Reference ASMR', 'HAND REFERENCE SHEET', 'Clean Hands • Natural Nails • Wool Sleeve', '#831843', '#db2777'),
        generateCreativeSampleImage('Studio Kayu Minimalis', 'LOCATION REFERENCE', 'Warm Oak Table • Ceramic & Glass Dishes', '#713f12', '#a16207'),
      ],
    };
  }

  if (videoTypeId === 'food-preparation') {
    return {
      idea: 'Langkah lengkap memasak Japanese Beef Curry: memotong kentang dan wortel dadu presisi, menumis daging sapi wagyu berlemak hingga kecokelatan harum, melarutkan saus kari kental, dan menyajikan di atas piring oval beralas nasi putih pulen.',
      characterDesc: 'Hand Reference: Tangan koki terampil memegang pisau santoku Jepang dan spatula kayu dengan apron kain abu-abu gelap.',
      sampleImages: [
        generateCreativeSampleImage('Bahan Segar Kari', 'INGREDIENTS REFERENCE', 'Wagyu Beef, Carrots, Potatoes, Curry Roux', '#7f1d1d', '#dc2626'),
        generateCreativeSampleImage('Dapur Kayu & Kompor', 'MASTER KITCHEN REFERENCE', 'Clean Granite Countertop • Japanese Stove', '#1e293b', '#475569'),
        generateCreativeSampleImage('Final Japanese Curry Plating', 'FINAL DISH HERO FRAME', 'Oval Plate • Steaming Rice & Glossy Curry', '#854d0e', '#eab308'),
      ],
    };
  }

  return {
    idea: 'Eksplorasi visual sinematik dengan kesinambungan karakter dan lingkungan yang terkunci rapi dari awal hingga akhir adegan.',
    characterDesc: 'Karakter utama berpenampilan estetik proporsional dengan busana yang serasi dengan suasana cerita.',
    sampleImages: [
      generateCreativeSampleImage('Karakter Utama', 'MASTER CHARACTER', 'Consistent Identity Turnaround', '#4c1d95', '#7c3aed'),
      generateCreativeSampleImage('Setting Utama', 'MASTER LOCATION', 'Clean Cinematic Environment', '#1e293b', '#3b82f6'),
    ],
  };
}
