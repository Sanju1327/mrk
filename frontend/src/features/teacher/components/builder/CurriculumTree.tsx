import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ClipboardCheck, EyeOff, FilePlus, FolderPlus, GraduationCap, Video, X } from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import type { CourseDetail, TopicDetail } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Notify } from './types';
import { inputClass, labelClass } from './types';

export type BuilderSelection = { kind: 'chapter'; topicId: number } | { kind: 'lesson'; topicId: number; lessonId: number } | null;

interface CurriculumTreeProps {
  course: CourseDetail;
  selection: BuilderSelection;
  onSelect: (sel: BuilderSelection) => void;
  notify: Notify;
}

export const CurriculumTree: React.FC<CurriculumTreeProps> = ({ course, selection, onSelect, notify }) => {
  const queryClient = useQueryClient();
  const [addingChapter, setAddingChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [addingLessonFor, setAddingLessonFor] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonMinutes, setLessonMinutes] = useState(15);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', course.id] });
  const onError = (fallback: string) => (err: any) => notify('error', err.response?.data?.message || fallback);

  const createChapter = useMutation({
    mutationFn: () => teacherApi.createTopic(course.id, { title: chapterTitle.trim() }),
    onSuccess: (topic) => {
      invalidate();
      setAddingChapter(false);
      setChapterTitle('');
      onSelect({ kind: 'chapter', topicId: topic.id });
      notify('success', `Chapter "${topic.title}" added`);
    },
    onError: onError('Failed to add chapter'),
  });

  const createLesson = useMutation({
    mutationFn: (topicId: number) => teacherApi.createLesson(topicId, { title: lessonTitle.trim(), estimatedMinutes: lessonMinutes }),
    onSuccess: (lesson, topicId) => {
      invalidate();
      setAddingLessonFor(null);
      setLessonTitle('');
      onSelect({ kind: 'lesson', topicId, lessonId: lesson.id });
      notify('success', `Lesson "${lesson.title}" created`);
    },
    onError: onError('Failed to create lesson'),
  });

  const reorderChapters = useMutation({
    mutationFn: (ids: number[]) => teacherApi.reorderTopics(course.id, ids),
    onSuccess: () => invalidate(),
    onError: onError('Failed to reorder chapters'),
  });

  const reorderLessons = useMutation({
    mutationFn: ({ topicId, ids }: { topicId: number; ids: number[] }) => teacherApi.reorderLessons(topicId, ids),
    onSuccess: () => invalidate(),
    onError: onError('Failed to reorder lessons'),
  });

  const moveChapter = (index: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= course.topics.length) return;
    const ids = course.topics.map((t) => t.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderChapters.mutate(ids);
  };

  const moveLesson = (topic: TopicDetail, index: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= topic.lessons.length) return;
    const ids = topic.lessons.map((l) => l.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderLessons.mutate({ topicId: topic.id, ids });
  };

  const busy = reorderChapters.isPending || reorderLessons.isPending;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="font-semibold text-sm text-foreground flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-purple-400" />
          <span>Course content</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAddingChapter(true)} className="h-7 px-2 text-xs gap-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
          <FolderPlus className="h-3 w-3" />
          <span>Add chapter</span>
        </Button>
      </div>

      {addingChapter && (
        <form
          className="rounded-lg border border-purple-500/40 bg-purple-950/10 p-3 space-y-2 font-mono text-xs"
          onSubmit={(e) => {
            e.preventDefault();
            if (chapterTitle.trim()) createChapter.mutate();
          }}
        >
          <div className="flex items-center justify-between">
            <label className={labelClass}>New chapter title</label>
            <button type="button" onClick={() => setAddingChapter(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <Input autoFocus value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="e.g. Getting started" className={inputClass} />
          <div className="flex justify-end">
            <Button type="submit" size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white" disabled={!chapterTitle.trim() || createChapter.isPending}>
              {createChapter.isPending ? 'Adding...' : 'Add chapter'}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3 font-mono text-xs">
        {course.topics.length === 0 && !addingChapter ? (
          <div className="py-8 text-center text-muted-foreground space-y-2">
            <p>No chapters yet.</p>
            <p className="text-[11px]">Chapters group lessons and can end with a quiz.</p>
          </div>
        ) : (
          course.topics.map((topic, tIdx) => {
            const chapterSelected = selection?.kind === 'chapter' && selection.topicId === topic.id;
            const containsSelection = selection?.topicId === topic.id;
            return (
              <div key={topic.id} className={`rounded-lg border transition-colors ${containsSelection ? 'border-purple-500/50 bg-surface-raised' : 'border-border/60 bg-background/50'}`}>
                <div
                  onClick={() => onSelect({ kind: 'chapter', topicId: topic.id })}
                  className={`p-3 flex items-center justify-between cursor-pointer rounded-t-lg ${chapterSelected ? 'bg-purple-600/15' : 'hover:bg-surface-raised/80'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-purple-400 font-bold shrink-0">{tIdx + 1}</span>
                    <span className="font-sans font-medium text-foreground truncate">{topic.title}</span>
                    {topic.quiz && (
                      <span title={topic.quiz.enabled ? `Quiz · ${topic.quiz.questionCount} questions` : 'Quiz disabled'} className={topic.quiz.enabled ? 'text-amber-400' : 'text-muted-foreground'}>
                        <ClipboardCheck className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-surface rounded mr-1">{topic.lessons.length}</span>
                    <button onClick={() => moveChapter(tIdx, 'up')} disabled={busy || tIdx === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Move chapter up">
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button onClick={() => moveChapter(tIdx, 'down')} disabled={busy || tIdx === course.topics.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Move chapter down">
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="px-3 pb-3 space-y-1.5">
                  {topic.lessons.map((lesson, lIdx) => {
                    const lessonSelected = selection?.kind === 'lesson' && selection.lessonId === lesson.id;
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => onSelect({ kind: 'lesson', topicId: topic.id, lessonId: lesson.id })}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                          lessonSelected ? 'bg-purple-600 text-white font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] opacity-70 shrink-0">{tIdx + 1}.{lIdx + 1}</span>
                          <span className="truncate">{lesson.title}</span>
                          {lesson.hasVideo && <Video className={`h-3 w-3 shrink-0 ${lessonSelected ? 'text-white/80' : 'text-rose-400'}`} />}
                          {lesson.published === false && <EyeOff className="h-3 w-3 shrink-0 opacity-70" />}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] shrink-0" onClick={(e) => e.stopPropagation()}>
                          <span className="mr-1">{lesson.estimatedMinutes}m</span>
                          <button onClick={() => moveLesson(topic, lIdx, 'up')} disabled={busy || lIdx === 0} className={`p-0.5 disabled:opacity-30 ${lessonSelected ? 'hover:text-white' : 'hover:text-foreground'}`} title="Move up">
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button onClick={() => moveLesson(topic, lIdx, 'down')} disabled={busy || lIdx === topic.lessons.length - 1} className={`p-0.5 disabled:opacity-30 ${lessonSelected ? 'hover:text-white' : 'hover:text-foreground'}`} title="Move down">
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {addingLessonFor === topic.id ? (
                    <form
                      className="rounded-md border border-purple-500/40 bg-purple-950/10 p-2.5 space-y-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (lessonTitle.trim()) createLesson.mutate(topic.id);
                      }}
                    >
                      <Input autoFocus value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Lesson title" className={inputClass} />
                      <div className="flex items-center gap-2">
                        <Input type="number" min={1} value={lessonMinutes} onChange={(e) => setLessonMinutes(Math.max(1, Number(e.target.value) || 1))} className={`${inputClass} w-20`} title="Estimated minutes" />
                        <span className="text-muted-foreground">min</span>
                        <div className="flex-1" />
                        <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingLessonFor(null)}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white" disabled={!lessonTitle.trim() || createLesson.isPending}>
                          {createLesson.isPending ? 'Creating...' : 'Add'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAddingLessonFor(topic.id);
                        setLessonTitle('');
                      }}
                      className="w-full h-7 text-[11px] justify-start text-muted-foreground hover:text-foreground gap-1 border border-dashed border-border/60 hover:border-purple-500/40"
                    >
                      <FilePlus className="h-3 w-3" />
                      <span>Add lesson</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
