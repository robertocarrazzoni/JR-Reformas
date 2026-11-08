DROP INDEX "Appointment_slotId_key";

CREATE INDEX "Appointment_slotId_idx" ON "Appointment"("slotId");

CREATE UNIQUE INDEX "Appointment_active_slot_key"
ON "Appointment"("slotId")
WHERE "status" = 'SCHEDULED';
