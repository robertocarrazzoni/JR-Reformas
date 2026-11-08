import type { Metadata } from "next";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { ServiceIcon } from "@/components/site/service-icon";
import { LinkButton } from "@/components/ui/link-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { services, whatsappLink } from "@/lib/config";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Reformas residenciais, construções, ampliações, acabamentos, instalações, pintura e planejamento de obras.",
};

export default async function ServicesPage() {
  const user = await getSessionUser();
  const bookingHref = user ? "/agendar" : "/login?next=%2Fagendar";

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 py-20 text-cream-50 sm:py-24">
        <div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden="true" />
        <div
          className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
          <SectionHeading
            tone="dark"
            eyebrow="Serviços"
            title="Soluções completas para a sua obra"
            description="Da reforma pontual à construção completa, cada serviço é planejado para entregar qualidade, durabilidade e o acabamento que você espera."
          />
        </div>
      </section>

      <section className="bg-cream-50 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
          {services.map((service, index) => (
            <article
              key={service.slug}
              id={service.slug}
              className="scroll-mt-28 rounded-2xl border border-ink-900/10 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-start">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-950 text-gold-400">
                  <ServiceIcon name={service.icon} className="h-7 w-7" />
                </span>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-600">
                    Serviço {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-ink-950 sm:text-2xl">
                    {service.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
                    {service.description}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {service.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600"
                      >
                        <Check className="h-3.5 w-3.5 text-gold-600" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={whatsappLink(
                    `Olá! Gostaria de solicitar um orçamento para ${service.title.toLowerCase()}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gold-500/40 px-4 text-sm font-semibold text-gold-700 transition-colors hover:bg-gold-50"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Solicitar orçamento
                </a>
              </div>
            </article>
          ))}

          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gold-500/25 bg-gold-50 p-6 sm:flex-row sm:p-8">
            <div>
              <h2 className="font-display text-xl font-bold text-ink-950">
                Não encontrou o serviço que precisa?
              </h2>
              <p className="mt-1 text-sm text-ink-600">
                Conte o que você tem em mente. A equipe avalia o escopo e orienta
                o melhor caminho.
              </p>
            </div>
            <LinkButton href="/contato" variant="secondary">
              Falar com a equipe
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
          </div>
        </div>
      </section>

      <CtaBand bookingHref={bookingHref} />
    </>
  );
}
