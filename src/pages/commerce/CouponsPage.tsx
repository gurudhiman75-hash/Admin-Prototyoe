import { useState } from 'react';
import {
  Ticket, Plus, Pencil, Copy, Ban, Calendar, TrendingUp, Percent,
  IndianRupee, MoreVertical,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { showToast } from '@/components/shared/toast';
import { GatedButton } from '@/components/shared/GatedAction';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { useCoupons } from '@/app/store/selectors';
import type { Coupon } from '@/data/commerce';

const formatRs = (n: number) => `Rs ${n.toLocaleString('en-IN')}`;

export function CouponsPage() {
  const [selected, setSelected] = useState<Coupon | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    code: '', type: 'Percentage' as Coupon['type'], discount: 10, startDate: '', endDate: '', totalLimit: 1000, perUserLimit: 1, eligiblePackages: '',
  });

  const coupons = useCoupons();
  const { dispatch, audit } = usePrototypeStore();

  const handleCreate = () => {
    if (!createForm.code.trim()) {
      showToast.warning('Code required', 'Enter a coupon code before saving.');
      return;
    }
    const newCoupon: Coupon = {
      id: `C-${Date.now()}`,
      code: createForm.code.toUpperCase().trim(),
      type: createForm.type,
      discount: createForm.discount,
      eligiblePackages: createForm.eligiblePackages ? createForm.eligiblePackages.split(',').map((p) => p.trim()).filter(Boolean) : ['All active packages'],
      startDate: createForm.startDate || new Date().toISOString().slice(0, 10),
      endDate: createForm.endDate || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      totalLimit: createForm.totalLimit,
      perUserLimit: createForm.perUserLimit,
      active: true,
      redemptions: 0,
      revenueGenerated: 0,
    };
    dispatch({ type: 'ADD_COUPON', coupon: newCoupon, audit: audit('COUPON_CREATED', 'coupon', newCoupon.id, newCoupon.code, '-', 'Active', 'New coupon created') });
    showToast.success('Coupon created', `${newCoupon.code} is now active.`);
    setCreateOpen(false);
    setCreateForm({ code: '', type: 'Percentage', discount: 10, startDate: '', endDate: '', totalLimit: 1000, perUserLimit: 1, eligiblePackages: '' });
  };

  const handleToggleActive = (c: Coupon, nextActive: boolean) => {
    const updated = { ...c, active: nextActive };
    dispatch({ type: 'UPDATE_COUPON', coupon: updated, audit: audit('COUPON_TOGGLED', 'coupon', c.id, c.code, c.active ? 'Active' : 'Inactive', nextActive ? 'Active' : 'Inactive', nextActive ? 'Coupon activated' : 'Coupon deactivated') });
    setSelected(updated);
    showToast.success(nextActive ? 'Coupon activated' : 'Coupon deactivated', c.code);
  };

  const handleEdit = (c: Coupon) => {
    const updated = { ...c };
    dispatch({ type: 'UPDATE_COUPON', coupon: updated, audit: audit('COUPON_UPDATED', 'coupon', c.id, c.code, c.code, c.code, 'Coupon details updated') });
    showToast.success('Coupon updated', c.code);
    setSelected(null);
  };

  const handleDuplicate = (c: Coupon) => {
    showToast.info('Duplicate (prototype)', `${c.code} copy would be created here.`);
  };

  const columns: Column<Coupon>[] = [
    {
      key: 'code', header: 'Code',
      cell: (c) => <span className="font-mono text-sm font-bold text-foreground">{c.code}</span>,
      sortValue: (c) => c.code,
    },
    {
      key: 'type', header: 'Type',
      cell: (c) => <StatusBadge tone={c.type === 'Percentage' ? 'info' : 'primary'}>{c.type}</StatusBadge>,
      sortValue: (c) => c.type,
    },
    {
      key: 'discount', header: 'Discount',
      cell: (c) => (
        <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
          {c.type === 'Percentage' ? (
            <><Percent className="h-3.5 w-3.5 text-muted-foreground" />{c.discount}%</>
          ) : (
            <><IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />{c.discount}</>
          )}
        </span>
      ),
      sortValue: (c) => c.discount,
    },
    {
      key: 'eligiblePackages', header: 'Eligible Packages', hideOnMobile: true,
      cell: (c) => (
        <div className="flex max-w-[240px] flex-wrap gap-1">
          {c.eligiblePackages.map((p) => <Badge key={p} variant="secondary" className="text-[10px] font-normal">{p}</Badge>)}
        </div>
      ),
    },
    {
      key: 'validPeriod', header: 'Valid Period', hideOnMobile: true,
      cell: (c) => <span className="text-xs text-muted-foreground">{c.startDate} - {c.endDate}</span>,
      sortValue: (c) => c.startDate,
    },
    {
      key: 'limits', header: 'Limits', hideOnMobile: true,
      cell: (c) => (
        <span className="text-xs text-muted-foreground">
          {c.totalLimit.toLocaleString('en-IN')} total / {c.perUserLimit}/user
        </span>
      ),
      sortValue: (c) => c.totalLimit,
    },
    {
      key: 'active', header: 'Active',
      cell: (c) => <StatusBadge tone={c.active ? 'success' : 'neutral'} dot>{c.active ? 'Active' : 'Inactive'}</StatusBadge>,
      sortValue: (c) => (c.active ? 1 : 0),
    },
    {
      key: 'redemptions', header: 'Redemptions', className: 'text-right',
      cell: (c) => <span className="text-sm font-medium">{c.redemptions.toLocaleString('en-IN')}</span>,
      sortValue: (c) => c.redemptions,
    },
    {
      key: 'revenue', header: 'Revenue', className: 'text-right', hideOnMobile: true,
      cell: (c) => <span className="text-sm font-semibold text-foreground">{formatRs(c.revenueGenerated)}</span>,
      sortValue: (c) => c.revenueGenerated,
    },
    {
      key: 'actions', header: '', className: 'w-10 text-right',
      cell: (c) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => handleEdit(c)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(c)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleToggleActive(c, !c.active)}>
                <Ban className="mr-2 h-4 w-4" /> {c.active ? 'Deactivate' : 'Activate'}
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
        title="Coupons"
        description="Manage discount codes and promotional offers."
        icon={<Ticket className="h-5 w-5" />}
        actions={
          <GatedButton permission="coupons.manage" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> New Coupon
          </GatedButton>
        }
      />

      <Card className="p-4">
        <DataTable
          data={coupons}
          columns={columns}
          getRowId={(c) => c.id}
          searchable
          searchKeys={(c) => `${c.code} ${c.type} ${c.eligiblePackages.join(' ')}`}
          selectable={false}
          rowAction={(c) => setSelected(c)}
          initialSort={{ key: 'redemptions', dir: 'desc' }}
        />
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle className="font-mono text-base">{selected.code}</SheetTitle>
                  <StatusBadge tone={selected.active ? 'success' : 'neutral'} dot className="text-[10px]">
                    {selected.active ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>
                <SheetDescription className="sr-only">Coupon details</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Type</p>
                    <p className="mt-1"><StatusBadge tone={selected.type === 'Percentage' ? 'info' : 'primary'}>{selected.type}</StatusBadge></p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Discount</p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground">
                      {selected.type === 'Percentage' ? (
                        <><Percent className="h-3.5 w-3.5 text-muted-foreground" />{selected.discount}%</>
                      ) : (
                        <><IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />{selected.discount}</>
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Eligible Packages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.eligiblePackages.map((p) => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Valid Period</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {selected.startDate} - {selected.endDate}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Limit</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.totalLimit.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Per User</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selected.perUserLimit}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Redemption Stats</p>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Redemptions</span>
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        {selected.redemptions.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-muted-foreground">/ {selected.totalLimit.toLocaleString('en-IN')}</span>
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (selected.redemptions / selected.totalLimit) * 100)}
                      className={cn('mt-2 h-2', (selected.redemptions / selected.totalLimit) > 0.9 && '[&>div]:bg-warning')}
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {Math.round((selected.redemptions / selected.totalLimit) * 100)}% of total limit used
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Revenue Generated</p>
                  <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-foreground">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" /> {formatRs(selected.revenueGenerated)}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Active</p>
                    <p className="text-xs text-muted-foreground">Coupon redeemable on storefront</p>
                  </div>
                  <GatedSwitch permission="coupons.manage" checked={selected.active} onCheckedChange={(v) => handleToggleActive(selected, v)} />
                </div>
              </div>

              <SheetFooter className="mt-6">
                <GatedButton permission="coupons.manage" variant="outline" size="sm" onClick={() => handleEdit(selected)}>
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

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-base">New Coupon</SheetTitle>
            <SheetDescription>Create a new discount code.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div>
              <Label className="mb-1.5 block">Code</Label>
              <Input value={createForm.code} onChange={(e) => setCreateForm((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. SUMMER25" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Type</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={createForm.type} onChange={(e) => setCreateForm((p) => ({ ...p, type: e.target.value as Coupon['type'] }))}>
                  <option value="Percentage">Percentage</option>
                  <option value="Flat">Flat</option>
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block">Discount</Label>
                <Input type="number" value={createForm.discount} onChange={(e) => setCreateForm((p) => ({ ...p, discount: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Start Date</Label>
                <Input type="date" value={createForm.startDate} onChange={(e) => setCreateForm((p) => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <Label className="mb-1.5 block">End Date</Label>
                <Input type="date" value={createForm.endDate} onChange={(e) => setCreateForm((p) => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Total Limit</Label>
                <Input type="number" value={createForm.totalLimit} onChange={(e) => setCreateForm((p) => ({ ...p, totalLimit: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="mb-1.5 block">Per User Limit</Label>
                <Input type="number" value={createForm.perUserLimit} onChange={(e) => setCreateForm((p) => ({ ...p, perUserLimit: Number(e.target.value) }))} />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Eligible Packages (comma-separated)</Label>
              <Input value={createForm.eligiblePackages} onChange={(e) => setCreateForm((p) => ({ ...p, eligiblePackages: e.target.value }))} placeholder="e.g. SSC CGL Ultimate 2025, Banking Pro Combo" />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <GatedButton permission="coupons.manage" size="sm" onClick={handleCreate}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Coupon
            </GatedButton>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function GatedSwitch({ permission, checked, onCheckedChange }: { permission: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  const { hasPermission } = usePrototypeStore();
  if (hasPermission(permission)) {
    return <Switch checked={checked} onCheckedChange={onCheckedChange} />;
  }
  return <Switch checked={checked} disabled />;
}
