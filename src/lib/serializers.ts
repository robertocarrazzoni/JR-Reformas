import type {
  AdminSlotDTO,
  AppointmentDTO,
  AppointmentStatusValue,
  SessionUserDTO,
  SlotDTO,
} from "@/lib/api-types";

interface SerializableSlot {
  id: string;
  startsAt: Date;
  endsAt: Date;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SerializableAppointment {
  id: string;
  customerId: string;
  slotId: string;
  status: AppointmentStatusValue;
  description: string;
  address: string;
  notes: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role?: string;
  };
  slot: SerializableSlot;
}

export function serializeSlot(slot: SerializableSlot): SlotDTO {
  return {
    id: slot.id,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
    isBlocked: slot.isBlocked,
    createdAt: slot.createdAt?.toISOString(),
    updatedAt: slot.updatedAt?.toISOString(),
  };
}

export function serializeAppointment(
  appointment: SerializableAppointment,
): AppointmentDTO {
  return {
    id: appointment.id,
    customerId: appointment.customerId,
    slotId: appointment.slotId,
    status: appointment.status,
    description: appointment.description,
    address: appointment.address,
    notes: appointment.notes,
    cancelledAt: appointment.cancelledAt
      ? appointment.cancelledAt.toISOString()
      : null,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
    customer: {
      id: appointment.customer.id,
      name: appointment.customer.name,
      email: appointment.customer.email,
      phone: appointment.customer.phone,
      role: appointment.customer.role,
    },
    slot: serializeSlot(appointment.slot),
  };
}

export function serializeAdminSlot(slot: {
  id: string;
  startsAt: Date;
  endsAt: Date;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  appointments: SerializableAppointment[];
}): AdminSlotDTO {
  return {
    ...serializeSlot(slot),
    createdAt: slot.createdAt.toISOString(),
    updatedAt: slot.updatedAt.toISOString(),
    appointments: slot.appointments.map(serializeAppointment),
  };
}

export function serializeSessionUser(user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
}): SessionUserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}
