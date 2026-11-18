"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import { QueryError } from "@/components/ui/query-error";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/use-api-query";
import type { AppointmentDTO } from "@/lib/api-types";
import {
  formatDateLong,
  formatDateRange,
  formatWeekday,
  nowMs,
} from "@/lib/format";

export function AccountOverview() {
  const { data, error, loading, reload } = useApiQuery<AppointmentDTO[]>(
    "/api/appointments",
  );

  if (loading && !data) {
    return (
      <div className="space-y-8" aria-busy="true">
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return <QueryError message={error} onRetry={() => void reload()} />;
  }

  const appointments = data ?? [];
  const now = nowMs();
  const upcoming = appointments
    .filter(
      (appointment) =>
        appointment.status === "SCHEDULED" &&
        new Date(appointment.slot.startsAt).getTime() >= now,
    )
    .sort(byStartAsc);

  const past = appointments.filter(
    (appointment) => appointment.status === "DONE",
  ).length;
  const cancelled = appointments.filter(
    (appointment) => appointment.status === "CANCELLED",
  ).length;

  const next = upcoming[0];

  const stats = [
    {
      label: "Próximas visitas",
      value: upcoming.length,
      icon: CalendarCheck,
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Visitas realizadas",
      value: past,
      icon: CheckCircle2,
      tone: "text-gold-600 bg-gold-50",
    },
    {
      label: "Canceladas",
      value: cancelled,
      icon: XCircle,
      tone: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4">
                <span
                  className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-2xl font-extrabold text-ink-950">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-ink-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section aria-labelledby="proxima-visita">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2
            id="proxima-visita"
            className="font-display text-xl font-bold text-ink-950"
          >
            Próxima visita
          </h2>
          {next ? (
            <Link
              href="/conta/agendamentos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700 transition-colors hover:text-gold-600"
            >
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        {next ? (
          <div className="overflow-hidden rounded-2xl bg-ink-950 text-cream-50 shadow-lg shadow-ink-950/10">
            <div className="relative p-6 sm:p-8">
              <div
                className="absolute inset-0 bg-blueprint opacity-40"
                aria-hidden="true"
              />
              <div
                className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <AppointmentStatusBadge status={next.status} />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/30 bg-gold-400/10 px-2.5 py-1 text-xs font-semibold text-gold-200">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatDateRange(next.slot.startsAt, next.slot.endsAt)}
                  </span>
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">
                  {formatWeekday(next.slot.startsAt)},{" "}
                  {formatDateLong(next.slot.startsAt)}
                </p>
                <h3 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight">
                  {next.description}
                </h3>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-cream-200/70">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
                    aria-hidden="true"
                  />
                  {next.address}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <LinkButton href="/conta/agendamentos" variant="primary">
                    Gerenciar agendamento
                  </LinkButton>
                  <Link
                    href="/contato"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-cream-50/25 px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-cream-50/10"
                  >
                    Falar com a equipe
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card className="border-dashed bg-white/60">
            <CardContent className="flex flex-col items-center py-10 text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                <CalendarCheck className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink-950">
                Nenhuma visita agendada
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
                Escolha um horário disponível e agende sua visita técnica. É
                rápido e sem compromisso.
              </p>
              <LinkButton href="/agendar" className="mt-5">
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Agendar visita
              </LinkButton>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

function byStartAsc(a: AppointmentDTO, b: AppointmentDTO) {
  return (
    new Date(a.slot.startsAt).getTime() - new Date(b.slot.startsAt).getTime()
  );
}
