import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-xl font-bold text-slate-900 dark:text-slate-50 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-200"
              >
                Task Management
              </Link>
              <div className="hidden sm:flex sm:space-x-1">
                <Link
                  to="/"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  activeProps={{
                    className:
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold',
                  }}
                >
                  Tasks
                </Link>
                <Link
                  to="/tasks/new"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  activeProps={{
                    className:
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold',
                  }}
                >
                  New Task
                </Link>
              </div>
            </div>
            <div className="sm:hidden">
              <Link
                to="/tasks/new"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200"
              >
                New
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  ),
});
