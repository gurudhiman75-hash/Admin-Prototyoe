import { TrendingUp, Download, IndianRupee, Users, Target, Percent } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { showToast } from '@/components/shared/toast';
import {
  REVENUE_TREND, STUDENT_ACTIVITY_TREND, PACKAGE_SALES, CONVERSION_FUNNEL,
} from '@/data/analytics';

const TOP_PACKAGES = [
  { id: 'p1', name: 'Railway NTPC Pack', sales: 22300, price: 999, revenue: 22287700 },
  { id: 'p2', name: 'Banking Pro Combo', sales: 18900, price: 1499, revenue: 28331100 },
  { id: 'p3', name: 'SSC CGL Ultimate', sales: 12450, price: 1299, revenue: 16172550 },
  { id: 'p4', name: 'SSC CHSL Standard', sales: 8200, price: 699, revenue: 5731800 },
  { id: 'p5', name: 'Punjab Combo', sales: 6800, price: 599, revenue: 4073200 },
];

const funnelMax = Math.max(...CONVERSION_FUNNEL.map((s) => s.count));

const tooltipStyle = {
  background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))',
  borderRadius: 8, fontSize: 12, color: 'hsl(var(--popover-foreground))',
};

export function BusinessAnalyticsPage() {
  const columns: Column<(typeof TOP_PACKAGES)[number]>[] = [
    { key: 'name', header: 'Package', cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'sales', header: 'Sales', sortValue: (r) => r.sales, cell: (r) => r.sales.toLocaleString() },
    { key: 'price', header: 'Unit Price', sortValue: (r) => r.price, cell: (r) => `Rs ${r.price.toLocaleString()}` },
    {
      key: 'revenue', header: 'Revenue', sortValue: (r) => r.revenue, className: 'text-right',
      cell: (r) => <span className="font-semibold">Rs {(r.revenue / 100000).toFixed(1)}L</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Business Analytics"
        description="Revenue, conversions, and growth metrics."
        icon={<TrendingUp className="h-5 w-5" />}
        actions={
          <>
            <Select defaultValue="30d">
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => showToast.success('Export started', 'Business analytics report is being generated.')}>
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Monthly Revenue" value="Rs 51.2L" icon={IndianRupee} delta={{ value: '11.8%', positive: true }} sublabel="vs last month" tone="success" />
        <StatCard label="Total Enrolments" value="68,420" icon={Users} delta={{ value: '4.2%', positive: true }} sublabel="vs last month" tone="primary" />
        <StatCard label="Avg Order Value" value="Rs 1,180" icon={Target} delta={{ value: '2.1%', positive: false }} sublabel="vs last month" tone="info" />
        <StatCard label="Free-to-Paid" value="17.9%" icon={Percent} delta={{ value: '1.3%', positive: true }} sublabel="conversion rate" tone="accent" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Revenue Trend</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly revenue vs target</p>
            </div>
            <StatusBadge tone="success" dot>+11.8%</StatusBadge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={REVENUE_TREND} margin={{ left: -16, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="bizRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#bizRev)" name="Revenue" />
                <Area type="monotone" dataKey="target" stroke="hsl(var(--chart-2))" strokeWidth={1.5} strokeDasharray="5 5" fill="none" name="Target" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Conversion Funnel</CardTitle><p className="text-xs text-muted-foreground">Visitor to paid purchase</p></CardHeader>
          <CardContent className="space-y-4 pt-2">
            {CONVERSION_FUNNEL.map((stage, i) => {
              const widthPct = (stage.count / funnelMax) * 100;
              const prev = i > 0 ? CONVERSION_FUNNEL[i - 1].count : stage.count;
              const convPct = i > 0 ? ((stage.count / prev) * 100).toFixed(1) : null;
              return (
                <div key={stage.stage}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-muted-foreground">{stage.count.toLocaleString()}{convPct && <span className="ml-2 text-success">({convPct}%)</span>}</span>
                  </div>
                  <div className="h-7 w-full rounded-md bg-muted">
                    <div
                      className="flex h-7 items-center rounded-md px-2 text-[11px] font-medium text-primary-foreground"
                      style={{ width: `${Math.max(widthPct, 8)}%`, background: `hsl(var(--chart-${i + 1}))` }}
                    >
                      {widthPct > 15 && `${widthPct.toFixed(0)}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Package Sales</CardTitle><p className="text-xs text-muted-foreground">Sales by package</p></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart layout="vertical" data={PACKAGE_SALES} margin={{ left: 24, right: 16, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="name" width={130} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="sales" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Active Users</CardTitle><p className="text-xs text-muted-foreground">Active and new users this week</p></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={STUDENT_ACTIVITY_TREND} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="active" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Active" />
                <Bar dataKey="new" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="New" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div><CardTitle className="text-base">Top Packages by Revenue</CardTitle><p className="text-xs text-muted-foreground">Highest grossing packages this period</p></div>
          <StatusBadge tone="primary">5 packages</StatusBadge>
        </CardHeader>
        <CardContent>
          <DataTable
            data={TOP_PACKAGES}
            columns={columns}
            getRowId={(r) => r.id}
            searchable={false}
            selectable={false}
            pageSize={5}
            initialSort={{ key: 'revenue', dir: 'desc' }}
          />
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-muted-foreground">All business analytics values are demonstration data for prototype evaluation only.</p>
    </div>
  );
}
