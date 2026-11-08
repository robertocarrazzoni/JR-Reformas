import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceIcon } from "@/components/site/service-icon";
import { services } from "@/lib/config";

export function ServicesSection() {
  return (
    <section id="servicos" className="scroll-mt-24 bg-cream-50 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="O que fazemos"
            title="Serviços para construir e renovar"
            description="Soluções completas para transformar o seu espaço, com planejamento, execução cuidadosa e acabamento que valoriza cada ambiente."
          />
          <Link
            href="/servicos"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gold-700 transition-colors hover:text-gold-600"
          >
            Ver todos os serviços
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.slug}
              className="group flex flex-col rounded-2xl border border-ink-900/10 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-lg hover:shadow-ink-950/5"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink-950 text-gold-400 transition-colors group-hover:bg-gold-500 group-hover:text-ink-950">
                <ServiceIcon name={service.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink-950">
                {service.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                {service.shortDescription}
              </p>
              <ul className="mt-4 space-y-1.5">
                {service.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-2 text-xs font-medium text-ink-600"
                  >
                    <Check className="h-3.5 w-3.5 text-gold-600" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link
                href={`/servicos#${service.slug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700 transition-colors hover:text-gold-600"
              >
                Saiba mais
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
