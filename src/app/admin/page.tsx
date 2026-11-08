import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  ClipboardList,
  Clock,
  UserRound,
} from "lucide-react";
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { getAppointmentsService } from "@/services/appointmentService";
import { countAvailableSlotsService } from "@/services/slotsService";
import { requireAdmin } from "@/lib/session";
import { serializeAppointment } from "@/lib/serializers";
import {
  formatDate,
  formatTime,
  formatWeekday,
  nowMs,
  toDateKey,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Painel administrativo",
  description: "Visão geral da agenda e dos agendamentos da JR Santana.",
};

export default async function AdminDashboardPage() {
  const user = await requireAdmin();

  const appointments = (
    await getAppointmentsService({ userId: user.id, role: user.role })
  ).map(serializeAppointment);

  const now = nowMs();
  const todayKey = toDateKey(new Date());

  const scheduled = appointments.filter(
    (appointment) =>
      appointment.status === "SCHEDULED" &&
      new Date(appointment.slot.startsAt).getTime() >= now,
  );

  const upcoming = [...scheduled]
    .sort(
      (a, b) =>
        new Date(a.slot.startsAt).getTime() -
        new Date(b.slot.startsAt).getTime(),
    )
    .slice(0, 6);

  const todayCount = scheduled.filter(
    (appointment) => toDateKey(appointment.slot.startsAt) === todayKey,
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "CANCELLED",
  ).length;

  const availableSlots = await countAvailableSlotsService();

  const firstName = user.name.trim().split(/\s+/)[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
            Painel administrativo
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-950">
            Olá, {firstName}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            Acompanhe a agenda, os agendamentos e a disponibilidade de visitas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/admin/agenda" variant="secondary">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Gerenciar agenda
          </LinkButton>
          <LinkButton href="/admin/agendamentos" variant="outline">
            Ver agendamentos
          </LinkButton>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visitas hoje"
          value={todayCount}
          icon={CalendarCheck}
          tone="emerald"
          hint="Agendamentos confirmados"
        />
        <StatCard
          label="Próximas visitas"
          value={scheduled.length}
          icon={CalendarDays}
          tone="ink"
          hint="A partir de agora"
        />
        <StatCard
          label="Horários livres"
          value={availableSlots}
          icon={Clock}
          tone="gold"
          hint="Disponíveis para agendamento"
        />
        <StatCard
          label="Cancelamentos"
          value={cancelledCount}
          icon={CalendarX2}
          tone="rose"
          hint="Total registrado"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Próximas visitas</CardTitle>
            <Link
              href="/admin/agendamentos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700 transition-colors hover:text-gold-600"
            >
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {upcoming.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-ink-400">
                Nenhuma visita futura agendada.
              </p>
            ) : (
              <ul className="divide-y divide-ink-900/10">
                {upcoming.map((appointment) => (
                  <li
                    key={appointment.id}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-950">
                        <UserRound
                          className="h-4 w-4 text-gold-600"
                          aria-hidden="true"
                        />
                        {appointment.customer.name}
                        <AppointmentStatusBadge status={appointment.status} />
                      </p>
                      <p className="mt-1 truncate text-xs text-ink-500">
                        {appointment.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-xs font-semibold capitalize text-ink-800">
                        {formatWeekday(appointment.slot.startsAt)},{" "}
                        {formatDate(appointment.slot.startsAt)}
                      </p>
                      <p className="text-xs text-ink-400">
                        {formatTime(appointment.slot.startsAt)} —{" "}
                        {formatTime(appointment.slot.endsAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atalhos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/admin/agenda"
              className="group flex items-center justify-between gap-3 rounded-xl border border-ink-900/10 bg-cream-50 px-4 py-3 transition-colors hover:border-gold-400/60 hover:bg-white"
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink-950 text-gold-400">
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-950">
                    Abrir agenda
                  </span>
                  <span className="block text-xs text-ink-500">
                    Crie, bloqueie e remova horários
                  </span>
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 text-gold-600 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/admin/agendamentos"
              className="group flex items-center justify-between gap-3 rounded-xl border border-ink-900/10 bg-cream-50 px-4 py-3 transition-colors hover:border-gold-400/60 hover:bg-white"
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink-950 text-gold-400">
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-950">
                    Agendamentos
                  </span>
                  <span className="block text-xs text-ink-500">
                    Consulte e cancele visitas
                  </span>
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 text-gold-600 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
