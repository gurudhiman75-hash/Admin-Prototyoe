import {
  HeartPulse, RefreshCw, Server, Database, CreditCard, Bell, AlertTriangle, CheckCircle2, Activity, GitCommit,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showToast } from '@/components/shared/toast';
import { cn } from '@/lib/utils';
import { PLATFORM_HEALTH } from '@/data/analytics';

const SERVICE_META: Record<string, { icon: typeof Server; uptime: string }> = {
  'API Gateway': { icon: Server, uptime: '99.98%' },
  'Database': { icon: Database, uptime: '99.99%' },
  'Payment Webhooks': { icon: CreditCard, uptime: '98.71%' },
  'Notification Service': { icon: Bell, uptime: '99.95%' },
  'File Storage (S3)': { icon: Server, uptime: '99.97%' },
  'Search Index': { icon: Activity, uptime: '99.93%' },
};

const FAILED_JOBS = [
  { id: 'j1', name: 'nightly-reconciliation', error: 'Connection timeout to payment gateway', failedAt: '2026-07-12 02:14' },
  { id: 'j2', name: 'ai-question-generation', error: 'OpenAI rate limit exceeded (429)', failedAt: '2026-07-12 01:48' },
  { id: 'j3', name: 'email-batch-sender', error: 'SMTP relay refused connection', failedAt: '2026-07-11 23:32' },
  { id: 'j4', name: 'analytics-rollup', error: 'Deadlock detected on aggregates table', failedAt: '2026-07-11 18:05' },
  { id: 'j5', name: 'search-index-sync', error: 'Elasticsearch cluster yellow - shard unassigned', failedAt: '2026-07-11 14:22' },
];

const GENERATION_FAILURES = [
  { id: 'g1', exam: 'SSC CGL Tier 1', subject: 'Quant', count: 12, reason: 'Invalid option format', time: '2026-07-12 01:48' },
  { id: 'g2', exam: 'IBPS PO Prelims', subject: 'Reasoning', count: 8, reason: 'Explanation below min length', time: '2026-07-12 01:46' },
  { id: 'g3', exam: 'RRB NTPC CBT 1', subject: 'GA', count: 15, reason: 'Duplicate detection', time: '2026-07-11 22:10' },
  { id: 'g4', exam: 'Punjab PSSSB Clerk', subject: 'Punjabi Language', count: 6, reason: 'Translation quality below threshold', time: '2026-07-11 16:38' },
];

const DEPLOYMENT = {
  version: 'v4.12.3', deployedAt: '2026-07-12 09:42', status: 'Success', commit: 'a7f3c92', author: 'Arjun Mehta',
};

export function SystemHealthPage() {
  const handleRefresh = () => {
    showToast.success('Health check refreshed', 'All service statuses have been updated.');
  };

  const handleRetry = (jobName: string) => {
    showToast.info('Retrying job', `Job '${jobName}' has been queued for retry.`);
  };

  return (
    <div>
      <PageHeader
        title="System Health"
        description="Monitor platform services and infrastructure."
        icon={<HeartPulse className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="API Response Time" value="42ms" icon={Server} delta={{ value: '5ms', positive: true }} sublabel="p95 latency" tone="success" />
        <StatCard label="DB Connections" value="38 / 100" icon={Database} sublabel="active pool" tone="info" />
        <StatCard label="Active Jobs" value="14" icon={Activity} sublabel="running now" tone="primary" />
        <StatCard label="Failed Jobs" value="5" icon={AlertTriangle} delta={{ value: '2 new', positive: false }} sublabel="last 24h" tone="destructive" />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Service Status</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_HEALTH.map((s) => {
            const meta = SERVICE_META[s.service];
            const Icon = meta?.icon ?? Server;
            const operational = s.status === 'operational';
            return (
              <Card key={s.service} className={cn('p-5', !operational && 'border-warning/40')}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', operational ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{s.service}</p>
                      <p className="text-xs text-muted-foreground">Uptime {meta?.uptime}</p>
                    </div>
                  </div>
                  <StatusBadge tone={operational ? 'success' : 'warning'} dot>
                    {operational ? 'Operational' : 'Degraded'}
                  </StatusBadge>
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
                  <span className="text-muted-foreground">Avg latency</span>
                  <span className={cn('font-semibold', operational ? 'text-foreground' : 'text-warning')}>{s.latency}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Failed Jobs</CardTitle><p className="text-xs text-muted-foreground">Recent background job failures</p></div>
            <StatusBadge tone="destructive" dot>{FAILED_JOBS.length} failures</StatusBadge>
          </CardHeader>
          <CardContent className="space-y-2">
            {FAILED_JOBS.map((job) => (
              <div key={job.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{job.name}</code>
                    <span className="text-xs text-muted-foreground">{job.failedAt}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-destructive">{job.error}</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" onClick={() => handleRetry(job.name)}>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle className="text-base">Latest Deployment</CardTitle><p className="text-xs text-muted-foreground">Most recent production release</p></div>
            <StatusBadge tone="success" dot>{DEPLOYMENT.status}</StatusBadge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-semibold">{DEPLOYMENT.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Deployed at</span>
              <span className="text-sm font-medium">{DEPLOYMENT.deployedAt}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Deployed by</span>
              <span className="text-sm font-medium">{DEPLOYMENT.author}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Commit</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                <GitCommit className="h-4 w-4 text-muted-foreground" />
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{DEPLOYMENT.commit}</code>
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm text-muted-foreground">Build status</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" /> Passed
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-warning" /> AI Generation Failures</CardTitle><p className="text-xs text-muted-foreground">Recent question generation issues by exam</p></div>
          <StatusBadge tone="warning" dot>41 questions</StatusBadge>
        </CardHeader>
        <CardContent className="space-y-2">
          {GENERATION_FAILURES.map((g) => (
            <div key={g.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{g.exam} - {g.subject}</p>
                  <p className="text-xs text-muted-foreground">{g.reason} - {g.time}</p>
                </div>
              </div>
              <StatusBadge tone="warning" className="shrink-0">{g.count} failed</StatusBadge>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-muted-foreground">All system health values are demonstration data for prototype evaluation only.</p>
    </div>
  );
}
