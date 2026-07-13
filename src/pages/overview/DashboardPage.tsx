import {
  Users, UserCheck, FileQuestion, ClipboardCheck, FileText, CalendarClock,
  IndianRupee, CreditCard, LifeBuoy, TrendingUp, Activity, CircleDot, Plus,
  ArrowRight, CheckCircle2, AlertTriangle, FileEdit, Rocket,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge, questionStatusTone } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  REVENUE_TREND, STUDENT_ACTIVITY_TREND, CONTENT_COVERAGE, PLATFORM_HEALTH,
  RECENT_ACTIVITY, UPCOMING_RELEASES, PENDING_REVIEW_TASKS, RECENT_TESTS, RECENT_QUESTIONS,
} from '@/data/analytics';

const ACTIVITY_ICON = {
  create: { icon: Plus, color: 'text-info' },
  update: { icon: FileEdit, color: 'text-muted-foreground' },
  approve: { icon: CheckCircle2, color: 'text-success' },
  publish: { icon: Rocket, color: 'text-primary' },
  comment: { icon: AlertTriangle, color: 'text-warning' },
  payment: { icon: CreditCard, color: 'text-brand-accent' },
};

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Platform overview — all values shown are demonstration data."
        icon={<Activity className="h-5 w-5" />}
        actions={<><Button variant="outline" size="sm">Export Report</Button><Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> New Test</Button></>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Students" value="68,420" icon={Users} delta={{ value: '4.2%', positive: true }} sublabel="vs last month" tone="primary" />
        <StatCard label="Active Today" value="9,830" icon={UserCheck} delta={{ value: '12%', positive: true }} sublabel="live now" tone="info" />
        <StatCard label="Total Questions" value="42,180" icon={FileQuestion} delta={{ value: '860 new', positive: true }} sublabel="this month" tone="success" />
        <StatCard label="Pending Reviews" value="18" icon={ClipboardCheck} delta={{ value: '3 urgent', positive: false }} sublabel="needs attention" tone="warning" />
        <StatCard label="Total Tests" value="312" icon={FileText} delta={{ value: '6 added', positive: true }} sublabel="this week" tone="accent" />
        <StatCard label="Monthly Revenue" value="Rs 51.2L" icon={IndianRupee} delta={{ value: '11.8%', positive: true }} sublabel="vs last month" tone="success" />
        <StatCard label="Failed Payments" value="34" icon={CreditCard} delta={{ value: '5.2%', positive: false }} sublabel="last 7 days" tone="destructive" />
        <StatCard label="Open Tickets" value="7" icon={LifeBuoy} delta={{ value: '2 new', positive: false }} sublabel="support queue" tone="warning" />
        <StatCard label="Awaiting Publish" value="5" icon={CalendarClock} sublabel="scheduled tests" tone="info" />
        <StatCard label="Upcoming Tests" value="12" icon={TrendingUp} sublabel="next 7 days" tone="primary" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle className="text-base">Revenue Trend</CardTitle><p className="text-xs text-muted-foreground">Monthly revenue vs target</p></div>
            <StatusBadge tone="success" dot>+11.8%</StatusBadge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={REVENUE_TREND} margin={{ left: -16, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12, color: 'hsl(var(--popover-foreground))' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#rev)" name="Revenue" />
                <Area type="monotone" dataKey="target" stroke="hsl(var(--chart-2))" strokeWidth={1.5} strokeDasharray="5 5" fill="none" name="Target" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Student Activity</CardTitle><p className="text-xs text-muted-foreground">Active users this week</p></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={STUDENT_ACTIVITY_TREND} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="active" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Active" />
                <Bar dataKey="new" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="New" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Admin Activity</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs">View all</Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {RECENT_ACTIVITY.map((a) => {
              const cfg = ACTIVITY_ICON[a.type];
              return (
                <div key={a.id} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                  <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted', cfg.color)}>
                    <cfg.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-tight"><span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.target}</span></p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Content Coverage by Exam</CardTitle><p className="text-xs text-muted-foreground">Approved question inventory</p></CardHeader>
          <CardContent className="space-y-3">
            {CONTENT_COVERAGE.map((c) => (
              <div key={c.exam}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{c.exam}</span>
                  <span className="text-muted-foreground">{c.questions.toLocaleString()} Q - {c.coverage}%</span>
                </div>
                <Progress value={c.coverage} className={cn('h-2', c.coverage < 70 && '[&>div]:bg-warning', c.coverage < 60 && '[&>div]:bg-destructive')} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Platform Health</CardTitle><p className="text-xs text-muted-foreground">Live service status</p></CardHeader>
          <CardContent className="space-y-2.5">
            {PLATFORM_HEALTH.map((s) => (
              <div key={s.service} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <CircleDot className={cn('h-4 w-4', s.status === 'operational' ? 'text-success' : 'text-warning')} />
                  <span className="font-medium">{s.service}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{s.latency}</span>
                  <StatusBadge tone={s.status === 'operational' ? 'success' : 'warning'} className="text-[10px]">{s.status === 'operational' ? 'OK' : 'Degraded'}</StatusBadge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Upcoming Test Releases</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {UPCOMING_RELEASES.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.exam}</p></div>
                <div className="text-right"><p className="text-sm font-semibold">{r.date.slice(5)}</p><p className="text-xs text-muted-foreground">{r.time}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Pending Review Tasks</CardTitle>
            <StatusBadge tone="warning">18 open</StatusBadge>
          </CardHeader>
          <CardContent className="space-y-2">
            {PENDING_REVIEW_TASKS.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{t.reviewer} - age {t.age}</p></div>
                <StatusBadge tone={t.priority === 'High' ? 'destructive' : t.priority === 'Medium' ? 'warning' : 'neutral'} className="ml-2 text-[10px]">{t.priority}</StatusBadge>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">Open Review Queue <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recently Created Tests</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {RECENT_TESTS.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0"><p className="truncate font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.exam} - {t.created}</p></div>
                <StatusBadge tone={t.status === 'Live' ? 'success' : t.status === 'Scheduled' ? 'info' : 'primary'} className="text-[10px]">{t.status}</StatusBadge>
              </div>
            ))}
            <div className="mt-3 border-t pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Questions</p>
              {RECENT_QUESTIONS.map((q) => (
                <div key={q.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0"><p className="truncate text-xs">{q.id} - {q.stem}</p><p className="text-[11px] text-muted-foreground">{q.subject} - {q.author}</p></div>
                  <StatusBadge tone={questionStatusTone(q.status)} className="ml-2 text-[10px]">{q.status}</StatusBadge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">All dashboard values are demonstration data for prototype evaluation only.</p>
    </div>
  );
}
