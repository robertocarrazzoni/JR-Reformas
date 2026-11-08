import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/http";
import {
  FORGOT_PASSWORD_EMAIL_LIMIT,
  FORGOT_PASSWORD_IP_LIMIT,
  RATE_LIMIT_WINDOW_MS,
  clientIp,
  normalizeEmail,
} from "@/lib/rateLimit";
import { forgotPasswordSchema } from "@/lib/schemas/authSchema";
import { consumeRateLimitService } from "@/services/rateLimitService";
import { forgotPasswordService } from "@/services/userService";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => undefined);
    const validatedData = forgotPasswordSchema.parse(body);

    // Dois limites: o de IP protege a cota de execução; o de e-mail impede
    // mail bombing contra uma caixa específica, mesmo vindo de vários IPs.
    await consumeRateLimitService(
      `forgot-ip:${clientIp(request)}`,
      FORGOT_PASSWORD_IP_LIMIT,
      RATE_LIMIT_WINDOW_MS,
    );

    await consumeRateLimitService(
      `forgot-email:${normalizeEmail(validatedData.email)}`,
      FORGOT_PASSWORD_EMAIL_LIMIT,
      RATE_LIMIT_WINDOW_MS,
    );

    const result = await forgotPasswordService(validatedData);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
