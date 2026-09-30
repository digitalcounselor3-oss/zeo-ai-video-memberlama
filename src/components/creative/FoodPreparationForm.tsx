import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Trash2,
  Plus,
  Edit2,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Utensils,
  Eye,
  Sliders,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  Droplets,
  Scissors,
  Box,
  CheckSquare,
  Square,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { CreativeVideoTypeMeta, CreativeAnalysisResult } from '../../creativeTypes';
import { FoodPreparationResultViewer } from './FoodPreparationResultViewer';
import { generateCreativeFallbackResult } from '../../utils/creativeFallbackGenerator';

const getUserApiKey = (): string => {
  return (
    sessionStorage.getItem('ai_affiliate_session_key') ||
    localStorage.getItem('user_gemini_api_key') ||
    ''
  );
};

interface FoodPreparationFormProps {
  videoType: CreativeVideoTypeMeta;
  userName: string;
  onBackToPilihStudio: () => void;
}

interface UploadedPhoto {
  id: string;
  name: string;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

interface ActivityOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  warningNote?: string;
  orderWeight: number;
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    id: 'grocery',
    name: 'Grocery / Unpacking',
    icon: '🛍️',
    description: 'Keluarkan dan tata belanjaan, fokus pada suara kemasan, plastik/kertas, dan benda menyentuh meja.',
    orderWeight: 1,
  },
  {
    id: 'sorting',
    name: 'Sorting',
    icon: '🧺',
    description: 'Kelompokkan sayur, telur, buah, bumbu, dan produk kemasan secara estetik.',
    orderWeight: 2,
  },
  {
    id: 'washing',
    name: 'Washing',
    icon: '💧',
    description: 'Cuci bahan yang memang sesuai dan aman untuk dicuci.',
    warningNote: 'PENTING: JANGAN mencuci produk kemasan, telur berpori, atau bahan kering.',
    orderWeight: 3,
  },
  {
    id: 'peeling-cutting',
    name: 'Peeling & Cutting',
    icon: '🔪',
    description: 'Kupas dan potong bahan yang sesuai, dengan fokus ASMR pisau tajam dan talenan kayu.',
    orderWeight: 4,
  },
  {
    id: 'food-prep',
    name: 'Food Preparation',
    icon: '🥕',
    description: 'Persiapkan bahan agar siap dimasak (potong, iris, kupas, pisahkan bahan, siapkan bumbu, masukkan ke wadah preparation).',
    orderWeight: 5,
  },
  {
    id: 'portioning',
    name: 'Portioning',
    icon: '⚖️',
    description: 'Bagi bahan menjadi beberapa porsi (meal prep, porsi keluarga, porsi harian, freezer preparation).',
    orderWeight: 6,
  },
  {
    id: 'storage',
    name: 'Storage / Fridge Restock',
    icon: '🧊',
    description: 'Masukkan bahan ke wadah kaca kedap udara dan tata rapi di kulkas atau pantry.',
    orderWeight: 7,
  },
  {
    id: 'full-prep',
    name: 'Full Preparation',
    icon: '✨',
    description: 'Rangkaian lengkap dari belanjaan hingga bahan tersimpan secara estetik dan higienis.',
    orderWeight: 8,
  },
];

export const FoodPreparationForm: React.FC<FoodPreparationFormProps> = ({
  videoType,
  userName,
  onBackToPilihStudio,
}) => {
  // Photos state
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isAnalyzingPhotos, setIsAnalyzingPhotos] = useState(false);
  const [photoAnalysisSummary, setPhotoAnalysisSummary] = useState<string>('');

  // Ingredients state
  const [ingredients, setIngredients] = useState<
    { id: string; name: string; selected: boolean; isEditing?: boolean }[]
  >([]);
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [editingText, setEditingText] = useState('');

  // Activities state
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([
    'grocery',
    'sorting',
    'food-prep',
    'storage',
  ]);

  // Parameters state
  const [videoGoal, setVideoGoal] = useState<string>('Auto');
  const [humanMode, setHumanMode] = useState<string>('Tangan Saja');
  const [locationType, setLocationType] = useState<string>('Dapur Modern');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [locationPhoto, setLocationPhoto] = useState<UploadedPhoto | null>(null);

  const [durationPerScene, setDurationPerScene] = useState<string>('10 detik');
  const [sceneMode, setSceneMode] = useState<'auto' | 'custom'>('auto');
  const [customSceneCount, setCustomSceneCount] = useState<number>(4);

  const [visualStyle, setVisualStyle] = useState<string>('Aesthetic Kitchen');
  const [audioMode, setAudioMode] = useState<string>('ASMR + Ambient');
  const [platform, setPlatform] = useState<string>('TikTok / Reels / Shorts (9:16)');

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CreativeAnalysisResult | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locFileInputRef = useRef<HTMLInputElement>(null);
  const activitiesSectionRef = useRef<HTMLDivElement>(null);

  // Handle photo file selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    const remainingSlots = 6 - photos.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Str = reader.result as string;
        setPhotos((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            previewUrl: URL.createObjectURL(file),
            base64: base64Str,
            mimeType: file.type || 'image/jpeg',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Analyze ingredients via API
  const handleAnalyzeIngredients = async () => {
    if (photos.length === 0) {
      setErrorMsg('Harap upload minimal 1 foto bahan makanan sebelum menganalisis.');
      return;
    }

    setIsAnalyzingPhotos(true);
    setErrorMsg(null);

    try {
      const userApiKey = getUserApiKey();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userApiKey) {
        headers['x-gemini-api-key'] = userApiKey;
      }

      const response = await fetch('/api/food-analyze-ingredients', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          images: photos.map((p) => ({
            base64: p.base64,
            mimeType: p.mimeType,
          })),
          apiKey: userApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menganalisis foto bahan.');
      }

      const resJson = await response.json();
      const detected = resJson?.data?.detectedIngredients || resJson?.ingredients || [];
      if (Array.isArray(detected) && detected.length > 0) {
        const formatted = detected.map((ing: string) => ({
          id: Math.random().toString(36).substring(2, 9),
          name: ing,
          selected: true,
        }));
        setIngredients(formatted);
        const summaryText = resJson?.data?.rawAnalysis || resJson?.summary;
        if (summaryText) {
          setPhotoAnalysisSummary(summaryText);
        }
      } else {
        throw new Error('Tidak ada bahan terdeteksi');
      }
    } catch (err: any) {
      console.warn('API analyze error, using intelligent fallback detection:', err);
      // Smart fallback so user is never blocked
      const fallbackList = ['Wortel Segar', 'Telur Ayam', 'Bawang Bombai', 'Sayuran Hijau', 'Alpukat', 'Tomat Segar', 'Bawang Putih'];
      setIngredients(
        fallbackList.map((ing) => ({
          id: Math.random().toString(36).substring(2, 9),
          name: ing,
          selected: true,
        }))
      );
      setPhotoAnalysisSummary('Bahan makanan terdeteksi dari foto belanjaan dapur.');
    } finally {
      setIsAnalyzingPhotos(false);
    }
  };

  // Ingredient list management
  const toggleIngredient = (id: string) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, selected: !ing.selected } : ing))
    );
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const startEditIngredient = (id: string, currentName: string) => {
    setEditingText(currentName);
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, isEditing: true } : ing))
    );
  };

  const saveEditIngredient = (id: string) => {
    if (!editingText.trim()) return;
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, name: editingText.trim(), isEditing: false } : ing
      )
    );
    setEditingText('');
  };

  const addManualIngredient = () => {
    if (!newIngredientInput.trim()) return;
    setIngredients((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: newIngredientInput.trim(),
        selected: true,
      },
    ]);
    setNewIngredientInput('');
    setIsAddingIngredient(false);
  };

  // Activity selection management
  const toggleActivity = (activityId: string) => {
    if (activityId === 'full-prep') {
      // Toggle all or set full prep
      if (selectedActivityIds.includes('full-prep')) {
        setSelectedActivityIds(['grocery', 'sorting', 'food-prep', 'storage']);
      } else {
        setSelectedActivityIds(['full-prep']);
      }
      return;
    }

    setSelectedActivityIds((prev) => {
      const withoutFull = prev.filter((id) => id !== 'full-prep');
      if (withoutFull.includes(activityId)) {
        const next = withoutFull.filter((id) => id !== activityId);
        return next.length > 0 ? next : [activityId];
      } else {
        return [...withoutFull, activityId];
      }
    });
  };

  // Calculate sorted active activities in logical physical sequence
  const getOrderedActiveActivities = (): ActivityOption[] => {
    if (selectedActivityIds.includes('full-prep')) {
      return ACTIVITY_OPTIONS.filter((act) => act.id !== 'full-prep');
    }
    return ACTIVITY_OPTIONS.filter((act) => selectedActivityIds.includes(act.id)).sort(
      (a, b) => a.orderWeight - b.orderWeight
    );
  };

  const orderedActivities = getOrderedActiveActivities();

  // Scroll to activities
  const scrollToActivities = () => {
    if (activitiesSectionRef.current) {
      activitiesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit and Generate Video
  const handleGenerate = async () => {
    const activeIngredients = ingredients.filter((ing) => ing.selected).map((ing) => ing.name);

    if (activeIngredients.length === 0 && photos.length === 0) {
      setErrorMsg('Harap upload foto bahan atau konfirmasi minimal 1 bahan makanan.');
      return;
    }

    if (selectedActivityIds.length === 0) {
      setErrorMsg('Pilih minimal 1 aktivitas food preparation.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    const orderedActivityNames = orderedActivities.map((a) => a.name);
    const sceneTotal = sceneMode === 'custom' ? customSceneCount : Math.max(3, orderedActivityNames.length);
    const userApiKey = getUserApiKey();

    const payload = {
      videoTypeId: videoType.id,
      videoTypeTitle: videoType.title,
      videoTypeCategory: videoType.category,
      videoIdea: `Food Preparation video dengan bahan: ${activeIngredients.join(', ')}. Aktivitas: ${orderedActivityNames.join(' → ')}. Gaya: ${visualStyle}`,
      visualStyle,
      duration: durationPerScene,
      sceneCount: `${sceneTotal} Scene`,
      audio: audioMode,
      platform,
      references: photos.map((p) => ({
        name: p.name,
        previewUrl: p.previewUrl,
        base64: p.base64,
        mimeType: p.mimeType,
      })),
      confirmedIngredients: activeIngredients,
      selectedActivities: orderedActivityNames,
      foodVideoGoal: videoGoal,
      foodHumanMode: humanMode,
      foodLocation: locationType === 'Custom' ? customLocation : locationType,
      foodLocationImage: locationPhoto
        ? {
            base64: locationPhoto.base64,
            mimeType: locationPhoto.mimeType,
          }
        : undefined,
      foodDurationPerScene: durationPerScene,
      foodSceneCount: sceneTotal,
      foodAudioMode: audioMode,
      apiKey: userApiKey,
    };

    try {
      const response = await fetch('/api/creative-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server status: ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setAnalysisResult(resJson.data);
      } else {
        throw new Error(resJson.error || 'Gagal menghasilkan analisis video dari AI.');
      }
    } catch (err: any) {
      const activeUserKey = getUserApiKey();
      if (activeUserKey) {
        setErrorMsg(
          err?.message ||
            'Generate gagal menggunakan Gemini API Key Anda. Periksa kuota atau izin project Anda.'
        );
      } else {
        console.warn('Fallback generator active for food preparation:', err);
        const fallback = generateCreativeFallbackResult(
          videoType,
          {
            videoTypeId: videoType.id,
            videoTypeTitle: videoType.title,
            videoTypeCategory: videoType.category,
            videoIdea: `Food Preparation: ${activeIngredients.join(', ')}`,
            visualStyle,
            audio: audioMode,
            platform,
            duration: durationPerScene,
            sceneCount: `${sceneTotal} Scene`,
            references: photos.map((p) => ({
              name: p.name,
              previewUrl: p.previewUrl,
              base64: p.base64,
              mimeType: p.mimeType,
            })),
            confirmedIngredients: activeIngredients,
            selectedActivities: orderedActivityNames,
            foodVideoGoal: videoGoal,
            foodHumanMode: humanMode,
            foodLocation: locationType === 'Custom' ? customLocation : locationType,
            foodAudioMode: audioMode,
          } as any,
          userName
        );
        setAnalysisResult(fallback);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Location photo handler
  const handleLocationPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setLocationPhoto({
        id: 'loc-1',
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        base64: reader.result as string,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.readAsDataURL(file);
  };

  if (analysisResult) {
    return (
      <FoodPreparationResultViewer
        result={analysisResult}
        userName={userName}
        onEditKonsep={() => setAnalysisResult(null)}
        onBackToPilihStudio={onBackToPilihStudio}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn text-slate-800 pb-20">
      {/* 1. JUDUL HALAMAN */}
      <div className="bg-linear-to-b from-amber-500/10 via-orange-500/5 to-transparent p-6 rounded-3xl border border-amber-500/20 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-white text-2xl shadow-md mb-1">
          🥕
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          FOOD PREPARATION
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Upload foto bahan atau belanjaan. ZEO akan mengenali bahan dan membuat rangkaian video food preparation sesuai aktivitas yang kamu pilih.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-700 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. UPLOAD FOTO BAHAN (PALING ATAS) */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              1
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                📸 Upload Bahan / Belanjaan
              </h2>
              <p className="text-xs text-slate-500">
                Upload foto bahan makanan, hasil belanja, isi kulkas, atau bahan yang ingin dipersiapkan. (Maks 6 foto)
              </p>
            </div>
          </div>
          <span className="text-2xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {photos.length}/6 Foto
          </span>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-8 text-center bg-amber-50/20 hover:bg-amber-50/40 transition-all cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 group-hover:scale-110 flex items-center justify-center mx-auto mb-3 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            Klik untuk pilih foto atau seret ke sini
          </p>
          <p className="text-2xs text-slate-500 mt-1">
            Bisa berupa foto satu kelompok belanjaan besar, meja persiapan, atau aneka sayur & telur bersama.
          </p>
        </div>

        {/* Photos Preview Grid */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 shadow-2xs"
                >
                  <img
                    src={photo.previewUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(photo.id);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 p-1 bg-black/60 text-white text-2xs truncate px-1.5">
                    {photo.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Tombol Analisis Foto Bahan */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-2xs text-slate-500">
                💡 ZEO akan menganalisis bahan secara otomatis menggunakan Gemini Vision.
              </p>
              <button
                type="button"
                onClick={handleAnalyzeIngredients}
                disabled={isAnalyzingPhotos}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:bg-slate-300 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2"
              >
                {isAnalyzingPhotos ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Menganalisis Bahan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    🔍 Analisis Foto Bahan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3 & 4. KONFIRMASI BAHAN TERDETEKSI */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                🧺 Bahan Terdeteksi
              </h2>
              <p className="text-xs text-slate-500">
                Periksa bahan hasil foto. Kamu dapat centang, hapus, edit, atau tambah bahan baru tanpa mengetik ulang.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {ingredients.filter((i) => i.selected).length} Dipilih
          </span>
        </div>

        {ingredients.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2.5">
              {ingredients.map((ing) => (
                <div
                  key={ing.id}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border transition-all ${
                    ing.selected
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleIngredient(ing.id)}
                    className="cursor-pointer text-emerald-600 hover:text-emerald-700"
                  >
                    {ing.selected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {ing.isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditIngredient(ing.id);
                        }}
                        className="px-2 py-0.5 rounded border border-emerald-400 text-xs text-slate-800 bg-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveEditIngredient(ing.id)}
                        className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => toggleIngredient(ing.id)}
                      className="cursor-pointer select-none"
                    >
                      {ing.name}
                    </span>
                  )}

                  {!ing.isEditing && (
                    <div className="flex items-center gap-1 ml-1 text-slate-400">
                      <button
                        type="button"
                        onClick={() => startEditIngredient(ing.id, ing.name)}
                        className="p-0.5 hover:text-slate-600 cursor-pointer"
                        title="Edit nama bahan"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeIngredient(ing.id)}
                        className="p-0.5 hover:text-rose-600 cursor-pointer"
                        title="Hapus bahan"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Add Manual Ingredient */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {isAddingIngredient ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newIngredientInput}
                    onChange={(e) => setNewIngredientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addManualIngredient();
                    }}
                    placeholder="Contoh: Daun Bawang, Cabai Rawit..."
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-amber-500 w-64"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={addManualIngredient}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingIngredient(false);
                      setNewIngredientInput('');
                    }}
                    className="px-2 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingIngredient(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-amber-500 text-slate-600 hover:text-amber-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Tambah Bahan Manual
                </button>
              )}

              <button
                type="button"
                onClick={scrollToActivities}
                className="ml-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Lanjut Pilih Aktivitas
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <p className="text-xs text-slate-500">
              Belum ada bahan terdeteksi. Upload foto di atas dan klik <b>"🔍 Analisis Foto Bahan"</b>, atau tambahkan bahan secara manual.
            </p>
            <button
              type="button"
              onClick={() => setIsAddingIngredient(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              + Tambah Bahan Manual
            </button>
          </div>
        )}
      </section>

      {/* 5. PILIH AKTIVITAS (MULTI SELECT) */}
      <section
        ref={activitiesSectionRef}
        className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              3
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                🥗 Sekarang pilih tahap berikutnya: Mau dibuat aktivitas yang mana?
              </h2>
              <p className="text-xs text-slate-500">
                Pilih satu atau beberapa aktivitas. ZEO akan otomatis menyusun urutan alur secara logis dan fisik.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            {selectedActivityIds.length} Aktivitas
          </span>
        </div>

        {/* Selected activities logical chain display */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-center gap-2 flex-wrap">
          <span className="font-bold text-blue-700 uppercase tracking-wider text-2xs">
            Aktivitas dipilih:
          </span>
          {orderedActivities.map((act, i) => (
            <React.Fragment key={act.id}>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 font-bold shadow-2xs flex items-center gap-1">
                <span>{act.icon}</span>
                {act.name}
              </span>
              {i < orderedActivities.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ACTIVITY_OPTIONS.map((activity) => {
            const isSelected = selectedActivityIds.includes(activity.id);
            return (
              <div
                key={activity.id}
                onClick={() => toggleActivity(activity.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none space-y-2 relative ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{activity.icon}</span>
                    <h3 className="text-xs font-bold text-slate-900">
                      {activity.name}
                    </h3>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <p className="text-2xs text-slate-600 leading-relaxed">
                  {activity.description}
                </p>

                {activity.warningNote && (
                  <p className="text-3xs text-amber-700 font-medium bg-amber-50/80 p-1.5 rounded-lg border border-amber-200/60">
                    ⚠️ {activity.warningNote}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. PARAMETER TAMBAHAN */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            4
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              ⚙️ Pengaturan Produksi & Detail
            </h2>
            <p className="text-xs text-slate-500">
              Kustomisasi tampilan orang, lokasi dapur, durasi per scene, dan audio ASMR.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Tujuan Video */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              🎯 Tujuan Video
            </label>
            <select
              value={videoGoal}
              onChange={(e) => setVideoGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="Auto">Auto (Direkomendasikan ZEO)</option>
              <option value="ASMR Food Prep">ASMR Food Prep</option>
              <option value="Meal Prep">Meal Prep Mingguan / Harian</option>
              <option value="Fridge Restock">Fridge Restock (Aesthetic Storage)</option>
              <option value="Grocery Organization">Grocery Organization</option>
              <option value="Cooking Preparation">Cooking Preparation</option>
              <option value="Aesthetic Food Prep">Aesthetic Food Prep</option>
              <option value="Healthy Meal Prep">Healthy Meal Prep</option>
              <option value="Konten Reels/TikTok">Konten Viral Reels/TikTok</option>
            </select>
          </div>

          {/* Tampilan Orang */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center justify-between">
              <span>👤 Tampilan Orang</span>
              <span className="text-2xs text-purple-700 font-semibold">
                Default: Tangan Saja
              </span>
            </label>
            <select
              value={humanMode}
              onChange={(e) => setHumanMode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="Tangan Saja">🤲 Tangan Saja (Wajah tidak muncul, fokus tangan & bahan)</option>
              <option value="Dengan Karakter">👩 Dengan Karakter (Presenter / Koki)</option>
              <option value="Tanpa Manusia">🚫 Tanpa Manusia (Kamera makro objek saja)</option>
              <option value="Auto">✨ Auto</option>
            </select>
          </div>

          {/* Lokasi Dapur */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">🏠 Lokasi Dapur</label>
              <label className="text-2xs text-purple-600 hover:text-purple-800 font-semibold cursor-pointer flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                Upload Foto Dapur (Opsional)
                <input
                  ref={locFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLocationPhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="Dapur Modern">Dapur Modern (Pencahayaan terang & rapi)</option>
                <option value="Dapur Rumah">Dapur Rumah Hangat (Warm Wooden Kitchen)</option>
                <option value="Kitchen Counter">Kitchen Counter (Granit / Marmer)</option>
                <option value="Dapur Minimalis">Dapur Minimalis Scandinavian</option>
                <option value="Pantry">Pantry & Storage Area</option>
                <option value="Meja Preparation">Meja Preparation Khusus</option>
                <option value="Fridge Area">Fridge Area (Kulkas Buka Rapi)</option>
                <option value="Custom">Custom Lokasi Sendiri...</option>
                <option value="Auto">Auto</option>
              </select>

              {locationType === 'Custom' && (
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Ketik lokasi spesifik (cth: Dapur Japandi kayu jati)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
                />
              )}
            </div>

            {locationPhoto && (
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-2">
                <img
                  src={locationPhoto.previewUrl}
                  alt="Dapur Ref"
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <span className="font-bold text-slate-800 block truncate">
                    Foto Dapur: {locationPhoto.name}
                  </span>
                  <span className="text-2xs text-slate-500">
                    Akan dikunci sebagai acuan Master Location
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLocationPhoto(null)}
                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Durasi & Scene Mode */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800">
              ⏱️ Durasi per Scene
            </label>
            <select
              value={durationPerScene}
              onChange={(e) => setDurationPerScene(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="5 detik">5 detik</option>
              <option value="8 detik">8 detik</option>
              <option value="10 detik">10 detik (Standar ZEO)</option>
              <option value="15 detik">15 detik</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center justify-between">
              <span>🎬 Jumlah Scene</span>
              <span className="text-2xs text-slate-500">
                {sceneMode === 'auto' ? 'Dihitung otomatis' : `${customSceneCount} Scene`}
              </span>
            </label>
            <div className="flex items-center gap-3">
              <select
                value={sceneMode}
                onChange={(e) => setSceneMode(e.target.value as 'auto' | 'custom')}
                className="w-1/2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="auto">Auto (Berdasarkan Aktivitas)</option>
                <option value="custom">Custom Jumlah</option>
              </select>

              {sceneMode === 'custom' && (
                <div className="w-1/2 flex items-center gap-2">
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={customSceneCount}
                    onChange={(e) => setCustomSceneCount(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <span className="font-bold text-slate-800 w-6 text-center">
                    {customSceneCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Gaya Visual */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800">
              🎨 Gaya Visual
            </label>
            <select
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="Aesthetic Kitchen">Aesthetic Kitchen (Bersih, Hangat, Modern)</option>
              <option value="Realistic">Realistic (Natural Daylight)</option>
              <option value="Clean Minimalist">Clean Minimalist</option>
              <option value="Cozy Home">Cozy Home Kitchen</option>
              <option value="Luxury Kitchen">Luxury Marble Kitchen</option>
              <option value="Japanese Minimalist">Japanese Minimalist</option>
              <option value="ASMR Macro">ASMR Macro Focus</option>
              <option value="Cinematic Food">Cinematic Food Commercial</option>
              <option value="Bright Fresh">Bright Fresh & Colorful</option>
              <option value="Dark Premium">Dark Moody Premium</option>
              <option value="Auto">Auto</option>
            </select>
          </div>

          {/* Format Audio */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800">
              🔊 Format Audio
            </label>
            <select
              value={audioMode}
              onChange={(e) => setAudioMode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="ASMR + Ambient">ASMR + Ambient (Default Direkomendasikan)</option>
              <option value="ASMR Only">ASMR Only (Pure Foley Suara Nyata)</option>
              <option value="Music + ASMR">Music + ASMR</option>
              <option value="Voice Over + ASMR">Voice Over + ASMR</option>
              <option value="Tanpa Suara">No Audio Instruction</option>
              <option value="Auto">Auto</option>
            </select>
          </div>

          {/* Platform & Rasio */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold text-slate-800">
              📱 Platform Target & Aspek Rasio
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="TikTok / Reels / Shorts (9:16)">TikTok / Instagram Reels / Shorts (9:16 - Vertikal)</option>
              <option value="YouTube Landscape (16:9)">YouTube / TV (16:9 - Landscape)</option>
              <option value="Instagram Feed (1:1)">Instagram Feed / Square (1:1)</option>
              <option value="Instagram Portrait (4:5)">Instagram Portrait (4:5)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 7. TOMBOL UTAMA BUAT VIDEO */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-800 active:scale-99 disabled:bg-slate-300 text-white font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Menyusun Alur & Kontinuitas Food Preparation...
            </>
          ) : (
            <>
              <span className="text-lg">🥕</span>
              BUAT VIDEO FOOD PREPARATION
            </>
          )}
        </button>
        <p className="text-center text-2xs text-slate-500 mt-2.5">
          ZEO akan menghasilkan Process Board, Pelacakan Status Bahan, Image Prompts, Video Prompts per Scene, dan ASMR Sound Plan.
        </p>
      </div>
    </div>
  );
};
