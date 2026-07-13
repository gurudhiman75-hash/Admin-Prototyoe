import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, ArrowLeft, User, Mail, Phone, Calendar, Clock, Smartphone,
  MessageSquare, Activity, CreditCard, Award, Shield,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ErrorState } from '@/components/shared/EmptyState';
import { showToast } from '@/components/shared/toast';
import { GatedButton } from '@/components/shared/GatedAction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import {
  useStudentById, useEntitlementsByStudent, useOrders, useStudentNotes, usePackages,
} from '@/app/store/selectors';
import type { Entitlement } from '@/data/commerce';

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

function statusTone(status: string) {
  return status === 'Active' ? 'success' : status === 'Suspended' ? 'destructive' : 'neutral';
}

function entTone(status: string) {
  switch (status) {
    case 'Active': return 'success';
    case 'Expired': return 'neutral';
    case 'Revoked': return 'destructive';
    case 'Suspended': return 'warning';
    default: return 'neutral';
  }
}

function payTone(status: string) {
  switch (status) {
    case 'Success': return 'success';
    case 'Pending': return 'warning';
    case 'Failed': return 'destructive';
    case 'Refunded': return 'info';
    default: return 'neutral';
  }
}

interface MockAttempt {
  test: string; score: number; timeTaken: string; date: string; rank: number;
}
interface MockDevice {
  device: string; browser: string; ip: string; lastActive: string; current: boolean;
}
interface MockEvent { label: string; time: string; tone: 'info' | 'success' | 'warning' | 'primary'; }

export function StudentDetailPage() {
  const { id } = useParams();
  const student = useStudentById(id);
  const [note, setNote] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');

  const entitlements = useEntitlementsByStudent(id ?? '');
  const orders = useOrders();
  const packages = usePackages();
  const studentNotes = useStudentNotes(id ?? '');
  const { dispatch, audit, activeAdminName } = usePrototypeStore();

  const studentOrders = useMemo(
    () => orders.filter((o) => o.studentId === id),
    [orders, id],
  );

  const handleSuspend = () => {
    if (!student) return;
    const updated = { ...student, status: 'Suspended' as const };
    dispatch({ type: 'UPDATE_STUDENT', student: updated, audit: audit('SUSPENDED', 'student', student.id, student.name, student.status, 'Suspended', 'Account suspended by admin') });
    showToast.success('Student suspended', `${student.name} has been suspended.`);
  };

  const handleReactivate = () => {
    if (!student) return;
    const updated = { ...student, status: 'Active' as const };
    dispatch({ type: 'UPDATE_STUDENT', student: updated, audit: audit('REACTIVATED', 'student', student.id, student.name, student.status, 'Active', 'Account reactivated by admin') });
    showToast.success('Student reactivated', `${student.name} has been reactivated.`);
  };

  const handleGrantPackage = () => {
    if (!student || !selectedPackage) {
      showToast.warning('Select a package', 'Choose a package before granting access.');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const expiry = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
    const newEntitlement: Entitlement = {
      id: `ENT-${Date.now()}`,
      studentName: student.name,
      studentId: student.id,
      packageName: selectedPackage,
      source: 'Manual Grant',
      startDate: today,
      expiryDate: expiry,
      status: 'Active',
      grantedBy: activeAdminName,
      paymentRef: null,
    };
    dispatch({ type: 'ADD_ENTITLEMENT', entitlement: newEntitlement, audit: audit('ENTITLEMENT_GRANTED', 'entitlement', newEntitlement.id, student.name, '-', selectedPackage, 'Manual package access grant') });
    showToast.success('Access granted', `${student.name} now has access to ${selectedPackage}.`);
    setSelectedPackage('');
  };

  const handleRevoke = (ent: Entitlement) => {
    const updated = { ...ent, status: 'Revoked' as const };
    dispatch({ type: 'UPDATE_ENTITLEMENT', entitlement: updated, audit: audit('ENTITLEMENT_REVOKED', 'entitlement', ent.id, ent.studentName, ent.status, 'Revoked', 'Access revoked by admin') });
    showToast.success('Entitlement revoked', `${ent.packageName} access revoked for ${ent.studentName}.`);
  };

  const handleExtend = (ent: Entitlement) => {
    const newExpiry = new Date(new Date(ent.expiryDate).getTime() + 30 * 86400000).toISOString().slice(0, 10);
    const updated = { ...ent, expiryDate: newExpiry };
    dispatch({ type: 'UPDATE_ENTITLEMENT', entitlement: updated, audit: audit('ENTITLEMENT_EXTENDED', 'entitlement', ent.id, ent.studentName, ent.expiryDate, newExpiry, 'Validity extended by 30 days') });
    showToast.success('Validity extended', `${ent.id} extended to ${newExpiry}.`);
  };

  const handleAddNote = () => {
    if (!student) return;
    if (!note.trim()) {
      showToast.warning('Note empty', 'Enter a note before saving.');
      return;
    }
    dispatch({
      type: 'ADD_STUDENT_NOTE',
      studentId: student.id,
      note: { id: `NOTE-${Date.now()}`, author: activeAdminName, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), content: note.trim() },
    });
    showToast.success('Note added', 'Internal note saved.');
    setNote('');
  };

  const handleResetAttempt = () => {
    showToast.success('Test attempt reset', 'Simulated test attempt has been reset (prototype only).');
  };

  const performance = useMemo(() => [
    { section: 'Quant', score: student ? Math.min(100, student.avgScore + 8) : 70 },
    { section: 'Reasoning', score: student ? Math.min(100, student.avgScore + 4) : 66 },
    { section: 'English', score: student ? Math.max(20, student.avgScore - 6) : 50 },
    { section: 'GA', score: student ? Math.max(20, student.avgScore - 12) : 44 },
    { section: 'Computer', score: student ? Math.min(100, student.avgScore + 12) : 78 },
  ], [student]);

  const attempts: MockAttempt[] = useMemo(() => [
    { test: 'SSC CGL Mock 7', score: 78, timeTaken: '58 min', date: '2026-07-10', rank: 142 },
    { test: 'SSC CGL Mock 6', score: 72, timeTaken: '60 min', date: '2026-07-06', rank: 210 },
    { test: 'SSC CGL Mock 5', score: 65, timeTaken: '62 min', date: '2026-07-01', rank: 318 },
    { test: 'SSC CGL Mock 4', score: 69, timeTaken: '59 min', date: '2026-06-26', rank: 275 },
    { test: 'Quant Sectional 3', score: 84, timeTaken: '28 min', date: '2026-06-22', rank: 88 },
  ], []);

  const devices: MockDevice[] = useMemo(() => [
    { device: 'iPhone 14', browser: 'Safari', ip: '49.36.x.x', lastActive: student?.lastActive ?? '-', current: true },
    { device: 'Windows PC', browser: 'Chrome', ip: '103.21.x.x', lastActive: '2026-07-09 21:14', current: false },
    { device: 'Samsung Galaxy A52', browser: 'Chrome', ip: '157.34.x.x', lastActive: '2026-06-30 18:02', current: false },
  ], [student]);

  const events: MockEvent[] = useMemo(() => [
    { label: 'Logged in from iPhone 14', time: student?.lastActive ?? '-', tone: 'info' },
    { label: 'Completed SSC CGL Mock 7', time: '2026-07-10 14:32', tone: 'success' },
    { label: 'Purchased SSC CGL Ultimate 2025', time: '2026-06-15 19:08', tone: 'primary' },
    { label: 'Opened support ticket SR-803', time: '2026-06-12 10:15', tone: 'warning' },
    { label: 'Account registered', time: student?.registeredOn ?? '-', tone: 'info' },
  ], [student]);

  const supportTickets = useMemo(() => [
    { type: 'Wrong Answer', status: 'Resolved', date: '2026-06-12' },
    { type: 'Translation Issue', status: 'Investigating', date: '2026-05-28' },
    { type: 'Payment Issue', status: 'Resolved', date: '2026-05-10' },
  ], []);

  if (!student) {
    return (
      <ErrorState
        title="Student not found"
        description={`No student exists with ID "${id}". It may have been removed.`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/users/students"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Students</Link>
          </Button>
        }
      />
    );
  }

  const eventDot: Record<MockEvent['tone'], string> = {
    info: 'bg-info', success: 'bg-success', warning: 'bg-warning', primary: 'bg-primary',
  };

  return (
    <div>
      <PageHeader
        title={student.name}
        description="Student Profile"
        icon={
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
              {initials(student.name)}
            </AvatarFallback>
          </Avatar>
        }
        actions={
          <>
            <GatedButton
              permission="users.manage"
              variant={student.status === 'Suspended' ? 'default' : 'outline'}
              size="sm"
              onClick={student.status === 'Suspended' ? handleReactivate : handleSuspend}
            >
              <Shield className="mr-1.5 h-4 w-4" />
              {student.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
            </GatedButton>
            <Button asChild variant="outline" size="sm">
              <Link to="/users/students"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Students</Link>
            </Button>
          </>
        }
      />

      <Tabs defaultValue="profile" className="w-full">
        <ScrollableTabs />
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow icon={User} label="Name" value={student.name} />
              <DetailRow icon={Mail} label="Email" value={student.email} />
              <DetailRow icon={Phone} label="Phone" value={student.phone} />
              <DetailRow icon={Users} label="Target Exam" value={student.targetExam} />
              <DetailRow icon={MessageSquare} label="Language" value={student.language} />
              <DetailRow icon={Calendar} label="Registered On" value={student.registeredOn} />
              <DetailRow icon={Clock} label="Last Active" value={student.lastActive} />
              <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-muted-foreground">Account Status</span>
                </div>
                <StatusBadge tone={statusTone(student.status)} dot>{student.status}</StatusBadge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entitlements" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Entitlements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 p-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Grant Package Access</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                  >
                    <option value="">Select a package...</option>
                    {packages.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <GatedButton permission="entitlements.manage" size="sm" onClick={handleGrantPackage}>
                  Grant Access
                </GatedButton>
              </div>

              {entitlements.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No entitlements found for this student.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entitlements.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium text-foreground">{e.packageName}</TableCell>
                        <TableCell className="text-sm">{e.source}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{e.expiryDate}</TableCell>
                        <TableCell><StatusBadge tone={entTone(e.status)} dot className="text-[10px]">{e.status}</StatusBadge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <GatedButton permission="entitlements.manage" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleExtend(e)}>
                              Extend
                            </GatedButton>
                            {e.status !== 'Revoked' && (
                              <GatedButton permission="entitlements.manage" variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleRevoke(e)}>
                                Revoke
                              </GatedButton>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {studentOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No orders found for this student.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs font-medium text-foreground">{o.id}</TableCell>
                        <TableCell className="text-sm">{o.product}</TableCell>
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

        <TabsContent value="attempts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Test Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Time Taken</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-foreground">{a.test}</TableCell>
                      <TableCell className={cn('text-right font-semibold', a.score >= 80 ? 'text-success' : a.score >= 60 ? 'text-warning' : 'text-destructive')}>{a.score}%</TableCell>
                      <TableCell className="text-sm">{a.timeTaken}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.date}</TableCell>
                      <TableCell className="text-right text-sm font-medium">#{a.rank.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={handleResetAttempt}>
                  Reset Simulated Attempt
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Section-wise Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={performance} margin={{ left: -16, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="section" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12, color: 'hsl(var(--popover-foreground))' }} cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Bar dataKey="score" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Avg Score</span>
                  </div>
                  <p className="mt-2 font-display text-3xl font-bold text-foreground">{student.avgScore}%</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Rank Percentile</span>
                  </div>
                  <p className="mt-2 font-display text-3xl font-bold text-foreground">Top {Math.max(5, 100 - student.avgScore)}%</p>
                  <Progress value={student.avgScore} className="mt-3" />
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Tests Attempted</span>
                  </div>
                  <p className="mt-2 font-display text-3xl font-bold text-foreground">{student.testsAttempted.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Support History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {supportTickets.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.type}</p>
                      <p className="text-xs text-muted-foreground">{t.date}</p>
                    </div>
                  </div>
                  <StatusBadge tone={t.status === 'Resolved' ? 'success' : 'warning'} dot className="text-[10px]">{t.status}</StatusBadge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Device Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {devices.map((d, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.device} <span className="text-muted-foreground">- {d.browser}</span></p>
                      <p className="text-xs text-muted-foreground">IP {d.ip} - {d.lastActive}</p>
                    </div>
                  </div>
                  {d.current ? (
                    <StatusBadge tone="success" dot className="text-[10px]">Current Session</StatusBadge>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => showToast.info('Session revoked', `${d.device} session terminated.`)}>Revoke</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add an internal note visible to admins only..."
                />
                <Button size="sm" onClick={handleAddNote}>
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Add Note
                </Button>
              </div>
              <div className="space-y-3">
                {studentNotes.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No notes recorded for this student.</p>
                ) : (
                  studentNotes.map((n) => (
                    <div key={n.id} className="rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{n.author}</span>
                        <span className="text-xs text-muted-foreground">{n.timestamp}</span>
                      </div>
                      <p className="mt-1.5 text-sm text-foreground">{n.content}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 border-l pl-6">
                {events.map((e, i) => (
                  <li key={i} className="relative">
                    <span className={cn('absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-background', eventDot[e.tone])} />
                    <p className="text-sm font-medium text-foreground">{e.label}</p>
                    <p className="text-xs text-muted-foreground">{e.time}</p>
                  </li>
                ))}
              </ol>
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

function ScrollableTabs() {
  return (
    <div className="overflow-x-auto">
      <TabsList className="h-auto w-max flex-nowrap">
        <TabsTrigger value="profile" className="gap-1.5"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
        <TabsTrigger value="entitlements" className="gap-1.5"><Award className="h-3.5 w-3.5" /> Entitlements</TabsTrigger>
        <TabsTrigger value="payments" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Payments</TabsTrigger>
        <TabsTrigger value="attempts" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Test Attempts</TabsTrigger>
        <TabsTrigger value="performance" className="gap-1.5"><Award className="h-3.5 w-3.5" /> Performance</TabsTrigger>
        <TabsTrigger value="support" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Support History</TabsTrigger>
        <TabsTrigger value="devices" className="gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Device Sessions</TabsTrigger>
        <TabsTrigger value="notes" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Internal Notes</TabsTrigger>
        <TabsTrigger value="timeline" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Activity Timeline</TabsTrigger>
      </TabsList>
    </div>
  );
}
