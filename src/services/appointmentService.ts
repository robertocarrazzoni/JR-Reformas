import type { AuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CreateAppointmentInput } from "@/lib/schemas/appointmentsSchema";
import {
  CANCELLATION_NOTICE_MS,
  deriveAppointmentStatus,
} from "@/lib/booking";

const SCHEDULED = "SCHEDULED" as const;
const CANCELLED = "CANCELLED" as const;
const DONE = "DONE" as const;

export class AppointmentError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

const appointmentInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  },
  slot: true,
} as const;

function actorWhere(actor: AuthenticatedUser) {
  return actor.role === "CUSTOMER" ? { customerId: actor.userId } : undefined;
}

export async function createAppointmentService(
  data: CreateAppointmentInput,
  actor: AuthenticatedUser,
) {
  if (actor.role !== "CUSTOMER") {
    throw new AppointmentError("Apenas clientes podem criar agendamentos", 403);
  }

  try {
    return await prisma.$transaction(async (transaction) => {
      const slot = await transaction.availabilitySlot.findUnique({
        where: { id: data.slotId },
        include: {
          appointments: {
            where: { status: SCHEDULED },
            select: { id: true },
          },
        },
      });

      if (!slot) {
        throw new AppointmentError("Slot não encontrado", 404);
      }

      if (slot.startsAt <= new Date() || slot.isBlocked || slot.appointments.length > 0) {
        throw new AppointmentError("Slot indisponível", 409);
      }

      return transaction.appointment.create({
        data: {
          ...data,
          customerId: actor.userId,
          status: SCHEDULED,
        },
        include: appointmentInclude,
      });
    });
  } catch (error) {
    if (error instanceof AppointmentError) {
      throw error;
    }

    if ((error as { code?: string }).code === "P2002") {
      throw new AppointmentError("Slot indisponível", 409);
    }

    throw error;
  }
}

interface GetAppointmentsOptions {
  take?: number;
  skip?: number;
}

/**
 * Lê os agendamentos e deriva `DONE` para visitas confirmadas cujo horário já
 * passou. A derivação fica na leitura para não depender de cron/escrita.
 */
export async function getAppointmentsService(
  actor: AuthenticatedUser,
  options: GetAppointmentsOptions = {},
) {
  if (actor.role !== "ADMIN" && actor.role !== "CUSTOMER") {
    throw new AppointmentError("Acesso proibido", 403);
  }

  const appointments = await prisma.appointment.findMany({
    where: actorWhere(actor),
    include: appointmentInclude,
    orderBy: { createdAt: "desc" },
    take: options.take,
    skip: options.skip,
  });

  const now = Date.now();

  return appointments.map((appointment) => ({
    ...appointment,
    status: deriveAppointmentStatus(
      appointment.status,
      appointment.slot.startsAt,
      now,
    ),
  }));
}

/** Total para a paginação do painel admin (mesmo filtro da listagem). */
export async function countAppointmentsService(actor: AuthenticatedUser) {
  if (actor.role !== "ADMIN" && actor.role !== "CUSTOMER") {
    throw new AppointmentError("Acesso proibido", 403);
  }

  return prisma.appointment.count({ where: actorWhere(actor) });
}

export async function cancelAppointmentService(id: string, actor: AuthenticatedUser) {
  if (actor.role !== "ADMIN" && actor.role !== "CUSTOMER") {
    throw new AppointmentError("Acesso proibido", 403);
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { slot: true },
  });

  if (!appointment || (actor.role === "CUSTOMER" && appointment.customerId !== actor.userId)) {
    throw new AppointmentError("Agendamento não encontrado", 404);
  }

  if (appointment.status === CANCELLED) {
    throw new AppointmentError("Agendamento já está cancelado", 409);
  }

  // `DONE` é derivado na leitura; a checagem por data cobre o mesmo caso no
  // banco, onde o status ainda é SCHEDULED.
  if (
    appointment.status === DONE ||
    appointment.slot.startsAt.getTime() <= Date.now()
  ) {
    throw new AppointmentError("Visita já realizada", 409);
  }

  if (
    actor.role === "CUSTOMER" &&
    appointment.slot.startsAt.getTime() - Date.now() < CANCELLATION_NOTICE_MS
  ) {
    throw new AppointmentError("Cancelamento deve ser solicitado com 24 horas de antecedência", 422);
  }

  return prisma.appointment.update({
    where: { id },
    data: {
      status: CANCELLED,
      cancelledAt: new Date(),
    },
    include: appointmentInclude,
  });
}
