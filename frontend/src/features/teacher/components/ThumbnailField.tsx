import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, formatFileSize, resolveMediaUrl } from '@/lib/media';
import { Button } from '@/components/ui/button';

interface ThumbnailFieldProps {
  value: string;
  onChange: (url: string) => void;
  onError?: (message: string | null) => void;
}

/** Optional course thumbnail: uploads an image via the existing teacher upload endpoint. */
export const ThumbnailField: React.FC<ThumbnailFieldProps> = ({ value, onChange, onError }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    onError?.(null);
    if (file.size > MAX_IMAGE_BYTES) {
      onError?.(`Thumbnail must be under ${formatFileSize(MAX_IMAGE_BYTES)}`);
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const uploaded = await teacherApi.uploadFile(file, 'IMAGE', setProgress);
      onChange(uploaded.url);
    } catch (err: any) {
      onError?.(err.response?.data?.message || 'Thumbnail upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-muted-foreground">Thumbnail (optional)</label>
      <div className="flex items-center gap-3">
        <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md border border-border bg-surface flex items-center justify-center">
          {value ? (
            <img src={resolveMediaUrl(value)} alt="Course thumbnail" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="h-8 text-xs gap-1.5"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              {uploading ? `Uploading ${progress}%` : value ? 'Replace image' : 'Upload image'}
            </Button>
            {value && !uploading && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange('')}
                className="h-8 text-xs gap-1.5 text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP or GIF · max {formatFileSize(MAX_IMAGE_BYTES)}</p>
          {uploading && (
            <div className="h-1 w-full rounded bg-surface-raised overflow-hidden">
              <div className="h-full bg-purple-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </div>
  );
};
