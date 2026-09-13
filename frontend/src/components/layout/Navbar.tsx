import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Terminal,
  Trophy,
  Activity,
  User,
  ShieldAlert,
  LogOut,
  Flame,
  Menu,
  X,
  LayoutDashboard,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isSuperAdmin, isTeacher, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { label: 'Courses', path: '/courses', icon: BookOpen },
    { label: 'Problems', path: '/problems', icon: Terminal },
    { label: 'Quizzes', path: '/quizzes', icon: Trophy },
    { label: 'Progress', path: '/progress', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand + Desktop Links */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-semibold text-sm tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-raised border border-border/80 overflow-hidden shadow-xs">
              <img src="/favicon.png" alt="CodeCraft" className="h-full w-full object-cover" />
            </div>
            <span className="font-mono font-semibold text-base tracking-tight">CodeCraft</span>
            <span className="hidden sm:inline-block rounded border border-border/80 bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">
              Java 21
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-surface-raised text-foreground font-semibold border border-border/70'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isSuperAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Super Admin</span>
              </Link>
            )}

            {!isSuperAdmin && isTeacher && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                    : 'text-purple-400/80 hover:text-purple-300 hover:bg-purple-500/10'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Teacher Dashboard</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right: User State / Auth Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Daily Streak Indicator */}
              <div
                className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-mono font-medium text-amber-400"
                title="Active Daily Streak"
              >
                <Flame className="h-3.5 w-3.5 fill-current" />
                <span>3d streak</span>
              </div>

              {/* Dashboard Link */}
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 gap-2 text-xs font-medium ${
                    isActive('/dashboard') ? 'bg-surface-raised border-primary/40 text-foreground' : ''
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Dashboard</span>
                </Button>
              </Link>

              {/* User Profile */}
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground ${
                    isActive('/profile') ? 'text-foreground bg-surface-raised' : ''
                  }`}
                  title="View Profile"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="max-w-[120px] truncate">{user?.username || 'Profile'}</span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="h-8 text-xs font-semibold px-3 bg-primary text-primary-foreground hover:bg-primary/90">
                  Create account
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <div className="flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-mono text-amber-400">
              <Flame className="h-3 w-3 fill-current" />
              <span>3d</span>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dashboard') ? 'bg-surface-raised text-foreground' : 'text-muted-foreground'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.path) ? 'bg-surface-raised text-foreground font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isSuperAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-amber-400"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Super Admin</span>
              </Link>
            )}

            {!isSuperAdmin && isTeacher && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-purple-400"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Teacher Dashboard</span>
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/profile') ? 'bg-surface-raised text-foreground' : 'text-muted-foreground'
                }`}
              >
                <User className="h-4 w-4" />
                <span>My Profile ({user?.username})</span>
              </Link>
            )}
          </nav>

          <div className="pt-2 border-t border-border/60">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full text-xs font-semibold">
                    Create account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
