import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Clock,
  Layers,
  Search,
  ArrowRight,
  Code2,
  GraduationCap,
} from 'lucide-react';
import { courseApi } from '@/lib/course-api';
import type { CourseSummary, CourseLevel } from '@/types/course';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const levelBadgeColor: Record<CourseLevel, string> = {
  BEGINNER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  INTERMEDIATE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  ADVANCED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export const CourseListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getAllCourses,
  });

  const filteredCourses = courses.filter((course: CourseSummary) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel =
      selectedLevel === 'ALL' || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="container max-w-screen-2xl px-4 py-12 space-y-10">
      {/* Header Banner */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Curated Learning Paths</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Master Software Engineering with Structured Courses
        </h1>
        <p className="text-lg text-muted-foreground">
          Follow battle-tested curricula from foundational programming to advanced
          distributed architecture with hands-on coding exercises.
        </p>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
            <Button
              key={lvl}
              variant={selectedLevel === lvl ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel(lvl)}
              className="text-xs capitalize"
            >
              {lvl.toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-4 animate-pulse bg-card/40 border-border/40">
              <div className="h-6 w-24 bg-muted rounded" />
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-16 w-full bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
          Failed to load courses. Please check your backend connection.
        </div>
      )}

      {/* Course Cards Grid */}
      {!isLoading && !error && (
        <>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria or filter options.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course: CourseSummary) => (
                <Card
                  key={course.id}
                  className="flex flex-col justify-between p-6 border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-200 bg-card/60 backdrop-blur-sm group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold ${levelBadgeColor[course.level]}`}
                      >
                        {course.level}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{course.estimatedHours} hrs</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                          <Code2 className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
                      <div className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        <span>{course.topicCount} Topics</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        <span>{course.lessonCount} Lessons</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link to={`/courses/${course.slug}`}>
                      <Button className="w-full flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <span>View Syllabus</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
