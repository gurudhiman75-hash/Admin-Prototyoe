import { useState } from 'react';
import {
  Box, Plus, MoreHorizontal, Copy, Archive, GripVertical, Calendar, Users,
  CheckCircle2, FileText, Languages, ChevronDown, ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { showToast } from '@/components/shared/toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { TEST_SERIES, TESTS, type TestSeries } from '@/data/tests';

const seriesTests = (seriesName: string): typeof TESTS =>
  TESTS.filter((t) => t.series === seriesName).slice(0, 6);
const fallbackTests = (id: string): typeof TESTS => TESTS.filter((_, i) => i % 6 === Number(id.slice(-1)) % 6).slice(0, 4);

export function TestSeriesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));
  const act = (label: string, s: TestSeries) => showToast.info(`${label}`, `Applied to ${s.id} — ${s.name}`);

  const columns: Column<TestSeries>[] = [
    {
      key: 'name', header: 'Series Name',
      cell: (s) => (
        <div className="flex items-center gap-2 min-w-[220px]">
          <button onClick={() => toggle(s.id)} className="text-muted-foreground hover:text-foreground" aria-label="Toggle">
            {expanded === s.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div>
            <p className="font-medium text-foreground">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.id}</p>
          </div>
        </div>
      ),
      sortValue: (s) => s.name,
    },
    { key: 'exam', header: 'Exam', cell: (s) => <span className="text-sm">{s.examName}</span>, sortValue: (s) => s.examName, hideOnMobile: true },
    {
      key: 'testsCount', header: 'Tests',
      cell: (s) => <span className="text-sm font-medium">{s.testsCount}</span>,
      sortValue: (s) => s.testsCount,
    },
    {
      key: 'breakdown', header: 'Free / Paid', hideOnMobile: true,
      cell: (s) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge tone="success">{s.freeTests} Free</StatusBadge>
          <StatusBadge tone="primary">{s.paidTests} Paid</StatusBadge>
        </div>
      ),
    },
    {
      key: 'validityDays', header: 'Validity', hideOnMobile: true,
      cell: (s) => <span className="text-sm text-muted-foreground">{s.validityDays} days</span>,
      sortValue: (s) => s.validityDays,
    },
    {
      key: 'language', header: 'Language', hideOnMobile: true,
      cell: (s) => <span className="flex items-center gap-1.5 text-sm"><Languages className="h-3.5 w-3.5 text-muted-foreground" />{s.language}</span>,
    },
    {
      key: 'enrolments', header: 'Enrolments',
      cell: (s) => <span className="text-sm font-medium">{s.enrolments.toLocaleString()}</span>,
      sortValue: (s) => s.enrolments,
    },
    {
      key: 'completionRate', header: 'Completion', hideOnMobile: true,
      cell: (s) => (
        <div className="flex items-center gap-2 w-32">
          <Progress value={s.completionRate} className="h-2" />
          <span className="text-xs font-medium text-muted-foreground">{s.completionRate}%</span>
        </div>
      ),
      sortValue: (s) => s.completionRate,
    },
    {
      key: 'status', header: 'Status',
      cell: (s) => {
        const tone = s.status === 'Active' ? 'success' : 'neutral';
        return <StatusBadge tone={tone} dot>{s.status}</StatusBadge>;
      },
      sortValue: (s) => s.status,
    },
    {
      key: 'actions', header: '', className: 'w-10 text-right',
      cell: (s) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => act('Reorder Tests', s)}><GripVertical className="mr-2 h-4 w-4" /> Reorder Tests</DropdownMenuItem>
              <DropdownMenuItem onClick={() => act('Add Tests', s)}><Plus className="mr-2 h-4 w-4" /> Add Tests</DropdownMenuItem>
              <DropdownMenuItem onClick={() => act('Duplicate', s)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => act('Archive', s)}><Archive className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Test Series"
        description="Manage grouped test packages for each exam."
        icon={<Box className="h-5 w-5" />}
        actions={<Button size="sm" onClick={() => showToast.info('New Series', 'Series creation form would open here.')}><Plus className="mr-1.5 h-4 w-4" /> New Series</Button>}
      />

      <Card className="p-4">
        <DataTable
          data={TEST_SERIES}
          columns={columns}
          getRowId={(s) => s.id}
          searchable
          searchKeys={(s) => `${s.name} ${s.id} ${s.examName}`}
          selectable={false}
          initialSort={{ key: 'name', dir: 'asc' }}
        />
      </Card>

      {expanded && (
        <Card className="mt-3 p-5">
          {(() => {
            const series = TEST_SERIES.find((s) => s.id === expanded);
            if (!series) return null;
            const tests = seriesTests(series.name).length ? seriesTests(series.name) : fallbackTests(series.id);
            return (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold">{series.name}</h3>
                    <p className="text-xs text-muted-foreground">{series.examName} · {series.testsCount} tests · {series.freeTests} free / {series.paidTests} paid</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge tone="info"><Calendar className="mr-1 h-3 w-3" /> {series.validityDays} days validity</StatusBadge>
                    <StatusBadge tone="primary"><Users className="mr-1 h-3 w-3" /> {series.enrolments.toLocaleString()} enrolled</StatusBadge>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="p-3 font-medium">Test Name</th>
                        <th className="p-3 font-medium">Type</th>
                        <th className="p-3 font-medium">Access</th>
                        <th className="p-3 font-medium">Questions</th>
                        <th className="p-3 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((t) => (
                        <tr key={t.id} className="border-t">
                          <td className="p-3">
                            <p className="font-medium text-foreground">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.id}</p>
                          </td>
                          <td className="p-3"><StatusBadge tone="info">{t.type}</StatusBadge></td>
                          <td className="p-3"><StatusBadge tone={t.access === 'Free' ? 'success' : 'primary'}>{t.access}</StatusBadge></td>
                          <td className="p-3"><span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-muted-foreground" />{t.totalQuestions}</span></td>
                          <td className="p-3"><span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />{t.durationMin} min</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Showing {tests.length} of {series.testsCount} tests in this series.
                </div>
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
}
