import { BarChart3, Download, Users, Target, Clock, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { showToast } from '@/components/shared/toast';
import { cn } from '@/lib/utils';
import { TEST_PERFORMANCE, SECTION_PERFORMANCE } from '@/data/analytics';

const DROP_OFF = [
  { section: 'Started Test', value: 100, count: 98000, color: 'chart-1' },
  { section: 'Quant Attempted', value: 94, count: 92120, color: 'chart-2' },
  { section: 'Reasoning Attempted', value: 81, count: 79380, color: 'chart-3' },
  { section: 'English Attempted', value: 73, count: 71540, color: 'chart-4' },
  { section: 'GA Attempted', value: 62, count: 60760, color: 'chart-5' },
  { section: 'Completed', value: 58, count: 56840, color: 'chart-6' },
];

const tooltipStyle = {
  background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))',
  borderRadius: 8, fontSize: 12, color: 'hsl(var(--popover-foreground))',
};

export function TestAnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Test Analytics"
        description="Test attempts, completion rates, and performance."
        icon={<BarChart3 className="h-5 w-5" />}
        actions={
          <>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                <SelectItem value="SSC_CGL_T1">SSC CGL Tier 1</SelectItem>
                <SelectItem value="SSC_CHSL_T1">SSC CHSL Tier 1</SelectItem>
                <SelectItem value="IBPS_PO_PRE">IBPS PO Prelims</SelectItem>
                <SelectItem value="RRB_NTPC_CBT1">RRB NTPC CBT 1</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => showToast.success('Export started', 'Test analytics report is being generated.')}>
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Attempts" value="80,200" icon={Users} delta={{ value: '6.4%', positive: true }} sublabel="vs last month" tone="primary" />
        <StatCard label="Avg Completion Rate" value="75.5%" icon={Target} delta={{ value: '1.2%', positive: true }} sublabel="across all tests" tone="success" />
        <StatCard label="Avg Score" value="58.7" icon={BarChart3} delta={{ value: '0.8', positive: false }} sublabel="out of 100" tone="info" />
        <StatCard label="Avg Time" value="55.8 min" icon={Clock} delta={{ value: '1.4 min', positive: false }} sublabel="per attempt" tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Test Performance</CardTitle><p className="text-xs text-muted-foreground">Attempts per test</p></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={TEST_PERFORMANCE} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="test" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="attempts" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Attempts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Completion Rate</CardTitle><p className="text-xs text-muted-foreground">Completion percentage per test</p></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={TEST_PERFORMANCE} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="test" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="completion" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Section Performance</CardTitle><p className="text-xs text-muted-foreground">Accuracy and skip rate per section</p></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={SECTION_PERFORMANCE} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="section" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="accuracy" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Accuracy %" />
                <Bar dataKey="skip" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name="Skip Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><TrendingDown className="h-4 w-4 text-warning" /> Drop-off Analysis</CardTitle>
              <p className="text-xs text-muted-foreground">Section-wise completion</p>
            </div>
            <StatusBadge tone="warning" dot>42% drop</StatusBadge>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {DROP_OFF.map((d) => {
              const loss = d.value;
              return (
                <div key={d.section}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{d.section}</span>
                    <span className="text-muted-foreground">{d.count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={d.value} className="h-2.5" />
                    <span className={cn('w-9 shrink-0 text-right text-xs font-semibold', loss < 70 ? 'text-warning' : 'text-success')}>{d.value}%</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">All test analytics values are demonstration data for prototype evaluation only.</p>
    </div>
  );
}
