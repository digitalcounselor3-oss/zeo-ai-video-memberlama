import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { processCreativeVideoAnalysis } from './server/creativeEngine';
import { processZeoAutoAnalysis } from './server/zeoAutoEngine';

const app = express();
const PORT = 3000;

// Set payload limit for multi-image base64 uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialization for Gemini client supporting optional user custom key and server-side secret
let defaultAiClient: GoogleGenAI | null = null;
function getAI(customApiKey?: string): GoogleGenAI {
  const cleanKey = typeof customApiKey === 'string' ? customApiKey.trim() : '';
  if (cleanKey) {
    return new GoogleGenAI({
      apiKey: cleanKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  if (!defaultAiClient) {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSy_fallback_key';
    defaultAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return defaultAiClient;
}

// Helpers for Video Concept, Prompt, VO, and Negative Prompt
function buildDefaultNegativePrompt(
  category: string,
  _productName: string,
  hasHumanCharacter: boolean = false,
  isCharacterLocked: boolean = false
): string {
  let catSpecific = '';
  const upperCat = (category || '').toUpperCase();
  if (upperCat.includes('FASHION') || upperCat.includes('BAJU') || upperCat.includes('PAKAIAN')) {
    catSpecific = ' No changing garment pattern, no changing dress or shirt length, no fabric texture morphing, no altered sleeve cut or neckline, no distorted stitching.';
  } else if (upperCat.includes('SHOE') || upperCat.includes('SEPATU') || upperCat.includes('FOOTWEAR')) {
    catSpecific = ' No changing shoe silhouette, no mismatched pair, no altered sole or outsole design, no deformed heels, no morphing shoelaces.';
  } else if (upperCat.includes('BAG') || upperCat.includes('TAS')) {
    catSpecific = ' No changing bag silhouette, no altered strap length or design, no morphing zippers, buckles, or metallic hardware.';
  } else if (upperCat.includes('BEAUTY') || upperCat.includes('SKINCARE') || upperCat.includes('KOSMETIK')) {
    catSpecific = ' No changing bottle, pump, tube, or jar shape, no altered label typography or placement, no unrealistic skin pore smoothing, no artificial liquid textures.';
  } else if (upperCat.includes('FOOD') || upperCat.includes('BEVERAGE') || upperCat.includes('MAKANAN') || upperCat.includes('MINUMAN')) {
    catSpecific = ' No unnatural food textures, no morphing packaging, no distorted cans or bottles, no floating food particles.';
  } else if (upperCat.includes('ELECTRO') || upperCat.includes('GADGET') || upperCat.includes('KITCHEN')) {
    catSpecific = ' No changing button placement, no altering screen or display proportions, no distorted hardware chassis, no misaligned seams.';
  }

  let humanSpecific = '';
  if (isCharacterLocked) {
    humanSpecific =
      ' no different person, no identity change, no face replacement, no face morphing, no inconsistent facial features, no hairstyle changes, no hijab changes unless requested, no body-shape changes, no age changes, no gender changes, no duplicated character, no extra person unless requested, no extra limbs, no extra fingers, no deformed hands.';
  } else if (hasHumanCharacter) {
    humanSpecific =
      ' no face morphing, no identity change, no different person, no inconsistent facial features, no body morphing, no extra limbs, no extra fingers, no deformed hands.';
  }

  return `Do not change the product design. Do not change product color. Do not change patterns or logos. Do not create additional products. Do not distort the product. No floating objects, no inconsistent packaging, no unreadable or invented branding, no flickering, no sudden jump cuts or scene changes.${catSpecific}${humanSpecific ? ' ' + humanSpecific.trim() : ''}`;
}

function normalizeKonsepVideo(
  rawKonsep: any,
  durationStr: string,
  sceneCountStr: string,
  _productCategory: string,
  productName: string,
  hasModel: boolean,
  style: string
) {
  const durationNum = parseInt(durationStr, 10) || 10;
  let targetCount = 1;
  if (sceneCountStr === '1 Scene') {
    targetCount = 1;
  } else if (sceneCountStr === '2 Scene') {
    targetCount = 2;
  } else if (sceneCountStr === '3 Scene') {
    targetCount = 3;
  } else {
    targetCount = durationNum <= 10 ? 1 : durationNum <= 20 ? 2 : 3;
  }

  const rawScenes = Array.isArray(rawKonsep?.scenes) ? rawKonsep.scenes : [];
  const scenes: any[] = [];

  if (targetCount === 1) {
    const raw = rawScenes[0] || {};
    scenes.push({
      sceneNumber: 1,
      durationLabel: `Scene 1 — 0–${durationNum} detik (Continuous Shot)`,
      visual: raw.visual || (hasModel 
        ? `Model berpenampilan natural di setting modern yang bersih, memegang dan memperlihatkan ${productName} secara jelas dan proporsional.`
        : `Tampilan close-up dinamis produk ${productName} dengan pencahayaan studio terarah dan latar bersih minimalis.`),
      action: raw.action || (hasModel
        ? `Model melakukan gerakan lembut memperlihatkan produk ke arah kamera, menonjolkan fitur dan detail visual tanpa gerakan terburu-buru.`
        : `Kamera bergerak perlahan mengitari produk dengan rotasi halus, memperlihatkan tekstur dan detail fisik produk secara realistis.`),
      camera: raw.camera || `Vertical 9:16 framing, medium close-up shot dengan gerakan slow push-in yang halus, menjaga produk tetap di safe area layar.`,
      productFocus: raw.productFocus || `Detail fisik, warna asli, tekstur material, dan bentuk asli produk ${productName} sesuai referensi visual.`,
      transition: 'Continuous seamless shot tanpa pergantian scene',
    });
  } else if (targetCount === 2) {
    const half = Math.floor(durationNum / 2);
    const raw1 = rawScenes[0] || {};
    scenes.push({
      sceneNumber: 1,
      durationLabel: `Scene 1 — 0–${half} detik (Hook Visual)`,
      visual: raw1.visual || (hasModel 
        ? `Opening shot memikat: Model memperlihatkan ${productName} ke arah kamera dengan ekspresi ramah dan percaya diri.`
        : `Opening hero shot: Produk ${productName} disorot dari sudut eye-level dengan lighting dramatis dan latar bersih.`),
      action: raw1.action || (hasModel
        ? `Model mengangkat atau memakai produk, memberikan impresi visual pertama yang memikat audiens dalam detik pertama.`
        : `Produk diputar perlahan menonjolkan siluet dan warna dominan produk secara memikat.`),
      camera: raw1.camera || `Medium shot 9:16 vertikal, kamera perlahan mendekat (subtle push-in).`,
      productFocus: raw1.productFocus || `Tampilan keseluruhan dan daya tarik visual utama ${productName}.`,
      transition: raw1.transition || 'Smooth match cut ke demonstrasi detail',
    });

    const raw2 = rawScenes[1] || {};
    scenes.push({
      sceneNumber: 2,
      durationLabel: `Scene 2 — ${half}–${durationNum} detik (Detail & Call to Action)`,
      visual: raw2.visual || (hasModel
        ? `Close-up shot fokus pada interaksi tangan model dengan produk ${productName}, memperlihatkan kualitas pengerjaan dan detail bahan.`
        : `Macro close-up shot menonjolkan detail tekstur, logo, dan material ${productName} dengan pencahayaan lembut.`),
      action: raw2.action || (hasModel
        ? `Model memperlihatkan detail produk dari dekat, lalu pose hero penutup sambil tersenyum ke arah audiens.`
        : `Produk berada pada posisi hero shot stabil di tengah frame 9:16 yang siap konversi.`),
      camera: raw2.camera || `Close-up shot 9:16 vertikal, slow panning halus dengan fokus tajam pada produk.`,
      productFocus: raw2.productFocus || `Detail tekstur, logo, dan finishing produk ${productName}.`,
      transition: 'Ending hero freeze shot',
    });
  } else {
    const s1 = Math.round(durationNum * 0.3);
    const s2 = Math.round(durationNum * 0.7);

    const raw1 = rawScenes[0] || {};
    scenes.push({
      sceneNumber: 1,
      durationLabel: `Scene 1 — 0–${s1} detik (Hook Visual)`,
      visual: raw1.visual || (hasModel
        ? `Model membuka video dengan pose percaya diri mengenakan atau memegang ${productName}.`
        : `Hero opening shot ${productName} dengan estetika visual tinggi.`),
      action: raw1.action || `Aksi langsung memancing perhatian audiens dalam detik-detik awal video.`,
      camera: raw1.camera || `Vertical 9:16 eye-level medium shot.`,
      productFocus: raw1.productFocus || `Tampilan awal produk ${productName}.`,
      transition: raw1.transition || 'Quick whip-pan atau smooth cut',
    });

    const raw2 = rawScenes[1] || {};
    scenes.push({
      sceneNumber: 2,
      durationLabel: `Scene 2 — ${s1}–${s2} detik (Demonstrasi Fitur)`,
      visual: raw2.visual || (hasModel
        ? `Model mendemonstrasikan penggunaan atau kenyamanan produk ${productName} dari dekat.`
        : `Kamera menyorot fungsi dan detail material produk ${productName}.`),
      action: raw2.action || `Gerakan spesifik memperlihatkan keunggulan produk secara realistis.`,
      camera: raw2.camera || `Close-up shot dengan pergerakan tracking halus.`,
      productFocus: raw2.productFocus || `Tekstur, material, dan detail pengerjaan produk.`,
      transition: raw2.transition || 'Smooth tracking cut',
    });

    const raw3 = rawScenes[2] || {};
    scenes.push({
      sceneNumber: 3,
      durationLabel: `Scene 3 — ${s2}–${durationNum} detik (Hero Shot & CTA)`,
      visual: raw3.visual || (hasModel
        ? `Model berpose di frame akhir dengan senyum natural, mengarahkan audiens ke produk.`
        : `Final hero display produk ${productName} terpusat sempurna di safe area.`),
      action: raw3.action || `Hero pose tenang dan stabil sebagai penutup video.`,
      camera: raw3.camera || `Slight pull-out shot 9:16 vertikal.`,
      productFocus: raw3.productFocus || `Full product presentation ${productName}.`,
      transition: 'Ending frame',
    });
  }

  return {
    totalScenes: scenes.length,
    totalDuration: `${durationNum} detik`,
    scenes,
  };
}

function normalizeVoiceOverTeks(
  rawVO: any,
  audioOption: string,
  durationStr: string,
  productName: string
) {
  if (audioOption === 'Tanpa VO') {
    return {
      tipe: audioOption,
      voiceOver: null,
      teksVideo: null,
    };
  }

  const durationNum = parseInt(durationStr, 10) || 10;
  let vo = typeof rawVO?.voiceOver === 'string' && rawVO.voiceOver.trim().length > 0
    ? rawVO.voiceOver.trim()
    : null;
  let texts = Array.isArray(rawVO?.teksVideo) && rawVO.teksVideo.length > 0
    ? rawVO.teksVideo.filter((t: any) => typeof t === 'string' && t.trim().length > 0)
    : null;

  if (audioOption === 'Pakai Voice Over' || audioOption === 'VO + Teks Video') {
    if (!vo) {
      if (durationNum <= 10) {
        vo = `Suka banget sama ${productName} ini! Desainnya simpel dan cakep banget pas dipakai. Detailnya beneran sesuai ekspektasi.`;
      } else if (durationNum <= 15) {
        vo = `Buat kamu yang lagi cari referensi produk berkualitas, ${productName} ini pas banget. Desainnya rapi, look-nya elegan, dan nyaman banget dipakai sehari-hari. Cek detailnya yuk!`;
      } else {
        vo = `Rekomendasi terbaik buat lengkapi outfit kamu! ${productName} ini punya cutting rapi, warna yang pas banget, dan kualitas material yang oke. Cocok dipakai kapan aja tanpa ribet. Jangan sampai kehabisan ya!`;
      }
    }
  } else {
    vo = null;
  }

  if (audioOption === 'Teks di Video' || audioOption === 'VO + Teks Video') {
    if (!texts || texts.length === 0) {
      texts = [
        'Detailnya cakep banget ✨',
        `Pilihan look: ${productName}`,
        'Kualitas & jahitan rapi',
        'Cek produknya sekarang',
      ];
    }
  } else {
    texts = null;
  }

  return {
    tipe: audioOption,
    voiceOver: vo,
    teksVideo: texts,
  };
}

function normalizePromptVideo(
  rawPrompt: any,
  productName: string,
  category: string,
  hasModel: boolean,
  style: string,
  durationStr: string,
  sceneCountStr: string,
  platform: string,
  characterSource?: string,
  characterSheetProvided?: boolean,
  characterDescriptionText?: string,
  isCharacterLocked: boolean = false
): string {
  const characterConsistencyInstruction =
    'Use the provided character reference as the strict identity reference. Maintain exactly the same person throughout the entire video. Preserve facial appearance, facial structure, hairstyle or hijab, skin appearance, body proportions, and overall identity from the first frame to the last frame. The promoted product may change the wardrobe or object being used, but the character identity must remain unchanged.';

  const multiSceneInstruction =
    sceneCountStr.includes('2') || sceneCountStr.includes('3')
      ? 'Same character, same facial identity and same physical appearance across all scenes.'
      : '';

  if (typeof rawPrompt === 'string' && rawPrompt.trim().length > 60) {
    let finalPrompt = rawPrompt.trim();
    if (isCharacterLocked) {
      const lower = finalPrompt.toLowerCase();
      if (!lower.includes('strict identity reference') && !lower.includes('same person throughout')) {
        finalPrompt = `${characterConsistencyInstruction} ${finalPrompt}`;
      }
      if (multiSceneInstruction && !lower.includes('across all scenes')) {
        finalPrompt = `${finalPrompt} ${multiSceneInstruction}`;
      }
    }
    return finalPrompt;
  }

  let charInstruction = '';
  if (characterSource === 'Tanpa Model' || (!hasModel && characterSource !== 'Upload Character Sheet' && characterSource !== 'Buat Karakter dari Teks')) {
    charInstruction = 'Product-only commercial showcase without human characters, focusing purely on high-end product presentation.';
  } else if (isCharacterLocked) {
    const roleOutfit = category.toLowerCase().includes('fashion')
      ? 'Dress the reference character in the exact product garment shown in the product image, replacing the character sheet outfit with the affiliate product wardrobe.'
      : 'The reference character naturally presents and showcases the product.';

    const specificProfile = characterSource === 'Buat Karakter dari Teks' && characterDescriptionText
      ? `Master Character Profile: ${characterDescriptionText.trim()}.`
      : characterSource === 'Upload Character Sheet' || characterSheetProvided
      ? 'Character visual source: Uploaded Character Sheet.'
      : 'Character visual source: Reference person in uploaded image.';

    charInstruction = `${characterConsistencyInstruction} ${specificProfile} ${roleOutfit} ${multiSceneInstruction}`.trim();
  } else if (characterSource === 'Upload Character Sheet' || characterSheetProvided) {
    charInstruction = `Use the uploaded character sheet as the character reference. ${
      category.toLowerCase().includes('fashion')
        ? `Dress the reference character in the exact product garment shown in the product image, replacing the character sheet outfit with the affiliate product wardrobe.`
        : `The reference character interacts naturally with the product.`
    }`;
  } else if (characterSource === 'Buat Karakter dari Teks' && characterDescriptionText) {
    charInstruction = `Maintain character appearance: ${characterDescriptionText.trim()}. ${
      category.toLowerCase().includes('fashion')
        ? `Dress this character in the exact garment from the product reference.`
        : `The character presents the product naturally.`
    }`;
  } else if (hasModel) {
    charInstruction = `Use the uploaded person as the character reference. ${
      category.toLowerCase().includes('fashion')
        ? `Dress the reference model in the exact garment shown in the product image.`
        : `The model holds and presents the product naturally.`
    }`;
  } else {
    charInstruction = 'Product-only commercial showcase without human characters, focusing purely on high-end product presentation.';
  }

  const visualLockInstruction = `Use the uploaded product image as the strict visual reference for ${productName}. Maintain identical product design, silhouette, proportions, colors, patterns, logos, textures, and packaging from the reference image without inventing new elements.`;

  const motionPacing = sceneCountStr === '1 Scene'
    ? `A single continuous seamless shot over ${durationStr} with calm, realistic, and steady motion.`
    : `A dynamic ${durationStr} sequence with smooth and realistic movements.`;

  const platformFraming = `Framed in vertical 9:16 aspect ratio optimized for ${platform}, keeping all crucial product details safely centered within the vertical safe area.`;

  const lightingStyle = style && style !== 'Otomatis'
    ? `Styled in a ${style} aesthetic with soft, clean studio lighting and natural ambient reflections.`
    : `Clean, premium commercial lighting with balanced highlights and soft natural shadows.`;

  const isWithHuman = characterSource !== 'Tanpa Model' && (hasModel || characterSource === 'Upload Character Sheet' || characterSource === 'Buat Karakter dari Teks');

  return `A high-quality 9:16 vertical affiliate commercial video. ${charInstruction} ${visualLockInstruction} Setting: A modern, minimalist aesthetic background with soft neutral tones. Action: ${
    isWithHuman
      ? `The model smoothly showcases ${productName} toward the camera with graceful, realistic movements, turning gently to highlight the visual texture and craftsmanship.`
      : `The camera glides slowly around ${productName} with smooth cinematic rotation, capturing authentic material textures and refined details.`
  } Camera: Smooth medium close-up tracking shot, slowly moving forward with steady stabilization. ${platformFraming} ${lightingStyle} ${motionPacing} Ending frame: A clear, stable hero showcase frame highlighting the finished look and product branding. 4K quality, photorealistic, cinematic depth of field, consistent physics.`;
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ============================================================================
// Safe Gemini Error Parser & Sanitizer
// Strictly avoids returning API keys, authorization headers, credentials, full URLs, or stack traces
// ============================================================================
function parseGeminiErrorSafely(
  err: any,
  attemptedModel: string,
  userKey: string
): {
  httpStatus: number;
  body: {
    success: boolean;
    status: string;
    httpStatus: number;
    category: string;
    stage: string;
    model: string;
    errorCode: string;
    safeMessage: string;
    message: string;
    primaryMessage: string;
    secondaryMessage: string;
    diagnostic: {
      status: number;
      errorCode: string;
      errorCategory: string;
      model: string;
      stage: string;
      safeMessage: string;
    };
  };
} {
  let status = 500;
  if (typeof err?.status === 'number') {
    status = err.status;
  } else if (typeof err?.statusCode === 'number') {
    status = err.statusCode;
  } else if (typeof err?.response?.status === 'number') {
    status = err.response.status;
  }

  let rawMsg = '';
  let parsedJson: any = null;

  if (typeof err?.message === 'string') {
    rawMsg = err.message;
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedJson = JSON.parse(jsonMatch[0]);
      } catch (_) {}
    }
  }

  const errorObj =
    parsedJson?.error ||
    (err?.error && typeof err.error === 'object' ? err.error : null) ||
    (err?.response?.data?.error && typeof err.response.data.error === 'object'
      ? err.response.data.error
      : null);

  if (errorObj?.code && typeof errorObj.code === 'number') {
    status = errorObj.code;
  }

  const detailReason = String(
    errorObj?.details?.[0]?.reason || err?.errorDetails?.[0]?.reason || ''
  ).trim();
  const gStatus = String(errorObj?.status || err?.code || '').trim();
  const baseMessage = String(
    errorObj?.message || rawMsg || err?.statusText || 'Gemini error'
  );

  // Strictly sanitize message:
  // JANGAN return: API key, authorization header, credential, full request URL, stack trace.
  let safeMessage = baseMessage;
  if (userKey && userKey.length > 5) {
    safeMessage = safeMessage.split(userKey).join('[REDACTED_API_KEY]');
  }
  safeMessage = safeMessage
    .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED_API_KEY]')
    .replace(/key=[0-9A-Za-z\-_]+/gi, 'key=[REDACTED]')
    .replace(/bearer\s+[0-9A-Za-z\-_\.]+/gi, 'Bearer [REDACTED]')
    .replace(/authorization:\s*[^\n,;]+/gi, 'Authorization: [REDACTED]')
    .replace(/https?:\/\/[^\s"',;)\]]+/g, '[URL]')
    .trim();

  if (!safeMessage) {
    safeMessage = `Gemini API merespons dengan status HTTP ${status}.`;
  }
  if (safeMessage.length > 350) {
    safeMessage = safeMessage.slice(0, 350) + '...';
  }

  let errorCode = detailReason || gStatus || (status ? `HTTP_${status}` : 'GEMINI_ERROR');
  errorCode = String(errorCode).replace(/[^A-Za-z0-9_]/g, '_').slice(0, 50);

  // 403 CLASSIFICATION:
  // Jika Gemini memberikan HTTP 403:
  // JANGAN otomatis sebut INVALID_KEY.
  // Periksa error detail.
  // Klasifikasikan:
  // - PERMISSION_DENIED
  // - API_KEY_RESTRICTED
  // - API_NOT_ENABLED
  // - PROJECT_PERMISSION
  // - AUTHENTICATION_ERROR
  // Jika tidak dapat ditentukan: PERMISSION_ERROR
  let category = 'UNKNOWN';
  const lowerMsg = safeMessage.toLowerCase();
  const lowerReason = detailReason.toLowerCase();
  const lowerGStatus = gStatus.toLowerCase();
  const combined = `${lowerMsg} ${lowerReason} ${lowerGStatus}`;

  if (status === 403) {
    if (
      combined.includes('restricted') ||
      combined.includes('api_key_service_blocked') ||
      combined.includes('api_key_restricted') ||
      lowerReason.includes('restricted') ||
      lowerReason.includes('blocked')
    ) {
      category = 'API_KEY_RESTRICTED';
      if (!detailReason) errorCode = 'API_KEY_RESTRICTED';
    } else if (
      combined.includes('not enabled') ||
      combined.includes('service_disabled') ||
      combined.includes('has not been used') ||
      combined.includes('disabled') ||
      lowerReason.includes('service_disabled')
    ) {
      category = 'API_NOT_ENABLED';
      if (!detailReason) errorCode = 'SERVICE_DISABLED';
    } else if (
      combined.includes('project_permission') ||
      combined.includes('consumer') ||
      combined.includes('project')
    ) {
      category = 'PROJECT_PERMISSION';
      if (!detailReason) errorCode = 'PROJECT_PERMISSION';
    } else if (
      combined.includes('unauthenticated') ||
      combined.includes('authentication') ||
      combined.includes('auth')
    ) {
      category = 'AUTHENTICATION_ERROR';
      if (!detailReason) errorCode = 'AUTHENTICATION_ERROR';
    } else if (
      combined.includes('permission_denied') ||
      combined.includes('permission denied') ||
      combined.includes('caller does not have permission')
    ) {
      category = 'PERMISSION_DENIED';
      if (!detailReason) errorCode = 'PERMISSION_DENIED';
    } else {
      category = 'PERMISSION_ERROR';
      if (!detailReason) errorCode = 'PERMISSION_ERROR';
    }
  } else if (
    status === 401 ||
    (status === 400 && (combined.includes('key') || combined.includes('credential')))
  ) {
    category = 'INVALID_KEY';
    errorCode = detailReason || 'API_KEY_INVALID';
  } else if (
    status === 429 ||
    combined.includes('resource_exhausted') ||
    combined.includes('quota') ||
    combined.includes('rate limit')
  ) {
    category = 'QUOTA';
    errorCode = detailReason || 'RESOURCE_EXHAUSTED';
  } else if (
    status === 404 ||
    combined.includes('not_found') ||
    combined.includes('not found') ||
    combined.includes('is not supported')
  ) {
    category = 'MODEL';
    errorCode = detailReason || 'MODEL_NOT_FOUND';
  } else if (
    status === 503 ||
    combined.includes('network') ||
    combined.includes('fetch failed') ||
    combined.includes('timeout') ||
    combined.includes('enotfound') ||
    combined.includes('econnrefused')
  ) {
    category = 'NETWORK';
    errorCode = detailReason || 'NETWORK_TIMEOUT';
  } else {
    category = status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN';
  }

  const cleanAttemptedModel = attemptedModel.startsWith('models/')
    ? attemptedModel.slice(7)
    : attemptedModel;

  return {
    httpStatus: status,
    body: {
      success: false,
      status: 'FAILED',
      httpStatus: status,
      category,
      stage: 'GEMINI_REQUEST_SENT',
      model: cleanAttemptedModel || 'none',
      errorCode,
      safeMessage,
      message: safeMessage,
      primaryMessage: safeMessage,
      secondaryMessage: `Error code: ${errorCode}`,
      diagnostic: {
        status,
        errorCode,
        errorCategory: category,
        model: cleanAttemptedModel || 'none',
        stage: 'GEMINI_REQUEST_SENT',
        safeMessage,
      },
    },
  };
}

// Requirement #13 Error Message Standardizer for all generators
export function getUserFriendlyErrorMessage(parsed: any): string {
  const category = parsed?.body?.category || parsed?.category || '';
  const status = parsed?.body?.httpStatus || parsed?.httpStatus || parsed?.status || 0;
  const rawMsg = (
    parsed?.body?.safeMessage ||
    parsed?.safeMessage ||
    parsed?.message ||
    ''
  ).toLowerCase();

  // 1. Invalid API Key
  if (
    category === 'INVALID_KEY' ||
    status === 401 ||
    rawMsg.includes('api key not valid') ||
    rawMsg.includes('api_key_invalid') ||
    rawMsg.includes('invalid api key') ||
    rawMsg.includes('api_key_required') ||
    rawMsg.includes('api_key_malformed')
  ) {
    return 'API Key tidak valid. Silakan gunakan API Key Gemini yang aktif.';
  }

  // 2. Permission or Model Access Issue
  if (
    category === 'PERMISSION_DENIED' ||
    category === 'PERMISSION_ERROR' ||
    category === 'PROJECT_PERMISSION' ||
    category === 'API_KEY_RESTRICTED' ||
    category === 'API_NOT_ENABLED' ||
    category === 'MODEL' ||
    status === 403 ||
    status === 404 ||
    rawMsg.includes('permission_denied') ||
    rawMsg.includes('permission denied') ||
    rawMsg.includes('restricted') ||
    rawMsg.includes('service_disabled') ||
    rawMsg.includes('not found') ||
    rawMsg.includes('is not supported')
  ) {
    return 'Project pada API Key ini tidak memiliki akses ke model Gemini yang diperlukan.';
  }

  // 3. Quota exhausted
  if (
    category === 'QUOTA' ||
    status === 429 ||
    rawMsg.includes('quota') ||
    rawMsg.includes('resource_exhausted') ||
    rawMsg.includes('rate limit')
  ) {
    return 'Kuota Gemini pada API Key Anda sementara mencapai batas.';
  }

  // 4. Gemini Service or Network Issue
  if (
    category === 'NETWORK' ||
    category === 'SERVER_ERROR' ||
    status === 503 ||
    status === 500 ||
    status === 504 ||
    status === 408 ||
    rawMsg.includes('network') ||
    rawMsg.includes('timeout') ||
    rawMsg.includes('fetch failed')
  ) {
    return 'Layanan Gemini sedang mengalami kendala. Silakan coba kembali.';
  }

  return (
    parsed?.body?.safeMessage ||
    parsed?.safeMessage ||
    'Layanan Gemini sedang mengalami kendala. Silakan coba kembali.'
  );
}

// ============================================================================
// BYOK (Bring Your Own Key) Verification Engine
// Strictly tests the provided user key only - NEVER falls back to project GEMINI_API_KEY
// ============================================================================
export async function testUserGeminiKey(rawApiKey: string) {
  try {
    const cleanKey = typeof rawApiKey === 'string' ? rawApiKey.trim() : '';

    if (!cleanKey) {
      return {
        httpStatus: 400,
        body: {
          success: false,
          status: 'FAILED',
          category: 'INVALID_KEY',
          httpStatus: 400,
          model: 'none',
          stage: 'USER_KEY_RECEIVED',
          errorCode: 'API_KEY_REQUIRED',
          safeMessage: 'API Key tidak boleh kosong.',
          message: 'API Key tidak valid',
          primaryMessage: 'API Key tidak valid',
          secondaryMessage: 'Periksa kembali API Key Anda atau gunakan API Key lain.',
          diagnostic: {
            status: 400,
            errorCode: 'API_KEY_REQUIRED',
            errorCategory: 'INVALID_KEY',
            model: 'none',
            stage: 'USER_KEY_RECEIVED',
            safeMessage: 'API Key tidak boleh kosong.',
          },
        },
      };
    }

    if (cleanKey.length < 10) {
      return {
        httpStatus: 400,
        body: {
          success: false,
          status: 'FAILED',
          category: 'INVALID_KEY',
          httpStatus: 400,
          model: 'none',
          stage: 'USER_KEY_RECEIVED',
          errorCode: 'API_KEY_MALFORMED',
          safeMessage: 'Panjang API Key tidak sesuai format standar.',
          message: 'API Key tidak valid',
          primaryMessage: 'API Key tidak valid',
          secondaryMessage: 'Periksa kembali API Key Anda atau gunakan API Key lain.',
          diagnostic: {
            status: 400,
            errorCode: 'API_KEY_MALFORMED',
            errorCategory: 'INVALID_KEY',
            model: 'none',
            stage: 'USER_KEY_RECEIVED',
            safeMessage: 'Panjang API Key tidak sesuai format standar.',
          },
        },
      };
    }

    // Direct Google GenAI instance using user key ONLY via getAI(cleanKey)
    // Never falls back to process.env.GEMINI_API_KEY
    const testClient = getAI(cleanKey);

    // STEP: PERFORM LIVE TEST GENERATION
    let testSuccess = false;
    let selectedModel = 'gemini-3.6-flash';
    let lastErr: any = null;

    const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    for (const model of candidateModels) {
      selectedModel = model;
      try {
        await testClient.models.generateContent({
          model,
          contents: 'Reply only: ZEO_BYOK_OK',
          config: {
            maxOutputTokens: 5,
          },
        });
        testSuccess = true;
        break;
      } catch (genErr: any) {
        lastErr = genErr;
        const status =
          typeof genErr?.status === 'number'
            ? genErr.status
            : typeof genErr?.statusCode === 'number'
              ? genErr.statusCode
              : typeof genErr?.response?.status === 'number'
                ? genErr.response.status
                : null;
        // If 400/401 (invalid key) or 403 (permission denied/restricted key), stop iterating
        if (status === 400 || status === 401 || status === 403) {
          break;
        }
      }
    }

    // SUCCESS CASE
    if (testSuccess) {
      const cleanModelName = selectedModel.startsWith('models/')
        ? selectedModel.slice(7)
        : selectedModel;
      return {
        httpStatus: 200,
        body: {
          success: true,
          status: 'CONNECTED',
          category: 'CONNECTED',
          httpStatus: 200,
          model: cleanModelName,
          stage: 'GEMINI_RESPONSE_RECEIVED',
          errorCode: 'OK',
          safeMessage: '✓ BYOK CONNECTED',
          message: '✓ BYOK CONNECTED',
          primaryMessage: '✓ BYOK CONNECTED',
          secondaryMessage: `Model ${cleanModelName} aktif dan siap digunakan.`,
          diagnostic: {
            status: 200,
            errorCode: 'OK',
            errorCategory: 'CONNECTED',
            model: cleanModelName,
            stage: 'GEMINI_RESPONSE_RECEIVED',
            safeMessage: '✓ BYOK CONNECTED',
          },
        },
      };
    }

    // FAILURE CASE: Safely parse and categorize Gemini error
    return parseGeminiErrorSafely(
      lastErr,
      selectedModel || 'gemini-2.5-flash',
      cleanKey
    );
  } catch (outerErr: any) {
    return parseGeminiErrorSafely(outerErr, 'none', rawApiKey);
  }
}

// Express POST route for BYOK testing with proper error handling
app.post('/api/testUserGeminiKey', async (req: express.Request, res: express.Response) => {
  try {
    const { apiKey } = req.body || {};
    const result = await testUserGeminiKey(apiKey);
    // Return HTTP 200 to prevent AI Studio Nginx reverse proxy from intercepting 403/502/503/504
    // and replacing the JSON body with HTML (/forbidden.html or /warmup.html).
    // The actual status code from Gemini/validation is preserved in result.body.httpStatus.
    return res.status(200).json(result.body);
  } catch (_error: any) {
    return res.status(200).json({
      success: false,
      status: 'FAILED',
      category: 'SERVER_ERROR',
      httpStatus: 500,
      model: 'none',
      errorCode: 'INTERNAL_SERVER_ERROR',
      safeMessage: 'Terjadi kesalahan internal pada server.',
      stage: 'SERVER_REQUEST_RECEIVED',
    });
  }
});

// Backward compatibility aliases
app.post('/api/test-key', async (req: express.Request, res: express.Response) => {
  try {
    const { apiKey } = req.body || {};
    const result = await testUserGeminiKey(apiKey);
    return res.status(200).json(result.body);
  } catch (_error: any) {
    return res.status(200).json({
      success: false,
      status: 'FAILED',
      category: 'SERVER_ERROR',
      httpStatus: 500,
      model: 'none',
      errorCode: 'INTERNAL_SERVER_ERROR',
      safeMessage: 'Terjadi kesalahan internal pada server.',
      stage: 'SERVER_REQUEST_RECEIVED',
    });
  }
});

app.post('/api/test-user-gemini-key', async (req: express.Request, res: express.Response) => {
  try {
    const { apiKey } = req.body || {};
    const result = await testUserGeminiKey(apiKey);
    return res.status(200).json(result.body);
  } catch (_error: any) {
    return res.status(200).json({
      success: false,
      status: 'FAILED',
      category: 'SERVER_ERROR',
      httpStatus: 500,
      model: 'none',
      errorCode: 'INTERNAL_SERVER_ERROR',
      safeMessage: 'Terjadi kesalahan internal pada server.',
      stage: 'SERVER_REQUEST_RECEIVED',
    });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const {
      images,
      characterOption = 'Otomatis dari Referensi',
      characterLock = true,
      characterSheet,
      characterDescription = '',
      notes,
      duration = '10 detik',
      sceneCount = '1 Scene',
      style = 'Otomatis',
      audio = 'Tanpa VO',
      platform = 'Semua Platform',
      apiKey,
    } = req.body;

    const isCharacterOptionNoModel = characterOption === 'Tanpa Model';
    const isCharacterLocked = !isCharacterOptionNoModel && (characterLock !== false);

    console.log(
      `[API /api/analyze] Received request with ${images?.length || 0} images. Character Option: ${characterOption}, Character Lock: ${isCharacterLocked}`
    );

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(200).json({
        success: false,
        error: 'Silakan unggah minimal 1 gambar referensi.',
      });
    }

    const userKey = typeof apiKey === 'string' ? apiKey.trim() : '';
    if (!userKey) {
      return res.status(200).json({
        success: false,
        error: 'Gemini API Key pengguna tidak ditemukan dalam sesi aktif ZEO. Silakan masukkan API Key di halaman login atau melalui menu Ganti API Key.',
      });
    }

    // STRICTLY BYOK: Uses ONLY user's key via getAI(userKey)
    // NEVER falls back to process.env.GEMINI_API_KEY
    const ai = getAI(userKey);

    // Prepare multimodal parts from uploaded images
    const imageParts = images
      .map((img: { mimeType?: string; base64: string; name?: string }, index: number) => {
        let mime = (img.mimeType || '').trim().toLowerCase();
        let rawBase64 = img.base64 || '';

        // If data URL prefix exists, strip it and extract MIME
        if (rawBase64.includes(';base64,')) {
          const parts = rawBase64.split(';base64,');
          const match = parts[0].match(/:(.*?)$/);
          if (match && match[1]) {
            mime = match[1].toLowerCase();
          }
          rawBase64 = parts[1];
        }

        // Normalize mime type
        if (mime === 'image/jpg') mime = 'image/jpeg';
        if (!mime || !mime.startsWith('image/')) mime = 'image/jpeg';

        // Clean any whitespace
        rawBase64 = rawBase64.replace(/\s+/g, '');

        if (!rawBase64) {
          console.warn(`[API /api/analyze] Image index ${index} has empty base64 data.`);
          return null;
        }

        return {
          inlineData: {
            mimeType: mime,
            data: rawBase64,
          },
        };
      })
      .filter((part): part is { inlineData: { mimeType: string; data: string } } => part !== null);

    if (imageParts.length === 0) {
      return res.status(400).json({
        error: 'Data gambar tidak valid atau kosong. Silakan periksa kembali file yang diunggah.',
      });
    }

    // Process Character Sheet image if provided
    let characterSheetPart: { inlineData: { mimeType: string; data: string } } | null = null;
    if (characterOption === 'Upload Character Sheet' && characterSheet && characterSheet.base64) {
      let csMime = (characterSheet.mimeType || '').trim().toLowerCase();
      let csRaw = characterSheet.base64 || '';
      if (csRaw.includes(';base64,')) {
        const parts = csRaw.split(';base64,');
        const match = parts[0].match(/:(.*?)$/);
        if (match && match[1]) {
          csMime = match[1].toLowerCase();
        }
        csRaw = parts[1];
      }
      if (csMime === 'image/jpg') csMime = 'image/jpeg';
      if (!csMime || !csMime.startsWith('image/')) csMime = 'image/jpeg';
      csRaw = csRaw.replace(/\s+/g, '');
      if (csRaw) {
        characterSheetPart = {
          inlineData: {
            mimeType: csMime,
            data: csRaw,
          },
        };
        console.log(`[API /api/analyze] Processed Character Sheet image part successfully.`);
      }
    }

    console.log(`[API /api/analyze] Processed ${imageParts.length} valid multimodal image parts.`);

    const systemInstruction = `Anda adalah asisten AI multimodal ahli analisis produk dan visual video promosi khusus affiliate & seller marketplace (TikTok, Shopee Video, Instagram Reels).

TUGAS UTAMA:
Menganalisis SEMUA 1–6 gambar referensi yang diunggah secara simultan untuk persiapan pembuatan video affiliate/seller yang realistis dan siap digunakan pada AI video generator, terutama Google Flow / Veo.

HIERARKI & PRIORITAS REFERENSI:
1. CHARACTER REFERENCE (Character Sheet / Model Referensi / Deskripsi Karakter)
2. PRODUCT REFERENCE (Foto fisik produk referensi)
3. MARKETPLACE INFORMATION (Screenshot teks, spesifikasi, varian)
4. USER INSTRUCTION (Catatan tambahan pengguna)
5. VIDEO STYLE (Pilihan gaya video)
* Catatan: Jangan membiarkan style video mengubah identitas karakter atau desain produk fisik!

ATURAN WAJIB, VISUAL LOCK, CHARACTER LOCK & ANTI-HALUSINASI:
1. KLASIFIKASI INTERNAL SETIAP GAMBAR:
   Secara internal kategorikan setiap gambar ke peran berikut:
   - MODEL_REFERENCE: Jika terdapat orang/model
   - PRODUCT_REFERENCE: Foto produk fisik
   - MARKETPLACE_SCREENSHOT: Screenshot aplikasi/web marketplace
   - PRODUCT_DESCRIPTION: Screenshot deskripsi/spesifikasi teks
   - COLOR_VARIANT: Foto varian warna berbeda
   - SIZE_INFORMATION: Screenshot tabel ukuran / dimensi
   - PACKAGING_REFERENCE: Foto dus / kemasan / botol
   - OTHER_REFERENCE: Referensi visual pendukung lainnya
   - CHARACTER_SHEET: Jika ada gambar khusus Character Sheet yang disertakan terpisah

2. PENGATURAN KARAKTER / MODEL VIDEO (${characterOption}) & MODE KARAKTER TETAP (KUNCI KARAKTER = ${isCharacterLocked ? 'AKTIF' : 'NON-AKTIF'}):
   PILIHAN PENGGUNA SAAT INI: "${characterOption}"
   STATUS KUNCI KARAKTER: ${isCharacterLocked ? 'AKTIF' : 'NON-AKTIF'}

   A. BEDAKAN KARAKTER DAN PRODUK (SEPARATED ENTITIES):
      * CHARACTER LOCK = identitas model (facial appearance, facial features, hairstyle atau hijab, skin appearance, body proportions, gender presentation, age appearance, aksesori non-produk, overall visual identity).
      * PRODUCT LOCK = produk yang sedang dipromosikan (bentuk, warna, motif, logo, tulisan/branding, kemasan, proporsi, detail desain).
      * Keduanya diperlakukan secara terpisah! Produk BOLEH berganti, tetapi Karakter TIDAK boleh berganti jika Kunci Karakter aktif.
      * Pakaian pada Character Sheet bukan produk yang dijual: jika produk adalah fashion, gantikan pakaian di character sheet dengan produk referensi (outfit change). Jangan mengunci pakaian Character Sheet jika pakaian tersebut harus digantikan oleh produk fashion!
      * Mix & Match: Jika terdapat beberapa produk fashion yang kompatibel (atasan + bawahan + sepatu + tas), boleh membuat complete outfit menggunakan seluruh produk tersebut dari referensi (hanya gunakan produk yang benar-benar ada pada referensi, jangan menciptakan produk tambahan).

   B. OPSI SUMBER KARAKTER:
      - Jika "Otomatis dari Referensi":
        * Periksa apakah ada manusia/model pada gambar referensi produk yang diunggah.
        * Jika ada model: jadikan orang tersebut sebagai visual character reference. Analisis karakteristik visual objektif (gender, perkiraan usia, hijab/rambut, warna kulit, bentuk wajah, postur).
        * Jika TIDAK ada model pada referensi: modelTerdeteksi = false, characterLockAktif = false, sumberKarakter = "Tanpa Model". JANGAN menciptakan manusia secara fiktif.
        * Jika ada model dan Kunci Karakter aktif: characterLockAktif = true, sumberKarakter = "Referensi Gambar".
      - Jika "Upload Character Sheet":
        * Gambar terakhir yang dilampirkan adalah GAMBAR CHARACTER SHEET KHUSUS.
        * Analisis seluruh karakteristik visual manusia pada Character Sheet tersebut: wajah, hairstyle/hijab, tone kulit, proporsi tubuh, ciri khas.
        * modelTerdeteksi = true, characterLockAktif = ${isCharacterLocked}, sumberKarakter = "Character Sheet".
        * Character Sheet menjadi SUMBER UTAMA visual karakter. JANGAN mendeskripsikan ulang karakter dengan cara yang bertentangan dengan gambar.
        * Karakter dalam Character Sheet ini adalah MODEL TETAP yang WAJIB konsisten dari frame awal hingga akhir.
      - Jika "Buat Karakter dari Teks":
        * Deskripsi karakter dari pengguna: "${characterDescription ? characterDescription.replace(/"/g, "'") : 'Model affiliate ramah dan profesional'}".
        * modelTerdeteksi = true, characterLockAktif = ${isCharacterLocked}, sumberKarakter = "Deskripsi Teks".
        * Buat SATU **Master Character Description** secara internal (contoh: "Wanita Indonesia dewasa, berhijab beige, tubuh proporsional, wajah ramah natural"). Gunakan Master Character Description yang sama persis pada seluruh prompt scene. Jangan membuat deskripsi karakter baru untuk setiap scene!
      - Jika "Tanpa Model":
        * Video HANYA menampilkan produk secara eksklusif (Product-only commercial).
        * modelTerdeteksi = false, characterLockAktif = false, sumberKarakter = "Tanpa Model".
        * JANGAN memunculkan karakter manusia atau model sama sekali di video prompt.

3. CONTINUITY INSTRUCTIONS (KONSISTENSI MULTI-SCENE):
   - Jika Kunci Karakter aktif (${isCharacterLocked}):
     Wajib sertakan instruksi identitas ketat di Prompt Video:
     "Use the provided character reference as the strict identity reference. Maintain exactly the same person throughout the entire video. Preserve facial appearance, facial structure, hairstyle or hijab, skin appearance, body proportions, and overall identity from the first frame to the last frame. The promoted product may change the wardrobe or object being used, but the character identity must remain unchanged."
   - Multi-scene Continuity:
     Jika video mempunyai 2 atau 3 scene: Karakter pada Scene 1, Scene 2, dan Scene 3 HARUS SAMA. Wajib sertakan kalimat:
     "Same character, same facial identity and same physical appearance across all scenes."

4. VISUAL PRODUCT LOCK:
   - Gunakan hasil analisis gambar sebagai sumber kebenaran produk mutlak!
   - Kunci bentuk produk, warna dominan, motif, logo, tulisan/branding, kemasan, proporsi, detail desain, dan aksesori produk.
   - Dilarang keras mengubah produk menjadi desain baru, mengganti warna atau motif, atau mencampurkan detail antara Produk A dan Produk B.
   - "visualProductLockAktif" harus selalu true.

5. BACA SCREENSHOT MARKETPLACE (OCR & INFORMASI PRODUK):
   - Ekstrak teks yang terbaca pada screenshot marketplace (nama produk, jenis bahan, ukuran, varian warna yang tertera, fitur, fungsi, keunggulan).
   - Jika teks buram atau tidak terbaca: UNKNOWN = OMIT, NOT INVENT. Berikan catatanKetidakjelasan.
   - DILARANG mengarang harga, diskon, promo fiktif, atau klaim medis fiktif yang tidak ditemukan dari referensi!

6. KONSEP VIDEO (STORYBOARD PER SCENE):
   - Wajib mengikuti pilihan durasi (${duration}) dan jumlah scene (${sceneCount}).
   - ATURAN KRUSIAL:
     * Jika Jumlah Scene = "1 Scene", buat SATU CONTINUOUS SHOT (bukan dipecah). Judul: "Scene 1 — 0–${duration} (Continuous Shot)".
     * Jika Jumlah Scene = "2 Scene", bagi menjadi 2 scene proporsional. Karakter harus sama di kedua scene!
     * Jika Jumlah Scene = "3 Scene", bagi menjadi 3 scene (Hook visual, Demo/Aksi fitur, Hero shot & CTA). Karakter harus sama di ketiga scene!
     * Jika "Otomatis", pilih jumlah scene paling efektif (10s: 1 continuous shot atau 2 scene).
   - Aksi video harus mengikuti kategori produk dan keberadaan model.
   - Untuk video berdurasi pendek (misal 10 detik), prioritaskan gerakan sederhana dan realistis (jangan terlalu banyak aksi bertumpuk).
   - Tuliskan untuk setiap scene:
     * sceneNumber: number
     * durationLabel: "Scene X — [durasi]"
     * visual: setting, subjek, framing visual
     * action: aksi realistis model/produk
     * camera: jenis shot dan pergerakan kamera (vertical 9:16 safe area)
     * productFocus: fokus detail produk
     * transition: jenis transisi (atau "Continuous seamless shot" jika 1 scene)

7. PROMPT VIDEO (SIAP AI VIDEO GENERATOR / GOOGLE FLOW / VEO):
   - WAJIB dalam BAHASA INGGRIS karena ditujukan untuk mesin video AI.
   - Dibuat sebagai satu prompt yang koheren, natural, dan mengalir (bukan format JSON).
   - Jika Kunci Karakter aktif (${isCharacterLocked}):
     Wajib sertakan kalimat:
     "Use the provided character reference as the strict identity reference. Maintain exactly the same person throughout the entire video. Preserve facial appearance, facial structure, hairstyle or hijab, skin appearance, body proportions, and overall identity from the first frame to the last frame. The promoted product may change the wardrobe or object being used, but the character identity must remain unchanged."
     ${sceneCount.includes('2') || sceneCount.includes('3') ? 'Sertakan: "Same character, same facial identity and same physical appearance across all scenes."' : ''}
   - Visual Product Lock: "Use the uploaded product image as the strict visual reference for [product name]. Maintain exact design, silhouette, color, texture, typography, and packaging..."
   - Jika pakaian: "Dress the reference character in the exact product garment shown in the product image..."
   - Jika Tanpa Model: "Product-only commercial showcase without human characters..."
   - Mencakup: Subject/Character, Product Reference, Setting, Action (gerakan realistis), Camera movement (vertical 9:16 aspect ratio, safe area for short-form platforms), Lighting & Style (${style}), Product Consistency, Timing & Pacing, dan Ending Frame.

8. VOICE OVER / TEKS VIDEO:
   - Sesuai opsi Audio (${audio}):
     * Jika "Tanpa VO": voiceOver = null, teksVideo = null.
     * Jika "Pakai Voice Over": voiceOver = skrip narasi bahasa Indonesia yang natural untuk affiliate (ramah, soft-selling, durasi pas, TIDAK MENGARANG harga/diskon), teksVideo = null.
     * Jika "Teks di Video": voiceOver = null, teksVideo = array 2-4 frasa teks singkat aman di layar (misal: ["Lihat detailnya ✨", "Desain simpel & elegan"]).
     * Jika "VO + Teks Video": isi voiceOver dan teksVideo sekaligus.

9. NEGATIVE PROMPT:
   - Dalam BAHASA INGGRIS.
   - Pertahankan seluruh larangan Product Lock:
     "Do not change the product design. Do not change product color. Do not change patterns or logos. Do not create additional products. Do not distort the product. No floating objects, no inconsistent packaging, no unreadable or invented branding, no flickering, no sudden jump cuts or scene changes."
   - Jika Character Lock aktif (${isCharacterLocked}):
     WAJIB tambahkan klausul wajib berikut:
     "no different person, no identity change, no face replacement, no face morphing, no inconsistent facial features, no hairstyle changes, no hijab changes unless requested, no body-shape changes, no age changes, no gender changes, no duplicated character, no extra person unless requested, no extra limbs, no extra fingers, no deformed hands."
   - Ditambah larangan spesifik kategori produk (fashion, sepatu, tas, skincare, dll).

Keluarkan hasil analisis dalam format JSON terstruktur:
{
  "sumberKarakter": "${characterOption === 'Upload Character Sheet' ? 'Character Sheet' : characterOption === 'Buat Karakter dari Teks' ? 'Deskripsi Teks' : characterOption === 'Tanpa Model' ? 'Tanpa Model' : 'Referensi Gambar'}",
  "characterLockAktif": ${isCharacterLocked},
  "visualProductLockAktif": true,
  "detailKarakter": "Deskripsi atau Master Character Description jika aktif, atau null",
  "analisisReferensi": {
    "ringkasan": "Ringkasan pemetaan visual seluruh gambar",
    "jumlahGambar": number,
    "modelTerdeteksi": boolean,
    "detailModel": "Karakteristik visual model jika ada atau null",
    "produkUtama": "Nama produk utama",
    "produkTambahan": ["produk pendukung"] atau null,
    "screenshotTerdeteksi": boolean,
    "informasiPentingTerbaca": ["poin penting terbaca"],
    "catatanKetidakjelasan": "null atau catatan ketidakjelasan",
    "kategoriProduk": "Kategori produk",
    "rekomendasiAksi": "Aksi produk yang direkomendasikan",
    "gayaVideoTerpilih": "Gaya video terpilih",
    "hubunganReferensi": "Penjelasan hubungan antar referensi gambar"
  },
  "produkTerdeteksi": [
    {
      "nomor": 1,
      "nama": "Nama produk",
      "jenis": "Jenis produk",
      "warna": "Warna produk",
      "informasiTerbaca": "Informasi terbaca",
      "sumber": "Sumber deteksi",
      "detailVisual": "Detail visual terkunci"
    }
  ],
  "konsepVideo": {
    "totalScenes": number,
    "totalDuration": "${duration}",
    "scenes": [
      {
        "sceneNumber": 1,
        "durationLabel": "Scene 1 — 0–${duration} (Continuous Shot)",
        "visual": "Deskripsi visual",
        "action": "Aksi model atau produk",
        "camera": "Framing dan pergerakan kamera",
        "productFocus": "Bagian produk yang disorot",
        "transition": "Transisi atau Continuous seamless shot"
      }
    ]
  },
  "promptVideo": "Full coherent prompt in English ready for Google Flow / Veo...",
  "voiceOverTeks": {
    "tipe": "${audio}",
    "voiceOver": "Skrip bahasa Indonesia atau null",
    "teksVideo": ["Teks overlay 1", "Teks overlay 2"] atau null
  },
  "negativePrompt": "Do not change the product design..."
}`;

    const userPrompt = `Lakukan analisis menyeluruh terhadap gambar referensi terlampir dan susun rancangan video affiliate/seller lengkap:
- Opsi Karakter: ${characterOption}
${characterOption === 'Upload Character Sheet' ? '- Perhatian: Gambar terakhir adalah Character Sheet referensi model.' : ''}
${characterOption === 'Buat Karakter dari Teks' ? `- Deskripsi Karakter Pengguna: "${characterDescription}"` : ''}
- Durasi Video: ${duration}
- Jumlah Scene: ${sceneCount}
- Gaya Video: ${style}
- Audio: ${audio}
- Target Platform: ${platform}
- Catatan Tambahan Pengguna: ${notes ? `"${notes}"` : 'Tidak ada catatan tambahan.'}

PENTING:
1. Terapkan VISUAL PRODUCT LOCK & CHARACTER LOCK sesuai opsi karakter terpilih (${characterOption}).
2. Jika Jumlah Scene = "1 Scene", buat SATU continuous shot tanpa perpindahan scene.
3. Prompt video harus dalam BAHASA INGGRIS untuk AI video generator.
4. Voice Over dalam Bahasa Indonesia sesuai opsi audio terpilih (${audio}).
5. Jangan mengarang harga, diskon, atau klaim fiktif (UNKNOWN = OMIT, NOT INVENT).
Jawab HANYA dengan JSON valid.`;

    const allMultimodalParts = [...imageParts];
    if (characterSheetPart) {
      allMultimodalParts.push(characterSheetPart);
    }

    const contents = [
      {
        role: 'user',
        parts: [
          ...allMultimodalParts,
          { text: userPrompt },
        ],
      },
    ];

    // Multi-model execution with fallback across separate quota pools and instant failover
    // Prioritize models with high availability and separate quota pools
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
        console.log(`[API /api/analyze] Calling Gemini model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        usedModel = modelName;
        console.log(`[API /api/analyze] Success with model: ${modelName}`);
        break; // Success, stop trying other models
      } catch (err: any) {
        lastError = err;
        const isAccessDenied =
          err?.status === 403 ||
          /PERMISSION_DENIED|denied access/i.test(String(err?.message || JSON.stringify(err || '')));
        if (isAccessDenied && !userKey) {
          console.log(`[API /api/analyze] Gemini key access restricted (403). Seamlessly routing to Affiliate Smart Engine.`);
          break;
        }
        console.log(`[API /api/analyze] Model ${modelName} returned status ${err?.status || 'error'}, checking fallback model...`);
      }
    }

    let responseText = '';
    if (!response) {
      if (userKey) {
        // REQUIREMENT #5: STRICTLY NO FALLBACK FOR BYOK SESSIONS
        const parsed = parseGeminiErrorSafely(lastError, usedModel || 'gemini-3.6-flash', userKey);
        const userMessage = getUserFriendlyErrorMessage(parsed);
        return res.status(200).json({
          success: false,
          error: userMessage,
          diagnostic: parsed.body.diagnostic,
        });
      }
      console.log('[API /api/analyze] Activating Affiliate Smart Engine...');
      usedModel = 'Affiliate Smart Engine (Fallback Mode)';
      responseText = '';
    } else {
      responseText =
        typeof response.text === 'string'
          ? response.text
          : typeof (response as any).text === 'function'
            ? (response as any).text()
            : (response as any).candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log(`[API /api/analyze] Response text length: ${responseText.length}`);
    }

    // Parse JSON safely with multi-step fallback
    let parsedResult: any = null;
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    cleanText = cleanText.trim();

    try {
      parsedResult = JSON.parse(cleanText);
    } catch (e) {
      console.warn('[API /api/analyze] Direct JSON.parse failed. Attempting brace extraction.');
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          parsedResult = JSON.parse(cleanText.substring(firstBrace, lastBrace + 1));
        } catch (innerErr) {
          console.warn('[API /api/analyze] Substring JSON extraction failed.');
        }
      }
    }

    // Fallback: If JSON parsing completely failed, build structured result from model text
    if (!parsedResult || typeof parsedResult !== 'object') {
      console.log('[API /api/analyze] Using text fallback generator for response.');
      const isModel = /model|orang|manusia|pria|wanita|hijab/i.test(responseText);
      const isScreenshot = /screenshot|toko|marketplace|shopee|tokopedia|tiktok|ulasan|rating/i.test(responseText);

      parsedResult = {
        analisisReferensi: {
          ringkasan: responseText.slice(0, 500).trim() || 'Analisis visual berhasil diselesaikan.',
          jumlahGambar: imageParts.length,
          modelTerdeteksi: isModel,
          detailModel: isModel ? 'Terdeteksi figur model pada gambar referensi.' : null,
          produkUtama: 'Produk Teridentifikasi',
          produkTambahan: null,
          screenshotTerdeteksi: isScreenshot,
          informasiPentingTerbaca: ['Informasi dianalisis dari referensi gambar.'],
          catatanKetidakjelasan: null,
          kategoriProduk: 'PRODUK UMUM',
          rekomendasiAksi: 'Fokus pada sudut pandang close-up dinamis dan fitur utama produk.',
          gayaVideoTerpilih: style || 'Otomatis',
          hubunganReferensi: 'Seluruh referensi gambar digunakan untuk mengunci konsistensi visual produk.',
        },
        produkTerdeteksi: [
          {
            nomor: 1,
            nama: 'Produk Utama',
            jenis: 'Produk Referensi',
            warna: 'Sesuai visual referensi',
            informasiTerbaca: 'Visual Product Lock aktif',
            sumber: 'Referensi Visual',
            detailVisual: 'Karakteristik visual produk dipertahankan sesuai gambar asli.',
          },
        ],
      };
    }

    // Ensure `analisisReferensi` exists if only `summary` was returned
    if (!parsedResult.analisisReferensi && parsedResult.summary) {
      const s = parsedResult.summary;
      const prods = Array.isArray(parsedResult.products) ? parsedResult.products : [];
      parsedResult.analisisReferensi = {
        ringkasan: s.referenceOverview || 'Analisis visual seluruh gambar referensi berhasil dipetakan.',
        jumlahGambar: s.imageCount || imageParts.length,
        modelTerdeteksi: !!s.modelDetected,
        detailModel: s.modelDetails || null,
        produkUtama: s.mainProduct || prods[0]?.name || 'Produk Utama',
        produkTambahan: s.additionalProducts || null,
        screenshotTerdeteksi: !!s.marketplaceScreenshotDetected,
        informasiPentingTerbaca: Array.isArray(s.readableInformation) ? s.readableInformation : [],
        catatanKetidakjelasan: s.unclearNotes || null,
        kategoriProduk: s.productCategory || 'UMUM',
        rekomendasiAksi: s.recommendedAction || 'Menampilkan produk secara fokus dan dinamis.',
        gayaVideoTerpilih: s.recommendedStyle || style || 'Otomatis',
        hubunganReferensi: Array.isArray(parsedResult.references)
          ? parsedResult.references.map((r: any) => `Gbr ${r.index || ''}: ${r.description || ''}`).join(' | ')
          : 'Seluruh gambar referensi saling melengkapi.',
      };
    }

    // Ensure `produkTerdeteksi` exists if only `products` was returned
    if ((!parsedResult.produkTerdeteksi || parsedResult.produkTerdeteksi.length === 0) && Array.isArray(parsedResult.products)) {
      parsedResult.produkTerdeteksi = parsedResult.products.map((p: any, idx: number) => ({
        nomor: idx + 1,
        nama: p.name || p.type || `Produk ${idx + 1}`,
        jenis: p.type || 'Produk',
        warna: p.color || 'Sesuai referensi visual',
        informasiTerbaca: Array.isArray(p.marketplaceInformation)
          ? p.marketplaceInformation.join(', ')
          : (p.marketplaceInformation || 'Informasi terverifikasi dari gambar'),
        sumber: p.source || 'Referensi Visual',
        detailVisual: Array.isArray(p.visibleDetails)
          ? p.visibleDetails.join(', ')
          : (p.visibleDetails || 'Visual Product Lock aktif.'),
      }));
    }

    // Normalize video output fields (Konsep Video, Prompt Video, Voice Over, Negative Prompt)
    const productName = parsedResult.analisisReferensi?.produkUtama || 'Produk Referensi';
    const category = parsedResult.analisisReferensi?.kategoriProduk || 'FASHION';
    const hasModel = !!parsedResult.analisisReferensi?.modelTerdeteksi;

    // Character settings
    const isCharacterSheet = characterOption === 'Upload Character Sheet';
    const isTextCharacter = characterOption === 'Buat Karakter dari Teks';
    const effectiveHasModel = !isCharacterOptionNoModel && (hasModel || isCharacterSheet || isTextCharacter);
    const effectiveCharacterLock = isCharacterLocked && effectiveHasModel;

    parsedResult.sumberKarakter = isCharacterOptionNoModel
      ? 'Tanpa Model'
      : isCharacterSheet
      ? 'Character Sheet'
      : isTextCharacter
      ? 'Deskripsi Teks'
      : effectiveHasModel
      ? 'Referensi Gambar'
      : 'Tanpa Model';

    parsedResult.characterLockAktif = effectiveCharacterLock;
    parsedResult.visualProductLockAktif = true;
    if (!parsedResult.detailKarakter && isTextCharacter && characterDescription) {
      parsedResult.detailKarakter = characterDescription;
    } else if (!parsedResult.detailKarakter && isCharacterSheet) {
      parsedResult.detailKarakter = 'Model visual terkunci dari Character Sheet yang diunggah.';
    }

    if (parsedResult.analisisReferensi) {
      parsedResult.analisisReferensi.sumberKarakter = parsedResult.sumberKarakter;
      parsedResult.analisisReferensi.characterLockAktif = parsedResult.characterLockAktif;
      parsedResult.analisisReferensi.visualProductLockAktif = parsedResult.visualProductLockAktif;
      parsedResult.analisisReferensi.detailKarakter = parsedResult.detailKarakter;
      parsedResult.analisisReferensi.modelTerdeteksi = effectiveHasModel;
    }

    parsedResult.konsepVideo = normalizeKonsepVideo(
      parsedResult.konsepVideo,
      duration,
      sceneCount,
      category,
      productName,
      effectiveHasModel,
      style
    );

    parsedResult.promptVideo = normalizePromptVideo(
      parsedResult.promptVideo,
      productName,
      category,
      effectiveHasModel,
      style,
      duration,
      sceneCount,
      platform,
      characterOption,
      !!characterSheetPart,
      characterDescription,
      effectiveCharacterLock
    );

    parsedResult.voiceOverTeks = normalizeVoiceOverTeks(
      parsedResult.voiceOverTeks,
      audio,
      duration,
      productName
    );

    const charNegativeTokens = 'no different person, no identity change, no face replacement, no face morphing, no inconsistent facial features, no hairstyle changes, no hijab changes unless requested, no body-shape changes, no age changes, no gender changes, no duplicated character, no extra person unless requested';

    if (
      !parsedResult.negativePrompt ||
      typeof parsedResult.negativePrompt !== 'string' ||
      parsedResult.negativePrompt.trim().length < 30
    ) {
      parsedResult.negativePrompt = buildDefaultNegativePrompt(
        category,
        productName,
        effectiveHasModel,
        effectiveCharacterLock
      );
    } else {
      let np = parsedResult.negativePrompt.trim();
      if (effectiveCharacterLock && !np.toLowerCase().includes('no different person')) {
        np += `, ${charNegativeTokens}`;
      }
      parsedResult.negativePrompt = np;
    }

    return res.json({
      success: true,
      data: {
        ...parsedResult,
        modelUsed: usedModel,
        waktuAnalisis: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      },
    });
  } catch (error: any) {
    console.error('[API /api/analyze] Error:', error);
    const parsed = parseGeminiErrorSafely(
      error?.originalError || error,
      'gemini-3.6-flash',
      req.body?.apiKey || ''
    );
    const userMessage = getUserFriendlyErrorMessage(parsed);

    // Return HTTP 200 with success: false to prevent Nginx HTML error overrides
    return res.status(200).json({
      success: false,
      error: userMessage,
      diagnostic: parsed.body.diagnostic,
    });
  }
});

// Dedicated Multimodal Food Preparation Ingredient Analyzer
app.post('/api/food-analyze-ingredients', async (req, res) => {
  try {
    const { images = [], apiKey } = req.body;
    const userKey = typeof apiKey === 'string' ? apiKey.trim() : '';
    if (!userKey) {
      return res.status(200).json({
        success: false,
        error: 'Gemini API Key pengguna tidak ditemukan dalam sesi aktif ZEO. Silakan masukkan API Key di halaman login atau menu Ganti API Key.',
      });
    }

    const imageParts = (images || [])
      .map((img: any) => {
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
      .filter((part: any): part is { inlineData: { mimeType: string; data: string } } => part !== null);

    if (imageParts.length === 0) {
      return res.status(200).json({
        success: false,
        error: 'Tidak ada foto bahan makanan yang valid untuk dianalisis.',
      });
    }

    const ai = getAI(userKey);
    const systemInstruction = `Anda adalah asisten AI multimodal ahli identifikasi bahan makanan, belanjaan (grocery), sayuran, buah-buahan, bumbu dapur, telur, daging, seafood, bahan kemasan, dan isi kulkas untuk "ZEO Food Preparation Studio".

TUGAS UTAMA:
Menganalisis foto bahan makanan atau hasil belanjaan yang diunggah pengguna. Satu foto dapat memuat banyak bahan sekaligus yang diletakkan bersama di atas meja, nampan, atau counter dapur.

ATURAN KETAT:
1. Identifikasi HANYA bahan yang CUKUP TERLIHAT dari foto.
2. JANGAN mengarang bahan yang tidak terlihat.
3. Jika label/merek produk kemasan tidak terbaca dengan jelas, JANGAN mengarang merek. Tulis deskripsi kategori generik seperti "Saus botol", "Produk kemasan", "Susu kotak", "Pasta kemasan", "Tepung kemasan".
4. Jika suatu bahan tidak yakin atau kurang jelas terlihat, gunakan awalan "Kemungkinan [nama bahan]" atau "Bahan belum teridentifikasi".
5. Keluarkan daftar bahan dalam format JSON yang bersih dan ringkas.

FORMAT OUTPUT HARUS JSON VALID:
{
  "detectedIngredients": [
    "Wortel",
    "Telur",
    "Bawang bombai",
    "Daun bawang",
    "Cabai",
    "Alpukat",
    "Jamur",
    "Sayuran hijau",
    "Produk kemasan"
  ],
  "rawAnalysis": "Deskripsi singkat dan akurat mengenai bahan belanjaan yang terlihat serta kondisi penataan."
}`;

    const modelsToTry = [
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.6-flash',
    ];

    let response: any = null;
    let lastErr: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[API /api/food-analyze-ingredients] Calling model: ${model} with ${imageParts.length} image parts`);
        response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                ...imageParts,
                {
                  text: 'Analisis semua foto bahan/belanjaan ini. Ekstrak seluruh daftar bahan makanan yang terlihat jelas sesuai aturan sistem.',
                },
              ],
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        if (response?.text) {
          console.log(`[API /api/food-analyze-ingredients] Success with model: ${model}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[API /api/food-analyze-ingredients] Model ${model} failed:`, err?.message || err);
        lastErr = err;
      }
    }

    if (!response?.text) {
      throw lastErr || new Error('Gagal menganalisis bahan dari foto.');
    }

    const text = response.text.trim();
    let parsedJson: any = null;
    try {
      parsedJson = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsedJson = JSON.parse(match[0]);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        detectedIngredients: Array.isArray(parsedJson?.detectedIngredients)
          ? parsedJson.detectedIngredients
          : [],
        rawAnalysis:
          parsedJson?.rawAnalysis ||
          'Berbagai bahan belanjaan segar berhasil teridentifikasi dari foto.',
      },
    });
  } catch (error: any) {
    console.error('[API /api/food-analyze-ingredients] Error:', error);
    return res.status(200).json({
      success: false,
      error: error?.message || 'Gagal menganalisis foto bahan makanan.',
    });
  }
});

app.post('/api/creative-analyze', async (req, res) => {
  try {
    const {
      videoTypeId,
      videoTypeTitle,
      videoTypeCategory,
      references = [],
      characterChoice,
      characterTypeChoice,
      characterSheetImage,
      characterDescription,
      videoIdea,
      timelineEra,
      timeTransition,
      timelapseStartCondition,
      timelapseEndResult,
      tinyWorldConcept,
      tinyWorldScale,
      asmrSubject,
      foodDishName,
      foodStageOption,
      foodPersonMode,
      duration,
      customDurationSeconds,
      sceneCount,
      visualStyle,
      audio,
      platform,
      apiKey,
      genre,
      viralTheme,
      characterCount,
      characters,
      totalDuration,
      sceneDuration,
      estimatedSceneCount,
      aspectRatio,
      productionMode,
      storyIdea,
      presentationMode,
      targetUser,
      videoGoal,
      topicContent,
      targetAudience,
      presenterName,
      optionalBrief,
      confirmedIngredients,
      selectedActivities,
      foodVideoGoal,
      foodHumanMode,
      foodLocation,
      foodLocationImage,
      foodAudioMode,
      foodDurationPerScene,
      foodSceneCount,
      // Music & Lyric Visual fields
      musicSourceType,
      musicAudioFile,
      musicAudioDescription,
      musicAudioMood,
      musicAudioDuration,
      musicLyrics,
      musicTheme,
      musicMood,
      musicGenre,
      musicStoryIdea,
      musicVideoType,
      musicVisualStyle,
      musicCharacterMode,
      musicCharacters,
      musicDuration,
      musicSceneDuration,
      musicProductionMode,
      musicPlatform,
    } = req.body;

    const userKey = typeof apiKey === 'string' ? apiKey.trim() : '';
    if (!userKey) {
      return res.status(200).json({
        success: false,
        error: 'Gemini API Key pengguna tidak ditemukan dalam sesi aktif ZEO. Silakan masukkan API Key di halaman login atau melalui menu Ganti API Key.',
      });
    }

    // STRICTLY BYOK: Uses ONLY user's key via getAI(userKey)
    // NEVER falls back to process.env.GEMINI_API_KEY
    const ai = getAI(userKey);

    console.log(
      `[API /api/creative-analyze] BYOK active. Video Type: ${videoTypeTitle} (${videoTypeId}), References: ${references.length}, Character: ${characterChoice}, Style: ${visualStyle}`
    );

    const result = await processCreativeVideoAnalysis(ai, {
      videoTypeId,
      videoTypeTitle,
      videoTypeCategory,
      references,
      characterChoice,
      characterTypeChoice,
      characterSheetImage,
      characterDescription,
      videoIdea,
      timelineEra,
      timeTransition,
      timelapseStartCondition,
      timelapseEndResult,
      tinyWorldConcept,
      tinyWorldScale,
      asmrSubject,
      foodDishName,
      foodStageOption,
      foodPersonMode,
      duration,
      customDurationSeconds,
      sceneCount,
      visualStyle,
      audio,
      platform,
      apiKey: userKey,
      genre,
      viralTheme,
      characterCount,
      characters,
      totalDuration,
      sceneDuration,
      estimatedSceneCount,
      aspectRatio,
      productionMode,
      storyIdea,
      presentationMode,
      targetUser,
      videoGoal,
      topicContent,
      targetAudience,
      presenterName,
      optionalBrief,
      confirmedIngredients,
      selectedActivities,
      foodVideoGoal,
      foodHumanMode,
      foodLocation,
      foodLocationImage,
      foodAudioMode,
      foodDurationPerScene,
      foodSceneCount,
      musicSourceType,
      musicAudioFile,
      musicAudioDescription,
      musicAudioMood,
      musicAudioDuration,
      musicLyrics,
      musicTheme,
      musicMood,
      musicGenre,
      musicStoryIdea,
      musicVideoType,
      musicVisualStyle,
      musicCharacterMode,
      musicCharacters,
      musicDuration,
      musicSceneDuration,
      musicProductionMode,
      musicPlatform,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API /api/creative-analyze] Error:', error);
    const parsed = parseGeminiErrorSafely(
      error?.originalError || error,
      'gemini-3.6-flash',
      req.body?.apiKey || ''
    );
    const userMessage = getUserFriendlyErrorMessage(parsed);

    // Return HTTP 200 with success: false to prevent Nginx HTML error overrides
    return res.status(200).json({
      success: false,
      error: userMessage,
      diagnostic: parsed.body.diagnostic,
    });
  }
});

app.post('/api/zeo-auto-analyze', async (req, res) => {
  try {
    const {
      references = [],
      videoIdea,
      duration,
      customDurationSeconds,
      durationScope,
      sceneCount,
      visualStyle,
      audio,
      platform,
      isAlternative,
      apiKey,
    } = req.body;

    const userKey = typeof apiKey === 'string' ? apiKey.trim() : '';
    if (!userKey) {
      return res.status(200).json({
        success: false,
        error: 'Gemini API Key pengguna tidak ditemukan dalam sesi aktif ZEO. Silakan masukkan API Key di halaman login atau melalui menu Ganti API Key.',
      });
    }

    // STRICTLY BYOK: Uses ONLY user's key via getAI(userKey)
    // NEVER falls back to process.env.GEMINI_API_KEY
    const ai = getAI(userKey);

    console.log(
      `[API /api/zeo-auto-analyze] BYOK active. Idea length: ${videoIdea?.length || 0}, References: ${references?.length || 0}, Duration: ${duration} (${durationScope}), Scenes: ${sceneCount}, Alternative: ${!!isAlternative}`
    );

    const result = await processZeoAutoAnalysis(ai, {
      references,
      videoIdea,
      duration,
      customDurationSeconds,
      durationScope,
      sceneCount,
      visualStyle,
      audio,
      platform,
      isAlternative,
      apiKey: userKey,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API /api/zeo-auto-analyze] Error:', error);
    const parsed = parseGeminiErrorSafely(
      error?.originalError || error,
      'gemini-3.6-flash',
      req.body?.apiKey || ''
    );
    const userMessage = getUserFriendlyErrorMessage(parsed);

    // Return HTTP 200 with success: false to prevent Nginx HTML error overrides
    return res.status(200).json({
      success: false,
      error: userMessage,
      diagnostic: parsed.body.diagnostic,
    });
  }
});

async function startServer() {
  // Vite dev middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
