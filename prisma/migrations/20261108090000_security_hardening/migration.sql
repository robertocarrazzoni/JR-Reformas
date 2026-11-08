-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'DONE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING ("role"::"Role");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

-- O índice parcial guarda o literal 'SCHEDULED' tipado como text (a coluna era
-- text). Sem recriá-lo, o ALTER TYPE falha com "operator does not exist:
-- AppointmentStatus = text". Recriado abaixo já com o enum.
DROP INDEX "Appointment_active_slot_key";

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE "AppointmentStatus" USING ("status"::"AppointmentStatus");
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_active_slot_key"
ON "Appointment"("slotId")
WHERE "status" = 'SCHEDULED';

-- CreateTable
CREATE TABLE "RateLimitCounter" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RateLimitCounter_pkey" PRIMARY KEY ("key","windowStart")
);
