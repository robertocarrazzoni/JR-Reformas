import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  UserRound,
} from "lucide-react";
import { AccountOverview } from "@/components/account/account-overview";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Minha conta",
  description: "Acompanhe seus agendamentos e solicite novas visitas.",
};

const shortcuts = [
  {
    href: "/agendar",
    title: "Agendar visita",
    description: "Escolha um horário disponível para a visita técnica.",
    icon: CalendarPlus,
  },
  {
    href: "/conta/agendamentos",
    title: "Meus agendamentos",
    description: "Veja o histórico e cancele visitas agendadas.",
    icon: CalendarDays,
  },
  {
    href: "/perfil",
    title: "Meu perfil",
    description: "Atualize seus dados de contato e senha de acesso.",
    icon: UserRound,
  },
];

export default async function AccountPage() {
  const user = await requireUser();
  const firstName = user.name.trim().split(/\s+/)[0];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
          Área do cliente
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-950">
          Olá, {firstName}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Este é o seu espaço para acompanhar visitas e cuidar da sua obra com a
          JR Santana.
        </p>
      </header>

      <AccountOverview />

      <section aria-labelledby="atalhos">
        <h2
          id="atalhos"
          className="mb-4 font-display text-xl font-bold text-ink-950"
        >
          Atalhos
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;

            return (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="group rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-400/60 hover:shadow-md"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950 text-gold-400 transition-colors group-hover:bg-gold-500 group-hover:text-ink-950">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 flex items-center gap-1.5 font-display text-base font-bold text-ink-950">
                  {shortcut.title}
                  <ArrowRight
                    className="h-4 w-4 text-gold-600 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">
                  {shortcut.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
