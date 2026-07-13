import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { NAV_GROUPS } from '@/app/nav/navigation';

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const items: { label: string; path: string }[] = [];
  for (let i = 0; i < segments.length; i++) {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = NAV_GROUPS.flatMap((g) => g.items).find((it) => it.path === path)?.label
      ?? decodeURIComponent(segments[i]).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({ label, path });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex h-9 items-center gap-1 border-b bg-background px-4 text-xs text-muted-foreground md:px-8">
      <Link to="/dashboard" className="transition-colors hover:text-foreground">Home</Link>
      {items.map((it, i) => (
        <Fragment key={it.path}>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          {i === items.length - 1 ? (
            <span className="font-medium text-foreground">{it.label}</span>
          ) : (
            <Link to={it.path} className="capitalize transition-colors hover:text-foreground">{it.label}</Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}
