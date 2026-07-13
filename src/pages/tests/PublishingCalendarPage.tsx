import { useMemo, useState } from 'react';
import {
  CalendarClock, ChevronLeft, ChevronRight, Plus, Rocket, Clock, Eye, Calendar,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, testStatusTone } from '@/components/shared/StatusBadge';
import { showToast } from '@/components/shared/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TESTS, type Test } from '@/data/tests';
import { EXAMS, EXAM_FAMILIES, type ExamFamily } from '@/data/exams';

const FAMILY_DOT: Record<ExamFamily, string> = {
  SSC: 'bg-info',
  Banking: 'bg-success',
  Railway: 'bg-warning',
  'Punjab State': 'bg-brand-accent',
};

const FAMILY_RING: Record<ExamFamily, string> = {
  SSC: 'border-l-info',
  Banking: 'border-l-success',
  Railway: 'border-l-warning',
  'Punjab State': 'border-l-brand-accent',
};

const FAMILY_CHIP: Record<ExamFamily | 'All', string> = {
  All: 'border-primary bg-primary/10 text-primary',
  SSC: 'border-info/30 bg-info/10 text-info',
  Banking: 'border-success/30 bg-success/10 text-success',
  Railway: 'border-warning/30 bg-warning/10 text-warning',
  'Punjab State': 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent',
};

const examFamily = (code: string): ExamFamily => EXAMS.find((e) => e.code === code)?.family ?? 'SSC';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CAL_YEAR = 2026;
const CAL_MONTH = 6; // July (0-indexed)
const CAL_MONTH_LABEL = 'July 2026';

export function PublishingCalendarPage() {
  const [family, setFamily] = useState<ExamFamily | 'All'>('All');
  const [monthOffset, setMonthOffset] = useState(0);

  const scheduled = useMemo(() => TESTS.filter((t) => t.scheduledDate), []);

  const byDate = useMemo(() => {
    const map: Record<string, Test[]> = {};
    scheduled.forEach((t) => {
      if (!t.scheduledDate) return;
      (map[t.scheduledDate] ??= []).push(t);
    });
    return map;
  }, [scheduled]);

  const filteredByDate = useMemo(() => {
    if (family === 'All') return byDate;
    const map: Record<string, Test[]> = {};
    Object.entries(byDate).forEach(([date, tests]) => {
      const f = tests.filter((t) => examFamily(t.exam) === family);
      if (f.length) map[date] = f;
    });
    return map;
  }, [byDate, family]);

  const daysInMonth = new Date(CAL_YEAR, CAL_MONTH + 1, 0).getDate();
  const firstWeekday = new Date(CAL_YEAR, CAL_MONTH, 1).getDay();

  const todayISO = new Date().toISOString().slice(0, 10);

  const upcoming = useMemo(
    () =>
      [...scheduled]
        .filter((t) => family === 'All' || examFamily(t.exam) === family)
        .sort((a, b) => (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''))
        .slice(0, 12),
    [scheduled, family],
  );

  const monthLabel = monthOffset === 0 ? CAL_MONTH_LABEL : `${CAL_MONTH_LABEL} ${monthOffset > 0 ? `+${monthOffset}mo` : `${monthOffset}mo`}`;

  return (
    <div>
      <PageHeader
        title="Publishing Calendar"
        description="Schedule and track test releases across all exam categories."
        icon={<CalendarClock className="h-5 w-5" />}
        actions={<Button size="sm" onClick={() => showToast.info('Schedule Test', 'Test scheduling form would open here.')}><Plus className="mr-1.5 h-4 w-4" /> Schedule Test</Button>}
      />

      {/* Family filter chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['All', ...EXAM_FAMILIES] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFamily(f)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              family === f ? FAMILY_CHIP[f] : 'border-border bg-card text-muted-foreground hover:bg-muted',
            )}
          >
            {f === 'All' ? 'All Families' : f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{monthLabel}</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonthOffset((m) => m - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="h-8" onClick={() => setMonthOffset(0)}>Today</Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonthOffset((m) => m + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((d) => (
                <div key={d} className="pb-1 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">{d}</div>
              ))}
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`b-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateISO = `${CAL_YEAR}-${String(CAL_MONTH + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayTests = filteredByDate[dateISO] ?? [];
                const isToday = dateISO === todayISO;
                return (
                  <div
                    key={day}
                    className={cn(
                      'min-h-[88px] rounded-lg border p-1.5 text-left',
                      isToday ? 'border-primary bg-primary/5' : 'border-border bg-muted/20',
                    )}
                  >
                    <span className={cn('text-xs font-semibold', isToday ? 'text-primary' : 'text-muted-foreground')}>{day}</span>
                    <div className="mt-1 space-y-1">
                      {dayTests.slice(0, 3).map((t) => {
                        const fam = examFamily(t.exam);
                        return (
                          <div key={t.id} className={cn('truncate rounded border-l-2 bg-background px-1.5 py-0.5 text-[10px] font-medium text-foreground', FAMILY_RING[fam])}>
                            {t.name}
                          </div>
                        );
                      })}
                      {dayTests.length > 3 && (
                        <p className="px-1 text-[10px] font-medium text-muted-foreground">+{dayTests.length - 3} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3">
              <span className="text-xs font-medium text-muted-foreground">Family colors:</span>
              {EXAM_FAMILIES.map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <span className={cn('h-2.5 w-2.5 rounded-full', FAMILY_DOT[f])} />
                  <span className="text-xs text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming releases */}
        <Card>
          <CardHeader className="space-y-0">
            <CardTitle className="text-base">Upcoming Releases</CardTitle>
            <p className="text-xs text-muted-foreground">{upcoming.length} scheduled tests</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((t) => {
              const fam = examFamily(t.exam);
              return (
                <div key={t.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={cn('h-2 w-2 shrink-0 rounded-full', FAMILY_DOT[fam])} />
                        {t.examName} · {fam}
                      </p>
                    </div>
                    <StatusBadge tone={testStatusTone(t.status)} dot className="shrink-0">{t.status}</StatusBadge>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t.scheduledDate}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />10:00 AM</span>
                    <span className="flex items-center gap-1"><Rocket className="h-3 w-3" />{t.attempts.toLocaleString()} enrolled</span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 flex-1 text-xs" onClick={() => showToast.success('Published', `${t.name} is now live.`)}><Rocket className="mr-1 h-3 w-3" /> Publish Now</Button>
                    <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={() => showToast.info('Reschedule', `${t.name} date picker would open.`)}>Reschedule</Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => showToast.info('Preview', `Previewing ${t.name}.`)}><Eye className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              );
            })}
            {upcoming.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No scheduled tests for this family.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
