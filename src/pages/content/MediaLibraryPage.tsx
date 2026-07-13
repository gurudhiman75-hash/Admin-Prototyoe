import { useMemo, useState } from 'react';
import {
  Image as ImageIcon, Upload, Search, Replace, Archive, Download,
  FileImage,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { showToast } from '@/components/shared/toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { MEDIA_ASSETS, type MediaAsset } from '@/data/auxiliary';

const FILTER_TYPE = [
  { label: 'Question Image', value: 'Question Image' },
  { label: 'DI Chart', value: 'DI Chart' },
  { label: 'Passage Image', value: 'Passage Image' },
  { label: 'Package Banner', value: 'Package Banner' },
  { label: 'Exam Icon', value: 'Exam Icon' },
  { label: 'Notification Image', value: 'Notification Image' },
];
const FILTER_STATUS = [
  { label: 'Active', value: 'Active' },
  { label: 'Archived', value: 'Archived' },
];

const TYPE_TONE: Record<MediaAsset['type'], 'primary' | 'info' | 'success' | 'warning' | 'accent' | 'neutral'> = {
  'Question Image': 'success', 'DI Chart': 'primary', 'Passage Image': 'info',
  'Package Banner': 'accent', 'Exam Icon': 'neutral', 'Notification Image': 'warning',
};

const MOCK_REFS = ['Q-1005', 'Q-1008', 'Test T-2010', 'Package Banking Pro'];

export function MediaLibraryPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const filterDefs: FilterDef[] = [
    { key: 'type', label: 'Type', options: FILTER_TYPE },
    { key: 'status', label: 'Status', options: FILTER_STATUS },
  ];

  const filtered = useMemo(() => {
    let list = MEDIA_ASSETS;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q));
    }
    if (filters.type && filters.type !== 'all') list = list.filter((a) => a.type === filters.type);
    if (filters.status && filters.status !== 'all') list = list.filter((a) => a.status === filters.status);
    return list;
  }, [search, filters]);

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Central repository for question images, DI charts, passage images, package banners, and notification assets."
        icon={<ImageIcon className="h-5 w-5" />}
        actions={<Button size="sm" onClick={() => setUploadOpen(true)}><Upload className="mr-1.5 h-4 w-4" /> Upload</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media…" className="pl-9" />
        </div>
        <FilterBar
          filters={filterDefs}
          values={filters}
          onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
          onClear={() => setFilters({})}
          className="flex-1"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ImageIcon className="h-7 w-7" />} title="No media found" description="Try adjusting your search or filters, or upload a new asset." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((asset) => (
            <Card key={asset.id} className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md" onClick={() => setPreviewAsset(asset)}>
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" loading="lazy" />
                {asset.status === 'Archived' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Badge variant="outline" className="text-[10px]">Archived</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="truncate text-sm font-medium text-foreground">{asset.name}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <StatusBadge tone={TYPE_TONE[asset.type]} className="text-[10px]">{asset.type}</StatusBadge>
                  <span className="text-[11px] text-muted-foreground">{asset.usageCount} uses</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!previewAsset} onOpenChange={(o) => !o && setPreviewAsset(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {previewAsset && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">{previewAsset.name}</SheetTitle>
                <SheetDescription className="sr-only">Media asset detail</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <div className="overflow-hidden rounded-lg border bg-muted">
                  <img src={previewAsset.url} alt={previewAsset.name} className="max-h-72 w-full object-contain" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Name', value: previewAsset.name },
                    { label: 'Type', value: previewAsset.type },
                    { label: 'Size', value: previewAsset.size },
                    { label: 'Dimensions', value: previewAsset.dimensions },
                    { label: 'Uploaded By', value: previewAsset.uploadedBy },
                    { label: 'Uploaded On', value: previewAsset.uploadedOn },
                    { label: 'Usage Count', value: `${previewAsset.usageCount}` },
                    { label: 'Status', value: previewAsset.status },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg border p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</p>
                      <p className="mt-1 font-medium text-foreground">{m.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usage References</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_REFS.map((r) => <Badge key={r} variant="outline" className="text-[10px] font-normal">{r}</Badge>)}
                    {previewAsset.usageCount === 0 && <span className="text-sm text-muted-foreground">No references</span>}
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" size="sm" onClick={() => showToast.info('Downloading', `${previewAsset.name} download started.`)}><Download className="mr-1.5 h-3.5 w-3.5" /> Download</Button>
                <Button variant="outline" size="sm" onClick={() => showToast.warning('Archived', `${previewAsset.name} archived.`)}><Archive className="mr-1.5 h-3.5 w-3.5" /> Archive</Button>
                <Button size="sm" onClick={() => showToast.info('Replace', `Replacing ${previewAsset.name}.`)}><Replace className="mr-1.5 h-3.5 w-3.5" /> Replace</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><Upload className="h-4 w-4" /> Upload Media</DialogTitle>
            <DialogDescription>Drag and drop files or browse to upload.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); showToast.success('File uploaded', 'Asset added to media library.'); setUploadOpen(false); }}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><FileImage className="h-6 w-6" /></div>
              <p className="text-sm font-medium text-foreground">Drag & drop files here</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => showToast.success('File uploaded', 'Asset added to media library.')}>Browse Files</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
