import { useState } from 'react';
import {
  Languages, Plus, CheckCircle2, Clock, AlertTriangle, Globe,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { showToast } from '@/components/shared/toast';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LangConfig {
  name: string; nativeName: string; code: string; completeness: number; questions: number; active: boolean;
}

const INITIAL_LANGS: LangConfig[] = [
  { name: 'English', nativeName: 'English', code: 'en', completeness: 100, questions: 18240, active: true },
  { name: 'Hindi', nativeName: 'हिन्दी', code: 'hi', completeness: 78, questions: 9420, active: true },
  { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa', completeness: 54, questions: 3680, active: true },
];

interface TranslationItem {
  id: string; source: string; target: string; status: 'Pending' | 'In Progress' | 'Complete'; translator: string;
}

const TRANSLATION_QUEUE: TranslationItem[] = [
  { id: 'Q-1042', source: 'English', target: 'Hindi', status: 'Pending', translator: '—' },
  { id: 'Q-1051', source: 'English', target: 'Punjabi', status: 'In Progress', translator: 'Harpreet Kaur' },
  { id: 'Q-1063', source: 'English', target: 'Hindi', status: 'In Progress', translator: 'Simran Singh' },
  { id: 'Q-1078', source: 'English', target: 'Punjabi', status: 'Pending', translator: '—' },
  { id: 'Q-1085', source: 'English', target: 'Hindi', status: 'Complete', translator: 'Anjali Bansal' },
  { id: 'Q-1091', source: 'English', target: 'Punjabi', status: 'In Progress', translator: 'Karan Bedi' },
  { id: 'Q-1102', source: 'English', target: 'Hindi', status: 'Complete', translator: 'Simran Singh' },
  { id: 'Q-1110', source: 'English', target: 'Punjabi', status: 'Pending', translator: '—' },
];

function translationTone(s: TranslationItem['status']) {
  return s === 'Complete' ? 'success' : s === 'In Progress' ? 'info' : 'warning';
}

function completenessTone(p: number) {
  return p === 100 ? 'success' : p >= 75 ? 'info' : p >= 50 ? 'warning' : 'destructive';
}

function PrototypeNotice() {
  return (
    <Card className="mt-8 border-warning/40 bg-warning/5">
      <CardContent className="flex items-start gap-3 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p className="text-sm text-muted-foreground">
          This standalone prototype is not connected to the live ExamTree application.
        </p>
      </CardContent>
    </Card>
  );
}

export function LanguagesPage() {
  const [langs, setLangs] = useState<LangConfig[]>(INITIAL_LANGS);

  const toggleActive = (name: string) => {
    setLangs((prev) => prev.map((l) => (l.name === name ? { ...l, active: !l.active } : l)));
    const l = langs.find((x) => x.name === name);
    showToast.info(
      `${name} ${l?.active ? 'deactivated' : 'activated'}`,
      'Language availability updated.',
    );
  };

  const columns: Column<TranslationItem>[] = [
    {
      key: 'id', header: 'Question ID',
      cell: (r) => <span className="font-mono text-xs font-medium text-foreground">{r.id}</span>,
      sortValue: (r) => r.id,
    },
    {
      key: 'source', header: 'Source',
      cell: (r) => <span className="inline-flex items-center gap-1.5 text-sm"><Globe className="h-3.5 w-3.5 text-muted-foreground" />{r.source}</span>,
      sortValue: (r) => r.source,
    },
    {
      key: 'target', header: 'Target',
      cell: (r) => <span className="inline-flex items-center gap-1.5 text-sm"><Languages className="h-3.5 w-3.5 text-muted-foreground" />{r.target}</span>,
      sortValue: (r) => r.target,
    },
    {
      key: 'status', header: 'Status',
      cell: (r) => <StatusBadge tone={translationTone(r.status)} dot className="text-[10px]">{r.status}</StatusBadge>,
      sortValue: (r) => r.status,
    },
    {
      key: 'translator', header: 'Translator', hideOnMobile: true,
      cell: (r) => <span className="text-sm text-muted-foreground">{r.translator}</span>,
      sortValue: (r) => r.translator,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Languages"
        description="Manage supported languages and translation completeness."
        icon={<Languages className="h-5 w-5" />}
        actions={
          <Button size="sm" onClick={() => showToast.info('Add language', 'Language setup form will open here.')}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Language
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {langs.map((lang) => (
          <Card key={lang.code} className={cn(!lang.active && 'opacity-70')}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {lang.name}
                    <span className="text-sm font-normal text-muted-foreground">{lang.nativeName}</span>
                  </CardTitle>
                  <p className="mt-1 font-mono text-[11px] uppercase text-muted-foreground">code: {lang.code}</p>
                </div>
                <StatusBadge tone={completenessTone(lang.completeness)} className="shrink-0 text-[10px]">
                  {lang.completeness}%
                </StatusBadge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium uppercase tracking-wider text-muted-foreground">Translation Completeness</span>
                  <span className="font-semibold text-foreground">{lang.completeness}%</span>
                </div>
                <Progress value={lang.completeness} className={cn(
                  lang.completeness === 100 && '[&>[data-state]]:bg-success',
                  lang.completeness >= 75 && lang.completeness < 100 && '[&>[data-state]]:bg-info',
                  lang.completeness >= 50 && lang.completeness < 75 && '[&>[data-state]]:bg-warning',
                  lang.completeness < 50 && '[&>[data-state]]:bg-destructive',
                )} />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{lang.questions.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-muted-foreground">questions available</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Active</p>
                  <p className="text-[11px] text-muted-foreground">{lang.active ? 'Available to students' : 'Hidden from students'}</p>
                </div>
                <Switch checked={lang.active} onCheckedChange={() => toggleActive(lang.name)} />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2 pt-0">
              <Button variant="outline" size="sm" onClick={() => showToast.info('Manage translators', `Assign translators for ${lang.name}.`)}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Translators
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Translation Queue</CardTitle>
          </div>
          <CardDescription>Questions awaiting or in progress of translation.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={TRANSLATION_QUEUE}
            columns={columns}
            getRowId={(r) => r.id}
            searchable
            searchKeys={(r) => `${r.id} ${r.source} ${r.target} ${r.status} ${r.translator}`}
            selectable={false}
            initialSort={{ key: 'status', dir: 'asc' }}
            emptyTitle="No items in queue"
            emptyDescription="All translations are up to date."
          />
        </CardContent>
      </Card>

      <PrototypeNotice />
    </div>
  );
}
