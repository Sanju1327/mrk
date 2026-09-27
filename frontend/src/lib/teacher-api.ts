import type { AxiosProgressEvent } from 'axios';
import api from '@/lib/axios';
import type { ApiResponse } from '@/types/auth';
import type {
  CourseSummary,
  CourseDetail,
  TopicDetail,
  LessonDetail,
  LessonSummary,
  ContentBlock,
  CourseResource,
} from '@/types/course';
import type {
  TeacherDashboardStats,
  CreateCoursePayload,
  UpdateCoursePayload,
  CreateTopicPayload,
  UpdateTopicPayload,
  CreateLessonPayload,
  UpdateLessonPayload,
  CreateBlockPayload,
  CreateQuizPayload,
  CreateProblemPayload,
  UploadedFile,
} from '@/types/teacher';
import type { TeacherQuiz, UpsertQuizPayload, UpsertQuestionPayload } from '@/types/quiz';

export type UploadProgressHandler = (percent: number) => void;

const progressConfig = (onProgress?: UploadProgressHandler) => ({
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: (evt: AxiosProgressEvent) => {
    if (onProgress && evt.total) {
      onProgress(Math.round((evt.loaded / evt.total) * 100));
    }
  },
});

export const teacherApi = {
  getDashboard: async (): Promise<TeacherDashboardStats> => {
    const { data } = await api.get<ApiResponse<TeacherDashboardStats>>('/teacher/dashboard');
    return data.data;
  },

  // ---------------- Courses ----------------

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

  validatePublish: async (courseId: number): Promise<{ canPublish: boolean; errors: string[] }> => {
    const { data } = await api.get<ApiResponse<{ canPublish: boolean; errors: string[] }>>(
      `/teacher/courses/${courseId}/validate`
    );
    return data.data;
  },

  publishCourse: async (courseId: number): Promise<CourseDetail> => {
    const { data } = await api.patch<ApiResponse<CourseDetail>>(`/teacher/courses/${courseId}/publish`);
    return data.data;
  },

  unpublishCourse: async (courseId: number): Promise<CourseDetail> => {
    const { data } = await api.patch<ApiResponse<CourseDetail>>(`/teacher/courses/${courseId}/unpublish`);
    return data.data;
  },

  archiveCourse: async (courseId: number): Promise<CourseDetail> => {
    const { data } = await api.patch<ApiResponse<CourseDetail>>(`/teacher/courses/${courseId}/archive`);
    return data.data;
  },

  /** @deprecated use publishCourse — kept for existing callers. */
  togglePublishCourse: async (courseId: number): Promise<CourseDetail> => {
    const { data } = await api.patch<ApiResponse<CourseDetail>>(`/teacher/courses/${courseId}/publish`);
    return data.data;
  },

  deleteCourse: async (courseId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/teacher/courses/${courseId}`);
  },

  // ---------------- Chapters (topics) ----------------

  createTopic: async (courseId: number, payload: CreateTopicPayload): Promise<TopicDetail> => {
    const { data } = await api.post<ApiResponse<TopicDetail>>(`/teacher/courses/${courseId}/topics`, payload);
    return data.data;
  },

  updateTopic: async (topicId: number, payload: UpdateTopicPayload): Promise<TopicDetail> => {
    const { data } = await api.put<ApiResponse<TopicDetail>>(`/teacher/topics/${topicId}`, payload);
    return data.data;
  },

  deleteTopic: async (topicId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/teacher/topics/${topicId}`);
  },

  reorderTopics: async (courseId: number, orderedIds: number[]): Promise<TopicDetail[]> => {
    const { data } = await api.put<ApiResponse<TopicDetail[]>>(
      `/teacher/courses/${courseId}/topics/reorder`,
      orderedIds
    );
    return data.data;
  },

  // ---------------- Lessons ----------------

  getLessonDetail: async (lessonId: number): Promise<LessonDetail> => {
    const { data } = await api.get<ApiResponse<LessonDetail>>(`/teacher/lessons/${lessonId}`);
    return data.data;
  },

  createLesson: async (topicId: number, payload: CreateLessonPayload): Promise<LessonSummary> => {
    const { data } = await api.post<ApiResponse<LessonSummary>>(`/teacher/topics/${topicId}/lessons`, payload);
    return data.data;
  },

  updateLesson: async (lessonId: number, payload: UpdateLessonPayload): Promise<LessonSummary> => {
    const { data } = await api.put<ApiResponse<LessonSummary>>(`/teacher/lessons/${lessonId}`, payload);
    return data.data;
  },

  deleteLesson: async (lessonId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/teacher/lessons/${lessonId}`);
  },

  reorderLessons: async (topicId: number, orderedIds: number[]): Promise<LessonSummary[]> => {
    const { data } = await api.put<ApiResponse<LessonSummary[]>>(
      `/teacher/topics/${topicId}/lessons/reorder`,
      orderedIds
    );
    return data.data;
  },

  uploadLessonVideo: async (lessonId: number, file: File, onProgress?: UploadProgressHandler): Promise<LessonDetail> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<ApiResponse<LessonDetail>>(
      `/teacher/lessons/${lessonId}/video`,
      formData,
      progressConfig(onProgress)
    );
    return data.data;
  },

  removeLessonVideo: async (lessonId: number): Promise<LessonDetail> => {
    const { data } = await api.delete<ApiResponse<LessonDetail>>(`/teacher/lessons/${lessonId}/video`);
    return data.data;
  },

  // ---------------- Learning materials ----------------

  uploadLessonMaterial: async (
    lessonId: number,
    file: File,
    meta: { title?: string; description?: string },
    onProgress?: UploadProgressHandler
  ): Promise<CourseResource> => {
    const formData = new FormData();
    formData.append('file', file);
    if (meta.title) formData.append('title', meta.title);
    if (meta.description) formData.append('description', meta.description);
    const { data } = await api.post<ApiResponse<CourseResource>>(
      `/teacher/lessons/${lessonId}/materials`,
      formData,
      progressConfig(onProgress)
    );
    return data.data;
  },

  replaceMaterialFile: async (resourceId: number, file: File, onProgress?: UploadProgressHandler): Promise<CourseResource> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<ApiResponse<CourseResource>>(
      `/teacher/resources/${resourceId}/file`,
      formData,
      progressConfig(onProgress)
    );
    return data.data;
  },

  updateResource: async (resourceId: number, payload: { title: string; description?: string }): Promise<CourseResource> => {
    const { data } = await api.put<ApiResponse<CourseResource>>(`/teacher/resources/${resourceId}`, payload);
    return data.data;
  },

  /** Link-style resource (external URL) on a course or lesson. */
  createResource: async (
    courseId: number,
    payload: { title: string; url: string; resourceType: string; description?: string; lessonId?: number }
  ): Promise<CourseResource> => {
    const { lessonId, ...body } = payload;
    const { data } = await api.post<ApiResponse<CourseResource>>(`/teacher/courses/${courseId}/resources`, body, {
      params: lessonId ? { lessonId } : {},
    });
    return data.data;
  },

  deleteResource: async (resourceId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/teacher/resources/${resourceId}`);
  },

  // ---------------- Content blocks ----------------

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
    const { data } = await api.put<ApiResponse<ContentBlock[]>>(
      `/teacher/lessons/${lessonId}/blocks/reorder`,
      blockIds
    );
    return data.data;
  },

  // ---------------- Generic upload (thumbnails, inline images) ----------------

  uploadFile: async (
    file: File,
    kind: 'IMAGE' | 'MATERIAL' | 'VIDEO' = 'IMAGE',
    onProgress?: UploadProgressHandler
  ): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);
    const { data } = await api.post<ApiResponse<UploadedFile>>('/teacher/uploads', formData, progressConfig(onProgress));
    return data.data;
  },

  // ---------------- Chapter quizzes ----------------

  getChapterQuiz: async (topicId: number): Promise<TeacherQuiz | null> => {
    const { data } = await api.get<ApiResponse<TeacherQuiz | null>>(`/teacher/topics/${topicId}/quiz`);
    return data.data ?? null;
  },

  createChapterQuiz: async (topicId: number, payload: UpsertQuizPayload): Promise<TeacherQuiz> => {
    const { data } = await api.post<ApiResponse<TeacherQuiz>>(`/teacher/topics/${topicId}/quiz`, payload);
    return data.data;
  },

  updateQuiz: async (quizId: number, payload: UpsertQuizPayload): Promise<TeacherQuiz> => {
    const { data } = await api.put<ApiResponse<TeacherQuiz>>(`/teacher/quizzes/${quizId}`, payload);
    return data.data;
  },

  deleteQuiz: async (quizId: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/teacher/quizzes/${quizId}`);
  },

  addQuestion: async (quizId: number, payload: UpsertQuestionPayload): Promise<TeacherQuiz> => {
    const { data } = await api.post<ApiResponse<TeacherQuiz>>(`/teacher/quizzes/${quizId}/questions`, payload);
    return data.data;
  },

  updateQuestion: async (questionId: number, payload: UpsertQuestionPayload): Promise<TeacherQuiz> => {
    const { data } = await api.put<ApiResponse<TeacherQuiz>>(`/teacher/questions/${questionId}`, payload);
    return data.data;
  },

  deleteQuestion: async (questionId: number): Promise<TeacherQuiz> => {
    const { data } = await api.delete<ApiResponse<TeacherQuiz>>(`/teacher/questions/${questionId}`);
    return data.data;
  },

  reorderQuestions: async (quizId: number, orderedIds: number[]): Promise<TeacherQuiz> => {
    const { data } = await api.put<ApiResponse<TeacherQuiz>>(`/teacher/quizzes/${quizId}/questions/reorder`, orderedIds);
    return data.data;
  },

  /** Legacy one-shot quiz creation. */
  createQuiz: async (payload: CreateQuizPayload): Promise<TeacherQuiz> => {
    const { data } = await api.post<ApiResponse<TeacherQuiz>>('/teacher/quizzes', payload);
    return data.data;
  },

  // ---------------- Problems ----------------

  createProblem: async (payload: CreateProblemPayload): Promise<any> => {
    const { data } = await api.post<ApiResponse<any>>('/teacher/problems', payload);
    return data.data;
  },
};
