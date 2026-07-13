import type { ReactNode } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FilterOption { label: string; value: string }
export interface FilterDef { key: string; label: string; options: FilterOption[] }

interface FilterBarProps {
  filters: FilterDef[]; values: Record<string, string>;
  onChange: (key: string, value: string) => void; onClear: () => void;
  extra?: ReactNode; className?: string;
}

export function FilterBar({ filters, values, onChange, onClear, extra, className }: FilterBarProps) {
  const activeCount = Object.values(values).filter((v) => v && v !== 'all').length;
  return (
    <div className={cn('flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2.5', className)}>
      <SlidersHorizontal className="ml-1 h-4 w-4 text-muted-foreground" />
      {filters.map((f) => (
        <Select key={f.key} value={values[f.key] ?? 'all'} onValueChange={(v) => onChange(f.key, v)}>
          <SelectTrigger className="h-8 w-auto min-w-[140px] gap-1.5 text-xs">
            <span className="text-muted-foreground">{f.label}:</span><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {f.label.toLowerCase()}</SelectItem>
            {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ))}
      {extra}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={onClear}><X className="h-3.5 w-3.5" /> Clear ({activeCount})</Button>
      )}
    </div>
  );
}
