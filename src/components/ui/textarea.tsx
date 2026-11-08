import * as React from "react";
import { cn } from "@/lib/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full resize-y rounded-xl border border-ink-900/15 bg-white px-3.5 py-3 text-base text-ink-900 shadow-sm outline-none transition-all placeholder:text-ink-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15 disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-500 md:text-sm",
        className,
      )}
      {...props}
    />
  );
});
