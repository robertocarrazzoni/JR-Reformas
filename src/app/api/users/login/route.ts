import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/authCookie";
import { handleRouteError } from "@/lib/http";
import {
  LOGIN_RATE_LIMIT,
  RATE_LIMIT_WINDOW_MS,
  clientIp,
  normalizeEmail,
} from "@/lib/rateLimit";
import { loginSchema } from "@/lib/schemas/authSchema";
import {
  consumeRateLimitService,
  resetRateLimitService,
} from "@/services/rateLimitService";
import { loginService } from "@/services/userService";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => undefined);
    const validatedData = loginSchema.parse(body);

    const rateLimitKey = `login:${clientIp(request)}:${normalizeEmail(
      validatedData.email,
    )}`;

    // Antes do bcrypt: cada tentativa custa ~100ms de CPU, então o limite
    // precisa vir primeiro para não virar alavanca de DoS.
    await consumeRateLimitService(
      rateLimitKey,
      LOGIN_RATE_LIMIT,
      RATE_LIMIT_WINDOW_MS,
    );

    const data = await loginService(validatedData);

    // Login correto limpa o histórico de erros daquela combinação IP+e-mail.
    try {
      await resetRateLimitService(rateLimitKey);
    } catch (error) {
      console.error("Falha ao limpar o rate limit após login:", error);
    }

    await setAuthCookie(data.token);

    return NextResponse.json({
      message: "Login realizado com sucesso",
      user: data.user,
    });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
