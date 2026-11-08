"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import type { AppointmentDTO } from "@/lib/api-types";
import { cn } from "@/lib/cn";
import { nowMs } from "@/lib/format";

type Filter = "upcoming" | "past" | "cancelled" | "all";

const filters: { value: Filter; label: string }[] = [
  { value: "upcoming", label: "Próximos" },
  { value: "past", label: "Anteriores" },
  { value: "cancelled", label: "Cancelados" },
  { value: "all", label: "Todos" },
];

function byStartAsc(a: AppointmentDTO, b: AppointmentDTO) {
  return (
    new Date(a.slot.startsAt).getTime() - new Date(b.slot.startsAt).getTime()
  );
}

function byStartDesc(a: AppointmentDTO, b: AppointmentDTO) {
  return byStartAsc(b, a);
}

export function AppointmentsList({
  appointments,
  role,
}: {
  appointments: AppointmentDTO[];
  role: string;
}) {
  const [filter, setFilter] = useState<Filter>("upcoming");

  const now = nowMs();

  const groups: Record<Filter, AppointmentDTO[]> = {
    upcoming: appointments
      .filter(
        (appointment) =>
          appointment.status === "SCHEDULED" &&
          new Date(appointment.slot.startsAt).getTime() >= now,
      )
      .sort(byStartAsc),
    past: appointments
      .filter((appointment) => appointment.status === "DONE")
      .sort(byStartDesc),
    cancelled: appointments
      .filter((appointment) => appointment.status === "CANCELLED")
      .sort(byStartDesc),
    all: [...appointments].sort(byStartDesc),
  };

  const visible = groups[filter];

  return (
    <div>
      <div
        className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-ink-900/10 bg-white p-1 shadow-sm"
        role="group"
        aria-label="Filtrar agendamentos"
      >
        {filters.map((item) => {
          const active = filter === item.value;
          const count = groups[item.value].length;

          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(item.value)}
              className={cn(
                "inline-flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors",
                active
                  ? "bg-ink-950 text-cream-50"
                  : "text-ink-500 hover:bg-ink-950/5 hover:text-ink-900",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  active ? "bg-cream-50/15 text-cream-50" : "bg-ink-950/5 text-ink-500",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-4">
        {visible.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={
              filter === "upcoming"
                ? "Nenhum agendamento futuro"
                : "Nada por aqui"
            }
            description={
              filter === "upcoming"
                ? "Escolha um horário disponível e agende sua visita técnica."
                : "Não há agendamentos nesta categoria."
            }
            action={
              filter === "upcoming" ? (
                <LinkButton href="/agendar">Agendar visita</LinkButton>
              ) : undefined
            }
          />
        ) : (
          visible.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              role={role}
            />
          ))
        )}
      </div>
    </div>
  );
}
