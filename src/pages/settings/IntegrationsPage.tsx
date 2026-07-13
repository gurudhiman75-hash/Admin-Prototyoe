import { useState } from 'react';
import {
  Plug, CheckCircle2, Settings, RefreshCw, Copy, Key, Webhook,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { showToast } from '@/components/shared/toast';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type IntegrationCategory = 'Payment Gateway' | 'Push Notifications' | 'Email' | 'SMS' | 'Messaging' | 'Analytics' | 'File Storage' | 'AI';

interface Integration {
  name: string; category: IntegrationCategory; connected: boolean; description: string; lastSync: string;
}

const INTEGRATIONS: Integration[] = [
  { name: 'Razorpay', category: 'Payment Gateway', connected: true, description: 'Primary payment gateway for orders and subscriptions.', lastSync: '2 min ago' },
  { name: 'Cashfree', category: 'Payment Gateway', connected: true, description: 'Secondary payment gateway with UPI and EMI support.', lastSync: '5 min ago' },
  { name: 'Firebase Cloud Messaging', category: 'Push Notifications', connected: true, description: 'Push notification delivery to Android and iOS apps.', lastSync: '1 min ago' },
  { name: 'SendGrid', category: 'Email', connected: true, description: 'Transactional email delivery and template rendering.', lastSync: '8 min ago' },
  { name: 'Twilio', category: 'SMS', connected: false, description: 'SMS notifications for OTPs and payment alerts.', lastSync: 'Never' },
  { name: 'WhatsApp Business API', category: 'Messaging', connected: false, description: 'WhatsApp messaging for reminders and promotions.', lastSync: 'Never' },
  { name: 'Google Analytics', category: 'Analytics', connected: true, description: 'Web and app analytics event tracking.', lastSync: '12 min ago' },
  { name: 'AWS S3', category: 'File Storage', connected: true, description: 'Object storage for media assets and question images.', lastSync: '3 min ago' },
  { name: 'OpenAI', category: 'AI', connected: true, description: 'AI-powered question generation and explanation drafting.', lastSync: '6 min ago' },
];

const WEBHOOKS = [
  { id: 'WH-01', event: 'order.paid', url: 'https://api.examtree.in/webhooks/orders', status: 'Active' as const },
  { id: 'WH-02', event: 'payment.refunded', url: 'https://api.examtree.in/webhooks/refunds', status: 'Active' as const },
  { id: 'WH-03', event: 'student.registered', url: 'https://api.examtree.in/webhooks/students', status: 'Active' as const },
  { id: 'WH-04', event: 'test.published', url: 'https://api.examtree.in/webhooks/tests', status: 'Paused' as const },
];

const API_KEYS = [
  { id: 'AK-01', label: 'Razorpay Secret', masked: 'rzp_live_••••••••••••4a7f', created: '2026-01-15' },
  { id: 'AK-02', label: 'SendGrid API Key', masked: 'SG.••••••••••••••••.c9e2', created: '2026-02-20' },
  { id: 'AK-03', label: 'OpenAI API Key', masked: 'sk-proj-••••••••••••8m3x', created: '2026-03-10' },
  { id: 'AK-04', label: 'AWS Access Key', masked: 'AKIA••••••••••••7qWp', created: '2026-01-08' },
];

function categoryTone(c: IntegrationCategory) {
  switch (c) {
    case 'Payment Gateway': return 'primary';
    case 'Push Notifications': return 'info';
    case 'Email': return 'info';
    case 'SMS': return 'accent';
    case 'Messaging': return 'accent';
    case 'Analytics': return 'success';
    case 'File Storage': return 'warning';
    case 'AI': return 'default';
    default: return 'neutral';
  }
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

export function IntegrationsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyKey = (id: string, masked: string) => {
    navigator.clipboard?.writeText(masked).then(
      () => {
        setCopied(id);
        showToast.success('Copied', 'API key copied to clipboard (masked).');
        setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
      },
      () => showToast.error('Copy failed', 'Clipboard access was denied.'),
    );
  };

  const rotateKey = (label: string) => {
    showToast.warning('Key rotation', `${label} rotation initiated. Old key expires in 24h.`);
  };

  const connectedCount = INTEGRATIONS.filter((i) => i.connected).length;

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Connect external services and gateways."
        icon={<Plug className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5 text-xs">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="font-medium text-foreground">{connectedCount}</span>
            <span className="text-muted-foreground">of {INTEGRATIONS.length} connected</span>
          </div>
        }
      />

      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Services</h2>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((int) => (
          <Card key={int.name} className={cn(!int.connected && 'opacity-80')}>
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{int.name}</CardTitle>
                {int.connected ? (
                  <StatusBadge tone="success" dot className="shrink-0 text-[10px]">Connected</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral" dot className="shrink-0 text-[10px]">Not Connected</StatusBadge>
                )}
              </div>
              <StatusBadge tone={categoryTone(int.category)} className="w-fit text-[10px]">{int.category}</StatusBadge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground">{int.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Last sync: <span className="font-medium text-foreground">{int.lastSync}</span></span>
              </div>
            </CardContent>
            <CardFooter className="justify-end pt-0">
              {int.connected ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => showToast.info('Sync now', `Manual sync triggered for ${int.name}.`)}>
                    <RefreshCw className="mr-1 h-3.5 w-3.5" /> Sync
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => showToast.info('Configure', `Opening settings for ${int.name}.`)}>
                    <Settings className="mr-1 h-3.5 w-3.5" /> Configure
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => showToast.success('Connection started', `Connecting to ${int.name}...`)}>
                  <Plug className="mr-1 h-3.5 w-3.5" /> Connect
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Webhooks</CardTitle>
            </div>
            <CardDescription>Endpoint URLs that receive platform event payloads.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {WEBHOOKS.map((w) => (
              <div key={w.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">{w.event}</Badge>
                    <StatusBadge tone={w.status === 'Active' ? 'success' : 'warning'} dot className="text-[10px]">{w.status}</StatusBadge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyKey(w.id, w.url)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="mt-2 truncate font-mono text-xs text-muted-foreground">{w.url}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">API Keys</CardTitle>
            </div>
            <CardDescription>Masked credentials for connected services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {API_KEYS.map((k) => (
              <div key={k.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{k.label}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{k.masked}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyKey(k.id, k.masked)} aria-label="Copy key">
                      {copied === k.id ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => rotateKey(k.label)} aria-label="Rotate key">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">Created {k.created}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <PrototypeNotice />
    </div>
  );
}
