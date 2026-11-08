import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  neutral: "border-ink-900/10 bg-ink-100 text-ink-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  gold: "border-gold-400/30 bg-gold-50 text-gold-700",
  dark: "border-cream-50/15 bg-cream-50/10 text-cream-100",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
