import {
  CalendarClock, Plus, Copy, Pencil, FileText, Clock, Award, Percent,
  Languages, CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { showToast } from '@/components/shared/toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BLUEPRINTS, type Blueprint } from '@/data/tests';

export function ExamBlueprintsPage() {
  return (
    <div>
      <PageHeader
        title="Exam Blueprints"
        description="Reusable exam pattern templates defining sections, marks, duration, and marking scheme."
        icon={<CalendarClock className="h-5 w-5" />}
        actions={<Button size="sm" onClick={() => showToast.info('New Blueprint', 'Blueprint editor would open here.')}><Plus className="mr-1.5 h-4 w-4" /> New Blueprint</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {BLUEPRINTS.map((bp) => (
          <BlueprintCard key={bp.id} bp={bp} />
        ))}
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, none }: { icon: typeof Clock; label: string; value: string; none?: boolean }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className={cn('mt-1.5 font-display text-lg font-bold tracking-tight', none ? 'text-muted-foreground' : 'text-foreground')}>{value}</p>
    </div>
  );
}

function BlueprintCard({ bp }: { bp: Blueprint }) {
  const totalSectionQ = bp.sections.reduce((a, s) => a + s.questions, 0);
  const totalSectionM = bp.sections.reduce((a, s) => a + s.marks, 0);
  const totalSectionD = bp.sections.reduce((a, s) => a + s.duration, 0);

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{bp.id}</span>
              <StatusBadge tone="info">{bp.patternVersion}</StatusBadge>
            </div>
            <h3 className="mt-1.5 font-display text-base font-semibold leading-tight">{bp.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{bp.examName}</p>
          </div>
          <StatusBadge tone="neutral" className="shrink-0">
            <Clock className="mr-1 h-3 w-3" /> {bp.effectiveDate}
          </StatusBadge>
        </div>

        {/* Summary tiles */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatTile icon={CheckCircle2} label="Questions" value={String(bp.totalQuestions)} />
          <StatTile icon={Award} label="Marks" value={String(bp.totalMarks)} />
          <StatTile icon={Clock} label="Duration" value={`${bp.durationMin}m`} />
          <StatTile icon={Percent} label="Neg. Mark" value={bp.negativeMarking ? String(bp.negativeMarking) : 'None'} none={bp.negativeMarking === 0} />
        </div>

        {/* Sections table */}
        <div className="mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-2.5 font-medium">Section</th>
                <th className="w-12 p-2.5 text-right font-medium">Qns</th>
                <th className="w-12 p-2.5 text-right font-medium">Marks</th>
                <th className="w-16 p-2.5 text-right font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {bp.sections.map((s) => (
                <tr key={s.name} className="border-t">
                  <td className="p-2.5 text-xs font-medium">{s.name}</td>
                  <td className="p-2.5 text-right text-xs">{s.questions}</td>
                  <td className="p-2.5 text-right text-xs">{s.marks}</td>
                  <td className="p-2.5 text-right text-xs text-muted-foreground">{s.duration === 0 ? 'Shared' : `${s.duration}m`}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-muted/30 text-xs font-semibold">
              <tr>
                <td className="p-2.5">Total</td>
                <td className="p-2.5 text-right">{totalSectionQ}</td>
                <td className="p-2.5 text-right">{totalSectionM}</td>
                <td className="p-2.5 text-right text-muted-foreground">{totalSectionD === 0 ? 'Shared' : `${totalSectionD}m`}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Languages */}
        <div className="mt-4 flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Languages:</span>
          <div className="flex flex-wrap gap-1.5">
            {bp.languages.map((l) => <StatusBadge key={l} tone="neutral">{l}</StatusBadge>)}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-5">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => showToast.info('Edit blueprint', `${bp.id} — ${bp.name}`)}>
            <Pencil className="mr-1.5 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => showToast.info('Duplicated blueprint', `${bp.id} copy created.`)}>
            <Copy className="mr-1.5 h-4 w-4" /> Duplicate
          </Button>
          <Button size="sm" className="flex-1" onClick={() => showToast.success('Test started', `Building a new test from ${bp.id}.`)}>
            <FileText className="mr-1.5 h-4 w-4" /> Use for Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
