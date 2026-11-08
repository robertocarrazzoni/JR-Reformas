import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-100 text-gold-600">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
          Erro 404
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-950">
          Página não encontrada
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-500">
          O endereço que você tentou acessar não existe ou foi movido. Volte ao
          início para continuar navegando.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href="/">Voltar ao início</LinkButton>
          <LinkButton href="/contato" variant="outline">
            Falar com a equipe
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
