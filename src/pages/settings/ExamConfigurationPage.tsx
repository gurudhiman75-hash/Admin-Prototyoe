import { useState } from 'react';
import {
  Settings, Pencil, Save, AlertTriangle, Shield, ToggleLeft, Bell, RotateCcw, Database, Zap, BugOff, EyeOff,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { showToast } from '@/components/shared/toast';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { STORAGE_KEY, SCHEMA_VERSION } from '@/app/store/persistence';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { EXAMS } from '@/data/exams';

const familyTone = (family: string) =>
  family === 'SSC' ? 'primary' : family === 'Banking' ? 'info' : family === 'Railway' ? 'accent' : 'success';

interface NotifTemplate { name: string; channel: string; lastEdited: string }
const NOTIF_TEMPLATES: NotifTemplate[] = [
  { name: 'Test Reminder', channel: 'Push & In-app', lastEdited: '2026-07-08' },
  { name: 'Payment Receipt', channel: 'Email & SMS', lastEdited: '2026-07-06' },
  { name: 'Promo Offer', channel: 'Push & WhatsApp', lastEdited: '2026-07-04' },
  { name: 'Weekly Report', channel: 'Email', lastEdited: '2026-07-01' },
];

interface FeatureFlag { name: string; description: string; enabled: boolean }
const INITIAL_FLAGS: FeatureFlag[] = [
  { name: 'Question Studio AI', description: 'AI-assisted question generation in Studio', enabled: true },
  { name: 'Bilingual Support', description: 'Render questions in English + Hindi/Punjabi', enabled: true },
  { name: 'Auto-publish', description: 'Publish tests automatically once QA passes', enabled: false },
  { name: 'Bulk Import', description: 'Import questions via Excel/CSV upload', enabled: true },
  { name: 'Dark Mode for Students', description: 'Theme toggle on the student app', enabled: false },
];

function PrototypeSettingsCard() {
  const { state, setPrototypeSettings, resetData } = usePrototypeStore();
  const ps = state.prototypeSettings;

  const toggle = (key: 'simulateSlow' | 'simulateFailure' | 'showEmptyStates', value: boolean, label: string) => {
    setPrototypeSettings({ [key]: value });
    showToast.info(label, value ? 'Enabled.' : 'Disabled.');
  };

  const onReset = () => {
    resetData();
    showToast.success('Prototype data reset', 'All data restored to defaults.');
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Prototype Settings</CardTitle>
          <Badge variant="secondary" className="ml-auto text-[10px]">v{SCHEMA_VERSION}</Badge>
        </div>
        <CardDescription>Simulation toggles and data management for this visual prototype.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2 pr-3">
            <Zap className="h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">Simulate Slow Connection</p>
              <p className="text-xs text-muted-foreground">Add artificial latency to data fetches</p>
            </div>
          </div>
          <Switch checked={ps.simulateSlow} onCheckedChange={(v) => toggle('simulateSlow', v, 'Slow connection simulation')} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2 pr-3">
            <BugOff className="h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">Simulate API Failure</p>
              <p className="text-xs text-muted-foreground">Force data-loading errors for testing</p>
            </div>
          </div>
          <Switch checked={ps.simulateFailure} onCheckedChange={(v) => toggle('simulateFailure', v, 'API failure simulation')} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2 pr-3">
            <EyeOff className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Show Empty States</p>
              <p className="text-xs text-muted-foreground">Render lists as empty to preview empty states</p>
            </div>
          </div>
          <Switch checked={ps.showEmptyStates} onCheckedChange={(v) => toggle('showEmptyStates', v, 'Empty state preview')} />
        </div>
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">localStorage Key</span>
            <code className="font-mono text-xs text-foreground">{STORAGE_KEY}</code>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Schema Version</span>
            <code className="font-mono text-xs text-foreground">{SCHEMA_VERSION}</code>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between pt-0">
        <p className="text-xs text-muted-foreground">Reset clears all prototype data and restores defaults.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Prototype Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all prototype data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will restore all questions, tests, orders, students, audit logs and settings to their default values. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onReset} className={cn('bg-destructive text-destructive-foreground hover:bg-destructive/90')}>
                Reset Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
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

export function ExamConfigurationPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [twoFA, setTwoFA] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState(
    'ExamTree is undergoing scheduled maintenance. We will be back shortly.',
  );

  const toggleFlag = (name: string) => {
    setFlags((prev) => prev.map((f) => (f.name === name ? { ...f, enabled: !f.enabled } : f)));
    const flag = flags.find((f) => f.name === name);
    showToast.info(
      flag ? `${flag.name} ${flag.enabled ? 'disabled' : 'enabled'}` : 'Feature toggled',
      'Feature flag updated for the platform.',
    );
  };

  return (
    <div>
      <PageHeader
        title="Exam Configuration"
        description="Configure exam patterns, marking schemes, and section rules."
        icon={<Settings className="h-5 w-5" />}
        actions={
          <Button size="sm" onClick={() => showToast.success('Settings saved', 'Exam configuration persisted.')}>
            <Save className="mr-1.5 h-4 w-4" /> Save All
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <PrototypeSettingsCard />
        </div>
        {EXAMS.map((exam, i) => (
          <Card key={exam.code}>
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{exam.name}</CardTitle>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">{exam.code}</p>
                </div>
                <StatusBadge tone={familyTone(exam.family)} className="shrink-0 text-[10px]">{exam.family}</StatusBadge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Stages</p>
                <div className="flex flex-wrap gap-1.5">
                  {exam.stages.map((stage) => (
                    <Badge key={stage} variant="outline" className="text-[10px] font-normal">{stage}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {exam.languages.map((lang) => (
                    <Badge key={lang} variant="secondary" className="text-[10px] font-normal">{lang}</Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-lg border bg-muted/30 p-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Subjects</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{[7, 6, 5, 7, 6, 7, 5, 6, 5][i % 9]}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Q. Bank</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{[4820, 3150, 1980, 5240, 4100, 3670, 2890, 1240, 980][i % 9].toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end pt-0">
              <Button variant="outline" size="sm" onClick={() => showToast.info('Edit exam', `Opening pattern editor for ${exam.name}.`)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Default Settings</CardTitle>
            </div>
            <CardDescription>Applied to new exams and tests unless overridden.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-xs">Marks per Question</Label>
              <Input defaultValue="2" type="number" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Negative Marking</Label>
              <Input defaultValue="0.5" type="number" step="0.25" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Default Duration (min)</Label>
              <Input defaultValue="60" type="number" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Default Language</Label>
              <Select defaultValue="English">
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Punjabi">Punjabi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="justify-end pt-0">
            <Button variant="outline" size="sm" onClick={() => showToast.success('Defaults saved', 'Default marking and duration updated.')}>
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Defaults
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Notification Templates</CardTitle>
            </div>
            <CardDescription>Templates used across push, email, SMS and WhatsApp.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {NOTIF_TEMPLATES.map((t) => (
              <div key={t.name} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.channel} · edited {t.lastEdited}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0" onClick={() => showToast.info('Edit template', `Opening editor for ${t.name}.`)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Security Settings</CardTitle>
            </div>
            <CardDescription>Platform-wide security and access policies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs">Password Policy</Label>
              <Select defaultValue="strong">
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (8+ chars)</SelectItem>
                  <SelectItem value="strong">Strong (12+ chars, mixed)</SelectItem>
                  <SelectItem value="strict">Strict (16+ chars, symbols)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Session Timeout</Label>
              <Select defaultValue="60">
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Require OTP for admin sign-in</p>
              </div>
              <Switch
                checked={twoFA}
                onCheckedChange={(v) => { setTwoFA(v); showToast.info('2FA updated', v ? 'Two-factor enabled.' : 'Two-factor disabled.'); }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Feature Flags</CardTitle>
            </div>
            <CardDescription>Toggle platform capabilities without redeploying.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {flags.map((f) => (
              <div key={f.name} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-medium text-foreground">{f.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{f.description}</p>
                </div>
                <Switch checked={f.enabled} onCheckedChange={() => toggleFlag(f.name)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <CardTitle className="text-base">Maintenance Mode</CardTitle>
            </div>
            <CardDescription>Temporarily restrict student access during deployments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Students will see the message below instead of the app</p>
              </div>
              <Switch
                checked={maintenance}
                onCheckedChange={(v) => { setMaintenance(v); showToast.warning('Maintenance mode', v ? 'Platform is now in maintenance.' : 'Platform back online.'); }}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Maintenance Message</Label>
              <Textarea
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs">Scheduled Start</Label>
                <Input type="datetime-local" defaultValue="2026-07-15T02:00" />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Scheduled End</Label>
                <Input type="datetime-local" defaultValue="2026-07-15T04:00" />
              </div>
            </div>
            <div className={cn('flex items-center gap-2 rounded-lg border p-3', maintenance ? 'border-warning/40 bg-warning/5' : 'border-success/30 bg-success/5')}>
              <span className={cn('h-2 w-2 rounded-full', maintenance ? 'bg-warning' : 'bg-success')} />
              <p className="text-sm text-muted-foreground">
                {maintenance ? 'Maintenance mode is currently ACTIVE.' : 'Platform is live and accessible.'}
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end pt-0">
            <Button variant="outline" size="sm" onClick={() => showToast.success('Schedule saved', 'Maintenance window updated.')}>
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Schedule
            </Button>
          </CardFooter>
        </Card>
      </div>

      <PrototypeNotice />
    </div>
  );
}
