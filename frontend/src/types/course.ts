export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ContentBlockType = 'TEXT' | 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'LINK' | 'CODE' | 'QUESTION' | 'QUIZ';
export type ResourceType =
  | 'VIDEO'
  | 'DOCUMENT'
  | 'SLIDES'
  | 'SPREADSHEET'
  | 'IMAGE'
  | 'ARCHIVE'
  | 'LINK'
  | 'CODE'
  | 'OTHER';
export type VideoType = 'NONE' | 'YOUTUBE' | 'UPLOAD';
export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

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

/** Learning material or external resource attached to a course or lesson. */
export interface CourseResource {
  id: number;
  courseId: number;
  lessonId: number | null;
  title: string;
  description: string | null;
  resourceType: ResourceType;
  url: string;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  provider: string | null;
  attribution: string | null;
  uploaderName: string | null;
  displayOrder: number;
  createdAt?: string;
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
  language?: string;
  iconUrl: string | null;
  thumbnailUrl?: string | null;
  published: boolean;
  topicCount: number;
  lessonCount: number;
  instructor?: InstructorSummary | null;
}

export interface LessonSummary {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  estimatedMinutes: number;
  videoType?: VideoType;
  hasVideo?: boolean;
  published?: boolean;
  completed: boolean;
}

export interface ChapterQuizSummary {
  id: number;
  title: string;
  description: string | null;
  enabled: boolean;
  questionCount: number;
  passingScorePercentage: number;
  timeLimitMinutes: number;
}

export interface TopicProgress {
  status: ProgressStatus;
  locked: boolean;
  totalLessons: number;
  completedLessons: number;
  lessonsComplete: boolean;
  quizRequired: boolean;
  quizPassed: boolean;
  quizAttemptsUsed: number;
  quizMaxAttempts: number | null;
  quizBestPercentage: number | null;
  canAttemptQuiz: boolean;
  quizUnlocked: boolean;
}

/** A chapter (the backend calls these "topics"/"modules"). */
export interface TopicDetail {
  id: number;
  title: string;
  slug?: string;
  description: string;
  displayOrder: number;
  requireAllLessons: boolean;
  requireQuizPass: boolean;
  allowQuizRetakes: boolean;
  maxQuizAttempts: number | null;
  quiz: ChapterQuizSummary | null;
  lessons: LessonSummary[];
  progress?: TopicProgress | null;
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
  language?: string;
  iconUrl: string | null;
  thumbnailUrl?: string | null;
  published: boolean;
  totalLessons: number;
  isEnrolled: boolean;
  completedLessons: number;
  progressPercentage: number;
  progressStatus?: ProgressStatus;
  totalChapters?: number;
  completedChapters?: number;
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
  description: string | null;
  contentMarkdown: string;
  displayOrder: number;
  estimatedMinutes: number;
  published: boolean;
  videoType: VideoType;
  videoUrl: string | null;
  videoId: string | null;
  videoFileName: string | null;
  videoMimeType: string | null;
  videoFileSize: number | null;
  completed: boolean;
  videoPositionSeconds: number;
  nextLessonId: number | null;
  prevLessonId: number | null;
  lastInChapter: boolean;
  chapterQuizId: number | null;
  chapterQuizRequired: boolean;
  nextChapterFirstLessonId: number | null;
  contentBlocks?: ContentBlock[];
  resources?: CourseResource[];
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
