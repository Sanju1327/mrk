export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';

// ---------- Student ----------

export interface QuizAttemptInfo {
  attemptsUsed: number;
  maxAttempts: number | null;
  allowRetakes: boolean;
  passed: boolean;
  bestPercentage: number | null;
  lastPercentage: number | null;
  lastAttemptAt: string | null;
  canAttempt: boolean;
  blockedReason: string | null;
}

export interface StudentQuizOption {
  id: number;
  optionText: string;
  displayOrder: number;
}

export interface StudentQuizQuestion {
  id: number;
  questionText: string;
  questionType: QuestionType;
  points: number;
  displayOrder: number;
  options: StudentQuizOption[];
}

export interface StudentQuiz {
  id: number;
  topicId: number | null;
  lessonId: number | null;
  title: string;
  description: string | null;
  timeLimitMinutes: number;
  passingScorePercentage: number;
  enabled: boolean;
  totalQuestions: number;
  totalPoints: number;
  questions: StudentQuizQuestion[];
  courseSlug: string | null;
  courseTitle: string | null;
  topicTitle: string | null;
  nextChapterFirstLessonId: number | null;
  attemptInfo: QuizAttemptInfo | null;
}

export interface QuizQuestionResult {
  questionId: number;
  questionText: string;
  selectedOptionId: number | null;
  correctOptionId: number | null;
  isCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
  explanation: string | null;
}

export interface QuizResult {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  passingScorePercentage: number;
  questionResults: QuizQuestionResult[];
  attemptInfo: QuizAttemptInfo | null;
  courseSlug: string | null;
  nextChapterFirstLessonId: number | null;
}

export interface QuizAttemptSummary {
  id: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  createdAt: string;
}

// ---------- Teacher ----------

export interface TeacherQuizOption {
  id: number;
  optionText: string;
  correct: boolean;
  displayOrder: number;
}

export interface TeacherQuizQuestion {
  id: number;
  questionText: string;
  questionType: QuestionType;
  points: number;
  explanation: string | null;
  displayOrder: number;
  options: TeacherQuizOption[];
}

export interface TeacherQuiz {
  id: number;
  topicId: number | null;
  lessonId: number | null;
  title: string;
  description: string | null;
  timeLimitMinutes: number;
  passingScorePercentage: number;
  enabled: boolean;
  totalQuestions: number;
  totalPoints: number;
  questions: TeacherQuizQuestion[];
}

export interface UpsertQuizPayload {
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  passingScorePercentage?: number;
  enabled?: boolean;
}

export interface UpsertQuestionPayload {
  questionText: string;
  questionType?: QuestionType;
  points?: number;
  explanation?: string;
  options: { optionText: string; correct: boolean }[];
}
