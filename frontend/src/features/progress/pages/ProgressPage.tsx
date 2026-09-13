import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Award,
  Lock,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const ProgressPage: React.FC = () => {
  const [activeBadgeCategory, setActiveBadgeCategory] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');

  // Simulated 365-day heatmap generator (52 weeks x 7 days)
  const heatmapData = React.useMemo(() => {
    const weeks: { date: string; level: number }[][] = [];
    for (let w = 0; w < 52; w++) {
      const days: { date: string; level: number }[] = [];
      for (let d = 0; d < 7; d++) {
        // High density in last 4 weeks, occasional sporadic activity elsewhere
        const isRecent = w >= 48;
        let lvl = 0;
        if (isRecent && (d === 1 || d === 2 || d === 3 || d === 5)) {
          lvl = Math.floor(Math.random() * 3) + 1;
        } else if (Math.random() > 0.8) {
          lvl = Math.floor(Math.random() * 2) + 1;
        }
        days.push({ date: `2026-W${w}-D${d}`, level: lvl });
      }
      weeks.push(days);
    }
    return weeks;
  }, []);

  const achievements = [
    {
      id: 'FIRST_BYTE',
      title: 'First Acceptance',
      category: 'MASTERY',
      description: 'Compile and pass all test cases on your first algorithmic challenge.',
      status: 'UNLOCKED',
      unlockedAt: 'Sep 12, 2026',
      progress: '100%',
    },
    {
      id: 'STREAK_3',
      title: 'Consistency Engine I',
      category: 'CONSISTENCY',
      description: 'Solve a problem or complete a lesson for 3 consecutive days.',
      status: 'UNLOCKED',
      unlockedAt: 'Sep 13, 2026',
      progress: '100%',
    },
    {
      id: 'JAVA_FOUNDATIONS',
      title: 'Syntax & Memory Specialist',
      category: 'CURRICULUM',
      description: 'Complete all topics in the Java Foundations & OOP track.',
      status: 'LOCKED',
      unlockedAt: null,
      progress: '65%',
    },
    {
      id: 'ALGORITHMIST',
      title: 'Algorithmist I',
      category: 'ALGORITHMS',
      description: 'Solve 10 Easy-level coding challenges.',
      status: 'LOCKED',
      unlockedAt: null,
      progress: '3/10',
    },
    {
      id: 'VIRTUAL_THREADS',
      title: 'Concurrency Architect',
      category: 'MASTERY',
      description: 'Complete the Project Loom and high-throughput thread pool evaluations.',
      status: 'LOCKED',
      unlockedAt: null,
      progress: '0/4',
    },
    {
      id: 'SUB_SECOND',
      title: 'Zero Latency',
      category: 'ALGORITHMS',
      description: 'Submit a solution that finishes execution in under 20 milliseconds.',
      status: 'LOCKED',
      unlockedAt: null,
      progress: 'Best: 34ms',
    },
  ];

  const filteredAchievements = achievements.filter((a) => {
    if (activeBadgeCategory === 'UNLOCKED') return a.status === 'UNLOCKED';
    if (activeBadgeCategory === 'LOCKED') return a.status === 'LOCKED';
    return true;
  });

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 py-10 space-y-12">
      {/* 1. Header Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-foreground" />
            <span>Learner Telemetry & Milestones</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Engineering Progression
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track sandbox verification history, activity density, and verifiable achievement records.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="text-xs font-mono">
              Dashboard
            </Button>
          </Link>
          <Link to="/problems">
            <Button size="sm" className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
              Practice Next Problem
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-surface p-5 space-y-1.5 font-mono">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Continuous Streak
          </span>
          <div className="text-2xl font-semibold text-amber-400 flex items-center gap-2">
            <Flame className="h-5 w-5 fill-current" />
            <span>3 Days</span>
          </div>
          <div className="text-[10px] text-muted-foreground">Personal best: 3 days</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 space-y-1.5 font-mono">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Total Verifications
          </span>
          <div className="text-2xl font-semibold text-foreground">18</div>
          <div className="text-[10px] text-emerald-400">83.3% test suite pass rate</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 space-y-1.5 font-mono">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Curriculum Lessons
          </span>
          <div className="text-2xl font-semibold text-foreground">2 / 12</div>
          <div className="text-[10px] text-muted-foreground">1 enrolled track active</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 space-y-1.5 font-mono">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Unlocked Milestones
          </span>
          <div className="text-2xl font-semibold text-foreground">2 / 6</div>
          <div className="text-[10px] text-muted-foreground">33% achievement completion</div>
        </div>
      </div>

      {/* 3. 52-Week Activity Heatmap */}
      <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <Calendar className="h-3.5 w-3.5 text-foreground" />
            <span className="font-semibold text-foreground">52-Week Submission Heatmap</span>
            <span className="text-muted-foreground">&bull; 18 executions in 2026</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-border/40" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-950 border border-emerald-800" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-700" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pt-2">
          <div className="flex gap-1 min-w-[700px]">
            {heatmapData.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => {
                  let bgClass = 'bg-border/30';
                  if (day.level === 1) bgClass = 'bg-emerald-950 border border-emerald-900';
                  if (day.level === 2) bgClass = 'bg-emerald-700';
                  if (day.level === 3) bgClass = 'bg-emerald-400';

                  return (
                    <div
                      key={dIdx}
                      className={`h-2.5 w-2.5 rounded-sm ${bgClass} transition-colors`}
                      title={`${day.date}: ${day.level} actions`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Solved Problems by Difficulty */}
      <div className="rounded-lg border border-border bg-surface p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-semibold text-foreground">Algorithmic Problem Breakdown</h2>
          <span className="font-mono text-xs text-muted-foreground">3 / 24 Problems Solved</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Easy */}
          <div className="rounded border border-border/80 bg-background/50 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Badge variant="easy">EASY</Badge>
              <span className="font-mono text-xs text-foreground font-semibold">2 / 8</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '25%' }} />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">25% solved</div>
          </div>

          {/* Medium */}
          <div className="rounded border border-border/80 bg-background/50 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Badge variant="medium">MEDIUM</Badge>
              <span className="font-mono text-xs text-foreground font-semibold">1 / 10</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: '10%' }} />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">10% solved</div>
          </div>

          {/* Hard */}
          <div className="rounded border border-border/80 bg-background/50 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Badge variant="hard">HARD</Badge>
              <span className="font-mono text-xs text-foreground font-semibold">0 / 6</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full" style={{ width: '0%' }} />
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">0% solved</div>
          </div>
        </div>
      </div>

      {/* 5. Editorial Achievements Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Technical Achievements & Milestones
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              Earned through verifiable code executions and curriculum completions.
            </p>
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-1 font-mono text-xs">
            {(['ALL', 'UNLOCKED', 'LOCKED'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveBadgeCategory(cat)}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeBadgeCategory === cat
                    ? 'bg-surface-raised text-foreground font-semibold border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((item) => {
            const isUnlocked = item.status === 'UNLOCKED';
            return (
              <div
                key={item.id}
                className={`rounded-lg border p-5 flex flex-col justify-between space-y-4 transition-colors ${
                  isUnlocked
                    ? 'border-border bg-surface'
                    : 'border-border/60 bg-surface/50 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded border ${
                        isUnlocked
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                    >
                      {isUnlocked ? <Award className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                    </div>
                    <span
                      className={`font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                        isUnlocked
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-background text-muted-foreground border border-border'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/80 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                  <span>{isUnlocked ? `Earned: ${item.unlockedAt}` : `Progress: ${item.progress}`}</span>
                  <Layers className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
