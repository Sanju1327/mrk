/**
 * Media helpers shared by the teacher builder and the student lesson player.
 */

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_URL =
  /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)?([A-Za-z0-9_-]{11})(?:[?&#/].*)?$/i;

/** Extract the 11-char YouTube video id from a URL (or a bare id). Returns null when invalid. */
export function extractYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;
  if (YOUTUBE_ID.test(value)) return value;
  const match = value.match(YOUTUBE_URL);
  return match ? match[1] : null;
}

export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export function youTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** Turn a backend-relative `/uploads/...` URL into something the browser can load via the API proxy/base URL. */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = import.meta.env.VITE_API_URL as string | undefined;
  if (apiBase && /^https?:\/\//i.test(apiBase)) {
    // VITE_API_URL like https://host/api -> https://host
    try {
      const origin = new URL(apiBase).origin;
      return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
    } catch {
      return url;
    }
  }
  return url;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export const VIDEO_ACCEPT = '.mp4,.webm,.m4v,.mov,video/mp4,video/webm,video/quicktime';
export const MATERIAL_ACCEPT =
  '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md,.rtf,.zip,.png,.jpg,.jpeg,.webp,.gif,' +
  '.java,.py,.js,.ts,.jsx,.tsx,.c,.cpp,.h,.hpp,.cs,.go,.rs,.rb,.php,.kt,.swift,.sql,.html,.css,.json,.xml,.yml,.yaml,.sh';
export const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.webp,.gif,image/*';

export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
export const MAX_MATERIAL_BYTES = 50 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function extensionOf(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx >= 0 ? fileName.slice(idx + 1).toLowerCase() : '';
}
