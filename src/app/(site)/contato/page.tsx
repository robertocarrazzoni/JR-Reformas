import type { Metadata } from "next";
import {
  AtSign,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { WhatsAppQuoteForm } from "@/components/site/whatsapp-quote-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig, whatsappLink } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a JR Santana pelo WhatsApp, Instagram ou e-mail e solicite seu orçamento sem compromisso.",
};

const contactCards = [
  {
    title: "WhatsApp",
    description: "Resposta rápida para orçamentos e dúvidas.",
    icon: MessageCircle,
    value: "Iniciar conversa",
    href: whatsappLink(),
    external: true,
  },
  {
    title: "Instagram",
    description: "Acompanhe projetos, bastidores e novidades.",
    icon: AtSign,
    value: siteConfig.instagramHandle,
    href: siteConfig.instagram,
    external: true,
  },
  {
    title: "E-mail",
    description: "Para propostas, parcerias e documentos.",
    icon: Mail,
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    external: false,
  },
  {
    title: "Telefone",
    description: "Atendimento em horário comercial.",
    icon: Phone,
    value: siteConfig.phoneDisplay,
    href: `tel:${siteConfig.phoneDisplay.replace(/\D/g, "")}`,
    external: false,
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 py-20 text-cream-50 sm:py-24">
        <div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
          <SectionHeading
            tone="dark"
            eyebrow="Contato"
            title="Vamos conversar sobre o seu projeto"
            description="Tire dúvidas, peça um orçamento ou agende uma visita técnica. A equipe da JR Santana está pronta para ajudar."
          />
        </div>
      </section>

      <section className="bg-cream-50 py-16 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {contactCards.map((card) => {
                const Icon = card.icon;

                return (
                  <a
                    key={card.title}
                    href={card.href}
                    {...(card.external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                    className="group rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-400/60 hover:shadow-md"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h2 className="mt-4 font-display text-base font-bold text-ink-950">
                      {card.title}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink-500">
                      {card.description}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-gold-700 group-hover:text-gold-600">
                      {card.value}
                    </p>
                  </a>
                );
              })}
            </div>

            <div className="mt-4 space-y-3 rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-ink-950">Atendimento</p>
                  <p className="text-sm text-ink-500">{siteConfig.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-ink-950">Horário</p>
                  <p className="text-sm text-ink-500">
                    {siteConfig.hours} · {siteConfig.responseTime}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <WhatsAppQuoteForm />
        </div>
      </section>
    </>
  );
}
