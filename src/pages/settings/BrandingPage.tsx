import { useState } from 'react';
import {
  Palette, Upload, Save, Eye, Mail, Bell, Moon, Sun, AlertTriangle, Pencil,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { showToast } from '@/components/shared/toast';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' },
];

function colorToCss(value: string): string {
  return /^\d/.test(value) && value.includes('%') ? `hsl(${value})` : value;
}

interface EmailTemplate { name: string; subject: string; preview: string }
const EMAIL_TEMPLATES: EmailTemplate[] = [
  { name: 'Test Reminder', subject: 'Your mock test starts tomorrow', preview: 'Hi {{name}}, your {{test}} is scheduled for {{date}}...' },
  { name: 'Payment Success', subject: 'Payment received - Rs {{amount}}', preview: 'Thank you for your purchase of {{package}}...' },
  { name: 'Welcome', subject: 'Welcome to ExamTree', preview: 'Hi {{name}}, start your prep journey with us...' },
  { name: 'Promo', subject: '20% off this week', preview: 'Limited time offer on {{package}}. Use code {{coupon}}...' },
];

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

export function BrandingPage() {
  const { state, setBranding, audit } = usePrototypeStore();
  const branding = state.branding;
  const [platformName, setPlatformName] = useState(branding.platformName);
  const [tagline, setTagline] = useState(branding.tagline);
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [darkMode, setDarkMode] = useState(branding.darkModeDefault);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const openEditor = (t: EmailTemplate) => {
    setEditing(t);
    setEditSubject(t.subject);
    setEditBody(t.preview);
  };

  const saveTemplate = () => {
    if (!editing) return;
    showToast.success('Template saved', `${editing.name} template updated.`);
    setEditing(null);
  };

  const saveBranding = () => {
    const oldValues = `${branding.platformName} / ${branding.tagline} / ${branding.primaryColor} / dark=${branding.darkModeDefault}`;
    const newValues = `${platformName} / ${tagline} / ${primaryColor} / dark=${darkMode}`;
    setBranding({ platformName, tagline, primaryColor, darkModeDefault: darkMode });
    audit('BRANDING_UPDATED', 'audit', 'branding', 'Branding', oldValues, newValues, 'Branding settings updated');
    showToast.success('Branding saved', 'Platform identity updated and persisted.');
  };

  const toggleDarkMode = (v: boolean) => {
    setDarkMode(v);
    setBranding({ darkModeDefault: v });
    showToast.info('Theme preview', v ? 'Dark mode preview on.' : 'Light mode preview on.');
  };

  const primaryCss = colorToCss(primaryColor);

  return (
    <div>
      <PageHeader
        title="Branding"
        description="Customize platform appearance and identity."
        icon={<Palette className="h-5 w-5" />}
        actions={
          <Button size="sm" onClick={saveBranding}>
            <Save className="mr-1.5 h-4 w-4" /> Save Changes
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Brand Settings</CardTitle>
            </div>
            <CardDescription>Core identity shown across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs">Platform Name</Label>
              <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Tagline</Label>
              <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Logo</Label>
              <div className="flex h-28 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted/30 transition-colors hover:border-primary/50 hover:bg-primary/5"
                onClick={() => showToast.info('Upload logo', 'File picker would open here.')}>
                <div className="text-center">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">Click to upload logo (SVG/PNG, max 512x128)</p>
                </div>
              </div>
            </div>
            <div>
              <Label className="mb-2 block text-xs">Primary Color</Label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => { setPrimaryColor(c.value); showToast.info('Color selected', `${c.name} set as primary.`); }}
                    className={cn(
                      'h-9 w-9 rounded-lg border-2 transition-all',
                      primaryColor === c.value ? 'border-foreground ring-2 ring-ring ring-offset-2' : 'border-transparent hover:scale-105',
                    )}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.name}
                  />
                ))}
                <div className="ml-1 flex items-center gap-2 rounded-lg border p-1.5">
                  <div className="h-6 w-6 rounded" style={{ backgroundColor: primaryCss }} />
                  <span className="font-mono text-xs text-muted-foreground">{primaryColor}</span>
                </div>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Favicon</Label>
              <div className="flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted/30 transition-colors hover:border-primary/50"
                onClick={() => showToast.info('Upload favicon', 'File picker would open here.')}>
                <div className="text-center">
                  <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-1.5 text-xs text-muted-foreground">Favicon (32x32 / 16x16 ICO)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Live Preview</CardTitle>
              </div>
              <CardDescription>How the branding renders to students.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: primaryCss }}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/20 text-xs font-bold text-white">E</div>
                    <span className="font-display text-base font-bold text-white">{platformName}</span>
                  </div>
                  <span className="hidden text-xs text-white/80 sm:inline">{tagline}</span>
                </div>
                <div className="space-y-3 bg-muted/20 p-4">
                  <div className="h-3 w-3/4 rounded-full bg-muted" />
                  <div className="h-3 w-1/2 rounded-full bg-muted" />
                  <Button size="sm" className="text-white" style={{ backgroundColor: primaryCss }}>
                    Start Mock Test
                  </Button>
                  <Button variant="outline" size="sm" className="ml-2" style={{ borderColor: primaryCss, color: primaryCss }}>
                    View Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {darkMode ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
                  <CardTitle className="text-base">Dark Mode</CardTitle>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
              <CardDescription>Preview the student app in dark theme.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={cn('flex items-center justify-between rounded-lg border p-4 transition-colors', darkMode ? 'bg-zinc-900' : 'bg-white')}>
                <span className={cn('text-sm font-medium', darkMode ? 'text-zinc-100' : 'text-foreground')}>Theme preview</span>
                <div className={cn('rounded-md px-3 py-1.5 text-xs font-medium text-white')} style={{ backgroundColor: primaryCss }}>
                  {darkMode ? 'Dark' : 'Light'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Email Template Preview</CardTitle>
            </div>
            <CardDescription>Header rendering for outgoing emails.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <div className="flex items-center gap-3 px-4 py-4" style={{ backgroundColor: primaryCss }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-sm font-bold text-white">E</div>
                <div>
                  <p className="font-display text-sm font-bold text-white">{platformName}</p>
                  <p className="text-[11px] text-white/70">{tagline}</p>
                </div>
              </div>
              <div className="space-y-2 p-4">
                <div className="h-3 w-2/3 rounded-full bg-muted" />
                <div className="h-3 w-1/2 rounded-full bg-muted" />
                <div className="h-3 w-3/4 rounded-full bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Notification Templates</CardTitle>
            </div>
            <CardDescription>Editable templates for student communications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {EMAIL_TEMPLATES.map((t) => (
              <div key={t.name} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.subject}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0" onClick={() => openEditor(t)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {editing && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base">Edit {editing.name} Template</SheetTitle>
                <SheetDescription>Customize the subject line and body copy.</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <Label className="mb-1.5 block text-xs">Subject</Label>
                  <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Body</Label>
                  <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={8} />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Use variables like {'{{name}}'}, {'{{test}}'}, {'{{date}}'}, {'{{package}}'}, {'{{amount}}'}, {'{{coupon}}'}.
                  </p>
                </div>
              </div>
              <SheetFooter className="mt-6">
                <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                <Button size="sm" onClick={saveTemplate}><Save className="mr-1.5 h-3.5 w-3.5" /> Save Template</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <PrototypeNotice />
    </div>
  );
}
