import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import {
  deleteUserService,
  loginService,
  registerUserService,
  updatePasswordService,
  updateService,
} from "@/services/userService";
import { prisma } from "@/lib/prisma";
import { resetDatabase, disconnectDatabase } from "./helpers/db";
import { createAppointment, createSlot, createUser, pastDate } from "./helpers/factories";

async function generateTestToken(sub: string, email: string, role = "CUSTOMER") {
  const encodedSecret = new TextEncoder().encode(process.env.JWT_SECRET as string);

  return new SignJWT({ sub, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(encodedSecret);
}

describe("User Lifecycle", () => {
  beforeEach(resetDatabase);

  afterAll(disconnectDatabase);

  describe("registerUserService", () => {
    it("persists a new user with a hashed password", async () => {
      const user = await registerUserService({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "11999999999",
      });

      expect(user).toMatchObject({
        name: "Test User",
        email: "test@example.com",
        phone: "11999999999",
        role: "CUSTOMER",
      });
      expect(user).not.toHaveProperty("passwordHash");

      const storedUser = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });

      expect(storedUser).not.toBeNull();
      await expect(compare("password123", storedUser!.passwordHash)).resolves.toBe(true);
    });

    it("throws when the email is already registered", async () => {
      await createUser({ email: "test@example.com" });

      await expect(
        registerUserService({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("E-mail já cadastrado");

      await expect(prisma.user.count()).resolves.toBe(1);
    });
  });

  describe("loginService", () => {
    it("returns a token and the user on valid credentials", async () => {
      await createUser({ email: "test@example.com", password: "password123" });

      const result = await loginService({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toHaveProperty("token");
      expect(result.user).toMatchObject({
        email: "test@example.com",
        role: "CUSTOMER",
      });
    });

    it("throws when the email is not registered", async () => {
      await expect(
        loginService({ email: "wrong@example.com", password: "password123" }),
      ).rejects.toThrow("E-mail ou senha inválidos");
    });

    it("throws when the password is wrong", async () => {
      await createUser({ email: "test@example.com", password: "password123" });

      await expect(
        loginService({ email: "test@example.com", password: "wrongpassword" }),
      ).rejects.toThrow("E-mail ou senha inválidos");
    });
  });

  describe("updateService", () => {
    it("updates the user profile in the database", async () => {
      const user = await createUser({ email: "test@example.com" });
      const token = await generateTestToken(user.id, user.email);

      const result = await updateService(
        { name: "New Name", phone: "11888888888" },
        token,
      );

      expect(result).toEqual({
        name: "New Name",
        email: "test@example.com",
        phone: "11888888888",
      });

      const storedUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(storedUser).toMatchObject({
        name: "New Name",
        phone: "11888888888",
      });
    });

    it("throws when the token is invalid", async () => {
      await expect(
        updateService({ name: "New Name" }, "token-invalido"),
      ).rejects.toThrow("Token inexistente ou inválido");
    });

    it("rejects an e-mail already used by another account", async () => {
      const user = await createUser({ email: "eu@example.com" });
      await createUser({ email: "ocupado@example.com" });
      const token = await generateTestToken(user.id, user.email);

      await expect(
        updateService({ email: "ocupado@example.com" }, token),
      ).rejects.toThrow("E-mail já cadastrado");

      const stored = await prisma.user.findUnique({ where: { id: user.id } });
      expect(stored?.email).toBe("eu@example.com");
    });
  });

  describe("updatePasswordService", () => {
    it("updates the stored password hash", async () => {
      const user = await createUser({
        email: "test@example.com",
        password: "currentPassword",
      });
      const token = await generateTestToken(user.id, user.email);

      const result = await updatePasswordService(
        { currentPassword: "currentPassword", newPassword: "newPassword123" },
        token,
      );

      expect(result).toEqual({ message: "Senha atualizada com sucesso" });

      const storedUser = await prisma.user.findUnique({ where: { id: user.id } });
      await expect(compare("newPassword123", storedUser!.passwordHash)).resolves.toBe(true);
      await expect(compare("currentPassword", storedUser!.passwordHash)).resolves.toBe(false);
      expect(storedUser?.passwordChangedAt).toBeInstanceOf(Date);
    });

    it("rejects an incorrect current password and keeps the hash", async () => {
      const user = await createUser({
        email: "test@example.com",
        password: "currentPassword",
      });
      const token = await generateTestToken(user.id, user.email);

      await expect(
        updatePasswordService(
          { currentPassword: "wrongPassword", newPassword: "newPassword123" },
          token,
        ),
      ).rejects.toThrow("Senha atual incorreta");

      const storedUser = await prisma.user.findUnique({ where: { id: user.id } });
      await expect(compare("currentPassword", storedUser!.passwordHash)).resolves.toBe(true);
    });
  });

  describe("deleteUserService", () => {
    it("removes the user from the database", async () => {
      const user = await createUser({ email: "test@example.com" });
      const token = await generateTestToken(user.id, user.email);

      const result = await deleteUserService(token);

      expect(result).toEqual({ message: "Usuário deletado com sucesso" });
      await expect(prisma.user.findUnique({ where: { id: user.id } })).resolves.toBeNull();
    });

    it("throws when the user does not exist", async () => {
      const token = await generateTestToken("missing-user", "missing@example.com");

      await expect(deleteUserService(token)).rejects.toThrow("Usuário não encontrado");
    });

    it("blocks deletion when the user has a future scheduled appointment", async () => {
      const user = await createUser({ email: "com-agendamento@example.com" });
      const slot = await createSlot();
      await createAppointment({ customerId: user.id, slotId: slot.id });

      const token = await generateTestToken(user.id, user.email);

      await expect(deleteUserService(token)).rejects.toThrow(
        "Não é possível excluir a conta com agendamentos futuros",
      );

      await expect(
        prisma.user.findUnique({ where: { id: user.id } }),
      ).resolves.not.toBeNull();
    });

    it("allows deletion when the only appointment was cancelled", async () => {
      const user = await createUser({ email: "cancelado@example.com" });
      const slot = await createSlot();
      await createAppointment({
        customerId: user.id,
        slotId: slot.id,
        status: "CANCELLED",
      });

      const token = await generateTestToken(user.id, user.email);

      await expect(deleteUserService(token)).resolves.toEqual({
        message: "Usuário deletado com sucesso",
      });

      await expect(
        prisma.user.findUnique({ where: { id: user.id } }),
      ).resolves.toBeNull();
      await expect(prisma.appointment.count()).resolves.toBe(0);
    });

    it("allows deletion when the appointment is already in the past", async () => {
      const user = await createUser({ email: "passado@example.com" });
      const slot = await createSlot({ startsAt: pastDate(48), endsAt: pastDate(47) });
      await createAppointment({ customerId: user.id, slotId: slot.id });

      const token = await generateTestToken(user.id, user.email);

      await expect(deleteUserService(token)).resolves.toEqual({
        message: "Usuário deletado com sucesso",
      });
    });
  });
});
