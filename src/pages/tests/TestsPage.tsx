import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Pencil, Copy, Eye, CalendarClock, Rocket, BarChart3, Archive, MoreHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, testStatusTone, difficultyTone } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { showToast } from '@/components/shared/toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Test } from '@/data/tests';
import { EXAMS, TEST_STATUSES, TEST_TYPES, DIFFICULTIES, LANGUAGES } from '@/data/exams';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { useTests } from '@/app/store/selectors';

const FILTER_EXAM = EXAMS.map((e) => ({ label: e.name, value: e.code }));
const FILTER_TYPE = TEST_TYPES.map((t) => ({ label: t, value: t }));
const FILTER_STATUS = TEST_STATUSES.map((s) => ({ label: s, value: s }));
const FILTER_DIFFICULTY = DIFFICULTIES.map((d) => ({ label: d, value: d }));
const FILTER_LANGUAGE = LANGUAGES.map((l) => ({ label: l, value: l }));

const FILTERS: FilterDef[] = [
  { key: 'exam', label: 'Exam', options: FILTER_EXAM },
  { key: 'type', label: 'Type', options: FILTER_TYPE },
  { key: 'status', label: 'Status', options: FILTER_STATUS },
  { key: 'difficulty', label: 'Difficulty', options: FILTER_DIFFICULTY },
  { key: 'language', label: 'Language', options: FILTER_LANGUAGE },
];

export function TestsPage() {
  const navigate = useNavigate();
  const tests = useTests();
  const { dispatch, audit, activeAdminName } = usePrototypeStore();
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const handleClear = () => setFilters({});

  const filtered = useMemo(
    () =>
      tests.filter((t) =>
        Object.entries(filters).every(([k, v]) => !v || v === 'all' || (t as never)[k] === v),
      ),
    [tests, filters],
  );

  const counts = useMemo(
    () =>
      TEST_STATUSES.map((status) => ({
        status,
        count: tests.filter((t) => t.status === status).length,
      })),
    [tests],
  );

  const handleDuplicate = (t: Test) => {
    const newId = `T-${Date.now()}`;
    const copy: Test = { ...t, id: newId, name: `${t.name} (Copy)`, status: 'Draft', attempts: 0, scheduledDate: null, author: activeAdminName };
    dispatch({ type: 'ADD_TEST', test: copy, audit: audit('DUPLICATED', 'test', newId, copy.name, t.id, newId, `Duplicated from ${t.id}`) });
    showToast.success('Test duplicated', `${copy.name} was created as a draft.`);
  };

  const handleArchive = (t: Test) => {
    const updated: Test = { ...t, status: 'Archived', scheduledDate: null };
    dispatch({ type: 'UPDATE_TEST', test: updated, audit: audit('ARCHIVED', 'test', t.id, t.name, t.status, 'Archived', `Archived test ${t.id}`) });
    showToast.success('Test archived', `${t.name} is now archived.`);
  };

  const handleSchedule = (t: Test) => {
    const dateStr = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const updated: Test = { ...t, status: 'Scheduled', scheduledDate: dateStr };
    dispatch({ type: 'UPDATE_TEST', test: updated, audit: audit('SCHEDULED', 'test', t.id, t.name, t.status, 'Scheduled', `Scheduled test ${t.id} for ${dateStr}`) });
    showToast.success('Test scheduled', `${t.name} is scheduled for ${dateStr}.`);
  };

  const handlePublish = (t: Test) => {
    const allowed = t.status === 'Draft' || t.status === 'Content Ready' || t.status === 'Under QA' || t.status === 'Scheduled';
    if (!allowed) {
      showToast.warning('Cannot publish', `${t.name} is currently ${t.status}.`);
      return;
    }
    const updated: Test = { ...t, status: 'Live', scheduledDate: null };
    dispatch({ type: 'UPDATE_TEST', test: updated, audit: audit('PUBLISHED', 'test', t.id, t.name, t.status, 'Live', `Published test ${t.id}`) });
    showToast.success('Test published', `${t.name} is now live.`);
  };

  const columns: Column<Test>[] = [
    {
      key: 'name', header: 'Test Name',
      cell: (t) => (
        <div className="min-w-[220px]">
          <p className="font-medium text-foreground">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.id}</p>
        </div>
      ),
      sortValue: (t) => t.name,
    },
    { key: 'exam', header: 'Exam', cell: (t) => <span className="text-sm">{t.examName}</span>, sortValue: (t) => t.examName, hideOnMobile: true },
    {
      key: 'type', header: 'Type', hideOnMobile: true,
      cell: (t) => <StatusBadge tone="info">{t.type}</StatusBadge>,
    },
    { key: 'series', header: 'Series', cell: (t) => <span className="text-sm text-muted-foreground">{t.series}</span>, hideOnMobile: true },
    {
      key: 'access', header: 'Access', hideOnMobile: true,
      cell: (t) => <StatusBadge tone={t.access === 'Free' ? 'success' : 'primary'}>{t.access}</StatusBadge>,
    },
    { key: 'totalQuestions', header: 'Q', cell: (t) => <span className="text-sm font-medium">{t.totalQuestions}</span>, sortValue: (t) => t.totalQuestions },
    { key: 'durationMin', header: 'Min', cell: (t) => <span className="text-sm">{t.durationMin}</span>, sortValue: (t) => t.durationMin, hideOnMobile: true },
    {
      key: 'difficulty', header: 'Level', hideOnMobile: true,
      cell: (t) => <StatusBadge tone={difficultyTone(t.difficulty)}>{t.difficulty}</StatusBadge>,
    },
    {
      key: 'status', header: 'Status',
      cell: (t) => <StatusBadge tone={testStatusTone(t.status)} dot>{t.status}</StatusBadge>,
      sortValue: (t) => t.status,
    },
    {
      key: 'scheduledDate', header: 'Scheduled', hideOnMobile: true,
      cell: (t) => <span className="text-sm text-muted-foreground">{t.scheduledDate ?? '—'}</span>,
      sortValue: (t) => t.scheduledDate ?? '',
    },
    {
      key: 'attempts', header: 'Attempts', className: 'text-right',
      cell: (t) => <span className="text-sm font-medium">{t.attempts.toLocaleString()}</span>,
      sortValue: (t) => t.attempts,
    },
    {
      key: 'actions', header: '', className: 'w-10 text-right',
      cell: (t) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate(`/tests/test-builder?edit=${t.id}`)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(t)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/tests/${t.id}`)}><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSchedule(t)}><CalendarClock className="mr-2 h-4 w-4" /> Schedule</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePublish(t)}><Rocket className="mr-2 h-4 w-4" /> Publish</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { showToast.info('Opening analytics', t.name); navigate('/analytics/tests'); }}>
                <BarChart3 className="mr-2 h-4 w-4" /> View Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleArchive(t)}>
                <Archive className="mr-2 h-4 w-4" /> Archive
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
        title="Tests"
        description="Manage all mock tests, sectional tests, and quizzes across exams."
        icon={<FileText className="h-5 w-5" />}
        actions={<Button size="sm" onClick={() => navigate('/tests/test-builder')}><Plus className="mr-1.5 h-4 w-4" /> Build Test</Button>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {counts.map(({ status, count }) => (
          <Card key={status} className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{status}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-foreground">{count}</span>
              <StatusBadge tone={testStatusTone(status)} dot className="ml-auto">{status}</StatusBadge>
            </div>
          </Card>
        ))}
      </div>

      <FilterBar filters={FILTERS} values={filters} onChange={handleFilterChange} onClear={handleClear} className="mb-4" />

      <Card className="p-4">
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={(t) => t.id}
          searchable
          searchKeys={(t) => `${t.name} ${t.id} ${t.examName} ${t.series}`}
          selectable={false}
          rowAction={(t) => navigate(`/tests/${t.id}`)}
          initialSort={{ key: 'name', dir: 'asc' }}
        />
      </Card>
    </div>
  );
}
