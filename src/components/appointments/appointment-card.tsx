"use client";

import { useState } from "react";
import {
  CalendarX2,
  Clock,
  Mail,
  MapPin,
  Phone,
  StickyNote,
  UserRound,
  XCircle,
} from "lucide-react";
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { apiFetch, getErrorMessage } from "@/lib/api";
import type { AppointmentDTO } from "@/lib/api-types";
import { CANCELLATION_NOTICE_MS } from "@/lib/booking";
import {
  formatDateRange,
  formatDateTime,
  formatDay,
  formatMonthShort,
  formatPhone,
  formatWeekday,
  nowMs,
} from "@/lib/format";

interface AppointmentCardProps {
  appointment: AppointmentDTO;
  role: string;
  onCancelled?: () => void;
}

export function AppointmentCard({
  appointment,
  role,
  onCancelled,
}: AppointmentCardProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = role === "ADMIN";
  const isScheduled = appointment.status === "SCHEDULED";
  const startsAt = new Date(appointment.slot.startsAt).getTime();
  const withinNotice = startsAt - nowMs() < CANCELLATION_NOTICE_MS;
  const canCancel = isScheduled && (isAdmin || !withinNotice);
  const blockedByNotice = isScheduled && !isAdmin && withinNotice;

  async function handleCancel() {
    setLoading(true);

    try {
      await apiFetch<AppointmentDTO>(
        `/api/appointments/${appointment.id}`,
        { method: "DELETE" },
      );
      toast({
        title: "Agendamento cancelado",
        description: "O horário foi liberado novamente na agenda.",
        variant: "success",
      });
      setOpen(false);
      onCancelled?.();
    } catch (error) {
      toast({
        title: "Não foi possível cancelar",
        description: getErrorMessage(error),
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
        <div className="flex items-center gap-4 sm:w-24 sm:flex-col sm:items-stretch sm:gap-0 sm:rounded-xl sm:bg-ink-950 sm:px-3 sm:py-4 sm:text-center">
          <div className="flex items-baseline gap-1 sm:flex-col sm:gap-0">
            <span className="font-display text-2xl font-extrabold text-ink-950 sm:text-3xl sm:text-gold-300">
              {formatDay(appointment.slot.startsAt)}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-400 sm:text-gold-400">
              {formatMonthShort(appointment.slot.startsAt)}
            </span>
          </div>
          <div className="text-xs capitalize text-ink-500 sm:mt-1 sm:text-[11px] sm:text-cream-200/60">
            {formatWeekday(appointment.slot.startsAt)}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <AppointmentStatusBadge status={appointment.status} />
            <Badge variant="neutral">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDateRange(appointment.slot.startsAt, appointment.slot.endsAt)}
            </Badge>
          </div>

          <h3 className="mt-2.5 font-display text-lg font-bold text-ink-950">
            {appointment.description}
          </h3>

          <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
            {appointment.address}
          </p>

          {appointment.notes ? (
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-ink-500">
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
              {appointment.notes}
            </p>
          ) : null}

          {isAdmin ? (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-cream-100 px-3 py-2 text-xs text-ink-600">
              <span className="inline-flex items-center gap-1.5 font-semibold text-ink-800">
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                {appointment.customer.name}
              </span>
              {appointment.customer.phone ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatPhone(appointment.customer.phone)}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {appointment.customer.email}
              </span>
            </div>
          ) : null}

          {blockedByNotice ? (
            <p className="mt-2 text-xs font-medium text-amber-700">
              Cancelamento permitido somente até 24 horas antes do horário.
            </p>
          ) : null}

          {appointment.cancelledAt ? (
            <p className="mt-2 text-xs text-ink-400">
              Cancelado em {formatDateTime(appointment.cancelledAt)}
            </p>
          ) : null}
        </div>

        {isScheduled ? (
          <div className="sm:pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canCancel}
              onClick={() => setOpen(true)}
              title={
                blockedByNotice
                  ? "Cancelamento permitido somente até 24 horas antes"
                  : undefined
              }
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Cancelar
            </Button>
          </div>
        ) : null}
      </div>

      <Modal
        open={open}
        onClose={() => {
          if (!loading) {
            setOpen(false);
          }
        }}
        title="Cancelar agendamento?"
        description="O horário voltará a ficar disponível na agenda."
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Manter agendamento
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleCancel}
              loading={loading}
            >
              <CalendarX2 className="h-4 w-4" aria-hidden="true" />
              {loading ? "Cancelando..." : "Sim, cancelar"}
            </Button>
          </>
        }
      >
        <div className="rounded-xl bg-cream-100 p-4 text-sm text-ink-600">
          <p className="font-semibold text-ink-950">
            {appointment.description}
          </p>
          <p className="mt-1">
            {formatWeekday(appointment.slot.startsAt)},{" "}
            {formatDay(appointment.slot.startsAt)} de{" "}
            {formatMonthShort(appointment.slot.startsAt).toLowerCase()} ·{" "}
            {formatDateRange(appointment.slot.startsAt, appointment.slot.endsAt)}
          </p>
          <p className="mt-1">{appointment.address}</p>
        </div>
      </Modal>
    </Card>
  );
}
