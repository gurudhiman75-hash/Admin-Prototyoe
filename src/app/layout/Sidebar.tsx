import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown, GraduationCap, PanelLeftClose, PanelLeft } from 'lucide-react';
import { NAV_GROUPS } from '@/app/nav/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps { collapsed: boolean; onNavigate?: () => void }

export function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_GROUPS.map((g) => [g.id, true]))
  );

  const toggleGroup = (id: string) => setOpenGroups((p) => ({ ...p, [id]: !p[id] }));

  return (
    <aside className={cn('flex h-full flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300', collapsed ? 'w-[68px]' : 'w-64')}>
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-active text-primary-foreground shadow-lg shadow-primary/20">
          <GraduationCap className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight animate-fade-in">
            <span className="font-display text-base font-bold tracking-tight text-white">ExamTree</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/60">Admin Console</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {NAV_GROUPS.map((group) => {
          const open = openGroups[group.id] && !collapsed;
          return (
            <div key={group.id} className="mb-1">
              {!collapsed && (
                <button onClick={() => toggleGroup(group.id)} className="flex w-full items-center justify-between px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45 transition-colors hover:text-sidebar-foreground/70">
                  {group.label}
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openGroups[group.id] ? '' : '-rotate-90')} />
                </button>
              )}
              {collapsed && <div className="mx-3 my-2 border-t border-sidebar-border" />}
              <div className={cn('space-y-0.5 px-3', open ? '' : 'hidden')}>
                {group.items.map((item) => (
                  <NavLink key={item.path} to={item.path} onClick={onNavigate} title={collapsed ? item.label : undefined}
                    className={({ isActive }) => cn('group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-all',
                      isActive ? 'bg-sidebar-active text-primary-foreground shadow-sm' : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')}>
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />}
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {!collapsed && item.badge && <span className="ml-auto rounded-full bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-semibold text-sidebar-accent-foreground">{item.badge}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className={cn('flex items-center gap-2 rounded-lg bg-sidebar-accent/60 p-2.5 text-xs text-sidebar-foreground/70', collapsed && 'justify-center')}>
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-success" />
          {!collapsed && <span>All systems operational</span>}
        </div>
      </div>
    </aside>
  );
}

export function SidebarCollapseToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
      {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
    </button>
  );
}
