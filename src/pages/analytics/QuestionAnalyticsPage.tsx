import { BarChart3, Download, Target, Clock, AlertCircle, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/shared/toast';
import { cn } from '@/lib/utils';
import { QUESTIONS } from '@/data/questions';
import { OPTION_DISTRIBUTION, SECTION_PERFORMANCE } from '@/data/analytics';

const DIFFICULTY_QUESTIONS = QUESTIONS
  .slice()
  .sort((a, b) => a.studentAccuracy - b.studentAccuracy)
  .slice(0, 10)
  .map((q, i) => ({
    ...q,
    discrimination: Number((0.18 + ((i * 13) % 38) / 100).toFixed(2)),
    complaints: (i * 3) % 12,
  }));

const SCATTER_BUCKETS = [
  { label: 'High difficulty, high discrimination', count: 8, tone: 'success' as const, x: 'Hard', y: 'High DI' },
  { label: 'High difficulty, low discrimination', count: 5, tone: 'destructive' as const, x: 'Hard', y: 'Low DI' },
  { label: 'Moderate, high discrimination', count: 14, tone: 'primary' as const, x: 'Moderate', y: 'High DI' },
  { label: 'Moderate, low discrimination', count: 7, tone: 'warning' as const, x: 'Moderate', y: 'Low DI' },
  { label: 'Easy, high discrimination', count: 11, tone: 'info' as const, x: 'Easy', y: 'High DI' },
  { label: 'Easy, low discrimination', count: 3, tone: 'neutral' as const, x: 'Easy', y: 'Low DI' },
];

const tooltipStyle = {
  background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))',
  borderRadius: 8, fontSize: 12, color: 'hsl(var(--popover-foreground))',
};

export function QuestionAnalyticsPage() {
  const columns: Column<(typeof DIFFICULTY_QUESTIONS)[number]>[] = [
    {
      key: 'stem', header: 'Question', cell: (r) => (
        <div className="max-w-[320px]">
          <p className="truncate font-medium">{r.id} - {r.stem}</p>
          <p className="text-xs text-muted-foreground">{r.subject} - {r.topic}</p>
        </div>
      ),
    },
    { key: 'difficulty', header: 'Difficulty', cell: (r) => <StatusBadge tone={r.difficulty === 'Easy' ? 'success' : r.difficulty === 'Moderate' ? 'info' : r.difficulty === 'Hard' ? 'warning' : 'destructive'} className="text-[10px]">{r.difficulty}</StatusBadge> },
    { key: 'accuracy', header: 'Accuracy', sortValue: (r) => r.studentAccuracy, cell: (r) => <span className="font-semibold text-warning">{r.studentAccuracy}%</span> },
    { key: 'skip', header: 'Skip Rate', sortValue: (r) => r.avgResponseSec, cell: (r) => <span>{Math.round(r.avgResponseSec / 8)}%</span> },
    { key: 'discrimination', header: 'Discrimination', sortValue: (r) => r.discrimination, cell: (r) => <span className={cn('font-semibold', r.discrimination < 0.2 ? 'text-destructive' : 'text-success')}>{r.discrimination.toFixed(2)}</span> },
    { key: 'complaints', header: 'Complaints', sortValue: (r) => r.complaints, cell: (r) => <span className={cn('inline-flex items-center gap-1', r.complaints > 5 ? 'text-destructive' : 'text-muted-foreground')}><AlertCircle className="h-3.5 w-3.5" />{r.complaints}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Question Analytics"
        description="Question-level accuracy, difficulty, and discrimination."
        icon={<BarChart3 className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => showToast.success('Export started', 'Question analytics report is being generated.')}>
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Questions" value="42,180" icon={BarChart3} delta={{ value: '860 new', positive: true }} sublabel="this month" tone="primary" />
        <StatCard label="Avg Accuracy" value="61.3%" icon={Target} delta={{ value: '0.5%', positive: false }} sublabel="across all questions" tone="info" />
        <StatCard label="Avg Response Time" value="47 sec" icon={Clock} delta={{ value: '2 sec', positive: true }} sublabel="per question" tone="success" />
        <StatCard label="Avg Skip Rate" value="14.2%" icon={TrendingDown} delta={{ value: '0.8%', positive: false }} sublabel="across attempts" tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Option Distribution</CardTitle><p className="text-xs text-muted-foreground">Response count per option (correct highlighted)</p></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={OPTION_DISTRIBUTION} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="option" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Responses">
                  {OPTION_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.option} fill={entry.option.includes('correct') ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Section Performance by Accuracy</CardTitle><p className="text-xs text-muted-foreground">Average student accuracy per section</p></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={SECTION_PERFORMANCE} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="section" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} name="Accuracy %">
                  {SECTION_PERFORMANCE.map((entry) => (
                    <Cell key={entry.section} fill={entry.accuracy >= 65 ? 'hsl(var(--chart-3))' : entry.accuracy >= 55 ? 'hsl(var(--chart-4))' : 'hsl(var(--chart-5))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div><CardTitle className="text-base">Most Difficult Questions</CardTitle><p className="text-xs text-muted-foreground">Top 10 by lowest student accuracy</p></div>
          <StatusBadge tone="warning" dot>10 flagged</StatusBadge>
        </CardHeader>
        <CardContent>
          <DataTable
            data={DIFFICULTY_QUESTIONS}
            columns={columns}
            getRowId={(r) => r.id}
            searchKeys={(r) => `${r.id} ${r.stem} ${r.subject} ${r.topic}`}
            selectable={false}
            pageSize={10}
            initialSort={{ key: 'accuracy', dir: 'asc' }}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Difficulty vs Discrimination</CardTitle><p className="text-xs text-muted-foreground">Question distribution by difficulty and discrimination index</p></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SCATTER_BUCKETS.map((b) => (
              <div key={b.label} className="rounded-lg border bg-muted/30 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{b.x}</span>
                  <StatusBadge tone={b.tone} className="text-[10px]">{b.count}</StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">{b.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-muted-foreground">All question analytics values are demonstration data for prototype evaluation only.</p>
    </div>
  );
}
