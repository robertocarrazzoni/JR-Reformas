import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { siteConfig, whatsappLink } from "@/lib/config";

const trustItems = [
  "Atendimento personalizado",
  "Orçamento sem compromisso",
  "Acompanhamento da obra",
];

export function Hero({ bookingHref }: { bookingHref: string }) {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-ink-950 text-cream-50"
    >
      <div className="absolute inset-0 bg-blueprint opacity-50" aria-hidden="true" />
      <div
        className="absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-gold-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-gold-700/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-28 lg:pt-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Construções e Reformas
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Construindo sonhos,{" "}
            <span className="text-gradient-gold">renovando espaços.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-200/75 sm:text-lg">
            Da primeira conversa ao acabamento final, a JR Santana cuida da sua
            obra com qualidade, compromisso e confiança — do jeito que o seu
            projeto merece.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href={bookingHref} size="lg">
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              Agendar avaliação
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 select-none items-center justify-center gap-2 rounded-xl border border-gold-400/50 px-6 text-base font-semibold text-gold-200 transition-all hover:bg-gold-400/10 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Falar no WhatsApp
            </a>
          </div>

          <ul className="mt-10 flex flex-col gap-2.5 text-sm text-cream-200/70 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {trustItems.map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gold-400/15 text-gold-300">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[26rem] animate-fade-in">
          <div
            className="absolute inset-0 rounded-full border border-gold-400/20"
            aria-hidden="true"
          />
          <div
            className="absolute inset-6 rounded-full border border-gold-400/15"
            aria-hidden="true"
          />
          <div
            className="absolute inset-10 rounded-full bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 shadow-2xl shadow-black/60 ring-1 ring-gold-500/40 sm:inset-12"
            aria-hidden="true"
          />
          <div className="absolute inset-10 flex items-center justify-center p-6 sm:inset-12 sm:p-8">
            <div className="relative aspect-square w-full overflow-hidden rounded-full ring-1 ring-gold-500/30">
              <Image
                src="/brand/logo.jpg"
                alt={siteConfig.fullName}
                fill
                sizes="(max-width: 1024px) 70vw, 320px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="absolute -left-2 top-6 hidden items-center gap-2 rounded-xl border border-gold-400/25 bg-ink-900/90 px-3.5 py-2.5 shadow-lg backdrop-blur sm:flex">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/15 text-gold-300">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-cream-50">Qualidade</p>
              <p className="text-[11px] text-cream-200/60">em cada etapa</p>
            </div>
          </div>

          <div className="absolute -right-1 bottom-8 hidden items-center gap-2 rounded-xl border border-gold-400/25 bg-ink-900/90 px-3.5 py-2.5 shadow-lg backdrop-blur sm:flex">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/15 text-gold-300">
              <Check className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-cream-50">Compromisso</p>
              <p className="text-[11px] text-cream-200/60">com o seu prazo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-cream-50/10">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-cream-200/45 sm:px-8">
          <span>Qualidade</span>
          <span className="hidden h-1 w-1 rounded-full bg-gold-500 sm:block" />
          <span>Compromisso</span>
          <span className="hidden h-1 w-1 rounded-full bg-gold-500 sm:block" />
          <span>Confiança</span>
        </div>
      </div>
    </section>
  );
}
