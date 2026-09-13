export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ContentBlockType = 'TEXT' | 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'LINK' | 'CODE' | 'QUESTION' | 'QUIZ';
export type ResourceType = 'DOCUMENT' | 'SLIDES' | 'SOURCE_CODE' | 'EXTERNAL_LINK';

export interface InstructorSummary {
  id: number;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface ContentBlock {
  id: number;
  lessonId: number;
  type: ContentBlockType;
  title: string;
  content: string;
  dataJson: string | null;
  displayOrder: number;
  createdAt?: string;
}

export interface CourseResource {
  id: number;
  courseId: number;
  title: string;
  url: string;
  type: ResourceType;
  description: string | null;
  displayOrder: number;
}

export interface CourseSummary {
  id: number;
  title: string;
  slug: string;
  description: string;
  category?: string;
  level: CourseLevel;
  status?: CourseStatus;
  estimatedHours: number;
  estimatedDuration?: string;
  iconUrl: string | null;
  published: boolean;
  topicCount: number;
  lessonCount: number;
  instructor?: InstructorSummary | null;
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
  category?: string;
  level: CourseLevel;
  status?: CourseStatus;
  estimatedHours: number;
  estimatedDuration?: string;
  iconUrl: string | null;
  published: boolean;
  totalLessons: number;
  isEnrolled: boolean;
  completedLessons: number;
  progressPercentage: number;
  instructor?: InstructorSummary | null;
  topics: TopicDetail[];
  resources?: CourseResource[];
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
  contentBlocks?: ContentBlock[];
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
