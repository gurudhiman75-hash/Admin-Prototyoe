import { useMemo, useState } from 'react';
import {
  Network, ChevronRight, ChevronDown, Folder, FileText, Pencil,
  Archive, GitMerge, Move, AlertTriangle, Search, Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { showToast } from '@/components/shared/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { EXAMS, SUBJECTS, EXAM_FAMILIES, type ExamFamily } from '@/data/exams';
import { QUESTIONS } from '@/data/questions';

interface TreeNode {
  id: string;
  label: string;
  type: 'Family' | 'Exam' | 'Stage' | 'Subject' | 'Chapter' | 'Topic' | 'Subtopic';
  usageCount: number;
  children?: TreeNode[];
}

function buildTree(): TreeNode[] {
  return EXAM_FAMILIES.map((family: ExamFamily) => {
    const familyExams = EXAMS.filter((e) => e.family === family);
    return {
      id: `family-${family}`,
      label: family,
      type: 'Family',
      usageCount: QUESTIONS.filter((q) => familyExams.some((e) => e.code === q.exam)).length,
      children: familyExams.map((exam) => ({
        id: `exam-${exam.code}`,
        label: exam.name,
        type: 'Exam',
        usageCount: QUESTIONS.filter((q) => q.exam === exam.code).length,
        children: exam.stages.map((stage) => ({
          id: `stage-${exam.code}-${stage}`,
          label: stage,
          type: 'Stage',
          usageCount: Math.floor(QUESTIONS.filter((q) => q.exam === exam.code).length / Math.max(1, exam.stages.length)),
          children: SUBJECTS.map((subject) => ({
            id: `subj-${exam.code}-${stage}-${subject}`,
            label: subject,
            type: 'Subject',
            usageCount: QUESTIONS.filter((q) => q.exam === exam.code && q.subject === subject).length,
            children: Array.from(new Set(QUESTIONS.filter((q) => q.exam === exam.code && q.subject === subject).map((q) => q.chapter))).map((chapter) => ({
              id: `chap-${exam.code}-${subject}-${chapter}`,
              label: chapter,
              type: 'Chapter',
              usageCount: QUESTIONS.filter((q) => q.exam === exam.code && q.subject === subject && q.chapter === chapter).length,
              children: Array.from(new Set(QUESTIONS.filter((q) => q.exam === exam.code && q.subject === subject && q.chapter === chapter).map((q) => q.topic))).map((topic) => ({
                id: `top-${exam.code}-${subject}-${chapter}-${topic}`,
                label: topic,
                type: 'Topic',
                usageCount: QUESTIONS.filter((q) => q.exam === exam.code && q.subject === subject && q.chapter === chapter && q.topic === topic).length,
                children: Array.from(new Set(QUESTIONS.filter((q) => q.exam === exam.code && q.subject === subject && q.chapter === chapter && q.topic === topic).map((q) => q.subtopic))).map((subtopic) => ({
                  id: `sub-${exam.code}-${subject}-${chapter}-${topic}-${subtopic}`,
                  label: subtopic,
                  type: 'Subtopic',
                  usageCount: QUESTIONS.filter((q) => q.exam === exam.code && q.subject === subject && q.chapter === chapter && q.topic === topic && q.subtopic === subtopic).length,
                })),
              })),
            })),
          })),
        })),
      })),
    } as TreeNode;
  });
}

const TYPE_TONE: Record<TreeNode['type'], 'primary' | 'info' | 'success' | 'warning' | 'neutral' | 'accent' | 'default'> = {
  Family: 'primary', Exam: 'info', Stage: 'accent', Subject: 'success', Chapter: 'warning', Topic: 'neutral', Subtopic: 'default',
};

function findPath(nodes: TreeNode[], targetId: string, path: TreeNode[] = []): TreeNode[] | null {
  for (const n of nodes) {
    if (n.id === targetId) return [...path, n];
    if (n.children) {
      const found = findPath(n.children, targetId, [...path, n]);
      if (found) return found;
    }
  }
  return null;
}

function filterTree(nodes: TreeNode[], q: string): TreeNode[] {
  if (!q) return nodes;
  const lower = q.toLowerCase();
  return nodes
    .map((n) => {
      if (n.label.toLowerCase().includes(lower)) return n;
      if (n.children) {
        const filtered = filterTree(n.children, q);
        if (filtered.length > 0) return { ...n, children: filtered };
      }
      return null;
    })
    .filter((n): n is TreeNode => n !== null);
}

function collectIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  for (const n of nodes) { ids.push(n.id); if (n.children) ids.push(...collectIds(n.children)); }
  return ids;
}

function TreeRow({ node, depth, expanded, toggle, selectedId, onSelect }: {
  node: TreeNode; depth: number; expanded: Set<string>; toggle: (id: string) => void; selectedId: string | null; onSelect: (n: TreeNode) => void;
}) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <>
      <button
        onClick={() => onSelect(node)}
        className={cn('flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-sm transition-colors', selectedId === node.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60')}
        style={{ paddingLeft: depth * 14 + 8 }}
      >
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); toggle(node.id); }} className="flex h-4 w-4 shrink-0 items-center justify-center">
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : <span className="w-4 shrink-0" />}
        {node.type === 'Family' || node.type === 'Exam' ? <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        <span className="flex-1 truncate">{node.label}</span>
        {node.usageCount > 0 && <Badge variant="outline" className="shrink-0 text-[10px] font-normal text-muted-foreground">{node.usageCount}</Badge>}
      </button>
      {hasChildren && isExpanded && node.children!.map((child) => (
        <TreeRow key={child.id} node={child} depth={depth + 1} expanded={expanded} toggle={toggle} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </>
  );
}

export function TaxonomyPage() {
  const tree = useMemo(() => buildTree(), []);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => filterTree(tree, search), [tree, search]);
  const path = selectedId ? findPath(tree, selectedId) : null;
  const selectedNode = path ? path[path.length - 1] : null;

  const toggle = (id: string) => setExpanded((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const expandAll = () => setExpanded(new Set(collectIds(tree)));
  const collapseAll = () => setExpanded(new Set());

  return (
    <div>
      <PageHeader
        title="Sections & Topics"
        description="Manage the exam taxonomy hierarchy — families, exams, subjects, chapters, topics, and subtopics."
        icon={<Network className="h-5 w-5" />}
        actions={<Button size="sm" onClick={() => showToast.info('Add Family', 'Family creation form will open here.')}><Plus className="mr-1.5 h-4 w-4" /> Add Family</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card className="flex h-[calc(100vh-220px)] flex-col">
          <CardHeader className="space-y-3 pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search taxonomy…" className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 flex-1 text-xs" onClick={expandAll}>Expand All</Button>
              <Button variant="outline" size="sm" className="h-7 flex-1 text-xs" onClick={collapseAll}>Collapse All</Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-2 pt-0">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-0.5">
                {filtered.map((node) => (
                  <TreeRow key={node.id} node={node} depth={0} expanded={expanded} toggle={toggle} selectedId={selectedId} onSelect={(n) => setSelectedId(n.id)} />
                ))}
                {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No matches found</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div>
          {!selectedNode ? (
            <EmptyState icon={<Network className="h-7 w-7" />} title="Select a node" description="Choose a family, exam, subject, chapter, topic, or subtopic from the tree to view its details." />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1 text-sm">
                {path!.map((p, i) => (
                  <span key={p.id} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                    <button onClick={() => setSelectedId(p.id)} className={cn(i === path!.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')}>{p.label}</button>
                  </span>
                ))}
              </div>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">{selectedNode.label}</CardTitle>
                    <StatusBadge tone={TYPE_TONE[selectedNode.type]} className="mt-1 text-[10px]">{selectedNode.type}</StatusBadge>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border p-3"><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Type</p><p className="mt-1 text-sm font-medium text-foreground">{selectedNode.type}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Parent</p><p className="mt-1 text-sm font-medium text-foreground">{path!.length > 1 ? path![path!.length - 2].label : 'Root'}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Children</p><p className="mt-1 text-sm font-medium text-foreground">{selectedNode.children?.length ?? 0}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Usage Count</p><p className="mt-1 text-sm font-medium text-foreground">{selectedNode.usageCount}</p></div>
                </CardContent>
              </Card>

              {selectedNode.usageCount > 0 ? (
                <Card className="border-warning/30 bg-warning/5">
                  <CardContent className="flex items-start gap-3 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Dependency Warning</p>
                      <p className="mt-1 text-sm text-muted-foreground">This node is linked to <span className="font-semibold text-foreground">{selectedNode.usageCount} questions</span> and may be referenced by tests. Archiving or merging will affect existing content.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-success/30 bg-success/5">
                  <CardContent className="flex items-center gap-3 p-4">
                    <FileText className="h-5 w-5 shrink-0 text-success" />
                    <p className="text-sm text-muted-foreground">No dependencies — this node is safe to modify or archive.</p>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => showToast.info('Rename', `Renaming "${selectedNode.label}".`)}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Rename</Button>
                <Button variant="outline" size="sm" onClick={() => showToast.warning('Archive', `Archiving "${selectedNode.label}".`)}><Archive className="mr-1.5 h-3.5 w-3.5" /> Archive</Button>
                <Button variant="outline" size="sm" onClick={() => showToast.info('Merge', `Merging "${selectedNode.label}" into another node.`)}><GitMerge className="mr-1.5 h-3.5 w-3.5" /> Merge</Button>
                <Button variant="outline" size="sm" onClick={() => showToast.info('Move', `Moving "${selectedNode.label}" to a new parent.`)}><Move className="mr-1.5 h-3.5 w-3.5" /> Move</Button>
              </div>

              {selectedNode.children && selectedNode.children.length > 0 && (
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Child Nodes ({selectedNode.children.length})</CardTitle></CardHeader>
                  <CardContent className="space-y-1">
                    {selectedNode.children.map((child) => (
                      <button key={child.id} onClick={() => setSelectedId(child.id)} className="flex w-full items-center gap-2 rounded-lg border p-2.5 text-left transition-colors hover:bg-muted/40">
                        {child.children && child.children.length > 0 ? <Folder className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                        <span className="flex-1 truncate text-sm font-medium text-foreground">{child.label}</span>
                        <StatusBadge tone={TYPE_TONE[child.type]} className="text-[10px]">{child.type}</StatusBadge>
                        {child.usageCount > 0 && <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">{child.usageCount}</Badge>}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
