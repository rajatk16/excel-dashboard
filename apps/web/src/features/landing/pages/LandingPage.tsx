import {
  ArrowRight,
  ChartColumnIncreasing,
  FileSpreadsheet,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@excel-dashboard/ui/components/badge';
import { Button } from '@excel-dashboard/ui/components/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@excel-dashboard/ui/components/card';

import { ROUTE_PATHS } from '@/app/router/routePaths';
import { usePageTitle } from '@/lib/utils/pageTitle';

const FEATURES = [
  {
    title: 'Import spreadsheets',
    description: 'Bring your Excel and CSV files into a structured analytics workspace.',
    icon: FileSpreadsheet,
  },
  {
    title: 'Explore and visualize',
    description:
      'Discover patterns and create meaningful visualizations using a visual query builder.',
    icon: ChartColumnIncreasing,
  },
  {
    title: 'Build dashboards',
    description: 'Compose interactive dashboards and share insights with your team.',
    icon: LayoutDashboard,
  },
] as const;

export function Component() {
  usePageTitle();

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-primary)/0.08,transparent_60%)]"
        />

        <div className="page-container flex flex-col items-center py-20 text-center sm:py-28 lg:py-36">
          <Badge variant="secondary" className="mb-6 gap-2 border border-border px-4 py-1.5">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            Spreadsheet analytics, simplified
          </Badge>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-7xl">
            Your spreadsheets.
            <span className="block text-primary">Transformed into insights.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Turn Excel and CSV files into interactive analytics dashboards. Explore your data,
            discover insights, and share them with your team.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to={ROUTE_PATHS.REGISTER}>
                Get started
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link to={ROUTE_PATHS.APP}>Explore app</Link>
            </Button>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">Currently in development.</p>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="border-y bg-muted/30">
        <div className="page-container py-16 sm:py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium text-primary">The platform</p>

            <h2 id="features-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              From spreadsheets to dashboards
            </h2>

            <p className="mt-4 leading-relaxed text-muted-foreground">
              Everything you need to transform raw data into meaningful analytics.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className="transition-shadow hover:shadow-md">
                  <CardHeader className="gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" aria-hidden="true" />
                    </div>

                    <CardTitle className="text-lg">
                      <h3>{feature.title}</h3>
                    </CardTitle>

                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-container py-16 sm:py-24">
        <div className="rounded-2xl border bg-card px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Make your spreadsheet data more useful.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Explore the foundation of our analytics platform. More capabilities will be introduced
            as development progresses.
          </p>

          <Button className="mt-6" size="lg" asChild>
            <Link to={ROUTE_PATHS.APP}>
              Explore the platform
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
