import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import { mockCookieStore } from "./helpers/cookies";
import { resetDatabase, disconnectDatabase } from "./helpers/db";
import {
  createAppointment,
  createSlot,
  createUser,
  futureDate,
} from "./helpers/factories";
import { signTestToken } from "./helpers/auth";
import { jsonRequest, plainRequest } from "./helpers/request";

jest.mock("next/headers", () => ({
  cookies: async () => mockCookieStore,
}));

import {
  GET as getAppointments,
  POST as createAppointmentRoute,
} from "@/app/api/appointments/route";
import { DELETE as cancelAppointmentRoute } from "@/app/api/appointments/[id]/route";
import { prisma } from "@/lib/prisma";

const appointmentPayload = {
  description: "Reforma de cozinha",
  address: "Rua das Flores, 1",
};

interface AppointmentBody {
  id: string;
  status: string;
  customerId: string;
  customer: { name: string };
  slot: { id: string; startsAt: string };
}

function customerToken(userId: string, email = "cliente@example.com") {
  return signTestToken({ sub: userId, email, role: "CUSTOMER" });
}

function adminToken(userId: string, email = "admin@example.com") {
  return signTestToken({ sub: userId, email, role: "ADMIN" });
}

describe("Appointments routes", () => {
  beforeEach(async () => {
    mockCookieStore.reset();
    await resetDatabase();
  });

  afterAll(disconnectDatabase);

  describe("GET /api/appointments", () => {
    it("returns only the customer appointments", async () => {
      const customer = await createUser();
      const other = await createUser();

      const ownSlot = await createSlot();
      const otherSlot = await createSlot({ startsAt: futureDate(96) });

      await createAppointment({ customerId: customer.id, slotId: ownSlot.id });
      await createAppointment({ customerId: other.id, slotId: otherSlot.id });

      mockCookieStore.seed("token", await customerToken(customer.id));

      const response = await getAppointments();

      expect(response.status).toBe(200);

      const body = (await response.json()) as AppointmentBody[];

      expect(body).toHaveLength(1);
      expect(body[0].customerId).toBe(customer.id);
      expect(body[0].slot.startsAt).toBe(ownSlot.startsAt.toISOString());
    });

    it("returns every appointment for an admin", async () => {
      const admin = await createUser({ role: "ADMIN" });
      const customer = await createUser();
      const other = await createUser();

      await createAppointment({
        customerId: customer.id,
        slotId: (await createSlot()).id,
      });
      await createAppointment({
        customerId: other.id,
        slotId: (await createSlot({ startsAt: futureDate(96) })).id,
      });

      mockCookieStore.seed("token", await adminToken(admin.id));

      const response = await getAppointments();

      expect(response.status).toBe(200);

      const body = (await response.json()) as AppointmentBody[];

      expect(body).toHaveLength(2);
    });

    it("returns 401 without a token", async () => {
      const response = await getAppointments();

      expect(response.status).toBe(401);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Não autorizado");
    });
  });

  describe("POST /api/appointments", () => {
    it("creates an appointment for an available slot", async () => {
      const customer = await createUser();
      const slot = await createSlot();

      mockCookieStore.seed("token", await customerToken(customer.id));

      const response = await createAppointmentRoute(
        jsonRequest("/api/appointments", { ...appointmentPayload, slotId: slot.id }),
      );

      expect(response.status).toBe(201);

      const body = (await response.json()) as AppointmentBody;

      expect(body.status).toBe("SCHEDULED");
      expect(body.customerId).toBe(customer.id);
      expect(body.slot.id).toBe(slot.id);
      expect(body.customer.name).toBe(customer.name);
    });

    it("returns 401 without a token", async () => {
      const response = await createAppointmentRoute(
        jsonRequest("/api/appointments", { ...appointmentPayload, slotId: "slot-1" }),
      );

      expect(response.status).toBe(401);
    });

    it("forbids an admin from creating an appointment", async () => {
      const admin = await createUser({ role: "ADMIN" });
      const slot = await createSlot();
      mockCookieStore.seed("token", await adminToken(admin.id));

      const response = await createAppointmentRoute(
        jsonRequest("/api/appointments", { ...appointmentPayload, slotId: slot.id }),
      );

      expect(response.status).toBe(403);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Apenas clientes podem criar agendamentos");
    });

    it("rejects an invalid body with 400", async () => {
      const customer = await createUser();
      mockCookieStore.seed("token", await customerToken(customer.id));

      const response = await createAppointmentRoute(
        jsonRequest("/api/appointments", { slotId: "" }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as { message: string; errors: unknown[] };
      expect(body.message).toBe("Dados inválidos");
      expect(body.errors.length).toBeGreaterThan(0);
    });

    it("returns 404 for an unknown slot", async () => {
      const customer = await createUser();
      mockCookieStore.seed("token", await customerToken(customer.id));

      const response = await createAppointmentRoute(
        jsonRequest("/api/appointments", { ...appointmentPayload, slotId: "missing" }),
      );

      expect(response.status).toBe(404);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Slot não encontrado");
    });

    it("returns 409 for a blocked slot", async () => {
      const customer = await createUser();
      const slot = await createSlot({ isBlocked: true });
      mockCookieStore.seed("token", await customerToken(customer.id));

      const response = await createAppointmentRoute(
        jsonRequest("/api/appointments", { ...appointmentPayload, slotId: slot.id }),
      );

      expect(response.status).toBe(409);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Slot indisponível");
    });

    it("returns 409 for a slot in the past", async () => {
      const customer = await createUser();
      const slot = await createSlot({
        startsAt: new Date(Date.now() - 60 * 60 * 1000),
        endsAt: new Date(Date.now() - 30 * 60 * 1000),
      });
      mockCookieStore.seed("token", await customerToken(customer.id));

      const response = await createAppointmentRoute(
        jsonRequest("/api/appointments", { ...appointmentPayload, slotId: slot.id }),
      );

      expect(response.status).toBe(409);
    });

    it("returns 409 for a slot already booked", async () => {
      const customer = await createUser();
      const other = await createUser();
      const slot = await createSlot();
      await createAppointment({ customerId: other.id, slotId: slot.id });

      mockCookieStore.seed("token", await customerToken(customer.id));

      const response = await createAppointmentRoute(
        jsonRequest("/api/appointments", { ...appointmentPayload, slotId: slot.id }),
      );

      expect(response.status).toBe(409);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Slot indisponível");
    });
  });

  describe("DELETE /api/appointments/[id]", () => {
    it("cancels an appointment with more than 24 hours notice", async () => {
      const customer = await createUser();
      const slot = await createSlot({ startsAt: futureDate(72) });
      const appointment = await createAppointment({
        customerId: customer.id,
        slotId: slot.id,
      });

      mockCookieStore.seed("token", await customerToken(customer.id));

      const response = await cancelAppointmentRoute(
        plainRequest(`/api/appointments/${appointment.id}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: appointment.id }) },
      );

      expect(response.status).toBe(200);

      const body = (await response.json()) as AppointmentBody;

      expect(body.status).toBe("CANCELLED");

      const stored = await prisma.appointment.findUnique({ where: { id: appointment.id } });
      expect(stored?.status).toBe("CANCELLED");
      expect(stored?.cancelledAt).not.toBeNull();
    });

    it("rejects a cancellation with less than 24 hours notice", async () => {
      const customer = await createUser();
      const slot = await createSlot({ startsAt: futureDate(12) });
      const appointment = await createAppointment({
        customerId: customer.id,
        slotId: slot.id,
      });

      mockCookieStore.seed("token", await customerToken(customer.id));

      const response = await cancelAppointmentRoute(
        plainRequest(`/api/appointments/${appointment.id}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: appointment.id }) },
      );

      expect(response.status).toBe(422);
      const body = (await response.json()) as { message: string };
      expect(body.message).toContain("24 horas");

      const stored = await prisma.appointment.findUnique({ where: { id: appointment.id } });
      expect(stored?.status).toBe("SCHEDULED");
    });

    it("lets an admin cancel with less than 24 hours notice", async () => {
      const admin = await createUser({ role: "ADMIN" });
      const customer = await createUser();
      const slot = await createSlot({ startsAt: futureDate(12) });
      const appointment = await createAppointment({
        customerId: customer.id,
        slotId: slot.id,
      });

      mockCookieStore.seed("token", await adminToken(admin.id));

      const response = await cancelAppointmentRoute(
        plainRequest(`/api/appointments/${appointment.id}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: appointment.id }) },
      );

      expect(response.status).toBe(200);

      const body = (await response.json()) as AppointmentBody;
      expect(body.status).toBe("CANCELLED");
    });

    it("returns 404 when the appointment belongs to another customer", async () => {
      const customer = await createUser();
      const other = await createUser();
      const slot = await createSlot({ startsAt: futureDate(72) });
      const appointment = await createAppointment({
        customerId: other.id,
        slotId: slot.id,
      });

      mockCookieStore.seed("token", await customerToken(customer.id));

      const response = await cancelAppointmentRoute(
        plainRequest(`/api/appointments/${appointment.id}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: appointment.id }) },
      );

      expect(response.status).toBe(404);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Agendamento não encontrado");
    });

    it("returns 409 for an already cancelled appointment", async () => {
      const customer = await createUser();
      const slot = await createSlot({ startsAt: futureDate(72) });
      const appointment = await createAppointment({
        customerId: customer.id,
        slotId: slot.id,
        status: "CANCELLED",
      });

      mockCookieStore.seed("token", await customerToken(customer.id));

      const response = await cancelAppointmentRoute(
        plainRequest(`/api/appointments/${appointment.id}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: appointment.id }) },
      );

      expect(response.status).toBe(409);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Agendamento já está cancelado");
    });

    it("returns 401 without a token", async () => {
      const response = await cancelAppointmentRoute(
        plainRequest("/api/appointments/abc", { method: "DELETE" }),
        { params: Promise.resolve({ id: "abc" }) },
      );

      expect(response.status).toBe(401);
    });
  });
});
