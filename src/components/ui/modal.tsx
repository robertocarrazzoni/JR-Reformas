"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-lg animate-fade-up rounded-2xl border border-ink-900/10 bg-white shadow-2xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-900/10 p-5 sm:p-6">
          <div>
            <h2
              id={titleId}
              className="font-display text-lg font-bold tracking-tight text-ink-950"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="mt-1 text-sm leading-relaxed text-ink-500"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-950/5 hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-gold-500"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
        {footer ? (
          <div className="flex flex-wrap justify-end gap-3 border-t border-ink-900/10 p-5 sm:p-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
