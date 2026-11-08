import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  tone?: "emerald" | "gold" | "ink" | "rose";
}

const tones = {
  emerald: "bg-emerald-50 text-emerald-600",
  gold: "bg-gold-50 text-gold-600",
  ink: "bg-ink-950 text-gold-400",
  rose: "bg-rose-50 text-rose-600",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "gold",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <span
          className={cn(
            "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            tones[tone],
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl font-extrabold leading-tight text-ink-950">
            {value}
          </p>
          <p className="text-xs font-semibold text-ink-600">{label}</p>
          {hint ? <p className="mt-0.5 text-[11px] text-ink-400">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
