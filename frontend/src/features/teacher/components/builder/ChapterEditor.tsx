import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, FolderOpen, Save, Settings2, Trash2 } from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import type { TopicDetail } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChapterQuizEditor } from './ChapterQuizEditor';
import type { Notify } from './types';
import { inputClass, labelClass, textareaClass } from './types';

interface ChapterEditorProps {
  topic: TopicDetail;
  courseId: number;
  index: number;
  notify: Notify;
  onDeleted: () => void;
}

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; hint: string; disabled?: boolean }> = ({ checked, onChange, label, hint, disabled }) => (
  <label className={`flex items-start gap-3 rounded-lg border border-border p-3 ${disabled ? 'opacity-50' : 'cursor-pointer hover:border-purple-500/30'} transition-colors`}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 accent-purple-600" />
    <div>
      <div className="text-xs font-medium text-foreground">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>
    </div>
  </label>
);

export const ChapterEditor: React.FC<ChapterEditorProps> = ({ topic, courseId, index, notify, onDeleted }) => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description || '');
  const [requireAllLessons, setRequireAllLessons] = useState(topic.requireAllLessons);
  const [requireQuizPass, setRequireQuizPass] = useState(topic.requireQuizPass);
  const [allowRetakes, setAllowRetakes] = useState(topic.allowQuizRetakes);
  const [limitAttempts, setLimitAttempts] = useState(topic.maxQuizAttempts != null);
  const [maxAttempts, setMaxAttempts] = useState(topic.maxQuizAttempts ?? 3);

  useEffect(() => {
    setTitle(topic.title);
    setDescription(topic.description || '');
    setRequireAllLessons(topic.requireAllLessons);
    setRequireQuizPass(topic.requireQuizPass);
    setAllowRetakes(topic.allowQuizRetakes);
    setLimitAttempts(topic.maxQuizAttempts != null);
    setMaxAttempts(topic.maxQuizAttempts ?? 3);
  }, [topic]);

  const effectiveMax = allowRetakes && limitAttempts ? maxAttempts : null;
  const dirty =
    title !== topic.title ||
    description !== (topic.description || '') ||
    requireAllLessons !== topic.requireAllLessons ||
    requireQuizPass !== topic.requireQuizPass ||
    allowRetakes !== topic.allowQuizRetakes ||
    effectiveMax !== topic.maxQuizAttempts;

  const saveMutation = useMutation({
    mutationFn: () =>
      teacherApi.updateTopic(topic.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        requireAllLessons,
        requireQuizPass,
        allowQuizRetakes: allowRetakes,
        maxQuizAttempts: effectiveMax ?? undefined,
        clearMaxQuizAttempts: effectiveMax == null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', courseId] });
      notify('success', 'Chapter saved');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to save chapter'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => teacherApi.deleteTopic(topic.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', courseId] });
      notify('success', 'Chapter deleted');
      onDeleted();
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to delete chapter'),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-mono text-purple-400 font-semibold">Chapter {index + 1}</div>
          <h2 className="text-xl font-semibold text-foreground truncate">{topic.title}</h2>
          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
            {topic.lessons.length} lesson{topic.lessons.length === 1 ? '' : 's'}
            {topic.quiz ? ` · quiz: ${topic.quiz.questionCount} question${topic.quiz.questionCount === 1 ? '' : 's'}${topic.quiz.enabled ? '' : ' (disabled)'}` : ' · no quiz'}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-muted-foreground hover:text-rose-400 gap-1"
            onClick={() => {
              if (window.confirm(`Delete chapter "${topic.title}" with all its lessons, materials and quiz?`)) deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1" onClick={() => saveMutation.mutate()} disabled={!dirty || !title.trim() || saveMutation.isPending}>
            <Save className="h-3.5 w-3.5" /> {saveMutation.isPending ? 'Saving...' : 'Save chapter'}
          </Button>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-3">
          <FolderOpen className="h-4 w-4 text-purple-400" /> Chapter details
        </div>
        <div className="space-y-3 font-mono text-xs">
          <div className="space-y-1">
            <label className={labelClass}>Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={textareaClass} placeholder="What this chapter covers" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Settings2 className="h-4 w-4 text-purple-400" /> Completion settings
          </div>
          <span className="hidden sm:block text-[11px] font-mono text-muted-foreground">Controls when the next chapter unlocks</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Toggle checked={requireAllLessons} onChange={setRequireAllLessons} label="Require all lessons to be completed" hint="Students must mark every lesson complete before the chapter counts as done." />
          <Toggle
            checked={requireQuizPass}
            onChange={setRequireQuizPass}
            label="Require passing the chapter quiz"
            hint={topic.quiz ? `Pass mark ${topic.quiz.passingScorePercentage}% · the quiz unlocks after the lessons are complete.` : 'Create a quiz below before enabling this.'}
          />
          <Toggle checked={allowRetakes} onChange={setAllowRetakes} label="Allow quiz retakes" hint="When off, students get a single attempt." />
          <div className={`rounded-lg border border-border p-3 space-y-2 ${!allowRetakes ? 'opacity-50' : ''}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={limitAttempts} disabled={!allowRetakes} onChange={(e) => setLimitAttempts(e.target.checked)} className="accent-purple-600" />
              <span className="text-xs font-medium text-foreground">Limit number of attempts</span>
            </label>
            <div className="flex items-center gap-2 pl-6">
              <Input type="number" min={1} max={100} value={maxAttempts} disabled={!allowRetakes || !limitAttempts} onChange={(e) => setMaxAttempts(Math.max(1, Number(e.target.value) || 1))} className={`${inputClass} w-24`} />
              <span className="text-[11px] font-mono text-muted-foreground">{allowRetakes && limitAttempts ? `max ${maxAttempts} attempts` : 'unlimited'}</span>
            </div>
          </div>
        </div>
        {requireQuizPass && !topic.quiz && (
          <p className="text-[11px] font-mono text-amber-400">A quiz with at least one question is required before this course can be published with this setting on.</p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ClipboardCheck className="h-4 w-4 text-purple-400" /> Chapter quiz
          </div>
          <span className="hidden sm:block text-[11px] font-mono text-muted-foreground">Multiple choice · one correct answer per question</span>
        </div>
        <ChapterQuizEditor topicId={topic.id} courseId={courseId} notify={notify} />
      </section>
    </div>
  );
};
