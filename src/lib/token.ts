import { SignJWT, jwtVerify } from "jose";
import { AppError, AuthenticationError } from "@/lib/errors";

const SESSION_EXPIRATION = "1d";
const PASSWORD_RESET_EXPIRATION = "15m";

export const SESSION_REVOKED_MESSAGE =
  "Sessão expirada. Faça login novamente.";

export const RESET_TOKEN_REUSED_MESSAGE =
  "Este link de redefinição já foi utilizado. Solicite um novo.";

export interface SessionTokenPayload {
  sub: string;
  email?: string;
  role: string;
  /** Emitido em segundos (padrão JWT). Usado para revogar sessões antigas. */
  iat?: number;
}

export interface PasswordResetTokenPayload {
  sub: string;
  iat?: number;
}

interface RawTokenPayload {
  sub?: string;
  email?: string;
  role?: string;
  type?: string;
  iat?: number;
}

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT_SECRET não está configurado", 500);
  }

  return new TextEncoder().encode(secret);
}

/** Um único ponto de verificação de assinatura/expiração para todo o app. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionTokenPayload> {
  if (!token) {
    throw new AuthenticationError("Não autorizado");
  }

  try {
    const { payload } = await jwtVerify<RawTokenPayload>(token, secretKey());

    if (!payload.sub || !payload.role) {
      throw new AuthenticationError("Não autorizado");
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      iat: payload.iat,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    throw new AuthenticationError("Token inexistente ou inválido");
  }
}

export async function signSessionToken(payload: {
  sub: string;
  email: string;
  role: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(secretKey());
}

export async function signPasswordResetToken(payload: {
  sub: string;
  email: string;
}): Promise<string> {
  return new SignJWT({ ...payload, type: "reset-password" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(PASSWORD_RESET_EXPIRATION)
    .sign(secretKey());
}

export async function verifyPasswordResetToken(
  token: string,
): Promise<PasswordResetTokenPayload & { type?: string }> {
  try {
    const { payload } = await jwtVerify<RawTokenPayload>(token, secretKey());

    if (!payload.sub) {
      throw new AppError("Token inválido para esta operação");
    }

    return { sub: payload.sub, iat: payload.iat, type: payload.type };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Token inválido ou expirado");
  }
}

/**
 * Um JWT emitido antes da última troca de senha não vale mais. `iat` tem
 * precisão de segundos, então `passwordChangedAt` é gravado truncado no
 * segundo para a comparação não invalidar tokens emitidos no mesmo instante.
 */
export function isSessionRevoked(
  issuedAt: number | undefined,
  passwordChangedAt: Date | null | undefined,
): boolean {
  if (!passwordChangedAt || !issuedAt) {
    return false;
  }

  return issuedAt * 1000 < passwordChangedAt.getTime();
}

/**
 * Token de reset é de uso único: depois do primeiro uso, a troca de senha
 * grava `passwordChangedAt` e o mesmo token deixa de valer. Aqui a comparação
 * é `<=` porque o token pode ter sido emitido no mesmo segundo da troca.
 */
export function isPasswordResetTokenUsed(
  issuedAt: number | undefined,
  passwordChangedAt: Date | null | undefined,
): boolean {
  if (!passwordChangedAt || !issuedAt) {
    return false;
  }

  return issuedAt * 1000 <= passwordChangedAt.getTime();
}
