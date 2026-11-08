import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, RateLimitError } from "@/lib/errors";

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    { message: "Dados inválidos", errors: error.issues },
    { status: 400 },
  );
}

export function rateLimitErrorResponse(error: RateLimitError) {
  return NextResponse.json(
    { message: error.message },
    {
      status: 429,
      headers: { "Retry-After": String(error.retryAfterSeconds) },
    },
  );
}

export function internalErrorResponse(error: unknown) {
  console.error("Erro não tratado na rota:", error);

  return NextResponse.json(
    { message: "Erro interno no servidor" },
    { status: 500 },
  );
}

/**
 * Mapeamento padrão dos route handlers: Zod → 400 com issues, erros de domínio
 * no próprio status e qualquer outra coisa → 500 (sem vazar detalhe interno).
 */
export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  if (error instanceof RateLimitError) {
    return rateLimitErrorResponse(error);
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status },
    );
  }

  return internalErrorResponse(error);
}
