import React from 'react';
import { Archive, CheckCircle2, Clock } from 'lucide-react';
import type { CourseStatus } from '@/types/course';

export const CourseStatusBadge: React.FC<{ status: CourseStatus; className?: string }> = ({ status, className = '' }) => {
  if (status === 'PUBLISHED') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-semibold ${className}`}>
        <CheckCircle2 className="h-3 w-3" /> PUBLISHED
      </span>
    );
  }
  if (status === 'ARCHIVED') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-raised text-muted-foreground border border-border text-[11px] font-mono font-semibold ${className}`}>
        <Archive className="h-3 w-3" /> ARCHIVED
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono font-semibold ${className}`}>
      <Clock className="h-3 w-3" /> DRAFT
    </span>
  );
};
