import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LandingPage } from '@/features/landing/LandingPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { CourseListPage } from '@/features/courses/pages/CourseListPage';
import { CourseDetailPage } from '@/features/courses/pages/CourseDetailPage';
import { LessonViewPage } from '@/features/courses/pages/LessonViewPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Placeholder views for scaffolding
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="container max-w-screen-2xl px-4 py-20 text-center space-y-4">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="text-muted-foreground">Feature implementation in upcoming phases.</p>
  </div>
);

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
        <Route path="/problems" element={<ComingSoon title="Coding Problems Catalog" />} />
        <Route path="/quizzes" element={<ComingSoon title="Interactive Quizzes" />} />

        {/* Student Protected Routes */}
        <Route
          path="/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <LessonViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ComingSoon title="Student Dashboard" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ComingSoon title="Progress & Achievements" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ComingSoon title="User Profile" />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <ComingSoon title="Admin Portal" />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
