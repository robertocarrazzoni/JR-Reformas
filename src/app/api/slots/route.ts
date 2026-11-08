import { NextResponse } from "next/server";
import { createSchema } from "@/lib/schemas/slotsSchema";
import { createSlots, getAvailableSlotsService } from "@/services/slotsService";

export async function GET() {
  try {
    const slots = await getAvailableSlotsService();
    return NextResponse.json(slots, { status: 200 });
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

export async function POST(request: Request) {
try {
    const body = await request.json()
    const result = createSchema.safeParse(body)
    if(!result.success){
        return NextResponse.json(
            {message: "DADOS INVALIDOS", errors: result.error.issues},
            {status: 400}
        )
    }

    const validatedData = result.data
    const data = await createSlots(validatedData)

    return NextResponse.json(data, {status: 200})
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
    )
}
}

