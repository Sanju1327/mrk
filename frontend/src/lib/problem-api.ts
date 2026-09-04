import api from '@/lib/axios';
import type { ApiResponse } from '@/types/auth';
import type {
  ProblemDetail,
  ProblemSummary,
  PageResponse,
  Difficulty,
} from '@/types/problem';

export interface ProblemFilterParams {
  topicId?: number;
  difficulty?: Difficulty;
  search?: string;
  page?: number;
  size?: number;
}

export const problemApi = {
  getProblems: async (
    params: ProblemFilterParams = {}
  ): Promise<PageResponse<ProblemSummary>> => {
    const { data } = await api.get<ApiResponse<PageResponse<ProblemSummary>>>(
      '/problems',
      { params }
    );
    return data.data;
  },

  getDailyProblem: async (): Promise<ProblemDetail> => {
    const { data } = await api.get<ApiResponse<ProblemDetail>>('/problems/daily');
    return data.data;
  },

  getProblemBySlug: async (slug: string): Promise<ProblemDetail> => {
    const { data } = await api.get<ApiResponse<ProblemDetail>>(
      `/problems/slug/${slug}`
    );
    return data.data;
  },

  getProblemById: async (id: number): Promise<ProblemDetail> => {
    const { data } = await api.get<ApiResponse<ProblemDetail>>(
      `/problems/${id}`
    );
    return data.data;
  },
};
