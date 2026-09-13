import React, { useState } from 'react';
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
  Check,
  Video,
  ExternalLink,
  Code,
  Copy,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { courseApi } from '@/lib/course-api';
import type { TopicDetail, LessonSummary, ContentBlock } from '@/types/course';
import { Button } from '@/components/ui/button';

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

  // Fetch parent course to provide contextual syllabus navigation
  const { data: course } = useQuery({
    queryKey: ['course', lesson?.courseSlug],
    queryFn: () => courseApi.getCourseBySlug(lesson!.courseSlug),
    enabled: !!lesson?.courseSlug,
  });

  const completeMutation = useMutation({
    mutationFn: () => courseApi.completeLesson(numericLessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', numericLessonId] });
      if (lesson?.courseSlug) {
        queryClient.invalidateQueries({ queryKey: ['course', lesson.courseSlug] });
      }
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    },
  });

  if (isLoading) {
    return (
      <div className="container max-w-screen-2xl px-4 sm:px-6 py-12 space-y-6 animate-pulse">
        <div className="h-5 w-40 bg-border rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="hidden lg:block lg:col-span-3 h-96 bg-surface rounded-lg" />
          <div className="lg:col-span-9 space-y-4">
            <div className="h-10 w-2/3 bg-border rounded" />
            <div className="h-4 w-1/3 bg-border rounded" />
            <div className="h-72 w-full bg-surface rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="container max-w-md mx-auto px-4 py-24 text-center space-y-4 font-sans">
        <h2 className="text-xl font-semibold text-foreground">Lesson Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested lesson material could not be loaded.</p>
        <Link to="/courses">
          <Button variant="outline" size="sm">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const hasBlocks = lesson.contentBlocks && lesson.contentBlocks.length > 0;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between font-sans">
      {/* 1. Sticky Sub-Header Navigation */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur px-4 sm:px-6 py-2.5">
        <div className="container max-w-screen-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Link
              to={`/courses/${lesson.courseSlug}`}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span className="hidden sm:inline">{lesson.courseTitle}</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
              {lesson.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{lesson.estimatedMinutes}m duration</span>
            </div>

            {lesson.completed ? (
              <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-medium text-emerald-400">
                <Check className="h-3 w-3" />
                <span>Completed</span>
              </span>
            ) : (
              <Button
                size="sm"
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
                className="h-7 px-3 text-xs font-medium gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{completeMutation.isPending ? 'Saving...' : 'Mark Complete'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Content Split: Sidebar Tree + Editorial Reading Document */}
      <div className="container max-w-screen-2xl px-4 sm:px-6 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Contextual Syllabus Outline (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-6">
            <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Curriculum Index
                </span>
                <Link
                  to={`/courses/${lesson.courseSlug}`}
                  className="text-[11px] font-mono text-muted-foreground hover:text-foreground"
                >
                  View All
                </Link>
              </div>

              {course?.topics && (
                <div className="space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 font-mono">
                  {course.topics.map((topic: TopicDetail, tIdx: number) => (
                    <div key={topic.id} className="space-y-1.5">
                      <div className="text-[11px] font-medium text-muted-foreground uppercase">
                        {tIdx + 1}. {topic.title}
                      </div>
                      <div className="space-y-0.5 pl-2 border-l border-border">
                        {topic.lessons.map((l: LessonSummary) => {
                          const isCurrent = l.id === numericLessonId;
                          return (
                            <Link
                              key={l.id}
                              to={`/lessons/${l.id}`}
                              className={`group flex items-center justify-between py-1 px-2 rounded text-xs transition-colors ${
                                isCurrent
                                  ? 'bg-surface-raised text-foreground font-medium border border-border/80'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-raised/50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {l.completed ? (
                                  <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                                ) : (
                                  <div
                                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                      isCurrent ? 'bg-foreground' : 'bg-border'
                                    }`}
                                  />
                                )}
                                <span className="truncate">{l.title}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Right Column: Content Blocks / Reading Pane (9 cols) */}
          <main className="lg:col-span-9 max-w-3xl space-y-8">
            {/* Header */}
            <div className="space-y-2 border-b border-border pb-6">
              <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                <span>{lesson.topicTitle}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                {lesson.title}
              </h1>
            </div>

            {/* If Content Blocks Exist, render in rich sequence */}
            {hasBlocks ? (
              <div className="space-y-8">
                {lesson.contentBlocks!.map((block: ContentBlock) => (
                  <ContentBlockRenderer key={block.id} block={block} />
                ))}
              </div>
            ) : (
              /* Fallback to markdown if no blocks configured */
              <article className="prose prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-sm prose-p:leading-relaxed prose-p:text-slate-300 prose-code:font-mono prose-code:text-xs prose-code:bg-surface-raised prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground prose-code:border prose-code:border-border prose-pre:bg-[#0b0c0e] prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-li:text-sm prose-li:text-slate-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lesson.contentMarkdown}
                </ReactMarkdown>
              </article>
            )}
          </main>
        </div>
      </div>

      {/* 3. Sticky Bottom Navigation Bar */}
      <footer className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur px-4 sm:px-6 py-3">
        <div className="container max-w-screen-2xl flex items-center justify-between">
          <div>
            {lesson.prevLessonId ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/lessons/${lesson.prevLessonId}`)}
                className="gap-1.5 text-xs h-8"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Previous Lesson</span>
                <span className="sm:hidden">Prev</span>
              </Button>
            ) : (
              <Link to={`/courses/${lesson.courseSlug}`}>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Syllabus</span>
                </Button>
              </Link>
            )}
          </div>

          <div>
            {lesson.nextLessonId ? (
              <Button
                size="sm"
                onClick={() => navigate(`/lessons/${lesson.nextLessonId}`)}
                className="gap-1.5 text-xs h-8 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <span>Next Lesson</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Link to={`/courses/${lesson.courseSlug}`}>
                <Button size="sm" className="gap-1.5 text-xs h-8 font-semibold bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Finish Curriculum</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

// ==========================================
// Component: ContentBlockRenderer
// ==========================================
interface ContentBlockRendererProps {
  block: ContentBlock;
}

const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ block }) => {
  let parsedJson: any = null;
  try {
    if (block.dataJson) {
      parsedJson = JSON.parse(block.dataJson);
    }
  } catch {
    // ignore
  }

  // 1. VIDEO BLOCK (YOUTUBE EMBED WITH ATTRIBUTION)
  if (block.type === 'VIDEO' && parsedJson) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-rose-500/10 text-rose-400">
              <Video className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{block.title}</h3>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 font-mono text-xs text-purple-300">
            <GraduationCap className="h-3 w-3" />
            <span>Instructor: {parsedJson.attribution || 'Apna College'}</span>
          </div>
        </div>

        {/* Responsive Video Container */}
        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-lg">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${parsedJson.videoId}?rel=0`}
            title={block.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {block.content && (
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            {block.content}
          </p>
        )}
      </div>
    );
  }

  // 2. LINK BLOCK (OFFICIAL DOCUMENTATION CARD)
  if (block.type === 'LINK' && parsedJson) {
    return (
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 to-surface p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="uppercase tracking-wider font-semibold">
                Official Reference: {parsedJson.provider || 'Official Docs'}
              </span>
            </div>
            <h3 className="text-base font-semibold text-foreground">{block.title}</h3>
            {block.content && (
              <p className="text-xs text-muted-foreground leading-relaxed">{block.content}</p>
            )}
          </div>

          <a
            href={parsedJson.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-mono border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
            >
              <span>Explore Docs</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // 3. CODE BLOCK
  if (block.type === 'CODE') {
    const lang = parsedJson?.language || 'java';
    return <CodeSnippetBlock title={block.title} code={block.content} language={lang} />;
  }

  // 4. QUESTION BLOCK (CONCEPT CHECK)
  if (block.type === 'QUESTION' && parsedJson) {
    return (
      <InteractiveConceptCheck
        title={block.title}
        question={block.content}
        options={parsedJson.options || []}
        correctIndex={parsedJson.correctIndex ?? 0}
        explanation={parsedJson.explanation}
      />
    );
  }

  // 5. TEXT / MARKDOWN BLOCK (DEFAULT)
  return (
    <div className="space-y-3">
      {block.title && block.title !== 'Lesson Notes' && (
        <h3 className="text-xl font-semibold text-foreground tracking-tight border-b border-border/60 pb-2">
          {block.title}
        </h3>
      )}
      <article className="prose prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-sm prose-p:leading-relaxed prose-p:text-slate-300 prose-code:font-mono prose-code:text-xs prose-code:bg-surface-raised prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground prose-code:border prose-code:border-border prose-pre:bg-[#0b0c0e] prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-li:text-sm prose-li:text-slate-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content}</ReactMarkdown>
      </article>
    </div>
  );
};

// ==========================================
// Component: CodeSnippetBlock
// ==========================================
interface CodeSnippetProps {
  title: string;
  code: string;
  language: string;
}

const CodeSnippetBlock: React.FC<CodeSnippetProps> = ({ title, code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-[#0b0c0e] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/80 bg-surface/60 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Code className="h-3.5 w-3.5 text-purple-400" />
          <span className="font-medium text-foreground">{title || 'Code Snippet'}</span>
          <span className="text-[10px] uppercase text-muted-foreground bg-surface px-1.5 py-0.5 rounded border border-border">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-emerald-400/90">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// ==========================================
// Component: InteractiveConceptCheck
// ==========================================
interface ConceptCheckProps {
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

const InteractiveConceptCheck: React.FC<ConceptCheckProps> = ({
  title,
  question,
  options,
  correctIndex,
  explanation,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelectedIdx(idx);
    setHasAnswered(true);
  };

  const isCorrect = selectedIdx === correctIndex;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-surface p-5 space-y-4 font-sans">
      <div className="flex items-center gap-2 border-b border-border pb-2.5">
        <div className="p-1 rounded bg-amber-500/10 text-amber-400">
          <HelpCircle className="h-4 w-4" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">{title || 'Concept Check'}</h4>
      </div>

      <p className="text-sm font-medium text-foreground">{question}</p>

      <div className="space-y-2">
        {options.map((opt, idx) => {
          let stateStyle = 'border-border bg-surface-raised hover:border-purple-500/50 text-foreground';
          if (hasAnswered) {
            if (idx === correctIndex) {
              stateStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold';
            } else if (idx === selectedIdx) {
              stateStyle = 'border-rose-500 bg-rose-500/15 text-rose-300';
            } else {
              stateStyle = 'border-border/40 opacity-50 text-muted-foreground';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={hasAnswered}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${stateStyle}`}
            >
              <span>{opt}</span>
              {hasAnswered && idx === correctIndex && (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div
          className={`p-3 rounded-lg text-xs font-mono border ${
            isCorrect
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="font-semibold mb-1">
            {isCorrect ? 'Correct! Excellent job.' : 'Not quite right.'}
          </div>
          {explanation && <p className="text-muted-foreground font-sans">{explanation}</p>}
        </div>
      )}
    </div>
  );
};
