import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { handleRouteError } from "@/lib/http";
import { updatePasswordSchema } from "@/lib/schemas/authSchema";
import { updatePasswordService } from "@/services/userService";

export async function PATCH(request: Request) {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Não autorizado. Token ausente." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => undefined);
    const validatedData = updatePasswordSchema.parse(body);
    const result = await updatePasswordService(validatedData, token);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
