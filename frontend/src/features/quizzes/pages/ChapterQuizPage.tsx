import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Lock,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { quizApi } from '@/lib/quiz-api';
import type { QuizAttemptInfo, QuizResult } from '@/types/quiz';
import { Button } from '@/components/ui/button';

const formatClock = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const AttemptsLine: React.FC<{ info: QuizAttemptInfo | null }> = ({ info }) => {
  if (!info) return null;
  const limit = info.maxAttempts != null ? `${info.attemptsUsed}/${info.maxAttempts} attempts used` : `${info.attemptsUsed} attempt${info.attemptsUsed === 1 ? '' : 's'} so far`;
  return (
    <span>
      {limit}
      {info.bestPercentage != null && ` · best ${Math.round(info.bestPercentage)}%`}
      {!info.allowRetakes && ' · single attempt'}
    </span>
  );
};

/**
 * Student-facing chapter quiz: intro → questions → results. Attempt rules
 * (lessons complete, retakes, max attempts) are enforced by the backend; the UI mirrors them.
 */
export const ChapterQuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const id = Number(quizId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<'intro' | 'taking' | 'result'>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);

  const { data: quiz, isLoading, error, refetch } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizApi.getQuiz(id),
    enabled: !Number.isNaN(id),
    retry: false,
  });

  // Timer while taking the quiz
  useEffect(() => {
    if (phase !== 'taking') return;
    const tick = setInterval(() => {
      if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [phase]);

  const timeLimitSeconds = (quiz?.timeLimitMinutes || 0) * 60;
  const remaining = timeLimitSeconds > 0 ? Math.max(0, timeLimitSeconds - elapsed) : null;

  const submitMutation = useMutation({
    mutationFn: () => quizApi.submitQuiz(id, answers, elapsed),
    onSuccess: (res) => {
      setResult(res);
      setPhase('result');
      queryClient.invalidateQueries({ queryKey: ['quiz', id] });
      if (res.courseSlug) queryClient.invalidateQueries({ queryKey: ['course', res.courseSlug] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    },
  });

  // Auto-submit when the time limit runs out
  useEffect(() => {
    if (phase === 'taking' && remaining === 0 && !submitMutation.isPending) {
      submitMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const start = () => {
    setAnswers({});
    setCurrent(0);
    setResult(null);
    setElapsed(0);
    startedAt.current = Date.now();
    setPhase('taking');
  };

  const retry = async () => {
    const fresh = await refetch();
    if (fresh.data?.attemptInfo?.canAttempt) start();
    else setPhase('intro');
  };

  if (isLoading) {
    return <div className="container max-w-3xl px-4 py-16 text-center font-mono text-xs text-muted-foreground">Loading quiz...</div>;
  }

  if (error || !quiz) {
    const status = (error as any)?.response?.status;
    const message = (error as any)?.response?.data?.message;
    return (
      <div className="container max-w-md mx-auto px-4 py-24 text-center space-y-4 font-sans">
        <div className="mx-auto w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center text-muted-foreground">
          {status === 403 ? <Lock className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        </div>
        <h2 className="text-xl font-semibold text-foreground">{status === 403 ? 'Quiz locked' : 'Quiz unavailable'}</h2>
        <p className="text-xs text-muted-foreground">{message || 'This quiz could not be loaded.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const info = quiz.attemptInfo;
  const courseLink = quiz.courseSlug ? `/courses/${quiz.courseSlug}` : '/courses';

  const header = (
    <div className="space-y-2 border-b border-border pb-5">
      <Link to={courseLink} className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{quiz.courseTitle || 'Back to course'}</span>
      </Link>
      <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
        <ClipboardCheck className="h-4 w-4" />
        <span className="uppercase tracking-wider font-semibold">Chapter quiz{quiz.topicTitle ? ` · ${quiz.topicTitle}` : ''}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{quiz.title}</h1>
    </div>
  );

  // ---------------- RESULT ----------------
  if (phase === 'result' && result) {
    const nextLesson = result.nextChapterFirstLessonId ?? quiz.nextChapterFirstLessonId;
    const canRetry = result.attemptInfo?.canAttempt ?? false;
    return (
      <div className="container max-w-3xl px-4 sm:px-6 py-10 space-y-8 font-sans">
        {header}
        <div className={`rounded-xl border p-6 space-y-4 ${result.passed ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'}`}>
          <div className="flex items-center gap-3">
            {result.passed ? <Award className="h-8 w-8 text-emerald-400" /> : <XCircle className="h-8 w-8 text-rose-400" />}
            <div>
              <div className="text-xl font-semibold text-foreground">{result.passed ? 'Passed' : 'Not passed yet'}</div>
              <div className="text-xs font-mono text-muted-foreground">
                {result.score}/{result.maxScore} points · {Math.round(result.percentage)}% · pass mark {result.passingScorePercentage}% · {formatClock(result.timeSpentSeconds)}
              </div>
            </div>
          </div>
          {result.attemptInfo && (
            <div className="text-xs font-mono text-muted-foreground">
              <AttemptsLine info={result.attemptInfo} />
              {!canRetry && result.attemptInfo.blockedReason && !result.passed && <span> · {result.attemptInfo.blockedReason}</span>}
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {result.passed && nextLesson && (
              <Button size="sm" onClick={() => navigate(`/lessons/${nextLesson}`)} className="h-9 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                <span>Continue to next chapter</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {!result.passed && canRetry && (
              <Button size="sm" onClick={retry} className="h-9 text-xs font-semibold gap-1.5 bg-amber-500 hover:bg-amber-400 text-black">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry quiz</span>
              </Button>
            )}
            <Link to={courseLink}>
              <Button size="sm" variant="outline" className="h-9 text-xs">Back to course</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">Review</h2>
          {result.questionResults.map((qr, idx) => {
            const question = quiz.questions.find((q) => q.id === qr.questionId);
            return (
              <div key={qr.questionId} className={`rounded-xl border bg-surface p-5 space-y-3 ${qr.isCorrect ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-xs text-muted-foreground mt-0.5">Q{idx + 1}</span>
                    <p className="text-sm font-medium text-foreground">{qr.questionText}</p>
                  </div>
                  <span className={`shrink-0 font-mono text-[11px] ${qr.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {qr.pointsEarned}/{qr.pointsPossible}
                  </span>
                </div>
                {question && (
                  <div className="space-y-1.5">
                    {question.options.map((opt) => {
                      const isCorrect = opt.id === qr.correctOptionId;
                      const isSelected = opt.id === qr.selectedOptionId;
                      let cls = 'border-border/40 text-muted-foreground';
                      if (isCorrect) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-medium';
                      else if (isSelected) cls = 'border-rose-500 bg-rose-500/10 text-rose-300';
                      return (
                        <div key={opt.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${cls}`}>
                          <span>{opt.optionText}</span>
                          {isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                          {isSelected && !isCorrect && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                        </div>
                      );
                    })}
                    {qr.selectedOptionId == null && <div className="text-[11px] font-mono text-muted-foreground">Not answered</div>}
                  </div>
                )}
                {qr.explanation && (
                  <div className="rounded-lg border border-border bg-surface-raised p-3 text-xs text-muted-foreground">
                    <span className="font-mono text-foreground">Explanation: </span>
                    {qr.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------------- TAKING ----------------
  if (phase === 'taking') {
    const q = quiz.questions[current];
    const isLast = current === quiz.questions.length - 1;
    return (
      <div className="container max-w-3xl px-4 sm:px-6 py-10 space-y-6 font-sans">
        <div className="flex items-center justify-between font-mono text-xs text-muted-foreground border-b border-border pb-3">
          <span>
            Question {current + 1} of {quiz.questions.length} · {answeredCount} answered
          </span>
          <span className={`flex items-center gap-1.5 ${remaining != null && remaining < 60 ? 'text-rose-400' : ''}`}>
            <Clock className="h-3.5 w-3.5" />
            {remaining != null ? `${formatClock(remaining)} left` : formatClock(elapsed)}
          </span>
        </div>

        <div className="h-1 w-full rounded-full bg-border overflow-hidden">
          <div className="h-full bg-amber-400 transition-all" style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }} />
        </div>

        {q && (
          <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-medium text-foreground leading-relaxed">{q.questionText}</p>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{q.points} pt{q.points === 1 ? '' : 's'}</span>
            </div>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAnswers({ ...answers, [q.id]: opt.id })}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors flex items-center gap-3 ${
                      selected ? 'border-amber-400 bg-amber-500/10 text-foreground' : 'border-border bg-surface-raised text-foreground hover:border-amber-500/50'
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full border shrink-0 ${selected ? 'border-amber-400 bg-amber-400' : 'border-border'}`} />
                    <span>{opt.optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {quiz.questions.map((qq, idx) => (
            <button
              key={qq.id}
              onClick={() => setCurrent(idx)}
              className={`h-7 w-7 rounded text-[11px] font-mono border transition-colors ${
                idx === current ? 'border-amber-400 text-amber-300' : answers[qq.id] != null ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-border text-muted-foreground'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {submitMutation.isError && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs font-mono text-destructive">
            <AlertCircle className="h-4 w-4" />
            {(submitMutation.error as any)?.response?.data?.message || 'Could not submit the quiz. Check your connection and try again.'}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button size="sm" variant="outline" className="h-9 text-xs" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
            Previous
          </Button>
          {isLast ? (
            <Button
              size="sm"
              className="h-9 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black"
              disabled={submitMutation.isPending}
              onClick={() => {
                if (answeredCount < quiz.questions.length && !window.confirm(`You have ${quiz.questions.length - answeredCount} unanswered question(s). Submit anyway?`)) return;
                submitMutation.mutate();
              }}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit quiz'}
            </Button>
          ) : (
            <Button size="sm" className="h-9 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCurrent((c) => c + 1)}>
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ---------------- INTRO ----------------
  const canAttempt = info?.canAttempt ?? quiz.questions.length > 0;
  return (
    <div className="container max-w-3xl px-4 sm:px-6 py-10 space-y-8 font-sans">
      {header}
      {quiz.description && <p className="text-sm text-muted-foreground leading-relaxed">{quiz.description}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="rounded-lg border border-border bg-surface p-3">
          <div className="text-muted-foreground">Questions</div>
          <div className="text-lg font-semibold text-foreground">{quiz.totalQuestions}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <div className="text-muted-foreground">Pass mark</div>
          <div className="text-lg font-semibold text-foreground">{quiz.passingScorePercentage}%</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <div className="text-muted-foreground">Time limit</div>
          <div className="text-lg font-semibold text-foreground">{quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes} min` : 'None'}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <div className="text-muted-foreground">Attempts</div>
          <div className="text-lg font-semibold text-foreground">
            {info?.maxAttempts != null ? `${info.attemptsUsed}/${info.maxAttempts}` : info?.allowRetakes === false ? `${info.attemptsUsed}/1` : info?.attemptsUsed ?? 0}
          </div>
        </div>
      </div>

      {info?.passed && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            You have passed this quiz{info.bestPercentage != null ? ` (best ${Math.round(info.bestPercentage)}%)` : ''}.
          </span>
        </div>
      )}

      {!canAttempt && !info?.passed && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300">
          <Lock className="h-4 w-4 shrink-0" />
          <span>{info?.blockedReason || 'You cannot attempt this quiz right now.'}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {canAttempt && (
          <Button onClick={start} className="h-10 text-xs font-semibold gap-2 bg-amber-500 hover:bg-amber-400 text-black">
            <ClipboardCheck className="h-4 w-4" />
            <span>{(info?.attemptsUsed ?? 0) > 0 ? 'Start new attempt' : 'Start quiz'}</span>
          </Button>
        )}
        {info?.passed && (quiz.nextChapterFirstLessonId != null) && (
          <Button variant="outline" onClick={() => navigate(`/lessons/${quiz.nextChapterFirstLessonId}`)} className="h-10 text-xs font-semibold gap-2">
            <span>Continue to next chapter</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        <Link to={courseLink}>
          <Button variant="ghost" className="h-10 text-xs">Back to course</Button>
        </Link>
      </div>
      {info && (
        <p className="text-[11px] font-mono text-muted-foreground">
          <AttemptsLine info={info} />
        </p>
      )}
    </div>
  );
};
