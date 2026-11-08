import { AuthenticationError } from "@/lib/errors";
import {
  SESSION_REVOKED_MESSAGE,
  isSessionRevoked,
  verifySessionToken,
} from "@/lib/token";
import { getUserAuthStateService } from "@/services/userService";

export { AuthenticationError };

export interface AuthenticatedUser {
  userId: string;
  role: string;
}

/**
 * Verifica o JWT e confirma no banco que a sessão não foi revogada por uma
 * troca de senha. O `role` vem do banco, não do token, para refletir
 * alterações de permissão.
 */
export async function getAuthenticatedUser(
  token: string | undefined,
): Promise<AuthenticatedUser> {
  const payload = await verifySessionToken(token);
  const state = await getUserAuthStateService(payload.sub);

  if (!state) {
    throw new AuthenticationError("Usuário não encontrado");
  }

  if (isSessionRevoked(payload.iat, state.passwordChangedAt)) {
    throw new AuthenticationError(SESSION_REVOKED_MESSAGE);
  }

  return { userId: state.id, role: state.role };
}
