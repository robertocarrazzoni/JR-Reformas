import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import { mockCookieStore } from "./helpers/cookies";
import { resetDatabase, disconnectDatabase } from "./helpers/db";
import {
  createAppointment,
  createSlot,
  createUser,
  futureDate,
  pastDate,
} from "./helpers/factories";
import { signTestToken } from "./helpers/auth";
import { jsonRequest, plainRequest } from "./helpers/request";

jest.mock("next/headers", () => ({
  cookies: async () => mockCookieStore,
}));

import { GET as getSlots, POST as createSlotRoute } from "@/app/api/slots/route";
import {
  DELETE as deleteSlotRoute,
  PATCH as updateSlotRoute,
} from "@/app/api/slots/[id]/route";
import { GET as getAdminSlots } from "@/app/api/admin/slots/route";
import { prisma } from "@/lib/prisma";

interface SlotBody {
  id: string;
  startsAt: string;
  endsAt: string;
  isBlocked: boolean;
}

describe("Slots routes", () => {
  beforeEach(async () => {
    mockCookieStore.reset();
    await resetDatabase();
  });

  afterAll(disconnectDatabase);

  describe("GET /api/slots", () => {
    it("returns only available slots as ISO dates", async () => {
      const available = await createSlot();
      const blocked = await createSlot({ startsAt: futureDate(72), isBlocked: true });

      const response = await getSlots();

      expect(response.status).toBe(200);

      const body = (await response.json()) as SlotBody[];
      const ids = body.map((slot) => slot.id);

      expect(ids).toEqual([available.id]);
      expect(ids).not.toContain(blocked.id);
      expect(body[0].startsAt).toBe(available.startsAt.toISOString());
    });
  });

  describe("POST /api/slots", () => {
    it("creates a slot", async () => {
      const startsAt = futureDate(48);
      const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

      const response = await createSlotRoute(
        jsonRequest("/api/slots", {
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
        }),
      );

      expect(response.status).toBe(200);

      const body = (await response.json()) as SlotBody;

      expect(body.startsAt).toBe(startsAt.toISOString());
      expect(body.isBlocked).toBe(false);

      await expect(
        prisma.availabilitySlot.findUnique({ where: { id: body.id } }),
      ).resolves.not.toBeNull();
    });

    it("rejects an end date before the start date", async () => {
      const response = await createSlotRoute(
        jsonRequest("/api/slots", {
          startsAt: futureDate(48).toISOString(),
          endsAt: futureDate(24).toISOString(),
        }),
      );

      expect(response.status).toBe(400);

      const body = (await response.json()) as { message: string; errors: unknown[] };

      expect(body.message).toBe("DADOS INVALIDOS");
      expect(body.errors.length).toBeGreaterThan(0);
    });

    it("rejects a start date in the past", async () => {
      const response = await createSlotRoute(
        jsonRequest("/api/slots", {
          startsAt: pastDate(48).toISOString(),
          endsAt: pastDate(47).toISOString(),
        }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("DADOS INVALIDOS");
    });

    it("rejects an invalid body", async () => {
      const response = await createSlotRoute(jsonRequest("/api/slots", {}));

      expect(response.status).toBe(400);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("DADOS INVALIDOS");
    });
  });

  describe("PATCH /api/slots/[id]", () => {
    it("blocks a slot", async () => {
      const slot = await createSlot();

      const response = await updateSlotRoute(
        jsonRequest("/api/slots/1", { isBlocked: true }, { method: "PATCH" }),
        { params: Promise.resolve({ id: slot.id }) },
      );

      expect(response.status).toBe(200);

      const body = (await response.json()) as {
        message: string;
        slot: { startsAt: string; endsAt: string };
      };

      expect(body.message).toBe("Slot atualizado com sucesso");
      expect(body.slot.startsAt).toBe(slot.startsAt.toISOString());

      const stored = await prisma.availabilitySlot.findUnique({ where: { id: slot.id } });
      expect(stored?.isBlocked).toBe(true);
    });

    it("rejects an end date before the start date", async () => {
      const slot = await createSlot();

      const response = await updateSlotRoute(
        jsonRequest(
          "/api/slots/1",
          {
            startsAt: futureDate(48).toISOString(),
            endsAt: futureDate(24).toISOString(),
          },
          { method: "PATCH" },
        ),
        { params: Promise.resolve({ id: slot.id }) },
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("DADOS INVALIDOS");
    });

    it("returns 400 for an unknown slot", async () => {
      const response = await updateSlotRoute(
        jsonRequest("/api/slots/missing", { isBlocked: true }, { method: "PATCH" }),
        { params: Promise.resolve({ id: "missing" }) },
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Não foi possível atualizar o horário");
    });
  });

  describe("DELETE /api/slots/[id]", () => {
    it("deletes a slot without appointments", async () => {
      const slot = await createSlot();

      const response = await deleteSlotRoute(plainRequest(`/api/slots/${slot.id}`, {
        method: "DELETE",
      }), { params: Promise.resolve({ id: slot.id }) });

      expect(response.status).toBe(200);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Slot deletado com sucesso");

      await expect(
        prisma.availabilitySlot.findUnique({ where: { id: slot.id } }),
      ).resolves.toBeNull();
    });

    it("blocks deletion when there is an appointment", async () => {
      const user = await createUser();
      const slot = await createSlot();
      await createAppointment({ customerId: user.id, slotId: slot.id });

      const response = await deleteSlotRoute(plainRequest(`/api/slots/${slot.id}`, {
        method: "DELETE",
      }), { params: Promise.resolve({ id: slot.id }) });

      expect(response.status).toBe(400);
      const body = (await response.json()) as { message: string };
      expect(body.message).toContain("agendamento vinculado");

      await expect(
        prisma.availabilitySlot.findUnique({ where: { id: slot.id } }),
      ).resolves.not.toBeNull();
    });

    it("returns 400 for an unknown slot", async () => {
      const response = await deleteSlotRoute(
        plainRequest("/api/slots/missing", { method: "DELETE" }),
        { params: Promise.resolve({ id: "missing" }) },
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Slot não encontrado");
    });
  });

  describe("GET /api/admin/slots", () => {
    it("returns serialized slots with their appointments", async () => {
      const admin = await createUser({ role: "ADMIN" });
      const user = await createUser({ name: "Cliente Admin" });
      const slot = await createSlot();
      await createAppointment({ customerId: user.id, slotId: slot.id });

      mockCookieStore.seed(
        "token",
        await signTestToken({ sub: admin.id, email: admin.email, role: "ADMIN" }),
      );

      const response = await getAdminSlots();

      expect(response.status).toBe(200);

      const body = (await response.json()) as Array<{
        id: string;
        startsAt: string;
        appointments: Array<{
          id: string;
          customer: { name: string };
          slot: { id: string };
        }>;
      }>;

      expect(body).toHaveLength(1);
      expect(body[0].id).toBe(slot.id);
      expect(body[0].startsAt).toBe(slot.startsAt.toISOString());
      expect(body[0].appointments).toHaveLength(1);
      expect(body[0].appointments[0].customer.name).toBe("Cliente Admin");
      expect(body[0].appointments[0].slot.id).toBe(slot.id);
    });

    it("returns 401 without a token", async () => {
      const response = await getAdminSlots();

      expect(response.status).toBe(401);
    });

    it("returns 403 for a customer", async () => {
      const customer = await createUser();
      mockCookieStore.seed(
        "token",
        await signTestToken({ sub: customer.id, email: customer.email, role: "CUSTOMER" }),
      );

      const response = await getAdminSlots();

      expect(response.status).toBe(403);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Acesso proibido");
    });
  });
});
