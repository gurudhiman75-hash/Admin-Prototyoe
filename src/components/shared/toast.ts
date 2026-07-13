import { toast } from 'sonner';

export const showToast = {
  success: (msg: string, desc?: string) => toast.success(msg, desc ? { description: desc } : undefined),
  error: (msg: string, desc?: string) => toast.error(msg, desc ? { description: desc } : undefined),
  info: (msg: string, desc?: string) => toast.info(msg, desc ? { description: desc } : undefined),
  warning: (msg: string, desc?: string) => toast.warning(msg, desc ? { description: desc } : undefined),
};
