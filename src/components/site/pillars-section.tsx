import { Clock, Handshake, ShieldCheck } from "lucide-react";
import { pillars } from "@/lib/config";

const icons = [ShieldCheck, Clock, Handshake];

export function PillarsSection() {
  return (
    <section className="border-y border-ink-900/10 bg-cream-100">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3 md:gap-10">
        {pillars.map((pillar, index) => {
          const Icon = icons[index] ?? ShieldCheck;

          return (
            <div key={pillar.title} className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold-500/25 bg-white text-gold-600 shadow-sm">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-ink-950">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                  {pillar.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
