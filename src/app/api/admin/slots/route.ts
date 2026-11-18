import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { AppError } from "@/lib/errors";
import { serializeAdminSlot } from "@/lib/serializers";
import { getAdminSlotsService } from "@/services/slotsService";

export async function GET() {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    await getAuthenticatedAdmin(token);

    const slots = await getAdminSlotsService();

    return NextResponse.json(slots.map(serializeAdminSlot), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
