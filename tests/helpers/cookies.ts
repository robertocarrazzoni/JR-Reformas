interface CookieWrite {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

/**
 * Implementação mínima do cookie store de `next/headers` para os testes de
 * route handler. Não existe request context no Jest, então este store faz o
 * papel do cookie jar: os handlers leem e escrevem aqui.
 */
class CookieStoreMock {
  private values = new Map<string, string>();

  readonly writes: CookieWrite[] = [];

  get(name: string) {
    if (!this.values.has(name)) {
      return undefined;
    }

    return { name, value: this.values.get(name) as string };
  }

  getAll() {
    return Array.from(this.values, ([name, value]) => ({ name, value }));
  }

  has(name: string) {
    return this.values.has(name);
  }

  set(name: string, value: string, options?: Record<string, unknown>) {
    this.writes.push({ name, value, options });

    if (options?.maxAge === 0) {
      this.values.delete(name);
      return;
    }

    this.values.set(name, value);
  }

  delete(name: string) {
    this.values.delete(name);
    this.writes.push({ name, value: "", options: { maxAge: 0 } });
  }

  /** Coloca um cookie já existente antes da chamada do handler. */
  seed(name: string, value: string) {
    this.values.set(name, value);
  }

  lastWrite(name: string): CookieWrite | undefined {
    return [...this.writes].reverse().find((write) => write.name === name);
  }

  reset() {
    this.values.clear();
    this.writes.length = 0;
  }
}

export const mockCookieStore = new CookieStoreMock();
