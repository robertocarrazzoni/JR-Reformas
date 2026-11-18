import type { Metadata } from "next";
import { AppointmentsFeed } from "@/components/appointments/appointments-feed";
import { LinkButton } from "@/components/ui/link-button";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Meus agendamentos",
  description: "Acompanhe e gerencie suas visitas técnicas.",
};

export default async function AppointmentsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
            Área do cliente
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-950">
            Meus agendamentos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
            Consulte visitas futuras, o histórico e os cancelamentos. O
            cancelamento é permitido até 24 horas antes do horário.
          </p>
        </div>
        <LinkButton href="/agendar">Agendar visita</LinkButton>
      </header>

      <AppointmentsFeed role={user.role} />
    </div>
  );
}
