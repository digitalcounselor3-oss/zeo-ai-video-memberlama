import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploadArea } from './components/ImageUploadArea';
import { CharacterModelSelector } from './components/CharacterModelSelector';
import { AdditionalNotes } from './components/AdditionalNotes';
import { DurationAndSceneSelector } from './components/DurationAndSceneSelector';
import { StyleSelector } from './components/StyleSelector';
import { AudioAndPlatformSelector } from './components/AudioAndPlatformSelector';
import { ResultSection } from './components/ResultSection';
import { Beranda } from './components/Beranda';
import { TopUserBar } from './components/TopUserBar';
import { PilihStudio } from './components/PilihStudio';
import { CreativeStudio } from './components/CreativeStudio';
import { ByokConnectionTest } from './components/ByokConnectionTest';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppFooter } from './components/common/AppFooter';
import { HelpModal } from './components/common/HelpModal';
import { AboutModal } from './components/common/AboutModal';
import { OnboardingGuideModal } from './components/common/OnboardingGuideModal';
import {
  VideoDuration,
  SceneCount,
  VideoStyle,
  AudioOption,
  PlatformOption,
  CharacterOption,
  UploadedImage,
  AnalysisResult,
} from './types';
import { Sparkles, RotateCcw, ArrowDown, ArrowUp, PlusCircle, UserCheck, ArrowLeft } from 'lucide-react';

const LOADING_STEPS = [
  'Menganalisis referensi...',
  'Menyusun storyboard...',
  'Menghasilkan prompt gambar...',
  'Menghasilkan prompt video...',
  'Menyelaraskan konsistensi karakter...',
];

export default function App() {
  // Session State (BYOK & User Identity)
  const [userName, setUserName] = useState<string>(() => {
    try {
      return sessionStorage.getItem('ai_affiliate_user_name') || '';
    } catch {
      return '';
    }
  });

  const [currentView, setCurrentView] = useState<'beranda' | 'pilih-studio' | 'affiliate' | 'creative' | 'byok-test'>(() => {
    try {
      const savedUser = sessionStorage.getItem('ai_affiliate_user_name');
      return savedUser ? 'pilih-studio' : 'beranda';
    } catch {
      return 'beranda';
    }
  });

  const [isInitialZeoAuto, setIsInitialZeoAuto] = useState<boolean>(false);

  // Unsaved Warning & New Project Modal States (Requirement #5 & #8)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false);
  const [showNewProjectConfirm, setShowNewProjectConfirm] = useState<boolean>(false);

  // Generator Form States
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [characterOption, setCharacterOption] = useState<CharacterOption>('Otomatis dari Referensi');
  const [characterLock, setCharacterLock] = useState<boolean>(true);
  const [characterSheet, setCharacterSheet] = useState<UploadedImage | null>(null);
  const [characterDescription, setCharacterDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [duration, setDuration] = useState<VideoDuration>('10 detik');
  const [sceneCount, setSceneCount] = useState<SceneCount>('1 Scene');
  const [style, setStyle] = useState<VideoStyle>('Otomatis');
  const [audio, setAudio] = useState<AudioOption>('Tanpa VO');
  const [platform, setPlatform] = useState<PlatformOption>('Semua Platform');

  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Requirement #6 & UI finishing states
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [showKeepCharacterModal, setShowKeepCharacterModal] = useState<boolean>(false);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  // General Finishing Modals (Help, About, Onboarding)
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const resultRef = useRef<HTMLDivElement>(null);

  // Cycle loading steps during submit
  useEffect(() => {
    let timer: any = null;
    if (isSubmitting) {
      setLoadingStepIndex(0);
      timer = setInterval(() => {
        setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2000);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSubmitting]);

  // Requirement #13: Floating Back to Top button
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 350) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (name: string, key?: string) => {
    setUserName(name);
    try {
      sessionStorage.setItem('ai_affiliate_user_name', name);
      if (key) {
        sessionStorage.setItem('ai_affiliate_session_key', key);
      }
      const dismissed = sessionStorage.getItem('zeo_onboarding_dismissed');
      if (dismissed !== 'true') {
        setShowOnboarding(true);
      }
    } catch {
      // ignore
    }
    // Route to Pilih Studio as requested
    setCurrentView('pilih-studio');
  };

  const handleCloseOnboarding = (dontShowAgainThisSession: boolean) => {
    if (dontShowAgainThisSession) {
      try {
        sessionStorage.setItem('zeo_onboarding_dismissed', 'true');
      } catch {
        // ignore
      }
    }
    setShowOnboarding(false);
  };

  const handleLogout = () => {
    setUserName('');
    try {
      sessionStorage.removeItem('ai_affiliate_user_name');
      sessionStorage.removeItem('ai_affiliate_session_key');
    } catch {
      // ignore
    }
    handleResetForm();
    setCurrentView('beranda');
  };

  // Requirement #3 & #8: Navigasi ke Pilih Studio dengan Unsaved Warning
  const handleNavToPilihStudio = () => {
    if (analysisResult) {
      setShowUnsavedWarning(true);
    } else {
      setCurrentView('pilih-studio');
    }
  };

  const handleCharacterOptionChange = (newOption: CharacterOption) => {
    setCharacterOption(newOption);
    if (newOption === 'Upload Character Sheet' || newOption === 'Buat Karakter dari Teks') {
      setCharacterLock(true);
    } else if (newOption === 'Tanpa Model') {
      setCharacterLock(false);
    } else {
      setCharacterLock(true);
    }
  };

  const handleAddImages = (newImages: UploadedImage[]) => {
    setImages((prev) => [...prev, ...newImages].slice(0, 6));
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleResetForm = () => {
    setImages([]);
    setCharacterOption('Otomatis dari Referensi');
    setCharacterLock(true);
    setCharacterSheet(null);
    setCharacterDescription('');
    setNotes('');
    setDuration('10 detik');
    setSceneCount('1 Scene');
    setStyle('Otomatis');
    setAudio('Tanpa VO');
    setPlatform('Semua Platform');
    setHasGenerated(false);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  // Requirement #5 & #6: Proyek Baru handler
  const hasCustomCharacter =
    characterLock &&
    (characterOption === 'Upload Character Sheet' ||
      characterOption === 'Buat Karakter dari Teks' ||
      characterSheet !== null ||
      characterDescription.trim().length > 0);

  const handleProyekBaruClick = () => {
    setShowNewProjectConfirm(true);
  };

  const handleConfirmProyekBaru = () => {
    setShowNewProjectConfirm(false);
    if (hasCustomCharacter) {
      setShowKeepCharacterModal(true);
    } else {
      executeProyekBaru(false);
    }
  };

  const executeProyekBaru = (keepCharacter: boolean) => {
    setImages([]);
    setNotes('');
    setAnalysisResult(null);
    setHasGenerated(false);
    setErrorMessage(null);

    if (!keepCharacter) {
      setCharacterOption('Otomatis dari Referensi');
      setCharacterLock(true);
      setCharacterSheet(null);
      setCharacterDescription('');
    }

    setShowKeepCharacterModal(false);
    scrollToTop();
  };

  const handleGenerateClick = async () => {
    // 1. Validation for empty images (Requirement #11)
    if (images.length === 0) {
      setErrorMessage('Silakan unggah minimal 1 gambar referensi.');
      setAnalysisResult(null);
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setErrorMessage(null);
    setShowSuccessToast(false);
    setIsSubmitting(true);
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      // Ensure all images have valid base64 data before sending
      const payloadImages = await Promise.all(
        images.map(async (img) => {
          let b64 = img.base64 || '';
          let mime = img.mimeType || 'image/jpeg';

          if (!b64 || b64.startsWith('blob:')) {
            try {
              const res = await fetch(img.previewUrl);
              const blob = await res.blob();
              mime = blob.type || mime;
              b64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string) || '');
                reader.onerror = () => resolve('');
                reader.readAsDataURL(blob);
              });
            } catch (convErr) {
              console.warn('Failed converting blob to base64 for:', img.name, convErr);
            }
          }

          return {
            name: img.name,
            mimeType: mime,
            base64: b64,
          };
        })
      );

      const validPayload = payloadImages.filter((p) => p.base64 && p.base64.length > 0);
      if (validPayload.length === 0) {
        setErrorMessage('Gambar belum berhasil dianalisis. Silakan coba kembali.');
        setIsSubmitting(false);
        return;
      }

      // Prepare character sheet payload if provided
      let characterSheetPayload: { name: string; mimeType: string; base64: string } | null = null;
      if (characterOption === 'Upload Character Sheet' && characterSheet) {
        let csB64 = characterSheet.base64 || '';
        let csMime = characterSheet.mimeType || 'image/jpeg';
        if (!csB64 || csB64.startsWith('blob:')) {
          try {
            const res = await fetch(characterSheet.previewUrl);
            const blob = await res.blob();
            csMime = blob.type || csMime;
            csB64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve((reader.result as string) || '');
              reader.onerror = () => resolve('');
              reader.readAsDataURL(blob);
            });
          } catch (csErr) {
            console.warn('Failed converting character sheet blob to base64:', csErr);
          }
        }
        if (csB64 && csB64.length > 0) {
          characterSheetPayload = {
            name: characterSheet.name,
            mimeType: csMime,
            base64: csB64,
          };
        }
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: validPayload,
          characterOption,
          characterLock: characterOption === 'Tanpa Model' ? false : characterLock,
          characterSheet: characterSheetPayload,
          characterDescription,
          notes,
          duration,
          sceneCount,
          style,
          audio,
          platform,
          apiKey: sessionStorage.getItem('ai_affiliate_session_key') || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(
          json.error || 'Gambar belum berhasil dianalisis. Silakan coba kembali.'
        );
        setAnalysisResult(null);
      } else {
        setAnalysisResult(json.data);
        setHasGenerated(true);
        setErrorMessage(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 6000);
        // Requirement #13: Scroll to result otomatis
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } catch (err: any) {
      console.error('[Frontend Analysis Error]:', err);
      setErrorMessage(
        err?.message || 'Layanan Gemini sedang mengalami kendala. Silakan coba kembali.'
      );
      setAnalysisResult(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to create real PNG sample images on HTML5 canvas for Gemini vision recognition
  const generateSamplePng = (
    label: string,
    title: string,
    desc: string,
    badgeColor: string,
    bgTone: string
  ): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Canvas background
    ctx.fillStyle = bgTone;
    ctx.fillRect(0, 0, 600, 600);

    // Frame styling
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 560, 560);

    // Header badge
    ctx.fillStyle = badgeColor;
    ctx.beginPath();
    ctx.roundRect(40, 40, 240, 50, 10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 160, 74);

    // Title text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 300, 280);

    // Description text
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(desc, 300, 330);

    // Footer mock branding
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Marketplace Verified • Visual Product Lock Reference', 300, 520);

    return canvas.toDataURL('image/png');
  };

  const handleLoadSampleImages = () => {
    const s1 = generateSamplePng(
      'FOTO PRODUK',
      'Hoodie Oversize Hitam',
      'Katun Fleece 330gsm • Warna Hitam Solid Polos',
      '#4f46e5',
      '#f8fafc'
    );
    const s2 = generateSamplePng(
      'FOTO MODEL',
      'Model Wanita Berhijab',
      'Casual Outdoor Walking • Celana Jeans Loose',
      '#ec4899',
      '#fff1f2'
    );
    const s3 = generateSamplePng(
      'SCREENSHOT TOKO',
      'Deskripsi Tokopedia Listing',
      'Bahan Tebal Lembut • Ready Size M L XL XXL',
      '#10b981',
      '#f0fdf4'
    );

    const samples: UploadedImage[] = [
      {
        id: `sample-${Date.now()}-1`,
        name: 'Foto_Produk_Hoodie.png',
        previewUrl: s1,
        size: 10240,
        base64: s1,
        mimeType: 'image/png',
      },
      {
        id: `sample-${Date.now()}-2`,
        name: 'Foto_Model_Berhijab.png',
        previewUrl: s2,
        size: 10240,
        base64: s2,
        mimeType: 'image/png',
      },
      {
        id: `sample-${Date.now()}-3`,
        name: 'Screenshot_Deskripsi_Marketplace.png',
        previewUrl: s3,
        size: 10240,
        base64: s3,
        mimeType: 'image/png',
      },
    ];

    setImages(samples);
    setNotes(
      'Fokus tampilkan kenyamanan bahan katun fleece hoodie hitam saat dipakai jalan santai, pertahankan model hijab tetap konsisten, dan sertakan call to action beli di keranjang kuning.'
    );
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  // If user is on Beranda view, show clean gateway
  if (currentView === 'beranda') {
    return (
      <Beranda
        initialUserName={userName}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // If user is on BYOK Connection Test view (development test)
  if (currentView === 'byok-test') {
    return (
      <ByokConnectionTest
        onBack={() => setCurrentView('pilih-studio')}
      />
    );
  }

  // If user is on Pilih Studio view
  if (currentView === 'pilih-studio') {
    return (
      <>
        <PilihStudio
          userName={userName}
          onSelectStudio={(studio) => {
            if (studio === 'zeo-auto') {
              setIsInitialZeoAuto(true);
              setCurrentView('creative');
            } else {
              setIsInitialZeoAuto(false);
              setCurrentView(studio);
            }
          }}
          onLogout={handleLogout}
          onOpenByokTest={() => setCurrentView('byok-test')}
        />
        <OnboardingGuideModal
          isOpen={showOnboarding}
          onClose={handleCloseOnboarding}
        />
      </>
    );
  }

  // If user is on Creative Video Studio view
  if (currentView === 'creative') {
    return (
      <ErrorBoundary onBackToStudio={() => setCurrentView('pilih-studio')}>
        <CreativeStudio
          userName={userName}
          initialZeoAuto={isInitialZeoAuto}
          onBackToPilihStudio={() => {
            setIsInitialZeoAuto(false);
            setCurrentView('pilih-studio');
          }}
          onLogout={handleLogout}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onBackToStudio={() => setCurrentView('pilih-studio')}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 text-slate-900 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
        {/* Top Header & User Session Bar */}
        <TopUserBar
          userName={userName}
          onLogout={handleLogout}
          onBackToPilihStudio={() => setCurrentView('pilih-studio')}
          onOpenHelp={() => setShowHelpModal(true)}
          onOpenAbout={() => setShowAboutModal(true)}
          currentStudioName="Affiliate & Seller Studio"
        />

        {/* Main Generator Header */}
        <Header />

      {/* Main Form Container */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 flex-1">
        
        {/* Quick Action Strip: Pilih Studio, Proyek Baru & Sample Data */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-back-to-pilih-studio-main"
              onClick={handleNavToPilihStudio}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
              title="Kembali ke Pilih Studio"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
              <span>← Pilih Studio</span>
            </button>

            <button
              type="button"
              id="btn-top-produk-baru"
              onClick={handleProyekBaruClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Proyek Baru</span>
            </button>

            <button
              type="button"
              id="btn-reset-form-top"
              onClick={handleResetForm}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>

          <button
            type="button"
            id="btn-load-sample-images"
            onClick={handleLoadSampleImages}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Muat Contoh Gambar Produk</span>
          </button>
        </div>

        {/* 1. UPLOAD GAMBAR REFERENSI PRODUK */}
        <ImageUploadArea
          images={images}
          onAddImages={handleAddImages}
          onRemoveImage={handleRemoveImage}
        />

        {/* 2. PILIHAN MODEL / KARAKTER */}
        <CharacterModelSelector
          characterOption={characterOption}
          onChangeCharacterOption={handleCharacterOptionChange}
          characterLock={characterLock}
          onChangeCharacterLock={setCharacterLock}
          characterSheet={characterSheet}
          onUploadCharacterSheet={setCharacterSheet}
          characterDescription={characterDescription}
          onChangeCharacterDescription={setCharacterDescription}
        />

        {/* 2B. CATATAN TAMBAHAN DARI SELLER / AFFILIATE */}
        <AdditionalNotes value={notes} onChange={setNotes} />

        {/* 3 & 4. DURASI & JUMLAH SCENE */}
        <DurationAndSceneSelector
          duration={duration}
          onChangeDuration={setDuration}
          sceneCount={sceneCount}
          onChangeSceneCount={setSceneCount}
        />

        {/* 5. GAYA VIDEO */}
        <StyleSelector selectedStyle={style} onChangeStyle={setStyle} />

        {/* 6 & 7. AUDIO & PLATFORM */}
        <AudioAndPlatformSelector
          audio={audio}
          onChangeAudio={setAudio}
          platform={platform}
          onChangePlatform={setPlatform}
        />

        {/* Quick Status Bar */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <span className="font-medium">
            {images.length}/6 gambar siap diproses
          </span>
          <span className="text-[11px] text-slate-400">
            {duration} • {sceneCount} • {style}
          </span>
        </div>

        {/* Status Gemini API */}
        <div
          id="generator-session-key-status"
          className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-indigo-50/40 to-slate-50 border border-emerald-200/90 flex items-center justify-between gap-3 text-xs shadow-2xs"
        >
          <div className="flex items-center gap-2 text-slate-800 font-semibold min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="truncate">
              🟢 Gemini AI Siap • Sesi <strong className="text-slate-900">{userName || 'Pengguna'}</strong>
            </span>
          </div>
        </div>

        {/* TOMBOL UTAMA */}
        <div className="pt-2">
          <button
            type="button"
            id="btn-generate-video-prompt"
            onClick={handleGenerateClick}
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:via-indigo-800 hover:to-violet-700 text-white font-bold text-base sm:text-lg shadow-md shadow-indigo-200 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-80"
          >
            <Sparkles className={`w-5 h-5 text-indigo-200 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>
              {isSubmitting
                ? LOADING_STEPS[loadingStepIndex]
                : hasGenerated
                ? '↻ GENERATE ULANG PROMPT'
                : '✨ BUAT PROMPT VIDEO'}
            </span>
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-2">
            Menganalisis gambar dengan Gemini Vision Multimodal & Visual Product Lock.
          </p>
        </div>

        {/* Divider & Anchor to Result */}
        <div ref={resultRef} className="pt-4 scroll-mt-20">
          {/* AREA HASIL */}
          <ResultSection
            hasGenerated={hasGenerated}
            isLoading={isSubmitting}
            errorMessage={errorMessage}
            analysisResult={analysisResult}
            images={images}
            notes={notes}
            duration={duration}
            sceneCount={sceneCount}
            style={style}
            audio={audio}
            platform={platform}
            characterOption={characterOption}
            characterLock={characterLock}
            onRetry={handleGenerateClick}
            onGenerateUlang={handleGenerateClick}
            onProdukBaru={handleProyekBaruClick}
            loadingProgressMessage={LOADING_STEPS[loadingStepIndex]}
            showSuccessToast={showSuccessToast}
          />
        </div>
      </main>

      {/* App Footer */}
      <AppFooter
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
      />

      {/* Requirement #13: Floating Back to Top button */}
      {showBackToTop && (
        <button
          type="button"
          id="btn-back-to-top"
          onClick={scrollToTop}
          aria-label="Kembali ke atas"
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-40 w-11 h-11 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white shadow-lg flex items-center justify-center transition-all cursor-pointer transform hover:scale-105 active:scale-95"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Floating Bottom Action Bar for Mobile Devices */}
      <aside aria-label="Aksi Cepat Mobile" className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 sm:hidden shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">
              {images.length > 0 ? `${images.length} Gambar Referensi` : 'Belum ada gambar'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {duration} • {style}
            </p>
          </div>

          {analysisResult && (
            <button
              type="button"
              onClick={handleProyekBaruClick}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
            >
              + Proyek Baru
            </button>
          )}

          <button
            type="button"
            id="btn-mobile-generate"
            onClick={handleGenerateClick}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 flex items-center gap-1.5 shrink-0 disabled:opacity-80 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Memproses...' : hasGenerated ? '↻ Ulang' : 'Buat Prompt'}</span>
            <ArrowDown className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </aside>

      {/* Modal: Unsaved Work Warning (Requirement #8) */}
      {showUnsavedWarning && (
        <div
          id="modal-unsaved-warning"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Proyek saat ini belum disimpan. Lanjutkan?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Data hasil generate proyek saat ini belum disimpan dan akan dibersihkan jika Anda berpindah ke Pilih Studio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                id="btn-unsaved-stay"
                onClick={() => setShowUnsavedWarning(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Tetap di Sini
              </button>
              <button
                type="button"
                id="btn-unsaved-continue"
                onClick={() => {
                  setShowUnsavedWarning(false);
                  setCurrentView('pilih-studio');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs sm:text-sm font-bold hover:bg-rose-700 transition-colors cursor-pointer shadow-xs text-center"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Mulai Proyek Baru (Requirement #5) */}
      {showNewProjectConfirm && (
        <div
          id="modal-new-project-confirm"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Mulai proyek baru?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Referensi, ide, dan hasil prompt proyek saat ini akan dibersihkan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                id="btn-new-project-cancel"
                onClick={() => setShowNewProjectConfirm(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-new-project-proceed"
                onClick={handleConfirmProyekBaru}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs text-center"
              >
                Mulai Proyek Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pertahankan Karakter untuk Proyek Baru (Requirement #5 & #6) */}
      {showKeepCharacterModal && (
        <div
          id="modal-keep-character"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Pertahankan karakter untuk proyek berikutnya?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Karakter visual terkunci saat ini sedang aktif ({characterOption === 'Upload Character Sheet' ? 'Character Sheet' : 'Deskripsi Karakter'}). Anda dapat mempertahankannya untuk proyek baru, atau mengganti dengan karakter baru.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                id="btn-ganti-karakter"
                onClick={() => executeProyekBaru(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Tidak, Ganti Karakter
              </button>
              <button
                type="button"
                id="btn-pertahankan-karakter"
                onClick={() => executeProyekBaru(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs text-center"
              >
                Ya, Pertahankan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
    </ErrorBoundary>
  );
}
