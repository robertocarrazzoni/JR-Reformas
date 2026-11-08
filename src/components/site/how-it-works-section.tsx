import { ArrowRight, CalendarCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { steps } from "@/lib/config";

export function HowItWorksSection({ bookingHref }: { bookingHref: string }) {
  return (
    <section
      id="como-funciona"
      className="relative scroll-mt-24 overflow-hidden bg-ink-950 py-20 text-cream-50 sm:py-24"
    >
      <div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden="true" />
      <div
        className="absolute right-0 top-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          align="center"
          tone="dark"
          eyebrow="Como funciona"
          title="Simples do primeiro contato à visita"
          description="Agende em poucos minutos e receba um atendimento próximo, sem enrolação e sem compromisso."
        />

        <ol className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-cream-50/10 bg-cream-50/[0.04] p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-400/40 bg-gold-400/10 font-display text-lg font-extrabold text-gold-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-gold-500/40 to-transparent" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-cream-50">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-200/70">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <LinkButton href={bookingHref} size="lg">
            <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            Quero agendar minha visita
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
