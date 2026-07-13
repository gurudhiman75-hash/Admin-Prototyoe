import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Download, UserCheck, UserX, Award } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { showToast } from '@/components/shared/toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { type Student } from '@/data/users';
import { EXAMS } from '@/data/exams';
import { useStudents } from '@/app/store/selectors';

const LANG_BADGE: Record<string, string> = {
  English: 'bg-primary/10 text-primary',
  Hindi: 'bg-info/10 text-info',
  Punjabi: 'bg-brand-accent/10 text-brand-accent',
};

function statusTone(status: Student['status']) {
  return status === 'Active' ? 'success' : status === 'Suspended' ? 'destructive' : 'neutral';
}

function scoreTone(score: number) {
  return score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-destructive';
}

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export function StudentsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const students = useStudents();

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === 'Active').length;
    const suspended = students.filter((s) => s.status === 'Suspended').length;
    const avg =
      students.reduce((sum, s) => sum + s.avgScore, 0) / Math.max(total, 1);
    return { total, active, suspended, avg: Math.round(avg) };
  }, [students]);

  const filterDefs: FilterDef[] = [
    {
      key: 'targetExam',
      label: 'Exam',
      options: EXAMS.map((e) => ({ label: e.name, value: e.name })),
    },
    {
      key: 'language',
      label: 'Language',
      options: [
        { label: 'English', value: 'English' },
        { label: 'Hindi', value: 'Hindi' },
        { label: 'Punjabi', value: 'Punjabi' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Suspended', value: 'Suspended' },
      ],
    },
  ];

  const filtered = useMemo(() => {
    let list = students;
    if (filters.targetExam && filters.targetExam !== 'all')
      list = list.filter((s) => s.targetExam === filters.targetExam);
    if (filters.language && filters.language !== 'all')
      list = list.filter((s) => s.language === filters.language);
    if (filters.status && filters.status !== 'all')
      list = list.filter((s) => s.status === filters.status);
    return list;
  }, [filters, students]);

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Name',
      sortValue: (s) => s.name,
      cell: (s) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
              {initials(s.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Phone / Email',
      hideOnMobile: true,
      cell: (s) => (
        <div className="min-w-[180px]">
          <p className="text-sm text-foreground">{s.phone}</p>
          <p className="truncate text-xs text-muted-foreground">{s.email}</p>
        </div>
      ),
    },
    {
      key: 'targetExam',
      header: 'Target Exam',
      sortValue: (s) => s.targetExam,
      hideOnMobile: true,
      cell: (s) => <span className="text-sm text-foreground">{s.targetExam}</span>,
    },
    {
      key: 'language',
      header: 'Language',
      cell: (s) => (
        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', LANG_BADGE[s.language] ?? 'bg-muted text-muted-foreground')}>
          {s.language}
        </span>
      ),
      sortValue: (s) => s.language,
    },
    {
      key: 'registeredOn',
      header: 'Registered',
      hideOnMobile: true,
      cell: (s) => <span className="text-xs text-muted-foreground">{s.registeredOn}</span>,
      sortValue: (s) => s.registeredOn,
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      hideOnMobile: true,
      cell: (s) => <span className="text-xs text-muted-foreground">{s.lastActive}</span>,
      sortValue: (s) => s.lastActive,
    },
    {
      key: 'activePackages',
      header: 'Packages',
      className: 'text-right',
      cell: (s) => <span className="text-sm font-medium text-foreground">{s.activePackages}</span>,
      sortValue: (s) => s.activePackages,
    },
    {
      key: 'testsAttempted',
      header: 'Tests',
      className: 'text-right',
      hideOnMobile: true,
      cell: (s) => <span className="text-sm font-medium text-foreground">{s.testsAttempted.toLocaleString()}</span>,
      sortValue: (s) => s.testsAttempted,
    },
    {
      key: 'avgScore',
      header: 'Avg Score',
      className: 'text-right',
      cell: (s) => (
        <span className={cn('text-sm font-semibold', scoreTone(s.avgScore))}>{s.avgScore}%</span>
      ),
      sortValue: (s) => s.avgScore,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (s) => (
        <StatusBadge tone={statusTone(s.status)} dot>{s.status}</StatusBadge>
      ),
      sortValue: (s) => s.status,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student accounts and profiles."
        icon={<Users className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => showToast.success('Export started', 'Students CSV will download shortly.')}>
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Students" value={stats.total.toLocaleString()} icon={Users} sublabel="all time" tone="primary" />
        <StatCard label="Active" value={stats.active.toLocaleString()} icon={UserCheck} sublabel="active accounts" tone="success" />
        <StatCard label="Suspended" value={stats.suspended.toLocaleString()} icon={UserX} sublabel="needs review" tone="destructive" />
        <StatCard label="Avg Score" value={`${stats.avg}%`} icon={Award} sublabel="across all students" tone="accent" />
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
          getRowId={(s) => s.id}
          searchKeys={(s) => `${s.id} ${s.name} ${s.email} ${s.phone} ${s.targetExam}`}
          selectable
          rowAction={(s) => navigate(`/users/students/${s.id}`)}
          initialSort={{ key: 'name', dir: 'asc' }}
          emptyTitle="No students found"
          emptyDescription="Try adjusting your filters or search terms."
        />
      </Card>
    </div>
  );
}
