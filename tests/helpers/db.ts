import { prisma } from "@/lib/prisma";

export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Appointment", "AvailabilitySlot", "User", "RateLimitCounter" RESTART IDENTITY CASCADE',
  );
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
