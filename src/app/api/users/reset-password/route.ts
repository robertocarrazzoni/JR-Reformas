import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/http";
import { resetPasswordSchema } from "@/lib/schemas/authSchema";
import { resetPasswordService } from "@/services/userService";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => undefined);
    const validatedData = resetPasswordSchema.parse(body);
    const result = await resetPasswordService(validatedData);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
