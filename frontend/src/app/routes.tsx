import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LandingPage } from '@/features/landing/LandingPage';

// Placeholder views for Phase 1 scaffolding
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="container max-w-screen-2xl px-4 py-20 text-center space-y-4">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="text-muted-foreground">Scaffolded in Phase 1 — Feature implementation in upcoming phases.</p>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<ComingSoon title="Login & Authentication" />} />
        <Route path="/register" element={<ComingSoon title="Student Registration" />} />
        <Route path="/courses" element={<ComingSoon title="Courses & Syllabus" />} />
        <Route path="/problems" element={<ComingSoon title="Coding Problems Catalog" />} />
        <Route path="/quizzes" element={<ComingSoon title="Interactive Quizzes" />} />

        {/* Student Protected Routes */}
        <Route path="/dashboard" element={<ComingSoon title="Student Dashboard" />} />
        <Route path="/progress" element={<ComingSoon title="Progress & Achievements" />} />
        <Route path="/profile" element={<ComingSoon title="User Profile" />} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<ComingSoon title="Admin Portal" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
