import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode; title: string; description?: string;
  action?: ReactNode; className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center', className)}>
      {icon && <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface ErrorStateProps { title?: string; description?: string; action?: ReactNode }

export function ErrorState({ title = 'Something went wrong', description, action }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive text-2xl font-bold">!</div>
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
