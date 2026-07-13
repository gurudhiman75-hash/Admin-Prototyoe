import { useMemo, useState } from 'react';
import { Layers, Plus, Eye, Pencil, Archive, FileText, Link2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge, questionStatusTone, difficultyTone } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { showToast } from '@/components/shared/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { DI_SETS, type DiSet } from '@/data/auxiliary';
import { DIFFICULTIES, LANGUAGES } from '@/data/exams';

const FILTER_TYPE = [
  { label: 'Data Interpretation', value: 'Data Interpretation' },
  { label: 'Reading Comprehension', value: 'Reading Comprehension' },
  { label: 'Cloze Test', value: 'Cloze Test' },
  { label: 'Caselet', value: 'Caselet' },
];
const FILTER_DIFFICULTY = DIFFICULTIES.map((d) => ({ label: d, value: d }));
const FILTER_LANGUAGE = LANGUAGES.map((l) => ({ label: l, value: l }));
const FILTER_STATUS = [
  { label: 'Approved', value: 'Approved' },
  { label: 'Under Review', value: 'Under Review' },
  { label: 'Needs Fix', value: 'Needs Fix' },
  { label: 'Draft', value: 'Draft' },
];

const TYPE_TONE: Record<DiSet['type'], 'primary' | 'info' | 'success' | 'accent'> = {
  'Data Interpretation': 'primary',
  'Reading Comprehension': 'info',
  'Cloze Test': 'success',
  'Caselet': 'accent',
};

const MOCK_LINKED = [
  { id: 'Q-01', stem: 'What is the percentage growth in sales for Brand A between 2020 and 2024?', options: ['12%', '18%', '25%', '30%'], correct: 2 },
  { id: 'Q-02', stem: 'Which brand showed the highest total sales across the period?', options: ['Brand A', 'Brand B', 'Brand C', 'Brand D'], correct: 1 },
  { id: 'Q-03', stem: 'The ratio of sales of Brand B to Brand E in 2022 is closest to:', options: ['1:1', '2:1', '3:2', '5:3'], correct: 3 },
];

export function DiPassageSetsPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [previewSet, setPreviewSet] = useState<DiSet | null>(null);

  const filterDefs: FilterDef[] = [
    { key: 'type', label: 'Type', options: FILTER_TYPE },
    { key: 'language', label: 'Language', options: FILTER_LANGUAGE },
    { key: 'difficulty', label: 'Difficulty', options: FILTER_DIFFICULTY },
    { key: 'status', label: 'Status', options: FILTER_STATUS },
  ];

  const filtered = useMemo(() => {
    let list = DI_SETS;
    if (filters.type && filters.type !== 'all') list = list.filter((s) => s.type === filters.type);
    if (filters.language && filters.language !== 'all') list = list.filter((s) => s.language === filters.language);
    if (filters.difficulty && filters.difficulty !== 'all') list = list.filter((s) => s.difficulty === filters.difficulty);
    if (filters.status && filters.status !== 'all') list = list.filter((s) => s.status === filters.status);
    return list;
  }, [filters]);

  const columns: Column<DiSet>[] = [
    {
      key: 'title', header: 'Title', sortValue: (s) => s.title,
      cell: (s) => (
        <div className="max-w-xs">
          <p className="truncate text-sm font-medium text-foreground">{s.title}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">{s.id}</Badge>
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground"><Link2 className="h-3 w-3" /> {s.linkedQuestions} questions</span>
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', cell: (s) => <StatusBadge tone={TYPE_TONE[s.type]} className="text-[10px]">{s.type}</StatusBadge> },
    { key: 'exam', header: 'Exam', sortValue: (s) => s.exam, hideOnMobile: true, cell: (s) => <span className="text-sm text-muted-foreground">{s.exam}</span> },
    { key: 'linked', header: 'Linked', sortValue: (s) => s.linkedQuestions, cell: (s) => <span className="text-sm font-medium">{s.linkedQuestions}</span> },
    { key: 'language', header: 'Language', hideOnMobile: true, cell: (s) => <Badge variant="outline" className="text-[10px] font-normal">{s.language}</Badge> },
    { key: 'difficulty', header: 'Difficulty', hideOnMobile: true, cell: (s) => <StatusBadge tone={difficultyTone(s.difficulty)} className="text-[10px]">{s.difficulty}</StatusBadge> },
    { key: 'status', header: 'Status', cell: (s) => <StatusBadge tone={questionStatusTone(s.status)} dot className="text-[10px]">{s.status}</StatusBadge> },
  ];

  return (
    <div>
      <PageHeader
        title="DI & Passage Sets"
        description="Manage grouped questions — data interpretation sets, reading comprehension passages, cloze tests, and caselets."
        icon={<Layers className="h-5 w-5" />}
        actions={<Button size="sm" onClick={() => showToast.info('New Set', 'Set creator will open here.')}><Plus className="mr-1.5 h-4 w-4" /> New Set</Button>}
      />

      <FilterBar
        filters={filterDefs}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClear={() => setFilters({})}
        className="mb-4"
      />

      {filtered.length === 0 ? (
        <EmptyState icon={<Layers className="h-7 w-7" />} title="No sets found" description="Try adjusting your filters." />
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={(s) => s.id}
          searchKeys={(s) => `${s.id} ${s.title} ${s.exam} ${s.type}`}
          selectable={false}
          rowAction={setPreviewSet}
          emptyTitle="No sets found"
          emptyDescription="Try adjusting your filters."
        />
      )}

      <Sheet open={!!previewSet} onOpenChange={(o) => !o && setPreviewSet(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {previewSet && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base">{previewSet.id}</SheetTitle>
                  <StatusBadge tone={TYPE_TONE[previewSet.type]} className="text-[10px]">{previewSet.type}</StatusBadge>
                </div>
                <SheetDescription className="sr-only">Set preview</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <p className="text-sm font-medium leading-relaxed text-foreground">{previewSet.title}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border p-3"><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Exam</p><p className="mt-1 font-medium text-foreground">{previewSet.exam}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Language</p><p className="mt-1 font-medium text-foreground">{previewSet.language}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Difficulty</p><p className="mt-1"><StatusBadge tone={difficultyTone(previewSet.difficulty)} className="text-[10px]">{previewSet.difficulty}</StatusBadge></p></div>
                  <div className="rounded-lg border p-3"><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</p><p className="mt-1"><StatusBadge tone={questionStatusTone(previewSet.status)} dot className="text-[10px]">{previewSet.status}</StatusBadge></p></div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><FileText className="h-3.5 w-3.5" /> Passage Excerpt</div>
                  <p className="text-sm leading-relaxed text-foreground">{previewSet.passageExcerpt}</p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Linked Questions ({previewSet.linkedQuestions})</p>
                  <div className="space-y-3">
                    {MOCK_LINKED.slice(0, Math.min(3, previewSet.linkedQuestions)).map((q) => (
                      <div key={q.id} className="rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">{q.id}</Badge>
                          <p className="text-sm font-medium text-foreground">{q.stem}</p>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          {q.options.map((opt, i) => {
                            const correct = i === q.correct;
                            return (
                              <div key={i} className={cn('flex items-center gap-1.5 rounded border px-2 py-1 text-xs', correct ? 'border-success/40 bg-success/10 font-medium text-foreground' : 'text-muted-foreground')}>
                                <span className={cn('flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold', correct ? 'bg-success text-success-foreground' : 'bg-muted')}>{String.fromCharCode(65 + i)}</span>
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" size="sm" onClick={() => showToast.warning('Set archived', `${previewSet.id} archived.`)}><Archive className="mr-1.5 h-3.5 w-3.5" /> Archive</Button>
                <Button variant="outline" size="sm" onClick={() => showToast.info('Preview mode', 'Full student preview will open here.')}><Eye className="mr-1.5 h-3.5 w-3.5" /> Preview</Button>
                <Button size="sm" onClick={() => showToast.success('Set opened', `Editing ${previewSet.id}.`)}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
