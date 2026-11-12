/**
 * URL pública da aplicação.
 *
 * Módulo **apenas para servidor**: lê `APP_URL`, que não usa o prefixo
 * `NEXT_PUBLIC_`. Assim o valor não é injetado no bundle enviado ao navegador
 * (ver `src/lib/config.ts` para os dados que precisam rodar no cliente).
 *
 * Usado pelos links de e-mail e pelo `metadataBase` do Next.
 */

const FALLBACK_APP_URL = "http://localhost:3000";

/**
 * Retorna a URL base sem barra no final.
 *
 * Cai para `http://localhost:3000` quando a variável está ausente, vazia ou
 * inválida — `new URL("")` estouraria e derrubaria o build de metadata.
 */
export function getAppUrl(): string {
  const raw = process.env.APP_URL?.trim();

  if (!raw) {
    return FALLBACK_APP_URL;
  }

  const candidate = raw.replace(/\/+$/, "");

  try {
    new URL(candidate);
    return candidate;
  } catch {
    console.warn(
      `APP_URL inválida (${raw}). Usando ${FALLBACK_APP_URL} como fallback.`,
    );
    return FALLBACK_APP_URL;
  }
}
