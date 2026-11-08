import { describe, expect, it } from "@jest/globals";
import {
  serializeAdminSlot,
  serializeAppointment,
  serializeSessionUser,
  serializeSlot,
} from "@/lib/serializers";

const slotRecord = {
  id: "slot-1",
  startsAt: new Date("2026-01-10T13:00:00.000Z"),
  endsAt: new Date("2026-01-10T14:00:00.000Z"),
  isBlocked: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
};

const customerRecord = {
  id: "customer-1",
  name: "Cliente Teste",
  email: "cliente@example.com",
  phone: "11999999999",
  role: "CUSTOMER",
};

const appointmentRecord = {
  id: "appointment-1",
  customerId: customerRecord.id,
  slotId: slotRecord.id,
  status: "SCHEDULED" as const,
  description: "Reforma de cozinha",
  address: "Rua das Flores, 1",
  notes: null,
  cancelledAt: null,
  createdAt: new Date("2026-01-05T10:00:00.000Z"),
  updatedAt: new Date("2026-01-05T11:00:00.000Z"),
  customer: customerRecord,
  slot: slotRecord,
};

describe("serializers", () => {
  describe("serializeSlot", () => {
    it("converts dates to ISO strings", () => {
      expect(serializeSlot(slotRecord)).toEqual({
        id: "slot-1",
        startsAt: "2026-01-10T13:00:00.000Z",
        endsAt: "2026-01-10T14:00:00.000Z",
        isBlocked: false,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      });
    });

    it("keeps optional timestamps undefined when absent", () => {
      const result = serializeSlot({
        id: "slot-2",
        startsAt: slotRecord.startsAt,
        endsAt: slotRecord.endsAt,
        isBlocked: true,
      });

      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });
  });

  describe("serializeAppointment", () => {
    it("serializes nested customer and slot", () => {
      expect(serializeAppointment(appointmentRecord)).toEqual({
        id: "appointment-1",
        customerId: "customer-1",
        slotId: "slot-1",
        status: "SCHEDULED",
        description: "Reforma de cozinha",
        address: "Rua das Flores, 1",
        notes: null,
        cancelledAt: null,
        createdAt: "2026-01-05T10:00:00.000Z",
        updatedAt: "2026-01-05T11:00:00.000Z",
        customer: {
          id: "customer-1",
          name: "Cliente Teste",
          email: "cliente@example.com",
          phone: "11999999999",
          role: "CUSTOMER",
        },
        slot: {
          id: "slot-1",
          startsAt: "2026-01-10T13:00:00.000Z",
          endsAt: "2026-01-10T14:00:00.000Z",
          isBlocked: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      });
    });

    it("keeps a cancellation date when present", () => {
      const cancelledAt = new Date("2026-01-06T09:00:00.000Z");

      const result = serializeAppointment({
        ...appointmentRecord,
        status: "CANCELLED" as const,
        cancelledAt,
      });

      expect(result.status).toBe("CANCELLED");
      expect(result.cancelledAt).toBe("2026-01-06T09:00:00.000Z");
    });
  });

  describe("serializeAdminSlot", () => {
    it("includes the serialized appointments", () => {
      const result = serializeAdminSlot({
        ...slotRecord,
        appointments: [appointmentRecord],
      });

      expect(result.id).toBe("slot-1");
      expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
      expect(result.updatedAt).toBe("2026-01-02T00:00:00.000Z");
      expect(result.appointments).toHaveLength(1);
      expect(result.appointments[0].id).toBe("appointment-1");
      expect(result.appointments[0].slot.startsAt).toBe("2026-01-10T13:00:00.000Z");
    });

    it("returns an empty appointment list when there is none", () => {
      const result = serializeAdminSlot({ ...slotRecord, appointments: [] });

      expect(result.appointments).toEqual([]);
    });
  });

  describe("serializeSessionUser", () => {
    it("never exposes the password hash and converts createdAt", () => {
      const result = serializeSessionUser({
        id: "user-1",
        name: "Cliente Teste",
        email: "cliente@example.com",
        phone: null,
        role: "CUSTOMER",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      expect(result).toEqual({
        id: "user-1",
        name: "Cliente Teste",
        email: "cliente@example.com",
        phone: null,
        role: "CUSTOMER",
        createdAt: "2026-01-01T00:00:00.000Z",
      });
      expect(result).not.toHaveProperty("passwordHash");
    });
  });
});
