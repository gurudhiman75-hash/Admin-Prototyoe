import { useMemo, useState } from 'react';
import {
  ScrollText, Download, Lock, Clock, User, Server, AlertTriangle, KeyRound,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { showToast } from '@/components/shared/toast';
import { useAuditLogs } from '@/app/store/selectors';
import type { AuditEntry } from '@/app/store/types';
import {
  Card, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { ADMIN_NAMES } from '@/data/exams';

const ACTION_TYPES = ['CREATED', 'APPROVED', 'ARCHIVED', 'PUBLISHED', 'REFUND_INITIATED', 'COUPON_CREATED', 'SENT_FOR_CORRECTION', 'ROLE_CHANGED', 'AUTO_RECONCILE', 'PRICE_UPDATED', 'BATCH_GENERATED', 'QUESTION_APPROVED_FROM_STUDIO', 'BRANDING_UPDATED', 'DATA_RESET'] as const;

function actionTone(action: string) {
  switch (action) {
    case 'CREATED': return 'info';
    case 'APPROVED': case 'QUESTION_APPROVED_FROM_STUDIO': return 'success';
    case 'ARCHIVED': return 'warning';
    case 'PUBLISHED': return 'primary';
    case 'REFUND_INITIATED': return 'destructive';
    case 'COUPON_CREATED': return 'accent';
    case 'SENT_FOR_CORRECTION': return 'warning';
    case 'ROLE_CHANGED': return 'info';
    case 'AUTO_RECONCILE': return 'neutral';
    case 'PRICE_UPDATED': return 'accent';
    case 'BATCH_GENERATED': return 'primary';
    case 'BRANDING_UPDATED': return 'info';
    case 'DATA_RESET': return 'destructive';
    default: return 'neutral';
  }
}

function approvalTone(s: AuditEntry['approvalStatus']) {
  return s === 'Auto' ? 'neutral' : s === 'Approved' ? 'success' : 'warning';
}

function entityLabel(e: AuditEntry): string {
  return `${e.entityType} · ${e.entityName}`;
}

function PrototypeNotice() {
  return (
    <Card className="mt-8 border-warning/40 bg-warning/5">
      <CardContent className="flex items-start gap-3 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p className="text-sm text-muted-foreground">
          This standalone prototype is not connected to the live ExamTree application.
        </p>
      </CardContent>
    </Card>
  );
}

export function AuditLogsPage() {
  const logs = useAuditLogs();
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const [adminFilter, setAdminFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');

  const admins = useMemo(() => Array.from(new Set(logs.map((l) => l.admin))), [logs]);
  const actions = useMemo(() => Array.from(new Set(logs.map((l) => l.action))), [logs]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (adminFilter !== 'all' && log.admin !== adminFilter) return false;
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (approvalFilter !== 'all' && log.approvalStatus !== approvalFilter) return false;
      return true;
    });
  }, [logs, adminFilter, actionFilter, approvalFilter]);

  const columns: Column<AuditEntry>[] = [
    {
      key: 'timestamp', header: 'Timestamp', className: 'min-w-[140px]',
      cell: (r) => <span className="font-mono text-xs text-foreground">{r.timestamp}</span>,
      sortValue: (r) => r.timestamp,
    },
    {
      key: 'admin', header: 'Admin',
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{r.admin}</span>
        </div>
      ),
      sortValue: (r) => r.admin,
    },
    {
      key: 'role', header: 'Role', hideOnMobile: true,
      cell: (r) => <span className="text-xs text-muted-foreground">{r.role}</span>,
      sortValue: (r) => r.role,
    },
    {
      key: 'action', header: 'Action',
      cell: (r) => <StatusBadge tone={actionTone(r.action)} className="text-[10px]">{r.action}</StatusBadge>,
      sortValue: (r) => r.action,
    },
    {
      key: 'entity', header: 'Entity', hideOnMobile: true,
      cell: (r) => <span className="text-sm text-foreground">{entityLabel(r)}</span>,
      sortValue: (r) => r.entityName,
    },
    {
      key: 'oldValue', header: 'Old Value', hideOnMobile: true,
      cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.oldValue}</span>,
    },
    {
      key: 'newValue', header: 'New Value', hideOnMobile: true,
      cell: (r) => <span className="font-mono text-xs text-foreground">{r.newValue}</span>,
    },
    {
      key: 'reason', header: 'Reason', hideOnMobile: true, className: 'max-w-[180px]',
      cell: (r) => <span className="line-clamp-1 text-xs text-muted-foreground">{r.reason}</span>,
    },
    {
      key: 'sessionId', header: 'Session', hideOnMobile: true,
      cell: (r) => (
        <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <Server className="h-3 w-3 shrink-0" />{r.sessionId.slice(0, 12)}
        </span>
      ),
    },
    {
      key: 'approvalStatus', header: 'Approval',
      cell: (r) => <StatusBadge tone={approvalTone(r.approvalStatus)} dot className="text-[10px]">{r.approvalStatus}</StatusBadge>,
      sortValue: (r) => r.approvalStatus,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Immutable record of all admin actions."
        icon={<ScrollText className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => showToast.success('Export started', 'Audit logs CSV will download shortly.')}>
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
        }
      />

      <Card className="mb-4 border-warning/30 bg-warning/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-foreground">Audit logs are immutable and cannot be modified.</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Every entry is a permanent, tamper-evident record of an administrative action.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Admin</label>
            <Select value={adminFilter} onValueChange={setAdminFilter}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All admins</SelectItem>
                {admins.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                {ADMIN_NAMES.filter((n) => !admins.includes(n)).map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Action Type</label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                {ACTION_TYPES.filter((a) => !actions.includes(a)).map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Approval Status</label>
            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Auto">Auto</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={(r) => r.id}
          searchable
          searchKeys={(r) => `${r.id} ${r.admin} ${r.role} ${r.action} ${r.entityType} ${r.entityName} ${r.reason}`}
          selectable={false}
          rowAction={(r) => setSelected(r)}
          initialSort={{ key: 'timestamp', dir: 'desc' }}
          emptyTitle="No audit entries match these filters"
          emptyDescription="Adjust the filters above or clear them to see all records."
        />
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle className="font-mono text-base">{selected.id}</SheetTitle>
                  <StatusBadge tone={actionTone(selected.action)} className="text-[10px]">{selected.action}</StatusBadge>
                </div>
                <SheetDescription className="sr-only">Audit log entry detail</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-5">
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Timestamp</p>
                  <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium text-foreground">{selected.timestamp}</span>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Admin</p>
                  <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{selected.admin}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <KeyRound className="h-3 w-3" /> {selected.role}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Action & Entity</p>
                  <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Action</span>
                      <StatusBadge tone={actionTone(selected.action)} dot className="text-[10px]">{selected.action}</StatusBadge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Entity Type</span>
                      <span className="font-medium text-foreground">{selected.entityType}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Entity</span>
                      <span className="font-medium text-foreground">{selected.entityName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Entity ID</span>
                      <span className="font-mono text-xs text-foreground">{selected.entityId}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Approval</span>
                      <StatusBadge tone={approvalTone(selected.approvalStatus)} dot className="text-[10px]">{selected.approvalStatus}</StatusBadge>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Value Change</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Old Value</p>
                      <p className="mt-1 font-mono text-sm text-muted-foreground">{selected.oldValue}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">New Value</p>
                      <p className="mt-1 font-mono text-sm font-medium text-foreground">{selected.newValue}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Reason</p>
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm text-foreground">{selected.reason}</div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Session</p>
                  <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm text-foreground">{selected.sessionId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <Lock className="h-4 w-4 shrink-0 text-warning" />
                  <p className="text-xs text-muted-foreground">This entry is immutable. No edits or deletions are permitted.</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <PrototypeNotice />
    </div>
  );
}
