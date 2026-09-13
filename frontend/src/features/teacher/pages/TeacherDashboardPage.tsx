import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookPlus,
  BookOpen,
  Clock,
  CheckCircle2,
  Users,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Edit3,
  X,
} from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import type { CourseSummary } from '@/types/course';
import type { CreateCoursePayload } from '@/types/teacher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const TeacherDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [courseForm, setCourseForm] = useState<CreateCoursePayload>({
    title: '',
    slug: '',
    description: '',
    category: 'Programming',
    level: 'BEGINNER',
    estimatedDuration: '6 weeks',
    iconUrl: 'code-2',
  });

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: teacherApi.getDashboard,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: teacherApi.getMyCourses,
  });

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: teacherApi.createCourse,
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      setShowCreateModal(false);
      setCourseForm({
        title: '',
        slug: '',
        description: '',
        category: 'Programming',
        level: 'BEGINNER',
        estimatedDuration: '6 weeks',
        iconUrl: 'code-2',
      });
      setSuccessToast(`Course "${newCourse.title}" created as DRAFT!`);
      setTimeout(() => setSuccessToast(null), 4000);
    },
    onError: (err: any) => {
      setCreateError(err.response?.data?.message || 'Failed to create course draft');
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: teacherApi.togglePublishCourse,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      setSuccessToast(
        `Course status updated to ${updated.status || (updated.published ? 'PUBLISHED' : 'DRAFT')}`
      );
      setTimeout(() => setSuccessToast(null), 3000);
    },
    onError: (err: any) => {
      setCreateError(err.response?.data?.message || 'Failed to publish course. Ensure it has at least 1 lesson with content.');
      setTimeout(() => setCreateError(null), 5000);
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setCourseForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug === '' || prev.slug === generatedSlug.slice(0, -1) ? generatedSlug : prev.slug,
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!courseForm.title || !courseForm.slug || !courseForm.description) {
      setCreateError('Title, Slug, and Description are required');
      return;
    }
    createCourseMutation.mutate(courseForm);
  };

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 py-10 space-y-8 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-purple-400">
            <GraduationCap className="h-4 w-4" />
            <span className="font-semibold uppercase tracking-wider">Teacher Studio & Course CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Curriculum Authoring & Instructional Design
          </h1>
          <p className="text-xs font-mono text-muted-foreground">
            Create structured courses &bull; Embed YouTube lessons with attribution &bull; Link official docs &bull; Build quizzes & coding challenges
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setCreateError(null);
              setShowCreateModal(true);
            }}
            className="h-9 gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm"
          >
            <BookPlus className="h-4 w-4" />
            <span>Create New Course</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successToast && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {createError && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{createError}</span>
        </div>
      )}

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
        <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>My Courses</span>
            <BookOpen className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {statsLoading ? '—' : stats?.myCoursesCount ?? courses.length}
          </div>
          <div className="text-[10px] text-muted-foreground">Total authored</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Published</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold text-emerald-400">
            {statsLoading ? '—' : stats?.publishedCount ?? 0}
          </div>
          <div className="text-[10px] text-muted-foreground">Live in catalog</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Drafts</span>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-semibold text-amber-400">
            {statsLoading ? '—' : stats?.draftsCount ?? 0}
          </div>
          <div className="text-[10px] text-muted-foreground">In progress</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Enrolled Students</span>
            <Users className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {statsLoading ? '—' : stats?.enrolledStudentsCount ?? 0}
          </div>
          <div className="text-[10px] text-muted-foreground">Across all courses</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avg Progress</span>
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {statsLoading ? '—' : `${(stats?.averageProgressPercentage ?? 0).toFixed(1)}%`}
          </div>
          <div className="text-[10px] text-muted-foreground">Student completion</div>
        </div>
      </div>

      {/* 3. Course Management Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground font-sans">
            Authoring Library ({courses.length} courses)
          </h2>
        </div>

        {coursesLoading ? (
          <div className="py-16 text-center text-xs font-mono text-muted-foreground">
            Loading courses from database...
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <BookPlus className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No courses created yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
              Get started by creating your first course draft. You can assemble modules, embed videos, add official doc links, and publish when ready.
            </p>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs mt-2"
            >
              Create First Course
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course: CourseSummary) => {
              const isPublished = course.status === 'PUBLISHED' || course.published;
              return (
                <div
                  key={course.id}
                  className="rounded-xl border border-border bg-surface flex flex-col justify-between overflow-hidden hover:border-purple-500/40 transition-colors group"
                >
                  <div className="p-5 space-y-3">
                    {/* Top badging */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={course.level === 'BEGINNER' ? 'easy' : 'medium'}>
                        {course.level}
                      </Badge>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        {isPublished ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>PUBLISHED</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
                            <Clock className="h-3 w-3" />
                            <span>DRAFT</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Course Title & Details */}
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-purple-300 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {course.description}
                      </p>
                    </div>

                    {/* Meta stats */}
                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground pt-2 border-t border-border/50">
                      <div>
                        <span className="text-foreground font-semibold">{course.topicCount}</span> modules
                      </div>
                      <div>
                        <span className="text-foreground font-semibold">{course.lessonCount}</span> lessons
                      </div>
                      <div>{course.category || 'General'}</div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 bg-surface-raised border-t border-border/80 flex items-center justify-between gap-2">
                    <Link to={`/teacher/courses/${course.id}/builder`} className="flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-xs gap-1.5 font-medium border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Curriculum Builder</span>
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 px-2.5 text-xs font-mono ${
                        isPublished
                          ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                          : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                      }`}
                      onClick={() => togglePublishMutation.mutate(course.id)}
                      disabled={togglePublishMutation.isPending}
                      title={isPublished ? 'Unpublish to draft' : 'Publish course to live catalog'}
                    >
                      {isPublished ? 'Unpublish' : 'Publish'}
                    </Button>

                    {isPublished && (
                      <Link to={`/courses/${course.slug}`} target="_blank">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="View live student page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE COURSE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
                  <BookPlus className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Create New Course Draft</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-muted-foreground">Course Title *</label>
                <Input
                  required
                  placeholder="e.g. Next.js 14 Production Mastery"
                  value={courseForm.title}
                  onChange={handleTitleChange}
                  className="bg-surface border-border text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground">URL Slug *</label>
                  <Input
                    required
                    placeholder="e.g. nextjs-production-mastery"
                    value={courseForm.slug}
                    onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                    className="bg-surface border-border text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Category *</label>
                  <Input
                    required
                    placeholder="e.g. Web Development"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="bg-surface border-border text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, level: e.target.value as any })
                    }
                    className="w-full h-9 rounded-md border border-border bg-surface px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Estimated Duration</label>
                  <Input
                    placeholder="e.g. 6 weeks"
                    value={courseForm.estimatedDuration}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, estimatedDuration: e.target.value })
                    }
                    className="bg-surface border-border text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground">Course Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed course overview, learning goals, and prerequisites..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createCourseMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {createCourseMutation.isPending ? 'Creating Draft...' : 'Create Course Draft'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
