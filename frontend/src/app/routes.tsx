import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LandingPage } from '@/features/landing/LandingPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { CourseListPage } from '@/features/courses/pages/CourseListPage';
import { CourseDetailPage } from '@/features/courses/pages/CourseDetailPage';
import { LessonViewPage } from '@/features/courses/pages/LessonViewPage';
import { ProblemListPage } from '@/features/problems/pages/ProblemListPage';
import { ProblemWorkspacePage } from '@/features/problems/pages/ProblemWorkspacePage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { QuizPage } from '@/features/quizzes/pages/QuizPage';
import { ProgressPage } from '@/features/progress/pages/ProgressPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { ManagementRoute } from '@/features/admin/ManagementRoute';
import { CourseBuilderPage } from '@/features/teacher/pages/CourseBuilderPage';
import { StudentProtectedRoute } from '@/components/auth/StudentProtectedRoute';
import { TeacherProtectedRoute } from '@/components/auth/TeacherProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses" element={<CourseListPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/problems" element={<ProblemListPage />} />
        <Route path="/problems/:slug" element={<ProblemWorkspacePage />} />
        <Route path="/quizzes" element={<QuizPage />} />

        {/* Student Protected Routes */}
        <Route
          path="/lessons/:lessonId"
          element={
            <StudentProtectedRoute>
              <LessonViewPage />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <StudentProtectedRoute>
              <DashboardPage />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <StudentProtectedRoute>
              <ProgressPage />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <StudentProtectedRoute>
              <ProfilePage />
            </StudentProtectedRoute>
          }
        />

        {/* Management Portal Route - Teachers & Super Admin */}
        <Route path="/admin" element={<ManagementRoute />} />

        {/* Backward compatible alias for /teacher -> redirects to /admin */}
        <Route path="/teacher" element={<Navigate to="/admin" replace />} />

        {/* Teacher Course Studio Builder */}
        <Route
          path="/teacher/courses/:courseId/builder"
          element={
            <TeacherProtectedRoute>
              <CourseBuilderPage />
            </TeacherProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
