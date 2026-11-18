import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, getAuthenticatedUser } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { AppError } from "@/lib/errors";
import { createSchema } from "@/lib/schemas/slotsSchema";
import { serializeSlot } from "@/lib/serializers";
import { createSlots, getAvailableSlotsService } from "@/services/slotsService";

function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Erro interno no servidor" },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    await getAuthenticatedUser(token);

    const slots = await getAvailableSlotsService();

    return NextResponse.json(slots.map(serializeSlot), { status: 200 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    await getAuthenticatedAdmin(token);

    const body = await request.json();
    const result = createSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "DADOS INVALIDOS", errors: result.error.issues },
        { status: 400 },
      );
    }

    const validatedData = result.data;
    const data = await createSlots(validatedData);

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
