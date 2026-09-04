export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface CourseSummary {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: CourseLevel;
  estimatedHours: number;
  iconUrl: string | null;
  published: boolean;
  topicCount: number;
  lessonCount: number;
}

export interface LessonSummary {
  id: number;
  title: string;
  slug: string;
  displayOrder: number;
  estimatedMinutes: number;
  completed: boolean;
}

export interface TopicDetail {
  id: number;
  title: string;
  description: string;
  displayOrder: number;
  lessons: LessonSummary[];
}

export interface CourseDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: CourseLevel;
  estimatedHours: number;
  iconUrl: string | null;
  published: boolean;
  totalLessons: number;
  isEnrolled: boolean;
  completedLessons: number;
  progressPercentage: number;
  topics: TopicDetail[];
}

export interface LessonDetail {
  id: number;
  topicId: number;
  topicTitle: string;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  title: string;
  slug: string;
  contentMarkdown: string;
  displayOrder: number;
  estimatedMinutes: number;
  completed: boolean;
  nextLessonId: number | null;
  prevLessonId: number | null;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  courseDescription: string;
  iconUrl: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  progressPercentage: number;
  enrolledAt: string;
  completedAt: string | null;
}
