import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const variants = {
  info: {
    container: "border-sky-200 bg-sky-50 text-sky-900",
    icon: Info,
  },
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: CheckCircle2,
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-900",
    icon: TriangleAlert,
  },
  error: {
    container: "border-rose-200 bg-rose-50 text-rose-900",
    icon: AlertCircle,
  },
} as const;

interface AlertProps {
  variant?: keyof typeof variants;
  title?: string;
  children?: ReactNode;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) {
  const { container, icon: Icon } = variants[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm",
        container,
        className,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="leading-relaxed opacity-90">{children}</div> : null}
      </div>
    </div>
  );
}
