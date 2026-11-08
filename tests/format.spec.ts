import { describe, expect, it } from "@jest/globals";
import { toISOStringFromInputs } from "@/lib/format";

describe("toISOStringFromInputs", () => {
  it("interpreta data e hora como horário de Brasília (UTC−3)", () => {
    expect(toISOStringFromInputs("2026-01-10", "14:00")).toBe(
      "2026-01-10T17:00:00.000Z",
    );
  });

  it("mantém o horário correto na virada do dia", () => {
    expect(toISOStringFromInputs("2026-06-01", "00:30")).toBe(
      "2026-06-01T03:30:00.000Z",
    );
  });

  it("não depende do fuso configurado na máquina", () => {
    const original = process.env.TZ;

    try {
      process.env.TZ = "Asia/Tokyo";
      expect(toISOStringFromInputs("2026-03-15", "08:00")).toBe(
        "2026-03-15T11:00:00.000Z",
      );

      process.env.TZ = "America/Los_Angeles";
      expect(toISOStringFromInputs("2026-03-15", "08:00")).toBe(
        "2026-03-15T11:00:00.000Z",
      );
    } finally {
      process.env.TZ = original;
    }
  });
});
