import React, { useRef, useState } from 'react';
import { User, Sparkles, Upload, FileText, Ban, Trash2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { CharacterOption, UploadedImage } from '../types';

interface CharacterModelSelectorProps {
  characterOption: CharacterOption;
  onChangeCharacterOption: (option: CharacterOption) => void;
  characterLock: boolean;
  onChangeCharacterLock: (locked: boolean) => void;
  characterSheet: UploadedImage | null;
  onUploadCharacterSheet: (img: UploadedImage | null) => void;
  characterDescription: string;
  onChangeCharacterDescription: (desc: string) => void;
}

export const CharacterModelSelector: React.FC<CharacterModelSelectorProps> = ({
  characterOption,
  onChangeCharacterOption,
  characterLock,
  onChangeCharacterLock,
  characterSheet,
  onUploadCharacterSheet,
  characterDescription,
  onChangeCharacterDescription,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSheetError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setSheetError('File harus berupa gambar (JPG, PNG, atau WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSheetError('Ukuran gambar maksimal 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      const uploaded: UploadedImage = {
        id: `cs-${Date.now()}`,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        base64: b64,
        mimeType: file.type || 'image/jpeg',
        size: file.size,
      };
      onUploadCharacterSheet(uploaded);
      setSheetError(null);
    };
    reader.onerror = () => {
      setSheetError('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleRemoveSheet = () => {
    onUploadCharacterSheet(null);
    setSheetError(null);
  };

  const options: {
    id: CharacterOption;
    label: string;
    sublabel: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'Otomatis dari Referensi',
      label: 'Otomatis dari Referensi',
      sublabel: 'Gunakan model/manusia dari foto referensi yang diunggah',
      icon: Sparkles,
    },
    {
      id: 'Upload Character Sheet',
      label: 'Upload Character Sheet',
      sublabel: 'Unggah 1 foto khusus model / character sheet / kolase wajah & pose',
      icon: Upload,
    },
    {
      id: 'Buat Karakter dari Teks',
      label: 'Buat Karakter dari Teks',
      sublabel: 'Deskripsikan profil karakter model dengan teks terarah',
      icon: FileText,
    },
    {
      id: 'Tanpa Model',
      label: 'Tanpa Model',
      sublabel: 'Khusus video product-only showcase tanpa karakter manusia',
      icon: Ban,
    },
  ];

  return (
    <section id="character-model-section" className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" />
          <span>Karakter / Model Video</span>
        </label>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          Character Lock
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
        Tentukan kehadiran model manusia dan kunci konsistensi identitas karakter (wajah, hijab/rambut, postur) di setiap adegan video.
      </p>

      {/* Grid Opsi Karakter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = characterOption === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              id={`btn-char-opt-${opt.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onChangeCharacterOption(opt.id)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 ml-1.5" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {opt.sublabel}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* MODE KARAKTER TETAP - TOGGLE KUNCI KARAKTER */}
      {characterOption !== 'Tanpa Model' && (
        <div
          id="character-lock-toggle-box"
          className="mb-4 p-3.5 rounded-xl border border-indigo-200/90 bg-indigo-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                characterLock ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  🔒 Kunci Karakter
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    characterLock ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {characterLock ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Pertahankan karakter yang sama, meskipun produk yang digunakan berbeda.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            id="toggle-character-lock-btn"
            role="switch"
            aria-checked={characterLock}
            onClick={() => onChangeCharacterLock(!characterLock)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 self-start sm:self-center ${
              characterLock ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                characterLock ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* SUB-PANEL 1: UPLOAD CHARACTER SHEET */}
      {characterOption === 'Upload Character Sheet' && (
        <div id="character-sheet-subpanel" className="p-4 rounded-xl border border-indigo-200/90 bg-indigo-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-600" />
              Upload Character Sheet (1 Gambar Khusus Model)
            </span>
            <span className="text-[10px] text-slate-500">Maksimal 1 gambar</span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Dapat berupa satu foto model, character sheet tampak depan/samping, kolase wajah & pose, atau karakter AI sebelumnya.
            <strong className="text-indigo-900"> Pakaian pada Character Sheet bukan produk yang dijual</strong>—jika produk berupa pakaian, AI otomatis memakaikan produk referensi ke model ini.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            id="character-sheet-file-input"
          />

          {!characterSheet ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 sm:p-5 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-white cursor-pointer transition-colors text-center group"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-2 transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Klik untuk Memilih File Character Sheet
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mendukung JPG, PNG, WebP (maks. 10MB)
              </p>
            </div>
          ) : (
            <div className="p-3 bg-white rounded-xl border border-indigo-200 flex items-center gap-3">
              <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 relative group">
                <img
                  src={characterSheet.previewUrl}
                  alt="Character Sheet"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Character Sheet Siap Digunakan</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 truncate" title={characterSheet.name}>
                  {characterSheet.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {(characterSheet.size / 1024).toFixed(0)} KB • Character Lock Aktif
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Ganti Gambar
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleRemoveSheet}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {sheetError && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{sheetError}</span>
            </div>
          )}
        </div>
      )}

      {/* SUB-PANEL 2: BUAT KARAKTER DARI TEKS */}
      {characterOption === 'Buat Karakter dari Teks' && (
        <div id="character-text-subpanel" className="p-4 rounded-xl border border-indigo-200/90 bg-indigo-50/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="character-description-input"
              className="text-xs font-bold text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Deskripsi Karakter</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {characterDescription.length}/400
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Deskripsikan gender presentation, kelompok usia visual, bentuk tubuh, rambut/hijab, ekspresi wajah, skin tone, atau pakaian dasar.
            <span className="text-slate-500 italic block mt-0.5">
              (Jangan meminta atau menyertakan data/identitas pribadi).
            </span>
          </p>

          <textarea
            id="character-description-input"
            rows={3}
            maxLength={400}
            value={characterDescription}
            onChange={(e) => onChangeCharacterDescription(e.target.value)}
            placeholder="Contoh: Wanita Indonesia dewasa, berhijab beige, wajah ramah, tubuh proporsional, mengenakan inner putih dan celana netral, gaya casual modern."
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-indigo-200 bg-white text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 font-medium self-center">Template cepat:</span>
            {[
              'Wanita berhijab modern, usia 20-an, wajah ramah natural',
              'Pria casual dewasa muda, postur atletis, senyum ramah',
              'Wanita rambut sebahu, gaya elegan chic minimalis',
            ].map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeCharacterDescription(tmpl)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                + {tmpl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-PANEL 3: TANPA MODEL */}
      {characterOption === 'Tanpa Model' && (
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start gap-2">
          <Ban className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 block">Mode Product-Only Aktif</span>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Video tidak akan menampilkan manusia/model, melainkan berfokus 100% pada showcase estetis fisik produk, tekstur bahan, dan sudut kamera sinematik.
            </p>
          </div>
        </div>
      )}

      {/* SUB-PANEL 4: OTOMATIS DARI REFERENSI */}
      {characterOption === 'Otomatis dari Referensi' && (
        <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-slate-700 text-xs flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-950 block">Deteksi Karakter Otomatis</span>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Jika foto referensi produk menampilkan orang atau model, AI otomatis mengunci model tersebut sebagai karakter video. Jika seluruh foto hanya produk, AI akan membuat video product-only.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
