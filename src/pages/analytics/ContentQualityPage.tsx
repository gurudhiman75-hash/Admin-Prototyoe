import { Activity, Download, AlertTriangle, CheckCircle2, FileQuestion, Languages, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { showToast } from '@/components/shared/toast';
import { cn } from '@/lib/utils';
import { CONTENT_COVERAGE } from '@/data/analytics';

const QUALITY_ISSUES = [
  { label: 'Pending Reviews', count: 18, detail: 'awaiting reviewer', tone: 'warning' as const, max: 100 },
  { label: 'Validation Failures', count: 42, detail: '8.2% of submissions', tone: 'destructive' as const, max: 100 },
  { label: 'Duplicate Warnings', count: 7, detail: 'potential duplicates flagged', tone: 'info' as const, max: 100 },
  { label: 'Missing Translations', count: 23, detail: 'Punjabi: 15, Hindi: 8', tone: 'warning' as const, max: 100 },
  { label: 'Weak Explanations', count: 31, detail: 'below min word count', tone: 'info' as const, max: 100 },
  { label: 'Outdated Questions', count: 89, detail: 'not updated in 12+ months', tone: 'destructive' as const, max: 100 },
];

const REVIEW_THROUGHPUT = [
  { day: 'Mon', reviews: 42 }, { day: 'Tue', reviews: 58 },
  { day: 'Wed', reviews: 35 }, { day: 'Thu', reviews: 67 },
  { day: 'Fri', reviews: 71 }, { day: 'Sat', reviews: 28 },
  { day: 'Sun', reviews: 18 },
];

const tooltipStyle = {
  background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))',
  borderRadius: 8, fontSize: 12, color: 'hsl(var(--popover-foreground))',
};

export function ContentQualityPage() {
  return (
    <div>
      <PageHeader
        title="Content Quality"
        description="Monitor content health and review pipeline."
        icon={<Activity className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => showToast.success('Export started', 'Content quality report is being generated.')}>
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending Reviews" value="18" icon={Clock} delta={{ value: '3 urgent', positive: false }} sublabel="in review queue" tone="warning" />
        <StatCard label="Validation Failures" value="8.2%" icon={AlertTriangle} delta={{ value: '1.1%', positive: false }} sublabel="42 questions" tone="destructive" />
        <StatCard label="Missing Translations" value="23" icon={Languages} sublabel="Punjabi: 15, Hindi: 8" tone="info" />
        <StatCard label="Outdated Questions" value="89" icon={FileQuestion} sublabel="12+ months stale" tone="accent" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle className="text-base">Quality Issues Breakdown</CardTitle><p className="text-xs text-muted-foreground">Issue types with current counts</p></div>
            <StatusBadge tone="destructive" dot>210 total</StatusBadge>
          </CardHeader>
          <CardContent className="space-y-4">
            {QUALITY_ISSUES.map((issue) => (
              <div key={issue.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{issue.label}</span>
                    <StatusBadge tone={issue.tone} className="text-[10px]">{issue.count}</StatusBadge>
                  </div>
                  <span className="text-xs text-muted-foreground">{issue.detail}</span>
                </div>
                <Progress value={(issue.count / issue.max) * 100} className={cn('h-2', issue.tone === 'destructive' && '[&>div]:bg-destructive', issue.tone === 'warning' && '[&>div]:bg-warning', issue.tone === 'info' && '[&>div]:bg-info')} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Review Throughput</CardTitle><p className="text-xs text-muted-foreground">Reviews completed per day (last 7 days)</p></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={REVIEW_THROUGHPUT} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="reviews" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Reviews" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div><CardTitle className="text-base">Content Coverage by Exam</CardTitle><p className="text-xs text-muted-foreground">Approved question inventory per exam</p></div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => showToast.info('Coverage details', 'Detailed coverage breakdown available in Content module.')}>
            View details
          </Button>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {CONTENT_COVERAGE.map((c) => (
            <div key={c.exam}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{c.exam}</span>
                <span className="text-muted-foreground">{c.questions.toLocaleString()} Q - {c.coverage}%</span>
              </div>
              <Progress value={c.coverage} className={cn('h-2.5', c.coverage < 70 && '[&>div]:bg-warning', c.coverage < 60 && '[&>div]:bg-destructive')} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Validation Summary</CardTitle><p className="text-xs text-muted-foreground">Automated validation results</p></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">Passed Validation</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-success">38,712</span>
                <StatusBadge tone="success" dot>91.8%</StatusBadge>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">Failed Validation</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-destructive">3,446</span>
                <StatusBadge tone="destructive" dot>8.2%</StatusBadge>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">Auto-fixed This Week</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-info">128</span>
                <StatusBadge tone="info">AI assisted</StatusBadge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Critical Alerts</CardTitle><p className="text-xs text-muted-foreground">Items needing immediate attention</p></div>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { id: 1, text: 'Punjab PSSSB coverage below 60% threshold', tone: 'destructive' as const },
              { id: 2, text: '6 questions pending review for 4+ days', tone: 'warning' as const },
              { id: 3, text: 'AI generation batch failed validation (12 questions)', tone: 'destructive' as const },
              { id: 4, text: '2 DI sets missing referenced images', tone: 'warning' as const },
            ].map((alert) => (
              <div key={alert.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className={cn('h-4 w-4 shrink-0', alert.tone === 'destructive' ? 'text-destructive' : 'text-warning')} />
                  <span className="text-sm">{alert.text}</span>
                </div>
                <StatusBadge tone={alert.tone} className="ml-2 shrink-0 text-[10px]">{alert.tone === 'destructive' ? 'High' : 'Medium'}</StatusBadge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">All content quality values are demonstration data for prototype evaluation only.</p>
    </div>
  );
}
