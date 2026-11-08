import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { pillars, siteConfig } from "@/lib/config";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink-950 p-12 text-cream-50 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden="true" />
        <div
          className="absolute -right-24 top-10 h-80 w-80 rounded-full border border-gold-500/15"
          aria-hidden="true"
        />
        <div
          className="absolute -right-10 top-24 h-56 w-56 rounded-full border border-gold-500/15"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <Logo className="text-cream-50" priority />
        </div>

        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-300">
            Área do cliente
          </p>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-balance">
            Sua obra em boas mãos, do primeiro encontro ao acabamento.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cream-200/70">
            Acompanhe seus agendamentos, solicite novas visitas e converse com a
            equipe da {siteConfig.name} em um só lugar.
          </p>

          <ul className="mt-8 space-y-3">
            {pillars.map((pillar) => (
              <li key={pillar.title} className="flex items-center gap-3 text-sm">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold-400/30 bg-gold-400/10 text-gold-300">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="font-medium text-cream-100">{pillar.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between text-xs text-cream-200/50">
          <span>© {new Date().getFullYear()} {siteConfig.fullName}</span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-semibold text-gold-300 transition-colors hover:text-gold-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Voltar ao site
          </Link>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col bg-cream-50">
        <div className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4 lg:hidden">
          <Logo priority />
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500 transition-colors hover:text-ink-900"
          >
            Voltar
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md animate-fade-up">{children}</div>
        </div>
      </main>
    </div>
  );
}
