import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert,
  BookOpen,
  Terminal,
  Users,
  Search,
  CheckCircle2,
  Server,
  Layers,
  Flame,
  UserPlus,
  Power,
  KeyRound,
  GraduationCap,
  Sparkles,
  Clock,
  X,
  AlertTriangle,
} from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { courseApi } from '@/lib/course-api';
import { problemApi } from '@/lib/problem-api';
import type { TeacherSummary, CreateTeacherPayload } from '@/types/admin';
import type { CourseSummary } from '@/types/course';
import type { ProblemSummary } from '@/types/problem';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const AdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'teachers' | 'courses' | 'problems' | 'system'>('teachers');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCreateTeacherModal, setShowCreateTeacherModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherSummary | null>(null);

  // Form states
  const [teacherForm, setTeacherForm] = useState<CreateTeacherPayload>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    bio: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
    refetchInterval: 30000,
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ['admin-teachers'],
    queryFn: adminApi.getTeachers,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: courseApi.getAllCourses,
  });

  const { data: problemsPage } = useQuery({
    queryKey: ['admin-problems'],
    queryFn: () => problemApi.getProblems({ size: 50 }),
  });

  const problems = problemsPage?.content || [];

  // Mutations
  const createTeacherMutation = useMutation({
    mutationFn: adminApi.createTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowCreateTeacherModal(false);
      setTeacherForm({ fullName: '', username: '', email: '', password: '', bio: '' });
      setSuccessMessage('Teacher account created successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create teacher account');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: adminApi.toggleTeacherStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });
      setSuccessMessage('Teacher status updated');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, pass }: { id: number; pass?: string }) =>
      adminApi.resetTeacherPassword(id, pass),
    onSuccess: (msg) => {
      setShowResetPasswordModal(false);
      setNewPassword('');
      setSelectedTeacher(null);
      setSuccessMessage(msg || 'Teacher password reset successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to reset password');
    },
  });

  const handleCreateTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!teacherForm.fullName || !teacherForm.username || !teacherForm.email) {
      setFormError('Please fill in all required fields');
      return;
    }
    createTeacherMutation.mutate(teacherForm);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 py-10 space-y-8 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
            <ShieldAlert className="h-4 w-4" />
            <span className="font-semibold uppercase tracking-wider">
              {isSuperAdmin ? 'Super Admin Command Center' : 'Platform Administration Portal'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            System Operations & Teacher Governance
          </h1>
          <p className="text-xs font-mono text-muted-foreground">
            Role: <span className="text-foreground">{isSuperAdmin ? 'ROLE_SUPER_ADMIN' : 'ROLE_ADMIN'}</span> &bull; 100% Live MySQL Database &bull; Central Authority
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Button
            size="sm"
            onClick={() => {
              setFormError(null);
              setShowCreateTeacherModal(true);
            }}
            className="h-9 gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Teacher</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. Key Operational Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Teachers</span>
            <GraduationCap className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {statsLoading ? '—' : stats?.totalTeachers ?? 0}
          </div>
          <div className="text-[10px] text-muted-foreground">Faculty members</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Students</span>
            <Users className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {statsLoading ? '—' : stats?.totalStudents ?? 0}
          </div>
          <div className="text-[10px] text-muted-foreground">Active learners</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Courses</span>
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {statsLoading ? '—' : stats?.totalCourses ?? courses.length}
          </div>
          <div className="text-[10px] text-emerald-400">
            {stats?.publishedCourses ?? courses.length} published
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Drafts</span>
            <Clock className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {statsLoading ? '—' : stats?.draftCourses ?? 0}
          </div>
          <div className="text-[10px] text-muted-foreground">Unpublished</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Quizzes</span>
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {statsLoading ? '—' : stats?.totalQuizzes ?? 0}
          </div>
          <div className="text-[10px] text-muted-foreground">Assessments</div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Problems</span>
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {statsLoading ? '—' : stats?.totalProblems ?? problems.length}
          </div>
          <div className="text-[10px] text-muted-foreground">Coding challenges</div>
        </div>
      </div>

      {/* 3. Tabbed Navigation & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'teachers'
                ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Teachers ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'courses'
                ? 'bg-surface-raised text-foreground font-semibold border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'problems'
                ? 'bg-surface-raised text-foreground font-semibold border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Problems ({problems.length})
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'system'
                ? 'bg-surface-raised text-foreground font-semibold border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            System Diagnostics
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            className="pl-8 h-8 text-xs bg-surface border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Tab Content: Teachers Table */}
      {activeTab === 'teachers' && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-border bg-surface-raised text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Instructor Name</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Courses Created</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Governance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {teachersLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading teachers from database...
                    </td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No teacher accounts found. Click "+ Create Teacher" to add one.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-raised transition-colors">
                      <td className="py-3.5 px-4 font-sans font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
                            {t.fullName.charAt(0)}
                          </div>
                          <div>
                            <div>{t.fullName}</div>
                            {t.bio && (
                              <div className="text-[11px] text-muted-foreground max-w-xs truncate">
                                {t.bio}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">@{t.username}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{t.email}</td>
                      <td className="py-3.5 px-4 text-foreground font-semibold">
                        {t.courseCount}
                      </td>
                      <td className="py-3.5 px-4">
                        {t.active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>ACTIVE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                            <AlertTriangle className="h-3 w-3" />
                            <span>DISABLED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[11px] gap-1"
                            onClick={() => {
                              setSelectedTeacher(t);
                              setShowResetPasswordModal(true);
                            }}
                            title="Reset password"
                          >
                            <KeyRound className="h-3 w-3" />
                            <span>Reset Pass</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className={`h-7 px-2 text-[11px] gap-1 ${
                              t.active
                                ? 'text-amber-400 hover:text-amber-300 border-amber-500/30 hover:bg-amber-500/10'
                                : 'text-emerald-400 hover:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10'
                            }`}
                            onClick={() => toggleStatusMutation.mutate(t.id)}
                            title={t.active ? 'Disable teacher' : 'Enable teacher'}
                          >
                            <Power className="h-3 w-3" />
                            <span>{t.active ? 'Disable' : 'Enable'}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab Content: Courses Table */}
      {activeTab === 'courses' && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-border bg-surface-raised text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Modules</th>
                  <th className="py-3 px-4">Lessons</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCourses.map((c: CourseSummary) => (
                  <tr key={c.id} className="hover:bg-surface-raised transition-colors">
                    <td className="py-3.5 px-4 font-sans font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{c.title}</span>
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground">{c.slug}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-muted-foreground">
                      {c.instructor?.fullName || 'Super Admin'}
                    </td>
                    <td className="py-3.5 px-4 text-foreground">{c.category || 'General'}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={c.level === 'BEGINNER' ? 'easy' : 'medium'}>
                        {c.level}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-foreground">{c.topicCount}</td>
                    <td className="py-3.5 px-4 text-foreground">{c.lessonCount}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{c.status || 'PUBLISHED'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab Content: Problems Table */}
      {activeTab === 'problems' && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-border bg-surface-raised text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Daily POTD</th>
                  <th className="py-3 px-4">Time Limit</th>
                  <th className="py-3 px-4">Memory</th>
                  <th className="py-3 px-4 text-right">Acceptance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {problems.map((p: ProblemSummary) => (
                  <tr key={p.id} className="hover:bg-surface-raised transition-colors">
                    <td className="py-3 px-4 text-muted-foreground">#{p.id}</td>
                    <td className="py-3 px-4 font-sans font-medium text-foreground">{p.title}</td>
                    <td className="py-3 px-4">
                      <Badge variant={p.difficulty === 'EASY' ? 'easy' : 'medium'}>
                        {p.difficulty}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {p.isDailyChallenge ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Flame className="h-3 w-3 fill-current" />
                          <span>ACTIVE</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">2000ms</td>
                    <td className="py-3 px-4 text-muted-foreground">256MB</td>
                    <td className="py-3 px-4 text-right text-foreground font-semibold">
                      {p.acceptanceRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Tab Content: System Diagnostics */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <span>Runtime Engine Telemetry</span>
            </h3>
            <div className="space-y-2.5 text-muted-foreground">
              <div className="flex justify-between">
                <span>JVM Runtime:</span>
                <span className="text-foreground">OpenJDK 21.0.10 (LTS)</span>
              </div>
              <div className="flex justify-between">
                <span>Spring Boot:</span>
                <span className="text-foreground">3.3.3 (Web, JPA, Security, Flyway)</span>
              </div>
              <div className="flex justify-between">
                <span>Database Engine:</span>
                <span className="text-emerald-400">MySQL 5.5+ (HikariCP Pool)</span>
              </div>
              <div className="flex justify-between">
                <span>Flyway Migration Version:</span>
                <span className="text-foreground">V4 — Admin Teacher CMS Schema</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span>Security & Sandbox Isolation</span>
            </h3>
            <div className="space-y-2.5 text-muted-foreground">
              <div className="flex justify-between">
                <span>Role Hierarchy:</span>
                <span className="text-foreground">SUPER_ADMIN &gt; TEACHER &gt; STUDENT</span>
              </div>
              <div className="flex justify-between">
                <span>Authentication:</span>
                <span className="text-foreground">Stateless JWT (HMAC-SHA256, 24h)</span>
              </div>
              <div className="flex justify-between">
                <span>Teacher Self-Registration:</span>
                <span className="text-amber-400">BLOCKED (Admin Provisioned Only)</span>
              </div>
              <div className="flex justify-between">
                <span>Hidden Test Cases:</span>
                <span className="text-foreground">Redacted from Student DTOs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TEACHER MODAL */}
      {showCreateTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
                  <UserPlus className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Create Teacher Account</h3>
              </div>
              <button
                onClick={() => setShowCreateTeacherModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTeacherSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-muted-foreground">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Shradha Khapra"
                  value={teacherForm.fullName}
                  onChange={(e) => setTeacherForm({ ...teacherForm, fullName: e.target.value })}
                  className="bg-surface border-border text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Username *</label>
                  <Input
                    required
                    placeholder="e.g. shradha_teacher"
                    value={teacherForm.username}
                    onChange={(e) => setTeacherForm({ ...teacherForm, username: e.target.value })}
                    className="bg-surface border-border text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-muted-foreground">Email Address *</label>
                  <Input
                    required
                    type="email"
                    placeholder="e.g. shradha@apnacollege.com"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="bg-surface border-border text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground">Initial Password (Optional — defaults to secure random)</label>
                <Input
                  type="password"
                  placeholder="Leave empty for auto-generated password"
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                  className="bg-surface border-border text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground">Instructor Bio</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of teaching background, expertise, or institution..."
                  value={teacherForm.bio}
                  onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateTeacherModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createTeacherMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {createTeacherMutation.isPending ? 'Provisioning...' : 'Provision Teacher'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetPasswordModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-400" />
                <h3 className="text-base font-semibold text-foreground">
                  Reset Password: {selectedTeacher.fullName}
                </h3>
              </div>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Enter a new temporary or permanent password for @{selectedTeacher.username}, or leave empty to auto-generate a temporary 10-character password.
            </p>

            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-muted-foreground">New Password</label>
              <Input
                type="password"
                placeholder="Optional new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-surface border-border text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowResetPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  resetPasswordMutation.mutate({
                    id: selectedTeacher.id,
                    pass: newPassword.trim() || undefined,
                  })
                }
                disabled={resetPasswordMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
              >
                {resetPasswordMutation.isPending ? 'Resetting...' : 'Confirm Password Reset'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
