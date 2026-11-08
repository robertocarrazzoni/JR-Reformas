import type { Metadata } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppointmentsList } from "@/components/appointments/appointments-list";
import { LinkButton } from "@/components/ui/link-button";
import {
  countAppointmentsService,
  getAppointmentsService,
} from "@/services/appointmentService";
import { requireAdmin } from "@/lib/session";
import { serializeAppointment } from "@/lib/serializers";

const PAGE_SIZE = 50;

export const metadata: Metadata = {
  title: "Agendamentos",
  description: "Todos os agendamentos de visitas técnicas da JR Santana.",
};

interface AdminAppointmentsPageProps {
  searchParams: Promise<{ pagina?: string }>;
}

function parsePage(value: string | undefined) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AdminAppointmentsPage({
  searchParams,
}: AdminAppointmentsPageProps) {
  const user = await requireAdmin();
  const actor = { userId: user.id, role: user.role };
  const page = parsePage((await searchParams).pagina);

  const [appointments, total] = await Promise.all([
    getAppointmentsService(actor, {
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    countAppointmentsService(actor),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
            Painel administrativo
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-950">
            Agendamentos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
            Consulte os dados de contato dos clientes, acompanhe as visitas e
            cancele quando necessário.
          </p>
        </div>
      </header>

      <AppointmentsList
        appointments={appointments.map(serializeAppointment)}
        role={user.role}
      />

      <nav
        aria-label="Paginação de agendamentos"
        className="flex flex-col items-center justify-between gap-3 rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-500 sm:flex-row"
      >
        <p>
          Página {page} de {totalPages} · {total} agendamento
          {total === 1 ? "" : "s"}
        </p>

        <div className="flex gap-2">
          <LinkButton
            href={`/admin/agendamentos?pagina=${page - 1}`}
            variant="outline"
            size="sm"
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Anterior
          </LinkButton>

          <LinkButton
            href={`/admin/agendamentos?pagina=${page + 1}`}
            variant="outline"
            size="sm"
            aria-disabled={page >= totalPages}
            className={
              page >= totalPages ? "pointer-events-none opacity-50" : undefined
            }
          >
            Próxima
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </LinkButton>
        </div>
      </nav>
    </div>
  );
}
