import React from 'react';
import { Link } from 'react-router-dom';
import {
  Terminal,
  Trophy,
  ArrowRight,
  Flame,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[450px] w-[700px] rounded-full bg-blue-600/10 blur-[130px]" />
          <div className="h-[300px] w-[500px] rounded-full bg-indigo-600/10 blur-[110px]" />
        </div>

        <div className="container max-w-screen-2xl px-4 flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>CodeCraft 1.0 — Enterprise Java Full-Stack Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl max-w-4xl">
            Master Code with{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Real Sandbox Execution
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Learn computer science concepts, solve rigorous Java coding problems in Monaco IDE, 
            evaluate code in an isolated sandbox, and track your engineering mastery.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 h-11 px-6 shadow-lg shadow-primary/20">
                <span>Start Learning Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/problems">
              <Button size="lg" variant="outline" className="gap-2 h-11 px-6">
                <Terminal className="h-4 w-4" />
                <span>Explore Challenges</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem of the Day Spotlight & Code Preview */}
      <section className="container max-w-screen-2xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Problem of the Day Card */}
          <Card className="lg:col-span-5 border-border/80 bg-gradient-to-b from-card to-background flex flex-col justify-between shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Problem of the Day</span>
                </div>
                <Badge variant="easy">EASY</Badge>
              </div>
              <CardTitle className="text-2xl pt-2">Two Sum</CardTitle>
              <CardDescription className="text-sm line-clamp-3">
                Given an array of integers <code className="text-xs bg-muted px-1 py-0.5 rounded">nums</code> and an integer <code className="text-xs bg-muted px-1 py-0.5 rounded">target</code>, return indices of the two numbers such that they add up to target.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/60 p-3 text-xs font-mono text-muted-foreground space-y-1">
                <div className="text-foreground font-semibold">Constraints:</div>
                <div>• 2 &le; nums.length &le; 10⁴</div>
                <div>• -10⁹ &le; nums[i], target &le; 10⁹</div>
                <div>• Only one valid answer exists.</div>
              </div>
              <Link to="/problems" className="block w-full">
                <Button className="w-full gap-2 bg-primary/90 hover:bg-primary">
                  <Terminal className="h-4 w-4" />
                  <span>Solve Daily Challenge</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Interactive Code Preview Window */}
          <div className="lg:col-span-7 rounded-xl border border-border bg-black/70 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-muted-foreground">Solution.java (Java 21 LTS)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Compiled & Evaluated</span>
                </span>
              </div>
            </div>

            <div className="p-4 font-mono text-xs text-muted-foreground/90 leading-relaxed overflow-x-auto bg-black/40 flex-1">
              <pre>
                <span className="text-purple-400">import</span> java.util.HashMap;{'\n'}
                <span className="text-purple-400">import</span> java.util.Map;{'\n\n'}
                <span className="text-blue-400">public class</span> <span className="text-yellow-300">Solution</span> {'{'}{'\n'}
                {'    '}<span className="text-blue-400">public int</span>[] <span className="text-green-400">twoSum</span>(<span className="text-blue-400">int</span>[] nums, <span className="text-blue-400">int</span> target) {'{'}{'\n'}
                {'        '}Map&lt;<span className="text-yellow-300">Integer</span>, <span className="text-yellow-300">Integer</span>&gt; map = <span className="text-purple-400">new</span> HashMap&lt;&gt;();{'\n'}
                {'        '}<span className="text-purple-400">for</span> (<span className="text-blue-400">int</span> i = 0; i &lt; nums.length; i++) {'{'}{'\n'}
                {'            '}<span className="text-blue-400">int</span> complement = target - nums[i];{'\n'}
                {'            '}<span className="text-purple-400">if</span> (map.containsKey(complement)) {'{'}{'\n'}
                {'                '}<span className="text-purple-400">return new int</span>[] {'{'} map.get(complement), i {'}'};{'\n'}
                {'            '}{'}'}{'\n'}
                {'            '}map.put(nums[i], i);{'\n'}
                {'        '}{'}'}{'\n'}
                {'        '}<span className="text-purple-400">return new int</span>[] {'{}'};{'\n'}
                {'    '}{'}'}{'\n'}
                {'}'}
              </pre>
            </div>

            <div className="border-t border-border/60 bg-muted/20 px-4 py-2 flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Execution: <span className="text-emerald-400">48ms</span></span>
              <span className="text-muted-foreground">Memory: <span className="text-blue-400">14.8 MB</span></span>
              <span className="text-emerald-400 font-semibold">10/10 Test Cases Passed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Grid */}
      <section className="container max-w-screen-2xl px-4 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Engineered for Real Mastery</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Everything you need to advance from foundational data structures to enterprise-grade Java problem solving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardHeader className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-primary">
                <Terminal className="h-5 w-5" />
              </div>
              <CardTitle>Isolated Sandbox Runner</CardTitle>
              <CardDescription>
                Execute code against test cases in an unprivileged runtime with 2.0s watchdogs and memory ceilings.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardHeader className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <CardTitle>Interactive Curriculum</CardTitle>
              <CardDescription>
                Study structured courses with rich Markdown lessons, runnable Java snippets, and automated quizzes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardHeader className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Trophy className="h-5 w-5" />
              </div>
              <CardTitle>Real DB Telemetry</CardTitle>
              <CardDescription>
                Track live streaks, 365-day heatmaps, and unlock badges evaluated dynamically from real database records.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Featured Course Syllabus Preview */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Featured Curriculum</span>
            <h3 className="text-2xl font-bold">Java Foundations & Object-Oriented Programming</h3>
            <p className="text-sm text-muted-foreground">
              A comprehensive deep-dive into modern Java syntax, collections, generics, streams, memory management, and clean architecture.
            </p>
          </div>
          <Link to="/courses">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 shrink-0">
              <BookOpen className="h-4 w-4" />
              <span>Explore Course Catalog</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
