import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Check, ExternalLink, Loader2, Pencil, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import { MATERIAL_ACCEPT, MAX_MATERIAL_BYTES, formatFileSize, resolveMediaUrl } from '@/lib/media';
import type { CourseResource } from '@/types/course';
import { resourceIcon, resourceLabel } from '@/components/media/MaterialList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Notify } from './types';
import { inputClass, labelClass } from './types';

interface LessonMaterialsEditorProps {
  lessonId: number;
  courseId: number;
  resources: CourseResource[];
  notify: Notify;
}

/** Upload, edit, replace and remove downloadable learning materials for a lesson. */
export const LessonMaterialsEditor: React.FC<LessonMaterialsEditorProps> = ({ lessonId, courseId, resources, notify }) => {
  const queryClient = useQueryClient();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [replacingId, setReplacingId] = useState<number | null>(null);
  const [replaceProgress, setReplaceProgress] = useState(0);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['teacher-lesson', lessonId] });
    queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', courseId] });
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_MATERIAL_BYTES) {
      return `File must be under ${formatFileSize(MAX_MATERIAL_BYTES)} (selected ${formatFileSize(file.size)})`;
    }
    return null;
  };

  const choose = (file: File | undefined) => {
    if (!file) return;
    const problem = validateFile(file);
    setUploadError(problem);
    if (problem) return;
    setPendingFile(file);
    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ''));
  };

  const upload = async () => {
    if (!pendingFile) return;
    if (!title.trim()) {
      setUploadError('Please give the material a title');
      return;
    }
    setUploading(true);
    setProgress(0);
    setUploadError(null);
    try {
      await teacherApi.uploadLessonMaterial(lessonId, pendingFile, { title: title.trim(), description: description.trim() || undefined }, setProgress);
      invalidate();
      setPendingFile(null);
      setTitle('');
      setDescription('');
      notify('success', 'Material uploaded');
    } catch (err: any) {
      const message =
        err.response?.status === 413
          ? 'File exceeds the server upload limit'
          : err.response?.data?.message || (err.message === 'Network Error' ? 'Network error during upload' : 'Upload failed');
      setUploadError(message);
    } finally {
      setUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { title: string; description?: string } }) => teacherApi.updateResource(id, payload),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      notify('success', 'Material updated');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to update material'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => teacherApi.deleteResource(id),
    onSuccess: () => {
      invalidate();
      notify('success', 'Material removed');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to remove material'),
  });

  const replaceFile = async (file: File | undefined) => {
    if (!file || replacingId == null) return;
    const problem = validateFile(file);
    if (problem) {
      notify('error', problem);
      setReplacingId(null);
      return;
    }
    setReplaceProgress(0);
    try {
      await teacherApi.replaceMaterialFile(replacingId, file, setReplaceProgress);
      invalidate();
      notify('success', 'File replaced');
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Failed to replace file');
    } finally {
      setReplacingId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const startEdit = (res: CourseResource) => {
    setEditingId(res.id);
    setEditTitle(res.title);
    setEditDescription(res.description || '');
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Existing materials */}
      {resources.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-5 text-center text-muted-foreground">
          No learning materials yet. Upload PDFs, slides, spreadsheets, archives, images or source files below.
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {resources.map((res) => {
            const Icon = resourceIcon(res.resourceType);
            const isEditing = editingId === res.id;
            const isReplacing = replacingId === res.id;
            return (
              <li key={res.id} className="px-3 py-2.5 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-raised border border-border text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" className={inputClass} />
                        <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description (optional)" className={inputClass} />
                      </div>
                    ) : (
                      <>
                        <div className="truncate font-sans text-sm font-medium text-foreground">{res.title}</div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {resourceLabel(res.resourceType)}
                          {res.fileName ? ` · ${res.fileName}` : ''}
                          {res.fileSize ? ` · ${formatFileSize(res.fileSize)}` : ''}
                          {res.description ? ` · ${res.description}` : ''}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                          title="Save"
                          disabled={!editTitle.trim() || updateMutation.isPending}
                          onClick={() => updateMutation.mutate({ id: res.id, payload: { title: editTitle.trim(), description: editDescription.trim() || undefined } })}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-muted-foreground hover:text-foreground" title="Cancel" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <a href={resolveMediaUrl(res.url)} target="_blank" rel="noreferrer" className="p-1.5 text-muted-foreground hover:text-foreground" title="Open">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button className="p-1.5 text-muted-foreground hover:text-foreground" title="Edit title / description" onClick={() => startEdit(res)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {res.resourceType !== 'LINK' && (
                          <button
                            className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
                            title="Replace file"
                            disabled={replacingId != null}
                            onClick={() => {
                              setReplacingId(res.id);
                              setTimeout(() => replaceInputRef.current?.click(), 0);
                            }}
                          >
                            {isReplacing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                          </button>
                        )}
                        <button
                          className="p-1.5 text-muted-foreground hover:text-destructive"
                          title="Remove"
                          onClick={() => {
                            if (window.confirm(`Remove "${res.title}"? The file will be deleted from storage.`)) deleteMutation.mutate(res.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {isReplacing && replaceProgress > 0 && (
                  <div className="h-1 w-full rounded-full bg-surface-raised overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all" style={{ width: `${replaceProgress}%` }} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <input ref={replaceInputRef} type="file" accept={MATERIAL_ACCEPT} className="hidden" onChange={(e) => replaceFile(e.target.files?.[0])} />

      {/* Upload new material */}
      <div className="rounded-lg border border-border bg-surface-raised p-4 space-y-3">
        <div className="text-muted-foreground uppercase tracking-wider font-semibold">+ Upload learning material</div>

        {!pendingFile ? (
          <div
            className="rounded-lg border-2 border-dashed border-border hover:border-purple-500/40 p-5 text-center cursor-pointer transition-colors"
            onClick={() => uploadInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              choose(e.dataTransfer.files?.[0]);
            }}
          >
            <Upload className="h-5 w-5 mx-auto text-purple-400 mb-1.5" />
            <div className="text-foreground">Choose a file or drag it here</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              PDF, Word, PowerPoint, Excel, ZIP, images, text and source code · max {formatFileSize(MAX_MATERIAL_BYTES)}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2">
              <span className="truncate text-foreground">
                {pendingFile.name} <span className="text-muted-foreground">· {formatFileSize(pendingFile.size)}</span>
              </span>
              {!uploading && (
                <button className="text-muted-foreground hover:text-foreground" onClick={() => setPendingFile(null)} title="Choose another file">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} disabled={uploading} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" className={inputClass} disabled={uploading} />
              </div>
            </div>
            {uploading && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" /> Uploading… {progress}%
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setPendingFile(null)} disabled={uploading}>
                Cancel
              </Button>
              <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1" onClick={upload} disabled={uploading || !title.trim()}>
                <Upload className="h-3.5 w-3.5" /> {uploading ? 'Uploading...' : 'Upload material'}
              </Button>
            </div>
          </div>
        )}

        <input ref={uploadInputRef} type="file" accept={MATERIAL_ACCEPT} className="hidden" onChange={(e) => choose(e.target.files?.[0])} />

        {uploadError && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
