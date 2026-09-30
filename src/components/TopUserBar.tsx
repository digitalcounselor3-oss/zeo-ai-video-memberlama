import React, { useState, useEffect } from 'react';
import {
  LogOut,
  ArrowLeft,
  Menu,
  HelpCircle,
  Info,
  Key,
  X,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ApiKeyGuideModal } from './common/ApiKeyGuideModal';

interface TopUserBarProps {
  userName: string;
  onLogout: () => void;
  onBackToPilihStudio?: () => void;
  currentStudioName?: string;
  onOpenHelp?: () => void;
  onOpenAbout?: () => void;
}

export const TopUserBar: React.FC<TopUserBarProps> = ({
  userName,
  onLogout,
  onBackToPilihStudio,
  currentStudioName,
  onOpenHelp,
  onOpenAbout,
}) => {
  // Mobile menu dropdown state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  // Logout confirmation modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  // Ganti Gemini API Key modal state
  const [showGantiKeyModal, setShowGantiKeyModal] = useState<boolean>(false);
  const [newKeyInput, setNewKeyInput] = useState<string>('');
  const [showNewKeyVisible, setShowNewKeyVisible] = useState<boolean>(false);
  const [isTestingNewKey, setIsTestingNewKey] = useState<boolean>(false);
  const [gantiKeyError, setGantiKeyError] = useState<string | null>(null);
  const [gantiKeySuccess, setGantiKeySuccess] = useState<string | null>(null);

  // Api guide modal
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  const [, setApiKey] = useState<string>(() => {
    try {
      return sessionStorage.getItem('ai_affiliate_session_key') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const handleOpen = () => {
      setNewKeyInput('');
      setGantiKeyError(null);
      setGantiKeySuccess(null);
      setShowGantiKeyModal(true);
    };
    window.addEventListener('open-byok-change-modal', handleOpen);
    return () => window.removeEventListener('open-byok-change-modal', handleOpen);
  }, []);

  const handleGantiKeySubmit = async () => {
    const cleanNewKey = newKeyInput.trim();
    if (!cleanNewKey) {
      setGantiKeyError('Gemini API Key baru tidak boleh kosong.');
      return;
    }

    setIsTestingNewKey(true);
    setGantiKeyError(null);
    setGantiKeySuccess(null);

    try {
      const res = await fetch('/api/testUserGeminiKey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanNewKey }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.success && data.status === 'CONNECTED') {
        // Ganti key sesi
        try {
          sessionStorage.setItem('ai_affiliate_session_key', cleanNewKey);
        } catch {
          // ignore
        }
        setApiKey(cleanNewKey);
        setGantiKeySuccess('Koneksi berhasil! Gemini API Key sesi telah diperbarui.');
        setTimeout(() => {
          setShowGantiKeyModal(false);
        }, 1200);
      } else {
        // JIKA GAGAL: PERTAHANKAN KEY SESI LAMA!
        const msg =
          data.primaryMessage ||
          data.safeMessage ||
          data.message ||
          'Verifikasi API Key baru gagal. Key sesi lama tetap dipertahankan.';
        setGantiKeyError(msg);
      }
    } catch (err: any) {
      setGantiKeyError(
        err?.message || 'Gagal memverifikasi key baru. Key lama tetap dipertahankan.'
      );
    } finally {
      setIsTestingNewKey(false);
    }
  };

  const handleConfirmLogout = () => {
    try {
      // Hapus nama dan API key sesi saat logout
      sessionStorage.removeItem('ai_affiliate_user_name');
      sessionStorage.removeItem('ai_affiliate_session_key');
    } catch {
      // ignore
    }
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <>
      {/* Top Header Bar */}
      <header
        id="top-user-bar"
        className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-2xs"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Brand Header */}
          {onBackToPilihStudio ? (
            <button
              type="button"
              id="btn-header-zeo-home"
              onClick={onBackToPilihStudio}
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 transition-all cursor-pointer group"
              title="Kembali ke Home ZEO"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-600 flex items-center justify-center text-white shadow-2xs font-black text-xs tracking-wider shrink-0 group-hover:scale-105 transition-transform">
                ZEO
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                    ZEO
                  </span>
                  <span className="hidden xs:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                    by Ms. Inggid
                  </span>
                  {currentStudioName && (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {currentStudioName}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block leading-tight truncate">
                  AI Video Studio
                </span>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-600 flex items-center justify-center text-white shadow-2xs font-black text-xs tracking-wider shrink-0">
                ZEO
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                    ZEO
                  </span>
                  <span className="hidden xs:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                    by Ms. Inggid
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block leading-tight truncate">
                  AI Video Studio
                </span>
              </div>
            </div>
          )}

          {/* User Status & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* User Name Badge (Requirement #7: 👤 [Nama Pengguna]) */}
            <div
              id="badge-header-user-name"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200"
            >
              <span className="max-w-[85px] sm:max-w-[130px] truncate">
                👤 {userName || 'Pengguna'}
              </span>
            </div>

            {/* Gemini Indicator Badge (Requirement #7: 🟢 Gemini Terhubung) */}
            <div
              id="badge-gemini-connected"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs"
              title="Gemini Terhubung aktif via sesi BYOK"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="whitespace-nowrap">🟢 Gemini Terhubung</span>
            </div>

            {/* Ganti API Key Button (Requirement #7 & #8) */}
            <button
              type="button"
              id="btn-header-ganti-api-key"
              onClick={() => {
                setShowGantiKeyModal(true);
                setGantiKeyError(null);
                setGantiKeySuccess(null);
                setNewKeyInput('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Ganti Gemini API Key"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Ganti API Key</span>
              <span className="sm:hidden">Key</span>
            </button>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-1.5">
              {onBackToPilihStudio && (
                <button
                  type="button"
                  id="btn-header-home"
                  onClick={onBackToPilihStudio}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-xs font-bold transition-colors cursor-pointer"
                  title="Kembali ke Home"
                >
                  <span>🏠</span>
                  <span>Home</span>
                </button>
              )}

              {onBackToPilihStudio && (
                <button
                  type="button"
                  id="btn-header-pilih-studio"
                  onClick={onBackToPilihStudio}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-xs font-bold transition-colors cursor-pointer"
                  title="Pilih Studio"
                >
                  <span>🎬</span>
                  <span>Studio</span>
                </button>
              )}

              {onOpenHelp && (
                <button
                  type="button"
                  id="btn-header-help"
                  onClick={onOpenHelp}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-xs font-bold transition-colors cursor-pointer"
                  title="Bantuan Penggunaan"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Bantuan</span>
                </button>
              )}

              {onOpenAbout && (
                <button
                  type="button"
                  id="btn-header-about"
                  onClick={onOpenAbout}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tentang ZEO</span>
                </button>
              )}

              <button
                type="button"
                id="btn-keluar-session"
                onClick={() => setShowLogoutConfirm(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Keluar</span>
              </button>
            </div>

            {/* Mobile Dropdown Trigger */}
            <div className="relative md:hidden">
              <button
                type="button"
                id="btn-mobile-menu-trigger"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu navigasi"
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Mobile Dropdown Menu */}
              {isMobileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    {onBackToPilihStudio && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onBackToPilihStudio();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <span>🏠</span>
                          <span>Home</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onBackToPilihStudio();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <span>🎬</span>
                          <span>Studio</span>
                        </button>
                      </>
                    )}

                    {onOpenHelp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenHelp();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Bantuan</span>
                      </button>
                    )}

                    {onOpenAbout && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenAbout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 text-slate-600" />
                        <span>Tentang ZEO</span>
                      </button>
                    )}

                    <button
                      type="button"
                      id="btn-mobile-ganti-api-key"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowGantiKeyModal(true);
                        setGantiKeyError(null);
                        setGantiKeySuccess(null);
                        setNewKeyInput('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      <span>Ganti API Key</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal: Ganti Gemini API Key (Requirement #8) */}
      {showGantiKeyModal && (
        <div
          id="modal-ganti-gemini-key"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setShowGantiKeyModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 relative my-6 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    Ganti Gemini API Key
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Masukkan API Key Gemini baru untuk sesi ini
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-ganti-key-modal"
                onClick={() => setShowGantiKeyModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="input-ganti-api-key"
                    className="block text-xs sm:text-sm font-bold text-slate-800"
                  >
                    Gemini API Key Baru <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewKeyVisible(!showNewKeyVisible)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {showNewKeyVisible ? (
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
                    id="input-ganti-api-key"
                    type={showNewKeyVisible ? 'text' : 'password'}
                    value={newKeyInput}
                    onChange={(e) => {
                      setNewKeyInput(e.target.value);
                      if (gantiKeyError) setGantiKeyError(null);
                      if (gantiKeySuccess) setGantiKeySuccess(null);
                    }}
                    placeholder="Masukkan Gemini API Key baru"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-300 bg-slate-50/60 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Key className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex justify-end pt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowGuideModal(true)}
                    className="text-[11px] text-indigo-600 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Cara Mendapatkan API Key</span>
                  </button>
                </div>
              </div>

              {gantiKeyError && (
                <div
                  id="ganti-key-error-message"
                  className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-950 text-xs flex items-start gap-2 shadow-2xs animate-in fade-in"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-semibold leading-relaxed">
                    {gantiKeyError}
                  </div>
                </div>
              )}

              {gantiKeySuccess && (
                <div
                  id="ganti-key-success-message"
                  className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in"
                >
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span className="font-semibold">{gantiKeySuccess}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGantiKeyModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="btn-tes-gunakan-key-baru"
                  disabled={isTestingNewKey}
                  onClick={handleGantiKeySubmit}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isTestingNewKey ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>TES & GUNAKAN KEY BARU</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Panduan API Key */}
      <ApiKeyGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Modal: Konfirmasi Keluar (Requirement #9) */}
      {showLogoutConfirm && (
        <div
          id="modal-konfirmasi-keluar"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Keluar dari ZEO?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nama Pengguna dan Gemini API Key akan dibersihkan dari sesi aktif browser. Anda dapat masuk kembali kapan saja.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-logout-yes"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
