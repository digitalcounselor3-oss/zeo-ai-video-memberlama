import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageUploadAreaProps {
  images: UploadedImage[];
  onAddImages: (newImages: UploadedImage[]) => void;
  onRemoveImage: (id: string) => void;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  images,
  onAddImages,
  onRemoveImage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 6;
  const remainingSlots = MAX_IMAGES - images.length;

  const processFiles = (files: FileList | File[]) => {
    setErrorMsg(null);
    const validImageFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validImageFiles.push(file);
      }
    }

    if (validImageFiles.length === 0) {
      setErrorMsg('Silakan pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    if (images.length + validImageFiles.length > MAX_IMAGES) {
      setErrorMsg(
        `Maksimal ${MAX_IMAGES} gambar. Hanya ${remainingSlots} gambar yang dapat ditambahkan.`
      );
    }

    const getNormalizedMimeType = (file: File): string => {
      if (file.type && file.type.startsWith('image/')) {
        return file.type === 'image/jpg' ? 'image/jpeg' : file.type;
      }
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'png') return 'image/png';
      if (ext === 'webp') return 'image/webp';
      if (ext === 'heic') return 'image/heic';
      return 'image/jpeg';
    };

    const filesToTake = validImageFiles.slice(0, remainingSlots);
    const promises = filesToTake.map((file) => {
      return new Promise<UploadedImage>((resolve) => {
        const mime = getNormalizedMimeType(file);
        const reader = new FileReader();

        reader.onload = (event) => {
          const rawDataUrl = (event.target?.result as string) || '';
          if (!rawDataUrl) {
            resolve({
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: file.name,
              previewUrl: '',
              size: file.size,
              mimeType: mime,
              base64: '',
            });
            return;
          }

          // Ensure ultra-high-resolution images are scaled within 1800px to maintain
          // sharp OCR while preventing request timeouts and exceeding Gemini inline payload limits.
          const img = new Image();
          img.onload = () => {
            const MAX_DIM = 1800;
            let { width, height } = img;
            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const targetMime = mime === 'image/png' ? 'image/png' : 'image/jpeg';
                const optimizedDataUrl = canvas.toDataURL(targetMime, 0.92);
                resolve({
                  id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  name: file.name,
                  previewUrl: optimizedDataUrl,
                  size: Math.round((optimizedDataUrl.length * 3) / 4),
                  mimeType: targetMime,
                  base64: optimizedDataUrl,
                });
                return;
              }
            }

            resolve({
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: file.name,
              previewUrl: rawDataUrl,
              size: file.size,
              mimeType: mime,
              base64: rawDataUrl,
            });
          };

          img.onerror = () => {
            resolve({
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: file.name,
              previewUrl: rawDataUrl,
              size: file.size,
              mimeType: mime,
              base64: rawDataUrl,
            });
          };

          img.src = rawDataUrl;
        };

        reader.onerror = () => {
          console.error('FileReader error on file:', file.name);
          resolve({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            previewUrl: '',
            size: file.size,
            mimeType: mime,
            base64: '',
          });
        };

        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((newItems) => {
      const validItems = newItems.filter((item) => item.base64 && item.base64.length > 0);
      if (validItems.length > 0) {
        onAddImages(validItems);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value so same file can be re-uploaded if removed
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (remainingSlots > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (remainingSlots <= 0) {
      setErrorMsg(`Sudah mencapai batas maksimal ${MAX_IMAGES} gambar.`);
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section id="upload-reference-section" className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Upload Gambar Referensi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {images.length}/{MAX_IMAGES}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah hingga {MAX_IMAGES} foto campuran produk, model, outfit, atau screenshot toko
          </p>
        </div>

        {images.length > 0 && (
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            AI mendeteksi peran gambar otomatis
          </span>
        )}
      </div>

      {/* Main Drag & Drop / Click Zone */}
      {images.length < MAX_IMAGES ? (
        <div
          id="dropzone-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30'
          }`}
        >
          <input
            id="file-upload-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100/80 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
              <Upload className="w-7 h-7" />
            </div>

            <p className="text-sm font-semibold text-slate-800">
              Sentuh atau seret gambar ke sini
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Bisa langsung unggah beberapa foto sekaligus (JPG, PNG, WebP)
            </p>

            <button
              type="button"
              id="btn-choose-files"
              className="mt-3.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 transition-colors pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Pilih dari Galeri / Kamera
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Kapasitas penuh (6/6 gambar)
          </span>
          <span className="text-slate-400">Hapus salah satu jika ingin mengganti</span>
        </div>
      )}

      {/* Helpful Guidance Chips */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
          Bebas campur foto & screenshot (tanpa perlu kategorisasi manual):
        </p>
        <div className="flex flex-wrap gap-1.5 text-xs text-slate-600">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">Foto Produk</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">Foto Model</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">Atasan & Bawahan</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">Aksesori / Tas / Sepatu</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">Skincare / Kosmetik</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">Makanan & Minuman</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">Peralatan Rumah</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">Screenshot Marketplace & Deskripsi</span>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Thumbnails Grid */}
      {images.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              Preview Referensi Terunggah ({images.length})
            </span>
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                id="btn-add-more-images"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Gambar
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {images.map((img, idx) => (
              <div
                key={img.id}
                id={`thumbnail-card-${idx}`}
                className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs transition-all hover:border-indigo-300"
              >
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />

                {/* Index badge */}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md leading-none">
                  #{idx + 1}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  id={`btn-remove-image-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(img.id);
                  }}
                  title="Hapus gambar"
                  aria-label={`Hapus ${img.name}`}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center shadow-xs transition-colors"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* File size overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-1 pt-3 text-[10px] text-white/90 truncate text-center">
                  {formatFileSize(img.size)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
