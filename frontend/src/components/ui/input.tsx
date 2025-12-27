import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          'file:text-slate-900 dark:file:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 selection:bg-blue-200 dark:selection:bg-blue-800 selection:text-blue-900 dark:selection:text-blue-100 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 h-11 w-full min-w-0 rounded-lg border px-4 py-2 text-sm shadow-sm hover:shadow-md hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'aria-invalid:border-red-500 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
