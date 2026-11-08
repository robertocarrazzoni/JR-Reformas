import { hash } from "bcryptjs";
import type { AppointmentStatus, Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

let emailCounter = 0;
let dateOffset = 0;

/**
 * Returns a date in the future. Each call adds a one second offset so slots created
 * in the same test never collide on the `AvailabilitySlot.startsAt` unique index.
 */
export function futureDate(hoursFromNow = 48): Date {
  dateOffset += 1;
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000 + dateOffset * 1000);
}

export function pastDate(hoursAgo = 48): Date {
  dateOffset += 1;
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000 + dateOffset * 1000);
}

interface CreateUserOptions {
  name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  role?: Role;
}

export async function createUser(options: CreateUserOptions = {}) {
  emailCounter += 1;

  return prisma.user.create({
    data: {
      name: options.name ?? "Test User",
      email: options.email ?? `user-${emailCounter}@example.com`,
      passwordHash: await hash(options.password ?? "password123", 10),
      phone: options.phone ?? null,
      role: options.role ?? "CUSTOMER",
    },
  });
}

interface CreateSlotOptions {
  startsAt?: Date;
  endsAt?: Date;
  isBlocked?: boolean;
}

export async function createSlot(options: CreateSlotOptions = {}) {
  const startsAt = options.startsAt ?? futureDate();

  return prisma.availabilitySlot.create({
    data: {
      startsAt,
      endsAt: options.endsAt ?? new Date(startsAt.getTime() + 60 * 60 * 1000),
      isBlocked: options.isBlocked ?? false,
    },
  });
}

interface CreateAppointmentOptions {
  customerId: string;
  slotId: string;
  status?: AppointmentStatus;
  description?: string;
  address?: string;
}

export async function createAppointment(options: CreateAppointmentOptions) {
  return prisma.appointment.create({
    data: {
      customerId: options.customerId,
      slotId: options.slotId,
      status: options.status ?? "SCHEDULED",
      description: options.description ?? "Reforma de cozinha",
      address: options.address ?? "Rua das Flores, 1",
    },
  });
}
