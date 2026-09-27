export type Notify = (type: 'success' | 'error', text: string) => void;

export const inputClass = 'bg-surface border-border text-xs';
export const textareaClass =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans';
export const selectClass =
  'w-full h-9 rounded-md border border-border bg-surface px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500';
export const labelClass = 'text-muted-foreground';
