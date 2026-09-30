import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ArrowLeft,
  UploadCloud,
  X,
  Lock,
  Tv,
  Layers,
  Edit3,
  Award,
  Building2,
  FlaskConical,
  HeartPulse,
  Globe,
  GraduationCap,
  Smile,
  Film,
  Wand2,
  Scan,
  Clock,
  Palette,
  FileText,
  CheckCircle2,
  Check,
  RotateCcw,
  AlertCircle,
  Zap,
  ChevronRight,
  Info,
  UserCheck,
} from 'lucide-react';
import {
  CreativeAnalysisResult,
  CreativeVideoTypeMeta,
  TeacherPresentationMode,
} from '../../creativeTypes';
import { UploadedImage } from '../../types';
import { CreativeResultViewer } from './CreativeResultViewer';
import { generateCreativeFallbackResult } from '../../utils/creativeFallbackGenerator';

interface TeacherPresenterFormProps {
  videoType: CreativeVideoTypeMeta;
  userName: string;
  onBackToCreativeStudio: () => void;
  onBackToPilihStudio: () => void;
  initialFormData?: any;
}

// 15 Mode Presentasi Visual Definitions
interface ModeConfig {
  id: TeacherPresentationMode;
  title: string;
  badge: string;
  accentColor: string;
  bgGradient: string;
  borderActive: string;
  icon: React.ComponentType<{ className?: string }>;
  coreLook: string;
  cameraMovement: string;
  defaultStyle: string;
}

const PRESENTATION_MODES: ModeConfig[] = [
  {
    id: 'Hologram',
    title: 'Hologram',
    badge: 'Default Master',
    accentColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    bgGradient: 'from-cyan-900/10 via-sky-900/5 to-slate-900/10',
    borderActive: 'border-cyan-500 ring-2 ring-cyan-400/40 bg-cyan-50/40',
    icon: Sparkles,
    coreLook: 'Presenter hologram biru transparan, HUD melayang, panel neon, projection ring, volumetric glow.',
    cameraMovement: 'Slow orbit, push-in, cinematic depth of field.',
    defaultStyle: 'Futuristic Hologram & Neon HUD',
  },
  {
    id: 'Realistis Studio',
    title: 'Realistis Studio',
    badge: 'Broadcast TV',
    accentColor: 'text-blue-600 bg-blue-50 border-blue-200',
    bgGradient: 'from-blue-900/10 via-slate-800/5 to-slate-900/10',
    borderActive: 'border-blue-500 ring-2 ring-blue-400/40 bg-blue-50/40',
    icon: Tv,
    coreLook: 'Presenter manusia nyata, studio penyiaran profesional, giant curved LED screen, soft lighting.',
    cameraMovement: 'Smooth broadcast pedestal, slow push-in, stable tripod pan.',
    defaultStyle: 'Professional Broadcast Studio',
  },
  {
    id: 'Virtual Studio',
    title: 'Virtual Studio',
    badge: '3D Stage',
    accentColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    bgGradient: 'from-indigo-900/10 via-slate-800/5 to-slate-900/10',
    borderActive: 'border-indigo-500 ring-2 ring-indigo-400/40 bg-indigo-50/40',
    icon: Layers,
    coreLook: 'Studio digital, virtual LED wall volume, floating graphics 3D, modern broadcast look.',
    cameraMovement: 'Sweeping virtual jib shot, smooth tracking, dynamic transition.',
    defaultStyle: 'Digital Virtual Studio & Floating Graphics',
  },
  {
    id: 'Whiteboard',
    title: 'Whiteboard',
    badge: 'Edu Clean',
    accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    bgGradient: 'from-emerald-900/10 via-teal-800/5 to-slate-900/10',
    borderActive: 'border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-50/40',
    icon: Edit3,
    coreLook: 'Papan tulis putih bersih, presenter menjelaskan sambil menunjuk, animasi coretan spidol tangan dinamis.',
    cameraMovement: 'Static medium shot dengan smooth push-in ke diagram yang digambar.',
    defaultStyle: 'Clean Whiteboard & Hand-Drawn Animation',
  },
  {
    id: 'Apple Event',
    title: 'Apple Event',
    badge: 'Keynote Launch',
    accentColor: 'text-slate-800 bg-slate-100 border-slate-300',
    bgGradient: 'from-slate-900/20 via-neutral-900/10 to-slate-900/20',
    borderActive: 'border-slate-800 ring-2 ring-slate-700/40 bg-slate-100',
    icon: Award,
    coreLook: 'Panggung hitam minimalis, single overhead spotlight dramatis, giant screen tipografi tajam.',
    cameraMovement: 'Slow majestic push-in, wide keynote auditorium angle, low-angle hero framing.',
    defaultStyle: 'Minimalist Apple Keynote & Spotlight',
  },
  {
    id: 'Iron Man JARVIS',
    title: 'Iron Man JARVIS',
    badge: 'Stark HUD',
    accentColor: 'text-amber-600 bg-amber-50 border-amber-200',
    bgGradient: 'from-amber-900/10 via-red-900/5 to-slate-900/10',
    borderActive: 'border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/40',
    icon: Scan,
    coreLook: 'HUD merah-oranye-biru elektrik melayang, interface 3D berputar disentuh tangan, scan effect berdenyut.',
    cameraMovement: 'Dynamic cuts menembus layer UI melayang, tech whip-pan, close-up pantulan mata.',
    defaultStyle: 'Stark Tech JARVIS HUD (Red & Blue Neon)',
  },
  {
    id: 'Corporate Futuristic',
    title: 'Corporate Futuristic',
    badge: 'Executive',
    accentColor: 'text-sky-700 bg-sky-50 border-sky-200',
    bgGradient: 'from-sky-900/10 via-slate-800/5 to-slate-900/10',
    borderActive: 'border-sky-500 ring-2 ring-sky-400/40 bg-sky-50/40',
    icon: Building2,
    coreLook: 'Ruang meeting eksekutif premium, layar kaca digital interaktif (smart glass), warna biru-putih elegan.',
    cameraMovement: 'Steadicam orbital movement meja rapat, rack focus antara chart kaca dan presenter.',
    defaultStyle: 'Premium Corporate Futuristic Glass',
  },
  {
    id: 'Sci-Fi Lab',
    title: 'Sci-Fi Lab',
    badge: 'Research',
    accentColor: 'text-teal-600 bg-teal-50 border-teal-200',
    bgGradient: 'from-teal-900/10 via-cyan-900/5 to-slate-900/10',
    borderActive: 'border-teal-500 ring-2 ring-teal-400/40 bg-teal-50/40',
    icon: FlaskConical,
    coreLook: 'Laboratorium sains futuristik, hologram ilmiah melayang, tabung glowing, monitor digital transparan.',
    cameraMovement: 'Floating robotic gimbal glide, slow upward tilt ke objek hologram ilmiah.',
    defaultStyle: 'High-Tech Sci-Fi Laboratory & Hologram',
  },
  {
    id: 'Medical Laboratory',
    title: 'Medical Laboratory',
    badge: 'Clinical 3D',
    accentColor: 'text-rose-600 bg-rose-50 border-rose-200',
    bgGradient: 'from-rose-900/10 via-slate-800/5 to-slate-900/10',
    borderActive: 'border-rose-500 ring-2 ring-rose-400/40 bg-rose-50/40',
    icon: HeartPulse,
    coreLook: 'Laboratorium medis ultra-steril, dokter berjas putih, anatomi hologram 3D melayang, panel diagnosis.',
    cameraMovement: 'Macro close-up anatomi organ berotasi, smooth orbital dolly mengitari presenter.',
    defaultStyle: 'Medical Laboratory & 3D Anatomical Scan',
  },
  {
    id: 'NASA Command Center',
    title: 'NASA Command Center',
    badge: 'Mission Control',
    accentColor: 'text-blue-700 bg-blue-50 border-blue-200',
    bgGradient: 'from-blue-950/20 via-slate-900/10 to-slate-950/20',
    borderActive: 'border-blue-600 ring-2 ring-blue-500/40 bg-blue-50/40',
    icon: Globe,
    coreLook: 'Pusat kendali misi antariksa, layar raksasa bumi & orbit satelit, dashboard konsol komputer bercahaya.',
    cameraMovement: 'Slow dramatic pullback dari layar orbit bumi ke flight director di meja kendali.',
    defaultStyle: 'NASA Mission Control Command Center',
  },
  {
    id: 'Classroom Modern',
    title: 'Classroom Modern',
    badge: 'School Smart',
    accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    bgGradient: 'from-emerald-900/10 via-slate-800/5 to-slate-900/10',
    borderActive: 'border-emerald-600 ring-2 ring-emerald-500/40 bg-emerald-50/40',
    icon: GraduationCap,
    coreLook: 'Ruang kelas kontemporer cerah, smartboard interaktif materi edukasi warna-warni, suasana sekolah modern.',
    cameraMovement: 'Friendly eye-level perspective, natural pan mengikuti gestur energik guru ke smartboard.',
    defaultStyle: 'Clean Modern Classroom & Smartboard',
  },
  {
    id: 'Cartoon 3D',
    title: 'Cartoon 3D',
    badge: 'Animated Fun',
    accentColor: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    bgGradient: 'from-yellow-900/10 via-amber-800/5 to-slate-900/10',
    borderActive: 'border-yellow-500 ring-2 ring-yellow-400/40 bg-yellow-50/40',
    icon: Smile,
    coreLook: 'Presenter kartun 3D lucu & ramah, warna cerah ceria, alat peraga 3D ekspresif dan pop-up.',
    cameraMovement: 'Snappy animated camera movements, bouncy zoom mengikuti ekspresi wajah kartun.',
    defaultStyle: 'Vibrant 3D Stylized Cartoon',
  },
  {
    id: 'Pixar Style',
    title: 'Pixar Style',
    badge: 'Feature Film',
    accentColor: 'text-orange-600 bg-orange-50 border-orange-200',
    bgGradient: 'from-orange-900/10 via-amber-900/5 to-slate-900/10',
    borderActive: 'border-orange-500 ring-2 ring-orange-400/40 bg-orange-50/40',
    icon: Film,
    coreLook: 'Karakter 3D berkualitas studio Pixar, mata ekspresif hidup, subsurface scattering, cinematic lighting hangat.',
    cameraMovement: 'Cinema-grade virtual prime lens, gentle emotional camera breathing, warm bounce lighting.',
    defaultStyle: 'Warm 3D Animated Feature Film (Pixar Aesthetic)',
  },
  {
    id: 'Disney Style',
    title: 'Disney Style',
    badge: 'Magical Charm',
    accentColor: 'text-purple-600 bg-purple-50 border-purple-200',
    bgGradient: 'from-purple-900/10 via-pink-900/5 to-slate-900/10',
    borderActive: 'border-purple-500 ring-2 ring-purple-400/40 bg-purple-50/40',
    icon: Wand2,
    coreLook: 'Karakter 3D lembut bersahabat, senyum ramah menyapa penonton, aksen kilau magis, family friendly.',
    cameraMovement: 'Sweeping fairy-tale smooth camera paths, soft warm diffused atmosphere.',
    defaultStyle: 'Soft Family-Friendly 3D Animated (Disney Aesthetic)',
  },
  {
    id: 'Mixed Reality (AR)',
    title: 'Mixed Reality (AR)',
    badge: 'Spatial AR',
    accentColor: 'text-violet-600 bg-violet-50 border-violet-200',
    bgGradient: 'from-violet-900/10 via-fuchsia-900/5 to-slate-900/10',
    borderActive: 'border-violet-500 ring-2 ring-violet-400/40 bg-violet-50/40',
    icon: Scan,
    coreLook: 'Presenter manusia nyata di dunia fisik, objek hologram 3D melayang tepat di depan presenter, interaksi sentuhan nyata.',
    cameraMovement: 'Steadicam dengan paralaks fisik nyata antara presenter, objek AR melayang, dan ruang ruangan.',
    defaultStyle: 'Photorealistic Augmented Reality (Live Action + AR)',
  },
];

// Presets Cepat
interface QuickPreset {
  title: string;
  mode: TeacherPresentationMode;
  targetUser: string;
  videoGoal: string;
  topic: string;
  audience: string;
  duration: string;
  sceneCount: string;
  presenterDesc: string;
  brief: string;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    title: '⚡ Edukasi Hologram',
    mode: 'Hologram',
    targetUser: 'Guru',
    videoGoal: 'Mengajar / Edukasi',
    topic: 'Sistem Saraf: Anatomi sel neuron, transmisi impuls sinapsis, dan koordinasi otak ke organ tubuh',
    audience: 'Siswa SMA',
    duration: '3 menit',
    sceneCount: '8 Scene',
    presenterDesc: 'Ibu Guru sains muda berwibawa, busana formal blazer navy dalam proyeksi hologram biru transparan bercahaya',
    brief: 'Tampilkan visualisasi 3D neuron berdenyut cahaya saat menjelaskan transmisi sinapsis kimiawi, orbit kamera lambat',
  },
  {
    title: '⚡ Guru Kelas Modern',
    mode: 'Classroom Modern',
    targetUser: 'Guru',
    videoGoal: 'Mengajar / Edukasi',
    topic: 'Rumus Pythagoras & Geometri Ruang Tiga Dimensi',
    audience: 'Siswa SMP / SMA',
    duration: '1 menit',
    sceneCount: '5 Scene',
    presenterDesc: 'Pak Guru ramah energik mengenakan kemeja batik kontemporer rapi di depan smartboard interaktif',
    brief: 'Interaksi aktif menyentuh smartboard digital dengan animasi rotasi kubus 3D berwarna terang',
  },
  {
    title: '⚡ Apple Event Launch',
    mode: 'Apple Event',
    targetUser: 'Content Creator',
    videoGoal: 'Penjelasan Produk',
    topic: 'Peluncuran Next-Gen Neural Engine AI: Efisiensi Komputasi 10x Lebih Hemat Daya',
    audience: 'Profesional / Korporat',
    duration: '2 menit',
    sceneCount: '6 Scene',
    presenterDesc: 'Keynote Speaker kharismatik mengenakan turtleneck hitam minimalis dengan gestur tangan tenang dan presisi',
    brief: 'Panggung gelap minimalis, spotlight tunggal dramatis menyorot speaker, layar raksasa beresolusi tinggi',
  },
  {
    title: '⚡ Medical Hologram',
    mode: 'Medical Laboratory',
    targetUser: 'Dokter / Medis',
    videoGoal: 'Mengajar / Edukasi',
    topic: 'Sirkulasi Jantung & Anatomi Katup: Mekanisme Pompa Darah Sistol dan Diastol',
    audience: 'Mahasiswa Kedokteran',
    duration: '2 menit',
    sceneCount: '6 Scene',
    presenterDesc: 'Dokter spesialis berjas putih bersih dengan stetoskop di leher, berbicara artikulatif',
    brief: 'Hologram jantung 3D berdenyut melayang di samping dokter, irisan bilik dan serambi tampak detail transparan',
  },
  {
    title: '⚡ JARVIS Tech',
    mode: 'Iron Man JARVIS',
    targetUser: 'Content Creator',
    videoGoal: 'Tutorial Interaktif',
    topic: 'Arsitektur Autonomous AI Agent: Perception, Memory, Reasoning, dan Action Engine',
    audience: 'Developer & Penggiat AI',
    duration: '1 menit',
    sceneCount: '5 Scene',
    presenterDesc: 'Tech Innovator muda mengenakan pakaian kasual berkelas dan kacamata pintar AR tipis',
    brief: 'Panel melayang HUD merah-biru diputar dan diperbesar menggunakan gestur jari tangan presenter',
  },
  {
    title: '⚡ Whiteboard Cepat',
    mode: 'Whiteboard',
    targetUser: 'Pelatih / Trainer',
    videoGoal: 'Mengajar / Edukasi',
    topic: 'Framework Time Management Eisenhower Matrix: Kuadran Mendesak vs Penting',
    audience: 'Umum / Pemula',
    duration: '1 menit',
    sceneCount: '4 Scene',
    presenterDesc: 'Trainer produktivitas energik memegang spidol warna hitam dan merah di depan papan tulis',
    brief: 'Coretan garis dan diagram 4 kuadran menggambar sendiri secara dinamis di papan tulis saat dijelaskan',
  },
];

const TARGET_USER_OPTIONS = [
  'Guru',
  'Dosen',
  'Pelatih / Trainer',
  'Content Creator',
  'Pembicara Bisnis',
  'Dokter / Medis',
  'Peneliti / Scientist',
  'Custom',
];

const VIDEO_GOAL_OPTIONS = [
  'Mengajar / Edukasi',
  'Presentasi Bisnis / Pitching',
  'Penjelasan Produk',
  'Tutorial Interaktif',
  'Motivasi / Public Speaking',
  'Penyuluhan Medis',
  'Custom',
];

const TARGET_AUDIENCE_OPTIONS = [
  'Siswa SD',
  'Siswa SMP',
  'Siswa SMA',
  'Mahasiswa',
  'Profesional / Korporat',
  'Umum / Pemula',
  'Custom',
];

const DURATION_OPTIONS = ['15 detik', '30 detik', '1 menit', '2 menit', '3 menit', 'Custom'];
const SCENE_OPTIONS = ['3 Scene', '5 Scene', '8 Scene', '10 Scene', 'Otomatis'];

export const TeacherPresenterForm: React.FC<TeacherPresenterFormProps> = ({
  videoType,
  userName,
  onBackToCreativeStudio,
  onBackToPilihStudio,
  initialFormData,
}) => {
  // Modal State
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false);

  // 1. MASTER STYLE: Mode Presentasi (Default = Hologram)
  const [presentationMode, setPresentationMode] = useState<TeacherPresentationMode>(
    initialFormData?.presentationMode || 'Hologram'
  );

  // 2. Form Inputs
  const [targetUser, setTargetUser] = useState<string>(initialFormData?.targetUser || 'Guru');
  const [customTargetUser, setCustomTargetUser] = useState<string>('');

  const [videoGoal, setVideoGoal] = useState<string>(initialFormData?.videoGoal || 'Mengajar / Edukasi');
  const [customVideoGoal, setCustomVideoGoal] = useState<string>('');

  const [topicContent, setTopicContent] = useState<string>(
    initialFormData?.topicContent ||
      initialFormData?.videoIdea ||
      'Sistem Saraf: Struktur neuron, transmisi sinapsis kimiawi, dan koordinasi otak ke seluruh tubuh'
  );

  const [targetAudience, setTargetAudience] = useState<string>(initialFormData?.targetAudience || 'Siswa SMA');
  const [customTargetAudience, setCustomTargetAudience] = useState<string>('');

  const [duration, setDuration] = useState<string>(initialFormData?.duration || '3 menit');
  const [customDurationMinutes, setCustomDurationMinutes] = useState<number>(3);

  const [sceneCount, setSceneCount] = useState<string>(initialFormData?.sceneCount || '8 Scene');

  // Gaya Visual: Default mengikuti Mode Presentasi, tapi user boleh mengganti
  const activeModeConfig =
    PRESENTATION_MODES.find((m) => m.id === presentationMode) || PRESENTATION_MODES[0];
  const [visualStyle, setVisualStyle] = useState<string>(
    initialFormData?.visualStyle || activeModeConfig.defaultStyle
  );
  const [isCustomStyleSelected, setIsCustomStyleSelected] = useState<boolean>(false);

  // Karakter Presenter
  const [presenterName, setPresenterName] = useState<string>(initialFormData?.presenterName || '');
  const [presenterDescription, setPresenterDescription] = useState<string>(
    initialFormData?.characterDescription ||
      'Ibu Guru sains muda berwibawa, berhijab abu-abu terang dan blazer rapi, artikulatif dan percaya diri'
  );

  // Brief Opsional
  const [optionalBrief, setOptionalBrief] = useState<string>(
    initialFormData?.optionalBrief ||
      'Pastikan gestur mengajar natural, tatapan mata stabil ke kamera, visualisasi materi muncul selaras saat diucapkan'
  );

  // Image References (Character sheet / slide / diagram references)
  const [references, setReferences] = useState<UploadedImage[]>(initialFormData?.references || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation & Result State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>('Menyiapkan generator...');
  const [analysisResult, setAnalysisResult] = useState<CreativeAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When presentation mode changes, update the derived visual style unless user explicitly overrode it
  const handleSelectMode = (modeId: TeacherPresentationMode) => {
    setPresentationMode(modeId);
    const targetConfig = PRESENTATION_MODES.find((m) => m.id === modeId);
    if (targetConfig && !isCustomStyleSelected) {
      setVisualStyle(targetConfig.defaultStyle);
    }
  };

  // Apply Quick Preset
  const handleApplyPreset = (preset: QuickPreset) => {
    setPresentationMode(preset.mode);
    setTargetUser(preset.targetUser);
    setVideoGoal(preset.videoGoal);
    setTopicContent(preset.topic);
    setTargetAudience(preset.audience);
    setDuration(preset.duration);
    setSceneCount(preset.sceneCount);
    setPresenterDescription(preset.presenterDesc);
    setOptionalBrief(preset.brief);

    const cfg = PRESENTATION_MODES.find((m) => m.id === preset.mode);
    if (cfg) {
      setVisualStyle(cfg.defaultStyle);
      setIsCustomStyleSelected(false);
    }
  };

  // Upload References
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (references.length >= 6) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64Str = reader.result as string;
        setReferences((prev) => [
          ...prev,
          {
            id: `tp-ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            previewUrl: base64Str,
            size: file.size,
            mimeType: file.type || 'image/jpeg',
            base64: base64Str,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveReference = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const effectiveTargetUser = targetUser === 'Custom' ? customTargetUser.trim() || 'Presenter' : targetUser;
    const effectiveVideoGoal = videoGoal === 'Custom' ? customVideoGoal.trim() || 'Mengajar' : videoGoal;
    const effectiveAudience = targetAudience === 'Custom' ? customTargetAudience.trim() || 'Umum' : targetAudience;
    const effectiveDuration = duration === 'Custom' ? `${customDurationMinutes} menit` : duration;

    // Check BYOK Session Key
    const sessionKey = sessionStorage.getItem('ai_affiliate_session_key');
    if (!sessionKey) {
      setErrorMessage(
        'Gemini API Key pengguna tidak ditemukan dalam sesi aktif ZEO. Silakan masuk kembali dengan API Key Anda atau klik tombol "Ganti API Key" di bawah.'
      );
      return;
    }

    setIsLoading(true);
    setLoadingStepText('Menghubungkan ke Gemini dengan API Key Anda...');

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStepText(`Menerapkan Master Style Mode Presentasi "${presentationMode}"...`);
      }, 1000);

      const stepTimer2 = setTimeout(() => {
        setLoadingStepText(`Menyusun Storyboard ${sceneCount} (@${effectiveDuration}) untuk materi "${topicContent.slice(0, 30)}..."`);
      }, 2500);

      const stepTimer3 = setTimeout(() => {
        setLoadingStepText(`Menyelaraskan lighting, HUD/hologram, kamera orbit, dan konsistensi presenter...`);
      }, 4500);

      const payload = {
        videoTypeId: 'teacher-presenter',
        videoTypeTitle: 'Teacher & Presenter',
        videoTypeCategory: 'Education',
        presentationMode,
        targetUser: effectiveTargetUser,
        videoGoal: effectiveVideoGoal,
        topicContent: topicContent.trim(),
        videoIdea: topicContent.trim(),
        targetAudience: effectiveAudience,
        duration: effectiveDuration,
        sceneCount,
        visualStyle,
        presenterName: presenterName.trim(),
        characterDescription: presenterDescription.trim(),
        characterChoice: 'Karakter dari Teks',
        optionalBrief: optionalBrief.trim(),
        audio: 'Voice Over',
        platform: 'TikTok / Reels / Shorts',
        references,
        apiKey: sessionKey,
      };

      const response = await fetch('/api/creative-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server status: ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setAnalysisResult(resJson.data);
      } else {
        throw new Error(resJson.error || 'Hasil tidak valid dari AI.');
      }
    } catch (err: any) {
      console.error('[TeacherPresenterForm] Generation error:', err);
      // STRICTLY BYOK: If user has key, report error
      const activeUserKey = sessionStorage.getItem('ai_affiliate_session_key');
      if (activeUserKey) {
        setErrorMessage(
          err?.message ||
            'Generate gagal menggunakan Gemini API Key Anda. Periksa kuota atau izin project Anda.'
        );
      } else {
        // Fallback generator
        const fallbackData = generateCreativeFallbackResult(
          videoType,
          {
            references,
            characterChoice: 'Karakter dari Teks',
            characterSheetImage: null,
            characterDescription: presenterDescription,
            characterLock: true,
            videoIdea: topicContent,
            presentationMode,
            targetUser: effectiveTargetUser,
            videoGoal: effectiveVideoGoal,
            topicContent,
            targetAudience: effectiveAudience,
            presenterName,
            optionalBrief,
            duration: effectiveDuration as any,
            customDurationSeconds: 180,
            sceneCount: sceneCount as any,
            visualStyle: visualStyle as any,
            audio: 'Voice Over',
            platform: 'TikTok / Reels / Shorts',
          },
          userName
        );
        setAnalysisResult(fallbackData);
      }
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePilihStudioClick = () => {
    const hasWork = topicContent.trim().length > 0 || references.length > 0 || !!analysisResult;
    if (hasWork) {
      setShowUnsavedWarning(true);
    } else {
      onBackToPilihStudio();
    }
  };

  // If we already have results, show CreativeResultViewer
  if (analysisResult) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-back-to-pilih-studio-result"
              onClick={handlePilihStudioClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <span>← Pilih Studio</span>
            </button>
            <button
              type="button"
              id="btn-back-to-form-edit"
              onClick={() => setAnalysisResult(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-600" />
              <span>← Kembali ke Pengaturan Teacher & Presenter</span>
            </button>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            Mode: {presentationMode}
          </span>
        </div>

        <CreativeResultViewer
          result={analysisResult}
          videoType={videoType}
          userName={userName}
          onEditConcept={() => {
            setAnalysisResult(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Unsaved Warning Modal */}
        {showUnsavedWarning && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⚠️
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Perhatian</h4>
                  <p className="text-xs text-slate-500">Konfirmasi perpindahan halaman</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Proyek saat ini belum disimpan. Lanjutkan?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnsavedWarning(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Tetap di Sini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedWarning(false);
                    onBackToPilihStudio();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="form-teacher-presenter" className="space-y-6 sm:space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-back-to-pilih-studio"
            onClick={handlePilihStudioClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span>← Pilih Studio</span>
          </button>
          <button
            type="button"
            id="btn-back-to-creative-list"
            onClick={onBackToCreativeStudio}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span>← Studio Kreatif</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
            <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
            Teacher & Presenter
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Master Style Driven
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-cyan-950 via-slate-900 to-blue-950 p-6 sm:p-8 text-white shadow-xl border border-cyan-800/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Master Style Presentation Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Teacher & Presenter Studio
          </h1>
          <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed">
            Pilih <strong>Mode Presentasi</strong> sebagai Master Style yang mengontrol penuh visual presenter, tata panggung, lighting, kamera, overlay data, dan seluruh prompt video scene.
          </p>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Preset Cepat 1-Klik</h3>
              <p className="text-xs text-slate-500">Pilih skenario siap pakai yang langsung mengisi seluruh konfigurasi</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.title}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-left p-3 rounded-2xl border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all cursor-pointer group active:scale-95"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 flex items-center gap-1">
                <span>{p.title}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {p.mode} • {p.duration}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ======================================================== */}
        {/* 1. LANGKAH PERTAMA: MODE PRESENTASI (MASTER STYLE)        */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg">
                🎬
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Langkah 1: Mode Presentasi
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-100 text-cyan-800 border border-cyan-200">
                    Master Style
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Pilihan paling atas yang memengaruhi seluruh output: visual presenter, background, HUD/hologram, lighting, kamera, dan prompt video.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">
                Terpilih:{' '}
                <strong className="text-cyan-700 font-bold">{presentationMode}</strong>
              </span>
            </div>
          </div>

          {/* 15 Visual Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {PRESENTATION_MODES.map((mode) => {
              const isSelected = presentationMode === mode.id;
              const IconComp = mode.icon;

              return (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => handleSelectMode(mode.id)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between relative overflow-hidden group active:scale-98 ${
                    isSelected
                      ? `${mode.borderActive} shadow-md`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  {/* Active Indicator Checkmark */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? mode.accentColor : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="pr-5">
                        <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                          {mode.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {mode.badge}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-3">
                      {mode.coreLook}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="line-clamp-1 font-mono">🎥 {mode.cameraMovement.split(',')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-100 flex items-start gap-2.5 text-xs text-cyan-900">
            <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <p>
              <strong>Master Style Lock:</strong> Seluruh scene pada naskah, prompt gambar, dan video prompt otomatis mematuhi aturan mode <strong>{presentationMode}</strong>. Gaya visual di Langkah 7 otomatis diselaraskan secara cerdas.
            </p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. DETAIL MATERI & KONTEN VIDEO                          */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
              📚
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Langkah 2: Materi & Tujuan Pembelajaran
              </h2>
              <p className="text-xs text-slate-500">
                Tentukan target pengguna, tujuan presentasi, materi utama, dan target penonton
              </p>
            </div>
          </div>

          {/* 1. Target Pengguna & 2. Tujuan Video */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Pengguna */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                1. Target Pengguna
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TARGET_USER_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTargetUser(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      targetUser === opt
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {targetUser === 'Custom' && (
                <input
                  type="text"
                  value={customTargetUser}
                  onChange={(e) => setCustomTargetUser(e.target.value)}
                  placeholder="Ketik peran pengguna kustom..."
                  className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              )}
            </div>

            {/* Tujuan Video */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                2. Tujuan Video
              </label>
              <div className="flex flex-wrap gap-1.5">
                {VIDEO_GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setVideoGoal(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      videoGoal === opt
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {videoGoal === 'Custom' && (
                <input
                  type="text"
                  value={customVideoGoal}
                  onChange={(e) => setCustomVideoGoal(e.target.value)}
                  placeholder="Ketik tujuan video kustom..."
                  className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              )}
            </div>
          </div>

          {/* 3. Materi / Topik */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                3. Materi / Topik Bahasan <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Wajib diisi secara jelas
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={topicContent}
              onChange={(e) => setTopicContent(e.target.value)}
              placeholder="Contoh: Sistem Saraf — Jelaskan fungsi neuron sensorik dan motorik, transmisi sinapsis kimiawi dengan neurotransmitter, dan respons refleks secara visual interaktif..."
              className="w-full p-3.5 text-xs sm:text-sm border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 leading-relaxed"
            />
          </div>

          {/* 4. Target Penonton */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              4. Target Penonton
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TARGET_AUDIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTargetAudience(opt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    targetAudience === opt
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {targetAudience === 'Custom' && (
              <input
                type="text"
                value={customTargetAudience}
                onChange={(e) => setCustomTargetAudience(e.target.value)}
                placeholder="Target penonton khusus..."
                className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. DURASI, SCENE & GAYA VISUAL                           */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
              ⏱️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Langkah 3: Durasi, Jumlah Scene & Gaya Visual
              </h2>
              <p className="text-xs text-slate-500">
                Atur ritme video dan verifikasi gaya visual turunan dari Mode Presentasi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 5. Durasi */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                5. Durasi Total Video
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDuration(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      duration === opt
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {duration === 'Custom' && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={customDurationMinutes}
                    onChange={(e) => setCustomDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-xs text-slate-500">menit</span>
                </div>
              )}
            </div>

            {/* 6. Jumlah Scene */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                6. Jumlah Scene Storyboard
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SCENE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSceneCount(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sceneCount === opt
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {presentationMode === 'Hologram' && duration === '3 menit' ? 'Rekomendasi: 8 Scene untuk penjelasan komprehensif.' : 'ZEO menyusun scene secara proporsional sesuai durasi.'}
              </p>
            </div>
          </div>

          {/* 7. Gaya Visual (Turunan Otomatis dari Mode Presentasi) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                7. Gaya Visual
              </label>
              <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                🎯 Turunan dari Mode {presentationMode}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={visualStyle}
                onChange={(e) => {
                  setVisualStyle(e.target.value);
                  setIsCustomStyleSelected(true);
                }}
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium text-slate-900"
              />
              <button
                type="button"
                onClick={() => {
                  const cfg = PRESENTATION_MODES.find((m) => m.id === presentationMode);
                  if (cfg) {
                    setVisualStyle(cfg.defaultStyle);
                    setIsCustomStyleSelected(false);
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Reset ke Default Mode
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Pengguna bebas mengubah teks Gaya Visual di atas, namun default otomatis terkunci pada mode yang dipilih.
            </p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. KARAKTER PRESENTER, BRIEF & REFERENSI                 */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg">
              👤
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Langkah 4: Karakter Presenter & Brief Sutradara
              </h2>
              <p className="text-xs text-slate-500">
                Tentukan ciri fisik presenter dan catatan khusus penyutradaraan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama & Deskripsi Karakter Presenter */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  8. Nama Presenter (Opsional)
                </label>
                <input
                  type="text"
                  value={presenterName}
                  onChange={(e) => setPresenterName(e.target.value)}
                  placeholder="Contoh: Ibu Guru Sarah / Dr. David / Alex Tan"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Deskripsi Penampilan, Gender & Busana
                </label>
                <textarea
                  rows={3}
                  value={presenterDescription}
                  onChange={(e) => setPresenterDescription(e.target.value)}
                  placeholder="Contoh: Ibu Guru muda usia 28 tahun, kacamata elegan, blazer navy rapi, pashmina abu-abu terang, artikulatif dan percaya diri..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 leading-relaxed"
                />
              </div>
            </div>

            {/* 9. Brief Opsional */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                9. Brief Opsional (Catatan Sutradara & Gestur)
              </label>
              <textarea
                rows={6}
                value={optionalBrief}
                onChange={(e) => setOptionalBrief(e.target.value)}
                placeholder="Contoh: Gestur tangan terbuka mengarah ke HUD melayang, tatapan mata stabil ke arah kamera seolah berinteraksi langsung dengan audiens, tempo bicara tenang dan berwibawa..."
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 leading-relaxed"
              />
            </div>
          </div>

          {/* Upload Referensi Tambahan (Character reference / slide gambar) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Upload Foto Referensi Presenter / Slide Materi (Maks. 6 Gambar)
              </label>
              <span className="text-[11px] text-slate-400">
                {references.length} / 6 diunggah
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {references.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-2xl overflow-hidden aspect-square border border-slate-200 bg-slate-100"
                >
                  <img
                    src={img.base64}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveReference(img.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-0 inset-x-0 bg-slate-950/75 text-[10px] text-white px-1.5 py-0.5 truncate text-center">
                    {img.name}
                  </span>
                </div>
              ))}

              {references.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-cyan-500 bg-slate-50 hover:bg-cyan-50/50 flex flex-col items-center justify-center p-3 text-center transition-colors cursor-pointer group"
                >
                  <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 mb-1" />
                  <span className="text-[11px] font-bold text-slate-600 group-hover:text-cyan-700">
                    Tambah Foto
                  </span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </section>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Gagal Melakukan Analisis</span>
            </div>
            <p className="leading-relaxed">{errorMessage}</p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-byok-change-modal'))}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Ganti / Masukkan API Key
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">
                Mode: {presentationMode}
              </div>
              <div className="text-[11px] text-slate-500">
                {duration} • {sceneCount} • {targetAudience}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !topicContent.trim()}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              isLoading || !topicContent.trim()
                ? 'bg-slate-400 cursor-not-allowed opacity-70'
                : 'bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 hover:shadow-cyan-500/25'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{loadingStepText}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Teacher & Presenter Video Blueprint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
