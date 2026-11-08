import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/lib/config";

export function TestimonialsSection() {
  return (
    <section className="border-y border-ink-900/10 bg-cream-100 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow="Depoimentos"
          title="Confiança construída junto com cada cliente"
          description="O cuidado com o detalhe e a clareza na comunicação são o que mais ouvimos de quem acompanha uma obra com a JR Santana."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <figure
              key={`${testimonial.detail}-${index}`}
              className="flex flex-col rounded-2xl border border-ink-900/10 bg-white p-6 shadow-sm"
            >
              <Quote className="h-8 w-8 text-gold-400" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-600">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-ink-900/10 pt-4">
                <p className="text-sm font-semibold text-ink-950">
                  {testimonial.name}
                </p>
                <p className="mt-0.5 text-xs text-ink-400">{testimonial.detail}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
