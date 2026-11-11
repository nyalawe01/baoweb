import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, Check, RefreshCw } from 'lucide-react';

export function HeroBannerImageUploader({
  imageUrl,
  onImageChange,
  pageName = 'Page',
  supabase,
  showAlert,
  notify,
}: {
  imageUrl: string;
  onImageChange: (url: string) => void;
  pageName?: string;
  supabase?: any;
  showAlert?: (opts: any) => void;
  notify?: (msg: string, isErr?: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsUploading(true);
    showAlert?.({
      type: 'loading',
      title: 'Uploading Hero Banner...',
      message: `Uploading ${file.name} to server media storage...`,
    });

    try {
      const { data: sessionData } = supabase ? await supabase.auth.getSession() : { data: {} };
      const token = sessionData?.session?.access_token;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'organization');
      formData.append('visibility', 'public');
      formData.append('title_en', `${pageName} Hero Banner`);
      formData.append('alt_text_en', `${pageName} Hero Banner Image`);

      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'Failed to upload hero image.');
      }

      const uploadedUrl =
        resJson.media?.public_url ||
        (resJson.media?.storage_key ? `/media/${resJson.media.storage_key}` : null);

      if (uploadedUrl) {
        onImageChange(uploadedUrl);
        notify?.('Hero banner image uploaded successfully!');
        showAlert?.({
          type: 'success',
          title: 'Hero Banner Updated!',
          message: 'The new hero banner image was uploaded successfully. Click Save to publish changes.',
        });
      }
    } catch (err: any) {
      console.error('Error uploading hero banner:', err);
      notify?.(err.message || 'Image upload failed.', true);
      showAlert?.({
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Could not upload banner image.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-black uppercase tracking-wider">
          Hero Banner Image
        </label>
        <span className="text-[11px] text-slate-500 font-medium">
          Recommended: 1920 × 1080 (16:9 or 4:3 high-res)
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
        {/* Banner Preview */}
        <div className="relative w-full sm:w-56 aspect-[16/9] rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0 shadow-xs group">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Hero banner preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).setAttribute('src', '/media/public/images/organization/hero1.webp');
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
              <ImageIcon className="w-8 h-8 stroke-[1.5]" />
              <span className="text-[10px] font-bold mt-1 uppercase">No Image</span>
            </div>
          )}
          {imageUrl && (
            <div className="absolute top-1.5 right-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Active</span>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="space-y-2 flex-1 min-w-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileSelected}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Uploading Image...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-black" />
                  <span>{imageUrl ? 'Change Banner Image' : 'Upload Banner Image'}</span>
                </>
              )}
            </button>

            {imageUrl && (
              <button
                type="button"
                onClick={() => onImageChange('/media/public/images/organization/hero1.webp')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition cursor-pointer"
                title="Reset to default organization banner"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset to Default</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Click to upload a new banner photograph from your device. Supported formats: WEBP, PNG, JPG (up to 10MB).
          </p>
        </div>
      </div>
    </div>
  );
}

