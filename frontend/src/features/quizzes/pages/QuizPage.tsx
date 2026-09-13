import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: number;
  questionText: string;
  codeSnippet?: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

const sampleQuiz = {
  id: 1,
  title: 'Java Memory Model & Syntax Mastery',
  courseTitle: 'Java Foundations & OOP',
  topic: 'JVM Architecture & Variables',
  estimatedMinutes: 10,
  questions: [
    {
      id: 1,
      questionText: 'What happens when an object reference variable in Java is passed as an argument to a method?',
      codeSnippet: `public void modify(StringBuilder sb) {
    sb.append("World");
    sb = new StringBuilder("New");
}`,
      options: [
        { key: 'A', text: 'The object is passed by reference; reassigning sb alters the caller’s reference.' },
        { key: 'B', text: 'The reference is passed by value; mutating the object affects the caller, but reassigning sb does not.' },
        { key: 'C', text: 'Java passes all parameters by reference strictly, copying memory pointers.' },
        { key: 'D', text: 'A deep clone of the StringBuilder object is created on the method stack frame.' },
      ],
      correctAnswer: 'B',
      explanation: 'Java is strictly pass-by-value. For object references, the value passed is the memory reference itself. Mutations affect the heap object, but reassignment only alters the local method variable.',
    },
    {
      id: 2,
      questionText: 'Where are local primitive variables (e.g., int, boolean) allocated during method execution?',
      options: [
        { key: 'A', text: 'Metaspace memory region' },
        { key: 'B', text: 'Young Generation Heap' },
        { key: 'C', text: 'Thread Stack Frame' },
        { key: 'D', text: 'Survivor Space S0' },
      ],
      correctAnswer: 'C',
      explanation: 'Local primitive variables defined inside methods are stored directly on the thread’s call stack frame. They are deallocated automatically when the frame returns.',
    },
    {
      id: 3,
      questionText: 'Which keyword guarantees that reads and writes to a field are directly synchronized with main memory?',
      options: [
        { key: 'A', text: 'transient' },
        { key: 'B', text: 'volatile' },
        { key: 'C', text: 'strictfp' },
        { key: 'D', text: 'native' },
      ],
      correctAnswer: 'B',
      explanation: 'The volatile modifier establishes a happens-before relationship, guaranteeing memory visibility across threads by bypassing CPU L1/L2 cache registers.',
    },
  ] as Question[],
};

export const QuizPage: React.FC = () => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const questions = sampleQuiz.questions;
  const currentQuestion = questions[currentQuestionIdx];
  const totalQuestions = questions.length;

  const handleSelectOption = (questionId: number, optionKey: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentQuestionIdx(0);
  };

  const score = calculateScore();
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="container max-w-4xl px-4 sm:px-6 py-10 space-y-8">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Link to="/courses" className="hover:text-foreground">
              {sampleQuiz.courseTitle}
            </Link>
            <span>/</span>
            <span>{sampleQuiz.topic}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            {sampleQuiz.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>~{sampleQuiz.estimatedMinutes}m assessment</span>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {totalQuestions} Questions
          </Badge>
        </div>
      </div>

      {/* 2. Stepper Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>
            Question {currentQuestionIdx + 1} of {totalQuestions}
          </span>
          <span>{Object.keys(selectedAnswers).length} answered</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCurrent = idx === currentQuestionIdx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-foreground'
                    : isAnswered
                    ? 'bg-emerald-400'
                    : 'bg-border'
                }`}
                aria-label={`Jump to question ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* 3. Main Assessment Area or Results View */}
      {!submitted ? (
        <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 space-y-6">
          {/* Question Text */}
          <div className="space-y-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Question {currentQuestionIdx + 1}
            </span>
            <h2 className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            {/* Code Snippet if applicable */}
            {currentQuestion.codeSnippet && (
              <pre className="p-4 rounded-md border border-border bg-[#0b0c0e] font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                {currentQuestion.codeSnippet}
              </pre>
            )}
          </div>

          {/* Option Choices */}
          <div className="space-y-2.5 pt-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedAnswers[currentQuestion.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.key)}
                  className={`w-full flex items-start gap-3.5 p-4 rounded-md text-left text-xs sm:text-sm transition-colors border ${
                    isSelected
                      ? 'bg-surface-raised border-foreground/60 text-foreground font-medium'
                      : 'bg-background/60 border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised/40'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-foreground text-background'
                        : 'border border-border text-muted-foreground'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="leading-relaxed mt-0.5">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Stepper Navigation Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
              disabled={currentQuestionIdx === 0}
              className="gap-1.5 text-xs h-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center gap-2">
              {currentQuestionIdx < totalQuestions - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                  className="gap-1.5 text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(selectedAnswers).length === 0}
                  className="gap-1.5 text-xs h-8 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Submit Assessment</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 4. Score Report & Explanation Review View */
        <div className="space-y-8">
          <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase">
                  <Award className="h-4 w-4 text-emerald-400" />
                  <span>Assessment Report</span>
                </div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {percentage >= 70 ? 'Proficiency Verified' : 'Review Recommended'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Completed {sampleQuiz.title}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <div className="text-3xl font-semibold text-foreground">{score} / {totalQuestions}</div>
                  <div className="text-[11px] text-muted-foreground">{percentage}% accuracy</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1.5 text-xs h-8 font-mono"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Retake</span>
                </Button>
              </div>
            </div>

            {/* Answer Key & Explanations */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-foreground">Detailed Question Review</h3>
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className="rounded-lg border border-border bg-background p-5 space-y-3 font-sans"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="font-mono text-[11px] text-muted-foreground">
                            Question {idx + 1}
                          </span>
                          <h4 className="text-sm font-medium text-foreground">
                            {q.questionText}
                          </h4>
                        </div>
                        {isCorrect ? (
                          <div className="flex items-center gap-1 font-mono text-xs text-emerald-400 shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Correct</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 font-mono text-xs text-rose-400 shrink-0">
                            <XCircle className="h-4 w-4" />
                            <span>Incorrect</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                        <div className="p-2 rounded bg-surface border border-border text-muted-foreground">
                          Your choice: <strong className="text-foreground">{userAnswer || 'None'}</strong>
                        </div>
                        <div className="p-2 rounded bg-surface border border-border text-emerald-400">
                          Correct key: <strong className="text-emerald-400">{q.correctAnswer}</strong>
                        </div>
                      </div>

                      <div className="p-3 rounded bg-surface-raised border border-border/80 text-xs text-muted-foreground leading-relaxed font-sans">
                        <strong className="text-foreground font-mono text-[11px] block mb-1">
                          Technical Rationale:
                        </strong>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-between">
              <Link to="/courses">
                <Button variant="outline" size="sm" className="text-xs">
                  Back to Courses
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="sm" className="text-xs font-semibold bg-primary text-primary-foreground">
                  Continue to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
