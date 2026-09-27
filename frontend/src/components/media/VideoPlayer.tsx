import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2, Youtube } from 'lucide-react';
import type { VideoType } from '@/types/course';
import { extractYouTubeId, resolveMediaUrl, youTubeEmbedUrl } from '@/lib/media';

interface VideoPlayerProps {
  videoType: VideoType;
  videoUrl: string | null | undefined;
  videoId?: string | null;
  mimeType?: string | null;
  title?: string;
  /** Resume position for uploaded videos (seconds). */
  startAt?: number;
  /** Called periodically (~every 5s) and on pause with the current position of uploaded videos. */
  onProgress?: (seconds: number) => void;
  onEnded?: () => void;
  className?: string;
}

/**
 * Renders a lesson video: YouTube (privacy-enhanced embed) or an uploaded file via the HTML5 player.
 * Handles loading and failure states so the lesson page never shows a blank box.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoType,
  videoUrl,
  videoId,
  mimeType,
  title,
  startAt = 0,
  onProgress,
  onEnded,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastReported = useRef(0);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
  }, [videoType, videoUrl, videoId]);

  const report = useCallback(
    (force = false) => {
      const el = videoRef.current;
      if (!el || !onProgress) return;
      const pos = Math.floor(el.currentTime);
      if (force || Math.abs(pos - lastReported.current) >= 5) {
        lastReported.current = pos;
        onProgress(pos);
      }
    },
    [onProgress]
  );

  if (videoType === 'NONE' || !videoUrl) {
    return null;
  }

  const frame = `relative w-full overflow-hidden rounded-lg border border-border bg-black aspect-video ${className}`;

  if (videoType === 'YOUTUBE') {
    const id = videoId || extractYouTubeId(videoUrl);
    if (!id) {
      return (
        <div className={`${frame} flex items-center justify-center`}>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
            <AlertTriangle className="h-4 w-4" />
            Invalid YouTube link
          </div>
        </div>
      );
    }
    return (
      <div className={frame}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        <iframe
          className="absolute inset-0 h-full w-full"
          src={youTubeEmbedUrl(id)}
          title={title || 'Lesson video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoading(false)}
        />
        <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-white/80">
          <Youtube className="h-3 w-3" /> YouTube
        </div>
      </div>
    );
  }

  // UPLOAD
  if (failed) {
    return (
      <div className={`${frame} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-2 text-center px-6">
          <AlertTriangle className="h-6 w-6 text-rose-400" />
          <p className="text-sm text-foreground">Video failed to load</p>
          <p className="text-xs text-muted-foreground font-mono">
            The file may be missing or in an unsupported format.
          </p>
          <a
            href={resolveMediaUrl(videoUrl)}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-400 hover:underline"
          >
            Open file directly
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={frame}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full"
        controls
        controlsList="nodownload"
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          if (startAt > 0 && startAt < e.currentTarget.duration - 3) {
            e.currentTarget.currentTime = startAt;
          }
        }}
        onCanPlay={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
        onTimeUpdate={() => report(false)}
        onPause={() => report(true)}
        onEnded={() => {
          report(true);
          onEnded?.();
        }}
      >
        <source src={resolveMediaUrl(videoUrl)} type={mimeType || undefined} />
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
};
