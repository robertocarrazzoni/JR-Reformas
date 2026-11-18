import type { Metadata } from "next";
import { AdminAppointments } from "@/components/admin/admin-appointments";
import { requireAdmin } from "@/lib/session";

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
  const page = parsePage((await searchParams).pagina);

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

      <AdminAppointments page={page} role={user.role} />
    </div>
  );
}
