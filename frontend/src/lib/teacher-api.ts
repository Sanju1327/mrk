import api from '@/lib/axios';
import type { ApiResponse } from '@/types/auth';
import type {
  CourseSummary,
  CourseDetail,
  TopicDetail,
  LessonDetail,
  ContentBlock,
  CourseResource,
} from '@/types/course';
import type {
  TeacherDashboardStats,
  CreateCoursePayload,
  UpdateCoursePayload,
  CreateTopicPayload,
  CreateLessonPayload,
  CreateBlockPayload,
  CreateQuizPayload,
  CreateProblemPayload,
} from '@/types/teacher';

export const teacherApi = {
  getDashboard: async (): Promise<TeacherDashboardStats> => {
    const { data } = await api.get<ApiResponse<TeacherDashboardStats>>('/teacher/dashboard');
    return data.data;
  },

  getMyCourses: async (): Promise<CourseSummary[]> => {
    const { data } = await api.get<ApiResponse<CourseSummary[]>>('/teacher/courses');
    return data.data;
  },

  getCourseDetail: async (courseId: number): Promise<CourseDetail> => {
    const { data } = await api.get<ApiResponse<CourseDetail>>(`/teacher/courses/${courseId}`);
    return data.data;
  },

  createCourse: async (payload: CreateCoursePayload): Promise<CourseDetail> => {
    const { data } = await api.post<ApiResponse<CourseDetail>>('/teacher/courses', payload);
    return data.data;
  },

  updateCourse: async (courseId: number, payload: UpdateCoursePayload): Promise<CourseDetail> => {
    const { data } = await api.put<ApiResponse<CourseDetail>>(`/teacher/courses/${courseId}`, payload);
    return data.data;
  },

  togglePublishCourse: async (courseId: number): Promise<CourseDetail> => {
    const { data } = await api.patch<ApiResponse<CourseDetail>>(`/teacher/courses/${courseId}/publish`);
    return data.data;
  },

  deleteCourse: async (courseId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/teacher/courses/${courseId}`);
  },

  // Topics
  createTopic: async (courseId: number, payload: CreateTopicPayload): Promise<TopicDetail> => {
    const { data } = await api.post<ApiResponse<TopicDetail>>(`/teacher/courses/${courseId}/topics`, payload);
    return data.data;
  },

  updateTopic: async (topicId: number, payload: Partial<CreateTopicPayload>): Promise<TopicDetail> => {
    const { data } = await api.put<ApiResponse<TopicDetail>>(`/teacher/topics/${topicId}`, payload);
    return data.data;
  },

  deleteTopic: async (topicId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/teacher/topics/${topicId}`);
  },

  // Lessons
  createLesson: async (topicId: number, payload: CreateLessonPayload): Promise<LessonDetail> => {
    const { data } = await api.post<ApiResponse<LessonDetail>>(`/teacher/topics/${topicId}/lessons`, payload);
    return data.data;
  },

  updateLesson: async (lessonId: number, payload: Partial<CreateLessonPayload>): Promise<LessonDetail> => {
    const { data } = await api.put<ApiResponse<LessonDetail>>(`/teacher/lessons/${lessonId}`, payload);
    return data.data;
  },

  deleteLesson: async (lessonId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/teacher/lessons/${lessonId}`);
  },

  // Content Blocks
  getLessonBlocks: async (lessonId: number): Promise<ContentBlock[]> => {
    const { data } = await api.get<ApiResponse<ContentBlock[]>>(`/teacher/lessons/${lessonId}/blocks`);
    return data.data;
  },

  createBlock: async (lessonId: number, payload: CreateBlockPayload): Promise<ContentBlock> => {
    const { data } = await api.post<ApiResponse<ContentBlock>>(`/teacher/lessons/${lessonId}/blocks`, payload);
    return data.data;
  },

  updateBlock: async (blockId: number, payload: Partial<CreateBlockPayload>): Promise<ContentBlock> => {
    const { data } = await api.put<ApiResponse<ContentBlock>>(`/teacher/blocks/${blockId}`, payload);
    return data.data;
  },

  deleteBlock: async (blockId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/teacher/blocks/${blockId}`);
  },

  reorderBlocks: async (lessonId: number, blockIds: number[]): Promise<ContentBlock[]> => {
    const { data } = await api.put<ApiResponse<ContentBlock[]>>(`/teacher/lessons/${lessonId}/blocks/reorder`, {
      blockIds,
    });
    return data.data;
  },

  // Resources
  createResource: async (
    courseId: number,
    payload: { title: string; url: string; type: string; description?: string }
  ): Promise<CourseResource> => {
    const { data } = await api.post<ApiResponse<CourseResource>>(`/teacher/courses/${courseId}/resources`, payload);
    return data.data;
  },

  deleteResource: async (resourceId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/teacher/resources/${resourceId}`);
  },

  // File Upload
  uploadFile: async (file: File): Promise<{ url: string; originalName: string; size: number; mimeType: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<ApiResponse<{ url: string; originalName: string; size: number; mimeType: string }>>(
      '/teacher/uploads',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data.data;
  },

  // Quiz creation
  createQuiz: async (payload: CreateQuizPayload): Promise<any> => {
    const { data } = await api.post<ApiResponse<any>>('/teacher/quizzes', payload);
    return data.data;
  },

  // Problem creation
  createProblem: async (payload: CreateProblemPayload): Promise<any> => {
    const { data } = await api.post<ApiResponse<any>>('/teacher/problems', payload);
    return data.data;
  },
};
