import { LoaderCircle } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader = ({ message = 'Loading application...' }: PageLoaderProps) => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-6"
  >
    <LoaderCircle className="size-8 animate-spin text-primary" aria-hidden="true" />

    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);
