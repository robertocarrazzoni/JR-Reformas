import { prisma } from "@/lib/prisma";
import { RateLimitError } from "@/lib/errors";

/**
 * Contador de janela fixa no Postgres. O `upsert` do Prisma vira
 * `INSERT ... ON CONFLICT DO UPDATE ... RETURNING`, então o incremento é
 * atômico mesmo com requisições concorrentes — diferente de ler e depois
 * gravar o `count`, que perde tentativas.
 */
export async function consumeRateLimitService(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): Promise<void> {
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);

  const counter = await prisma.rateLimitCounter.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });

  // `count === 1` significa linha recém-criada: uma janela nova começou para
  // esta chave. Só as linhas antigas desta mesma chave viram lixo, e isso roda
  // uma vez por janela (não por requisição).
  if (counter.count === 1) {
    await prisma.rateLimitCounter.deleteMany({
      where: { key, windowStart: { lt: windowStart } },
    });

    // Varredura global barata, uma vez por dia (00:00 UTC), sem cron.
    if (windowStart.getUTCHours() === 0 && windowStart.getUTCMinutes() === 0) {
      await prisma.rateLimitCounter.deleteMany({
        where: { windowStart: { lt: new Date(now - 24 * 60 * 60 * 1000) } },
      });
    }
  }

  if (counter.count > limit) {
    const retryAfterSeconds = Math.ceil(
      (windowStart.getTime() + windowMs - now) / 1000,
    );

    throw new RateLimitError(
      "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      retryAfterSeconds,
    );
  }
}

/** Login bem-sucedido zera o histórico de erros daquela combinação. */
export async function resetRateLimitService(key: string): Promise<void> {
  await prisma.rateLimitCounter.deleteMany({ where: { key } });
}
