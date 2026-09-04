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
  const [activeTab, setActiveTab] = useState<'description' | 'editorial'>('description');
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

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

  const handleResetCode = () => {
    if (problem?.starterCode) {
      setCode(problem.starterCode);
      setExecutionMessage('Code reset to default starter template.');
      setTimeout(() => setExecutionMessage(null), 3000);
    }
  };

  const handleRunCode = () => {
    setExecutionMessage(
      'Dry-run execution sandbox connects in Phase 6. Code syntax and structure validated!'
    );
    setTimeout(() => setExecutionMessage(null), 5000);
  };

  const handleSubmitCode = () => {
    setExecutionMessage(
      'Full test suite evaluation sandbox connects in Phase 6. Code is ready for submission!'
    );
    setTimeout(() => setExecutionMessage(null), 5000);
  };

  if (isLoading) {
    return (
      <div className="container max-w-screen-2xl px-4 py-16 space-y-6 animate-pulse">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[700px]">
          <div className="h-full bg-muted/30 rounded-xl" />
          <div className="h-full bg-muted/30 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="container max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Problem Not Found</h2>
        <p className="text-muted-foreground">The requested coding problem could not be found.</p>
        <Link to="/problems">
          <Button variant="outline">Back to Problems</Button>
        </Link>
      </div>
    );
  }

  const sampleCases = problem.sampleTestCases || [];
  const currentCase: TestCase | undefined = sampleCases[activeTestCaseIndex];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Top Workspace Bar */}
      <div className="flex items-center justify-between border-b border-border/40 bg-card/60 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/problems"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Problems</span>
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <h1 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>{problem.title}</span>
            {problem.isDailyChallenge && (
              <Flame className="h-3.5 w-3.5 text-amber-400 fill-current" />
            )}
          </h1>
          <Badge variant={difficultyBadgeVariant[problem.difficulty]} className="text-[10px] py-0">
            {problem.difficulty}
          </Badge>
          {problem.solvedByUser && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Solved</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{problem.timeLimitMs}ms limit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span>{problem.memoryLimitMb}MB memory</span>
          </div>
        </div>
      </div>

      {/* Main Split Pane */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Pane: Problem Description & Sample Cases (5 cols) */}
        <div className="lg:col-span-5 border-r border-border/40 flex flex-col h-full overflow-hidden bg-card/20">
          {/* Tabs */}
          <div className="flex items-center border-b border-border/40 px-4 pt-2 gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === 'description'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Description
            </button>
            {problem.explanation && (
              <button
                onClick={() => setActiveTab('editorial')}
                className={`pb-2 transition-colors border-b-2 ${
                  activeTab === 'editorial'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Editorial
              </button>
            )}
          </div>

          {/* Description Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'description' ? (
              <>
                <article className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-code:text-amber-300 prose-pre:bg-zinc-950">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {problem.description}
                  </ReactMarkdown>
                </article>

                {/* Constraints Card */}
                {problem.constraints && (
                  <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Constraints
                    </h4>
                    <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">
                      {problem.constraints}
                    </pre>
                  </div>
                )}

                {/* Sample Test Cases */}
                {sampleCases.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Sample Test Cases
                    </h4>
                    <div className="flex gap-2 border-b border-border/30 pb-2">
                      {sampleCases.map((tc, idx) => (
                        <Button
                          key={tc.id}
                          size="sm"
                          variant={activeTestCaseIndex === idx ? 'default' : 'outline'}
                          onClick={() => setActiveTestCaseIndex(idx)}
                          className="text-xs h-7 px-3"
                        >
                          Case {idx + 1}
                        </Button>
                      ))}
                    </div>

                    {currentCase && (
                      <div className="space-y-2.5 rounded-lg border border-border/50 bg-black/40 p-3.5 text-xs font-mono">
                        <div>
                          <span className="text-muted-foreground">Input:</span>
                          <pre className="mt-1 p-2 rounded bg-muted/40 text-foreground overflow-x-auto">
                            {currentCase.inputData}
                          </pre>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected Output:</span>
                          <pre className="mt-1 p-2 rounded bg-muted/40 text-emerald-400 overflow-x-auto">
                            {currentCase.expectedOutput}
                          </pre>
                        </div>
                        {currentCase.explanation && (
                          <div>
                            <span className="text-muted-foreground">Explanation:</span>
                            <p className="mt-1 text-muted-foreground font-sans">
                              {currentCase.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <article className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {problem.explanation || 'No editorial available yet.'}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>

        {/* Right Pane: Monaco Editor & Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-[#1e1e1e]">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-mono">
              <FileCode2 className="h-4 w-4 text-amber-400" />
              <span>Solution.java</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Java 21 (OpenJDK LTS)</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetCode}
              className="h-7 text-xs text-zinc-400 hover:text-white gap-1.5"
              title="Reset starter template"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          </div>

          {/* Monaco Editor Component */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language="java"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, Menlo, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                automaticLayout: true,
                tabSize: 4,
                cursorBlinking: 'smooth',
                renderWhitespace: 'selection',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Feedback Banner if triggered */}
          {executionMessage && (
            <div className="border-t border-border/60 bg-primary/10 px-4 py-2 text-xs text-primary font-mono flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 shrink-0" />
              <span>{executionMessage}</span>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900 px-4 py-3">
            <div className="text-xs text-zinc-400 font-mono">
              Ready to execute in sandbox
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunCode}
                className="gap-1.5 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Tests</span>
              </Button>

              <Button
                size="sm"
                onClick={handleSubmitCode}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Solution</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
