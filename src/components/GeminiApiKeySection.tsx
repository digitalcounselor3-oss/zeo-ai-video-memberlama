import React, { useState } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export type ApiKeyStatus = 'untested' | 'valid' | 'invalid';

interface GeminiApiKeySectionProps {
  apiKey: string;
  onChangeApiKey: (key: string) => void;
  apiKeyStatus: ApiKeyStatus;
  onChangeApiKeyStatus: (status: ApiKeyStatus) => void;
}

export const GeminiApiKeySection: React.FC<GeminiApiKeySectionProps> = ({
  apiKey,
  onChangeApiKey,
  apiKeyStatus,
  onChangeApiKeyStatus,
}) => {
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChangeApiKey(val);
    setTestFeedback(null);
    if (val.trim().length === 0) {
      onChangeApiKeyStatus('untested');
    } else {
      onChangeApiKeyStatus('untested');
    }
  };

  const handleTestKey = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      onChangeApiKeyStatus('untested');
      setTestFeedback('Silakan masukkan Gemini API Key terlebih dahulu.');
      return;
    }

    setIsTesting(true);
    setTestFeedback(null);

    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: trimmed }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onChangeApiKeyStatus('valid');
        setTestFeedback(data.message || '✓ API Key berhasil terhubung');
      } else {
        onChangeApiKeyStatus('invalid');
        setTestFeedback(
          data.message || 'API Key tidak valid atau tidak memiliki akses ke Gemini API.'
        );
      }
    } catch {
      onChangeApiKeyStatus('invalid');
      setTestFeedback('Gagal menguji API Key. Pastikan koneksi internet aktif.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      id="gemini-api-key-card"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 transition-all"
    >
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>🔑 Gemini API Key</span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                BYOK (Bawa Key Sendiri)
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Gunakan API Key Gemini milikmu agar proses AI menggunakan kuota akun/project milikmu sendiri.
            </p>
          </div>
        </div>

        {/* Status Indicator Pill */}
        <div className="flex items-center self-start sm:self-center shrink-0">
          {apiKeyStatus === 'valid' && (
            <span
              id="status-api-key-valid"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>🟢 API Key aktif</span>
            </span>
          )}

          {apiKeyStatus === 'invalid' && (
            <span
              id="status-api-key-invalid"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>🔴 API Key tidak valid</span>
            </span>
          )}

          {apiKeyStatus === 'untested' && (
            <span
              id="status-api-key-untested"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>🟡 Belum diperiksa</span>
            </span>
          )}
        </div>
      </div>

      {/* Input & Action Area */}
      <div className="mt-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Password Input with show/hide toggle */}
          <div className="relative flex-1">
            <input
              id="input-gemini-api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={handleInputChange}
              placeholder="Masukkan Gemini API Key (AIzaSy...)"
              autoComplete="off"
              spellCheck="false"
              className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50/60 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
            />
            <button
              type="button"
              id="btn-toggle-show-api-key"
              onClick={() => setShowKey(!showKey)}
              aria-label={showKey ? 'Sembunyikan API Key' : 'Tampilkan API Key'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Tes API Key Button */}
          <button
            type="button"
            id="btn-test-gemini-api-key"
            onClick={handleTestKey}
            disabled={isTesting || !apiKey.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memeriksa...</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                <span>Tes API Key</span>
              </>
            )}
          </button>
        </div>

        {/* Feedback Message if any */}
        {testFeedback && (
          <div
            id="test-feedback-message"
            className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
              apiKeyStatus === 'valid'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : apiKeyStatus === 'invalid'
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {apiKeyStatus === 'valid' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : apiKeyStatus === 'invalid' ? (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            )}
            <span className="font-medium leading-relaxed">{testFeedback}</span>
          </div>
        )}

        {/* Action link & Security Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          {/* Tombol Cara Mendapatkan API Key */}
          <button
            type="button"
            id="btn-toggle-api-key-guide"
            onClick={() => setShowGuide(!showGuide)}
            className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer py-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Cara Mendapatkan API Key</span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Privacy statement */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Key hanya disimpan di sesi aktif memori Anda</span>
          </div>
        </div>

        {/* Panduan Singkat Dropdown */}
        {showGuide && (
          <div
            id="api-key-guide-content"
            className="mt-3 p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3 text-xs text-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>📘 Panduan Langkah demi Langkah:</span>
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
              >
                <span>Buka Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="space-y-1.5 pl-4 list-decimal text-slate-700 leading-relaxed font-medium">
              <li>Buka Google AI Studio.</li>
              <li>Login dengan akun Google.</li>
              <li>
                Buka <strong className="text-slate-900">Dashboard → API Keys</strong>.
              </li>
              <li>
                Jika belum memiliki key, pilih <strong className="text-slate-900">Create API Key</strong>.
              </li>
              <li>Pilih/buat project.</li>
              <li>Salin API Key.</li>
              <li>Kembali ke aplikasi ini dan tempel pada kolom Gemini API Key.</li>
              <li>
                Tekan <strong className="text-slate-900">Tes API Key</strong>.
              </li>
            </ol>

            {/* Catatan Perbedaan Google AI Pro vs API */}
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/80 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Catatan Penting:</strong> Google AI Pro/Gemini Pro berbeda dengan Gemini API. Batas penggunaan API mengikuti project dan tier Gemini API yang digunakan.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
