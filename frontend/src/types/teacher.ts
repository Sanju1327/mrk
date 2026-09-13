import { CourseLevel, ContentBlockType } from './course';

export interface TeacherDashboardStats {
  myCoursesCount: number;
  draftsCount: number;
  publishedCount: number;
  enrolledStudentsCount: number;
  averageProgressPercentage: number;
}

export interface CreateCoursePayload {
  title: string;
  slug: string;
  description: string;
  category: string;
  level: CourseLevel;
  estimatedDuration?: string;
  iconUrl?: string;
}

export interface UpdateCoursePayload {
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  level?: CourseLevel;
  estimatedDuration?: string;
  iconUrl?: string;
}

export interface CreateTopicPayload {
  title: string;
  slug: string;
  description?: string;
  displayOrder?: number;
}

export interface CreateLessonPayload {
  title: string;
  slug: string;
  contentMarkdown?: string;
  estimatedMinutes?: number;
  displayOrder?: number;
}

export interface CreateBlockPayload {
  type: ContentBlockType;
  title: string;
  content: string;
  dataJson?: string;
  displayOrder?: number;
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
