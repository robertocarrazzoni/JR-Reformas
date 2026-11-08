/**
 * Erro de domínio com status HTTP associado. Os route handlers convertem
 * `AppError` no status declarado, em vez de tratar todo `Error` como 400.
 */
export class AppError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

/** Sessão ausente, inválida ou revogada. Sempre 401. */
export class AuthenticationError extends AppError {
  constructor(message = "Não autorizado") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

/** Limite de requisições excedido. Sempre 429. */
export class RateLimitError extends AppError {
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message, 429);
    this.name = "RateLimitError";
    this.retryAfterSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
  }
}

/** Recurso existente no contrato, mas não encontrado. Sempre 404. */
export class NotFoundError extends AppError {
  constructor(message = "Não encontrado") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
