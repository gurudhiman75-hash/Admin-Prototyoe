import { useMemo } from 'react';
import {
  ShieldCheck, Plus, MoreVertical, Check, Minus, Lock, UserCog, KeyRound,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { showToast } from '@/components/shared/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ADMIN_TEAM, ADMIN_ROLES, type AdminMember } from '@/data/users';

const PERMISSION_COLUMNS = [
  'Questions', 'Tests', 'Review', 'Publish', 'Commerce', 'Users', 'Analytics', 'Settings', 'Audit',
];

const PERMISSION_MAP: Record<string, string[]> = {
  'Super Admin': PERMISSION_COLUMNS,
  'Content Manager': ['Questions', 'Tests', 'Review'],
  'Question Author': ['Questions'],
  'Reviewer': ['Questions', 'Review'],
  'Test Manager': ['Tests', 'Publish'],
  'Support Agent': ['Users'],
  'Finance Admin': ['Commerce'],
  'Marketing Admin': [],
  'Analyst': ['Analytics'],
  'Read-only Auditor': ['Analytics', 'Audit'],
};

function roleTone(role: string) {
  switch (role) {
    case 'Super Admin': return 'destructive';
    case 'Content Manager': return 'primary';
    case 'Test Manager': return 'info';
    case 'Reviewer': return 'accent';
    case 'Finance Admin': return 'success';
    case 'Support Agent': return 'warning';
    default: return 'neutral';
  }
}

export function AdminTeamPage() {
  const stats = useMemo(() => {
    const total = ADMIN_TEAM.length;
    const active = ADMIN_TEAM.filter((m) => m.status === 'Active').length;
    const admins = ADMIN_TEAM.filter((m) => m.role === 'Super Admin' || m.role === 'Content Manager').length;
    const reviewers = ADMIN_TEAM.filter((m) => m.role === 'Reviewer').length;
    return { total, active, admins, reviewers };
  }, []);

  const columns: Column<AdminMember>[] = [
    {
      key: 'member',
      header: 'Member',
      sortValue: (m) => m.name,
      cell: (m) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{m.avatar}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
            <p className="truncate text-xs text-muted-foreground">{m.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (m) => <StatusBadge tone={roleTone(m.role)} dot className="text-[10px]">{m.role}</StatusBadge>,
      sortValue: (m) => m.role,
    },
    {
      key: 'permissions',
      header: 'Permissions',
      hideOnMobile: true,
      cell: (m) => {
        const raw = m.permissions.includes('all') ? PERMISSION_COLUMNS : m.permissions.map((p) => p.split('.')[0]);
        const perms = Array.from(new Set(raw.map((p) => p.charAt(0).toUpperCase() + p.slice(1))));
        const shown = perms.slice(0, 3);
        const extra = perms.length - shown.length;
        return (
          <div className="flex flex-wrap items-center gap-1">
            {shown.map((p) => (
              <Badge key={p} variant="outline" className="text-[10px] font-normal text-muted-foreground">{p}</Badge>
            ))}
            {extra > 0 && <span className="text-[10px] font-medium text-muted-foreground">+{extra} more</span>}
          </div>
        );
      },
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      hideOnMobile: true,
      cell: (m) => <span className="text-xs text-muted-foreground">{m.lastActive}</span>,
      sortValue: (m) => m.lastActive,
    },
    {
      key: 'assignedWork',
      header: 'Assigned Work',
      className: 'text-right',
      cell: (m) => <span className="text-sm font-medium text-foreground">{m.assignedWork.toLocaleString()}</span>,
      sortValue: (m) => m.assignedWork,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (m) => <StatusBadge tone={m.status === 'Active' ? 'success' : 'neutral'} dot>{m.status}</StatusBadge>,
      sortValue: (m) => m.status,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10 text-right',
      cell: (m) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => showToast.info('Edit role', `${m.name} - role editor opened.`)}>
                <UserCog className="mr-2 h-4 w-4" /> Edit Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => showToast.warning('Member deactivated', `${m.name} is now inactive.`)}>
                <Lock className="mr-2 h-4 w-4" /> Deactivate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => showToast.success('Password reset', `Reset link sent to ${m.email}.`)}>
                <KeyRound className="mr-2 h-4 w-4" /> Reset Password
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
        title="Admin Team"
        description="Role-based team management with permissions."
        icon={<ShieldCheck className="h-5 w-5" />}
        actions={
          <Button size="sm" onClick={() => showToast.info('Add Member', 'New team member form will open here.')}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Member
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Members" value={stats.total.toLocaleString()} icon={ShieldCheck} sublabel="team accounts" tone="primary" />
        <StatCard label="Active" value={stats.active.toLocaleString()} icon={Check} sublabel="online this week" tone="success" />
        <StatCard label="Admins" value={stats.admins.toLocaleString()} icon={UserCog} sublabel="super + content" tone="destructive" />
        <StatCard label="Reviewers" value={stats.reviewers.toLocaleString()} icon={ShieldCheck} sublabel="content reviewers" tone="accent" />
      </div>

      <Card className="mb-6 p-4">
        <DataTable
          data={ADMIN_TEAM}
          columns={columns}
          getRowId={(m) => m.id}
          searchKeys={(m) => `${m.id} ${m.name} ${m.email} ${m.role}`}
          selectable={false}
          initialSort={{ key: 'name', dir: 'asc' }}
          emptyTitle="No team members found"
          emptyDescription="Try adjusting your search terms."
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permission Matrix</CardTitle>
          <p className="text-xs text-muted-foreground">Role-based access to platform modules.</p>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                {PERMISSION_COLUMNS.map((p) => (
                  <th key={p} className="px-3 py-3 text-center font-medium text-muted-foreground">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ADMIN_ROLES.map((role) => {
                const allowed = PERMISSION_MAP[role] ?? [];
                const isSuper = role === 'Super Admin';
                return (
                  <tr key={role} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                    <td className="sticky left-0 z-10 bg-card px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isSuper && <Lock className="h-3.5 w-3.5 text-destructive" />}
                        <span className={cn('font-medium', isSuper ? 'text-foreground' : 'text-foreground')}>{role}</span>
                      </div>
                    </td>
                    {PERMISSION_COLUMNS.map((p) => {
                      const has = allowed.includes(p);
                      return (
                        <td key={p} className="px-3 py-3 text-center">
                          {has ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                              <Minus className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
