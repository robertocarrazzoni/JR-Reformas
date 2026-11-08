import type { AppointmentStatusValue } from "@/lib/api-types";

/** Prazo mínimo de antecedência para o cliente cancelar uma visita. */
export const CANCELLATION_NOTICE_MS = 24 * 60 * 60 * 1000;

export function withinCancellationNotice(
  startsAt: string | Date,
  now = Date.now(),
) {
  const start = startsAt instanceof Date ? startsAt : new Date(startsAt);

  return start.getTime() - now < CANCELLATION_NOTICE_MS;
}

/**
 * `DONE` é derivado na leitura: um agendamento confirmado cujo horário já
 * passou é uma visita realizada. Evita job/cron e mantém o banco simples.
 */
export function deriveAppointmentStatus(
  status: string,
  startsAt: string | Date,
  now = Date.now(),
): AppointmentStatusValue {
  if (status !== "SCHEDULED") {
    return status as AppointmentStatusValue;
  }

  const start = startsAt instanceof Date ? startsAt : new Date(startsAt);

  return start.getTime() <= now ? "DONE" : "SCHEDULED";
}
