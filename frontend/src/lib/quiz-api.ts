import api from '@/lib/axios';
import type { ApiResponse } from '@/types/auth';
import type { StudentQuiz, QuizResult, QuizAttemptSummary } from '@/types/quiz';

export const quizApi = {
  getQuiz: async (quizId: number): Promise<StudentQuiz> => {
    const { data } = await api.get<ApiResponse<StudentQuiz>>(`/quizzes/${quizId}`);
    return data.data;
  },

  getMyAttempts: async (quizId: number): Promise<QuizAttemptSummary[]> => {
    const { data } = await api.get<ApiResponse<QuizAttemptSummary[]>>(`/quizzes/${quizId}/attempts/me`);
    return data.data;
  },

  submitQuiz: async (
    quizId: number,
    answers: Record<number, number>,
    timeSpentSeconds: number
  ): Promise<QuizResult> => {
    const { data } = await api.post<ApiResponse<QuizResult>>(`/quizzes/${quizId}/submit`, {
      answers,
      timeSpentSeconds,
    });
    return data.data;
  },
};
