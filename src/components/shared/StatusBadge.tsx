import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'success' | 'warning' | 'info' | 'destructive' | 'neutral' | 'primary' | 'accent';

const TONE_STYLES: Record<Tone, string> = {
  default: 'bg-secondary text-secondary-foreground border-transparent',
  success: 'bg-success/15 text-success border-success/25',
  warning: 'bg-warning/15 text-warning border-warning/25',
  info: 'bg-info/15 text-info border-info/25',
  destructive: 'bg-destructive/15 text-destructive border-destructive/25',
  neutral: 'bg-muted text-muted-foreground border-transparent',
  primary: 'bg-primary/15 text-primary border-primary/25',
  accent: 'bg-brand-accent/15 text-brand-accent border-brand-accent/25',
};

const DOT_STYLES: Record<Tone, string> = {
  default: 'bg-secondary-foreground/50', success: 'bg-success', warning: 'bg-warning',
  info: 'bg-info', destructive: 'bg-destructive', neutral: 'bg-muted-foreground/50',
  primary: 'bg-primary', accent: 'bg-brand-accent',
};

interface StatusBadgeProps { tone?: Tone; dot?: boolean; children: React.ReactNode; className?: string }

export function StatusBadge({ tone = 'neutral', dot = false, children, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('border font-medium', TONE_STYLES[tone], className)}>
      {dot && <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', DOT_STYLES[tone])} />}
      {children}
    </Badge>
  );
}

export function questionStatusTone(status: string): Tone {
  switch (status) {
    case 'Approved': return 'success'; case 'Under Review': return 'info';
    case 'Needs Fix': return 'warning'; case 'Rejected': return 'destructive';
    case 'Archived': return 'neutral'; case 'Draft': return 'default'; default: return 'neutral';
  }
}

export function testStatusTone(status: string): Tone {
  switch (status) {
    case 'Live': return 'success'; case 'Scheduled': return 'info';
    case 'Under QA': return 'warning'; case 'Content Ready': return 'primary';
    case 'Completed': return 'neutral'; case 'Archived': return 'neutral';
    case 'Draft': return 'default'; default: return 'neutral';
  }
}

export function supportStatusTone(status: string): Tone {
  switch (status) {
    case 'New': return 'info'; case 'Investigating': return 'warning';
    case 'Waiting for User': return 'default'; case 'Corrected': return 'primary';
    case 'Rejected': return 'destructive'; case 'Resolved': return 'success'; default: return 'neutral';
  }
}

export function difficultyTone(d: string): Tone {
  return d === 'Easy' ? 'success' : d === 'Moderate' ? 'info' : d === 'Hard' ? 'warning' : 'destructive';
}
