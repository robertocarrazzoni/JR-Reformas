import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateInput,
  UpdatePasswordInput,
} from "@/lib/schemas/authSchema";
import {
  AppError,
  AuthenticationError,
  NotFoundError,
} from "@/lib/errors";
import {
  RESET_TOKEN_REUSED_MESSAGE,
  SESSION_REVOKED_MESSAGE,
  isPasswordResetTokenUsed,
  isSessionRevoked,
  signPasswordResetToken,
  signSessionToken,
  verifyPasswordResetToken,
  verifySessionToken,
} from "@/lib/token";
import { runAfterResponse } from "@/lib/background";
import { sendPasswordResetEmail } from "@/lib/mail";

const SCHEDULED = "SCHEDULED" as const;

const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos";

const PASSWORD_RESET_REQUEST_MESSAGE =
  "Se este e-mail estiver cadastrado, você receberá um link de recuperação de senha";

/** `iat` do JWT tem precisão de segundos; a coluna também. */
function nowTruncatedToSecond() {
  return new Date(Math.floor(Date.now() / 1000) * 1000);
}

export async function registerUserService(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError("E-mail já cadastrado");
  }

  const passwordHash = await hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function getUserByIdService(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
}

/**
 * Estado mínimo usado na verificação de sessão (inclusive pelo `auth.ts`):
 * papel atual e marco de troca de senha para revogar JWTs antigos.
 */
export async function getUserAuthStateService(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      passwordChangedAt: true,
    },
  });
}

/**
 * Valida o token e o estado da conta em uma única passada, para os services
 * que recebem o JWT cru (PATCH/DELETE de perfil).
 */
async function requireSessionUser(token: string) {
  const payload = await verifySessionToken(token);
  const state = await getUserAuthStateService(payload.sub);

  if (!state) {
    throw new NotFoundError("Usuário não encontrado");
  }

  if (isSessionRevoked(payload.iat, state.passwordChangedAt)) {
    throw new AuthenticationError(SESSION_REVOKED_MESSAGE);
  }

  return state;
}

export async function loginService(data: LoginInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
    },
  });

  if (!existingUser) {
    throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
  }

  const passwordIsValid = await compare(
    data.password,
    existingUser.passwordHash,
  );

  if (!passwordIsValid) {
    throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
  }

  const token = await signSessionToken({
    sub: existingUser.id,
    email: existingUser.email,
    role: existingUser.role,
  });

  return {
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
    },
    token,
  };
}

export async function updateService(data: UpdateInput, token: string) {
  const state = await requireSessionUser(token);

  if (data.email) {
    const emailInUse = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (emailInUse && emailInUse.id !== state.id) {
      throw new AppError("E-mail já cadastrado");
    }
  }

  try {
    return await prisma.user.update({
      where: { id: state.id },
      data,
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });
  } catch (error) {
    // Corrida entre a checagem acima e o update: o índice único é a última
    // barreira, mas o usuário precisa ver a mesma mensagem.
    if ((error as { code?: string }).code === "P2002") {
      throw new AppError("E-mail já cadastrado");
    }

    throw error;
  }
}

export async function updatePasswordService(
  data: UpdatePasswordInput,
  token: string,
) {
  const state = await requireSessionUser(token);

  const user = await prisma.user.findUnique({
    where: { id: state.id },
  });

  if (!user) {
    throw new NotFoundError("Usuário não encontrado");
  }

  const passwordIsValid = await compare(
    data.currentPassword,
    user.passwordHash,
  );

  if (!passwordIsValid) {
    throw new AppError("Senha atual incorreta");
  }

  const newPasswordHash = await hash(data.newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPasswordHash,
      // Invalida qualquer sessão emitida antes deste instante.
      passwordChangedAt: nowTruncatedToSecond(),
    },
  });

  return { message: "Senha atualizada com sucesso" };
}

export async function forgotPasswordService(data: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  // Resposta idêntica para e-mail existente ou não, para não permitir
  // enumerar contas cadastradas.
  if (!user) {
    return { message: PASSWORD_RESET_REQUEST_MESSAGE };
  }

  const resetToken = await signPasswordResetToken({
    sub: user.id,
    email: user.email,
  });

  // Envio depois da resposta: o tempo de resposta não pode revelar se o
  // e-mail existe. `after()` garante a execução em ambiente serverless.
  runAfterResponse(async () => {
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error("Falha ao enviar o e-mail de recuperação de senha:", error);
    }
  });

  // O link só aparece na resposta com opt-in explícito, nunca por NODE_ENV.
  const resetTokenInResponse =
    process.env.EXPOSE_RESET_TOKEN === "true" ? resetToken : undefined;

  return {
    message: PASSWORD_RESET_REQUEST_MESSAGE,
    resetToken: resetTokenInResponse,
  };
}

export async function resetPasswordService(data: ResetPasswordInput) {
  const payload = await verifyPasswordResetToken(data.token);

  if (payload.type !== "reset-password") {
    throw new AppError("Token inválido para esta operação");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    throw new NotFoundError("Usuário não encontrado");
  }

  // Token de uso único: depois do primeiro reset, `passwordChangedAt` passa a
  // ser posterior (ou igual) ao `iat` do token e ele deixa de valer.
  if (isPasswordResetTokenUsed(payload.iat, user.passwordChangedAt)) {
    throw new AppError(RESET_TOKEN_REUSED_MESSAGE);
  }

  const newPasswordHash = await hash(data.newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPasswordHash,
      passwordChangedAt: nowTruncatedToSecond(),
    },
  });

  return { message: "Senha redefinida com sucesso" };
}

export async function deleteUserService(token: string) {
  const state = await requireSessionUser(token);

  // Somente visitas confirmadas e ainda futuras impedem a exclusão. Histórico
  // (canceladas/passadas) sai junto por cascade, o que viabiliza o direito de
  // exclusão previsto na LGPD.
  const upcomingAppointments = await prisma.appointment.count({
    where: {
      customerId: state.id,
      status: SCHEDULED,
      slot: { startsAt: { gt: new Date() } },
    },
  });

  if (upcomingAppointments > 0) {
    throw new AppError(
      "Não é possível excluir a conta com agendamentos futuros. Cancele as visitas antes de excluir a conta.",
      409,
    );
  }

  await prisma.user.delete({
    where: { id: state.id },
  });

  return { message: "Usuário deletado com sucesso" };
}
