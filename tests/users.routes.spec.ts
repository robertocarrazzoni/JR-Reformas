import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import { compare } from "bcryptjs";
import { jwtVerify } from "jose";
import { mockCookieStore } from "./helpers/cookies";
import { resetDatabase, disconnectDatabase } from "./helpers/db";
import { createAppointment, createSlot, createUser } from "./helpers/factories";
import { signTestToken } from "./helpers/auth";
import { jsonRequest } from "./helpers/request";

jest.mock("next/headers", () => ({
  cookies: async () => mockCookieStore,
}));

import {
  DELETE as deleteUser,
  PATCH as updateUser,
  POST as registerUser,
} from "@/app/api/users/route";
import { POST as login } from "@/app/api/users/login/route";
import { POST as logout } from "@/app/api/users/logout/route";
import { prisma } from "@/lib/prisma";

interface UserBody {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

interface RegisterResponse {
  message: string;
  user: UserBody;
}

interface LoginResponse {
  message: string;
  user: { id: string; name: string; email: string; role: string };
}

interface MessageResponse {
  message: string;
  errors?: unknown[];
}

interface UpdateResponse {
  message: string;
  user: { name: string; email: string; phone: string | null };
}

describe("Users routes", () => {
  beforeEach(async () => {
    mockCookieStore.reset();
    await resetDatabase();
  });

  afterAll(disconnectDatabase);

  describe("POST /api/users", () => {
    it("creates a customer and never returns the password hash", async () => {
      const response = await registerUser(
        jsonRequest("/api/users", {
          name: "Novo Cliente",
          email: "novo@example.com",
          password: "segredo123",
          phone: "11999999999",
        }),
      );

      expect(response.status).toBe(201);

      const body = (await response.json()) as RegisterResponse;

      expect(body.message).toBe("Usuário cadastrado com sucesso");
      expect(body.user).toMatchObject({
        name: "Novo Cliente",
        email: "novo@example.com",
        phone: "11999999999",
        role: "CUSTOMER",
      });
      expect(body.user).not.toHaveProperty("passwordHash");

      const stored = await prisma.user.findUnique({
        where: { email: "novo@example.com" },
      });

      expect(stored).not.toBeNull();
      expect(stored?.passwordHash).not.toBe("segredo123");
      await expect(compare("segredo123", stored?.passwordHash as string)).resolves.toBe(
        true,
      );
    });

    it("rejects a duplicated e-mail with 400", async () => {
      await createUser({ email: "duplicado@example.com" });

      const response = await registerUser(
        jsonRequest("/api/users", {
          name: "Outro Cliente",
          email: "duplicado@example.com",
          password: "segredo123",
        }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("E-mail já cadastrado");
    });

    it("rejects an invalid body with 400 and the Zod issues", async () => {
      const response = await registerUser(
        jsonRequest("/api/users", {
          name: "A",
          email: "nao-e-email",
          password: "123",
        }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Dados inválidos");
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors?.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/users/login", () => {
    it("returns the user and writes an httpOnly auth cookie", async () => {
      const user = await createUser({
        email: "cliente@example.com",
        password: "password123",
      });

      const response = await login(
        jsonRequest("/api/users/login", {
          email: "cliente@example.com",
          password: "password123",
        }),
      );

      expect(response.status).toBe(200);

      const body = (await response.json()) as LoginResponse;

      expect(body.user).toMatchObject({
        id: user.id,
        name: user.name,
        email: "cliente@example.com",
        role: "CUSTOMER",
      });
      expect(body.user).not.toHaveProperty("passwordHash");

      const write = mockCookieStore.lastWrite("token");

      expect(write).toBeDefined();
      expect(write?.value).toBeTruthy();
      expect(write?.options).toMatchObject({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
      const { payload } = await jwtVerify(write?.value as string, secret);

      expect(payload.sub).toBe(user.id);
      expect(payload.role).toBe("CUSTOMER");
    });

    it("returns 401 for a wrong password", async () => {
      await createUser({
        email: "cliente@example.com",
        password: "password123",
      });

      const response = await login(
        jsonRequest("/api/users/login", {
          email: "cliente@example.com",
          password: "senha-errada",
        }),
      );

      expect(response.status).toBe(401);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("E-mail ou senha inválidos");
      expect(mockCookieStore.has("token")).toBe(false);
    });

    it("returns 401 for an unknown e-mail", async () => {
      const response = await login(
        jsonRequest("/api/users/login", {
          email: "ninguem@example.com",
          password: "password123",
        }),
      );

      expect(response.status).toBe(401);
      expect(mockCookieStore.has("token")).toBe(false);
    });

    it("returns 400 for an invalid body", async () => {
      const response = await login(
        jsonRequest("/api/users/login", { email: "nao-e-email" }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Dados inválidos");
    });

    it("blocks the 11th attempt in the same window with 429 and Retry-After", async () => {
      await createUser({
        email: "brute@example.com",
        password: "password123",
      });

      let lastStatus = 0;

      for (let attempt = 0; attempt < 10; attempt += 1) {
        const response = await login(
          jsonRequest("/api/users/login", {
            email: "brute@example.com",
            password: "senha-errada",
          }),
        );

        lastStatus = response.status;
        expect(response.status).toBe(401);
      }

      expect(lastStatus).toBe(401);

      const blocked = await login(
        jsonRequest("/api/users/login", {
          email: "brute@example.com",
          password: "senha-errada",
        }),
      );

      expect(blocked.status).toBe(429);
      expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
      const body = (await blocked.json()) as MessageResponse;
      expect(body.message).toContain("Muitas tentativas");

      // Outro e-mail a partir do mesmo IP não é afetado.
      const other = await login(
        jsonRequest("/api/users/login", {
          email: "outro@example.com",
          password: "senha-errada",
        }),
      );

      expect(other.status).toBe(401);
    });
  });

  describe("POST /api/users/logout", () => {
    it("clears the auth cookie", async () => {
      mockCookieStore.seed("token", "token-qualquer");

      const response = await logout();

      expect(response.status).toBe(200);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Sessão encerrada com sucesso");

      expect(mockCookieStore.has("token")).toBe(false);
      expect(mockCookieStore.lastWrite("token")?.options).toMatchObject({
        httpOnly: true,
        maxAge: 0,
      });
    });
  });

  describe("PATCH /api/users", () => {
    it("returns exactly name, email and phone after the update", async () => {
      const user = await createUser({ email: "antigo@example.com" });
      mockCookieStore.seed("token", await signTestToken({ sub: user.id, email: user.email }));

      const response = await updateUser(
        jsonRequest("/api/users", {
          name: "Nome Atualizado",
          email: "novo@example.com",
          phone: "11988887777",
        }),
      );

      expect(response.status).toBe(200);

      const body = (await response.json()) as UpdateResponse;

      expect(body.message).toBe("Usuário atualizado com sucesso");
      expect(Object.keys(body.user).sort()).toEqual(["email", "name", "phone"]);
      expect(body.user).toEqual({
        name: "Nome Atualizado",
        email: "novo@example.com",
        phone: "11988887777",
      });

      const stored = await prisma.user.findUnique({ where: { id: user.id } });
      expect(stored?.name).toBe("Nome Atualizado");
      expect(stored?.email).toBe("novo@example.com");
    });

    it("returns 401 without a token", async () => {
      const response = await updateUser(
        jsonRequest("/api/users", { name: "Sem Token" }),
      );

      expect(response.status).toBe(401);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Não autorizado. Token ausente.");
    });

    it("returns 400 for an invalid body", async () => {
      const user = await createUser();
      mockCookieStore.seed("token", await signTestToken({ sub: user.id, email: user.email }));

      const response = await updateUser(
        jsonRequest("/api/users", { name: "A", email: "nao-e-email" }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Dados inválidos");
    });

    it("returns 401 for an invalid token", async () => {
      mockCookieStore.seed("token", "token-invalido");

      const response = await updateUser(
        jsonRequest("/api/users", { name: "Nome Válido" }),
      );

      expect(response.status).toBe(401);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Token inexistente ou inválido");
    });

    it("rejects an e-mail already used by another account with 400", async () => {
      const user = await createUser({ email: "eu@example.com" });
      await createUser({ email: "ocupado@example.com" });
      mockCookieStore.seed(
        "token",
        await signTestToken({ sub: user.id, email: user.email }),
      );

      const response = await updateUser(
        jsonRequest("/api/users", { email: "ocupado@example.com" }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("E-mail já cadastrado");
    });
  });

  describe("DELETE /api/users", () => {
    it("deletes the account and clears the cookie", async () => {
      const user = await createUser();
      mockCookieStore.seed("token", await signTestToken({ sub: user.id, email: user.email }));

      const response = await deleteUser();

      expect(response.status).toBe(200);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Usuário deletado com sucesso");

      await expect(
        prisma.user.findUnique({ where: { id: user.id } }),
      ).resolves.toBeNull();

      expect(mockCookieStore.has("token")).toBe(false);
      expect(mockCookieStore.lastWrite("token")?.options).toMatchObject({ maxAge: 0 });
    });

    it("blocks deletion when the user has a future appointment", async () => {
      const user = await createUser();
      const slot = await createSlot();
      await createAppointment({ customerId: user.id, slotId: slot.id });

      mockCookieStore.seed("token", await signTestToken({ sub: user.id, email: user.email }));

      const response = await deleteUser();

      expect(response.status).toBe(409);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toContain("agendamentos futuros");

      await expect(
        prisma.user.findUnique({ where: { id: user.id } }),
      ).resolves.not.toBeNull();
      expect(mockCookieStore.has("token")).toBe(true);
    });

    it("returns 401 without a token", async () => {
      const response = await deleteUser();

      expect(response.status).toBe(401);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Não autorizado. Token ausente.");
    });
  });
});

