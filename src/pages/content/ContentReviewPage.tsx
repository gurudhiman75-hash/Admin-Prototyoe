import { useMemo, useState } from 'react';
import {
  ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, MessageSquare,
  Clock, User,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, questionStatusTone } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { showToast } from '@/components/shared/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { FILTER_SUBJECTS, FILTER_LANGUAGE, FILTER_STATUS, type Question } from '@/data/questions';
import { REVIEWERS } from '@/data/exams';
import { useQuestions } from '@/app/store/selectors';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { GatedButton } from '@/components/shared/GatedAction';

const FILTER_REVIEWERS = REVIEWERS.map((r) => ({ label: r, value: r }));
const FILTER_PRIORITY = [
  { label: 'High', value: 'High' }, { label: 'Medium', value: 'Medium' }, { label: 'Low', value: 'Low' },
];

const MOCK_COMMENTS = [
  { id: 'c1', author: 'Simran Singh', time: '2h ago', text: 'The explanation needs more detail on the transitivity step.' },
  { id: 'c2', author: 'Neha Verma', time: '5h ago', text: 'Option C could be a stronger distractor.' },
];

const TIMELINE = [
  { label: 'Question submitted', detail: 'by author', time: '3 days ago', icon: User },
  { label: 'Automated validation', detail: 'Score: 62/100 — 2 issues', time: '3 days ago', icon: AlertTriangle },
  { label: 'Reviewer assigned', detail: 'Simran Singh', time: '2 days ago', icon: User },
  { label: 'Review started', detail: 'In progress', time: '1 day ago', icon: ClipboardCheck },
  { label: 'Sent for correction', detail: 'Explanation quality', time: '4h ago', icon: AlertTriangle },
];

interface ReviewComment {
  id: string;
  author: string;
  time: string;
  text: string;
}

function derivePriority(q: Question): 'High' | 'Medium' | 'Low' {
  if (q.validationScore < 50) return 'High';
  if (q.validationScore < 70) return 'Medium';
  return 'Low';
}

function ageLabel(created: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(created).getTime()) / 86400000));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ContentReviewPage() {
  const allQuestions = useQuestions();
  const { dispatch, activeAdminName, audit } = usePrototypeStore();

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [reviewQ, setReviewQ] = useState<Question | null>(null);
  const [detailTab, setDetailTab] = useState('original');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<ReviewComment[]>(MOCK_COMMENTS);

  const filterDefs: FilterDef[] = [
    { key: 'subject', label: 'Subject', options: FILTER_SUBJECTS },
    { key: 'reviewer', label: 'Reviewer', options: FILTER_REVIEWERS },
    { key: 'language', label: 'Language', options: FILTER_LANGUAGE },
    { key: 'status', label: 'Status', options: FILTER_STATUS.filter((s) => s.value === 'Under Review' || s.value === 'Needs Fix') },
    { key: 'priority', label: 'Priority', options: FILTER_PRIORITY },
  ];

  const queue = useMemo(() => {
    let list = allQuestions.filter((q) => q.status === 'Under Review' || q.status === 'Needs Fix');
    if (filters.subject && filters.subject !== 'all') list = list.filter((q) => q.subject === filters.subject);
    if (filters.reviewer && filters.reviewer !== 'all') list = list.filter((q) => q.reviewer === filters.reviewer);
    if (filters.language && filters.language !== 'all') list = list.filter((q) => q.language.includes(filters.language));
    if (filters.status && filters.status !== 'all') list = list.filter((q) => q.status === filters.status);
    if (filters.priority && filters.priority !== 'all') list = list.filter((q) => derivePriority(q) === filters.priority);
    return list;
  }, [allQuestions, filters]);

  const openReview = (q: Question) => { setReviewQ(q); setDetailTab('original'); setComments(MOCK_COMMENTS); };

  const nextInQueue = (id: string): Question | null => {
    const idx = queue.findIndex((q) => q.id === id);
    if (idx >= 0 && idx < queue.length - 1) return queue[idx + 1];
    return null;
  };

  const approve = () => {
    if (!reviewQ) return;
    const next = nextInQueue(reviewQ.id);
    const updatedQuestion: Question = {
      ...reviewQ,
      status: 'Approved',
      reviewer: activeAdminName,
      validationStatus: 'Passed',
      updatedAt: today(),
    };
    audit('APPROVED', 'question', updatedQuestion.id, updatedQuestion.id, reviewQ.status, updatedQuestion.status, 'Question approved via Content Review');
    dispatch({ type: 'UPDATE_QUESTION', question: updatedQuestion });
    showToast.success('Question approved', `${updatedQuestion.id} approved. Moving to next.`);
    setReviewQ(next);
  };

  const reject = () => {
    if (!reviewQ) return;
    const next = nextInQueue(reviewQ.id);
    const updatedQuestion: Question = {
      ...reviewQ,
      status: 'Rejected',
      updatedAt: today(),
    };
    audit('REJECTED', 'question', updatedQuestion.id, updatedQuestion.id, reviewQ.status, updatedQuestion.status, 'Question rejected via Content Review');
    dispatch({ type: 'UPDATE_QUESTION', question: updatedQuestion });
    showToast.error('Question rejected', `${updatedQuestion.id} rejected. Moving to next.`);
    setReviewQ(next);
  };

  const sendCorrection = () => {
    if (!reviewQ) return;
    const next = nextInQueue(reviewQ.id);
    const updatedQuestion: Question = {
      ...reviewQ,
      status: 'Needs Fix',
      updatedAt: today(),
    };
    audit('SENT_FOR_CORRECTION', 'question', updatedQuestion.id, updatedQuestion.id, reviewQ.status, updatedQuestion.status, 'Question sent for correction via Content Review');
    dispatch({ type: 'UPDATE_QUESTION', question: updatedQuestion });
    showToast.warning('Sent for correction', `${updatedQuestion.id} sent back to author.`);
    setReviewQ(next);
  };

  const addComment = () => {
    if (newComment.trim()) {
      setComments((prev) => [...prev, { id: `c${prev.length + 1}`, author: activeAdminName, time: 'just now', text: newComment.trim() }]);
      showToast.success('Comment added', 'Your comment has been posted.');
      setNewComment('');
    }
  };

  const columns: Column<Question>[] = [
    {
      key: 'question', header: 'Question', sortValue: (q) => q.stem,
      cell: (q) => (
        <div className="max-w-xs">
          <p className="truncate text-sm font-medium text-foreground">{q.stem}</p>
          <Badge variant="outline" className="mt-1 text-[10px] font-normal text-muted-foreground">{q.id}</Badge>
        </div>
      ),
    },
    { key: 'reviewer', header: 'Reviewer', hideOnMobile: true, cell: (q) => <span className="text-sm text-muted-foreground">{q.reviewer ?? 'Unassigned'}</span> },
    { key: 'subject', header: 'Subject', sortValue: (q) => q.subject, hideOnMobile: true, cell: (q) => <span className="text-sm text-muted-foreground">{q.subject}</span> },
    {
      key: 'lang', header: 'Language', hideOnMobile: true, cell: (q) => (
        <div className="flex flex-wrap gap-1">
          {q.language.map((l) => <Badge key={l} variant="outline" className="text-[10px] font-normal">{l}</Badge>)}
        </div>
      ),
    },
    { key: 'age', header: 'Age', sortValue: (q) => q.createdAt, cell: (q) => <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" />{ageLabel(q.createdAt)}</span> },
    {
      key: 'priority', header: 'Priority', cell: (q) => {
        const p = derivePriority(q);
        return <StatusBadge tone={p === 'High' ? 'destructive' : p === 'Medium' ? 'warning' : 'neutral'} className="text-[10px]">{p}</StatusBadge>;
      },
    },
    {
      key: 'status', header: 'Status', cell: (q) => <StatusBadge tone={questionStatusTone(q.status)} dot className="text-[10px]">{q.status}</StatusBadge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Content Review"
        description="Review queue for pending questions and content batches."
        icon={<ClipboardCheck className="h-5 w-5" />}
      />

      <FilterBar
        filters={filterDefs}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClear={() => setFilters({})}
        className="mb-4"
      />

      {queue.length === 0 ? (
        <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} title="Review queue is empty" description="No questions pending review. Great work!" />
      ) : (
        <DataTable
          data={queue}
          columns={columns}
          getRowId={(q) => q.id}
          searchKeys={(q) => `${q.id} ${q.stem} ${q.subject}`}
          selectable={false}
          rowAction={openReview}
          emptyTitle="No questions in queue"
          emptyDescription="Try adjusting your filters."
        />
      )}

      <Sheet open={!!reviewQ} onOpenChange={(o) => !o && setReviewQ(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {reviewQ && (
            <>
              <SheetHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <SheetTitle className="text-base">{reviewQ.id}</SheetTitle>
                  <StatusBadge tone={questionStatusTone(reviewQ.status)} dot className="text-[10px]">{reviewQ.status}</StatusBadge>
                  <StatusBadge tone={derivePriority(reviewQ) === 'High' ? 'destructive' : derivePriority(reviewQ) === 'Medium' ? 'warning' : 'neutral'} className="text-[10px]">{derivePriority(reviewQ)} priority</StatusBadge>
                </div>
                <SheetDescription className="sr-only">Review question</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <p className="text-sm leading-relaxed text-foreground">{reviewQ.stem}</p>

                <Card>
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm">Question Detail</CardTitle>
                    <Tabs value={detailTab} onValueChange={setDetailTab}>
                      <TabsList className="h-8">
                        <TabsTrigger value="original" className="text-xs">Original</TabsTrigger>
                        <TabsTrigger value="edited" className="text-xs">Edited</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardHeader>
                  <CardContent>
                    <TabsContent value="original" className="mt-0 space-y-2">
                      {reviewQ.options.map((o) => {
                        const correct = o.id === reviewQ.correctOption;
                        return (
                          <div key={o.id} className={cn('flex items-center gap-2 rounded-lg border p-2.5 text-sm', correct ? 'border-success/40 bg-success/10' : 'bg-card')}>
                            <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold', correct ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground')}>{o.id}</span>
                            <span className={cn(correct && 'font-medium text-foreground')}>{o.text}</span>
                            {correct && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
                          </div>
                        );
                      })}
                    </TabsContent>
                    <TabsContent value="edited" className="mt-0 space-y-3">
                      <div className="space-y-2">
                        {reviewQ.options.map((o, i) => {
                          const correct = o.id === reviewQ.correctOption;
                          const revised = i === 1 ? o.text + ' (revised wording)' : o.text;
                          return (
                            <div key={o.id} className={cn('flex items-center gap-2 rounded-lg border p-2.5 text-sm', correct ? 'border-success/40 bg-success/10' : 'bg-card')}>
                              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold', correct ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground')}>{o.id}</span>
                              <span className={cn(correct && 'font-medium text-foreground')}>{revised}</span>
                              {i === 1 && <Badge variant="outline" className="ml-auto text-[10px] text-info">edited</Badge>}
                            </div>
                          );
                        })}
                      </div>
                      <div className="rounded-lg border bg-info/5 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-info">Proposed Changes</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>Option B reworded for clarity</li>
                          <li>Explanation expanded with step-by-step working</li>
                          <li>Difficulty updated from Moderate to Hard</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Metadata</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    {[
                      { label: 'Author', value: reviewQ.author },
                      { label: 'Reviewer', value: reviewQ.reviewer ?? 'Unassigned' },
                      { label: 'Age', value: ageLabel(reviewQ.createdAt) },
                      { label: 'Difficulty', value: reviewQ.difficulty },
                      { label: 'Type', value: reviewQ.type },
                      { label: 'Source', value: reviewQ.source },
                      { label: 'Validation', value: reviewQ.validationStatus },
                      { label: 'Score', value: `${reviewQ.validationScore}/100` },
                      { label: 'Languages', value: reviewQ.language.join(', ') },
                    ].map((m) => (
                      <div key={m.label}><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</p><p className="mt-0.5 font-medium text-foreground">{m.value}</p></div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> Internal Comments</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {comments.map((c) => (
                      <div key={c.id} className="rounded-lg border bg-muted/30 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">{c.author}</span>
                          <span className="text-muted-foreground">{c.time}</span>
                        </div>
                        <p className="mt-1 text-sm text-foreground">{c.text}</p>
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Textarea rows={2} placeholder="Add a comment…" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                      <Button size="sm" onClick={addComment}><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Add Comment</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Reviewer History</CardTitle></CardHeader>
                  <CardContent>
                    <div className="relative space-y-4 pl-6">
                      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                      {TIMELINE.map((t, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-6 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-background bg-muted">
                            <div className={cn('h-1.5 w-1.5 rounded-full', i === TIMELINE.length - 1 ? 'bg-warning' : 'bg-primary')} />
                          </div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">{t.label}</p>
                              <p className="text-xs text-muted-foreground">{t.detail}</p>
                            </div>
                            <span className="shrink-0 text-xs text-muted-foreground">{t.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <SheetFooter className="mt-6 flex-row flex-wrap gap-2 sm:justify-between">
                <GatedButton permission="review.approve" variant="outline" size="sm" onClick={sendCorrection}><AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Send for Correction</GatedButton>
                <div className="flex gap-2">
                  <GatedButton permission="review.reject" variant="destructive" size="sm" onClick={reject}><XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject & Next</GatedButton>
                  <GatedButton permission="review.approve" variant="default" size="sm" onClick={approve}><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve & Next</GatedButton>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
