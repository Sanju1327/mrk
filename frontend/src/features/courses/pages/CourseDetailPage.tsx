import React, { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  ClipboardCheck,
  Eye,
  Globe,
  Video,
} from 'lucide-react';
import { courseApi } from '@/lib/course-api';
import { useAuth } from '@/hooks/useAuth';
import type { TopicDetail, LessonSummary } from '@/types/course';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveMediaUrl } from '@/lib/media';

const ChapterStatusPill: React.FC<{ topic: TopicDetail }> = ({ topic }) => {
  const p = topic.progress;
  if (!p) return null;
  if (p.locked) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-border bg-surface-raised px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
        <Lock className="h-2.5 w-2.5" /> Locked
      </span>
    );
  }
  if (p.status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400">
        <CheckCircle2 className="h-2.5 w-2.5" /> Completed
      </span>
    );
  }
  if (p.status === 'IN_PROGRESS') {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-400">
        In progress
      </span>
    );
  }
  return null;
};

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isTeacher } = useAuth();
  const isPreview = searchParams.get('preview') === '1' && isTeacher;
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

  // Find first lesson to start/resume (skipping locked chapters)
  let firstLessonId: number | null = null;
  let firstIncompleteLessonId: number | null = null;
  for (const topic of course.topics) {
    if (topic.progress?.locked) continue;
    for (const lesson of topic.lessons) {
      if (!firstLessonId) firstLessonId = lesson.id;
      if (!lesson.completed && !firstIncompleteLessonId) {
        firstIncompleteLessonId = lesson.id;
      }
    }
  }
  const targetLessonId = firstIncompleteLessonId || firstLessonId;
  const canAccessLessons = course.isEnrolled || isPreview;
  const courseStatus = course.status || (course.published ? 'PUBLISHED' : 'DRAFT');

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 py-10 space-y-8">
      {/* Back Link */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Courses</span>
        </Link>
        {isPreview && (
          <Link to={`/teacher/courses/${course.id}/builder`} className="text-xs font-mono text-purple-300 hover:text-purple-200">
            Back to builder
          </Link>
        )}
      </div>

      {isPreview && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-mono text-purple-300">
          <Eye className="h-3.5 w-3.5" />
          <span>
            Student preview · course is <span className="font-semibold">{courseStatus}</span>
            {courseStatus !== 'PUBLISHED' && ' — students cannot see it yet'}. Chapter locks are bypassed for you.
          </span>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Course Overview & Syllabus Tree (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Header */}
          <div className="space-y-4 border-b border-border pb-8">
            {course.thumbnailUrl && (
              <div className="aspect-[21/9] w-full overflow-hidden rounded-xl border border-border bg-surface">
                <img src={resolveMediaUrl(course.thumbnailUrl)} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
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
                <span>{course.estimatedDuration || `~${course.estimatedHours} hours self-paced`}</span>
              </div>
              {course.language && (
                <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  <span>{course.language}</span>
                </div>
              )}
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
                <span>{course.topics.length} Chapters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-foreground" />
                <span>{course.totalLessons} Lessons</span>
              </div>
              {course.topics.some((t) => t.quiz) && (
                <div className="flex items-center gap-1.5">
                  <ClipboardCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>{course.topics.filter((t) => t.quiz).length} Chapter Quizzes</span>
                </div>
              )}
            </div>
          </div>

          {/* Syllabus Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Course Content</h2>
              <span className="font-mono text-xs text-muted-foreground">
                {course.topics.length} chapters &bull; {course.totalLessons} lessons
              </span>
            </div>

            {course.topics.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-surface/50 p-10 text-center text-xs font-mono text-muted-foreground">
                No content has been published for this course yet.
              </div>
            )}

            <div className="space-y-3">
              {course.topics.map((topic: TopicDetail, index: number) => {
                const isExpanded = expandedTopics[topic.id] !== false;
                const topicCompletedCount = topic.lessons.filter((l) => l.completed).length;
                const locked = !!topic.progress?.locked && !isPreview;
                const quiz = topic.quiz && topic.quiz.enabled ? topic.quiz : null;

                return (
                  <div
                    key={topic.id}
                    className={`rounded-lg border border-border bg-surface overflow-hidden transition-colors ${locked ? 'opacity-75' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-surface-raised transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-background font-mono text-xs font-semibold text-muted-foreground">
                          {locked ? <Lock className="h-3 w-3" /> : index + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-sm text-foreground">{topic.title}</h3>
                            {canAccessLessons && <ChapterStatusPill topic={topic} />}
                          </div>
                          {topic.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {topic.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground shrink-0">
                        <span className="hidden sm:inline">
                          {topicCompletedCount}/{topic.lessons.length} lessons
                          {quiz ? ' · quiz' : ''}
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
                        {locked && (
                          <div className="px-5 sm:px-6 py-2.5 text-[11px] font-mono text-muted-foreground flex items-center gap-2">
                            <Lock className="h-3 w-3" />
                            Complete the previous chapter{topic.progress?.quizRequired ? ' and pass its quiz' : ''} to unlock.
                          </div>
                        )}
                        {topic.lessons.map((lesson: LessonSummary) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between px-5 sm:px-6 py-3 hover:bg-surface transition-colors text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {lesson.completed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <div className="h-2 w-2 rounded-full border border-border shrink-0 ml-0.5" />
                              )}
                              <span className={`truncate ${lesson.completed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                                {lesson.title}
                              </span>
                              {lesson.hasVideo && <Video className="h-3 w-3 text-rose-400 shrink-0" />}
                            </div>

                            <div className="flex items-center gap-3 font-mono text-muted-foreground shrink-0">
                              <span>{lesson.estimatedMinutes}m</span>
                              {canAccessLessons && !locked ? (
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

                        {quiz && (
                          <div className="flex items-center justify-between px-5 sm:px-6 py-3 bg-amber-500/5 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              {topic.progress?.quizPassed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <ClipboardCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <span className="text-foreground font-medium truncate">{quiz.title}</span>
                                <span className="text-muted-foreground font-mono">
                                  {' '}· {quiz.questionCount} questions · pass {quiz.passingScorePercentage}%
                                  {topic.requireQuizPass ? ' · required' : ''}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 font-mono text-muted-foreground shrink-0">
                              {topic.progress?.quizBestPercentage != null && (
                                <span className={topic.progress.quizPassed ? 'text-emerald-400' : ''}>best {Math.round(topic.progress.quizBestPercentage)}%</span>
                              )}
                              {canAccessLessons && !locked ? (
                                <Link to={`/quizzes/${quiz.id}`}>
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-amber-300 hover:bg-amber-500/10">
                                    <span>{topic.progress?.quizPassed ? 'Review quiz' : 'Take quiz'}</span>
                                    <ChevronRight className="h-3 w-3" />
                                  </Button>
                                </Link>
                              ) : (
                                <Lock className="h-3 w-3 text-muted-foreground/40" />
                              )}
                            </div>
                          </div>
                        )}
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

            {isPreview && !course.isEnrolled ? (
              <div className="space-y-4 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You are viewing this course as an author. Open any lesson to check how it renders for students.
                </p>
                {targetLessonId && (
                  <Link to={`/lessons/${targetLessonId}`} className="block">
                    <Button variant="outline" className="w-full h-10 text-xs font-semibold gap-2">
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview first lesson</span>
                    </Button>
                  </Link>
                )}
              </div>
            ) : course.isEnrolled ? (
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
                    {course.totalChapters != null && ` · ${course.completedChapters ?? 0}/${course.totalChapters} chapters`}
                  </div>
                  {course.progressStatus === 'COMPLETED' && (
                    <div className="inline-flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-mono text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Course completed
                    </div>
                  )}
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
                <span>Language:</span>
                <span className="text-foreground font-sans">{course.language || 'English'}</span>
              </div>
              <div className="flex justify-between">
                <span>Assessments:</span>
                <span className="text-foreground font-sans">
                  {course.topics.filter((t) => t.quiz?.enabled).length > 0
                    ? `${course.topics.filter((t) => t.quiz?.enabled).length} chapter quiz${course.topics.filter((t) => t.quiz?.enabled).length === 1 ? '' : 'zes'}`
                    : 'Lessons & concept checks'}
                </span>
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
