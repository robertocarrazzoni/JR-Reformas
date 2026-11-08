"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 px-5 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-ink-900/10 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <TriangleAlert className="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink-950">
          Algo deu errado
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
          Não foi possível carregar esta página. Tente novamente em instantes.
          Se o problema persistir, fale com a equipe da JR Santana.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            Tentar novamente
          </Button>
          <LinkButton href="/" variant="outline">
            Voltar ao início
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
