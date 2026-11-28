import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { getImageUrl } from '../../utils/image';

export default function ImageUploader({ currentImageUrl, onFileSelect, onRemove }) {
  const [preview, setPreview] = useState(getImageUrl(currentImageUrl) || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentImageUrl) {
      setPreview(getImageUrl(currentImageUrl));
    }
  }, [currentImageUrl]);

  const handleFile = (file) => {
    setError('');
    if (!file) return;

    // Check MIME type / extension
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validExtensions.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Check size limit: 5 MB
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Image exceeds maximum allowed size of 5 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    // Generate local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRemove();
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)]">
        Clothing Photograph (Optional)
      </label>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] h-64 max-w-sm flex items-center justify-center group shadow-xs">
          <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--color-aura-border)] hover:border-[var(--color-aura-primary)] bg-[var(--color-aura-page)] hover:bg-[var(--color-aura-lavender)]/20 rounded-2xl p-8 text-center cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-aura-surface)] text-[var(--color-aura-primary)] flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[var(--color-aura-text)]">
            Click to upload or drag and drop
          </p>
          <p className="text-[11px] text-[var(--color-aura-muted)] mt-1">
            JPEG, PNG, or WebP (max. 5 MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      )}
    </div>
  );
}
