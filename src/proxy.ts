import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/cookieNames";
import { verifySessionToken } from "@/lib/token";

interface TokenPayload {
  sub: string;
  role: string;
}

const AUTH_PAGES = new Set([
  "/login",
  "/cadastro",
  "/esqueci-senha",
  "/redefinir-senha",
]);

const CUSTOMER_PREFIXES = ["/conta", "/agendar", "/perfil"];
const ADMIN_PREFIXES = ["/admin"];

async function readTokenPayload(request: NextRequest): Promise<TokenPayload | null> {
  try {
    const payload = await verifySessionToken(
      request.cookies.get(AUTH_COOKIE)?.value,
    );

    return { sub: payload.sub, role: payload.role };
  } catch {
    // Token ausente, inválido, expirado ou de outro tipo (reset de senha).
    return null;
  }
}

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function buildLoginRedirect(request: NextRequest, nextPath: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", nextPath);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const payload = await readTokenPayload(request);

    if (!payload) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    if (payload.role !== "ADMIN") {
      return NextResponse.json({ message: "Acesso proibido" }, { status: 403 });
    }

    return NextResponse.next();
  }

  const payload = await readTokenPayload(request);
  const hasToken = request.cookies.has(AUTH_COOKIE);

  if (AUTH_PAGES.has(pathname) && payload?.role) {
    const url = request.nextUrl.clone();
    url.pathname = payload.role === "ADMIN" ? "/admin" : "/conta";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (matchesPrefix(pathname, ADMIN_PREFIXES)) {
    if (!payload?.role) {
      const response = buildLoginRedirect(request, pathname);
      if (hasToken) {
        response.cookies.delete(AUTH_COOKIE);
      }
      return response;
    }

    if (payload.role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/conta";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (matchesPrefix(pathname, CUSTOMER_PREFIXES) && !payload?.role) {
    const response = buildLoginRedirect(request, pathname);
    if (hasToken) {
      response.cookies.delete(AUTH_COOKIE);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/slots",
    "/api/slots/:path*",
    "/login",
    "/cadastro",
    "/conta/:path*",
    "/agendar",
    "/perfil",
    "/admin/:path*",
  ],
};
