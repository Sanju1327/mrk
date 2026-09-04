import api from '@/lib/axios';
import type { ApiResponse } from '@/types/auth';
import type {
  CourseSummary,
  CourseDetail,
  LessonDetail,
  Enrollment,
} from '@/types/course';

export const courseApi = {
  getAllCourses: async (): Promise<CourseSummary[]> => {
    const { data } = await api.get<ApiResponse<CourseSummary[]>>('/courses');
    return data.data;
  },

  getCourseBySlug: async (slug: string): Promise<CourseDetail> => {
    const { data } = await api.get<ApiResponse<CourseDetail>>(`/courses/slug/${slug}`);
    return data.data;
  },

  getLessonById: async (lessonId: number): Promise<LessonDetail> => {
    const { data } = await api.get<ApiResponse<LessonDetail>>(`/courses/lessons/${lessonId}`);
    return data.data;
  },

  completeLesson: async (lessonId: number): Promise<void> => {
    await api.post<ApiResponse<void>>(`/courses/lessons/${lessonId}/complete`);
  },

  enroll: async (courseId: number): Promise<Enrollment> => {
    const { data } = await api.post<ApiResponse<Enrollment>>(`/enrollments/${courseId}`);
    return data.data;
  },

  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const { data } = await api.get<ApiResponse<Enrollment[]>>('/enrollments/my');
    return data.data;
  },

  checkEnrollment: async (courseId: number): Promise<boolean> => {
    const { data } = await api.get<ApiResponse<boolean>>(`/enrollments/check/${courseId}`);
    return data.data;
  },
};
