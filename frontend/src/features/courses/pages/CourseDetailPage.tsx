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
  Sparkles,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';
import { courseApi } from '@/lib/course-api';
import { useAuth } from '@/hooks/useAuth';
import type { CourseLevel, TopicDetail, LessonSummary } from '@/types/course';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const levelBadgeColor: Record<CourseLevel, string> = {
  BEGINNER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  INTERMEDIATE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  ADVANCED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

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
      [topicId]: prev[topicId] === undefined ? false : !prev[topicId],
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
      <div className="container max-w-5xl px-4 py-16 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-10 w-2/3 bg-muted rounded" />
        <div className="h-20 w-full bg-muted rounded" />
        <div className="h-64 w-full bg-muted rounded" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Course Not Found</h2>
        <p className="text-muted-foreground">The requested course could not be loaded.</p>
        <Link to="/courses">
          <Button variant="outline">Back to Catalog</Button>
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
    <div className="container max-w-5xl px-4 py-10 space-y-8">
      {/* Back Link */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to all courses</span>
      </Link>

      {/* Course Hero Card */}
      <Card className="p-8 border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${levelBadgeColor[course.level]}`}
              >
                {course.level}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>~{course.estimatedHours} hours to complete</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {course.title}
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Action Box */}
          <div className="w-full md:w-64 shrink-0 rounded-xl border border-border/60 bg-background/50 p-5 space-y-4 text-center">
            {course.isEnrolled ? (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary font-bold">{course.progressPercentage}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {course.completedLessons} of {course.totalLessons} lessons completed
                  </p>
                </div>

                {targetLessonId && (
                  <Link to={`/lessons/${targetLessonId}`} className="block">
                    <Button className="w-full gap-2">
                      <Play className="h-4 w-4 fill-current" />
                      <span>Continue Learning</span>
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Free Lifetime Access</p>
                  <p className="text-2xl font-bold text-foreground">100% Free</p>
                </div>
                <Button
                  onClick={handleEnrollClick}
                  disabled={enrollMutation.isPending}
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Syllabus Tree */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Course Syllabus</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {course.topics.length} Topics • {course.totalLessons} Lessons
          </span>
        </div>

        <div className="space-y-3">
          {course.topics.map((topic: TopicDetail, index: number) => {
            const isExpanded = expandedTopics[topic.id] !== false; // default expanded
            const topicCompletedLessons = topic.lessons.filter((l) => l.completed).length;

            return (
              <Card key={topic.id} className="overflow-hidden border-border/50 bg-card/40">
                <button
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{topic.title}</h3>
                      {topic.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {topicCompletedLessons}/{topic.lessons.length} completed
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border/40 divide-y divide-border/30 bg-background/30">
                    {topic.lessons.map((lesson: LessonSummary) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/20 transition-colors text-sm"
                      >
                        <div className="flex items-center gap-3">
                          {lesson.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className={lesson.completed ? 'text-muted-foreground line-through' : 'font-medium'}>
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {lesson.estimatedMinutes} min
                          </span>
                          {course.isEnrolled ? (
                            <Link to={`/lessons/${lesson.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                                <span>{lesson.completed ? 'Review' : 'Start'}</span>
                                <Play className="h-3 w-3" />
                              </Button>
                            </Link>
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
