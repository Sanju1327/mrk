import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Flame,
  Play,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Terminal,
  Clock,
  Trophy,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { courseApi } from '@/lib/course-api';
import { problemApi } from '@/lib/problem-api';
import type { Enrollment } from '@/types/course';
import type { ProblemSummary } from '@/types/problem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Queries
  const { data: myEnrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: courseApi.getMyEnrollments,
  });

  const { data: dailyProblem } = useQuery({
    queryKey: ['problem', 'daily'],
    queryFn: problemApi.getDailyProblem,
  });

  const { data: problemsPage } = useQuery({
    queryKey: ['problems', 'dashboard-preview'],
    queryFn: () => problemApi.getProblems({ size: 4 }),
  });

  const activeEnrollment: Enrollment | undefined = myEnrollments[0];
  const recentProblems: ProblemSummary[] = problemsPage?.content || [];

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 py-10 space-y-10">
      {/* 1. Header Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Learning Command Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono">
            Learner: <span className="text-foreground">{user?.fullName || user?.username}</span> &bull; Status: Active (Java 21 Track)
          </p>
        </div>

        {/* Live Daily Streak Pill */}
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-surface px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500/10 text-amber-400">
            <Flame className="h-4 w-4 fill-current" />
          </div>
          <div className="space-y-0.5 font-mono">
            <div className="text-xs font-semibold text-foreground">3 Days Active</div>
            <div className="text-[10px] text-muted-foreground">Streak multiplier: 1.2x</div>
          </div>
        </div>
      </div>

      {/* 2. Top Tier: Continue Learning (Primary) & Problem of the Day (Spotlight) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Continue Learning Hero (7 cols) */}
        <div className="lg:col-span-7 rounded-lg border border-border bg-surface p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Active Curriculum
                </span>
              </div>
              {activeEnrollment && (
                <span className="font-mono text-xs text-foreground font-medium">
                  {Math.round(activeEnrollment.progressPercentage)}% complete
                </span>
              )}
            </div>

            {enrollmentsLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-7 w-3/4 bg-border rounded" />
                <div className="h-4 w-1/2 bg-border rounded" />
              </div>
            ) : activeEnrollment ? (
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                  {activeEnrollment.courseTitle}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Resume where you left off. Continue hands-on exercises in the JVM memory model and syntax fundamentals.
                </p>

                {/* Progress bar */}
                <div className="space-y-2 pt-2">
                  <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, activeEnrollment.progressPercentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                    <span>Target: Lesson 03 (Variables & Primitives)</span>
                    <span>Status: In Progress</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <h2 className="text-lg font-semibold text-foreground">No Active Courses Yet</h2>
                <p className="text-xs text-muted-foreground">
                  You haven&apos;t enrolled in a learning track. Explore our curriculum to begin your structured journey.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            {activeEnrollment ? (
              <Link to={`/courses/${activeEnrollment.courseSlug}`}>
                <Button className="h-9 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Resume Curriculum</span>
                </Button>
              </Link>
            ) : (
              <Link to="/courses">
                <Button className="h-9 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Browse Tracks</span>
                </Button>
              </Link>
            )}

            <Link
              to="/courses"
              className="text-xs font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span>All tracks</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Problem of the Day (5 cols) */}
        <div className="lg:col-span-5 rounded-lg border border-amber-500/30 bg-surface p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Flame className="h-3.5 w-3.5 fill-current" />
                <span>Daily Challenge</span>
              </div>
              {dailyProblem && (
                <Badge variant={dailyProblem.difficulty === 'EASY' ? 'easy' : 'medium'}>
                  {dailyProblem.difficulty}
                </Badge>
              )}
            </div>

            {dailyProblem ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{dailyProblem.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {dailyProblem.description?.replace(/[#*`_]/g, '')}
                </p>

                <div className="flex items-center gap-3 pt-2 font-mono text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{dailyProblem.timeLimitMs}ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>{dailyProblem.acceptanceRate}% acceptance</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-xs text-muted-foreground">Loading challenge...</div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            {dailyProblem && (
              <Link to={`/problems/${dailyProblem.slug}`} className="block">
                <Button className="w-full h-9 text-xs font-semibold bg-amber-400 text-zinc-950 hover:bg-amber-300 gap-2 font-mono">
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Launch Workspace</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 3. Telemetry Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-surface p-4 space-y-1.5 font-mono">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Enrolled Tracks</span>
            <BookOpen className="h-3.5 w-3.5 text-foreground" />
          </div>
          <div className="text-2xl font-semibold text-foreground">{myEnrollments.length}</div>
          <div className="text-[10px] text-muted-foreground">Active learning pathways</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 space-y-1.5 font-mono">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Problems Solved</span>
            <Terminal className="h-3.5 w-3.5 text-foreground" />
          </div>
          <div className="text-2xl font-semibold text-foreground">3 / 24</div>
          <div className="text-[10px] text-emerald-400">12.5% problem completion</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 space-y-1.5 font-mono">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Weekly Streak</span>
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-current" />
          </div>
          <div className="text-2xl font-semibold text-amber-400">3 Days</div>
          <div className="text-[10px] text-muted-foreground">Target: 7 continuous days</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 space-y-1.5 font-mono">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Mastery Badges</span>
            <Trophy className="h-3.5 w-3.5 text-foreground" />
          </div>
          <div className="text-2xl font-semibold text-foreground">2 Unlocked</div>
          <div className="text-[10px] text-muted-foreground">Next: Algorithmist I</div>
        </div>
      </div>

      {/* 4. Bottom Grid: Recommended Challenges & Achievement Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recommended Coding Challenges Table (7 cols) */}
        <div className="lg:col-span-7 rounded-lg border border-border bg-surface overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-foreground">Recommended Challenges</h3>
              <p className="text-xs text-muted-foreground font-mono">Targeted for your current skill progression</p>
            </div>
            <Link to="/problems">
              <Button variant="ghost" size="sm" className="h-7 text-xs font-mono text-muted-foreground hover:text-foreground">
                View catalog
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {recentProblems.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-surface-raised transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  {p.solvedByUser ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-border shrink-0 ml-0.5" />
                  )}
                  <Link
                    to={`/problems/${p.slug}`}
                    className="font-medium text-foreground hover:text-foreground/90 transition-colors truncate max-w-xs"
                  >
                    {p.title}
                  </Link>
                </div>

                <div className="flex items-center gap-4 font-mono text-muted-foreground">
                  <Badge
                    variant={
                      p.difficulty === 'EASY'
                        ? 'easy'
                        : p.difficulty === 'MEDIUM'
                        ? 'medium'
                        : 'hard'
                    }
                  >
                    {p.difficulty}
                  </Badge>
                  <Link to={`/problems/${p.slug}`}>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1 font-mono">
                      <span>Solve</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones & Badges (5 cols) */}
        <div className="lg:col-span-5 rounded-lg border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground">Engineering Milestones</h3>
            <Link to="/progress" className="text-xs font-mono text-muted-foreground hover:text-foreground">
              All badges
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded border border-border/80 bg-background/50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Award className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-foreground">First Acceptance</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Successfully compiled and verified a solution in the isolated execution sandbox.
                </p>
                <div className="font-mono text-[10px] text-emerald-400">UNLOCKED</div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded border border-border/80 bg-background/50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-foreground">Consistency Engine</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Maintained an unbroken 3-day daily problem solving streak.
                </p>
                <div className="font-mono text-[10px] text-amber-400">UNLOCKED</div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded border border-border/40 bg-background/20 p-3 opacity-60">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface border border-border text-muted-foreground">
                <Layers className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-foreground">Virtual Threads Master</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Complete all concurrency lessons in the Advanced Java Architecture curriculum.
                </p>
                <div className="font-mono text-[10px] text-muted-foreground">LOCKED (0/4 lessons)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
