import * as React from 'react';

import { cn } from '@/lib/utils';

const Table = ({ className, children, ...props }: React.ComponentProps<'table'>) => {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800"
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({
  className,
  ...props
}: React.ComponentProps<'thead'>) => {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        'bg-slate-50 dark:bg-slate-900/50 [&_tr]:border-b border-slate-200 dark:border-slate-800',
        className
      )}
      {...props}
    />
  );
};

const TableBody = ({ className, ...props }: React.ComponentProps<'tbody'>) => {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        '[&_tr:last-child]:border-0 [&_tr]:border-b border-slate-200 dark:border-slate-800',
        className
      )}
      {...props}
    />
  );
};

const TableFooter = ({
  className,
  ...props
}: React.ComponentProps<'tfoot'>) => {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  );
};

const TableRow = ({ className, ...props }: React.ComponentProps<'tr'>) => {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'hover:bg-slate-50 dark:hover:bg-slate-900/50 data-[state=selected]:bg-blue-50 dark:data-[state=selected]:bg-blue-900/20 border-b border-slate-200 dark:border-slate-800 transition-colors duration-150 cursor-default',
        className
      )}
      {...props}
    />
  );
};

const TableHead = ({ className, ...props }: React.ComponentProps<'th'>) => {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-12 px-4 text-left align-middle font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
};

const TableCell = ({ className, ...props }: React.ComponentProps<'td'>) => {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-4 align-middle text-slate-900 dark:text-slate-100 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
};

const TableCaption = ({
  className,
  ...props
}: React.ComponentProps<'caption'>) => {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        'mt-4 text-sm text-slate-600 dark:text-slate-400',
        className
      )}
      {...props}
    />
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
