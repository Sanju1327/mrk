export interface TeacherSummary {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  active: boolean;
  courseCount: number;
  studentCount: number;
  createdAt: string;
}

export interface CreateTeacherPayload {
  username: string;
  email: string;
  fullName: string;
  password?: string;
  bio?: string;
}

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalQuizzes: number;
  totalProblems: number;
}
