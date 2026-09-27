import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, FileText, Layers, Paperclip, Save, Trash2, Video } from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LessonVideoEditor } from './LessonVideoEditor';
import { LessonMaterialsEditor } from './LessonMaterialsEditor';
import { ContentBlocksEditor } from './ContentBlocksEditor';
import type { Notify } from './types';
import { inputClass, labelClass, textareaClass } from './types';

interface LessonEditorProps {
  lessonId: number;
  courseId: number;
  chapterTitle: string;
  notify: Notify;
  onDeleted: () => void;
}

const Section: React.FC<{ icon: React.ElementType; title: string; hint?: string; children: React.ReactNode }> = ({ icon: Icon, title, hint, children }) => (
  <section className="rounded-xl border border-border bg-surface p-5 space-y-4">
    <div className="flex items-center justify-between border-b border-border pb-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-purple-400" />
        <span>{title}</span>
      </div>
      {hint && <span className="text-[11px] font-mono text-muted-foreground hidden sm:block">{hint}</span>}
    </div>
    {children}
  </section>
);

export const LessonEditor: React.FC<LessonEditorProps> = ({ lessonId, courseId, chapterTitle, notify, onDeleted }) => {
  const queryClient = useQueryClient();

  const { data: lesson, isLoading, isError } = useQuery({
    queryKey: ['teacher-lesson', lessonId],
    queryFn: () => teacherApi.getLessonDetail(lessonId),
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minutes, setMinutes] = useState(20);
  const [published, setPublished] = useState(true);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setDescription(lesson.description || '');
      setMinutes(lesson.estimatedMinutes);
      setPublished(lesson.published);
    }
  }, [lesson]);

  const dirty =
    !!lesson &&
    (title !== lesson.title ||
      description !== (lesson.description || '') ||
      minutes !== lesson.estimatedMinutes ||
      published !== lesson.published);

  const saveMutation = useMutation({
    mutationFn: () =>
      teacherApi.updateLesson(lessonId, {
        title: title.trim(),
        description: description.trim() || undefined,
        contentMarkdown: lesson?.contentMarkdown ?? '',
        estimatedMinutes: minutes,
        published,
        // keep whatever video is stored
        videoType: lesson?.videoType,
        videoUrl: lesson?.videoType === 'YOUTUBE' ? lesson.videoUrl ?? undefined : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', courseId] });
      notify('success', 'Lesson saved');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to save lesson'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => teacherApi.deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', courseId] });
      notify('success', 'Lesson deleted');
      onDeleted();
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to delete lesson'),
  });

  if (isLoading) {
    return <div className="py-16 text-center font-mono text-xs text-muted-foreground">Loading lesson...</div>;
  }
  if (isError || !lesson) {
    return <div className="py-16 text-center font-mono text-xs text-destructive">Could not load this lesson.</div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-mono text-purple-400 font-semibold truncate">{chapterTitle} &gt; Lesson</div>
          <h2 className="text-xl font-semibold text-foreground truncate">{lesson.title}</h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-muted-foreground hover:text-rose-400 gap-1"
            onClick={() => {
              if (window.confirm(`Delete lesson "${lesson.title}"? Its video and materials will be removed.`)) deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1"
            onClick={() => saveMutation.mutate()}
            disabled={!dirty || !title.trim() || saveMutation.isPending}
          >
            <Save className="h-3.5 w-3.5" /> {saveMutation.isPending ? 'Saving...' : 'Save lesson'}
          </Button>
        </div>
      </div>

      {/* Details */}
      <Section icon={FileText} title="Lesson details">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 font-mono text-xs">
          <div className="sm:col-span-4 space-y-1">
            <label className={labelClass}>Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-1 space-y-1">
            <label className={labelClass}>Minutes</label>
            <Input type="number" min={1} value={minutes} onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))} className={inputClass} />
          </div>
          <div className="sm:col-span-1 space-y-1">
            <label className={labelClass}>Visibility</label>
            <button
              type="button"
              onClick={() => setPublished((p) => !p)}
              className={`h-9 w-full rounded-md border px-2 flex items-center justify-center gap-1.5 text-xs transition-colors ${
                published ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-border text-muted-foreground bg-surface'
              }`}
              title={published ? 'Visible to students when the course is published' : 'Hidden from students'}
            >
              {published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {published ? 'Visible' : 'Hidden'}
            </button>
          </div>
          <div className="sm:col-span-6 space-y-1">
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn in this lesson?"
              className={textareaClass}
            />
          </div>
        </div>
      </Section>

      <Section icon={Video} title="Lesson video" hint="YouTube link or uploaded file">
        <LessonVideoEditor lesson={lesson} courseId={courseId} notify={notify} />
      </Section>

      <Section icon={Paperclip} title="Learning materials" hint="Downloadable files for students">
        <LessonMaterialsEditor lessonId={lessonId} courseId={courseId} resources={lesson.resources ?? []} notify={notify} />
      </Section>

      <Section icon={Layers} title="Additional content" hint="Notes, code, references, concept checks">
        <ContentBlocksEditor lessonId={lessonId} notify={notify} />
      </Section>
    </div>
  );
};
