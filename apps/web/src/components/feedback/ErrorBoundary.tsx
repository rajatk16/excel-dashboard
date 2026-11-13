import { Component, type PropsWithChildren, type ReactNode } from "react";

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
    }
  }

  private readonly handleReload = (): void => {
    window.location.reload();
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="feedback-page">
          <section className="feedback-card" role="alert">
            <p className="eyebrow">Application error</p>

            <h1>Something went wrong.</h1>

            <p className="muted-text">
              The application encountered an unexpected error. Please reload the page to try again.
            </p>

            <button
              type="button"
              className="button button-primary"
              onClick={this.handleReload}
            >
              Reload application
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
