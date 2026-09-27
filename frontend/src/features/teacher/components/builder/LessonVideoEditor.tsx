import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Loader2, Trash2, Upload, Youtube, VideoOff } from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import { extractYouTubeId, formatFileSize, MAX_VIDEO_BYTES, VIDEO_ACCEPT, extensionOf } from '@/lib/media';
import type { LessonDetail, VideoType } from '@/types/course';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Notify } from './types';
import { inputClass, labelClass } from './types';

interface LessonVideoEditorProps {
  lesson: LessonDetail;
  courseId: number;
  notify: Notify;
}

const ALLOWED_VIDEO_EXT = ['mp4', 'webm', 'm4v', 'mov'];

/** Primary lesson video: none, a YouTube link, or an uploaded file served from storage. */
export const LessonVideoEditor: React.FC<LessonVideoEditorProps> = ({ lesson, courseId, notify }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [source, setSource] = useState<VideoType>(lesson.videoType || 'NONE');
  const [youtubeInput, setYoutubeInput] = useState(lesson.videoType === 'YOUTUBE' ? lesson.videoUrl || '' : '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setSource(lesson.videoType || 'NONE');
    setYoutubeInput(lesson.videoType === 'YOUTUBE' ? lesson.videoUrl || '' : '');
    setUploadError(null);
  }, [lesson.id, lesson.videoType, lesson.videoUrl]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['teacher-lesson', lesson.id] });
    queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', courseId] });
  };

  const saveYouTubeMutation = useMutation({
    mutationFn: (url: string) =>
      teacherApi.updateLesson(lesson.id, {
        title: lesson.title,
        description: lesson.description ?? undefined,
        contentMarkdown: lesson.contentMarkdown,
        estimatedMinutes: lesson.estimatedMinutes,
        published: lesson.published,
        videoType: 'YOUTUBE',
        videoUrl: url,
      }),
    onSuccess: () => {
      invalidate();
      notify('success', 'YouTube video linked to lesson');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Could not save YouTube link'),
  });

  const clearVideoMutation = useMutation({
    mutationFn: () => teacherApi.removeLessonVideo(lesson.id),
    onSuccess: () => {
      invalidate();
      setYoutubeInput('');
      setSource('NONE');
      notify('success', 'Video removed from lesson');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Could not remove video'),
  });

  const youtubeId = extractYouTubeId(youtubeInput);
  const youtubeInvalid = youtubeInput.trim().length > 0 && !youtubeId;
  const youtubeDirty = youtubeInput.trim() !== (lesson.videoType === 'YOUTUBE' ? lesson.videoUrl || '' : '');

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    const ext = extensionOf(file.name);
    if (!ALLOWED_VIDEO_EXT.includes(ext)) {
      setUploadError(`Unsupported video format ".${ext}". Allowed: ${ALLOWED_VIDEO_EXT.join(', ')}`);
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setUploadError(`Video must be under ${formatFileSize(MAX_VIDEO_BYTES)} (selected ${formatFileSize(file.size)})`);
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      await teacherApi.uploadLessonVideo(lesson.id, file, setProgress);
      invalidate();
      notify('success', 'Video uploaded');
    } catch (err: any) {
      const message =
        err.response?.status === 413
          ? 'Video is too large for the server upload limit'
          : err.response?.data?.message || (err.message === 'Network Error' ? 'Network error during upload' : 'Upload failed');
      setUploadError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const hasStoredVideo = lesson.videoType !== 'NONE' && !!lesson.videoUrl;

  const sourceOption = (value: VideoType, label: string, Icon: React.ElementType, hint: string) => (
    <label
      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
        source === value ? 'border-purple-500/60 bg-purple-500/5' : 'border-border hover:border-purple-500/30'
      }`}
    >
      <input
        type="radio"
        name={`video-source-${lesson.id}`}
        value={value}
        checked={source === value}
        onChange={() => setSource(value)}
        className="mt-0.5 accent-purple-600"
        disabled={uploading}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Icon className="h-3.5 w-3.5 text-purple-400" />
          <span>{label}</span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>
      </div>
    </label>
  );

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {sourceOption('NONE', 'No video', VideoOff, 'Text, materials and content blocks only')}
        {sourceOption('YOUTUBE', 'YouTube link', Youtube, 'Paste a watch, share or Shorts URL')}
        {sourceOption('UPLOAD', 'Upload video', Upload, `MP4/WebM/MOV up to ${formatFileSize(MAX_VIDEO_BYTES)}`)}
      </div>

      {source === 'NONE' && hasStoredVideo && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <span className="text-amber-300">
            This lesson currently has a {lesson.videoType === 'YOUTUBE' ? 'YouTube' : 'uploaded'} video. Remove it to switch to no video.
          </span>
          <Button size="sm" variant="outline" onClick={() => clearVideoMutation.mutate()} disabled={clearVideoMutation.isPending} className="h-8 text-xs shrink-0">
            {clearVideoMutation.isPending ? 'Removing...' : 'Remove video'}
          </Button>
        </div>
      )}

      {source === 'YOUTUBE' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className={labelClass}>YouTube URL *</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                className={`${inputClass} ${youtubeInvalid ? 'border-rose-500/60 focus-visible:ring-rose-500' : ''}`}
              />
              <Button
                size="sm"
                onClick={() => youtubeId && saveYouTubeMutation.mutate(youtubeInput.trim())}
                disabled={!youtubeId || !youtubeDirty || saveYouTubeMutation.isPending}
                className="h-9 shrink-0 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {saveYouTubeMutation.isPending ? 'Saving...' : 'Save link'}
              </Button>
            </div>
            {youtubeInvalid ? (
              <p className="flex items-center gap-1 text-[11px] text-rose-400">
                <AlertCircle className="h-3 w-3" /> Invalid YouTube URL. Use youtube.com/watch?v=…, youtu.be/…, or a Shorts link.
              </p>
            ) : youtubeId ? (
              <p className="flex items-center gap-1 text-[11px] text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Video id: {youtubeId}
                {!youtubeDirty && lesson.videoType === 'YOUTUBE' && ' (saved)'}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Students see the embedded player inside the lesson.</p>
            )}
          </div>

          {youtubeId && (
            <div className="max-w-2xl">
              <VideoPlayer videoType="YOUTUBE" videoUrl={youtubeInput} videoId={youtubeId} title={lesson.title} />
            </div>
          )}

          {lesson.videoType === 'YOUTUBE' && (
            <div className="flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => clearVideoMutation.mutate()} disabled={clearVideoMutation.isPending} className="h-8 text-xs text-muted-foreground hover:text-rose-400 gap-1">
                <Trash2 className="h-3.5 w-3.5" /> Remove video
              </Button>
            </div>
          )}
        </div>
      )}

      {source === 'UPLOAD' && (
        <div className="space-y-3">
          {lesson.videoType === 'UPLOAD' && lesson.videoUrl && !uploading && (
            <div className="space-y-2">
              <div className="max-w-2xl">
                <VideoPlayer
                  key={lesson.videoUrl}
                  videoType="UPLOAD"
                  videoUrl={lesson.videoUrl}
                  mimeType={lesson.videoMimeType}
                  title={lesson.title}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2">
                <div className="truncate text-muted-foreground">
                  <span className="text-foreground">{lesson.videoFileName || 'video'}</span>
                  {lesson.videoFileSize ? ` · ${formatFileSize(lesson.videoFileSize)}` : ''}
                  {lesson.videoMimeType ? ` · ${lesson.videoMimeType}` : ''}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" /> Replace
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 text-muted-foreground hover:text-rose-400" onClick={() => clearVideoMutation.mutate()} disabled={clearVideoMutation.isPending}>
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(lesson.videoType !== 'UPLOAD' || uploading) && (
            <div
              className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                uploading ? 'border-purple-500/50 bg-purple-500/5' : 'border-border hover:border-purple-500/40 cursor-pointer'
              }`}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!uploading) handleUpload(e.dataTransfer.files?.[0]);
              }}
            >
              {uploading ? (
                <div className="space-y-2">
                  <Loader2 className="h-6 w-6 mx-auto animate-spin text-purple-400" />
                  <div className="text-foreground">Uploading video… {progress}%</div>
                  <div className="h-1.5 w-full max-w-sm mx-auto rounded-full bg-surface-raised overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-[11px] text-muted-foreground">Keep this tab open until the upload finishes.</div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Upload className="h-6 w-6 mx-auto text-purple-400" />
                  <div className="text-foreground">Click to choose a video or drag it here</div>
                  <div className="text-[11px] text-muted-foreground">
                    MP4, WebM or MOV · max {formatFileSize(MAX_VIDEO_BYTES)} · stored in course storage, streamed to students via the HTML5 player
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={VIDEO_ACCEPT}
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />

          {uploadError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
              <button className="ml-auto underline" onClick={() => fileInputRef.current?.click()}>
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
