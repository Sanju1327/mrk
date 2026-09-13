import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye, EyeOff, AlertCircle, ArrowLeft, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const managementLoginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

type ManagementLoginFormValues = z.infer<typeof managementLoginSchema>;

export const ManagementLoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManagementLoginFormValues>({
    resolver: zodResolver(managementLoginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  });

  const onSubmit = async (values: ManagementLoginFormValues) => {
    setError(null);
    try {
      const cleanIdentifier = values.usernameOrEmail.trim();
      await login({
        usernameOrEmail: cleanIdentifier,
        password: values.password,
      });
      // State updates automatically trigger ManagementRoute to render
      // TEACHER -> Teacher Dashboard
      // SUPER_ADMIN -> Super Admin Dashboard
      // STUDENT -> ManagementAccessDenied
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Invalid email or password.');
      } else {
        setError('Authentication server error. Please verify backend connectivity.');
      }
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6 p-8 rounded-xl border border-amber-500/30 bg-surface/90 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-primary to-cyan-500" />

        <div className="space-y-3 text-center">
          {/* Mascot & Emblem */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-amber-500/20 blur-lg" />
              <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl border border-amber-500/40 bg-surface-raised overflow-hidden shadow-md">
                <img
                  src="/favicon.png"
                  alt="CodeCraft Emblem"
                  className="h-12 w-12 object-contain drop-shadow"
                />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-medium text-amber-400">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Faculty &amp; Platform Portal</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Teacher / Super Admin Login</h1>
            <p className="text-xs text-muted-foreground">
              Direct access for course instructors (Teachers) and platform owners (Super Admin)
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <div className="space-y-2">
            <label htmlFor="management-username" className="text-sm font-medium text-foreground/90 flex items-center justify-between">
              <span>Teacher or Super Admin Email / Username</span>
              <span className="text-[11px] text-muted-foreground font-mono">Sanju@gmail.com</span>
            </label>
            <Input
              id="management-username"
              type="text"
              placeholder="e.g. Sanju@gmail.com or instructor username"
              autoComplete="username"
              className="border-border focus:border-amber-500/60 focus:ring-amber-500/20"
              {...register('usernameOrEmail')}
            />
            {errors.usernameOrEmail && (
              <p className="text-xs text-destructive">{errors.usernameOrEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="management-password" className="text-sm font-medium text-foreground/90">
              Password
            </label>
            <div className="relative">
              <Input
                id="management-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                autoComplete="current-password"
                className="pr-10 border-border focus:border-amber-500/60 focus:ring-amber-500/20"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg shadow-amber-500/10 gap-2"
            disabled={isLoading}
          >
            <Shield className="h-4 w-4" />
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Management Portal'}
          </Button>
        </form>

        <div className="pt-2 border-t border-border/60 flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <p>
            Are you a student learner?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Go to Student Login &rarr;
            </Link>
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-muted-foreground/80 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Return to CodeCraft Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
