import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import { RateLimitError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  consumeRateLimitService,
  resetRateLimitService,
} from "@/services/rateLimitService";
import { disconnectDatabase, resetDatabase } from "./helpers/db";

const WINDOW_MS = 15 * 60 * 1000;
const T0 = new Date("2026-11-08T13:00:00.000Z").getTime();

async function captureError(call: Promise<void>) {
  return call.then(
    () => null,
    (error: unknown) => error,
  );
}

describe("RateLimit service", () => {
  beforeEach(resetDatabase);

  afterAll(disconnectDatabase);

  it("allows exactly `limit` attempts and blocks the next one", async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await consumeRateLimitService("login:1.2.3.4:ana@x.com", 10, WINDOW_MS, T0 + attempt);
    }

    const error = await captureError(
      consumeRateLimitService("login:1.2.3.4:ana@x.com", 10, WINDOW_MS, T0 + 10),
    );

    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).status).toBe(429);
    expect((error as RateLimitError).retryAfterSeconds).toBe(900);
  });

  it("resets the counter in the next window and keeps a single row per key", async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await consumeRateLimitService("k", 10, WINDOW_MS, T0 + attempt);
    }

    await consumeRateLimitService("k", 10, WINDOW_MS, T0 + WINDOW_MS);

    const rows = await prisma.rateLimitCounter.findMany({ where: { key: "k" } });

    expect(rows).toHaveLength(1);
    expect(rows[0].count).toBe(1);
    expect(rows[0].windowStart.getTime()).toBe(T0 + WINDOW_MS);
  });

  it("keeps independent counters per key", async () => {
    await consumeRateLimitService("ip:1", 1, WINDOW_MS, T0);
    await consumeRateLimitService("ip:2", 1, WINDOW_MS, T0);

    expect(
      await captureError(consumeRateLimitService("ip:1", 1, WINDOW_MS, T0)),
    ).toBeInstanceOf(RateLimitError);

    await expect(
      consumeRateLimitService("ip:3", 1, WINDOW_MS, T0),
    ).resolves.toBeUndefined();
  });

  it("clears the counter on a successful login", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await consumeRateLimitService("login:a", 10, WINDOW_MS, T0);
    }

    await resetRateLimitService("login:a");

    await expect(prisma.rateLimitCounter.count({ where: { key: "login:a" } })).resolves.toBe(0);
  });
});
