import { NextResponse } from "next/server";
import { updateSlotSchema } from "@/lib/schemas/slotsSchema";
import { update, deleteSlotService } from "@/services/slotsService";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateSlotSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "DADOS INVALIDOS", errors: result.error.issues },
        { status: 400 }
      );
    }

    const validatedData = result.data;
    const updatedSlot = await update(validatedData, id);

    return NextResponse.json(
      { message: "Slot atualizado com sucesso", slot: updatedSlot },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const result = await deleteSlotService(id);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}