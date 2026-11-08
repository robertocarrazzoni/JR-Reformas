import { ArrowRight, CalendarCheck, MessageCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { whatsappLink } from "@/lib/config";

export function CtaBand({ bookingHref }: { bookingHref: string }) {
  return (
    <section className="bg-cream-50 pb-20 sm:pb-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-14 text-cream-50 shadow-2xl shadow-ink-950/20 sm:px-12">
          <div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden="true" />
          <div
            className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-gold-500/20"
            aria-hidden="true"
          />
          <div
            className="absolute -right-10 -top-14 h-48 w-48 rounded-full border border-gold-500/20"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-300">
                Vamos tirar o projeto do papel?
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                Agende uma visita técnica e receba um orçamento sem compromisso.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream-200/70">
                Conte o que você precisa. A JR Santana organiza os próximos passos
                com clareza, do planejamento à execução.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <LinkButton href={bookingHref} size="lg">
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                Agendar visita
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LinkButton>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 select-none items-center justify-center gap-2 rounded-xl border border-gold-400/50 px-6 text-base font-semibold text-gold-200 transition-all hover:bg-gold-400/10 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
