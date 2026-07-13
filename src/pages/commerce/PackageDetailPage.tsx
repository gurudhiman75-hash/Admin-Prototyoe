import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package as PackageIcon, ArrowLeft, IndianRupee, Users, TrendingUp,
  BookOpen, Layers, Globe, CalendarDays, Tag, History,
  CheckCircle2, XCircle, Star,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatCard } from '@/components/shared/StatCard';
import { ErrorState } from '@/components/shared/EmptyState';
import { showToast } from '@/components/shared/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { usePackages, useOrders, useAuditLogs } from '@/app/store/selectors';
import type { AuditEntry, Order } from '@/app/store/types';

function payTone(status: Order['paymentStatus']) {
  switch (status) {
    case 'Success': return 'success' as const;
    case 'Pending': return 'warning' as const;
    case 'Failed': return 'destructive' as const;
    case 'Refunded': return 'info' as const;
    default: return 'neutral' as const;
  }
}

export function PackageDetailPage() {
  const { id } = useParams();
  const packages = usePackages();
  const pkg = packages.find((p) => p.id === id);
  const orders = useOrders();
  const { dispatch, audit } = usePrototypeStore();
  const auditLogs = useAuditLogs();

  const entityAudit = useMemo(
    () => auditLogs.filter((a) => a.entityId.includes(id ?? '')),
    [auditLogs, id],
  );

  const packageOrders = useMemo(
    () => orders.filter((o) => o.product === pkg?.name),
    [orders, pkg],
  );

  if (!pkg) {
    return (
      <ErrorState
        title="Package not found"
        description={`No package exists with ID "${id}". It may have been removed.`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/commerce/packages"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Packages</Link>
          </Button>
        }
      />
    );
  }

  const handleToggleActive = (checked: boolean) => {
    const updated = { ...pkg, active: checked };
    dispatch({ type: 'UPDATE_PACKAGE', pkg: updated, audit: audit('PACKAGE_ACTIVE_TOGGLED', 'package', pkg.id, pkg.name, String(pkg.active), String(checked), 'Package active status toggled by admin') });
    showToast.success(checked ? 'Package activated' : 'Package deactivated', `${pkg.name} is now ${checked ? 'active' : 'inactive'}.`);
  };

  const handleToggleFeatured = (checked: boolean) => {
    const updated = { ...pkg, featured: checked };
    dispatch({ type: 'UPDATE_PACKAGE', pkg: updated, audit: audit('PACKAGE_FEATURED_TOGGLED', 'package', pkg.id, pkg.name, String(pkg.featured), String(checked), 'Package featured status toggled by admin') });
    showToast.success(checked ? 'Package featured' : 'Package unfeatured', `${pkg.name} is now ${checked ? 'featured' : 'not featured'}.`);
  };

  return (
    <div>
      <PageHeader
        title={pkg.name}
        description="Package Detail"
        icon={<PackageIcon className="h-5 w-5" />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/commerce/packages"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Packages</Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Price" value={`Rs ${pkg.price.toLocaleString('en-IN')}`} icon={IndianRupee} tone="primary" />
        <StatCard label="Discounted Price" value={`Rs ${pkg.discountedPrice.toLocaleString('en-IN')}`} icon={Tag} tone="success" sublabel={`${Math.round((1 - pkg.discountedPrice / pkg.price) * 100)}% off`} />
        <StatCard label="Enrolments" value={pkg.enrolments.toLocaleString()} icon={Users} tone="info" />
        <StatCard label="Revenue" value={`Rs ${pkg.revenue.toLocaleString('en-IN')}`} icon={TrendingUp} tone="accent" />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="audit">Audit History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Package Metadata</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow icon={BookOpen} label="Exam" value={pkg.examName} />
                <DetailRow icon={Layers} label="Series" value={pkg.series.join(', ')} />
                <DetailRow icon={CalendarDays} label="Validity" value={`${pkg.validityDays} days`} />
                <DetailRow icon={Globe} label="Language" value={pkg.language} />
                <DetailRow icon={CalendarDays} label="Sale Start" value={pkg.saleStart} />
                <DetailRow icon={CalendarDays} label="Sale End" value={pkg.saleEnd} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Visibility Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {pkg.active ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Active</p>
                      <p className="text-xs text-muted-foreground">Available for purchase</p>
                    </div>
                  </div>
                  <Switch checked={pkg.active} onCheckedChange={handleToggleActive} />
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Featured</p>
                      <p className="text-xs text-muted-foreground">Highlighted on storefront</p>
                    </div>
                  </div>
                  <Switch checked={pkg.featured} onCheckedChange={handleToggleFeatured} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Orders for {pkg.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {packageOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No orders found for this package.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packageOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs font-medium text-foreground">{o.id}</TableCell>
                        <TableCell className="text-sm">
                          <Link to={`/users/students/${o.studentId}`} className="text-primary hover:underline">{o.studentName}</Link>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-foreground">Rs {o.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell><StatusBadge tone={payTone(o.paymentStatus)} dot className="text-[10px]">{o.paymentStatus}</StatusBadge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{o.paymentDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><History className="h-4 w-4" /> Audit History</CardTitle>
            </CardHeader>
            <CardContent>
              {entityAudit.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No audit entries recorded.</p>
              ) : (
                <AuditTimeline entries={entityAudit} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  return (
    <ol className="space-y-4 border-l pl-6">
      {entries.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
          <p className="text-sm font-medium text-foreground">{e.action}</p>
          <p className="text-xs text-muted-foreground">{e.admin} - {e.timestamp}</p>
          {e.reason && <p className="mt-0.5 text-xs text-muted-foreground">{e.reason}</p>}
        </li>
      ))}
    </ol>
  );
}
