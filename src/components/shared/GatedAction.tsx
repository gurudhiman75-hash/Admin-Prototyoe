import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import type { ReactNode } from 'react';

interface GatedActionProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export function GatedAction({ permission, children, fallback = null, className }: GatedActionProps) {
  const { hasPermission } = usePrototypeStore();
  if (hasPermission(permission)) return <>{children}</>;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('inline-flex cursor-not-allowed opacity-50', className)} tabIndex={0}>
            {fallback ?? children}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Your role lacks the "{permission}" permission</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface GatedButtonProps {
  permission: string;
  onClick: () => void;
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

export function GatedButton({ permission, onClick, children, variant = 'default', size = 'sm', className, disabled }: GatedButtonProps) {
  const { hasPermission } = usePrototypeStore();
  const allowed = hasPermission(permission);
  if (allowed) {
    return (
      <Button variant={variant} size={size} className={className} disabled={disabled} onClick={onClick}>
        {children}
      </Button>
    );
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Button variant={variant} size={size} className={cn('cursor-not-allowed opacity-50', className)} disabled>
              {children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Requires "{permission}" permission</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
