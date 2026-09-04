import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, BookOpen, Terminal, Trophy, User, ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CodeCraft
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground">
            <Link to="/courses" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <BookOpen className="h-4 w-4" />
              <span>Courses</span>
            </Link>
            <Link to="/problems" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Terminal className="h-4 w-4" />
              <span>Problems</span>
            </Link>
            <Link to="/quizzes" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Trophy className="h-4 w-4" />
              <span>Quizzes</span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors">
                <ShieldAlert className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user?.fullName || user?.username || 'Dashboard'}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
