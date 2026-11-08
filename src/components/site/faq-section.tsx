import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { faq, whatsappLink } from "@/lib/config";

export function FaqSection() {
  return (
    <section className="bg-cream-50 py-20 sm:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Dúvidas frequentes"
            title="Antes de começar, é natural ter perguntas"
            description="Reunimos as dúvidas mais comuns sobre orçamento, prazos e acompanhamento da obra."
          />
          <p className="mt-6 text-sm text-ink-500">
            Não encontrou o que procura?{" "}
            <a
              href={whatsappLink("Olá! Tenho uma dúvida sobre os serviços da JR Santana.")}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-gold-700 underline decoration-gold-400/50 underline-offset-4 transition-colors hover:text-gold-600"
            >
              Fale com a equipe
            </a>
            .
          </p>
        </div>

        <div className="space-y-3">
          {faq.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-ink-900/10 bg-white shadow-sm transition-colors open:border-gold-400/50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left text-sm font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                {item.question}
                <Plus
                  className="h-5 w-5 shrink-0 text-gold-600 transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-ink-500">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
