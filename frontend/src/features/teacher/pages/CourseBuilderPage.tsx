import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  Layers,
  Rocket,
  Settings2,
  ShieldCheck,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import { useAuth } from '@/hooks/useAuth';
import type { CourseStatus } from '@/types/course';
import { Button } from '@/components/ui/button';
import { CourseStatusBadge } from '@/features/teacher/components/CourseStatusBadge';
import { CourseInfoForm } from '@/features/teacher/components/builder/CourseInfoForm';
import { CurriculumTree, type BuilderSelection } from '@/features/teacher/components/builder/CurriculumTree';
import { ChapterEditor } from '@/features/teacher/components/builder/ChapterEditor';
import { LessonEditor } from '@/features/teacher/components/builder/LessonEditor';
import type { Notify } from '@/features/teacher/components/builder/types';

type BuilderTab = 'info' | 'content' | 'settings';

const TABS: { id: BuilderTab; label: string; icon: React.ElementType }[] = [
  { id: 'info', label: 'Basic Information', icon: BookOpen },
  { id: 'content', label: 'Course Content', icon: Layers },
  { id: 'settings', label: 'Settings & Publishing', icon: Settings2 },
];

export const CourseBuilderPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();
  const cId = Number(courseId);

  const [tab, setTab] = useState<BuilderTab>('content');
  const [selection, setSelection] = useState<BuilderSelection>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [publishErrors, setPublishErrors] = useState<string[] | null>(null);

  const notify: Notify = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const { data: course, isLoading, isError, error } = useQuery({
    queryKey: ['teacher-course-detail', cId],
    queryFn: () => teacherApi.getCourseDetail(cId),
    enabled: !Number.isNaN(cId),
  });

  // Keep the selection valid after deletions/reloads; default to the first lesson or chapter.
  useEffect(() => {
    if (!course) return;
    const topics = course.topics;
    if (selection) {
      const topic = topics.find((t) => t.id === selection.topicId);
      if (topic && (selection.kind === 'chapter' || topic.lessons.some((l) => l.id === selection.lessonId))) return;
    }
    if (topics.length === 0) {
      setSelection(null);
    } else if (topics[0].lessons.length > 0) {
      setSelection({ kind: 'lesson', topicId: topics[0].id, lessonId: topics[0].lessons[0].id });
    } else {
      setSelection({ kind: 'chapter', topicId: topics[0].id });
    }
  }, [course, selection]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', cId] });
    queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
    queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
  };

  const publishMutation = useMutation({
    mutationFn: async () => {
      const check = await teacherApi.validatePublish(cId);
      if (!check.canPublish) {
        setPublishErrors(check.errors);
        throw new Error('validation');
      }
      return teacherApi.publishCourse(cId);
    },
    onSuccess: () => {
      setPublishErrors(null);
      invalidateAll();
      notify('success', 'Course published — students can now enrol');
    },
    onError: (err: any) => {
      if (err?.message === 'validation') {
        notify('error', 'Fix the issues below before publishing');
        setTab('settings');
      } else {
        notify('error', err.response?.data?.message || 'Failed to publish course');
      }
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => teacherApi.unpublishCourse(cId),
    onSuccess: () => {
      invalidateAll();
      notify('success', 'Course reverted to draft');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to unpublish course'),
  });

  const archiveMutation = useMutation({
    mutationFn: () => teacherApi.archiveCourse(cId),
    onSuccess: () => {
      invalidateAll();
      notify('success', 'Course archived');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to archive course'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => teacherApi.deleteCourse(cId),
    onSuccess: () => {
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      navigate('/admin');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to delete course'),
  });

  const validateMutation = useMutation({
    mutationFn: () => teacherApi.validatePublish(cId),
    onSuccess: (check) => {
      setPublishErrors(check.canPublish ? [] : check.errors);
      notify(check.canPublish ? 'success' : 'error', check.canPublish ? 'Course is ready to publish' : `${check.errors.length} issue(s) found`);
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Validation failed'),
  });

  const selectedTopic = useMemo(() => course?.topics.find((t) => t.id === selection?.topicId), [course, selection]);

  if (isLoading) {
    return <div className="container max-w-screen-2xl px-4 py-16 text-center font-mono text-xs text-muted-foreground">Loading course builder...</div>;
  }

  if (isError || !course) {
    const status = (error as any)?.response?.status;
    return (
      <div className="container max-w-screen-2xl px-4 py-16 text-center space-y-4 font-mono">
        <div className="text-destructive">
          {status === 403 ? 'You do not have permission to edit this course.' : 'Course not found.'}
        </div>
        <Link to="/admin">
          <Button size="sm" variant="outline">Return to studio</Button>
        </Link>
      </div>
    );
  }

  const status: CourseStatus = course.status || (course.published ? 'PUBLISHED' : 'DRAFT');
  const isPublished = status === 'PUBLISHED';
  const busy = publishMutation.isPending || unpublishMutation.isPending || archiveMutation.isPending;

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 py-6 space-y-5 font-sans">
      {/* Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Studio</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground tracking-tight truncate">{course.title}</h1>
              <CourseStatusBadge status={status} />
            </div>
            <div className="text-xs font-mono text-muted-foreground flex flex-wrap items-center gap-x-2 mt-0.5">
              <span>{course.category || 'General'}</span>
              <span>&bull;</span>
              <span>{course.level}</span>
              <span>&bull;</span>
              <span>{course.language || 'English'}</span>
              {course.instructor && (
                <>
                  <span>&bull;</span>
                  <span>by {course.instructor.fullName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Link to={`/courses/${course.slug}?preview=1`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              <span>Preview as student</span>
            </Button>
          </Link>
          {isPublished ? (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10" onClick={() => unpublishMutation.mutate()} disabled={busy}>
              <Undo2 className="h-3.5 w-3.5" /> Unpublish
            </Button>
          ) : (
            <Button size="sm" className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium" onClick={() => publishMutation.mutate()} disabled={busy}>
              <Rocket className="h-3.5 w-3.5" /> {publishMutation.isPending ? 'Publishing...' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      {toast && (
        <div
          className={`flex items-center gap-2 p-3 rounded-md text-xs font-mono border ${
            toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono border-b-2 -mb-px whitespace-nowrap transition-colors ${
              tab === id ? 'border-purple-500 text-purple-300' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' && <CourseInfoForm course={course} notify={notify} section="basic" />}

      {tab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <CurriculumTree course={course} selection={selection} onSelect={setSelection} notify={notify} />
          </div>
          <div className="lg:col-span-8 min-w-0">
            {selection?.kind === 'lesson' && selectedTopic ? (
              <LessonEditor
                key={selection.lessonId}
                lessonId={selection.lessonId}
                courseId={cId}
                chapterTitle={selectedTopic.title}
                notify={notify}
                onDeleted={() => setSelection({ kind: 'chapter', topicId: selectedTopic.id })}
              />
            ) : selection?.kind === 'chapter' && selectedTopic ? (
              <ChapterEditor
                key={selectedTopic.id}
                topic={selectedTopic}
                courseId={cId}
                index={course.topics.findIndex((t) => t.id === selectedTopic.id)}
                notify={notify}
                onDeleted={() => setSelection(null)}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center space-y-2">
                <Layers className="h-8 w-8 mx-auto text-purple-400" />
                <h3 className="text-base font-semibold text-foreground">Start building your curriculum</h3>
                <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto">
                  Add a chapter on the left, then add lessons with a video, learning materials and notes. Finish each chapter with a quiz.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-5">
          <CourseInfoForm course={course} notify={notify} section="settings" />

          <section className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-purple-400" /> Publishing
              </div>
              <CourseStatusBadge status={status} />
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              Publishing requires at least one chapter with a published lesson, and every chapter that requires a quiz pass must have an enabled quiz with questions.
              Students only see published courses.
            </p>
            {publishErrors && publishErrors.length > 0 && (
              <ul className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 space-y-1 text-xs font-mono text-destructive">
                {publishErrors.map((e, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="h-3.5 w-3.5 mt-0.5 shrink-0" /> <span>{e}</span>
                  </li>
                ))}
              </ul>
            )}
            {publishErrors && publishErrors.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> All publish checks passed.
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => validateMutation.mutate()} disabled={validateMutation.isPending}>
                {validateMutation.isPending ? 'Checking...' : 'Run publish checks'}
              </Button>
              {isPublished ? (
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10" onClick={() => unpublishMutation.mutate()} disabled={busy}>
                  <Undo2 className="h-3.5 w-3.5" /> Unpublish to draft
                </Button>
              ) : (
                <Button size="sm" className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => publishMutation.mutate()} disabled={busy}>
                  <Rocket className="h-3.5 w-3.5" /> Publish course
                </Button>
              )}
              {status !== 'ARCHIVED' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => {
                    if (window.confirm('Archive this course? It will be hidden from students but kept for enrolled learners\u2019 records.')) archiveMutation.mutate();
                  }}
                  disabled={busy}
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </Button>
              )}
            </div>
          </section>

          {isSuperAdmin && (
            <section className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-300">
                <Trash2 className="h-4 w-4" /> Danger zone
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                Permanently deletes the course, its chapters, lessons, uploaded videos, materials, quizzes and all student progress. Super Admin only.
              </p>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs gap-1.5"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  const typed = window.prompt(`Type the course title to confirm deletion:\n${course.title}`);
                  if (typed === course.title) deleteMutation.mutate();
                  else if (typed !== null) notify('error', 'Title did not match — course not deleted');
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> {deleteMutation.isPending ? 'Deleting...' : 'Delete course'}
              </Button>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
