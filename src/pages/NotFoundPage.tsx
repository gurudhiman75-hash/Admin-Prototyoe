import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h1 className="font-display text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">The page you are looking for doesn't exist or has been moved.</p>
      <Button asChild className="mt-6"><Link to="/dashboard">Back to Dashboard</Link></Button>
    </div>
  );
}
