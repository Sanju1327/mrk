export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface TestCase {
  id: number;
  inputData: string;
  expectedOutput: string;
  explanation: string | null;
  sample: boolean;
  displayOrder: number;
}

export interface ProblemSummary {
  id: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topicTitle: string | null;
  topicSlug: string | null;
  isDailyChallenge: boolean;
  acceptanceRate: number;
  totalSubmissions: number;
  solvedByUser: boolean;
}

export interface ProblemDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  constraints: string;
  difficulty: Difficulty;
  supportedLanguage: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  starterCode: string;
  explanation: string | null;
  topicTitle: string | null;
  topicSlug: string | null;
  courseId: number | null;
  courseSlug: string | null;
  isDailyChallenge: boolean;
  solvedByUser: boolean;
  acceptanceRate: number;
  totalSubmissions: number;
  sampleTestCases: TestCase[];
}

export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
