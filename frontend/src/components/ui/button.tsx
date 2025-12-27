import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg focus-visible:ring-blue-500 px-4 py-2",
        create: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-md hover:shadow-lg focus-visible:ring-emerald-500 px-4 py-2",
        edit: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg focus-visible:ring-blue-500 px-4 py-2",
        info: "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 shadow-md hover:shadow-lg focus-visible:ring-sky-500 px-4 py-2",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg focus-visible:ring-red-500 px-4 py-2",
        outline:
          "border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 active:bg-slate-100 dark:active:bg-slate-700 shadow-sm hover:shadow-md focus-visible:ring-slate-500 px-4 py-2",
        secondary:
          "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 shadow-sm hover:shadow-md focus-visible:ring-slate-500 px-4 py-2",
        ghost:
          "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 active:bg-slate-200 dark:active:bg-slate-700 focus-visible:ring-slate-500 px-4 py-2",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline hover:text-blue-700 dark:hover:text-blue-300 active:text-blue-800 dark:active:text-blue-200 focus-visible:ring-blue-500 px-0 py-0",
      },
      size: {
        default: "h-10",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        icon: "size-10 px-0",
        "icon-sm": "size-8 px-0",
        "icon-lg": "size-12 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button }
