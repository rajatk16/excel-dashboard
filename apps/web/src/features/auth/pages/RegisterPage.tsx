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

export const Component = () => {
  usePageTitle('Create an account');

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          <h1>Create an account</h1>
        </CardTitle>

        <CardDescription>Start building interactive analytics dashboards.</CardDescription>
      </CardHeader>

      <CardContent>
        <Alert>
          <Info aria-hidden="true" />

          <AlertTitle>Registration coming soon</AlertTitle>

          <AlertDescription>
            Account registration will become available after authentication is implemented.
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter className="flex-col gap-4">
        <Button variant="outline" className="w-full" asChild>
          <Link to={ROUTE_PATHS.HOME}>Return home</Link>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to={ROUTE_PATHS.LOGIN} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
