import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  FileText, ArrowLeft, ListChecks, Clock, Users, Activity,
  BookOpen, Type, Layers, Globe, Target, CalendarDays, User,
  PencilLine, Copy, Archive, UploadCloud, History, Award, Gauge, TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, difficultyTone } from '@/components/shared/StatusBadge';
import { StatCard } from '@/components/shared/StatCard';
import { ErrorState } from '@/components/shared/EmptyState';
import { showToast } from '@/components/shared/toast';
import { GatedButton } from '@/components/shared/GatedAction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { useTestById, useAuditLogs } from '@/app/store/selectors';
import type { AuditEntry } from '@/app/store/types';

export function TestDetailPage() {
  const { id } = useParams();
  const test = useTestById(id);
  const { dispatch, audit } = usePrototypeStore();
  const auditLogs = useAuditLogs();

  const entityAudit = useMemo(
    () => auditLogs.filter((a) => a.entityId.includes(id ?? '')),
    [auditLogs, id],
  );

  const sectionData = useMemo(() => [
    { section: 'Reasoning', questions: Math.round(test ? test.totalQuestions * 0.25 : 25), attempts: test ? Math.round(test.attempts * 0.92) : 0 },
    { section: 'Quant', questions: Math.round(test ? test.totalQuestions * 0.25 : 25), attempts: test ? Math.round(test.attempts * 0.88) : 0 },
    { section: 'English', questions: Math.round(test ? test.totalQuestions * 0.25 : 25), attempts: test ? Math.round(test.attempts * 0.95) : 0 },
    { section: 'GA', questions: Math.round(test ? test.totalQuestions * 0.25 : 25), attempts: test ? Math.round(test.attempts * 0.82) : 0 },
  ], [test]);

  const scoreDistribution = useMemo(() => [
    { range: '0-25', count: 120 },
    { range: '26-50', count: 480 },
    { range: '51-75', count: 860 },
    { range: '76-100', count: 540 },
    { range: '100+', count: 210 },
  ], []);

  const mockSections = useMemo(() => [
    { name: 'General Intelligence & Reasoning', questions: Math.round(test ? test.totalQuestions * 0.25 : 25), marks: test ? Math.round(test.totalQuestions * 0.25 * 2) : 50 },
    { name: 'General Awareness', questions: Math.round(test ? test.totalQuestions * 0.25 : 25), marks: test ? Math.round(test.totalQuestions * 0.25 * 2) : 50 },
    { name: 'Quantitative Aptitude', questions: Math.round(test ? test.totalQuestions * 0.25 : 25), marks: test ? Math.round(test.totalQuestions * 0.25 * 2) : 50 },
    { name: 'English Comprehension', questions: Math.round(test ? test.totalQuestions * 0.25 : 25), marks: test ? Math.round(test.totalQuestions * 0.25 * 2) : 50 },
  ], [test]);

  if (!test) {
    return (
      <ErrorState
        title="Test not found"
        description={`No test exists with ID "${id}". It may have been removed.`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/tests"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Tests</Link>
          </Button>
        }
      />
    );
  }

  const handleDuplicate = () => {
    showToast.success('Test duplicated', `${test.id} has been duplicated as a new draft (prototype only).`);
    audit('TEST_DUPLICATED', 'test', test.id, test.name, test.name, `${test.name} (Copy)`, 'Test duplicated by admin');
  };

  const handleArchive = () => {
    const updated = { ...test, status: 'Archived' };
    dispatch({ type: 'UPDATE_TEST', test: updated, audit: audit('TEST_ARCHIVED', 'test', test.id, test.name, test.status, 'Archived', 'Test archived by admin') });
    showToast.info('Test archived', `${test.id} has been archived.`);
  };

  const handlePublish = () => {
    const updated = { ...test, status: 'Live' };
    dispatch({ type: 'UPDATE_TEST', test: updated, audit: audit('TEST_PUBLISHED', 'test', test.id, test.name, test.status, 'Live', 'Test published by admin') });
    showToast.success('Test published', `${test.id} is now Live.`);
  };

  const avgScore = 68;
  const completionRate = 74;
  const medianTime = 52;

  return (
    <div>
      <PageHeader
        title={test.name}
        description={test.id}
        icon={<FileText className="h-5 w-5" />}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to={`/tests/test-builder?edit=${test.id}`}><PencilLine className="mr-1.5 h-4 w-4" /> Edit in Builder</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/tests"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Tests</Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <GatedButton permission="tests.edit" variant="default" size="sm" onClick={() => showToast.info('Edit mode', 'Opening test builder for editing.')}>
          <PencilLine className="mr-1.5 h-4 w-4" /> Edit
        </GatedButton>
        <GatedButton permission="tests.create" variant="outline" size="sm" onClick={handleDuplicate}>
          <Copy className="mr-1.5 h-4 w-4" /> Duplicate
        </GatedButton>
        <GatedButton permission="tests.edit" variant="outline" size="sm" onClick={handleArchive}>
          <Archive className="mr-1.5 h-4 w-4" /> Archive
        </GatedButton>
        <GatedButton permission="tests.publish" variant="default" size="sm" onClick={handlePublish}>
          <UploadCloud className="mr-1.5 h-4 w-4" /> Publish
        </GatedButton>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Questions" value={test.totalQuestions} icon={ListChecks} tone="primary" />
        <StatCard label="Duration" value={`${test.durationMin} min`} icon={Clock} tone="info" />
        <StatCard label="Attempts" value={test.attempts.toLocaleString()} icon={Users} tone="success" />
        <StatCard label="Status" value={test.status} icon={Activity} tone="warning" />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audit">Audit History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Test Metadata</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3">
                <DetailRow icon={BookOpen} label="Exam" value={test.examName} />
                <DetailRow icon={Type} label="Type" value={test.type} />
                <DetailRow icon={Layers} label="Series" value={test.series} />
                <DetailRow icon={Activity} label="Access" value={test.access} />
                <DetailRow icon={Globe} label="Language" value={test.language} />
                <DetailRow icon={Target} label="Difficulty" value={test.difficulty} badge={<StatusBadge tone={difficultyTone(test.difficulty)} dot className="text-[10px]">{test.difficulty}</StatusBadge>} />
                <DetailRow icon={CalendarDays} label="Scheduled" value={test.scheduledDate ?? 'Not scheduled'} />
                <DetailRow icon={User} label="Author" value={test.author} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Section Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockSections.map((s) => (
                  <div key={s.name} className="flex items-center justify-between rounded-lg border bg-card p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.questions} questions - {s.marks} marks</p>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge tone="info" className="text-[10px]">{s.questions} Q</StatusBadge>
                      <StatusBadge tone="primary" className="text-[10px]">{s.marks} M</StatusBadge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Attempts per Section</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={sectionData} margin={{ left: -16, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="section" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12, color: 'hsl(var(--popover-foreground))' }} cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Bar dataKey="attempts" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Attempts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={scoreDistribution} margin={{ left: -16, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="range" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12, color: 'hsl(var(--popover-foreground))' }} cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Avg Score</span>
                  </div>
                  <p className="mt-2 font-display text-3xl font-bold text-foreground">{avgScore}%</p>
                  <Progress value={avgScore} className="mt-3" />
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Completion Rate</span>
                  </div>
                  <p className="mt-2 font-display text-3xl font-bold text-foreground">{completionRate}%</p>
                  <Progress value={completionRate} className="mt-3" />
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gauge className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Median Time</span>
                  </div>
                  <p className="mt-2 font-display text-3xl font-bold text-foreground">{medianTime} min</p>
                </div>
              </CardContent>
            </Card>
          </div>
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
