"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppointmentsList } from "@/components/appointments/appointments-list";
import { LinkButton } from "@/components/ui/link-button";
import { QueryError } from "@/components/ui/query-error";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/use-api-query";
import type { AppointmentDTO } from "@/lib/api-types";

const PAGE_SIZE = 50;

export function AdminAppointments({
  page,
  role,
}: {
  page: number;
  role: string;
}) {
  const { data, error, loading, reload } = useApiQuery<AppointmentDTO[]>(
    "/api/appointments",
  );

  if (loading && !data) {
    return (
      <div className="space-y-4" aria-busy="true">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return <QueryError message={error} onRetry={() => void reload()} />;
  }

  const appointments = data ?? [];
  const total = appointments.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = appointments.slice(start, start + PAGE_SIZE);

  return (
    <>
      <AppointmentsList
        appointments={visible}
        role={role}
        onCancelled={() => void reload()}
      />

      <nav
        aria-label="Paginação de agendamentos"
        className="mt-8 flex flex-col items-center justify-between gap-3 rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-500 sm:flex-row"
      >
        <p>
          Página {currentPage} de {totalPages} · {total} agendamento
          {total === 1 ? "" : "s"}
        </p>

        <div className="flex gap-2">
          <LinkButton
            href={`/admin/agendamentos?pagina=${currentPage - 1}`}
            variant="outline"
            size="sm"
            aria-disabled={currentPage <= 1}
            className={
              currentPage <= 1 ? "pointer-events-none opacity-50" : undefined
            }
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Anterior
          </LinkButton>

          <LinkButton
            href={`/admin/agendamentos?pagina=${currentPage + 1}`}
            variant="outline"
            size="sm"
            aria-disabled={currentPage >= totalPages}
            className={
              currentPage >= totalPages
                ? "pointer-events-none opacity-50"
                : undefined
            }
          >
            Próxima
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </LinkButton>
        </div>
      </nav>
    </>
  );
}
