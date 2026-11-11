import { describe, expect, it } from "@jest/globals";
import { SignJWT } from "jose";
import { proxy } from "@/proxy";
import { signTestToken } from "./helpers/auth";
import { plainRequest } from "./helpers/request";

const customerPayload = {
  sub: "cliente-1",
  email: "cliente@example.com",
  role: "CUSTOMER",
};

const adminPayload = {
  sub: "admin-1",
  email: "admin@example.com",
  role: "ADMIN",
};

function locationOf(response: Response): URL {
  const location = response.headers.get("location");

  expect(location).not.toBeNull();

  return new URL(location as string);
}

function expectPass(response: Response) {
  expect(response.status).toBe(200);
  expect(response.headers.get("location")).toBeNull();
}

function expectCookieCleared(response: Response) {
  const setCookie = response.headers.get("set-cookie") ?? "";

  expect(setCookie).toContain("token=");
  expect(setCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/);
}

describe("Proxy", () => {
  describe("rotas de cliente", () => {
    it.each(["/conta", "/conta/agendamentos", "/agendar", "/perfil"])(
      "redireciona %s para o login sem sessão",
      async (pathname) => {
        const response = await proxy(plainRequest(pathname));

        expect(response.status).toBe(307);

        const location = locationOf(response);

        expect(location.pathname).toBe("/login");
        expect(location.searchParams.get("next")).toBe(pathname);
      },
    );

    it("libera /conta para um cliente autenticado", async () => {
      const token = await signTestToken(customerPayload);

      expectPass(await proxy(plainRequest("/conta", { token })));
    });

    it("apaga o cookie quando o token é inválido", async () => {
      const response = await proxy(plainRequest("/conta", { token: "invalido" }));

      expect(response.status).toBe(307);
      expect(locationOf(response).searchParams.get("next")).toBe("/conta");
      expectCookieCleared(response);
    });

    it("trata token sem role como sessão ausente", async () => {
      // Token malformado de propósito: `signTestToken` adiciona um papel padrão,
      // então aqui assinamos sem `role` para exercitar a rejeição.
      const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
      const token = await new SignJWT({ sub: "sem-role" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(secret);

      const response = await proxy(plainRequest("/perfil", { token }));

      expect(response.status).toBe(307);
      expect(locationOf(response).searchParams.get("next")).toBe("/perfil");
      expectCookieCleared(response);
    });
  });

  describe("rotas de admin", () => {
    it.each(["/admin", "/admin/agenda", "/admin/agendamentos"])(
      "redireciona %s para o login sem sessão",
      async (pathname) => {
        const response = await proxy(plainRequest(pathname));

        expect(response.status).toBe(307);

        const location = locationOf(response);

        expect(location.pathname).toBe("/login");
        expect(location.searchParams.get("next")).toBe(pathname);
      },
    );

    it("libera /admin para um administrador", async () => {
      const token = await signTestToken(adminPayload);

      expectPass(await proxy(plainRequest("/admin", { token })));
    });

    it("manda cliente autenticado de /admin para /conta", async () => {
      const token = await signTestToken(customerPayload);

      const response = await proxy(plainRequest("/admin", { token }));

      expect(response.status).toBe(307);

      const location = locationOf(response);

      expect(location.pathname).toBe("/conta");
      expect(location.searchParams.get("next")).toBeNull();
    });
  });

  describe("páginas de autenticação", () => {
    it("manda cliente logado de /login para /conta", async () => {
      const token = await signTestToken(customerPayload);

      const location = locationOf(await proxy(plainRequest("/login", { token })));

      expect(location.pathname).toBe("/conta");
    });

    it("manda admin logado de /login para /admin", async () => {
      const token = await signTestToken(adminPayload);

      const location = locationOf(await proxy(plainRequest("/login", { token })));

      expect(location.pathname).toBe("/admin");
    });

    it("manda cliente logado de /cadastro para /conta", async () => {
      const token = await signTestToken(customerPayload);

      const location = locationOf(await proxy(plainRequest("/cadastro", { token })));

      expect(location.pathname).toBe("/conta");
    });

    it("libera /login sem sessão", async () => {
      expectPass(await proxy(plainRequest("/login")));
    });
  });

  describe("rotas de API", () => {
    it("exige token para GET /api/slots", async () => {
      const response = await proxy(plainRequest("/api/slots", { method: "GET" }));

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ message: "Não autorizado" });
    });

    it("exige token para POST /api/slots", async () => {
      const response = await proxy(plainRequest("/api/slots", { method: "POST" }));

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ message: "Não autorizado" });
    });

    it("exige admin para /api/slots/:id", async () => {
      const response = await proxy(plainRequest("/api/slots/slot-1"));

      expect(response.status).toBe(401);
    });

    it("bloqueia cliente em /api/slots/:id com 403", async () => {
      const token = await signTestToken(customerPayload);

      const response = await proxy(plainRequest("/api/slots/slot-1", { token }));

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ message: "Acesso proibido" });
    });

    it("libera admin em /api/slots/:id", async () => {
      const token = await signTestToken(adminPayload);

      expectPass(await proxy(plainRequest("/api/slots/slot-1", { token })));
    });

    it("bloqueia cliente em POST /api/slots", async () => {
      const token = await signTestToken(customerPayload);

      const response = await proxy(plainRequest("/api/slots", { method: "POST", token }));

      expect(response.status).toBe(403);
    });
  });
});
