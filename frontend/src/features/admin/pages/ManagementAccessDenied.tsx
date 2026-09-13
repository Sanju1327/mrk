import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/auth';

interface ManagementAccessDeniedProps {
  user: User;
}

export const ManagementAccessDenied: React.FC<ManagementAccessDeniedProps> = ({ user }) => {
  const { logout } = useAuth();

  return (
    <div className="container flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6 p-8 rounded-xl border border-destructive/40 bg-surface/90 shadow-2xl backdrop-blur-sm text-center relative overflow-hidden">
        {/* Accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />

        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive">
            <ShieldAlert className="h-9 w-9 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-0.5 font-mono text-xs font-semibold text-destructive">
            <span>403 FORBIDDEN &bull; ACCESS DENIED</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Management Portal Restricted
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You are signed in as <span className="font-semibold text-foreground font-mono">{user.username}</span> ({user.email}).
          </p>
          <div className="rounded-lg border border-border bg-surface-raised p-3 text-xs text-muted-foreground text-left font-mono space-y-1">
            <div>Current Assigned Role: <span className="text-amber-400 font-semibold">{user.roles?.join(', ') || 'ROLE_STUDENT'}</span></div>
            <div>Allowed Roles: <span className="text-emerald-400 font-semibold">ROLE_SUPER_ADMIN</span> or <span className="text-cyan-400 font-semibold">ROLE_TEACHER</span></div>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            The /admin management portal is restricted exclusively to Teachers (course authors) and the Platform Super Admin. Student accounts cannot access this area.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link to="/dashboard" className="w-full">
            <Button variant="default" className="w-full gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Continue to Student Dashboard</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={logout}
            className="w-full gap-2 border-border hover:bg-surface-raised text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Switch to Teacher / Super Admin Account</span>
          </Button>

          <Link to="/" className="pt-2 inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
