import { SignJWT } from "jose";

export interface TestTokenPayload {
  sub: string;
  email?: string;
  role?: string;
  type?: string;
}

/**
 * Assina um JWT com o mesmo segredo usado pela aplicação nos testes.
 * Aceita payload parcial para também gerar tokens de reset de senha.
 *
 * `setIssuedAt()` é obrigatório: o `jose` não inclui `iat` sozinho e a
 * revogação de sessão/token de uso único depende desse claim.
 */
export async function signTestToken(
  payload: TestTokenPayload,
  expiresIn = "1d",
): Promise<string> {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não definido no ambiente de teste");
  }

  // Tokens de sessão exigem `role`; tokens de reset são marcados por `type` e
  // não devem carregar papel (assim também não valem como sessão).
  const claims = payload.type ? payload : { role: "CUSTOMER", ...payload };

  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(secret));
}
