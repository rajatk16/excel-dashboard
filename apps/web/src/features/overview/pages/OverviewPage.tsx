import { ChartColumnIncreasing, Database, Info, LayoutDashboard, ListFilter } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@excel-dashboard/ui/components/alert';
import { Badge } from '@excel-dashboard/ui/components/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@excel-dashboard/ui/components/card';

import { usePageTitle } from '@/lib/utils/pageTitle';

const CAPABILITIES = [
  {
    title: 'Datasets',
    description: 'Import spreadsheets and manage structured, versioned datasets.',
    icon: Database,
  },
  {
    title: 'Queries',
    description: 'Explore your datasets through a visual query builder.',
    icon: ListFilter,
  },
  {
    title: 'Visualizations',
    description: 'Transform analytical results into interactive charts.',
    icon: ChartColumnIncreasing,
  },
  {
    title: 'Dashboards',
    description: 'Compose, publish, and share analytics dashboards.',
    icon: LayoutDashboard,
  },
] as const;

export const Component = () => {
  usePageTitle('Overview');

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">Application / Overview</p>

        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>

        <p className="text-muted-foreground">Your analytics workspace starts here.</p>
      </header>

      <Alert>
        <Info aria-hidden="true" />

        <AlertTitle>Development preview</AlertTitle>

        <AlertDescription>
          The application shell and design system are ready. Authentication, workspace management,
          spreadsheet ingestion, and analytics will be introduced in subsequent phases.
        </AlertDescription>
      </Alert>

      <section aria-labelledby="capabilities-heading" className="space-y-5">
        <div>
          <h2 id="capabilities-heading" className="text-xl font-semibold tracking-tight">
            Platform capabilities
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">Explore what we are building.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CAPABILITIES.map((capability) => {
            const Icon = capability.icon;

            return (
              <Card key={capability.title} className="shadow-none">
                <CardHeader className="gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>

                    <Badge variant="secondary">Planned</Badge>
                  </div>

                  <CardTitle className="text-base">
                    <h3>{capability.title}</h3>
                  </CardTitle>

                  <CardDescription>{capability.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
