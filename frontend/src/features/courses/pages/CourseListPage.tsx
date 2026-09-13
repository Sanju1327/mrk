import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Clock,
  Layers,
  Search,
  ArrowRight,
  Play,
  Compass,
} from 'lucide-react';
import { courseApi } from '@/lib/course-api';
import { useAuth } from '@/hooks/useAuth';
import type { CourseSummary, Enrollment } from '@/types/course';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const CourseListPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getAllCourses,
  });

  const { data: myEnrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: courseApi.getMyEnrollments,
    enabled: isAuthenticated,
  });

  const enrollmentMap = React.useMemo(() => {
    const map = new Map<number, Enrollment>();
    myEnrollments.forEach((e) => map.set(e.courseId, e));
    return map;
  }, [myEnrollments]);

  const filteredCourses = courses.filter((course: CourseSummary) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel =
      selectedLevel === 'ALL' || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 py-10 space-y-12">
      {/* 1. Header Banner */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-xs text-muted-foreground">
          <Compass className="h-3.5 w-3.5 text-foreground" />
          <span>Engineering Curricula</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Structured Learning Tracks
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Comprehensive, production-focused Java pathways. From core JVM memory layout to concurrent multi-threaded systems and advanced algorithmic problem solving.
        </p>
      </div>

      {/* 2. Enrolled Active Track Spotlight (if user has active enrollments) */}
      {isAuthenticated && myEnrollments.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Active Enrolled Tracks ({myEnrollments.length})
              </span>
            </div>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1">
                <span>View Learning Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myEnrollments.map((enr) => (
              <div
                key={enr.id}
                className="flex flex-col justify-between rounded border border-border/80 bg-surface-raised p-4 space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground uppercase">{enr.status}</span>
                    <span className="font-mono font-medium text-foreground">{Math.round(enr.progressPercentage)}%</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{enr.courseTitle}</h4>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, enr.progressPercentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      {enr.progressPercentage >= 100 ? 'Curriculum completed' : 'In progress'}
                    </span>
                    <Link to={`/courses/${enr.courseSlug}`}>
                      <Button size="sm" className="h-7 px-2.5 text-xs font-medium gap-1 bg-primary text-primary-foreground">
                        <Play className="h-3 w-3 fill-current" />
                        <span>Resume Track</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => {
            const isSelected = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-surface-raised text-foreground border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter courses..."
            className="pl-8 h-8 text-xs bg-surface border-border focus-visible:ring-1 focus-visible:ring-ring"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-6 space-y-4 animate-pulse">
              <div className="h-5 w-24 bg-border rounded" />
              <div className="h-6 w-3/4 bg-border rounded" />
              <div className="h-16 w-full bg-border rounded" />
              <div className="h-8 w-full bg-border rounded" />
            </div>
          ))}
        </div>
      )}

      {/* 5. Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center text-xs font-mono text-destructive">
          Failed to load course catalog. Please ensure the backend service is running.
        </div>
      )}

      {/* 6. Courses Grid */}
      {!isLoading && !error && (
        <>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <h3 className="text-base font-medium text-foreground">No matching courses</h3>
              <p className="text-xs text-muted-foreground">
                No curricula match your current search and difficulty filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course: CourseSummary) => {
                const enr = enrollmentMap.get(course.id);
                const isEnrolled = !!enr;

                return (
                  <div
                    key={course.id}
                    className="flex flex-col justify-between rounded-lg border border-border bg-surface hover:border-border/90 transition-colors duration-150 p-6 space-y-6"
                  >
                    <div className="space-y-4">
                      {/* Top Meta */}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            course.level === 'BEGINNER'
                              ? 'easy'
                              : course.level === 'INTERMEDIATE'
                              ? 'medium'
                              : 'hard'
                          }
                        >
                          {course.level}
                        </Badge>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>~{course.estimatedHours}h</span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-2">
                        <Link to={`/courses/${course.slug}`}>
                          <h3 className="text-lg font-semibold tracking-tight text-foreground hover:text-foreground/90 transition-colors">
                            {course.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {course.description}
                        </p>
                      </div>

                      {/* Course Curriculum Stats */}
                      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-foreground" />
                          <span>{course.topicCount} modules</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-foreground" />
                          <span>{course.lessonCount} lessons</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-2">
                      <Link to={`/courses/${course.slug}`}>
                        <Button
                          variant={isEnrolled ? 'default' : 'outline'}
                          className="w-full h-9 text-xs font-medium justify-between group"
                        >
                          <span>{isEnrolled ? 'Continue Syllabus' : 'Explore Curriculum'}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
