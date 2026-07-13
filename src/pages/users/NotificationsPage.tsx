import { useMemo, useState } from 'react';
import {
  Bell, Plus, Copy, Pencil, Send, Mail, MessageSquare, Smartphone,
  Users, Calendar, BarChart3, Info,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { showToast } from '@/components/shared/toast';
import { GatedButton } from '@/components/shared/GatedAction';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { useNotifications } from '@/app/store/selectors';
import type { NotificationCampaign } from '@/data/auxiliary';

function channelTone(channel: NotificationCampaign['channel']) {
  switch (channel) {
    case 'In-app': return 'primary';
    case 'Push': return 'info';
    case 'Email': return 'accent';
    case 'SMS': return 'warning';
    case 'WhatsApp': return 'success';
    default: return 'neutral';
  }
}

function statusTone(status: NotificationCampaign['status']) {
  switch (status) {
    case 'Sent': return 'success';
    case 'Scheduled': return 'info';
    case 'Sending': return 'warning';
    case 'Draft': return 'neutral';
    default: return 'neutral';
  }
}

const channelIcon: Record<NotificationCampaign['channel'], React.ComponentType<{ className?: string }>> = {
  'In-app': Bell,
  Push: Send,
  Email: Mail,
  SMS: Smartphone,
  WhatsApp: MessageSquare,
};

const NEXT_STATUS: Partial<Record<NotificationCampaign['status'], NotificationCampaign['status']>> = {
  Draft: 'Scheduled',
  Scheduled: 'Sent',
};

export function NotificationsPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<NotificationCampaign | null>(null);

  const notifications = useNotifications();
  const { dispatch, audit } = usePrototypeStore();

  const filterDefs: FilterDef[] = [
    {
      key: 'channel',
      label: 'Channel',
      options: ['In-app', 'Push', 'Email', 'SMS', 'WhatsApp'].map((c) => ({ label: c, value: c })),
    },
    {
      key: 'status',
      label: 'Status',
      options: ['Draft', 'Scheduled', 'Sending', 'Sent'].map((s) => ({ label: s, value: s })),
    },
  ];

  const filtered = useMemo(() => {
    let list = notifications;
    if (filters.channel && filters.channel !== 'all') list = list.filter((n) => n.channel === filters.channel);
    if (filters.status && filters.status !== 'all') list = list.filter((n) => n.status === filters.status);
    return list;
  }, [filters, notifications]);

  const handleStatusChange = (n: NotificationCampaign) => {
    const next = NEXT_STATUS[n.status];
    if (!next) {
      showToast.warning('No next status', `${n.status} campaigns cannot be advanced further.`);
      return;
    }
    const updated = { ...n, status: next };
    dispatch({ type: 'UPDATE_NOTIFICATION', notification: updated, audit: audit('NOTIFICATION_UPDATED', 'notification', n.id, n.title, n.status, next, `Status changed to ${next}`) });
    setSelected(updated);
    if (next === 'Sent') {
      showToast.success('Campaign sent', `${n.title} has been marked as sent.`);
    } else {
      showToast.success('Status updated', `${n.title} is now ${next}.`);
    }
  };

  const handleEdit = (n: NotificationCampaign) => {
    const updated = { ...n };
    dispatch({ type: 'UPDATE_NOTIFICATION', notification: updated, audit: audit('NOTIFICATION_EDITED', 'notification', n.id, n.title, n.title, n.title, 'Campaign details edited') });
    showToast.success('Campaign updated', `${n.title} has been updated.`);
    setSelected(null);
  };

  const handleDuplicate = (n: NotificationCampaign) => {
    showToast.info('Duplicated (prototype)', `${n.title} copy created as draft.`);
  };

  const columns: Column<NotificationCampaign>[] = [
    {
      key: 'title',
      header: 'Title',
      sortValue: (n) => n.title,
      cell: (n) => <span className="text-sm font-medium text-foreground">{n.title}</span>,
    },
    {
      key: 'channel',
      header: 'Channel',
      cell: (n) => <StatusBadge tone={channelTone(n.channel)} dot className="text-[10px]">{n.channel}</StatusBadge>,
      sortValue: (n) => n.channel,
    },
    {
      key: 'audience',
      header: 'Audience',
      hideOnMobile: true,
      cell: (n) => <span className="text-sm text-muted-foreground">{n.audience}</span>,
      sortValue: (n) => n.audience,
    },
    {
      key: 'template',
      header: 'Template',
      hideOnMobile: true,
      cell: (n) => <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">{n.template}</Badge>,
      sortValue: (n) => n.template,
    },
    {
      key: 'scheduled',
      header: 'Scheduled',
      cell: (n) => <span className="text-xs text-muted-foreground">{n.scheduled}</span>,
      sortValue: (n) => n.scheduled,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (n) => <StatusBadge tone={statusTone(n.status)} dot className="text-[10px]">{n.status}</StatusBadge>,
      sortValue: (n) => n.status,
    },
    {
      key: 'deliveryCount',
      header: 'Delivered',
      className: 'text-right',
      hideOnMobile: true,
      cell: (n) => <span className="text-sm font-medium text-foreground">{n.deliveryCount.toLocaleString()}</span>,
      sortValue: (n) => n.deliveryCount,
    },
    {
      key: 'openRate',
      header: 'Open Rate',
      className: 'text-right',
      hideOnMobile: true,
      cell: (n) => <span className={cn('text-sm font-semibold', n.openRate > 0 ? 'text-foreground' : 'text-muted-foreground')}>{n.openRate}%</span>,
      sortValue: (n) => n.openRate,
    },
    {
      key: 'clickRate',
      header: 'Click Rate',
      className: 'text-right',
      hideOnMobile: true,
      cell: (n) => <span className={cn('text-sm font-semibold', n.clickRate > 0 ? 'text-foreground' : 'text-muted-foreground')}>{n.clickRate}%</span>,
      sortValue: (n) => n.clickRate,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Manage notification campaigns across channels."
        icon={<Bell className="h-5 w-5" />}
        actions={
          <Button size="sm" onClick={() => showToast.info('New Campaign', 'Campaign composer will open here.')}>
            <Plus className="mr-1.5 h-4 w-4" /> New Campaign
          </Button>
        }
      />

      <div className="mb-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <span>SMS and WhatsApp channels are placeholders — not connected to any real gateway.</span>
      </div>

      <FilterBar
        filters={filterDefs}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClear={() => setFilters({})}
        className="mb-4"
      />

      <Card className="p-4">
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={(n) => n.id}
          searchKeys={(n) => `${n.id} ${n.title} ${n.audience} ${n.template} ${n.channel}`}
          selectable={false}
          rowAction={(n) => setSelected(n)}
          initialSort={{ key: 'scheduled', dir: 'desc' }}
          emptyTitle="No campaigns found"
          emptyDescription="Try adjusting your filters or search terms."
        />
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base">{selected.title}</SheetTitle>
                  <StatusBadge tone={statusTone(selected.status)} dot className="text-[10px]">{selected.status}</StatusBadge>
                </div>
                <SheetDescription className="sr-only">Campaign details</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {(() => { const I = channelIcon[selected.channel]; return <I className="h-3.5 w-3.5" />; })()}
                      <span className="text-[11px] font-medium uppercase tracking-wider">Channel</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.channel}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium uppercase tracking-wider">Audience</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.audience}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium uppercase tracking-wider">Template</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.template}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium uppercase tracking-wider">Scheduled</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.scheduled}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Delivery Statistics</p>
                  <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Delivered</span>
                        <span className="font-semibold text-foreground">{selected.deliveryCount.toLocaleString()}</span>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Open Rate</span>
                        <span className="font-semibold text-foreground">{selected.openRate}%</span>
                      </div>
                      <Progress value={selected.openRate} className="h-2" />
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Click Rate</span>
                        <span className="font-semibold text-foreground">{selected.clickRate}%</span>
                      </div>
                      <Progress value={selected.clickRate} className="h-2" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><BarChart3 className="h-3.5 w-3.5" /> Opened</span>
                      <span className="font-medium text-foreground">{Math.round((selected.deliveryCount * selected.openRate) / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><BarChart3 className="h-3.5 w-3.5" /> Clicked</span>
                      <span className="font-medium text-foreground">{Math.round((selected.deliveryCount * selected.clickRate) / 100).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6 gap-2 sm:flex-nowrap">
                {selected.status !== 'Sent' && selected.status !== 'Sending' && (
                  <GatedButton permission="notifications.send" size="sm" onClick={() => handleStatusChange(selected)}>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    {selected.status === 'Draft' ? 'Schedule' : 'Send Now'}
                  </GatedButton>
                )}
                <GatedButton permission="notifications.send" variant="outline" size="sm" onClick={() => handleEdit(selected)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                </GatedButton>
                <Button variant="outline" size="sm" onClick={() => handleDuplicate(selected)}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Duplicate
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
