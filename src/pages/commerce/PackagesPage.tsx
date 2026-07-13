import { useMemo, useState } from 'react';
import {
  Box, Plus, Pencil, Copy, Archive, IndianRupee, Star, Calendar, Users,
  TrendingUp, MoreVertical,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { showToast } from '@/components/shared/toast';
import { GatedButton } from '@/components/shared/GatedAction';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { usePackages } from '@/app/store/selectors';
import type { Package } from '@/data/commerce';

const formatRs = (n: number) => `Rs ${n.toLocaleString('en-IN')}`;

export function PackagesPage() {
  const [selected, setSelected] = useState<Package | null>(null);
  const packages = usePackages();
  const { dispatch, audit } = usePrototypeStore();

  const stats = useMemo(() => {
    const totalRevenue = packages.reduce((sum, p) => sum + p.revenue, 0);
    const totalEnrolments = packages.reduce((sum, p) => sum + p.enrolments, 0);
    const activePackages = packages.filter((p) => p.active).length;
    const featuredPackages = packages.filter((p) => p.featured).length;
    return { totalRevenue, totalEnrolments, activePackages, featuredPackages };
  }, [packages]);

  const handleToggleActive = (p: Package, nextActive: boolean) => {
    const updated = { ...p, active: nextActive };
    dispatch({ type: 'UPDATE_PACKAGE', pkg: updated, audit: audit('PACKAGE_TOGGLED', 'package', p.id, p.name, p.active ? 'Active' : 'Inactive', nextActive ? 'Active' : 'Inactive', nextActive ? 'Package activated' : 'Package deactivated') });
    setSelected(updated);
    showToast.success(nextActive ? 'Package activated' : 'Package deactivated', p.name);
  };

  const handleToggleFeatured = (p: Package, nextFeatured: boolean) => {
    const updated = { ...p, featured: nextFeatured };
    dispatch({ type: 'UPDATE_PACKAGE', pkg: updated, audit: audit('PACKAGE_FEATURED', 'package', p.id, p.name, p.featured ? 'Featured' : 'Not Featured', nextFeatured ? 'Featured' : 'Not Featured', nextFeatured ? 'Package featured on storefront' : 'Package removed from featured') });
    setSelected(updated);
    showToast.success(nextFeatured ? 'Package featured' : 'Package unfeatured', p.name);
  };

  const handleEdit = (p: Package) => {
    const updated = { ...p, name: p.name };
    dispatch({ type: 'UPDATE_PACKAGE', pkg: updated, audit: audit('PACKAGE_UPDATED', 'package', p.id, p.name, p.name, p.name, 'Package details updated') });
    showToast.success('Package updated', `${p.id} - ${p.name}`);
    setSelected(null);
  };

  const handleDuplicate = (p: Package) => {
    showToast.info('Duplicate (prototype)', `${p.name} copy would be created here.`);
  };

  const handleArchive = (p: Package) => {
    const updated = { ...p, active: false };
    dispatch({ type: 'UPDATE_PACKAGE', pkg: updated, audit: audit('PACKAGE_TOGGLED', 'package', p.id, p.name, 'Active', 'Inactive', 'Package archived') });
    showToast.success('Package archived', p.name);
  };

  const columns: Column<Package>[] = [
    {
      key: 'name', header: 'Package',
      cell: (p) => (
        <div className="min-w-[220px]">
          <p className="font-medium text-foreground">{p.name}</p>
          <p className="text-xs text-muted-foreground">{p.id}</p>
        </div>
      ),
      sortValue: (p) => p.name,
    },
    { key: 'exam', header: 'Exam', cell: (p) => <span className="text-sm">{p.examName}</span>, sortValue: (p) => p.examName, hideOnMobile: true },
    {
      key: 'series', header: 'Series', hideOnMobile: true,
      cell: (p) => (
        <div className="flex max-w-[220px] flex-wrap gap-1">
          {p.series.map((s) => <Badge key={s} variant="secondary" className="text-[10px] font-normal">{s}</Badge>)}
        </div>
      ),
    },
    {
      key: 'price', header: 'Price',
      cell: (p) => (
        <div className="flex items-center gap-1.5">
          {p.discountedPrice < p.price && (
            <span className="text-xs text-muted-foreground line-through">{formatRs(p.price)}</span>
          )}
          <span className="text-sm font-semibold text-foreground">{formatRs(p.discountedPrice)}</span>
        </div>
      ),
      sortValue: (p) => p.discountedPrice,
    },
    {
      key: 'validity', header: 'Validity', hideOnMobile: true,
      cell: (p) => <span className="text-sm text-muted-foreground">{p.validityDays} days</span>,
      sortValue: (p) => p.validityDays,
    },
    { key: 'language', header: 'Language', cell: (p) => <span className="text-sm">{p.language}</span>, hideOnMobile: true },
    {
      key: 'saleDates', header: 'Sale Dates', hideOnMobile: true,
      cell: (p) => <span className="text-xs text-muted-foreground">{p.saleStart} - {p.saleEnd}</span>,
    },
    {
      key: 'active', header: 'Active',
      cell: (p) => <StatusBadge tone={p.active ? 'success' : 'neutral'} dot>{p.active ? 'Active' : 'Inactive'}</StatusBadge>,
      sortValue: (p) => (p.active ? 1 : 0),
    },
    {
      key: 'featured', header: 'Featured', hideOnMobile: true,
      cell: (p) => (
        p.featured
          ? <StatusBadge tone="accent"><Star className="mr-1 h-3 w-3 fill-current" /> Featured</StatusBadge>
          : <span className="text-xs text-muted-foreground">-</span>
      ),
      sortValue: (p) => (p.featured ? 1 : 0),
    },
    {
      key: 'enrolments', header: 'Enrolments', className: 'text-right',
      cell: (p) => <span className="text-sm font-medium">{p.enrolments.toLocaleString('en-IN')}</span>,
      sortValue: (p) => p.enrolments,
    },
    {
      key: 'revenue', header: 'Revenue', className: 'text-right', hideOnMobile: true,
      cell: (p) => <span className="text-sm font-semibold text-foreground">{formatRs(p.revenue)}</span>,
      sortValue: (p) => p.revenue,
    },
    {
      key: 'actions', header: '', className: 'w-10 text-right',
      cell: (p) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <GatedMenuItem permission="packages.manage" onClick={() => handleEdit(p)} icon={Pencil} label="Edit" />
              <DropdownMenuItem onClick={() => handleDuplicate(p)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <GatedMenuItem permission="packages.manage" onClick={() => handleArchive(p)} icon={Archive} label="Archive" destructive />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Packages"
        description="Manage sellable test packages and pricing."
        icon={<Box className="h-5 w-5" />}
        actions={
          <Button size="sm" onClick={() => showToast.info('New Package', 'Package creation form would open here.')}>
            <Plus className="mr-1.5 h-4 w-4" /> New Package
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatRs(stats.totalRevenue)} icon={IndianRupee} delta={{ value: '11.8%', positive: true }} sublabel="across all packages" tone="success" />
        <StatCard label="Total Enrolments" value={stats.totalEnrolments.toLocaleString('en-IN')} icon={Users} delta={{ value: '8.4%', positive: true }} sublabel="all packages" tone="info" />
        <StatCard label="Active Packages" value={stats.activePackages} icon={Box} sublabel="currently live" tone="primary" />
        <StatCard label="Featured Packages" value={stats.featuredPackages} icon={Star} sublabel="highlighted on storefront" tone="accent" />
      </div>

      <Card className="p-4">
        <DataTable
          data={packages}
          columns={columns}
          getRowId={(p) => p.id}
          searchable
          searchKeys={(p) => `${p.name} ${p.id} ${p.examName} ${p.series.join(' ')}`}
          selectable={false}
          rowAction={(p) => setSelected(p)}
          initialSort={{ key: 'revenue', dir: 'desc' }}
        />
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base">{selected.name}</SheetTitle>
                  <StatusBadge tone={selected.active ? 'success' : 'neutral'} dot className="text-[10px]">
                    {selected.active ? 'Active' : 'Inactive'}
                  </StatusBadge>
                  {selected.featured && (
                    <StatusBadge tone="accent" className="text-[10px]">
                      <Star className="mr-1 h-3 w-3 fill-current" /> Featured
                    </StatusBadge>
                  )}
                </div>
                <SheetDescription className="sr-only">Package details</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Package ID</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.id}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Exam</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.examName}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Test Series</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.series.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Pricing</p>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-2">
                      {selected.discountedPrice < selected.price && (
                        <span className="text-sm text-muted-foreground line-through">{formatRs(selected.price)}</span>
                      )}
                      <span className="font-display text-2xl font-bold text-foreground">{formatRs(selected.discountedPrice)}</span>
                      {selected.discountedPrice < selected.price && (
                        <StatusBadge tone="success" className="ml-auto">
                          Save {formatRs(selected.price - selected.discountedPrice)}
                        </StatusBadge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {Math.round((1 - selected.discountedPrice / selected.price) * 100)}% off original price
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Validity</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {selected.validityDays} days
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Language</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.language}</p>
                  </div>
                  <div className="col-span-2 rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sale Period</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {selected.saleStart} - {selected.saleEnd}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Enrolments</p>
                    <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-foreground">
                      <Users className="h-4 w-4 text-muted-foreground" /> {selected.enrolments.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Revenue</p>
                    <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-foreground">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" /> {formatRs(selected.revenue)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Active</p>
                      <p className="text-xs text-muted-foreground">Package visible on storefront</p>
                    </div>
                    <GatedSwitch permission="packages.manage" checked={selected.active} onCheckedChange={(v) => handleToggleActive(selected, v)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Featured</p>
                      <p className="text-xs text-muted-foreground">Highlight on the storefront</p>
                    </div>
                    <GatedSwitch permission="packages.manage" checked={selected.featured} onCheckedChange={(v) => handleToggleFeatured(selected, v)} />
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <GatedButton permission="packages.manage" variant="outline" size="sm" onClick={() => handleEdit(selected)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                </GatedButton>
                <Button size="sm" onClick={() => { handleDuplicate(selected); setSelected(null); }}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Duplicate
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function GatedMenuItem({ permission, onClick, icon: Icon, label, destructive }: { permission: string; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string; destructive?: boolean }) {
  const { hasPermission } = usePrototypeStore();
  if (hasPermission(permission)) {
    return (
      <DropdownMenuItem className={destructive ? 'text-destructive focus:text-destructive' : ''} onClick={onClick}>
        <Icon className="mr-2 h-4 w-4" /> {label}
      </DropdownMenuItem>
    );
  }
  return (
    <DropdownMenuItem className="opacity-50" disabled>
      <Icon className="mr-2 h-4 w-4" /> {label}
    </DropdownMenuItem>
  );
}

function GatedSwitch({ permission, checked, onCheckedChange }: { permission: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  const { hasPermission } = usePrototypeStore();
  if (hasPermission(permission)) {
    return <Switch checked={checked} onCheckedChange={onCheckedChange} />;
  }
  return <Switch checked={checked} disabled />;
}
