import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Terminal,
  Flame,
  Search,
  CheckCircle2,
  ArrowRight,
  Code2,
  Percent,
  Play,
} from 'lucide-react';
import { problemApi } from '@/lib/problem-api';
import type { Difficulty, ProblemSummary } from '@/types/problem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const difficultyBadgeVariant: Record<Difficulty, 'easy' | 'medium' | 'hard'> = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const ProblemListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');

  // Debounce search input by 350ms to prevent query spam
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Daily Challenge Query
  const { data: dailyProblem } = useQuery({
    queryKey: ['problem', 'daily'],
    queryFn: problemApi.getDailyProblem,
  });

  // Problem Catalog Query
  const { data: problemsPage, isLoading, error } = useQuery({
    queryKey: ['problems', selectedDifficulty, debouncedSearch],
    queryFn: () =>
      problemApi.getProblems({
        difficulty: selectedDifficulty !== 'ALL' ? (selectedDifficulty as Difficulty) : undefined,
        search: debouncedSearch || undefined,
        size: 50,
      }),
  });

  const rawProblems = problemsPage?.content || [];
  const problems = rawProblems.filter((p: ProblemSummary) => {
    if (statusFilter === 'SOLVED') return p.solvedByUser;
    if (statusFilter === 'UNSOLVED') return !p.solvedByUser;
    return true;
  });

  // Format daily problem description preview by stripping raw markdown symbols
  const cleanDailyDescription = dailyProblem?.description
    ? dailyProblem.description.replace(/[#*`_]/g, '').trim()
    : '';

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 py-10 space-y-10">
      {/* 1. Header Banner */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-xs text-muted-foreground">
          <Terminal className="h-3.5 w-3.5 text-foreground" />
          <span>Algorithmic Problem Archive</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Coding Challenges
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Solve algorithmic exercises directly in Java 21 LTS with Monaco IDE. Verified against hidden boundary suites with sub-second execution watchdogs.
        </p>
      </div>

      {/* 2. Problem of the Day Spotlight */}
      {dailyProblem && (
        <div className="rounded-lg border border-amber-500/30 bg-surface p-6 sm:p-7 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <Flame className="h-3.5 w-3.5 fill-current" />
                  <span>Problem of the Day</span>
                </div>
                <Badge variant={difficultyBadgeVariant[dailyProblem.difficulty]}>
                  {dailyProblem.difficulty}
                </Badge>
              </div>

              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {dailyProblem.title}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed font-sans">
                {cleanDailyDescription}
              </p>
            </div>

            <Link to={`/problems/${dailyProblem.slug}`} className="shrink-0">
              <Button className="h-9 px-4 text-xs font-semibold bg-amber-400 text-zinc-950 hover:bg-amber-300 gap-2 font-mono">
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Solve Daily Problem</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Controls: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        {/* Difficulty & Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Difficulty options */}
          <div className="flex items-center gap-1">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => {
              const isSelected = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-surface-raised text-foreground border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Status options */}
          <div className="flex items-center gap-1">
            {(['ALL', 'SOLVED', 'UNSOLVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  statusFilter === st
                    ? 'text-foreground font-semibold bg-surface border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            className="pl-8 h-8 text-xs bg-surface border-border focus-visible:ring-1 focus-visible:ring-ring"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Problems Table */}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-surface p-6 space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-border/60 rounded" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center text-xs font-mono text-destructive">
          Failed to load coding problems. Please check backend connection.
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Code2 className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <h3 className="text-base font-medium text-foreground">No problems found</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search criteria or difficulty filters.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-border bg-surface-raised font-mono text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 pl-5 pr-3 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Topic Track</th>
                  <th className="py-3 px-4">Acceptance</th>
                  <th className="py-3 pl-4 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {problems.map((problem: ProblemSummary) => (
                  <tr
                    key={problem.id}
                    className="hover:bg-surface-raised/60 transition-colors group"
                  >
                    {/* Solved Status */}
                    <td className="py-3.5 pl-5 pr-3 text-center">
                      {problem.solvedByUser ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-border mx-auto" />
                      )}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 font-medium">
                      <Link
                        to={`/problems/${problem.slug}`}
                        className="text-foreground group-hover:text-foreground/90 transition-colors inline-flex items-center gap-2"
                      >
                        <span className="font-medium text-sm">{problem.title}</span>
                        {problem.isDailyChallenge && (
                          <span title="Daily Challenge">
                            <Flame className="h-3.5 w-3.5 text-amber-400 fill-current" />
                          </span>
                        )}
                      </Link>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-4">
                      <Badge variant={difficultyBadgeVariant[problem.difficulty]}>
                        {problem.difficulty}
                      </Badge>
                    </td>

                    {/* Topic */}
                    <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">
                      {problem.topicTitle || 'Core Syntax'}
                    </td>

                    {/* Acceptance */}
                    <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <Percent className="h-3 w-3 text-muted-foreground" />
                        <span>{problem.acceptanceRate}%</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 pl-4 pr-5 text-right">
                      <Link to={`/problems/${problem.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2.5 text-xs font-mono gap-1 text-muted-foreground hover:text-foreground group-hover:bg-surface-raised"
                        >
                          <span>Solve</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
