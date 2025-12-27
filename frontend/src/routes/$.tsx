import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <Card className="max-w-lg w-full text-center">
        <CardHeader className="pb-6">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-base text-slate-600 dark:text-slate-400">
            The page you're looking for doesn't exist or has been moved. Please
            check the URL or return to the home page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate({ to: '/' })}
              variant="default"
              className="w-full sm:w-auto"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            <Button
              onClick={() => globalThis.history.back()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
});

export default NotFoundPage;
