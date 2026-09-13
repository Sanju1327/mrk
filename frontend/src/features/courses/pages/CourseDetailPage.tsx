import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Layers,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { courseApi } from '@/lib/course-api';
import { useAuth } from '@/hooks/useAuth';
import type { TopicDetail, LessonSummary } from '@/types/course';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({});

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => courseApi.getCourseBySlug(slug!),
    enabled: !!slug,
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: number) => courseApi.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', slug] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    },
  });

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !(prev[topicId] ?? true),
    }));
  };

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${slug}` } } });
      return;
    }
    if (course && !course.isEnrolled) {
      await enrollMutation.mutateAsync(course.id);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-screen-2xl px-4 sm:px-6 py-12 space-y-6 animate-pulse">
        <div className="h-5 w-32 bg-border rounded" />
        <div className="h-10 w-2/3 bg-border rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-surface rounded-lg" />
          <div className="lg:col-span-4 h-64 bg-surface rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Course Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested curriculum does not exist or could not be loaded.</p>
        <Link to="/courses">
          <Button variant="outline" size="sm">Back to Course Catalog</Button>
        </Link>
      </div>
    );
  }

  // Find first lesson to start/resume
  let firstLessonId: number | null = null;
  let firstIncompleteLessonId: number | null = null;
  for (const topic of course.topics) {
    for (const lesson of topic.lessons) {
      if (!firstLessonId) firstLessonId = lesson.id;
      if (!lesson.completed && !firstIncompleteLessonId) {
        firstIncompleteLessonId = lesson.id;
      }
    }
  }
  const targetLessonId = firstIncompleteLessonId || firstLessonId;

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 py-10 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Courses</span>
        </Link>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Course Overview & Syllabus Tree (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Header */}
          <div className="space-y-4 border-b border-border pb-8">
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  course.level === 'BEGINNER'
                    ? 'easy'
                    : course.level === 'INTERMEDIATE'
                    ? 'medium'
                    : 'hard'
                }
              >
                {course.level}
              </Badge>
              <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>~{course.estimatedHours} hours self-paced</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-foreground" />
                <span>{course.topics.length} Modules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-foreground" />
                <span>{course.totalLessons} Lessons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Hands-on Code Verifications</span>
              </div>
            </div>
          </div>

          {/* Syllabus Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Curriculum Syllabus</h2>
              <span className="font-mono text-xs text-muted-foreground">
                {course.topics.length} modules &bull; {course.totalLessons} lessons
              </span>
            </div>

            <div className="space-y-3">
              {course.topics.map((topic: TopicDetail, index: number) => {
                const isExpanded = expandedTopics[topic.id] !== false;
                const topicCompletedCount = topic.lessons.filter((l) => l.completed).length;

                return (
                  <div
                    key={topic.id}
                    className="rounded-lg border border-border bg-surface overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-surface-raised transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-background font-mono text-xs font-semibold text-muted-foreground">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-medium text-sm text-foreground">{topic.title}</h3>
                          {topic.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {topic.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                        <span className="hidden sm:inline">
                          {topicCompletedCount}/{topic.lessons.length} done
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border/80 divide-y divide-border/60 bg-background/50">
                        {topic.lessons.map((lesson: LessonSummary) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between px-5 sm:px-6 py-3 hover:bg-surface transition-colors text-xs"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.completed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <div className="h-2 w-2 rounded-full border border-border shrink-0 ml-0.5" />
                              )}
                              <span className={lesson.completed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}>
                                {lesson.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 font-mono text-muted-foreground">
                              <span>{lesson.estimatedMinutes}m</span>
                              {course.isEnrolled ? (
                                <Link to={`/lessons/${lesson.id}`}>
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-foreground hover:bg-surface-raised">
                                    <span>{lesson.completed ? 'Review' : 'Start'}</span>
                                    <Play className="h-2.5 w-2.5 fill-current" />
                                  </Button>
                                </Link>
                              ) : (
                                <Lock className="h-3 w-3 text-muted-foreground/40" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Enrollment & Progress Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-20 space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6 space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Curriculum Access
              </span>
              <div className="text-xl font-semibold text-foreground">
                {course.isEnrolled ? 'Enrolled Track' : 'Open Curriculum'}
              </div>
            </div>

            {course.isEnrolled ? (
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="text-foreground font-semibold">{course.progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">
                    {course.completedLessons} of {course.totalLessons} lessons completed
                  </div>
                </div>

                {targetLessonId && (
                  <Link to={`/lessons/${targetLessonId}`} className="block">
                    <Button className="w-full h-10 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{course.progressPercentage > 0 ? 'Resume Learning' : 'Start Curriculum'}</span>
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enroll to track your progress, complete interactive lessons, and verify your code solutions in real-time.
                </p>
                <Button
                  onClick={handleEnrollClick}
                  disabled={enrollMutation.isPending}
                  className="w-full h-10 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{enrollMutation.isPending ? 'Enrolling...' : 'Enroll in Track'}</span>
                </Button>
              </div>
            )}

            {/* Quick Curriculum Specs */}
            <div className="border-t border-border pt-4 space-y-2.5 font-mono text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="text-foreground font-sans">{course.category || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Pace:</span>
                <span className="text-foreground font-sans">{course.estimatedDuration || `${course.estimatedHours}h self-paced`}</span>
              </div>
              <div className="flex justify-between">
                <span>Assessments:</span>
                <span className="text-foreground font-sans">Interactive Quizzes & Challenges</span>
              </div>
            </div>
          </div>

          {/* Instructor Attribution Card */}
          <div className="rounded-lg border border-border bg-surface p-6 space-y-3 font-sans">
            <div className="flex items-center gap-2 font-mono text-xs text-purple-400">
              <GraduationCap className="h-4 w-4" />
              <span className="uppercase tracking-wider font-semibold">Course Instructor</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm">
                {(course.instructor?.fullName || 'CodeCraft').charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">
                  {course.instructor?.fullName || 'CodeCraft Faculty'}
                </h4>
                <p className="text-[11px] text-muted-foreground font-mono">Curriculum Lead</p>
              </div>
            </div>
            {course.instructor?.bio && (
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                {course.instructor.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
