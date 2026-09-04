import React, { useState } from 'react';
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
} from 'lucide-react';
import { problemApi } from '@/lib/problem-api';
import type { Difficulty, ProblemSummary } from '@/types/problem';
import { Card } from '@/components/ui/card';
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  // Daily Challenge Query
  const { data: dailyProblem } = useQuery({
    queryKey: ['problem', 'daily'],
    queryFn: problemApi.getDailyProblem,
  });

  // Problem Catalog Query
  const { data: problemsPage, isLoading, error } = useQuery({
    queryKey: ['problems', selectedDifficulty, searchTerm],
    queryFn: () =>
      problemApi.getProblems({
        difficulty: selectedDifficulty !== 'ALL' ? (selectedDifficulty as Difficulty) : undefined,
        search: searchTerm.trim() || undefined,
        size: 50,
      }),
  });

  const problems = problemsPage?.content || [];

  return (
    <div className="container max-w-screen-2xl px-4 py-10 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
          <Terminal className="h-3.5 w-3.5" />
          <span>Java 21 Problem Archive</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Algorithmic Coding Challenges
        </h1>
        <p className="text-muted-foreground text-base">
          Solve real-world problems in an isolated Java sandbox. Test your solutions
          against comprehensive test suites with sub-second execution watchdogs.
        </p>
      </div>

      {/* Problem of the Day Spotlight */}
      {dailyProblem && (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-background p-6 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Flame className="h-4 w-4 fill-current animate-pulse" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Problem of the Day
                </span>
                <Badge variant={difficultyBadgeVariant[dailyProblem.difficulty]}>
                  {dailyProblem.difficulty}
                </Badge>
              </div>

              <h2 className="text-2xl font-bold tracking-tight">
                {dailyProblem.title}
              </h2>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {dailyProblem.description}
              </p>
            </div>

            <Link to={`/problems/${dailyProblem.slug}`} className="shrink-0">
              <Button className="gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-md shadow-amber-500/20">
                <Terminal className="h-4 w-4" />
                <span>Solve Today&apos;s Challenge</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems by title..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <Button
              key={diff}
              variant={selectedDifficulty === diff ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty(diff)}
              className="text-xs capitalize"
            >
              {diff.toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Problems Table / List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-16 p-4 animate-pulse bg-card/40 border-border/40" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
          Failed to load coding problems. Please check your backend connection.
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Code2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No problems found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search criteria or difficulty filters.
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden border-border/60 bg-card/40 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="py-3.5 pl-6 pr-3 w-12">Status</th>
                  <th className="py-3.5 px-3">Title</th>
                  <th className="py-3.5 px-3">Difficulty</th>
                  <th className="py-3.5 px-3">Topic</th>
                  <th className="py-3.5 px-3">Acceptance</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {problems.map((problem: ProblemSummary) => (
                  <tr
                    key={problem.id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="py-4 pl-6 pr-3">
                      {problem.solvedByUser ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </td>

                    <td className="py-4 px-3 font-medium">
                      <Link
                        to={`/problems/${problem.slug}`}
                        className="text-foreground group-hover:text-primary transition-colors inline-flex items-center gap-2"
                      >
                        <span>{problem.title}</span>
                        {problem.isDailyChallenge && (
                          <Flame className="h-3.5 w-3.5 text-amber-400 fill-current" />
                        )}
                      </Link>
                    </td>

                    <td className="py-4 px-3">
                      <Badge
                        variant={difficultyBadgeVariant[problem.difficulty]}
                        className="text-xs"
                      >
                        {problem.difficulty}
                      </Badge>
                    </td>

                    <td className="py-4 px-3 text-muted-foreground text-xs">
                      {problem.topicTitle || 'General'}
                    </td>

                    <td className="py-4 px-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Percent className="h-3 w-3 text-primary" />
                        <span>{problem.acceptanceRate}%</span>
                      </div>
                    </td>

                    <td className="py-4 pl-3 pr-6 text-right">
                      <Link to={`/problems/${problem.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        >
                          <span>Solve</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
