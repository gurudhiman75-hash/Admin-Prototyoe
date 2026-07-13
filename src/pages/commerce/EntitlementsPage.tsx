import { useMemo, useState } from 'react';
import {
  KeyRound, Plus, Calendar, User, MoreVertical, Ban, ArrowRightLeft,
  MessageSquare, ShieldCheck, CalendarPlus,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { showToast } from '@/components/shared/toast';
import { GatedButton } from '@/components/shared/GatedAction';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { useEntitlements } from '@/app/store/selectors';
import type { Entitlement } from '@/data/commerce';

const FILTER_STATUS: FilterDef['options'] = [
  { label: 'Active', value: 'Active' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Revoked', value: 'Revoked' },
  { label: 'Suspended', value: 'Suspended' },
];

const FILTER_SOURCE: FilterDef['options'] = [
  { label: 'Purchase', value: 'Purchase' },
  { label: 'Free Preview', value: 'Free Preview' },
  { label: 'Manual Grant', value: 'Manual Grant' },
  { label: 'Promotional', value: 'Promotional' },
];

const FILTERS: FilterDef[] = [
  { key: 'status', label: 'Status', options: FILTER_STATUS },
  { key: 'source', label: 'Source', options: FILTER_SOURCE },
];

function statusTone(status: Entitlement['status']) {
  switch (status) {
    case 'Active': return 'success';
    case 'Expired': return 'neutral';
    case 'Revoked': return 'destructive';
    case 'Suspended': return 'warning';
    default: return 'neutral';
  }
}

function sourceTone(source: Entitlement['source']) {
  switch (source) {
    case 'Purchase': return 'primary';
    case 'Free Preview': return 'info';
    case 'Manual Grant': return 'accent';
    case 'Promotional': return 'success';
    default: return 'neutral';
  }
}

export function EntitlementsPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Entitlement | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Entitlement | null>(null);

  const entitlements = useEntitlements();
  const { dispatch, audit } = usePrototypeStore();

  const handleFilterChange = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const handleClear = () => setFilters({});

  const filtered = useMemo(
    () =>
      entitlements.filter((e) =>
        Object.entries(filters).every(([k, v]) => !v || v === 'all' || (e as never)[k] === v),
      ),
    [filters, entitlements],
  );

  const handleRevoke = (ent: Entitlement) => {
    const updated = { ...ent, status: 'Revoked' as const };
    dispatch({ type: 'UPDATE_ENTITLEMENT', entitlement: updated, audit: audit('ENTITLEMENT_REVOKED', 'entitlement', ent.id, ent.studentName, ent.status, 'Revoked', 'Access revoked by admin') });
    showToast.success('Access revoked', `${ent.id} - ${ent.studentName} no longer has access to ${ent.packageName}.`);
    setRevokeTarget(null);
    setSelected(null);
  };

  const handleExtend = (ent: Entitlement) => {
    const newExpiry = new Date(new Date(ent.expiryDate).getTime() + 30 * 86400000).toISOString().slice(0, 10);
    const updated = { ...ent, expiryDate: newExpiry };
    dispatch({ type: 'UPDATE_ENTITLEMENT', entitlement: updated, audit: audit('ENTITLEMENT_EXTENDED', 'entitlement', ent.id, ent.studentName, ent.expiryDate, newExpiry, 'Validity extended by 30 days') });
    showToast.success('Validity extended', `${ent.id} extended to ${newExpiry}.`);
    setSelected(updated);
  };

  const act = (label: string, e: Entitlement) =>
    showToast.info(label, `Applied to ${e.id} - ${e.studentName}`);

  const columns: Column<Entitlement>[] = [
    {
      key: 'student', header: 'Student',
      cell: (e) => (
        <div className="min-w-[180px]">
          <p className="font-medium text-foreground">{e.studentName}</p>
          <p className="text-xs text-muted-foreground">{e.studentId}</p>
        </div>
      ),
      sortValue: (e) => e.studentName,
    },
    {
      key: 'packageName', header: 'Package', hideOnMobile: true,
      cell: (e) => <span className="text-sm">{e.packageName}</span>,
      sortValue: (e) => e.packageName,
    },
    {
      key: 'source', header: 'Source',
      cell: (e) => <StatusBadge tone={sourceTone(e.source)} className="text-[10px]">{e.source}</StatusBadge>,
      sortValue: (e) => e.source,
    },
    {
      key: 'startDate', header: 'Start', hideOnMobile: true,
      cell: (e) => <span className="text-xs text-muted-foreground">{e.startDate}</span>,
      sortValue: (e) => e.startDate,
    },
    {
      key: 'expiryDate', header: 'Expiry',
      cell: (e) => <span className="text-xs text-muted-foreground">{e.expiryDate}</span>,
      sortValue: (e) => e.expiryDate,
    },
    {
      key: 'status', header: 'Status',
      cell: (e) => <StatusBadge tone={statusTone(e.status)} dot>{e.status}</StatusBadge>,
      sortValue: (e) => e.status,
    },
    {
      key: 'grantedBy', header: 'Granted By', hideOnMobile: true,
      cell: (e) => <span className="text-sm text-muted-foreground">{e.grantedBy}</span>,
      sortValue: (e) => e.grantedBy,
    },
    {
      key: 'paymentRef', header: 'Payment Ref', hideOnMobile: true,
      cell: (e) => (
        e.paymentRef ? (
          <button
            className="font-mono text-xs font-medium text-primary hover:underline"
            onClick={(ev) => { ev.stopPropagation(); showToast.info('Opening order', e.paymentRef!); }}
          >
            {e.paymentRef}
          </button>
        ) : <span className="text-xs text-muted-foreground">-</span>
      ),
    },
    {
      key: 'actions', header: '', className: 'w-10 text-right',
      cell: (e) => (
        <div className="flex justify-end" onClick={(ev) => ev.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleExtend(e)}>
                <CalendarPlus className="mr-2 h-4 w-4" /> Extend Validity
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => act('Transfer initiated', e)}>
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => act('Add Note', e)}><MessageSquare className="mr-2 h-4 w-4" /> Add Note</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" disabled={e.status === 'Revoked'} onClick={() => setRevokeTarget(e)}>
                <Ban className="mr-2 h-4 w-4" /> Revoke Access
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Entitlements"
        description="Manage student access to packages and test series."
        icon={<KeyRound className="h-5 w-5" />}
        actions={
          <Button size="sm" onClick={() => showToast.info('Grant Access', 'Access grant form would open here.')}>
            <Plus className="mr-1.5 h-4 w-4" /> Grant Access
          </Button>
        }
      />

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilterChange} onClear={handleClear} className="mb-4" />

      <Card className="p-4">
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={(e) => e.id}
          searchable
          searchKeys={(e) => `${e.id} ${e.studentName} ${e.studentId} ${e.packageName} ${e.grantedBy}`}
          selectable={false}
          rowAction={(e) => setSelected(e)}
          initialSort={{ key: 'expiryDate', dir: 'asc' }}
        />
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base">Entitlement {selected.id}</SheetTitle>
                  <StatusBadge tone={statusTone(selected.status)} dot className="text-[10px]">{selected.status}</StatusBadge>
                </div>
                <SheetDescription className="sr-only">Entitlement details</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-5">
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Student</p>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" /> {selected.studentName}
                    </p>
                    <p className="text-xs text-muted-foreground">{selected.studentId}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Package</p>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-sm font-medium text-foreground">{selected.packageName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Source</p>
                    <p className="mt-1"><StatusBadge tone={sourceTone(selected.source)} className="text-[10px]">{selected.source}</StatusBadge></p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</p>
                    <p className="mt-1"><StatusBadge tone={statusTone(selected.status)} dot className="text-[10px]">{selected.status}</StatusBadge></p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Start Date</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {selected.startDate}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Expiry Date</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {selected.expiryDate}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Granted By</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.grantedBy}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Payment Ref</p>
                    <p className="mt-1">
                      {selected.paymentRef ? (
                        <button
                          className="font-mono text-sm font-medium text-primary hover:underline"
                          onClick={() => showToast.info('Opening order', selected.paymentRef!)}
                        >
                          {selected.paymentRef}
                        </button>
                      ) : <span className="text-sm text-muted-foreground">-</span>}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  {selected.status === 'Active'
                    ? 'This student currently has access to the package.'
                    : selected.status === 'Expired'
                      ? 'Access has expired. Extend validity to re-grant access.'
                      : selected.status === 'Suspended'
                        ? 'Access is temporarily suspended.'
                        : 'Access has been revoked.'}
                </div>
              </div>

              <SheetFooter className="mt-6 flex-wrap gap-2 sm:flex-nowrap">
                <GatedButton permission="entitlements.manage" variant="outline" size="sm" onClick={() => handleExtend(selected)}>
                  <CalendarPlus className="mr-1.5 h-3.5 w-3.5" /> Extend
                </GatedButton>
                <Button variant="outline" size="sm" onClick={() => showToast.info('Transfer initiated', selected.id)}>
                  <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" /> Transfer
                </Button>
                <GatedButton permission="entitlements.manage" variant="destructive" size="sm" disabled={selected.status === 'Revoked'} onClick={() => { setRevokeTarget(selected); setSelected(null); }}>
                  <Ban className="mr-1.5 h-3.5 w-3.5" /> Revoke
                </GatedButton>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke access for {revokeTarget?.studentName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently revoke access to <span className="font-semibold text-foreground">{revokeTarget?.packageName}</span>. The student will no longer be able to take tests in this package. This action is simulated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => revokeTarget && handleRevoke(revokeTarget)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Ban className="mr-1.5 h-4 w-4" /> Confirm Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
