import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminPage as SuperAdminDashboardPage } from '@/features/admin/pages/AdminPage';
import { TeacherDashboardPage } from '@/features/teacher/pages/TeacherDashboardPage';
import { ManagementLoginPage } from '@/features/admin/pages/ManagementLoginPage';
import { ManagementAccessDenied } from '@/features/admin/pages/ManagementAccessDenied';

export const ManagementRoute: React.FC = () => {
  const { user, isAuthenticated, isSuperAdmin, isTeacher, isLoading } = useAuth();

  // 1. While auth state is initializing (/api/auth/me), show loading spinner - DO NOT redirect
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  // 2. Unauthenticated user on /admin -> Show Management Login UI directly at /admin (DO NOT redirect to /login)
  if (!isAuthenticated || !user) {
    return <ManagementLoginPage />;
  }

  // 3. Authenticated SUPER_ADMIN -> Super Admin Dashboard
  if (isSuperAdmin) {
    return <SuperAdminDashboardPage />;
  }

  // 4. Authenticated TEACHER -> Teacher Dashboard
  if (isTeacher) {
    return <TeacherDashboardPage />;
  }

  // 5. Authenticated STUDENT -> Access Denied screen
  return <ManagementAccessDenied user={user} />;
};
