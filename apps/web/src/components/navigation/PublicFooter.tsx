import { Brand } from '@/components/common/Brand';

export const PublicFooter = () => (
  <footer className="border-t">
    <div className="page-container flex flex-col items-center justify-between gap-6 py-8 sm:flex-row">
      <Brand />

      <p className="text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Excel Dashboard.
      </p>
    </div>
  </footer>
);
