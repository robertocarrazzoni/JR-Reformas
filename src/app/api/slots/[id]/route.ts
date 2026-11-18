import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { AppError } from "@/lib/errors";
import { updateSlotSchema } from "@/lib/schemas/slotsSchema";
import { deleteSlotService, update } from "@/services/slotsService";

interface RouteContext {
  params: Promise<{ id: string }>;
}

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

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    await getAuthenticatedAdmin(token);

    const { id } = await params;
    const body = await request.json();
    const result = updateSlotSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "DADOS INVALIDOS", errors: result.error.issues },
        { status: 400 },
      );
    }

    const validatedData = result.data;
    const updatedSlot = await update(validatedData, id);

    return NextResponse.json(
      { message: "Slot atualizado com sucesso", slot: updatedSlot },
      { status: 200 },
    );
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    await getAuthenticatedAdmin(token);

    const { id } = await params;
    const result = await deleteSlotService(id);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
