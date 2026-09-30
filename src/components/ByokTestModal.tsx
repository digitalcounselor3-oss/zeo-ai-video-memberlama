import React, { useState } from 'react';
import {
  X,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface ByokTestModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export const ByokTestModal: React.FC<ByokTestModalProps> = ({ isOpen, onClose }) => {
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
  const [networkError, setNetworkError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    const trimmedKey = apiKey.trim();
    setIsLoading(true);
    setNetworkError(null);
    setTestResult(null);

    try {
      // Direct call to testUserGeminiKey endpoint - NO project GEMINI_API_KEY fallback
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
          'Tidak ada detail pesan tambahan.',
        message: data.message,
        primaryMessage: data.primaryMessage,
        secondaryMessage: data.secondaryMessage,
      };

      setTestResult(formattedResult);
    } catch (err: any) {
      setNetworkError(err?.message || 'Gagal menghubungi endpoint /api/testUserGeminiKey');
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
        secondaryMessage: 'Pastikan koneksi server aktif.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="modal-byok-connection-test"
        className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900 tracking-tight">
              🧪 BYOK Connection Test
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
              Dev Mode
            </span>
          </div>
          <button
            type="button"
            id="btn-close-byok-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Notice */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Menguji langsung via <code className="font-mono font-bold">testUserGeminiKey</code>.
              <strong> Tidak ada fallback ke default GEMINI_API_KEY project.</strong> Jika key salah, test wajib gagal.
            </div>
          </div>

          {/* Form: Gemini API Key Pengguna */}
          <div className="space-y-2">
            <label
              htmlFor="input-modal-gemini-key"
              className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gemini API Key Pengguna</span>
            </label>

            <div className="relative">
              <input
                id="input-modal-gemini-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Masukkan Gemini API Key (misal: AIzaSy...)"
                autoComplete="off"
                spellCheck="false"
                className="w-full pl-3.5 pr-20 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono transition-all"
              />

              <button
                type="button"
                id="btn-modal-toggle-show-key"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
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

          {/* Buttons: TEST BYOK & Tutup */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              id="btn-modal-test-byok"
              onClick={handleTest}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
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

            <button
              type="button"
              id="btn-modal-tutup"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>

          {/* Test Results */}
          {testResult && (
            <div
              id="modal-byok-result"
              className="pt-3 border-t border-slate-100 space-y-4 animate-in fade-in duration-150"
            >
              {/* Big Success / Failed Headline Banner */}
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
                  {testResult.secondaryMessage && (
                    <p className="text-[11px] text-rose-700">
                      {testResult.secondaryMessage}
                    </p>
                  )}
                </div>
              )}

              {/* Required Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
                {/* 1. Status */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Status
                  </span>
                  <span
                    id="modal-result-status"
                    className={`text-xs font-black ${
                      testResult.success ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {testResult.status}
                  </span>
                </div>

                {/* 2. Category */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Category
                  </span>
                  <span
                    id="modal-result-category"
                    className="text-xs font-mono font-bold text-slate-800 truncate block"
                  >
                    {testResult.category}
                  </span>
                </div>

                {/* 3. HTTP Status */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    HTTP Status
                  </span>
                  <span
                    id="modal-result-http-status"
                    className="text-xs font-mono font-bold text-slate-800 block"
                  >
                    {testResult.httpStatus}
                  </span>
                </div>

                {/* 4. Error Code */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Error Code
                  </span>
                  <span
                    id="modal-result-error-code"
                    className="text-xs font-mono font-bold text-slate-800 truncate block"
                    title={testResult.errorCode}
                  >
                    {testResult.errorCode || 'NONE'}
                  </span>
                </div>

                {/* 5. Model */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Model
                  </span>
                  <span
                    id="modal-result-model"
                    className="text-xs font-mono font-bold text-slate-800 truncate block"
                    title={testResult.model}
                  >
                    {testResult.model}
                  </span>
                </div>

                {/* 6. Stage */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Stage
                  </span>
                  <span
                    id="modal-result-stage"
                    className="text-xs font-mono font-bold text-slate-800 block truncate"
                  >
                    {testResult.stage}
                  </span>
                </div>
              </div>

              {/* Safe Message Display */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Safe Message
                </span>
                <p id="modal-result-safe-message" className="text-xs font-mono text-slate-800 break-words leading-relaxed">
                  {testResult.safeMessage || testResult.message || 'No additional message'}
                </p>
              </div>
            </div>
          )}

          {networkError && !testResult && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {networkError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
