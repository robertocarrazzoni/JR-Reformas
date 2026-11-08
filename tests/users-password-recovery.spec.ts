import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import { forgotPasswordService, resetPasswordService } from "@/services/userService";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import { disconnectDatabase, resetDatabase } from "./helpers/db";
import { createUser } from "./helpers/factories";

jest.mock("@/lib/mail", () => ({
  sendPasswordResetEmail: jest.fn(),
}));

// Fora de um request scope `after()` lança; nos testes a tarefa roda na hora.
jest.mock("@/lib/background", () => ({
  runAfterResponse: (task: () => Promise<void>) => {
    void task();
  },
}));

async function generateTestToken(
  payload: { sub: string; email: string; type: string },
  expiresIn = "15m",
) {
  const encodedSecret = new TextEncoder().encode(process.env.JWT_SECRET as string);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodedSecret);
}

describe("Password Recovery", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await resetDatabase();
  });

  afterAll(disconnectDatabase);

  describe("forgotPasswordService", () => {
    const neutralMessage =
      "Se este e-mail estiver cadastrado, você receberá um link de recuperação de senha";

    it("generates a reset token and sends an email when the user exists", async () => {
      await createUser({ email: "test@example.com" });
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await forgotPasswordService({ email: "test@example.com" });

      expect(result.message).toBe(neutralMessage);
      expect(result.resetToken).toBeUndefined();
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        "test@example.com",
        expect.any(String),
      );

      // The generated token must be usable to reset the password.
      const [, resetToken] = (sendPasswordResetEmail as jest.Mock).mock.calls[0];
      await expect(
        resetPasswordService({ token: resetToken, newPassword: "newSecurePassword123" }),
      ).resolves.toEqual({ message: "Senha redefinida com sucesso" });
    });

    it("returns the same neutral response when the email is not registered", async () => {
      const result = await forgotPasswordService({ email: "notfound@example.com" });

      expect(result).toEqual({ message: neutralMessage });
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("only exposes the reset token with an explicit opt-in", async () => {
      await createUser({ email: "dev@example.com" });
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);
      process.env.EXPOSE_RESET_TOKEN = "true";

      try {
        const result = await forgotPasswordService({ email: "dev@example.com" });

        expect(typeof result.resetToken).toBe("string");
      } finally {
        delete process.env.EXPOSE_RESET_TOKEN;
      }
    });

    it("still answers when the email delivery fails", async () => {
      await createUser({ email: "falha@example.com" });
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue(
        new Error("Falha ao enviar e-mail"),
      );

      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

      try {
        const result = await forgotPasswordService({ email: "falha@example.com" });

        expect(result.message).toBe(neutralMessage);
      } finally {
        consoleError.mockRestore();
      }
    });
  });

  describe("resetPasswordService", () => {
    it("updates the password hash with a valid token", async () => {
      const user = await createUser({ email: "test@example.com" });
      const token = await generateTestToken({
        sub: user.id,
        email: user.email,
        type: "reset-password",
      });

      const result = await resetPasswordService({
        token,
        newPassword: "newSecurePassword123",
      });

      expect(result).toEqual({ message: "Senha redefinida com sucesso" });

      const storedUser = await prisma.user.findUnique({ where: { id: user.id } });
      await expect(
        compare("newSecurePassword123", storedUser!.passwordHash),
      ).resolves.toBe(true);
    });

    it("throws when the token is invalid", async () => {
      await expect(
        resetPasswordService({
          token: "invalid.jwt.token",
          newPassword: "newSecurePassword123",
        }),
      ).rejects.toThrow("Token inválido ou expirado");
    });

    it("rejects reusing a token that already changed the password", async () => {
      const user = await createUser({ email: "reuso@example.com" });
      const token = await generateTestToken({
        sub: user.id,
        email: user.email,
        type: "reset-password",
      });

      await expect(
        resetPasswordService({ token, newPassword: "primeiraSenha123" }),
      ).resolves.toEqual({ message: "Senha redefinida com sucesso" });

      await expect(
        resetPasswordService({ token, newPassword: "segundaSenha123" }),
      ).rejects.toThrow("já foi utilizado");
    });

    it("throws when the token type is not reset-password", async () => {
      const token = await generateTestToken({
        sub: "user-123",
        email: "test@example.com",
        type: "wrong-type",
      });

      await expect(
        resetPasswordService({ token, newPassword: "newSecurePassword123" }),
      ).rejects.toThrow("Token inválido para esta operação");
    });

    it("throws when the token points to a user that does not exist", async () => {
      const token = await generateTestToken({
        sub: "missing-user",
        email: "missing@example.com",
        type: "reset-password",
      });

      await expect(
        resetPasswordService({ token, newPassword: "newSecurePassword123" }),
      ).rejects.toThrow("Usuário não encontrado");
    });
  });
});
