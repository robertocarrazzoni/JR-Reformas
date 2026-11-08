import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-900/15 bg-white/60 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold-100 text-gold-600">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-bold text-ink-950">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
