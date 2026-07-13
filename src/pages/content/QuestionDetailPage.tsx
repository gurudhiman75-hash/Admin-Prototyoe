import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileQuestion, ArrowLeft, CheckCircle2, Circle, BookOpen, Layers,
  Tag, BarChart3, Clock, Target, Type, Languages, User, Eye,
  ShieldCheck, Archive, PencilLine, XCircle, History, TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, questionStatusTone, difficultyTone } from '@/components/shared/StatusBadge';
import { StatCard } from '@/components/shared/StatCard';
import { ErrorState } from '@/components/shared/EmptyState';
import { showToast } from '@/components/shared/toast';
import { GatedButton } from '@/components/shared/GatedAction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { useQuestionById, useAuditLogs } from '@/app/store/selectors';
import type { AuditEntry } from '@/app/store/types';

export function QuestionDetailPage() {
  const { id } = useParams();
  const question = useQuestionById(id);
  const { dispatch, audit, activeAdminName } = usePrototypeStore();
  const auditLogs = useAuditLogs();

  const entityAudit = useMemo(
    () => auditLogs.filter((a) => a.entityId.includes(id ?? '')),
    [auditLogs, id],
  );

  if (!question) {
    return (
      <ErrorState
        title="Question not found"
        description={`No question exists with ID "${id}". It may have been removed.`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/content/questions"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Question Bank</Link>
          </Button>
        }
      />
    );
  }

  const handleApprove = () => {
    const updated = { ...question, status: 'Approved', reviewer: activeAdminName };
    dispatch({ type: 'UPDATE_QUESTION', question: updated, audit: audit('QUESTION_APPROVED', 'question', question.id, `Q-${question.id}`, question.status, 'Approved', 'Question approved by reviewer') });
    showToast.success('Question approved', `${question.id} is now Approved.`);
  };

  const handleReject = () => {
    const updated = { ...question, status: 'Needs Fix' };
    dispatch({ type: 'UPDATE_QUESTION', question: updated, audit: audit('QUESTION_REJECTED', 'question', question.id, `Q-${question.id}`, question.status, 'Needs Fix', 'Question sent back for fixes') });
    showToast.warning('Question rejected', `${question.id} marked as Needs Fix.`);
  };

  const handleArchive = () => {
    const updated = { ...question, status: 'Archived' };
    dispatch({ type: 'UPDATE_QUESTION', question: updated, audit: audit('QUESTION_ARCHIVED', 'question', question.id, `Q-${question.id}`, question.status, 'Archived', 'Question archived by admin') });
    showToast.info('Question archived', `${question.id} has been archived.`);
  };

  return (
    <div>
      <PageHeader
        title={question.id}
        description="Question Detail"
        icon={<FileQuestion className="h-5 w-5" />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/content/questions"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Question Bank</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Stem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-foreground">{question.stem}</p>
              {question.stemPunjabi && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Punjabi Translation</p>
                  <p className="text-sm leading-relaxed text-foreground">{question.stemPunjabi}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {question.options.map((opt) => {
                const isCorrect = opt.id === question.correctOption;
                return (
                  <div
                    key={opt.id}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3',
                      isCorrect ? 'border-success/40 bg-success/10' : 'bg-card',
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{opt.id}.</span> {opt.text}
                      </p>
                      {opt.textPunjabi && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{opt.textPunjabi}</p>
                      )}
                    </div>
                    {isCorrect && <StatusBadge tone="success" className="text-[10px]">Correct</StatusBadge>}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground">{question.explanation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow icon={BookOpen} label="Exam" value={question.exam} />
              <DetailRow icon={Layers} label="Subject" value={question.subject} />
              <DetailRow icon={BookOpen} label="Chapter" value={question.chapter} />
              <DetailRow icon={Tag} label="Topic" value={question.topic} />
              <DetailRow icon={Target} label="Difficulty" value={question.difficulty} badge={<StatusBadge tone={difficultyTone(question.difficulty)} dot className="text-[10px]">{question.difficulty}</StatusBadge>} />
              <DetailRow icon={Type} label="Type" value={question.type} />
              <DetailRow icon={Languages} label="Languages" value={question.language.join(', ')} />
              <DetailRow icon={Eye} label="Status" value={question.status} badge={<StatusBadge tone={questionStatusTone(question.status)} dot className="text-[10px]">{question.status}</StatusBadge>} />
              <DetailRow icon={User} label="Author" value={question.author} />
              <DetailRow icon={ShieldCheck} label="Reviewer" value={question.reviewer ?? 'Unassigned'} />
              <DetailRow icon={Clock} label="Created" value={question.createdAt} />
              <DetailRow icon={Clock} label="Updated" value={question.updatedAt} />
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Usage Count" value={question.usageCount.toLocaleString()} icon={BarChart3} tone="info" sublabel="times attempted" />
            <StatCard label="Student Accuracy" value={`${question.studentAccuracy}%`} icon={TrendingUp} tone="success" sublabel="correct responses" />
            <StatCard label="Avg Response" value={`${question.avgResponseSec}s`} icon={Clock} tone="warning" sublabel="per attempt" />
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <StatusBadge tone={questionStatusTone(question.status)} dot>{question.status}</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Validation</span>
                <StatusBadge
                  tone={question.validationStatus === 'Passed' ? 'success' : question.validationStatus === 'Issues' ? 'warning' : 'neutral'}
                  dot
                >
                  {question.validationStatus}
                </StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="text-sm font-medium text-foreground">{question.source}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validation Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="font-display text-3xl font-bold text-foreground">{question.validationScore}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <Progress value={question.validationScore} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to={`/content/studio?edit=${question.id}`}><PencilLine className="mr-1.5 h-4 w-4" /> Edit</Link>
              </Button>
              <GatedButton permission="questions.review" variant="default" size="sm" className="w-full justify-start" onClick={handleApprove}>
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
              </GatedButton>
              <GatedButton permission="questions.review" variant="outline" size="sm" className="w-full justify-start" onClick={handleReject}>
                <XCircle className="mr-1.5 h-4 w-4" /> Reject
              </GatedButton>
              <GatedButton permission="questions.archive" variant="outline" size="sm" className="w-full justify-start" onClick={handleArchive}>
                <Archive className="mr-1.5 h-4 w-4" /> Archive
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

function DetailRow({ icon: Icon, label, value, badge }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      {badge ?? <span className="text-sm font-medium text-foreground">{value}</span>}
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
