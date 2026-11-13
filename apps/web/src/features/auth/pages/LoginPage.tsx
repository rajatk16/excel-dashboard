import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@excel-dashboard/ui/components/alert';
import { Button } from '@excel-dashboard/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@excel-dashboard/ui/components/card';

import { ROUTE_PATHS } from '@/app/router/routePaths';
import { usePageTitle } from '@/lib/utils/pageTitle';

export function Component() {
  usePageTitle('Sign in');

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          <h1>Welcome back</h1>
        </CardTitle>

        <CardDescription>Sign in to access your datasets and dashboards.</CardDescription>
      </CardHeader>

      <CardContent>
        <Alert>
          <Info aria-hidden="true" />

          <AlertTitle>Authentication coming soon</AlertTitle>

          <AlertDescription>
            Sign-in functionality will be introduced during the identity implementation phase.
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter className="flex-col gap-4">
        <Button variant="outline" className="w-full" asChild>
          <Link to={ROUTE_PATHS.HOME}>Return home</Link>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New to Excel Dashboard?{' '}
          <Link to={ROUTE_PATHS.REGISTER} className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
