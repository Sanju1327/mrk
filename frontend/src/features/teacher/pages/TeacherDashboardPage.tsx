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
  Eye,
  Edit3,
  Archive,
} from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import type { CourseSummary } from '@/types/course';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateCourseModal } from '@/features/teacher/components/CreateCourseModal';
import { CourseStatusBadge } from '@/features/teacher/components/CourseStatusBadge';
import { resolveMediaUrl } from '@/lib/media';

export const TeacherDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const toast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };
  const fail = (err: any, fallback: string) => {
    setError(err.response?.data?.message || fallback);
    setTimeout(() => setError(null), 6000);
  };

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: teacherApi.getDashboard,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: teacherApi.getMyCourses,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
    queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
  };

  const publishMutation = useMutation({
    mutationFn: teacherApi.publishCourse,
    onSuccess: () => {
      refresh();
      toast('Course published to the live catalog');
    },
    onError: (err: any) => fail(err, 'Failed to publish course'),
  });

  const unpublishMutation = useMutation({
    mutationFn: teacherApi.unpublishCourse,
    onSuccess: () => {
      refresh();
      toast('Course reverted to draft');
    },
    onError: (err: any) => fail(err, 'Failed to unpublish course'),
  });

  const archiveMutation = useMutation({
    mutationFn: teacherApi.archiveCourse,
    onSuccess: () => {
      refresh();
      toast('Course archived');
    },
    onError: (err: any) => fail(err, 'Failed to archive course'),
  });

  const busy = publishMutation.isPending || unpublishMutation.isPending || archiveMutation.isPending;

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
            Create structured courses &bull; Chapters, lessons & videos &bull; Learning materials &bull; Chapter quizzes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
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

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
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
              Get started by creating your first course draft. Add chapters, lessons with videos and materials, build
              chapter quizzes, and publish when ready.
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
              const status = course.status || (course.published ? 'PUBLISHED' : 'DRAFT');
              const isPublished = status === 'PUBLISHED';
              return (
                <div
                  key={course.id}
                  className="rounded-xl border border-border bg-surface flex flex-col justify-between overflow-hidden hover:border-purple-500/40 transition-colors group"
                >
                  {course.thumbnailUrl && (
                    <div className="h-32 w-full overflow-hidden border-b border-border bg-surface-raised">
                      <img
                        src={resolveMediaUrl(course.thumbnailUrl)}
                        alt=""
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={course.level === 'BEGINNER' ? 'easy' : course.level === 'ADVANCED' ? 'hard' : 'medium'}>
                        {course.level}
                      </Badge>
                      <CourseStatusBadge status={status} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-purple-300 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{course.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground pt-2 border-t border-border/50">
                      <div>
                        <span className="text-foreground font-semibold">{course.topicCount}</span> chapters
                      </div>
                      <div>
                        <span className="text-foreground font-semibold">{course.lessonCount}</span> lessons
                      </div>
                      <div>{course.category || 'General'}</div>
                      {course.instructor && (
                        <div className="truncate">by {course.instructor.fullName}</div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-surface-raised border-t border-border/80 flex items-center gap-2">
                    <Link to={`/teacher/courses/${course.id}/builder`} className="flex-1 min-w-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-xs gap-1.5 font-medium border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Course Builder</span>
                      </Button>
                    </Link>

                    {isPublished ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2.5 text-xs font-mono text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                        onClick={() => unpublishMutation.mutate(course.id)}
                        disabled={busy}
                        title="Unpublish to draft"
                      >
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        onClick={() => publishMutation.mutate(course.id)}
                        disabled={busy}
                        title="Publish course to live catalog"
                      >
                        Publish
                      </Button>
                    )}

                    <Link to={`/courses/${course.slug}?preview=1`} target="_blank" title="Preview as student">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    {status !== 'ARCHIVED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-400"
                        title="Archive course"
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm(`Archive "${course.title}"? Students will no longer see it.`)) {
                            archiveMutation.mutate(course.id);
                          }
                        }}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateCourseModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
};
