import React, { useState } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface ByokConnectionTestProps {
  onBack: () => void;
}

interface TestResponse {
  success: boolean;
  status: string;
  category: string;
  httpStatus: number;
  model: string;
  stage: string;
  errorCode?: string;
  safeMessage?: string;
  message?: string;
  primaryMessage?: string;
  secondaryMessage?: string;
  diagnostic?: {
    status?: any;
    errorCode?: string;
    errorCategory?: string;
    model?: string;
    stage?: string;
    safeMessage?: string;
  };
}

export const ByokConnectionTest: React.FC<ByokConnectionTestProps> = ({ onBack }) => {
  // Initialize with session key if previously entered, or blank
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return sessionStorage.getItem('ai_affiliate_session_key') || '';
    } catch {
      return '';
    }
  });

  const [showKey, setShowKey] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResponse | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const handleTest = async () => {
    const trimmedKey = apiKey.trim();
    setIsLoading(true);
    setRequestError(null);
    setTestResult(null);

    try {
      // Calls endpoint testUserGeminiKey without ANY fallback to project GEMINI_API_KEY
      const res = await fetch('/api/testUserGeminiKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: trimmedKey }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch (_jsonErr) {
        data = {
          success: false,
          status: 'FAILED',
          category: 'SERVER_ERROR',
          httpStatus: res.status,
          errorCode: 'INVALID_JSON_RESPONSE',
          safeMessage: `Server mengembalikan status HTTP ${res.status} tanpa format JSON valid.`,
          model: 'none',
          stage: 'SERVER_REQUEST_RECEIVED',
          primaryMessage: 'Format response server tidak valid',
          secondaryMessage: `Server mengembalikan kode status HTTP ${res.status}.`,
        };
      }

      // Formulate complete response fields
      const formattedResult: TestResponse = {
        success: Boolean(data.success),
        status: data.status || (data.success ? 'CONNECTED' : 'FAILED'),
        category:
          data.category ||
          data.errorType ||
          data.diagnostic?.errorCategory ||
          (data.success ? 'CONNECTED' : 'UNKNOWN'),
        httpStatus: typeof data.httpStatus === 'number' ? data.httpStatus : res.status,
        model: data.model || data.diagnostic?.model || 'none',
        stage:
          data.stage ||
          data.diagnostic?.stage ||
          (data.success ? 'GEMINI_RESPONSE_RECEIVED' : 'SERVER_REQUEST_RECEIVED'),
        errorCode:
          data.errorCode ||
          data.diagnostic?.errorCode ||
          (data.success ? 'OK' : data.status === 'CONNECTED' ? 'OK' : 'UNKNOWN'),
        safeMessage:
          data.safeMessage ||
          data.diagnostic?.safeMessage ||
          data.message ||
          data.primaryMessage ||
          (data.success ? 'Gemini API berhasil terhubung.' : 'Terjadi kendala saat validasi API Key.'),
        message: data.message,
        primaryMessage: data.primaryMessage,
        secondaryMessage: data.secondaryMessage,
        diagnostic: data.diagnostic,
      };

      setTestResult(formattedResult);
    } catch (err: any) {
      setRequestError(err?.message || 'Gagal menghubungi server endpoint testUserGeminiKey.');
      setTestResult({
        success: false,
        status: 'FAILED',
        category: 'NETWORK',
        httpStatus: 0,
        errorCode: 'NETWORK_ERROR',
        safeMessage: err?.message || 'Koneksi jaringan terputus saat menghubungi server.',
        model: 'none',
        stage: 'CLIENT_REQUEST',
        primaryMessage: 'Network error saat menghubungi /api/testUserGeminiKey',
        secondaryMessage: 'Pastikan koneksi jaringan server aktif.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="page-byok-connection-test"
      className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white"
    >
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-back-from-byok-test"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Home</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 tracking-tight">
                🧪 BYOK Connection Test
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                Development
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            POST /api/testUserGeminiKey
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Banner Info */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Halaman Pengujian Mandiri BYOK (Bring Your Own Key)</span>
          </div>
          <p className="text-amber-800/90 leading-relaxed text-[11px]">
            Halaman ini menguji API Key yang dimasukkan pengguna secara langsung menggunakan endpoint{' '}
            <code className="px-1 py-0.5 rounded bg-amber-100/80 font-mono text-amber-900 font-bold">
              /api/testUserGeminiKey
            </code>
            . <strong>JANGAN menggunakan GEMINI_API_KEY project sebagai fallback.</strong>
          </p>
        </div>

        {/* Input & Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="space-y-1">
            <label
              htmlFor="input-gemini-api-key-pengguna"
              className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gemini API Key Pengguna</span>
            </label>
            <p className="text-xs text-slate-500">
              Masukkan API Key Gemini yang ingin diuji konektivitas, model, dan kuotanya.
            </p>
          </div>

          <div className="space-y-3">
            {/* Input with Show/Hide toggle */}
            <div className="relative">
              <input
                id="input-gemini-api-key-pengguna"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Masukkan Gemini API Key (misal: AIzaSy...)"
                autoComplete="off"
                spellCheck="false"
                className="w-full pl-3.5 pr-28 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50/60 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Show/Hide Key button */}
                <button
                  type="button"
                  id="btn-toggle-show-key"
                  onClick={() => setShowKey(!showKey)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center gap-1 cursor-pointer"
                  title={showKey ? 'Sembunyikan Key' : 'Tampilkan Key'}
                >
                  {showKey ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Show</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                id="btn-test-byok"
                onClick={handleTest}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>MENGUJI BYOK...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>TEST BYOK</span>
                  </>
                )}
              </button>

              {apiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setApiKey('');
                    setTestResult(null);
                    setRequestError(null);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Bersihkan Input
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {testResult && (
          <div
            id="byok-test-result-box"
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>Hasil Pengujian BYOK</span>
                {testResult.success ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ BYOK CONNECTED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 text-xs font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>BYOK FAILED</span>
                  </span>
                )}
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                HTTP {testResult.httpStatus}
              </span>
            </div>

            {/* Prominent Success / Failed Headline Banner */}
            {testResult.success ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-1">
                <div className="text-xl sm:text-2xl font-black text-emerald-700 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 shrink-0" />
                  <span>✓ BYOK CONNECTED</span>
                </div>
                <p className="text-xs text-emerald-800 font-semibold">
                  API Key Pengguna valid dan berhasil terhubung ke model Gemini.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-center space-y-1">
                <div className="text-xl sm:text-2xl font-black text-rose-700 flex items-center justify-center gap-2">
                  <XCircle className="w-6 h-6 sm:w-7 sm:h-7 text-rose-600 shrink-0" />
                  <span>BYOK FAILED</span>
                </div>
                <p className="text-xs text-rose-800 font-semibold">
                  {testResult.primaryMessage || 'Verifikasi API Key Pengguna gagal.'}
                </p>
              </div>
            )}

            {/* Required Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* 1. Status */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 block">
                  Status
                </span>
                <div id="result-status" className="font-extrabold text-xs sm:text-sm">
                  {testResult.status === 'CONNECTED' ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      CONNECTED
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      {testResult.status || 'FAILED'}
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Category */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 block">
                  Category
                </span>
                <div id="result-category" className="font-extrabold text-xs sm:text-sm text-slate-800 truncate font-mono">
                  {testResult.category}
                </div>
              </div>

              {/* 3. HTTP Status */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 block">
                  HTTP Status
                </span>
                <div id="result-http-status" className="font-extrabold text-xs sm:text-sm text-slate-800 font-mono">
                  {testResult.httpStatus}
                </div>
              </div>

              {/* 4. Error Code */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 block">
                  Error Code
                </span>
                <div id="result-error-code" className="font-extrabold text-xs sm:text-sm text-slate-800 truncate font-mono" title={testResult.errorCode}>
                  {testResult.errorCode || 'NONE'}
                </div>
              </div>

              {/* 5. Model */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 block">
                  Model
                </span>
                <div id="result-model" className="font-extrabold text-xs sm:text-sm text-slate-800 truncate font-mono" title={testResult.model}>
                  {testResult.model || 'none'}
                </div>
              </div>

              {/* 6. Stage */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 block">
                  Stage
                </span>
                <div id="result-stage" className="font-extrabold text-xs sm:text-sm text-slate-800 font-mono truncate">
                  {testResult.stage}
                </div>
              </div>
            </div>

            {/* Safe Message Display */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 block">
                Safe Message
              </span>
              <p id="result-safe-message" className="font-mono text-slate-800 text-xs break-words leading-relaxed">
                {testResult.safeMessage || testResult.primaryMessage || testResult.message || 'Tidak ada detail pesan.'}
              </p>
              {testResult.secondaryMessage && (
                <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                  {testResult.secondaryMessage}
                </p>
              )}
            </div>

            {/* Diagnostic Details Preview */}
            {testResult.diagnostic && (
              <details className="pt-2">
                <summary className="text-xs font-bold text-slate-600 cursor-pointer hover:text-indigo-600 transition-colors">
                  Lihat Payload Diagnostik Lengkap
                </summary>
                <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Network or Unexpected Request Error */}
        {requestError && !testResult && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Gagal Mengeksekusi Permintaan</span>
            </div>
            <p className="text-[11px] text-rose-700">{requestError}</p>
          </div>
        )}
      </main>
    </div>
  );
};
