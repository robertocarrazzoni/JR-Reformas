import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { handleRouteError } from "@/lib/http";
import { serializeSessionUser } from "@/lib/serializers";
import { getUserByIdService } from "@/services/userService";

export async function GET() {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    const actor = await getAuthenticatedUser(token);

    const user = await getUserByIdService(actor.userId);

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { user: serializeSessionUser(user) },
      { status: 200 },
    );
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
