import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AuthenticationError, getAuthenticatedUser } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { serializeAdminSlot } from "@/lib/serializers";
import { getAdminSlotsService } from "@/services/slotsService";

export async function GET() {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    const actor = await getAuthenticatedUser(token);

    if (actor.role !== "ADMIN") {
      return NextResponse.json({ message: "Acesso proibido" }, { status: 403 });
    }

    const slots = await getAdminSlotsService();

    return NextResponse.json(slots.map(serializeAdminSlot), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
