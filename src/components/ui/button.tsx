import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-gold-500 text-ink-950 shadow-sm shadow-gold-500/30 hover:bg-gold-400",
  secondary: "bg-ink-950 text-cream-50 hover:bg-ink-800",
  outline:
    "border border-ink-900/20 bg-transparent text-ink-900 hover:border-ink-900/40 hover:bg-ink-950/5",
  ghost: "text-ink-600 hover:bg-ink-950/5 hover:text-ink-900",
  danger: "bg-rose-600 text-white shadow-sm shadow-rose-600/25 hover:bg-rose-700",
  "gold-outline":
    "border border-gold-400/50 bg-transparent text-gold-200 hover:bg-gold-400/10",
  "dark-outline":
    "border border-cream-50/25 bg-transparent text-cream-50 hover:bg-cream-50/10",
} as const;

const sizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11",
} as const;

const baseClasses =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 disabled:pointer-events-none disabled:opacity-60";

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
} = {}) {
  return cn(baseClasses, variants[variant], sizes[size], className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonClasses({ variant, size, className })}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {children}
      </button>
    );
  },
);
