import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { courseApi } from '@/lib/course-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const LessonViewPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numericLessonId = Number(lessonId);

  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ['lesson', numericLessonId],
    queryFn: () => courseApi.getLessonById(numericLessonId),
    enabled: !isNaN(numericLessonId),
  });

  const completeMutation = useMutation({
    mutationFn: () => courseApi.completeLesson(numericLessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', numericLessonId] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl px-4 py-16 space-y-6 animate-pulse">
        <div className="h-6 w-40 bg-muted rounded" />
        <div className="h-10 w-3/4 bg-muted rounded" />
        <div className="h-64 w-full bg-muted rounded" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="container max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Lesson Not Found</h2>
        <p className="text-muted-foreground">This lesson could not be loaded.</p>
        <Link to="/courses">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-10 space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <Link
            to={`/courses/${lesson.courseSlug}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{lesson.courseTitle} &gt; {lesson.topicTitle}</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {lesson.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{lesson.estimatedMinutes} min read</span>
          </div>

          {lesson.completed ? (
            <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3" />
              <span>Completed</span>
            </Badge>
          ) : (
            <Button
              size="sm"
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{completeMutation.isPending ? 'Marking...' : 'Mark as Complete'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Lesson Content Body */}
      <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm">
        <article className="prose prose-invert prose-blue max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-code:text-amber-300 prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-border/60">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {lesson.contentMarkdown}
          </ReactMarkdown>
        </article>
      </Card>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4">
        {lesson.prevLessonId ? (
          <Button
            variant="outline"
            onClick={() => navigate(`/lessons/${lesson.prevLessonId}`)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Lesson</span>
          </Button>
        ) : (
          <div />
        )}

        {lesson.nextLessonId ? (
          <Button
            onClick={() => navigate(`/lessons/${lesson.nextLessonId}`)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <span>Next Lesson</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Link to={`/courses/${lesson.courseSlug}`}>
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Back to Syllabus</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
