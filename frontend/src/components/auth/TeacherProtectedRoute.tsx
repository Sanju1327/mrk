import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface TeacherProtectedRouteProps {
  children: React.ReactNode;
}

export const TeacherProtectedRoute: React.FC<TeacherProtectedRouteProps> = ({ children }) => {
  const { isTeacher, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  // If not authenticated, send to management login (/admin), NEVER to student /login
  if (!isAuthenticated) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  // If authenticated but not teacher or super admin, redirect to management access check
  if (!isTeacher) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
