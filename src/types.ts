export interface UploadedImage {
  id: string;
  name: string;
  previewUrl: string;
  size: number;
  mimeType?: string;
  base64?: string;
}

export interface DetectedProduct {
  nomor: number;
  nama: string;
  jenis: string;
  warna: string;
  informasiTerbaca: string;
  sumber: string;
  detailVisual?: string;
}

export interface SceneItem {
  sceneNumber: number;
  durationLabel: string;
  visual: string;
  action: string;
  camera: string;
  productFocus: string;
  transition?: string;
}

export interface KonsepVideoData {
  totalScenes: number;
  totalDuration: string;
  scenes: SceneItem[];
}

export interface VoiceOverTeksData {
  tipe: AudioOption;
  voiceOver?: string | null;
  teksVideo?: string[] | null;
}

export interface AnalysisResult {
  analisisReferensi: {
    ringkasan: string;
    jumlahGambar: number;
    modelTerdeteksi: boolean;
    detailModel?: string | null;
    produkUtama: string;
    produkTambahan?: string[] | null;
    screenshotTerdeteksi: boolean;
    informasiPentingTerbaca: string[];
    catatanKetidakjelasan?: string | null;
    kategoriProduk: string;
    rekomendasiAksi: string;
    gayaVideoTerpilih: string;
    hubunganReferensi?: string;
    // Fitur Karakter / Model
    sumberKarakter?: 'Character Sheet' | 'Deskripsi Teks' | 'Referensi Gambar' | 'Model dari Referensi' | 'Tanpa Model' | string;
    characterLockAktif?: boolean;
    visualProductLockAktif?: boolean;
    detailKarakter?: string | null;
  };
  produkTerdeteksi: DetectedProduct[];
  konsepVideo?: KonsepVideoData;
  promptVideo?: string;
  voiceOverTeks?: VoiceOverTeksData;
  negativePrompt?: string;
  waktuAnalisis?: string;
  modelUsed?: string;
  usedCustomKey?: boolean;
}

export type CharacterOption =
  | 'Otomatis dari Referensi'
  | 'Upload Character Sheet'
  | 'Buat Karakter dari Teks'
  | 'Tanpa Model';

export type VideoDuration = '10 detik' | '15 detik' | '20 detik' | '30 detik';

export type SceneCount = '1 Scene' | '2 Scene' | '3 Scene' | 'Otomatis';

export type VideoStyle =
  | 'Otomatis'
  | 'Affiliate Natural'
  | 'UGC'
  | 'Fashion Commercial'
  | 'Clean Minimalist'
  | 'Luxury Cinematic'
  | 'Dark Premium'
  | 'Street Fashion'
  | 'Aesthetic'
  | 'Product Showcase';

export type AudioOption =
  | 'Tanpa VO'
  | 'Pakai Voice Over'
  | 'Teks di Video'
  | 'VO + Teks Video';

export type PlatformOption =
  | 'TikTok'
  | 'Instagram Reels'
  | 'Shopee Video'
  | 'Semua Platform';

export interface StyleOptionMeta {
  id: VideoStyle;
  label: string;
  description: string;
  badge?: string;
  popular?: boolean;
}
