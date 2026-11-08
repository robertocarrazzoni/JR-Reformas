import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import { AuthenticationError, getAuthenticatedUser } from "@/lib/auth";
import { SESSION_REVOKED_MESSAGE } from "@/lib/token";
import { prisma } from "@/lib/prisma";
import { signTestToken } from "./helpers/auth";
import { disconnectDatabase, resetDatabase } from "./helpers/db";
import { createUser } from "./helpers/factories";

describe("Session validation", () => {
  beforeEach(resetDatabase);

  afterAll(disconnectDatabase);

  it("returns the user id and the role stored in the database", async () => {
    const user = await createUser({ role: "ADMIN" });
    const token = await signTestToken({
      sub: user.id,
      email: user.email,
      role: "CUSTOMER", // papel do banco vence o do token
    });

    await expect(getAuthenticatedUser(token)).resolves.toEqual({
      userId: user.id,
      role: "ADMIN",
    });
  });

  it("rejects a missing or invalid token", async () => {
    await expect(getAuthenticatedUser(undefined)).rejects.toBeInstanceOf(
      AuthenticationError,
    );
    await expect(getAuthenticatedUser("token-invalido")).rejects.toThrow(
      "Token inexistente ou inválido",
    );
  });

  it("rejects a token issued before the last password change", async () => {
    const user = await createUser();
    const token = await signTestToken({ sub: user.id, email: user.email });

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordChangedAt: new Date(Date.now() + 5_000) },
    });

    await expect(getAuthenticatedUser(token)).rejects.toThrow(
      SESSION_REVOKED_MESSAGE,
    );
  });

  it("accepts a token issued after the last password change", async () => {
    const user = await createUser();
    const token = await signTestToken({ sub: user.id, email: user.email });

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordChangedAt: new Date(Date.now() - 5_000) },
    });

    await expect(getAuthenticatedUser(token)).resolves.toMatchObject({
      userId: user.id,
    });
  });

  it("rejects a token for a user that no longer exists", async () => {
    const user = await createUser();
    const token = await signTestToken({ sub: user.id, email: user.email });

    await prisma.user.delete({ where: { id: user.id } });

    await expect(getAuthenticatedUser(token)).rejects.toThrow(
      "Usuário não encontrado",
    );
  });
});
