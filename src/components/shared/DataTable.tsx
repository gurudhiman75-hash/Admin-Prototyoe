import { useMemo, useState, type ReactNode } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUp, ArrowDown, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';

export interface Column<T> {
  key: string; header: string; cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string; hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  data: T[]; columns: Column<T>[]; getRowId: (row: T) => string;
  searchable?: boolean; searchKeys?: (row: T) => string;
  pageSize?: number; selectable?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  rowAction?: (row: T) => void;
  toolbar?: ReactNode;
  emptyTitle?: string; emptyDescription?: string;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
}

export function DataTable<T>({
  data, columns, getRowId, searchable = true, searchKeys, pageSize = 10,
  selectable = true, onSelectionChange, rowAction, toolbar,
  emptyTitle = 'No records found', emptyDescription = 'Try adjusting your filters or search terms.',
  initialSort,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(initialSort ?? null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!query || !searchKeys) return data;
    const q = query.toLowerCase();
    return data.filter((row) => searchKeys(row).toLowerCase().includes(q));
  }, [data, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a); const bv = col.sortValue!(b);
      if (av < bv) return -1 * dir; if (av > bv) return 1 * dir; return 0;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: string) => {
    setSort((prev) => prev?.key === key ? (prev.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' });
  };

  const allOnPageSelected = paged.length > 0 && paged.every((r) => selected.has(getRowId(r)));
  const toggleAllOnPage = () => {
    const next = new Set(selected);
    if (allOnPageSelected) paged.forEach((r) => next.delete(getRowId(r)));
    else paged.forEach((r) => next.add(getRowId(r)));
    setSelected(next); onSelectionChange?.([...next]);
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next); onSelectionChange?.([...next]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchable && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search…" className="pl-9" />
          </div>
        )}
        <div className="flex items-center gap-2">{toolbar}</div>
      </div>

      {selectable && selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm">
          <span className="font-medium text-primary">{selected.size} selected</span>
          <Button variant="ghost" size="sm" onClick={() => { setSelected(new Set()); onSelectionChange?.([]); }}>Clear</Button>
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {selectable && <TableHead className="w-10 pl-4"><Checkbox checked={allOnPageSelected} onCheckedChange={toggleAllOnPage} aria-label="Select all" /></TableHead>}
              {columns.map((col) => (
                <TableHead key={col.key} className={cn(col.hideOnMobile && 'hidden md:table-cell', col.className)}>
                  {col.sortValue ? (
                    <button onClick={() => toggleSort(col.key)} className="inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground">
                      {col.header}
                      {sort?.key === col.key && (sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  ) : col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="py-0">
                  <EmptyState icon={<Inbox className="h-7 w-7" />} title={emptyTitle} description={emptyDescription} className="my-8 border-0 bg-transparent" />
                </TableCell>
              </TableRow>
            ) : paged.map((row) => {
              const id = getRowId(row);
              const isSel = selected.has(id);
              return (
                <TableRow key={id} data-state={isSel ? 'selected' : undefined} onClick={() => rowAction?.(row)} className={cn(rowAction && 'cursor-pointer')}>
                  {selectable && <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}><Checkbox checked={isSel} onCheckedChange={() => toggleRow(id)} aria-label="Select row" /></TableCell>}
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn(col.hideOnMobile && 'hidden md:table-cell', col.className)}>{col.cell(row)}</TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{paged.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>
          –<span className="font-medium text-foreground">{Math.min(currentPage * pageSize, sorted.length)}</span> of{' '}
          <span className="font-medium text-foreground">{sorted.length}</span>
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setPage(1)}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="px-2 text-sm font-medium">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
