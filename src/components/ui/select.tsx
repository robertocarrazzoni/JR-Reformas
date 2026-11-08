import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-xl border border-ink-900/15 bg-white px-3.5 pr-10 text-base text-ink-900 shadow-sm outline-none transition-all focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15 disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-500 md:text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
        aria-hidden="true"
      />
    </div>
  );
});
