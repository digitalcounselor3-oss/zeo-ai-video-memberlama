import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import {
  APP_NAME,
  APP_SUBTITLE,
  APP_CREATOR,
  APP_DESCRIPTION,
} from '../config/appConfig';
import { AppFooter } from './common/AppFooter';
import { HelpModal } from './common/HelpModal';
import { AboutModal } from './common/AboutModal';
import { ApiKeyGuideModal } from './common/ApiKeyGuideModal';
import { ByokTestModal } from './ByokTestModal';

interface BerandaProps {
  onLoginSuccess: (userName: string, apiKey?: string) => void;
  initialUserName?: string;
}

export const Beranda: React.FC<BerandaProps> = ({ onLoginSuccess, initialUserName = '' }) => {
  const [userName, setUserName] = useState<string>(initialUserName);
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return sessionStorage.getItem('ai_affiliate_session_key') || '';
    } catch {
      return '';
    }
  });
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showByokModal, setShowByokModal] = useState<boolean>(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanName = userName.trim();
    if (!cleanName) {
      setErrorMessage('Nama Pengguna wajib diisi sebelum melanjutkan.');
      return;
    }

    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      setErrorMessage('Gemini API Key wajib diisi untuk menghubungkan ZEO.');
      return;
    }

    setIsTesting(true);

    try {
      // Gunakan mekanisme BYOK yang sudah terbukti berhasil
      const res = await fetch('/api/testUserGeminiKey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanKey }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.success && data.status === 'CONNECTED') {
        // Simpan API key HANYA untuk sesi aktif ZEO
        try {
          sessionStorage.setItem('ai_affiliate_user_name', cleanName);
          sessionStorage.setItem('ai_affiliate_session_key', cleanKey);
        } catch {
          // ignore session write error
        }
        onLoginSuccess(cleanName, cleanKey);
      } else {
        // Gagal: jangan masuk, tampilkan pesan sesuai error
        const msg =
          data.primaryMessage ||
          data.safeMessage ||
          data.message ||
          'Verifikasi API Key gagal. Periksa kembali Gemini API Key Anda.';
        setErrorMessage(msg);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Terjadi gangguan saat memverifikasi API Key. Periksa koneksi internet Anda.'
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      id="page-beranda"
      className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white"
    >
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs font-black text-sm tracking-wider">
              ZEO
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-slate-900 block leading-tight">
                  {APP_NAME}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                  by {APP_CREATOR}
                </span>
              </div>
              <span className="text-[10px] text-indigo-600 font-bold tracking-wider block">
                {APP_SUBTITLE}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <button
              type="button"
              id="btn-beranda-help"
              onClick={() => setShowHelpModal(true)}
              className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Bantuan
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              id="btn-beranda-about"
              onClick={() => setShowAboutModal(true)}
              className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Tentang ZEO
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-1 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>by {APP_CREATOR}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {APP_NAME}
          </h1>
          <p className="text-base sm:text-lg font-bold text-indigo-700">
            {APP_SUBTITLE}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed pt-1">
            {APP_DESCRIPTION}
          </p>
        </div>

        {/* Card Form */}
        <div
          id="card-mulai-aplikasi"
          className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input 1: Nama Pengguna */}
            <div>
              <label
                htmlFor="input-username-beranda"
                className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
              >
                Nama Pengguna <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-username-beranda"
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Masukkan nama Anda"
                  required
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-300 bg-slate-50/60 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Input 2: Gemini API Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="input-apikey-beranda"
                  className="block text-xs sm:text-sm font-bold text-slate-800"
                >
                  Gemini API Key <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  id="btn-show-hide-key"
                  onClick={() => setShowKey(!showKey)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {showKey ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  id="input-apikey-beranda"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Masukkan Gemini API Key milik Anda"
                  required
                  autoComplete="off"
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-slate-300 bg-slate-50/60 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Key className="w-4 h-4" />
                </div>
              </div>

              {/* Info Box & Panduan Link */}
              <div className="mt-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs space-y-1.5">
                <div className="flex items-start gap-1.5 text-slate-700 font-medium leading-relaxed">
                  <span className="shrink-0 mt-0.5">🔐</span>
                  <div>
                    <strong>Gunakan API Key Gemini milik Anda sendiri.</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      API Key digunakan selama sesi untuk menghubungkan ZEO dengan Gemini.
                    </p>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-200/60 flex items-center justify-end">
                  <button
                    type="button"
                    id="btn-cara-dapat-key"
                    onClick={() => setShowGuideModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Cara Mendapatkan API Key</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message Section */}
            {errorMessage && (
              <div
                id="beranda-error-message"
                className="p-3.5 rounded-2xl border border-rose-300 bg-rose-50 text-rose-950 text-xs flex items-start gap-2.5 shadow-2xs animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Tombol Utama: TES & MASUK ZEO */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-masuk-zeo"
                disabled={isTesting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:via-indigo-800 hover:to-violet-700 disabled:opacity-60 text-white font-bold text-sm sm:text-base shadow-md shadow-indigo-200 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Gemini API Key...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>TES & MASUK ZEO</span>
                  </>
                )}
              </button>
            </div>

            {/* Dev Mode link (Subtle for pilot debugging as per requirement #10) */}
            <div className="text-center pt-2">
              <button
                type="button"
                id="btn-dev-byok-test"
                onClick={() => setShowByokModal(true)}
                className="text-[11px] text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                🛠️ BYOK Connection Test — Dev Mode
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Reusable Compact Footer */}
      <AppFooter
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
      />

      {/* Modal Panduan API Key */}
      <ApiKeyGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Modal Bantuan */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Modal Tentang ZEO */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      {/* Modal BYOK Connection Test */}
      <ByokTestModal
        isOpen={showByokModal}
        onClose={() => setShowByokModal(false)}
      />
    </div>
  );
};
