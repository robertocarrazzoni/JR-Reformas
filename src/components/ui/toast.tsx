"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastVariant = "success" | "error" | "info";

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastItem extends ToastInput {
  id: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const styles: Record<ToastVariant, { container: string; icon: string }> = {
  success: {
    container: "border-emerald-200 bg-white",
    icon: "text-emerald-600",
  },
  error: {
    container: "border-rose-200 bg-white",
    icon: "text-rose-600",
  },
  info: {
    container: "border-ink-900/10 bg-white",
    icon: "text-gold-600",
  },
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "info",
      };

      setItems((previous) => [...previous.slice(-3), item]);

      const timer = window.setTimeout(() => dismiss(id), 5000);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const activeTimers = timers.current;

    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
      >
        {items.map((item) => {
          const Icon = icons[item.variant];
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-xl border p-4 shadow-lg shadow-ink-950/10",
                styles[item.variant].container,
              )}
            >
              <Icon
                className={cn("mt-0.5 h-5 w-5 shrink-0", styles[item.variant].icon)}
                aria-hidden="true"
              />
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-ink-950">{item.title}</p>
                {item.description ? (
                  <p className="text-sm leading-relaxed text-ink-500">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Fechar notificação"
                className="rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-950/5 hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-gold-500"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }

  return context;
}
