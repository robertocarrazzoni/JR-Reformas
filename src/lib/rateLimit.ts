/** Janela e limites únicos, para rota e testes falarem a mesma língua. */
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export const LOGIN_RATE_LIMIT = 10;
export const FORGOT_PASSWORD_IP_LIMIT = 5;
export const FORGOT_PASSWORD_EMAIL_LIMIT = 3;

/**
 * IP do cliente atrás de proxy reverso. Na Vercel `x-real-ip` é definido pela
 * plataforma; `x-forwarded-for` fica como fallback (primeiro item).
 */
export function clientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();

  return first || "local";
}

/** E-mails são case-insensitive em prática; a chave do limite também. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
