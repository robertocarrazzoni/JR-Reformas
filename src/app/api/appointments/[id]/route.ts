import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AuthenticationError, getAuthenticatedUser } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { AppointmentError, cancelAppointmentService } from "@/services/appointmentService";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    const actor = await getAuthenticatedUser(token);
    const { id } = await params;
    const appointment = await cancelAppointmentService(id, actor);

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    if (error instanceof AppointmentError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}
