import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import {
  countAvailableSlotsService,
  createSlots,
  deleteSlotService,
  getAdminSlotsService,
  getAvailableSlotsService,
  update,
} from "@/services/slotsService";
import { prisma } from "@/lib/prisma";
import { disconnectDatabase, resetDatabase } from "./helpers/db";
import {
  createAppointment,
  createSlot,
  createUser,
  futureDate,
  pastDate,
} from "./helpers/factories";

describe("Slots Service", () => {
  beforeEach(resetDatabase);

  afterAll(disconnectDatabase);

  describe("deleteSlotService", () => {
    it("deletes a slot without appointments", async () => {
      const slot = await createSlot();

      await expect(deleteSlotService(slot.id)).resolves.toEqual({
        message: "Slot deletado com sucesso",
      });

      await expect(
        prisma.availabilitySlot.findUnique({ where: { id: slot.id } }),
      ).resolves.toBeNull();
    });

    it("throws when the slot does not exist", async () => {
      await expect(deleteSlotService("non-existent")).rejects.toThrow("Slot não encontrado");
    });

    it("throws when the slot has an appointment linked", async () => {
      const user = await createUser();
      const slot = await createSlot();
      await createAppointment({ customerId: user.id, slotId: slot.id });

      await expect(deleteSlotService(slot.id)).rejects.toThrow(
        "Não é possível deletar um slot com agendamento vinculado",
      );

      await expect(
        prisma.availabilitySlot.findUnique({ where: { id: slot.id } }),
      ).resolves.not.toBeNull();
    });
  });

  describe("getAvailableSlotsService", () => {
    it("returns only future, unblocked slots without an active appointment", async () => {
      const customer = await createUser();

      const available = await createSlot();
      const rebooked = await createSlot({ startsAt: futureDate(72) });
      const blocked = await createSlot({ startsAt: futureDate(96), isBlocked: true });
      const inThePast = await createSlot({
        startsAt: pastDate(48),
        endsAt: pastDate(47),
      });
      const booked = await createSlot({ startsAt: futureDate(120) });

      await createAppointment({
        customerId: customer.id,
        slotId: booked.id,
        status: "SCHEDULED",
      });
      await createAppointment({
        customerId: customer.id,
        slotId: rebooked.id,
        status: "CANCELLED",
      });

      const result = await getAvailableSlotsService();
      const ids = result.map((slot) => slot.id);

      expect(ids).toContain(available.id);
      expect(ids).toContain(rebooked.id);
      expect(ids).not.toContain(blocked.id);
      expect(ids).not.toContain(inThePast.id);
      expect(ids).not.toContain(booked.id);
      expect(result.map((slot) => slot.startsAt.getTime())).toEqual(
        [...result.map((slot) => slot.startsAt.getTime())].sort((a, b) => a - b),
      );
    });

    it("returns an empty list when there are no slots", async () => {
      await expect(getAvailableSlotsService()).resolves.toEqual([]);
    });
  });

  describe("createSlots", () => {
    it("persists a slot", async () => {
      const startsAt = futureDate(48);
      const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

      const slot = await createSlots({ startsAt, endsAt });

      expect(slot).toMatchObject({ startsAt, endsAt, isBlocked: false });
      await expect(
        prisma.availabilitySlot.findUnique({ where: { id: slot.id } }),
      ).resolves.not.toBeNull();
    });

    it("throws when the start date is already taken", async () => {
      const existing = await createSlot();

      await expect(
        createSlots({ startsAt: existing.startsAt, endsAt: existing.endsAt }),
      ).rejects.toThrow("Não foi possível criar o horário");
    });
  });

  describe("update", () => {
    it("blocks a slot and returns the updated dates", async () => {
      const slot = await createSlot();

      const result = await update({ isBlocked: true }, slot.id);

      expect(result).toEqual({ startsAt: slot.startsAt, endsAt: slot.endsAt });

      const stored = await prisma.availabilitySlot.findUnique({ where: { id: slot.id } });
      expect(stored?.isBlocked).toBe(true);
    });

    it("throws when the slot does not exist", async () => {
      await expect(update({ isBlocked: true }, "missing")).rejects.toThrow(
        "Não foi possível atualizar o horário",
      );
    });
  });

  describe("countAvailableSlotsService", () => {
    it("counts only future, unblocked slots without an active appointment", async () => {
      const customer = await createUser();

      await createSlot();
      await createSlot({ startsAt: futureDate(72), isBlocked: true });
      await createSlot({ startsAt: pastDate(48), endsAt: pastDate(47) });

      const booked = await createSlot({ startsAt: futureDate(96) });
      await createAppointment({ customerId: customer.id, slotId: booked.id });

      await expect(countAvailableSlotsService()).resolves.toBe(1);
    });

    it("returns zero when there are no slots", async () => {
      await expect(countAvailableSlotsService()).resolves.toBe(0);
    });
  });

  describe("getAdminSlotsService", () => {
    it("returns every slot with customer and slot details on appointments", async () => {
      const customer = await createUser({ name: "Cliente Agendado" });
      const slot = await createSlot();
      const blocked = await createSlot({ startsAt: futureDate(72), isBlocked: true });

      const appointment = await createAppointment({
        customerId: customer.id,
        slotId: slot.id,
      });

      const result = await getAdminSlotsService();
      const ids = result.map((item) => item.id);

      expect(ids).toEqual([slot.id, blocked.id]);
      expect(result[0].appointments).toHaveLength(1);
      expect(result[0].appointments[0].id).toBe(appointment.id);
      expect(result[0].appointments[0].customer.name).toBe("Cliente Agendado");
      expect(result[0].appointments[0].slot.id).toBe(slot.id);
      expect(result[1].appointments).toEqual([]);
    });
  });
});
