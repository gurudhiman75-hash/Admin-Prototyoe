import { useMemo, useState } from 'react';
import {
  LifeBuoy, Download, AlertTriangle, CheckCircle2, XCircle, User,
  Clock, Smartphone, Camera, Link2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge, supportStatusTone } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { showToast } from '@/components/shared/toast';
import { GatedButton } from '@/components/shared/GatedAction';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { useSupportRequests, useSupportComments } from '@/app/store/selectors';
import type { SupportRequest } from '@/data/users';
import { REVIEWERS } from '@/data/exams';

function typeTone(type: SupportRequest['type']) {
  switch (type) {
    case 'Wrong Answer': return 'destructive';
    case 'Unclear Wording': return 'warning';
    case 'Translation Issue': return 'accent';
    case 'Payment Issue': return 'info';
    case 'Access Issue': return 'warning';
    case 'Technical Issue': return 'destructive';
    default: return 'neutral';
  }
}

function priorityTone(p: SupportRequest['priority']) {
  switch (p) {
    case 'Low': return 'neutral';
    case 'Medium': return 'info';
    case 'High': return 'warning';
    case 'Critical': return 'destructive';
    default: return 'neutral';
  }
}

const statusTimeline: Record<string, { label: string; tone: string }[]> = {
  New: [{ label: 'Request submitted', tone: 'info' }],
  Investigating: [
    { label: 'Request submitted', tone: 'info' },
    { label: 'Agent started investigation', tone: 'warning' },
  ],
  'Waiting for User': [
    { label: 'Request submitted', tone: 'info' },
    { label: 'Agent started investigation', tone: 'warning' },
    { label: 'Awaiting student reply', tone: 'default' },
  ],
  Corrected: [
    { label: 'Request submitted', tone: 'info' },
    { label: 'Agent started investigation', tone: 'warning' },
    { label: 'Issue corrected', tone: 'primary' },
  ],
  Rejected: [
    { label: 'Request submitted', tone: 'info' },
    { label: 'Agent started investigation', tone: 'warning' },
    { label: 'Request rejected', tone: 'destructive' },
  ],
  Resolved: [
    { label: 'Request submitted', tone: 'info' },
    { label: 'Agent started investigation', tone: 'warning' },
    { label: 'Issue resolved', tone: 'success' },
  ],
};

const dotTone: Record<string, string> = {
  info: 'bg-info', warning: 'bg-warning', default: 'bg-muted-foreground/50',
  primary: 'bg-primary', destructive: 'bg-destructive', success: 'bg-success',
};

export function SupportRequestsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<SupportRequest | null>(null);
  const [commentText, setCommentText] = useState('');

  const supportRequests = useSupportRequests();
  const { dispatch, audit, activeAdminName } = usePrototypeStore();
  const comments = useSupportComments(selected?.id ?? '');

  const stats = useMemo(() => {
    const total = supportRequests.length;
    const newCount = supportRequests.filter((r) => r.status === 'New').length;
    const investigating = supportRequests.filter((r) => r.status === 'Investigating').length;
    const resolved = supportRequests.filter((r) => r.status === 'Resolved').length;
    return { total, newCount, investigating, resolved };
  }, [supportRequests]);

  const filterDefs: FilterDef[] = [
    {
      key: 'type',
      label: 'Type',
      options: ['Wrong Answer', 'Unclear Wording', 'Translation Issue', 'Payment Issue', 'Access Issue', 'Technical Issue'].map((t) => ({ label: t, value: t })),
    },
    {
      key: 'status',
      label: 'Status',
      options: ['New', 'Investigating', 'Waiting for User', 'Corrected', 'Rejected', 'Resolved'].map((s) => ({ label: s, value: s })),
    },
    {
      key: 'priority',
      label: 'Priority',
      options: ['Low', 'Medium', 'High', 'Critical'].map((p) => ({ label: p, value: p })),
    },
    {
      key: 'assignedAgent',
      label: 'Agent',
      options: [...REVIEWERS.map((r) => ({ label: r, value: r })), { label: 'Unassigned', value: 'unassigned' }],
    },
  ];

  const filtered = useMemo(() => {
    let list = supportRequests;
    if (filters.type && filters.type !== 'all') list = list.filter((r) => r.type === filters.type);
    if (filters.status && filters.status !== 'all') list = list.filter((r) => r.status === filters.status);
    if (filters.priority && filters.priority !== 'all') list = list.filter((r) => r.priority === filters.priority);
    if (filters.assignedAgent && filters.assignedAgent !== 'all') {
      list = filters.assignedAgent === 'unassigned'
        ? list.filter((r) => r.assignedAgent === null)
        : list.filter((r) => r.assignedAgent === filters.assignedAgent);
    }
    return list;
  }, [filters, supportRequests]);

  const handleAssign = () => {
    if (!selected) return;
    const updated = { ...selected, assignedAgent: activeAdminName };
    dispatch({ type: 'UPDATE_SUPPORT', support: updated, audit: audit('SUPPORT_ASSIGNED', 'support', selected.id, selected.id, selected.assignedAgent ?? 'Unassigned', activeAdminName, 'Self-assigned by admin') });
    setSelected(updated);
    showToast.success('Assigned to you', `${selected.id} is now assigned to ${activeAdminName}.`);
  };

  const handleStatusChange = (newStatus: SupportRequest['status']) => {
    if (!selected) return;
    const updated = { ...selected, status: newStatus };
    const action = newStatus === 'Resolved' ? 'SUPPORT_RESOLVED' : 'STATUS_CHANGED';
    dispatch({ type: 'UPDATE_SUPPORT', support: updated, audit: audit(action, 'support', selected.id, selected.id, selected.status, newStatus, `Status changed to ${newStatus}`) });
    setSelected(updated);
    if (newStatus === 'Resolved') {
      showToast.success('Request resolved', `${selected.id} marked as resolved.`);
    } else if (newStatus === 'Rejected') {
      showToast.error('Request rejected', `${selected.id} has been rejected.`);
    } else {
      showToast.info('Status updated', `${selected.id} is now ${newStatus}.`);
    }
  };

  const handlePriorityChange = (newPriority: SupportRequest['priority']) => {
    if (!selected) return;
    const updated = { ...selected, priority: newPriority };
    dispatch({ type: 'UPDATE_SUPPORT', support: updated, audit: audit('PRIORITY_CHANGED', 'support', selected.id, selected.id, selected.priority, newPriority, `Priority changed to ${newPriority}`) });
    setSelected(updated);
    showToast.info('Priority updated', `${selected.id} priority set to ${newPriority}.`);
  };

  const handleAddComment = () => {
    if (!selected) return;
    if (!commentText.trim()) {
      showToast.warning('Comment empty', 'Enter a comment before saving.');
      return;
    }
    dispatch({
      type: 'ADD_SUPPORT_COMMENT',
      supportId: selected.id,
      comment: { id: `CMT-${Date.now()}`, author: activeAdminName, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), content: commentText.trim() },
    });
    showToast.success('Comment added', 'Internal comment saved.');
    setCommentText('');
  };

  const handleOpenRelated = (type: 'student' | 'question' | 'test' | 'order', id: string) => {
    switch (type) {
      case 'student': navigate(`/users/students/${id}`); break;
      case 'question': navigate(`/content/questions/${id}`); break;
      case 'test': navigate(`/tests/${id}`); break;
      case 'order': navigate(`/commerce/orders/${id}`); break;
    }
  };

  const columns: Column<SupportRequest>[] = [
    {
      key: 'id',
      header: 'ID',
      cell: (r) => <span className="font-mono text-xs font-medium text-foreground">{r.id}</span>,
      sortValue: (r) => r.id,
    },
    {
      key: 'type',
      header: 'Type',
      cell: (r) => <StatusBadge tone={typeTone(r.type)} dot className="text-[10px]">{r.type}</StatusBadge>,
      sortValue: (r) => r.type,
    },
    {
      key: 'student',
      header: 'Student',
      cell: (r) => (
        <div className="min-w-[140px]">
          <p className="text-sm font-medium text-foreground">{r.studentName}</p>
          <p className="text-xs text-muted-foreground">{r.studentId}</p>
        </div>
      ),
      sortValue: (r) => r.studentName,
    },
    {
      key: 'relatedTest',
      header: 'Related Test',
      hideOnMobile: true,
      cell: (r) => <span className="text-sm text-foreground">{r.relatedTest}</span>,
      sortValue: (r) => r.relatedTest,
    },
    {
      key: 'relatedQuestion',
      header: 'Question',
      hideOnMobile: true,
      cell: (r) => (r.relatedQuestion ? <span className="font-mono text-xs text-foreground">{r.relatedQuestion}</span> : <span className="text-muted-foreground">—</span>),
    },
    {
      key: 'language',
      header: 'Language',
      hideOnMobile: true,
      cell: (r) => <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">{r.language}</Badge>,
      sortValue: (r) => r.language,
    },
    {
      key: 'priority',
      header: 'Priority',
      cell: (r) => <StatusBadge tone={priorityTone(r.priority)} dot className="text-[10px]">{r.priority}</StatusBadge>,
      sortValue: (r) => r.priority,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge tone={supportStatusTone(r.status)} dot className="text-[10px]">{r.status}</StatusBadge>,
      sortValue: (r) => r.status,
    },
    {
      key: 'assignedAgent',
      header: 'Agent',
      hideOnMobile: true,
      cell: (r) => r.assignedAgent ? <span className="text-sm text-foreground">{r.assignedAgent}</span> : <span className="text-sm text-muted-foreground">Unassigned</span>,
      sortValue: (r) => r.assignedAgent ?? 'zzz',
    },
    {
      key: 'createdAt',
      header: 'Created',
      cell: (r) => <span className="text-xs text-muted-foreground">{r.createdAt}</span>,
      sortValue: (r) => r.createdAt,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Support Requests"
        description="Student support and question-challenge queue."
        icon={<LifeBuoy className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => showToast.success('Export started', 'Support requests CSV will download shortly.')}>
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Requests" value={stats.total.toLocaleString()} icon={LifeBuoy} sublabel="all time" tone="primary" />
        <StatCard label="New" value={stats.newCount.toLocaleString()} icon={AlertTriangle} sublabel="awaiting triage" tone="info" />
        <StatCard label="Investigating" value={stats.investigating.toLocaleString()} icon={Clock} sublabel="in progress" tone="warning" />
        <StatCard label="Resolved" value={stats.resolved.toLocaleString()} icon={CheckCircle2} sublabel="completed" tone="success" />
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
          getRowId={(r) => r.id}
          searchKeys={(r) => `${r.id} ${r.studentName} ${r.studentId} ${r.type} ${r.relatedTest} ${r.relatedQuestion ?? ''}`}
          selectable={false}
          rowAction={(r) => setSelected(r)}
          initialSort={{ key: 'createdAt', dir: 'desc' }}
          emptyTitle="No support requests found"
          emptyDescription="Try adjusting your filters or search terms."
        />
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle className="font-mono text-base">{selected.id}</SheetTitle>
                  <StatusBadge tone={supportStatusTone(selected.status)} dot className="text-[10px]">{selected.status}</StatusBadge>
                </div>
                <SheetDescription className="sr-only">Support request details</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-5">
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Request Type</p>
                  <StatusBadge tone={typeTone(selected.type)} dot>{selected.type}</StatusBadge>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Student</p>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{selected.studentName}</p>
                        <p className="text-xs text-muted-foreground">{selected.studentId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Related Test</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.relatedTest}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Related Question</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.relatedQuestion ?? '—'}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Related Links</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleOpenRelated('student', selected.studentId)}>
                      <Link2 className="mr-1.5 h-3 w-3" /> Open Student
                    </Button>
                    {selected.relatedQuestion && (
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => selected.relatedQuestion && handleOpenRelated('question', selected.relatedQuestion)}>
                        <Link2 className="mr-1.5 h-3 w-3" /> Open Question
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Screenshot</p>
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
                    <div className="flex flex-col items-center gap-1.5">
                      <Camera className="h-6 w-6" />
                      <span className="text-xs">Screenshot</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Smartphone className="h-3.5 w-3.5" /> App Version</span>
                    <span className="font-medium text-foreground">v3.2.1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <Badge variant="outline" className="text-[10px] font-normal">{selected.language}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <select
                      className="h-7 rounded border border-input bg-background px-1 text-xs"
                      value={selected.priority}
                      onChange={(e) => handlePriorityChange(e.target.value as SupportRequest['priority'])}
                    >
                      {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge tone={supportStatusTone(selected.status)} dot className="text-[10px]">{selected.status}</StatusBadge>
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Assigned Agent</span>
                    <span className="font-medium text-foreground">{selected.assignedAgent ?? 'Unassigned'}</span>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Timeline</p>
                  <ol className="space-y-2.5 border-l pl-4">
                    {(statusTimeline[selected.status] ?? statusTimeline.New).map((s, i) => (
                      <li key={i} className="relative">
                        <span className={cn('absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-background', dotTone[s.tone] ?? 'bg-muted')} />
                        <p className="text-sm font-medium text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{selected.createdAt}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Internal Comments</p>
                  <div className="space-y-2">
                    {comments.length === 0 ? (
                      <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">No comments recorded for this request.</p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="rounded-lg border bg-muted/30 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{c.author}</span>
                            <span className="text-xs text-muted-foreground">{c.timestamp}</span>
                          </div>
                          <p className="mt-1.5 text-sm text-foreground">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-2 space-y-2">
                    <Textarea
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add an internal comment..."
                    />
                    <Button size="sm" onClick={handleAddComment}>Add Comment</Button>
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6 flex-wrap gap-2 sm:flex-nowrap">
                <GatedButton permission="support.manage" variant="outline" size="sm" onClick={handleAssign}>
                  <User className="mr-1.5 h-3.5 w-3.5" /> Assign to Me
                </GatedButton>
                <GatedButton permission="support.manage" variant="outline" size="sm" onClick={() => handleStatusChange('Investigating')}>
                  <Clock className="mr-1.5 h-3.5 w-3.5" /> Investigate
                </GatedButton>
                <GatedButton permission="support.manage" variant="outline" size="sm" className="border-success/40 text-success hover:bg-success/10" onClick={() => handleStatusChange('Resolved')}>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Resolve
                </GatedButton>
                <GatedButton permission="support.manage" variant="outline" size="sm" className="border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => handleStatusChange('Rejected')}>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                </GatedButton>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
