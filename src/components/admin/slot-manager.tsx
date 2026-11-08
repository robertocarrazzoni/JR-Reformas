"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CalendarX2,
  Lock,
  Phone,
  Trash2,
  Unlock,
  UserRound,
} from "lucide-react";
import { SlotForm } from "@/components/admin/slot-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { apiFetch, getErrorMessage } from "@/lib/api";
import type { AdminSlotDTO, AppointmentDTO } from "@/lib/api-types";
import { formatDateLong, formatPhone, formatTime, formatWeekday, nowMs, toDateKey } from "@/lib/format";

interface DateGroup {
  key: string;
  startsAt: string;
  slots: AdminSlotDTO[];
}

function groupByDate(slots: AdminSlotDTO[]): DateGroup[] {
  const map = new Map<string, AdminSlotDTO[]>();

  for (const slot of slots) {
    const key = toDateKey(slot.startsAt);
    const current = map.get(key) ?? [];
    current.push(slot);
    map.set(key, current);
  }

  return Array.from(map.entries()).map(([key, items]) => {
    const sorted = [...items].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );

    return { key, startsAt: sorted[0].startsAt, slots: sorted };
  });
}

function scheduledAppointment(slot: AdminSlotDTO): AppointmentDTO | null {
  return (
    slot.appointments.find((appointment) => appointment.status === "SCHEDULED") ??
    null
  );
}

export function SlotManager({ slots }: { slots: AdminSlotDTO[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSlotDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const now = nowMs();
  const upcoming = slots.filter(
    (slot) => new Date(slot.startsAt).getTime() >= now,
  );
  const past = slots
    .filter((slot) => new Date(slot.startsAt).getTime() < now)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  const upcomingGroups = groupByDate(upcoming);
  const pastGroups = groupByDate(past);

  async function toggleBlock(slot: AdminSlotDTO) {
    setPendingId(slot.id);

    try {
      await apiFetch(`/api/slots/${slot.id}`, {
        method: "PATCH",
        json: { isBlocked: !slot.isBlocked },
      });
      toast({
        title: slot.isBlocked ? "Horário liberado" : "Horário bloqueado",
        description: slot.isBlocked
          ? "O horário voltou a ficar disponível."
          : "O horário não aceitará novos agendamentos.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Não foi possível atualizar",
        description: getErrorMessage(error),
        variant: "error",
      });
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    try {
      await apiFetch(`/api/slots/${deleteTarget.id}`, { method: "DELETE" });
      toast({
        title: "Horário removido",
        description: "O horário foi excluído da agenda.",
        variant: "success",
      });
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      toast({
        title: "Não foi possível excluir",
        description: getErrorMessage(error),
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  function renderSlot(slot: AdminSlotDTO) {
    const appointment = scheduledAppointment(slot);
    const isPast = new Date(slot.startsAt).getTime() < now;
    const pending = pendingId === slot.id;
    const canDelete = slot.appointments.length === 0;

    let statusBadge = <Badge variant="success">Livre</Badge>;

    if (slot.isBlocked) {
      statusBadge = <Badge variant="warning">Bloqueado</Badge>;
    } else if (appointment) {
      statusBadge = <Badge variant="gold">Reservado</Badge>;
    } else if (isPast) {
      statusBadge = <Badge variant="neutral">Passado</Badge>;
    }

    return (
      <li
        key={slot.id}
        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-bold text-ink-950">
              {formatTime(slot.startsAt)} — {formatTime(slot.endsAt)}
            </span>
            {statusBadge}
          </div>

          {appointment ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
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
              <span className="truncate">{appointment.description}</span>
            </div>
          ) : (
            <p className="mt-1 text-xs text-ink-400">
              {slot.isBlocked
                ? "Indisponível para agendamento."
                : isPast
                  ? "Horário encerrado."
                  : "Disponível para agendamento."}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isPast ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toggleBlock(slot)}
              disabled={pending}
              loading={pending}
            >
              {slot.isBlocked ? (
                <>
                  <Unlock className="h-4 w-4" aria-hidden="true" />
                  Liberar
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  Bloquear
                </>
              )}
            </Button>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(slot)}
            disabled={!canDelete || pending}
            title={
              canDelete
                ? "Excluir horário"
                : "Não é possível excluir um horário com agendamento vinculado"
            }
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Excluir
          </Button>
        </div>
      </li>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximos horários</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingGroups.length === 0 ? (
              <div className="p-5 sm:p-6">
                <EmptyState
                  icon={CalendarDays}
                  title="Nenhum horário futuro"
                  description="Crie novos horários pelo formulário ao lado para abrir a agenda."
                />
              </div>
            ) : (
              <div className="divide-y divide-ink-900/10">
                {upcomingGroups.map((group) => (
                  <div key={group.key}>
                    <div className="flex items-center gap-2 bg-cream-100 px-5 py-2.5 sm:px-6">
                      <CalendarDays
                        className="h-4 w-4 text-gold-600"
                        aria-hidden="true"
                      />
                      <p className="text-xs font-semibold capitalize text-ink-700">
                        {formatWeekday(group.startsAt)},{" "}
                        {formatDateLong(group.startsAt)}
                      </p>
                    </div>
                    <ul className="divide-y divide-ink-900/10">
                      {group.slots.map(renderSlot)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {pastGroups.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Histórico da agenda</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 divide-y divide-ink-900/10 overflow-y-auto">
                {pastGroups.map((group) => (
                  <div key={group.key}>
                    <div className="flex items-center gap-2 bg-cream-100 px-5 py-2.5 sm:px-6">
                      <CalendarDays
                        className="h-4 w-4 text-ink-400"
                        aria-hidden="true"
                      />
                      <p className="text-xs font-semibold capitalize text-ink-600">
                        {formatWeekday(group.startsAt)},{" "}
                        {formatDateLong(group.startsAt)}
                      </p>
                    </div>
                    <ul className="divide-y divide-ink-900/10">
                      {group.slots.map(renderSlot)}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <SlotForm />
      </div>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        title="Excluir horário?"
        description="O horário será removido permanentemente da agenda."
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              <CalendarX2 className="h-4 w-4" aria-hidden="true" />
              {deleting ? "Excluindo..." : "Excluir horário"}
            </Button>
          </>
        }
      >
        {deleteTarget ? (
          <div className="rounded-xl bg-cream-100 p-4 text-sm text-ink-600">
            <p className="font-semibold text-ink-950">
              {formatWeekday(deleteTarget.startsAt)},{" "}
              {formatDateLong(deleteTarget.startsAt)}
            </p>
            <p className="mt-1">
              {formatTime(deleteTarget.startsAt)} —{" "}
              {formatTime(deleteTarget.endsAt)}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
