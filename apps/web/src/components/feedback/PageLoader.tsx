interface PageLoaderProps {
  message?: string;
}

export const PageLoader = ({
  message = 'Loading application...'
}: PageLoaderProps) => (
  <div className="page-loader" role="status" aria-live="polite">
    <span className="spinner" aria-hidden="true" />
    <p>{message}</p>
  </div>
);
