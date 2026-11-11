import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import { mockCookieStore } from "./helpers/cookies";
import { resetDatabase, disconnectDatabase } from "./helpers/db";
import { createUser } from "./helpers/factories";
import { signTestToken } from "./helpers/auth";
import { jsonRequest } from "./helpers/request";

jest.mock("next/headers", () => ({
  cookies: async () => mockCookieStore,
}));

jest.mock("@/lib/mail", () => ({
  sendPasswordResetEmail: jest.fn(),
}));

// Fora de um request scope `after()` lança; nos testes a tarefa roda na hora.
jest.mock("@/lib/background", () => ({
  runAfterResponse: (task: () => Promise<void>) => {
    void task();
  },
}));

import { PATCH as updatePassword } from "@/app/api/users/password/route";
import { POST as forgotPassword } from "@/app/api/users/forgot-password/route";
import { POST as resetPassword } from "@/app/api/users/reset-password/route";
import { sendPasswordResetEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

interface MessageResponse {
  message: string;
  errors?: unknown[];
  resetToken?: string;
}

describe("Users password routes", () => {
  beforeEach(async () => {
    mockCookieStore.reset();
    jest.clearAllMocks();
    await resetDatabase();
  });

  afterAll(disconnectDatabase);

  describe("PATCH /api/users/password", () => {
    it("replaces the password hash", async () => {
      const user = await createUser({
        email: "senha@example.com",
        password: "password123",
      });

      mockCookieStore.seed("token", await signTestToken({ sub: user.id, email: user.email }));

      const response = await updatePassword(
        jsonRequest("/api/users/password", {
          currentPassword: "password123",
          newPassword: "novaSenha456",
        }),
      );

      expect(response.status).toBe(200);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Senha atualizada com sucesso");

      const stored = await prisma.user.findUnique({ where: { id: user.id } });

      await expect(compare("novaSenha456", stored?.passwordHash as string)).resolves.toBe(
        true,
      );
      await expect(compare("password123", stored?.passwordHash as string)).resolves.toBe(
        false,
      );
    });

    it("updates the password of an ADMIN account", async () => {
      const admin = await createUser({
        email: "admin-senha@example.com",
        password: "password123",
        role: "ADMIN",
      });

      mockCookieStore.seed(
        "token",
        await signTestToken({ sub: admin.id, email: admin.email, role: "ADMIN" }),
      );

      const response = await updatePassword(
        jsonRequest("/api/users/password", {
          currentPassword: "password123",
          newPassword: "novaSenha456",
        }),
      );

      expect(response.status).toBe(200);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Senha atualizada com sucesso");

      const stored = await prisma.user.findUnique({ where: { id: admin.id } });

      await expect(
        compare("novaSenha456", stored?.passwordHash as string),
      ).resolves.toBe(true);
      expect(stored?.role).toBe("ADMIN");
    });

    it("rejects a wrong current password with 400", async () => {
      const user = await createUser({ password: "password123" });
      mockCookieStore.seed("token", await signTestToken({ sub: user.id, email: user.email }));

      const response = await updatePassword(
        jsonRequest("/api/users/password", {
          currentPassword: "senha-errada",
          newPassword: "novaSenha456",
        }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Senha atual incorreta");
    });

    it("returns 401 without a token", async () => {
      const response = await updatePassword(
        jsonRequest("/api/users/password", {
          currentPassword: "password123",
          newPassword: "novaSenha456",
        }),
      );

      expect(response.status).toBe(401);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Não autorizado. Token ausente.");
    });

    it("returns 400 for an invalid body", async () => {
      const user = await createUser();
      mockCookieStore.seed("token", await signTestToken({ sub: user.id, email: user.email }));

      const response = await updatePassword(
        jsonRequest("/api/users/password", { currentPassword: "password123" }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Dados inválidos");
    });
  });

  describe("POST /api/users/forgot-password", () => {
    const neutralMessage =
      "Se este e-mail estiver cadastrado, você receberá um link de recuperação de senha";

    it("sends the reset e-mail for an existing user", async () => {
      await createUser({ email: "esqueci@example.com" });

      const response = await forgotPassword(
        jsonRequest("/api/users/forgot-password", { email: "esqueci@example.com" }),
      );

      expect(response.status).toBe(200);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe(neutralMessage);
      expect(body.resetToken).toBeUndefined();

      const mail = sendPasswordResetEmail as jest.MockedFunction<
        typeof sendPasswordResetEmail
      >;

      expect(mail).toHaveBeenCalledTimes(1);
      expect(mail.mock.calls[0][0]).toBe("esqueci@example.com");
      expect(typeof mail.mock.calls[0][1]).toBe("string");
    });

    it("answers the same way for an unknown e-mail and sends nothing", async () => {
      const response = await forgotPassword(
        jsonRequest("/api/users/forgot-password", { email: "ninguem@example.com" }),
      );

      expect(response.status).toBe(200);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe(neutralMessage);

      const mail = sendPasswordResetEmail as jest.MockedFunction<
        typeof sendPasswordResetEmail
      >;

      expect(mail).not.toHaveBeenCalled();
    });

    it("returns 400 for an invalid body", async () => {
      const response = await forgotPassword(
        jsonRequest("/api/users/forgot-password", { email: "nao-e-email" }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Dados inválidos");
    });

    it("stops sending e-mails after 3 requests for the same address", async () => {
      await createUser({ email: "flood@example.com" });

      const mail = sendPasswordResetEmail as jest.MockedFunction<
        typeof sendPasswordResetEmail
      >;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const response = await forgotPassword(
          jsonRequest("/api/users/forgot-password", {
            email: "flood@example.com",
          }),
        );

        expect(response.status).toBe(200);
      }

      const blocked = await forgotPassword(
        jsonRequest("/api/users/forgot-password", {
          email: "flood@example.com",
        }),
      );

      expect(blocked.status).toBe(429);
      expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
      expect(mail).toHaveBeenCalledTimes(3);
    });
  });

  describe("POST /api/users/reset-password", () => {
    it("resets the password with a valid token", async () => {
      const user = await createUser({ password: "password123" });

      const token = await signTestToken(
        { sub: user.id, email: user.email, type: "reset-password" },
        "15m",
      );

      const response = await resetPassword(
        jsonRequest("/api/users/reset-password", {
          token,
          newPassword: "redefinida789",
        }),
      );

      expect(response.status).toBe(200);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Senha redefinida com sucesso");

      const stored = await prisma.user.findUnique({ where: { id: user.id } });
      await expect(
        compare("redefinida789", stored?.passwordHash as string),
      ).resolves.toBe(true);
    });

    it("rejects reusing the same reset token", async () => {
      const user = await createUser({ password: "password123" });

      const token = await signTestToken(
        { sub: user.id, email: user.email, type: "reset-password" },
        "15m",
      );

      const first = await resetPassword(
        jsonRequest("/api/users/reset-password", {
          token,
          newPassword: "primeiraSenha789",
        }),
      );

      expect(first.status).toBe(200);

      const second = await resetPassword(
        jsonRequest("/api/users/reset-password", {
          token,
          newPassword: "segundaSenha789",
        }),
      );

      expect(second.status).toBe(400);
      const body = (await second.json()) as MessageResponse;
      expect(body.message).toContain("já foi utilizado");

      const stored = await prisma.user.findUnique({ where: { id: user.id } });
      await expect(
        compare("primeiraSenha789", stored?.passwordHash as string),
      ).resolves.toBe(true);
    });

    it("rejects an expired token with 400", async () => {
      const user = await createUser();
      const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);

      const expiredToken = await new SignJWT({
        sub: user.id,
        email: user.email,
        type: "reset-password",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
        .sign(secret);

      const response = await resetPassword(
        jsonRequest("/api/users/reset-password", {
          token: expiredToken,
          newPassword: "redefinida789",
        }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Token inválido ou expirado");
    });

    it("rejects a token with the wrong type", async () => {
      const user = await createUser();
      const token = await signTestToken({
        sub: user.id,
        email: user.email,
        type: "outra-operacao",
      });

      const response = await resetPassword(
        jsonRequest("/api/users/reset-password", {
          token,
          newPassword: "redefinida789",
        }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Token inválido para esta operação");
    });

    it("rejects an invalid token with 400", async () => {
      const response = await resetPassword(
        jsonRequest("/api/users/reset-password", {
          token: "token-invalido",
          newPassword: "redefinida789",
        }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Token inválido ou expirado");
    });

    it("returns 400 for an invalid body", async () => {
      const response = await resetPassword(
        jsonRequest("/api/users/reset-password", { token: "" }),
      );

      expect(response.status).toBe(400);
      const body = (await response.json()) as MessageResponse;
      expect(body.message).toBe("Dados inválidos");
    });
  });
});
