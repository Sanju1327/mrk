import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, CheckCircle2, HelpCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import type { TeacherQuiz, TeacherQuizQuestion, UpsertQuestionPayload, UpsertQuizPayload } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Notify } from './types';
import { inputClass, labelClass, textareaClass } from './types';

interface ChapterQuizEditorProps {
  topicId: number;
  courseId: number;
  notify: Notify;
}

interface QuestionDraft {
  questionText: string;
  explanation: string;
  points: number;
  options: string[];
  correctIndex: number;
}

const emptyDraft = (): QuestionDraft => ({ questionText: '', explanation: '', points: 1, options: ['', '', '', ''], correctIndex: 0 });

const draftFromQuestion = (q: TeacherQuizQuestion): QuestionDraft => ({
  questionText: q.questionText,
  explanation: q.explanation || '',
  points: q.points,
  options: q.options.map((o) => o.optionText),
  correctIndex: Math.max(0, q.options.findIndex((o) => o.correct)),
});

export const ChapterQuizEditor: React.FC<ChapterQuizEditorProps> = ({ topicId, courseId, notify }) => {
  const queryClient = useQueryClient();
  const queryKey = ['teacher-chapter-quiz', topicId];

  const { data: quiz, isLoading } = useQuery({
    queryKey,
    queryFn: () => teacherApi.getChapterQuiz(topicId),
  });

  // Quiz settings form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passing, setPassing] = useState(70);
  const [timeLimit, setTimeLimit] = useState(0);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setDescription(quiz.description || '');
      setPassing(quiz.passingScorePercentage);
      setTimeLimit(quiz.timeLimitMinutes);
      setEnabled(quiz.enabled);
    } else {
      setTitle('Chapter quiz');
      setDescription('');
      setPassing(70);
      setTimeLimit(0);
      setEnabled(true);
    }
  }, [quiz]);

  const settingsDirty =
    !!quiz &&
    (title !== quiz.title ||
      description !== (quiz.description || '') ||
      passing !== quiz.passingScorePercentage ||
      timeLimit !== quiz.timeLimitMinutes ||
      enabled !== quiz.enabled);

  const onQuizUpdated = (updated: TeacherQuiz | null, message: string) => {
    queryClient.setQueryData(queryKey, updated);
    queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', courseId] });
    notify('success', message);
  };
  const onError = (fallback: string) => (err: any) => notify('error', err.response?.data?.message || fallback);

  const payload = (): UpsertQuizPayload => ({
    title: title.trim(),
    description: description.trim() || undefined,
    passingScorePercentage: passing,
    timeLimitMinutes: timeLimit,
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: () => teacherApi.createChapterQuiz(topicId, payload()),
    onSuccess: (q) => onQuizUpdated(q, 'Chapter quiz created — now add questions'),
    onError: onError('Failed to create quiz'),
  });
  const updateMutation = useMutation({
    mutationFn: () => teacherApi.updateQuiz(quiz!.id, payload()),
    onSuccess: (q) => onQuizUpdated(q, 'Quiz settings saved'),
    onError: onError('Failed to save quiz settings'),
  });
  const deleteMutation = useMutation({
    mutationFn: () => teacherApi.deleteQuiz(quiz!.id),
    onSuccess: () => onQuizUpdated(null, 'Quiz deleted'),
    onError: onError('Failed to delete quiz'),
  });

  // Questions
  const [editing, setEditing] = useState<{ id: number | null; draft: QuestionDraft } | null>(null);

  const toPayload = (d: QuestionDraft): UpsertQuestionPayload | string => {
    if (!d.questionText.trim()) return 'Question text is required';
    const kept = d.options.map((o, i) => ({ optionText: o.trim(), correct: i === d.correctIndex })).filter((o) => o.optionText.length > 0);
    if (kept.length < 2) return 'At least 2 options are required';
    if (!kept.some((o) => o.correct)) return 'Mark a non-empty option as the correct answer';
    return {
      questionText: d.questionText.trim(),
      questionType: 'SINGLE_CHOICE',
      points: Math.max(1, d.points || 1),
      explanation: d.explanation.trim() || undefined,
      options: kept,
    };
  };

  const saveQuestionMutation = useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: UpsertQuestionPayload }) =>
      id == null ? teacherApi.addQuestion(quiz!.id, body) : teacherApi.updateQuestion(id, body),
    onSuccess: (q, vars) => {
      setEditing(null);
      onQuizUpdated(q, vars.id == null ? 'Question added' : 'Question updated');
    },
    onError: onError('Failed to save question'),
  });
  const deleteQuestionMutation = useMutation({
    mutationFn: (id: number) => teacherApi.deleteQuestion(id),
    onSuccess: (q) => onQuizUpdated(q, 'Question deleted'),
    onError: onError('Failed to delete question'),
  });
  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => teacherApi.reorderQuestions(quiz!.id, ids),
    onSuccess: (q) => queryClient.setQueryData(queryKey, q),
    onError: onError('Failed to reorder questions'),
  });

  const moveQuestion = (index: number, dir: 'up' | 'down') => {
    if (!quiz) return;
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= quiz.questions.length) return;
    const ids = quiz.questions.map((q) => q.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderMutation.mutate(ids);
  };

  const submitQuestion = () => {
    if (!editing) return;
    const body = toPayload(editing.draft);
    if (typeof body === 'string') return notify('error', body);
    saveQuestionMutation.mutate({ id: editing.id, body });
  };

  if (isLoading) {
    return <div className="py-6 text-center font-mono text-xs text-muted-foreground">Loading quiz...</div>;
  }

  const settingsForm = (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 font-mono text-xs">
      <div className="sm:col-span-3 space-y-1">
        <label className={labelClass}>Quiz title *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>
      <div className="sm:col-span-1 space-y-1">
        <label className={labelClass}>Pass mark %</label>
        <Input type="number" min={1} max={100} value={passing} onChange={(e) => setPassing(Math.min(100, Math.max(1, Number(e.target.value) || 1)))} className={inputClass} />
      </div>
      <div className="sm:col-span-1 space-y-1">
        <label className={labelClass}>Time limit (min)</label>
        <Input type="number" min={0} value={timeLimit} onChange={(e) => setTimeLimit(Math.max(0, Number(e.target.value) || 0))} className={inputClass} title="0 = no limit" />
      </div>
      <div className="sm:col-span-1 space-y-1">
        <label className={labelClass}>Status</label>
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          className={`h-9 w-full rounded-md border px-2 text-xs transition-colors ${
            enabled ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-border text-muted-foreground bg-surface'
          }`}
        >
          {enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>
      <div className="sm:col-span-6 space-y-1">
        <label className={labelClass}>Instructions</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional instructions shown before the quiz" className={inputClass} />
      </div>
    </div>
  );

  if (!quiz) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-border p-4 text-center font-mono text-xs text-muted-foreground">
          This chapter has no quiz. Create one to assess students at the end of the chapter.
        </div>
        {settingsForm}
        <div className="flex justify-end">
          <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1" onClick={() => createMutation.mutate()} disabled={!title.trim() || createMutation.isPending}>
            <Plus className="h-3.5 w-3.5" /> {createMutation.isPending ? 'Creating...' : 'Create chapter quiz'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {settingsForm}
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <span className="text-muted-foreground">
          {quiz.totalQuestions} question{quiz.totalQuestions === 1 ? '' : 's'} · {quiz.totalPoints} point{quiz.totalPoints === 1 ? '' : 's'}
          {!quiz.enabled && <span className="text-amber-400"> · disabled (hidden from students)</span>}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-muted-foreground hover:text-rose-400 gap-1"
            onClick={() => {
              if (window.confirm('Delete this quiz and all of its questions and attempts?')) deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete quiz
          </Button>
          <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white" onClick={() => updateMutation.mutate()} disabled={!settingsDirty || !title.trim() || updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save quiz settings'}
          </Button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Questions</div>
          {!editing && (
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10" onClick={() => setEditing({ id: null, draft: emptyDraft() })}>
              <Plus className="h-3.5 w-3.5" /> Add question
            </Button>
          )}
        </div>

        {editing && (
          <div className="rounded-xl border border-purple-500/40 bg-purple-950/10 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <span className="font-semibold text-purple-300">{editing.id == null ? 'New question' : 'Edit question'} · multiple choice</span>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Question *</label>
              <textarea
                rows={2}
                value={editing.draft.questionText}
                onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, questionText: e.target.value } })}
                className={textareaClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Options — select the correct answer</label>
              {editing.draft.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`quiz-correct-${topicId}`}
                    checked={editing.draft.correctIndex === idx}
                    onChange={() => setEditing({ ...editing, draft: { ...editing.draft, correctIndex: idx } })}
                    className="accent-purple-600"
                  />
                  <Input
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const options = [...editing.draft.options];
                      options[idx] = e.target.value;
                      setEditing({ ...editing, draft: { ...editing.draft, options } });
                    }}
                    className={inputClass}
                  />
                  {editing.draft.options.length > 2 && (
                    <button
                      className="p-1 text-muted-foreground hover:text-destructive"
                      title="Remove option"
                      onClick={() => {
                        const options = editing.draft.options.filter((_, i) => i !== idx);
                        let correctIndex = editing.draft.correctIndex;
                        if (correctIndex === idx) correctIndex = 0;
                        else if (correctIndex > idx) correctIndex -= 1;
                        setEditing({ ...editing, draft: { ...editing.draft, options, correctIndex } });
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {editing.draft.options.length < 8 && (
                <button className="text-purple-300 hover:text-purple-200 text-[11px]" onClick={() => setEditing({ ...editing, draft: { ...editing.draft, options: [...editing.draft.options, ''] } })}>
                  + Add option
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <div className="sm:col-span-5 space-y-1">
                <label className={labelClass}>Explanation (shown after submission)</label>
                <Input value={editing.draft.explanation} onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, explanation: e.target.value } })} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Points</label>
                <Input type="number" min={1} value={editing.draft.points} onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, points: Math.max(1, Number(e.target.value) || 1) } })} className={inputClass} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white" onClick={submitQuestion} disabled={saveQuestionMutation.isPending}>
                {saveQuestionMutation.isPending ? 'Saving...' : editing.id == null ? 'Add question' : 'Save question'}
              </Button>
            </div>
          </div>
        )}

        {quiz.questions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-5 text-center font-mono text-xs text-muted-foreground">
            No questions yet. A quiz needs at least one question before the course can be published.
          </div>
        ) : (
          <ol className="space-y-2">
            {quiz.questions.map((q, idx) => (
              <li key={q.id} className="rounded-lg border border-border bg-surface p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 font-mono text-xs">
                    <span className="text-purple-400 font-bold shrink-0">Q{idx + 1}</span>
                    <div className="min-w-0">
                      <div className="font-sans text-sm text-foreground">{q.questionText}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {q.points} pt{q.points === 1 ? '' : 's'}
                        {q.explanation ? ` · explanation set` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => moveQuestion(idx, 'up')} disabled={idx === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => moveQuestion(idx, 'down')} disabled={idx === quiz.questions.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditing({ id: q.id, draft: draftFromQuestion(q) })} className="p-1 text-muted-foreground hover:text-foreground" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this question?')) deleteQuestionMutation.mutate(q.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-6">
                  {q.options.map((o) => (
                    <li
                      key={o.id}
                      className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs ${
                        o.correct ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'text-muted-foreground bg-surface-raised'
                      }`}
                    >
                      {o.correct ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <HelpCircle className="h-3 w-3 shrink-0 opacity-40" />}
                      <span className="truncate">{o.optionText}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};
