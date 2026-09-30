import React, { useState } from 'react';
import { APP_NAME, APP_SUBTITLE, APP_CREATOR, APP_VERSION } from '../../config/appConfig';
import { X, Shield, FileText } from 'lucide-react';

interface AppFooterProps {
  onOpenHelp?: () => void;
  onOpenAbout?: () => void;
  className?: string;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  onOpenHelp,
  onOpenAbout,
  className = '',
}) => {
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);

  return (
    <>
      <footer
        id="app-footer"
        className={`py-6 px-4 text-center border-t border-slate-200/80 bg-white/70 backdrop-blur-xs text-xs text-slate-600 ${className}`}
      >
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Format: ZEO v1.0 — AI Video Studio by Ms. Inggid */}
          <div className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight">
            <span>{APP_VERSION}</span>
            <span className="mx-1.5 text-slate-400">—</span>
            <span>{APP_SUBTITLE} by {APP_CREATOR}</span>
          </div>

          {/* Links with center dot separator: Tentang ZEO • Bantuan • Syarat & Ketentuan • Privasi */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-semibold text-xs text-indigo-700">
            {onOpenAbout ? (
              <button
                type="button"
                id="footer-link-about"
                onClick={onOpenAbout}
                className="hover:text-indigo-900 transition-colors cursor-pointer"
              >
                Tentang ZEO
              </button>
            ) : (
              <span>Tentang ZEO</span>
            )}

            <span className="text-slate-400 select-none">•</span>

            {onOpenHelp ? (
              <button
                type="button"
                id="footer-link-help"
                onClick={onOpenHelp}
                className="hover:text-indigo-900 transition-colors cursor-pointer"
              >
                Bantuan
              </button>
            ) : (
              <span>Bantuan</span>
            )}

            <span className="text-slate-400 select-none">•</span>

            <button
              type="button"
              id="footer-link-terms"
              onClick={() => setModalType('terms')}
              className="hover:text-indigo-900 transition-colors cursor-pointer"
            >
              Syarat & Ketentuan
            </button>

            <span className="text-slate-400 select-none">•</span>

            <button
              type="button"
              id="footer-link-privacy"
              onClick={() => setModalType('privacy')}
              className="hover:text-indigo-900 transition-colors cursor-pointer"
            >
              Privasi
            </button>
          </div>

          {/* Disclaimers matching Requirement #4 */}
          <div className="pt-2 text-[11px] sm:text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed space-y-1">
            <p>
              ZEO adalah alat bantu penyusunan prompt gambar dan video AI. Hasil akhir bergantung pada model AI, referensi, dan layanan yang digunakan.
            </p>
            <p className="text-slate-400 font-medium">
              ZEO bukan produk resmi Google.
            </p>
          </div>
        </div>
      </footer>

      {/* Syarat & Ketentuan Modal */}
      {modalType === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-base">
                <FileText className="w-5 h-5" />
                <span>Syarat & Ketentuan ZEO</span>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                <strong>1. Penggunaan Layanan:</strong> ZEO disediakan sebagai alat bantu penyusun prompt gambar dan video AI. Anda bertanggung jawab penuh atas materi atau konten yang Anda unggah dan hasilkan.
              </p>
              <p>
                <strong>2. Kepemilikan & Hak Cipta:</strong> Seluruh ide, teks, dan prompt yang Anda susun adalah milik Anda sepenuhnya. Pastikan Anda memiliki hak atas setiap gambar atau materi referensi yang Anda unggah.
              </p>
              <p>
                <strong>3. Batasan Tanggung Jawab:</strong> ZEO menggunakan API kecerdasan buatan pihak ketiga (Gemini). ZEO tidak menjamin hasil video akhir yang digenerate oleh layanan video eksternal (Flow, Veo, dsb).
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kebijakan Privasi Modal */}
      {modalType === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base">
                <Shield className="w-5 h-5" />
                <span>Kebijakan Privasi ZEO</span>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                <strong>1. Penyimpanan Lokal:</strong> Nama sesi dan API Key (jika Anda gunakan mode BYOK) disimpan di browser lokal Anda (sessionStorage) dan tidak dibagikan ke pihak lain yang tidak berkepentingan.
              </p>
              <p>
                <strong>2. Penggunaan Data:</strong> Gambar referensi dan deskripsi hanya diproses sementara untuk tujuan pembacaan atribut visual oleh model kecerdasan buatan.
              </p>
              <p>
                <strong>3. Keamanan Sesi:</strong> Anda dapat menghapus sesi Anda kapan saja dengan menekan tombol Keluar di bilah atas.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
