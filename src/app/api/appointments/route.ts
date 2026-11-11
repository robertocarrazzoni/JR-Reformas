import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AuthenticationError, getAuthenticatedUser } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { createAppointmentSchema } from "@/lib/schemas/appointmentsSchema";
import {
  AppointmentError,
  createAppointmentService,
} from "@/services/appointmentService";

function errorResponse(error: unknown) {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }

  if (error instanceof AppointmentError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    const actor = await getAuthenticatedUser(token);
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
    }

    const parsedBody = createAppointmentSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: parsedBody.error.issues },
        { status: 400 },
      );
    }

    const appointment = await createAppointmentService(parsedBody.data, actor);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
