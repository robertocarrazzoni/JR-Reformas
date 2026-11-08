import { Camera } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { gallery } from "@/lib/config";
import { cn } from "@/lib/cn";

export function GallerySection() {
  return (
    <section id="projetos" className="scroll-mt-24 bg-cream-50 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Projetos"
          title="Cada obra, uma história"
          description="Uma seleção de ambientes transformados pela JR Santana. Em breve, o portfólio completo com fotos reais de cada projeto."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <article
              key={item.title}
              className={cn(
                "group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl bg-gradient-to-br p-6 ring-1 ring-ink-950/10",
                item.tone,
              )}
            >
              <div
                className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-blueprint opacity-30"
                aria-hidden="true"
              />
              <Camera
                className="absolute right-5 top-5 h-5 w-5 text-cream-50/40"
                aria-hidden="true"
              />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-300">
                  {item.category}
                </p>
                <h3 className="mt-1.5 font-display text-xl font-bold text-cream-50">
                  {item.title}
                </h3>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-5 text-xs font-medium text-ink-400">
          Imagens ilustrativas. Substitua pelos registros reais dos projetos.
        </p>
      </div>
    </section>
  );
}
