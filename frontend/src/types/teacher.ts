import { CourseLevel, ContentBlockType, VideoType } from './course';

export interface TeacherDashboardStats {
  myCoursesCount: number;
  draftsCount: number;
  publishedCount: number;
  enrolledStudentsCount: number;
  averageProgressPercentage: number;
}

export interface CreateCoursePayload {
  title: string;
  slug?: string;
  description: string;
  category?: string;
  level: CourseLevel;
  estimatedDuration?: string;
  language?: string;
  iconUrl?: string;
  thumbnailUrl?: string;
  /** Super Admin only: assign to a teacher. */
  teacherId?: number;
}

export interface UpdateCoursePayload {
  title: string;
  description: string;
  category?: string;
  level?: CourseLevel;
  estimatedDuration?: string;
  language?: string;
  iconUrl?: string;
  thumbnailUrl?: string;
  teacherId?: number;
}

export interface CreateTopicPayload {
  title: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
  requireAllLessons?: boolean;
  requireQuizPass?: boolean;
  allowQuizRetakes?: boolean;
  maxQuizAttempts?: number | null;
}

export interface UpdateTopicPayload {
  title: string;
  description?: string;
  displayOrder?: number;
  requireAllLessons?: boolean;
  requireQuizPass?: boolean;
  allowQuizRetakes?: boolean;
  maxQuizAttempts?: number;
  clearMaxQuizAttempts?: boolean;
}

export interface CreateLessonPayload {
  title: string;
  slug?: string;
  description?: string;
  contentMarkdown?: string;
  estimatedMinutes?: number;
  displayOrder?: number;
  videoType?: VideoType;
  videoUrl?: string;
  published?: boolean;
}

export interface UpdateLessonPayload {
  title: string;
  description?: string;
  contentMarkdown?: string;
  estimatedMinutes?: number;
  displayOrder?: number;
  videoType?: VideoType;
  videoUrl?: string;
  published?: boolean;
}

export interface CreateBlockPayload {
  type: ContentBlockType;
  title: string;
  content: string;
  dataJson?: string;
  displayOrder?: number;
}

export interface UploadedFile {
  url: string;
  fileName: string;
  safeFileName: string;
  size: number;
  mimeType: string;
  kind: 'IMAGE' | 'MATERIAL' | 'VIDEO';
}

export interface CreateQuizOptionPayload {
  optionText: string;
  correct: boolean;
}

export interface CreateQuizQuestionPayload {
  questionText: string;
  explanation?: string;
  points?: number;
  options: CreateQuizOptionPayload[];
}

export interface CreateQuizPayload {
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  passingScorePercentage?: number;
  topicId?: number;
  lessonId?: number;
  questions: CreateQuizQuestionPayload[];
}

export interface CreateTestCasePayload {
  inputData: string;
  expectedOutput: string;
  sample: boolean;
  hidden: boolean;
}

export interface CreateProblemPayload {
  courseId?: number;
  topicId?: number;
  lessonId?: number;
  title: string;
  slug: string;
  description: string;
  constraints?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  supportedLanguage: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  starterCode?: string;
  solutionTemplate?: string;
  testCases: CreateTestCasePayload[];
}
