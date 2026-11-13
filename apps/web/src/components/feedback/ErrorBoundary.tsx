import { AlertCircle, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Component } from 'react';

import { Button } from '@excel-dashboard/ui/components/button';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  private readonly handleReload = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
          <section role="alert" className="flex max-w-md flex-col items-center gap-5 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="size-8" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">Something went wrong.</h1>

            <p className="text-muted-foreground">
              The application encountered an unexpected error. Please reload the page to try again.
            </p>

            <Button onClick={this.handleReload}>
              <RefreshCw aria-hidden="true" />
              Reload application
            </Button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
