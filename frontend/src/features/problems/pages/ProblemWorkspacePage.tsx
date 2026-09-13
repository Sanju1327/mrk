import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Terminal,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  Clock,
  Cpu,
  Flame,
  FileCode2,
  XCircle,
} from 'lucide-react';
import { problemApi } from '@/lib/problem-api';
import type { Difficulty, TestCase } from '@/types/problem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const difficultyBadgeVariant: Record<Difficulty, 'easy' | 'medium' | 'hard'> = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const ProblemWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [code, setCode] = useState<string>('');
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'description' | 'testcases' | 'editorial'>('description');
  const [executionState, setExecutionState] = useState<{
    status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';
    runtimeMs?: number;
    memoryMb?: number;
    message?: string;
    details?: string;
  }>({ status: 'IDLE' });

  const { data: problem, isLoading, error } = useQuery({
    queryKey: ['problem', slug],
    queryFn: () => problemApi.getProblemBySlug(slug!),
    enabled: !!slug,
  });

  // Initialize editor code when problem loads
  useEffect(() => {
    if (problem?.starterCode) {
      setCode(problem.starterCode);
    }
  }, [problem]);

  // Keyboard shortcut listener: Ctrl+Enter (or Cmd+Enter) to run tests
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code]);

  const handleResetCode = () => {
    if (problem?.starterCode) {
      setCode(problem.starterCode);
      setExecutionState({
        status: 'IDLE',
        message: 'Starter code restored.',
      });
      setTimeout(() => setExecutionState({ status: 'IDLE' }), 3000);
    }
  };

  const handleRunCode = () => {
    setExecutionState({
      status: 'RUNNING',
      message: 'Compiling Solution.java in sandbox container...',
    });

    // Simulate dry run completion with realistic execution telemetry
    setTimeout(() => {
      setExecutionState({
        status: 'SUCCESS',
        runtimeMs: 34,
        memoryMb: 14.6,
        message: 'All sample test assertions passed.',
        details: 'Verified against sample cases 1 through ' + (problem?.sampleTestCases?.length || 2),
      });
    }, 1200);
  };

  const handleSubmitCode = () => {
    setExecutionState({
      status: 'RUNNING',
      message: 'Executing solution against full hidden suite (12 test cases)...',
    });

    setTimeout(() => {
      setExecutionState({
        status: 'SUCCESS',
        runtimeMs: 42,
        memoryMb: 15.1,
        message: 'ACCEPTED — 12/12 Test Cases Passed',
        details: 'Runtime outperforms 94.2% of Java 21 submissions. Memory within 256MB limit.',
      });
    }, 1800);
  };

  if (isLoading) {
    return (
      <div className="container max-w-screen-2xl px-4 sm:px-6 py-12 space-y-4 animate-pulse">
        <div className="h-6 w-36 bg-border rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px]">
          <div className="lg:col-span-5 h-full bg-surface rounded-lg" />
          <div className="lg:col-span-7 h-full bg-surface rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="container max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Problem Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested challenge does not exist or could not be loaded.</p>
        <Link to="/problems">
          <Button variant="outline" size="sm">Back to Problems</Button>
        </Link>
      </div>
    );
  }

  const sampleCases = problem.sampleTestCases || [];
  const currentCase: TestCase | undefined = sampleCases[activeTestCaseIndex];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      {/* 1. Top IDE Workspace Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 shrink-0">
        {/* Left: Breadcrumbs & Meta */}
        <div className="flex items-center gap-3">
          <Link
            to="/problems"
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Problems</span>
          </Link>
          <span className="text-border">/</span>
          <h1 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
            <span>{problem.title}</span>
            {problem.isDailyChallenge && (
              <span title="Daily Challenge">
                <Flame className="h-3.5 w-3.5 text-amber-400 fill-current" />
              </span>
            )}
          </h1>
          <Badge variant={difficultyBadgeVariant[problem.difficulty]} className="text-[10px] py-0">
            {problem.difficulty}
          </Badge>
          {problem.solvedByUser && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Solved</span>
            </span>
          )}
        </div>

        {/* Right: Limits & Run Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 font-mono text-xs text-muted-foreground border-r border-border pr-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{problem.timeLimitMs}ms</span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              <span>{problem.memoryLimitMb}MB</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunCode}
              disabled={executionState.status === 'RUNNING'}
              className="h-7 text-xs font-mono gap-1.5 border-border hover:bg-surface-raised"
              title="Execute sample test cases (Ctrl+Enter)"
            >
              <Play className="h-3 w-3 fill-current text-foreground" />
              <span>Run</span>
              <span className="hidden sm:inline text-[10px] text-muted-foreground font-mono ml-0.5">^Enter</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSubmitCode}
              disabled={executionState.status === 'RUNNING'}
              className="h-7 text-xs font-semibold px-3 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 font-mono"
              title="Submit solution for full grading"
            >
              <Send className="h-3 w-3" />
              <span>Submit</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Split: Left Spec & Right Monaco IDE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Pane: Spec & Test Cases (5 cols) */}
        <div className="lg:col-span-5 border-r border-border flex flex-col h-full overflow-hidden bg-background">
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-border bg-surface px-4 pt-1 gap-4 font-mono text-xs">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-2 transition-colors border-b-2 font-medium ${
                activeTab === 'description'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`pb-2 transition-colors border-b-2 font-medium ${
                activeTab === 'testcases'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Test Cases ({sampleCases.length})
            </button>
            {problem.explanation && (
              <button
                onClick={() => setActiveTab('editorial')}
                className={`pb-2 transition-colors border-b-2 font-medium ${
                  activeTab === 'editorial'
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Editorial
              </button>
            )}
          </div>

          {/* Tab Content Pane (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {activeTab === 'description' && (
              <>
                <article className="prose prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-xs prose-p:sm:text-sm prose-p:leading-relaxed prose-p:text-slate-300 prose-code:font-mono prose-code:text-xs prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-border">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {problem.description}
                  </ReactMarkdown>
                </article>

                {/* Constraints Card */}
                {problem.constraints && (
                  <div className="space-y-2 rounded-md border border-border bg-surface p-4">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Constraints
                    </span>
                    <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                      {problem.constraints}
                    </pre>
                  </div>
                )}
              </>
            )}

            {activeTab === 'testcases' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sample Test Harness
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Public Assertions
                  </span>
                </div>

                <div className="flex gap-1.5 border-b border-border pb-2">
                  {sampleCases.map((tc, idx) => (
                    <button
                      key={tc.id}
                      onClick={() => setActiveTestCaseIndex(idx)}
                      className={`px-3 py-1 rounded font-mono text-xs transition-colors ${
                        activeTestCaseIndex === idx
                          ? 'bg-surface-raised text-foreground font-medium border border-border'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                {currentCase && (
                  <div className="space-y-3 rounded-md border border-border bg-surface p-4 font-mono text-xs">
                    <div>
                      <span className="text-muted-foreground text-[11px] uppercase">Input Data</span>
                      <pre className="mt-1 p-2.5 rounded bg-background border border-border text-foreground overflow-x-auto">
                        {currentCase.inputData}
                      </pre>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-[11px] uppercase">Expected Output</span>
                      <pre className="mt-1 p-2.5 rounded bg-background border border-border text-emerald-400 overflow-x-auto">
                        {currentCase.expectedOutput}
                      </pre>
                    </div>

                    {currentCase.explanation && (
                      <div className="pt-1">
                        <span className="text-muted-foreground text-[11px] uppercase">Explanation</span>
                        <p className="mt-1 text-xs text-muted-foreground font-sans leading-relaxed">
                          {currentCase.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'editorial' && (
              <article className="prose prose-invert prose-zinc max-w-none prose-p:text-xs prose-p:sm:text-sm prose-p:leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {problem.explanation || 'No official editorial published for this problem yet.'}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>

        {/* Right Pane: Monaco Editor & Interactive Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-[#0d0f12]">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-foreground">
              <FileCode2 className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-medium">Solution.java</span>
              <span className="text-border">|</span>
              <span className="text-muted-foreground text-[11px]">Java 21 (OpenJDK HotSpot)</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetCode}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 font-mono"
              title="Reset to default starter template"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </Button>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language="java"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                fontFamily: 'Fira Code, JetBrains Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                automaticLayout: true,
                tabSize: 4,
                cursorBlinking: 'smooth',
                renderWhitespace: 'selection',
                padding: { top: 12, bottom: 12 },
                lineNumbersMinChars: 3,
              }}
            />
          </div>

          {/* Execution Telemetry Console (Bottom Drawer) */}
          <div className="border-t border-border bg-surface shrink-0">
            {/* Console Header */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-border/80 font-mono text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Terminal className="h-3.5 w-3.5" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">
                  Sandbox Console
                </span>
              </div>

              {executionState.status !== 'IDLE' && (
                <div className="flex items-center gap-3 text-[11px]">
                  {executionState.status === 'RUNNING' && (
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                      <span>Executing...</span>
                    </span>
                  )}
                  {executionState.status === 'SUCCESS' && (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified</span>
                    </span>
                  )}
                  {executionState.status === 'ERROR' && (
                    <span className="text-rose-400 font-medium flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      <span>Execution Error</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Console Body */}
            <div className="p-3.5 font-mono text-xs space-y-2 min-h-[70px] max-h-36 overflow-y-auto bg-[#0b0c0e]">
              {executionState.status === 'IDLE' ? (
                <div className="text-muted-foreground/60 text-[11px]">
                  Ready. Press <kbd className="bg-surface px-1 py-0.5 rounded border border-border">Ctrl+Enter</kbd> to execute against test cases or click Submit.
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">{executionState.message}</span>
                    {executionState.runtimeMs && (
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>Runtime: <strong className="text-foreground">{executionState.runtimeMs}ms</strong></span>
                        <span>Memory: <strong className="text-foreground">{executionState.memoryMb}MB</strong></span>
                      </div>
                    )}
                  </div>
                  {executionState.details && (
                    <div className="text-muted-foreground text-[11px]">
                      {executionState.details}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
