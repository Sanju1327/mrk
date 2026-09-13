import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Terminal,
  ArrowRight,
  Flame,
  CheckCircle2,
  BookOpen,
  Cpu,
  ShieldCheck,
  Zap,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const LandingPage: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'solution' | 'testrunner' | 'telemetry'>('solution');

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* 1. Hero Section */}
      <section className="relative pt-16 md:pt-24 border-b border-border/60 pb-20">
        <div className="container max-w-screen-2xl px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Mascot & Platform Tag */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary/30 to-cyan-500/30 blur-xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <img
                  src="/favicon.png"
                  alt="CodeCraft Robot Mascot"
                  className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300 ring-1 ring-primary/20"
                />
              </div>
              <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1 font-mono text-xs text-muted-foreground">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Java 21 LTS Platform &bull; Sub-Second Isolated Execution</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Engineered for real software mastery.
            </h1>

            {/* Subhead */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              Solve rigorous algorithmic challenges in Monaco IDE, evaluate code in an unprivileged execution sandbox, and master production Java architecture with hands-on curricula.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/courses">
                <Button size="lg" className="h-10 px-5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <span>Explore Curriculum</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/problems">
                <Button size="lg" variant="outline" className="h-10 px-5 text-sm font-medium border-border hover:bg-surface-raised gap-2">
                  <Terminal className="h-4 w-4 text-muted-foreground" />
                  <span>Browse Problems</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* 2. Interactive Terminal & Workspace Showcase */}
          <div className="mt-16 max-w-5xl mx-auto rounded-lg border border-border bg-surface shadow-2xl overflow-hidden">
            {/* Editor Window Header */}
            <div className="flex items-center justify-between border-b border-border bg-surface-raised px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                </div>
                <div className="h-4 w-px bg-border" />
                {/* File Tabs */}
                <div className="flex items-center gap-1 font-mono text-xs">
                  <button
                    onClick={() => setActiveCodeTab('solution')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeCodeTab === 'solution'
                        ? 'bg-surface text-foreground font-medium border border-border/80'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Solution.java
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('testrunner')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeCodeTab === 'testrunner'
                        ? 'bg-surface text-foreground font-medium border border-border/80'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    TestRunner.java
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('telemetry')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeCodeTab === 'telemetry'
                        ? 'bg-surface text-foreground font-medium border border-border/80'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    benchmarks.json
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">12/12 Test Cases Passed</span>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto bg-[#0b0c0e]">
              {activeCodeTab === 'solution' && (
                <pre className="text-muted-foreground">
                  <span className="text-zinc-500">01</span>  <span className="text-rose-400">package</span> com.codecraft.solution;{'\n'}
                  <span className="text-zinc-500">02</span>  {'\n'}
                  <span className="text-zinc-500">03</span>  <span className="text-rose-400">import</span> java.util.HashMap;{'\n'}
                  <span className="text-zinc-500">04</span>  <span className="text-rose-400">import</span> java.util.Map;{'\n'}
                  <span className="text-zinc-500">05</span>  {'\n'}
                  <span className="text-zinc-500">06</span>  <span className="text-blue-400">public final class</span> <span className="text-amber-300">Solution</span> {'{'}{'\n'}
                  <span className="text-zinc-500">07</span>      <span className="text-blue-400">public int</span>[] <span className="text-emerald-400">twoSum</span>(<span className="text-blue-400">int</span>[] nums, <span className="text-blue-400">int</span> target) {'{'}{'\n'}
                  <span className="text-zinc-500">08</span>          <span className="text-blue-400">final</span> Map&lt;<span className="text-amber-300">Integer</span>, <span className="text-amber-300">Integer</span>&gt; indexMap = <span className="text-rose-400">new</span> HashMap&lt;&gt;(nums.length);{'\n'}
                  <span className="text-zinc-500">09</span>          <span className="text-rose-400">for</span> (<span className="text-blue-400">int</span> i = 0; i &lt; nums.length; i++) {'{'}{'\n'}
                  <span className="text-zinc-500">10</span>              <span className="text-blue-400">int</span> complement = target - nums[i];{'\n'}
                  <span className="text-zinc-500">11</span>              <span className="text-rose-400">if</span> (indexMap.containsKey(complement)) {'{'}{'\n'}
                  <span className="text-zinc-500">12</span>                  <span className="text-rose-400">return new int</span>[] {'{'} indexMap.get(complement), i {'}'};{'\n'}
                  <span className="text-zinc-500">13</span>              {'}'}{'\n'}
                  <span className="text-zinc-500">14</span>              indexMap.put(nums[i], i);{'\n'}
                  <span className="text-zinc-500">15</span>          {'}'}{'\n'}
                  <span className="text-zinc-500">16</span>          <span className="text-rose-400">throw new</span> <span className="text-amber-300">IllegalArgumentException</span>(<span className="text-emerald-300">"No valid pair found"</span>);{'\n'}
                  <span className="text-zinc-500">17</span>      {'}'}{'\n'}
                  <span className="text-zinc-500">18</span>  {'}'}
                </pre>
              )}

              {activeCodeTab === 'testrunner' && (
                <pre className="text-muted-foreground">
                  <span className="text-zinc-500">01</span>  <span className="text-zinc-600">// Runner configuration: sandbox runtime watchdog: 2000ms</span>{'\n'}
                  <span className="text-zinc-500">02</span>  [SandboxRunner] Compiling Solution.java with javac 21.0.2...{'\n'}
                  <span className="text-zinc-500">03</span>  [SandboxRunner] Compilation succeeded (0 errors, 0 warnings){'\n'}
                  <span className="text-zinc-500">04</span>  [Test Suite] Running 12 test assertions (4 sample, 8 hidden)...{'\n'}
                  <span className="text-zinc-500">05</span>  &bull; Case 01: input=[2,7,11,15], target=9 &rarr; expected=[0,1] &bull; <span className="text-emerald-400">PASSED (2ms)</span>{'\n'}
                  <span className="text-zinc-500">06</span>  &bull; Case 02: input=[3,2,4], target=6 &rarr; expected=[1,2] &bull; <span className="text-emerald-400">PASSED (1ms)</span>{'\n'}
                  <span className="text-zinc-500">07</span>  &bull; Case 03: input=[3,3], target=6 &rarr; expected=[0,1] &bull; <span className="text-emerald-400">PASSED (1ms)</span>{'\n'}
                  <span className="text-zinc-500">08</span>  &bull; Cases 04-12 (Hidden Boundary Suites) &bull; <span className="text-emerald-400">ALL PASSED</span>{'\n'}
                  <span className="text-zinc-500">09</span>  {'\n'}
                  <span className="text-zinc-500">10</span>  <span className="text-emerald-400">Result: ACCEPTED &bull; Runtime: 38ms &bull; Memory: 14.4 MB &bull; Telemetry saved</span>
                </pre>
              )}

              {activeCodeTab === 'telemetry' && (
                <pre className="text-muted-foreground">
                  {`{
  "submissionId": 10428,
  "language": "JAVA_21",
  "status": "ACCEPTED",
  "metrics": {
    "executionTimeMs": 38,
    "memoryUsedKb": 14745,
    "cpuCyclesEstimate": 182049,
    "sandboxJail": "UNPRIVILEGED_DOCKER"
  },
  "score": {
    "runtimePercentile": 96.4,
    "memoryPercentile": 89.2
  }
}`}
                </pre>
              )}
            </div>

            {/* Terminal Status Bar */}
            <div className="flex flex-wrap items-center justify-between border-t border-border bg-surface-raised px-4 py-2 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Runtime: <strong className="text-foreground font-medium">38 ms</strong></span>
                <span>Peak Heap: <strong className="text-foreground font-medium">14.4 MB</strong></span>
                <span className="hidden sm:inline">Isolation: <strong className="text-foreground font-medium">Cgroup2/ReadOnly</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>JDK 21 LTS HotSpot</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem of the Day & Live Challenge Spotlight */}
      <section className="container max-w-screen-2xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Daily Spotlight */}
          <div className="lg:col-span-5 rounded-lg border border-amber-500/30 bg-surface p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Daily Challenge
                  </span>
                </div>
                <Badge variant="easy">EASY</Badge>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">Two Sum</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Given an array of integers <code className="font-mono text-xs bg-surface-raised px-1 py-0.5 rounded text-foreground">nums</code> and an integer <code className="font-mono text-xs bg-surface-raised px-1 py-0.5 rounded text-foreground">target</code>, return indices of the two numbers such that they add up to the target.
                </p>
              </div>

              {/* Constraints box */}
              <div className="rounded border border-border bg-background p-3 font-mono text-xs text-muted-foreground space-y-1">
                <div className="text-foreground font-medium">Constraints:</div>
                <div>&bull; 2 &le; nums.length &le; 10⁴</div>
                <div>&bull; -10⁹ &le; nums[i], target &le; 10⁹</div>
                <div>&bull; Exactly one valid answer exists</div>
              </div>
            </div>

            <Link to="/problems/two-sum" className="block">
              <Button className="w-full h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Launch Workspace & Solve</span>
              </Button>
            </Link>
          </div>

          {/* Curriculum Tracks Feature Block */}
          <div className="lg:col-span-7 rounded-lg border border-border bg-surface p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                <BookOpen className="h-4 w-4 text-foreground" />
                <span>Curated Learning Tracks</span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Java Foundations & Systems Architecture
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Learn modern Java from scratch: language fundamentals, JVM memory model, memory leaks, high-performance collections, and concurrent programming with Virtual Threads (Project Loom).
              </p>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded border border-border bg-background p-3.5 space-y-1">
                <span className="font-mono text-[10px] text-muted-foreground">MODULE 01</span>
                <div className="text-xs font-semibold text-foreground">Java Fundamentals</div>
                <p className="text-[11px] text-muted-foreground">Primitives, control flow, methods, and OOP principles.</p>
              </div>
              <div className="rounded border border-border bg-background p-3.5 space-y-1">
                <span className="font-mono text-[10px] text-muted-foreground">MODULE 02</span>
                <div className="text-xs font-semibold text-foreground">Memory & JVM</div>
                <p className="text-[11px] text-muted-foreground">Stack, heap, GC mechanics, and escape analysis.</p>
              </div>
              <div className="rounded border border-border bg-background p-3.5 space-y-1">
                <span className="font-mono text-[10px] text-muted-foreground">MODULE 03</span>
                <div className="text-xs font-semibold text-foreground">Collections & Algorithmic Design</div>
                <p className="text-[11px] text-muted-foreground">Maps, sets, trees, graphs, and algorithmic complexity.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs font-mono text-muted-foreground">3 Modules &bull; 12 Lessons &bull; Interactive Quizzes</span>
              <Link to="/courses">
                <Button variant="ghost" size="sm" className="h-8 text-xs font-medium gap-1 text-foreground">
                  <span>View All Courses</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Engineering Architecture Principles (Not generic SaaS cards) */}
      <section className="container max-w-screen-2xl px-4 sm:px-6">
        <div className="border-t border-border pt-16 space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Technical Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Built like a real development environment.
            </h2>
            <p className="text-sm text-muted-foreground">
              No simulated code execution or fake evaluations. Every test assertion and run runs through an isolated Java compiler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 rounded-lg border border-border bg-surface p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-surface-raised text-foreground">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Process Isolation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Code compiles and executes within ephemeral containers restricted by CPU caps, 256MB memory ceilings, and read-only filesystems.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-surface p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-surface-raised text-foreground">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Sub-Second Watchdogs</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Execution timers enforce 2000ms ceilings with instant SIGKILL for infinite loops and fork bombs, giving learners immediate feedback.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-surface p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-surface-raised text-foreground">
                <Cpu className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Real Telemetry Tracking</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every solved challenge records execution time, memory benchmarks, and persistent activity streaks directly into the MySQL database.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
