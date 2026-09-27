import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BookPlus, X } from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import { adminApi } from '@/lib/admin-api';
import { useAuth } from '@/hooks/useAuth';
import type { CreateCoursePayload } from '@/types/teacher';
import type { CourseDetail, CourseLevel } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbnailField } from './ThumbnailField';

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after creation; defaults to navigating to the course builder. */
  onCreated?: (course: CourseDetail) => void;
}

const LEVELS: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const emptyForm: CreateCoursePayload = {
  title: '',
  description: '',
  category: 'Programming',
  level: 'BEGINNER',
  estimatedDuration: '6 weeks',
  language: 'English',
  iconUrl: 'code-2',
  thumbnailUrl: '',
};

/**
 * Shared "Create Course" dialog used by the Teacher dashboard and the Super Admin console.
 * Super admins can assign the course to any active teacher; teachers are always the instructor.
 */
export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ open, onClose, onCreated }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSuperAdmin, user } = useAuth();
  const [form, setForm] = useState<CreateCoursePayload>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data: teachers = [] } = useQuery({
    queryKey: ['admin-teachers'],
    queryFn: adminApi.getTeachers,
    enabled: open && isSuperAdmin,
  });

  const createMutation = useMutation({
    mutationFn: teacherApi.createCourse,
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setForm(emptyForm);
      onClose();
      if (onCreated) onCreated(course);
      else navigate(`/teacher/courses/${course.id}/builder`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create course draft');
    },
  });

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      return;
    }
    createMutation.mutate({
      ...form,
      title: form.title.trim(),
      thumbnailUrl: form.thumbnailUrl || undefined,
      teacherId: isSuperAdmin ? form.teacherId : undefined,
    });
  };

  const close = () => {
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
              <BookPlus className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Create New Course</h3>
          </div>
          <button onClick={close} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground font-sans">
          The course is saved as a <span className="font-mono text-amber-400">DRAFT</span>. Only title and description are
          required now; add chapters, lessons, videos and quizzes in the builder, then publish.
        </p>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-muted-foreground">Course Title *</label>
            <Input
              required
              placeholder="e.g. Java Fundamentals"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-surface border-border text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-muted-foreground">Course Description *</label>
            <textarea
              required
              rows={3}
              placeholder="What will students learn? Prerequisites, goals, outcomes..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-muted-foreground">Category</label>
              <Input
                placeholder="e.g. Web Development"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="bg-surface border-border text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value as CourseLevel })}
                className="w-full h-9 rounded-md border border-border bg-surface px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l.charAt(0) + l.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground">Language</label>
              <Input
                placeholder="e.g. English"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="bg-surface border-border text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground">Estimated Duration</label>
              <Input
                placeholder="e.g. 6 weeks"
                value={form.estimatedDuration}
                onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                className="bg-surface border-border text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-muted-foreground">Instructor</label>
            {isSuperAdmin ? (
              <select
                value={form.teacherId ?? ''}
                onChange={(e) =>
                  setForm({ ...form, teacherId: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full h-9 rounded-md border border-border bg-surface px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Myself ({user?.fullName})</option>
                {teachers
                  .filter((t) => t.active)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} (@{t.username})
                    </option>
                  ))}
              </select>
            ) : (
              <div className="h-9 flex items-center rounded-md border border-border bg-surface/50 px-3 text-xs text-muted-foreground">
                {user?.fullName} (you)
              </div>
            )}
          </div>

          <ThumbnailField
            value={form.thumbnailUrl || ''}
            onChange={(url) => setForm({ ...form, thumbnailUrl: url })}
            onError={setError}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              {createMutation.isPending ? 'Creating Draft...' : 'Create Course & Open Builder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
