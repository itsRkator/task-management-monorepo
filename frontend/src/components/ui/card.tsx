import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-800 py-6 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
      {...props}
    />
  );
};

const CardHeader = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-3 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 [.border-b]:border-slate-200 dark:[.border-b]:border-slate-800',
        className
      )}
      {...props}
    />
  );
};

const CardTitle = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'leading-tight font-semibold text-slate-900 dark:text-slate-100 text-lg',
        className
      )}
      {...props}
    />
  );
};

const CardDescription = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="card-description"
      className={cn(
        'text-slate-600 dark:text-slate-400 text-sm leading-relaxed',
        className
      )}
      {...props}
    />
  );
};

const CardAction = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  );
};

const CardContent = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6 text-slate-700 dark:text-slate-300', className)}
      {...props}
    />
  );
};

const CardFooter = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center px-6 [.border-t]:pt-6 [.border-t]:border-slate-200 dark:[.border-t]:border-slate-800',
        className
      )}
      {...props}
    />
  );
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
