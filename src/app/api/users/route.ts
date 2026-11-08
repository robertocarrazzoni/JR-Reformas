import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { registerSchema, updateSchema } from "@/lib/schemas/authSchema";
import {
  deleteUserService,
  registerUserService,
  updateService,
} from "@/services/userService";
import { AUTH_COOKIE, clearAuthCookie } from "@/lib/authCookie";
import { handleRouteError } from "@/lib/http";

async function readJson(request: Request) {
  return request.json().catch(() => undefined);
}

export async function POST(request: Request) {
  try {
    const validatedData = registerSchema.parse(await readJson(request));
    const newUser = await registerUserService(validatedData);

    return NextResponse.json(
      { message: "Usuário cadastrado com sucesso", user: newUser },
      { status: 201 },
    );
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

export async function DELETE() {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Não autorizado. Token ausente." },
        { status: 401 },
      );
    }

    const result = await deleteUserService(token);

    await clearAuthCookie();

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Não autorizado. Token ausente." },
        { status: 401 },
      );
    }

    const validatedData = updateSchema.parse(await readJson(request));
    const data = await updateService(validatedData, token);

    return NextResponse.json({
      message: "Usuário atualizado com sucesso",
      user: data,
    });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
