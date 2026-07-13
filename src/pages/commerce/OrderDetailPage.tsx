import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart, ArrowLeft, IndianRupee, CreditCard, KeyRound, RotateCcw,
  User, Package, Tag, CreditCard as CardIcon, CalendarDays, History,
  CheckCircle2, Circle, XCircle, Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatCard } from '@/components/shared/StatCard';
import { ErrorState } from '@/components/shared/EmptyState';
import { showToast } from '@/components/shared/toast';
import { GatedButton } from '@/components/shared/GatedAction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { useOrderById, useAuditLogs } from '@/app/store/selectors';
import type { AuditEntry } from '@/app/store/types';

function payTone(status: string) {
  switch (status) {
    case 'Success': return 'success' as const;
    case 'Pending': return 'warning' as const;
    case 'Failed': return 'destructive' as const;
    case 'Refunded': return 'info' as const;
    default: return 'neutral' as const;
  }
}

function entTone(status: string) {
  switch (status) {
    case 'Active': return 'success' as const;
    case 'Pending': return 'warning' as const;
    case 'Failed': return 'destructive' as const;
    case 'Not Granted': return 'neutral' as const;
    default: return 'neutral' as const;
  }
}

function refundTone(status: string) {
  switch (status) {
    case 'None': return 'neutral' as const;
    case 'Requested': return 'warning' as const;
    case 'Approved': return 'info' as const;
    case 'Processed': return 'success' as const;
    default: return 'neutral' as const;
  }
}

interface TimelineStep { label: string; time: string; state: 'done' | 'pending' | 'failed' | 'idle'; }

export function OrderDetailPage() {
  const { id } = useParams();
  const order = useOrderById(id);
  const { dispatch, audit } = usePrototypeStore();
  const auditLogs = useAuditLogs();

  const entityAudit = useMemo(
    () => auditLogs.filter((a) => a.entityId.includes(id ?? '')),
    [auditLogs, id],
  );

  const paymentTimeline = useMemo<TimelineStep[]>(() => {
    if (!order) return [];
    const base: TimelineStep[] = [
      { label: 'Order created', time: order.paymentDate, state: 'done' },
    ];
    if (order.paymentStatus === 'Success') {
      base.push({ label: 'Payment attempted', time: order.paymentDate, state: 'done' });
      base.push({ label: 'Payment captured', time: order.paymentDate, state: 'done' });
      base.push({ label: order.entitlementStatus === 'Active' ? 'Entitlement granted' : 'Entitlement pending', time: order.paymentDate, state: order.entitlementStatus === 'Active' ? 'done' : 'pending' });
    } else if (order.paymentStatus === 'Failed') {
      base.push({ label: 'Payment attempted', time: order.paymentDate, state: 'failed' });
      base.push({ label: 'Payment captured', time: '-', state: 'idle' });
      base.push({ label: 'Entitlement granted', time: '-', state: 'idle' });
    } else if (order.paymentStatus === 'Pending') {
      base.push({ label: 'Payment attempted', time: order.paymentDate, state: 'pending' });
      base.push({ label: 'Payment captured', time: '-', state: 'idle' });
      base.push({ label: 'Entitlement granted', time: '-', state: 'idle' });
    } else {
      base.push({ label: 'Payment attempted', time: order.paymentDate, state: 'done' });
      base.push({ label: 'Payment captured', time: order.paymentDate, state: 'done' });
      base.push({ label: 'Refund processed', time: order.paymentDate, state: 'done' });
    }
    return base;
  }, [order]);

  const lineItems = useMemo(() => [
    { name: order ? order.product : '', qty: 1, amount: order ? order.amount : 0, period: '365 days' },
    { name: 'Platform Fee', qty: 1, amount: 0, period: 'one-time' },
  ], [order]);

  if (!order) {
    return (
      <ErrorState
        title="Order not found"
        description={`No order exists with ID "${id}". It may have been removed.`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/commerce/orders"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Orders</Link>
          </Button>
        }
      />
    );
  }

  const handleVerifyPayment = () => {
    const updated = { ...order, paymentStatus: 'Success' as const };
    dispatch({ type: 'UPDATE_ORDER', order: updated, audit: audit('PAYMENT_VERIFIED', 'order', order.id, order.id, order.paymentStatus, 'Success', 'Payment verified by admin') });
    showToast.success('Payment verified', `${order.id} payment marked as Success.`);
  };

  const handleRetryEntitlement = () => {
    const updated = { ...order, entitlementStatus: 'Active' as const };
    dispatch({ type: 'UPDATE_ORDER', order: updated, audit: audit('ENTITLEMENT_RETRIED', 'order', order.id, order.id, order.entitlementStatus, 'Active', 'Entitlement retry succeeded') });
    showToast.success('Entitlement granted', `${order.id} entitlement is now Active.`);
  };

  const handleSimulateRefund = () => {
    const updated = { ...order, paymentStatus: 'Refunded' as const, refundStatus: 'Processed' as const, entitlementStatus: 'Not Granted' as const };
    dispatch({ type: 'UPDATE_ORDER', order: updated, audit: audit('REFUND_SIMULATED', 'order', order.id, order.id, order.paymentStatus, 'Refunded', 'Refund processed by admin') });
    showToast.info('Refund processed', `${order.id} has been refunded.`);
  };

  const stepIcon: Record<TimelineStep['state'], React.ReactNode> = {
    done: <CheckCircle2 className="h-4 w-4 text-success" />,
    pending: <Clock className="h-4 w-4 text-warning" />,
    failed: <XCircle className="h-4 w-4 text-destructive" />,
    idle: <Circle className="h-4 w-4 text-muted-foreground/40" />,
  };

  return (
    <div>
      <PageHeader
        title={order.id}
        description="Order Detail"
        icon={<ShoppingCart className="h-5 w-5" />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/commerce/orders"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Orders</Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Amount" value={`Rs ${order.amount.toLocaleString('en-IN')}`} icon={IndianRupee} tone="primary" />
        <StatCard label="Payment Status" value={order.paymentStatus} icon={CreditCard} tone={order.paymentStatus === 'Success' ? 'success' : order.paymentStatus === 'Failed' ? 'destructive' : 'warning'} />
        <StatCard label="Entitlement" value={order.entitlementStatus} icon={KeyRound} tone={order.entitlementStatus === 'Active' ? 'success' : 'warning'} />
        <StatCard label="Refund Status" value={order.refundStatus} icon={RotateCcw} tone={order.refundStatus === 'Processed' ? 'success' : 'accent'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow icon={User} label="Student" value={order.studentName} link={`/users/students/${order.studentId}`} />
              <DetailRow icon={User} label="Student ID" value={order.studentId} link={`/users/students/${order.studentId}`} />
              <DetailRow icon={Package} label="Product" value={order.product} />
              <DetailRow icon={IndianRupee} label="Amount" value={`Rs ${order.amount.toLocaleString('en-IN')}`} />
              <DetailRow icon={Tag} label="Coupon" value={order.coupon ?? 'None'} />
              <DetailRow icon={CardIcon} label="Gateway" value={order.gateway} />
              <DetailRow icon={CalendarDays} label="Payment Date" value={order.paymentDate} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 border-l pl-6">
                {paymentTimeline.map((s, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background ring-2 ring-border">
                      {stepIcon[s.state]}
                    </span>
                    <p className={cn('text-sm font-medium', s.state === 'idle' ? 'text-muted-foreground/60' : 'text-foreground')}>{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.time}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lineItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.qty} - {item.period}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.amount === 0 ? 'Free' : `Rs ${item.amount.toLocaleString('en-IN')}`}</span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="font-display text-lg font-bold text-foreground">Rs {order.amount.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment</span>
                <StatusBadge tone={payTone(order.paymentStatus)} dot>{order.paymentStatus}</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Entitlement</span>
                <StatusBadge tone={entTone(order.entitlementStatus)} dot>{order.entitlementStatus}</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Refund</span>
                <StatusBadge tone={refundTone(order.refundStatus)} dot>{order.refundStatus}</StatusBadge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <GatedButton permission="payments.manage" variant="default" size="sm" className="w-full justify-start" onClick={handleVerifyPayment} disabled={order.paymentStatus === 'Success'}>
                <CreditCard className="mr-1.5 h-4 w-4" /> Verify Payment
              </GatedButton>
              <GatedButton permission="entitlements.manage" variant="outline" size="sm" className="w-full justify-start" onClick={handleRetryEntitlement} disabled={order.entitlementStatus === 'Active'}>
                <KeyRound className="mr-1.5 h-4 w-4" /> Retry Entitlement
              </GatedButton>
              <GatedButton permission="refunds.manage" variant="outline" size="sm" className="w-full justify-start" onClick={handleSimulateRefund} disabled={order.paymentStatus === 'Refunded'}>
                <RotateCcw className="mr-1.5 h-4 w-4" /> Simulate Refund
              </GatedButton>
            </CardContent>
          </Card>

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
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, link }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; link?: string }) {
  const content = link ? (
    <Link to={link} className="text-sm font-medium text-primary hover:underline">{value}</Link>
  ) : (
    <span className="text-sm font-medium text-foreground">{value}</span>
  );
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      {content}
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
