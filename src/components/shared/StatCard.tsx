import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string; value: string | number; icon: LucideIcon;
  delta?: { value: string; positive: boolean }; sublabel?: string;
  tone?: 'primary' | 'info' | 'success' | 'warning' | 'destructive' | 'accent';
  className?: string;
}

const TONE_BG: Record<string, string> = {
  primary: 'bg-primary/10 text-primary', info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success', warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive', accent: 'bg-brand-accent/10 text-brand-accent',
};

export function StatCard({ label, value, icon: Icon, delta, sublabel, tone = 'primary', className }: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden p-5 transition-shadow hover:shadow-md', className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', TONE_BG[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(delta || sublabel) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {delta && (
            <span className={cn('inline-flex items-center gap-0.5 font-semibold', delta.positive ? 'text-success' : 'text-destructive')}>
              {delta.positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {delta.value}
            </span>
          )}
          {sublabel && <span className="text-muted-foreground">{sublabel}</span>}
        </div>
      )}
    </Card>
  );
}
