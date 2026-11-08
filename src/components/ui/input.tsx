import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-ink-900/15 bg-white px-3.5 text-base text-ink-900 shadow-sm outline-none transition-all placeholder:text-ink-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15 disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-500 md:text-sm",
        className,
      )}
      {...props}
    />
  );
});
