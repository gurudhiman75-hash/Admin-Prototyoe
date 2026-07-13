import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LifeBuoy, ArrowLeft, Type as TypeIcon, User, FileText, FileQuestion,
  Languages, History, UserCog, MessageSquare,
  Image as ImageIcon, Send,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, supportStatusTone } from '@/components/shared/StatusBadge';
import { ErrorState } from '@/components/shared/EmptyState';
import { showToast } from '@/components/shared/toast';
import { GatedButton } from '@/components/shared/GatedAction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { useSupportById, useSupportComments, useAuditLogs } from '@/app/store/selectors';
import type { AuditEntry, SupportRequest } from '@/app/store/types';

function priorityTone(priority: string) {
  switch (priority) {
    case 'Critical': return 'destructive' as const;
    case 'High': return 'warning' as const;
    case 'Medium': return 'info' as const;
    case 'Low': return 'neutral' as const;
    default: return 'neutral' as const;
  }
}

interface StatusChange { status: SupportRequest['status']; time: string; actor: string; }

export function SupportDetailPage() {
  const { id } = useParams();
  const request = useSupportById(id);
  const comments = useSupportComments(id ?? '');
  const { dispatch, audit, activeAdminName } = usePrototypeStore();
  const auditLogs = useAuditLogs();
  const [comment, setComment] = useState('');
  const [statusSelect, setStatusSelect] = useState('');
  const [prioritySelect, setPrioritySelect] = useState('');

  const entityAudit = useMemo(
    () => auditLogs.filter((a) => a.entityId.includes(id ?? '')),
    [auditLogs, id],
  );

  const statusHistory = useMemo<StatusChange[]>(() => {
    if (!request) return [];
    return [
      { status: 'New', time: request.createdAt, actor: 'System' },
      { status: request.status, time: new Date().toISOString().slice(0, 10), actor: request.assignedAgent ?? 'Unassigned' },
    ];
  }, [request]);

  const mockDescription = useMemo(() => {
    if (!request) return '';
    switch (request.type) {
      case 'Wrong Answer': return 'The student reports that the marked correct answer for this question does not match the official answer key. They have provided their reasoning and requested a review of the question solution.';
      case 'Unclear Wording': return 'The student found the question stem ambiguous and difficult to interpret. They suggest rephrasing for clarity and better readability.';
      case 'Translation Issue': return 'The Punjabi translation of this question contains errors that change the meaning. The student requests a corrected translation.';
      case 'Payment Issue': return 'The student completed the payment but did not receive access to the purchased package. The payment gateway shows a successful transaction but the entitlement was not granted.';
      case 'Access Issue': return 'The student is unable to access their purchased tests despite having an active entitlement. They see an error message when attempting to start a test.';
      case 'Technical Issue': return 'The student experienced a platform error during their test attempt. The test interface froze and they were unable to submit their responses.';
      default: return 'Issue reported by the student.';
    }
  }, [request]);

  if (!request) {
    return (
      <ErrorState
        title="Support request not found"
        description={`No support request exists with ID "${id}". It may have been removed.`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/users/support"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Support Requests</Link>
          </Button>
        }
      />
    );
  }

  const handleAssignToMe = () => {
    const updated = { ...request, assignedAgent: activeAdminName };
    dispatch({ type: 'UPDATE_SUPPORT', support: updated, audit: audit('SUPPORT_ASSIGNED', 'support', request.id, request.id, request.assignedAgent ?? 'Unassigned', activeAdminName, 'Support request self-assigned') });
    showToast.success('Assigned to you', `${request.id} is now assigned to ${activeAdminName}.`);
  };

  const handleChangeStatus = () => {
    if (!statusSelect) {
      showToast.warning('Select a status', 'Choose a status before applying.');
      return;
    }
    const newStatus = statusSelect as SupportRequest['status'];
    const updated = { ...request, status: newStatus };
    dispatch({ type: 'UPDATE_SUPPORT', support: updated, audit: audit('SUPPORT_STATUS_CHANGED', 'support', request.id, request.id, request.status, newStatus, 'Support status changed by admin') });
    showToast.success('Status updated', `${request.id} is now ${newStatus}.`);
    setStatusSelect('');
  };

  const handleChangePriority = () => {
    if (!prioritySelect) {
      showToast.warning('Select a priority', 'Choose a priority before applying.');
      return;
    }
    const newPriority = prioritySelect as SupportRequest['priority'];
    const updated = { ...request, priority: newPriority };
    dispatch({ type: 'UPDATE_SUPPORT', support: updated, audit: audit('SUPPORT_PRIORITY_CHANGED', 'support', request.id, request.id, request.priority, newPriority, 'Support priority changed by admin') });
    showToast.success('Priority updated', `${request.id} is now ${newPriority} priority.`);
    setPrioritySelect('');
  };

  const handleAddComment = () => {
    if (!comment.trim()) {
      showToast.warning('Comment empty', 'Enter a comment before posting.');
      return;
    }
    dispatch({
      type: 'ADD_SUPPORT_COMMENT',
      supportId: request.id,
      comment: { id: `CMT-${Date.now()}`, author: activeAdminName, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), content: comment.trim() },
    });
    showToast.success('Comment added', 'Your comment has been posted.');
    setComment('');
  };

  return (
    <div>
      <PageHeader
        title={request.id}
        description="Support Request Detail"
        icon={<LifeBuoy className="h-5 w-5" />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/users/support"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Support Requests</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow icon={TypeIcon} label="Type" value={request.type} />
              <DetailRow icon={User} label="Student" value={request.studentName} link={`/users/students/${request.studentId}`} />
              <DetailRow icon={FileText} label="Related Test" value={request.relatedTest} />
              <DetailRow
                icon={FileQuestion}
                label="Related Question"
                value={request.relatedQuestion ?? 'None'}
                link={request.relatedQuestion ? `/content/questions/${request.relatedQuestion}` : undefined}
              />
              <DetailRow icon={Languages} label="Language" value={request.language} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground">{mockDescription}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Screenshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed bg-muted/30">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-xs text-muted-foreground">No screenshot attached</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="h-4 w-4" /> Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment to this support request..."
                />
                <Button size="sm" onClick={handleAddComment}>
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Post Comment
                </Button>
              </div>
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No comments yet.</p>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 border-l pl-6">
                {statusHistory.map((s, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                    <p className="text-sm font-medium text-foreground">{s.status}</p>
                    <p className="text-xs text-muted-foreground">{s.actor} - {s.time}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <StatusBadge tone={priorityTone(request.priority)} dot>{request.priority}</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge tone={supportStatusTone(request.status)} dot>{request.status}</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assigned Agent</span>
                <span className="text-sm font-medium text-foreground">{request.assignedAgent ?? 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium text-foreground">{request.createdAt}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <GatedButton permission="support.manage" variant="default" size="sm" className="w-full justify-start" onClick={handleAssignToMe} disabled={request.assignedAgent === activeAdminName}>
                <UserCog className="mr-1.5 h-4 w-4" /> Assign to Me
              </GatedButton>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Change Status</label>
                <div className="flex gap-2">
                  <select
                    className="flex h-8 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                    value={statusSelect}
                    onChange={(e) => setStatusSelect(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <GatedButton permission="support.manage" variant="outline" size="sm" onClick={handleChangeStatus}>
                    Apply
                  </GatedButton>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Change Priority</label>
                <div className="flex gap-2">
                  <select
                    className="flex h-8 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                    value={prioritySelect}
                    onChange={(e) => setPrioritySelect(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                  <GatedButton permission="support.manage" variant="outline" size="sm" onClick={handleChangePriority}>
                    Apply
                  </GatedButton>
                </div>
              </div>
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
