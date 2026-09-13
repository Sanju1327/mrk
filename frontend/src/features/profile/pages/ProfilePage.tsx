import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Flame,
  CheckCircle2,
  BookOpen,
  Play,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { courseApi } from '@/lib/course-api';
import type { Enrollment } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const { data: myEnrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: courseApi.getMyEnrollments,
  });

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 py-10 space-y-10">
      {/* 1. Header Profile Narrative */}
      <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar icon */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised text-foreground font-mono text-xl font-semibold">
              {user?.username?.substring(0, 2).toUpperCase() || 'CC'}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-foreground">
                  {user?.fullName || user?.username}
                </h1>
                {user?.roles?.map((r) => (
                  <Badge key={r} variant="outline" className="font-mono text-[10px]">
                    {r.replace('ROLE_', '')}
                  </Badge>
                ))}
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                @{user?.username} &bull; Systems & Algorithmic Learner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-mono text-xs text-amber-400">
              <Flame className="h-4 w-4 fill-current" />
              <span>3-Day Streak</span>
            </div>
            <Link to="/progress">
              <Button variant="outline" size="sm" className="text-xs font-mono">
                View Telemetry
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Account Details & Status (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
              Account Credentials
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  <span>Username</span>
                </span>
                <div className="text-foreground font-medium">{user?.username}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  <span>Email Address</span>
                </span>
                <div className="text-foreground font-medium">{user?.email}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Shield className="h-3 w-3" />
                  <span>Platform Authorization</span>
                </span>
                <div className="text-foreground font-medium">
                  {user?.roles?.join(', ') || 'Standard Learner'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span>Member Since</span>
                </span>
                <div className="text-foreground font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6 space-y-4 font-mono text-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
              Quick Telemetry
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrolled Tracks:</span>
                <span className="text-foreground font-semibold">{myEnrollments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Solved Problems:</span>
                <span className="text-foreground font-semibold">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Runtime Engine:</span>
                <span className="text-emerald-400">Java 21 LTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Enrolled Curricula & Verified Solved Challenges (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Curricula Section */}
          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="space-y-0.5">
                <h2 className="text-sm font-semibold text-foreground">Enrolled Curricula</h2>
                <p className="text-xs text-muted-foreground font-mono">
                  Active courses with live progress tracking
                </p>
              </div>
              <Link to="/courses">
                <Button variant="ghost" size="sm" className="h-7 text-xs font-mono">
                  Catalog
                </Button>
              </Link>
            </div>

            {myEnrollments.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">No active course enrollments yet.</p>
                <Link to="/courses">
                  <Button size="sm" className="text-xs">
                    Explore Curricula
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {myEnrollments.map((enr: Enrollment) => (
                  <div
                    key={enr.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-raised transition-colors"
                  >
                    <div className="space-y-2 max-w-md">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-muted-foreground uppercase">{enr.status}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-400 font-medium">
                          {Math.round(enr.progressPercentage)}% completed
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{enr.courseTitle}</h3>
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${Math.max(5, enr.progressPercentage)}%` }}
                        />
                      </div>
                    </div>

                    <Link to={`/courses/${enr.courseSlug}`} className="shrink-0">
                      <Button size="sm" className="h-8 text-xs font-medium gap-1.5 bg-primary text-primary-foreground">
                        <Play className="h-3 w-3 fill-current" />
                        <span>Continue</span>
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Solved Problems Showcase */}
          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="space-y-0.5">
                <h2 className="text-sm font-semibold text-foreground">Solved Challenge Archive</h2>
                <p className="text-xs text-muted-foreground font-mono">
                  Verifiable sandbox executions
                </p>
              </div>
              <Link to="/problems">
                <Button variant="ghost" size="sm" className="h-7 text-xs font-mono">
                  All Problems
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-border/60 font-mono text-xs">
              <div className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-raised transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="text-foreground font-sans font-medium text-sm">Two Sum</span>
                    <div className="text-[11px] text-muted-foreground">Java 21 &bull; 38ms &bull; 14.4MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="easy">EASY</Badge>
                  <Link to="/problems/two-sum">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]">
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-raised transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="text-foreground font-sans font-medium text-sm">Valid Palindrome</span>
                    <div className="text-[11px] text-muted-foreground">Java 21 &bull; 29ms &bull; 13.8MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="easy">EASY</Badge>
                  <Link to="/problems/valid-palindrome">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]">
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-raised transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="text-foreground font-sans font-medium text-sm">FizzBuzz</span>
                    <div className="text-[11px] text-muted-foreground">Java 21 &bull; 21ms &bull; 13.2MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="easy">EASY</Badge>
                  <Link to="/problems/fizzbuzz">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]">
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
