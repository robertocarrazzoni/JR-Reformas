import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldErrorProps {
  children?: ReactNode;
  className?: string;
}

export function FieldError({ children, className }: FieldErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p className={cn("mt-1.5 text-xs font-medium text-rose-600", className)}>
      {children}
    </p>
  );
}
