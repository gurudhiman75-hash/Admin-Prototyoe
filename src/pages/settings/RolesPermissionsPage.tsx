import { useMemo } from 'react';
import {
  Lock, Plus, Check, Minus, Pencil, ShieldCheck, Users, KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { showToast } from '@/components/shared/toast';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ADMIN_ROLES, ADMIN_TEAM } from '@/data/users';

interface RoleMeta {
  name: string; description: string; color: 'primary' | 'info' | 'success' | 'warning' | 'accent' | 'destructive' | 'neutral';
}

const ROLE_META: RoleMeta[] = [
  { name: 'Super Admin', description: 'Full platform control including settings and audit.', color: 'destructive' },
  { name: 'Content Manager', description: 'Manage questions, tests, reviews and taxonomy.', color: 'primary' },
  { name: 'Question Author', description: 'Create and submit questions via Studio.', color: 'info' },
  { name: 'Reviewer', description: 'Review, approve or reject submitted questions.', color: 'success' },
  { name: 'Test Manager', description: 'Build tests, manage series and publishing.', color: 'accent' },
  { name: 'Support Agent', description: 'Handle student support and notifications.', color: 'warning' },
  { name: 'Finance Admin', description: 'Orders, refunds, packages and coupons.', color: 'primary' },
  { name: 'Marketing Admin', description: 'Campaigns, branding and promotions.', color: 'info' },
  { name: 'Analyst', description: 'Read analytics and export reports.', color: 'neutral' },
  { name: 'Read-only Auditor', description: 'View audit logs and analytics only.', color: 'neutral' },
];

const PERMISSIONS = [
  'Questions', 'Tests', 'Review', 'Publish', 'Commerce', 'Users', 'Analytics', 'Settings', 'Audit', 'Team Management',
];

const PERMISSION_MATRIX: Record<string, boolean[]> = {
  'Super Admin':       [true, true, true, true, true, true, true, true, true, true],
  'Content Manager':   [true, true, true, false, false, false, false, false, false, true],
  'Question Author':   [true, false, false, false, false, false, false, false, false, false],
  'Reviewer':          [true, false, true, false, false, false, false, false, false, false],
  'Test Manager':      [false, true, false, true, false, false, false, false, false, false],
  'Support Agent':     [false, false, false, false, false, true, false, false, false, false],
  'Finance Admin':     [false, false, false, false, true, false, false, false, false, false],
  'Marketing Admin':   [false, false, false, true, true, false, true, false, false, false],
  'Analyst':           [false, false, false, false, false, false, true, false, false, false],
  'Read-only Auditor': [false, false, false, false, false, false, true, false, true, false],
};

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

export function RolesPermissionsPage() {
  const { activeRole } = usePrototypeStore();
  const memberCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ADMIN_ROLES.forEach((r) => { counts[r] = 0; });
    ADMIN_TEAM.forEach((m) => { counts[m.role] = (counts[m.role] ?? 0) + 1; });
    return counts;
  }, []);

  const totalPerms = (role: string) => PERMISSION_MATRIX[role]?.filter(Boolean).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Manage admin roles and access control."
        icon={<Lock className="h-5 w-5" />}
        actions={
          <Button size="sm" onClick={() => showToast.info('Add role', 'Role creation form will open here.')}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Role
          </Button>
        }
      />

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Roles Overview</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {ROLE_META.map((role) => {
            const isActive = role.name === activeRole;
            return (
            <Card key={role.name} className={cn(isActive && 'border-primary/50 ring-1 ring-primary/30')}>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-sm">{role.name}</CardTitle>
                    {isActive && (
                      <Badge className="bg-primary/15 text-primary border border-primary/30 text-[10px] gap-1">
                        <ShieldCheck className="h-3 w-3" /> Active
                      </Badge>
                    )}
                  </div>
                  <StatusBadge tone={role.color} className="shrink-0 text-[10px]">
                    {totalPerms(role.name)} perms
                  </StatusBadge>
                </div>
                <CardDescription className="text-xs leading-relaxed">{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{memberCounts[role.name] ?? 0}</span>
                  <span className="text-xs text-muted-foreground">member(s)</span>
                </div>
              </CardContent>
              <CardFooter className="justify-end pt-0">
                <Button variant="outline" size="sm" onClick={() => showToast.info('Edit role', `Opening editor for ${role.name}.`)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
              </CardFooter>
            </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Permission Matrix</CardTitle>
          </div>
          <CardDescription>Capabilities granted to each role across the platform.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-3 sm:p-6">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                {PERMISSIONS.map((p) => (
                  <th key={p} className="p-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLE_META.map((role) => {
                const isActive = role.name === activeRole;
                return (
                <tr key={role.name} className={cn('border-t transition-colors hover:bg-muted/30', isActive && 'bg-primary/5')}>
                  <td className="sticky left-0 z-10 bg-card p-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className={cn('h-3.5 w-3.5', role.color === 'destructive' ? 'text-destructive' : 'text-muted-foreground')} />
                      <span className="font-medium text-foreground">{role.name}</span>
                      {isActive && (
                        <Badge className="bg-primary/15 text-primary border border-primary/30 text-[10px] gap-1">
                          <ShieldCheck className="h-3 w-3" /> Active
                        </Badge>
                      )}
                    </div>
                  </td>
                  {PERMISSIONS.map((_, pi) => {
                    const allowed = PERMISSION_MATRIX[role.name]?.[pi] ?? false;
                    return (
                      <td key={pi} className="p-3 text-center">
                        {allowed ? (
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
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success"><Check className="h-3 w-3" /></span>
              Allowed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground"><Minus className="h-3 w-3" /></span>
              Not allowed
            </span>
          </div>
        </CardContent>
      </Card>

      <PrototypeNotice />
    </div>
  );
}
