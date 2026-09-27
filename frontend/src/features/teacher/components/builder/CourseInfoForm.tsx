import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Save, Settings2 } from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import { adminApi } from '@/lib/admin-api';
import { useAuth } from '@/hooks/useAuth';
import type { CourseDetail, CourseLevel } from '@/types/course';
import type { UpdateCoursePayload } from '@/types/teacher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbnailField } from '../ThumbnailField';
import type { Notify } from './types';
import { inputClass, labelClass, selectClass, textareaClass } from './types';

interface CourseInfoFormProps {
  course: CourseDetail;
  notify: Notify;
  /** Which part of the form to show: basic info or course settings. */
  section: 'basic' | 'settings';
}

const LEVELS: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Spanish', 'French', 'German', 'Other'];

interface FormState {
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  estimatedDuration: string;
  language: string;
  thumbnailUrl: string;
  teacherId: number | undefined;
}

const fromCourse = (c: CourseDetail): FormState => ({
  title: c.title,
  description: c.description,
  category: c.category || '',
  level: c.level,
  estimatedDuration: c.estimatedDuration || '',
  language: c.language || 'English',
  thumbnailUrl: c.thumbnailUrl || '',
  teacherId: c.instructor?.id,
});

/** Basic information + settings for a course. Saves via "Save Draft" (status is untouched). */
export const CourseInfoForm: React.FC<CourseInfoFormProps> = ({ course, notify, section }) => {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();
  const [form, setForm] = useState<FormState>(fromCourse(course));
  const [thumbError, setThumbError] = useState<string | null>(null);

  useEffect(() => setForm(fromCourse(course)), [course]);

  const { data: teachers = [] } = useQuery({
    queryKey: ['admin-teachers'],
    queryFn: adminApi.getTeachers,
    enabled: isSuperAdmin && section === 'settings',
  });

  const initial = fromCourse(course);
  const dirty = (Object.keys(form) as (keyof FormState)[]).some((k) => form[k] !== initial[k]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: UpdateCoursePayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim() || undefined,
        level: form.level,
        estimatedDuration: form.estimatedDuration.trim() || undefined,
        language: form.language,
        iconUrl: course.iconUrl ?? undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        teacherId: isSuperAdmin ? form.teacherId : undefined,
      };
      return teacherApi.updateCourse(course.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', course.id] });
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      notify('success', 'Draft saved');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to save course'),
  });

  const canSave = dirty && form.title.trim().length >= 3 && form.description.trim().length >= 10;

  const saveBar = (
    <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
      <span className="text-[11px] font-mono text-muted-foreground">
        {form.title.trim().length < 3
          ? 'Title must be at least 3 characters'
          : form.description.trim().length < 10
            ? 'Description must be at least 10 characters'
            : dirty
              ? 'Unsaved changes'
              : 'All changes saved'}
      </span>
      <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1" onClick={() => saveMutation.mutate()} disabled={!canSave || saveMutation.isPending}>
        <Save className="h-3.5 w-3.5" /> {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
      </Button>
    </div>
  );

  if (section === 'basic') {
    return (
      <section className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-3">
          <BookOpen className="h-4 w-4 text-purple-400" /> Basic information
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 font-mono text-xs">
          <div className="lg:col-span-2 space-y-3">
            <div className="space-y-1">
              <label className={labelClass}>Course title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="e.g. Java Fundamentals for Beginners" />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Description *</label>
              <textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={textareaClass} placeholder="What students will learn, who it's for, prerequisites..." />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Category</label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="e.g. Programming, Data Science, Web Development" />
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Thumbnail</label>
            <ThumbnailField value={form.thumbnailUrl} onChange={(url) => setForm({ ...form, thumbnailUrl: url })} onError={setThumbError} />
            {thumbError && <p className="text-[11px] text-rose-400">{thumbError}</p>}
          </div>
        </div>
        {saveBar}
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-3">
        <Settings2 className="h-4 w-4 text-purple-400" /> Course settings
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        <div className="space-y-1">
          <label className={labelClass}>Level</label>
          <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as CourseLevel })} className={selectClass}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Language</label>
          <select value={LANGUAGES.includes(form.language) ? form.language : 'Other'} onChange={(e) => setForm({ ...form, language: e.target.value })} className={selectClass}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Estimated duration</label>
          <Input value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} className={inputClass} placeholder="e.g. 6 weeks · 12 hours" />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Instructor</label>
          {isSuperAdmin ? (
            <select value={form.teacherId ?? ''} onChange={(e) => setForm({ ...form, teacherId: e.target.value ? Number(e.target.value) : undefined })} className={selectClass}>
              {course.instructor && !teachers.some((t) => t.id === course.instructor?.id) && (
                <option value={course.instructor.id}>{course.instructor.fullName}</option>
              )}
              {teachers.map((t) => (
                <option key={t.id} value={t.id} disabled={!t.active}>
                  {t.fullName}{!t.active ? ' (inactive)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="h-9 rounded-md border border-border bg-surface-raised px-3 flex items-center text-foreground truncate">{course.instructor?.fullName || 'You'}</div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] text-muted-foreground">
        <div className="rounded-md border border-border bg-surface-raised p-3">
          <div className="uppercase tracking-wider">Slug</div>
          <div className="text-foreground truncate mt-0.5">/courses/{course.slug}</div>
        </div>
        <div className="rounded-md border border-border bg-surface-raised p-3">
          <div className="uppercase tracking-wider">Status</div>
          <div className="text-foreground mt-0.5">{course.status || (course.published ? 'PUBLISHED' : 'DRAFT')}</div>
        </div>
        <div className="rounded-md border border-border bg-surface-raised p-3">
          <div className="uppercase tracking-wider">Structure</div>
          <div className="text-foreground mt-0.5">{course.topics.length} chapters · {course.totalLessons} lessons</div>
        </div>
      </div>
      {saveBar}
    </section>
  );
};
