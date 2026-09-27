import api from '@/lib/axios';
import type { ApiResponse } from '@/types/auth';
import type { AdminStats, TeacherSummary, CreateTeacherPayload } from '@/types/admin';

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return data.data;
  },

  getTeachers: async (): Promise<TeacherSummary[]> => {
    const { data } = await api.get<ApiResponse<TeacherSummary[]>>('/admin/teachers');
    return data.data;
  },

  createTeacher: async (payload: CreateTeacherPayload): Promise<TeacherSummary> => {
    const { data } = await api.post<ApiResponse<TeacherSummary>>('/admin/teachers', payload);
    return data.data;
  },

  /** Backend expects the desired state: PATCH /admin/teachers/{id}/status { active }. */
  toggleTeacherStatus: async (teacherId: number, active: boolean): Promise<TeacherSummary> => {
    const { data } = await api.patch<ApiResponse<TeacherSummary>>(`/admin/teachers/${teacherId}/status`, { active });
    return data.data;
  },

  resetTeacherPassword: async (teacherId: number, newPassword?: string): Promise<string> => {
    const { data } = await api.post<ApiResponse<string>>(`/admin/teachers/${teacherId}/reset-password`, null, {
      params: newPassword ? { newPassword } : {},
    });
    return data.message || 'Password reset successfully';
  },
};
