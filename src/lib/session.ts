import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/authCookie";
import { getUserByIdService } from "@/services/userService";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const actor = await getAuthenticatedUser(token);

    return await getUserByIdService(actor.userId);
  } catch {
    return null;
  }
}

export async function requireUser(nextPath = "/conta"): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (user.role !== "ADMIN") {
    redirect("/conta");
  }

  return user;
}

export function isAdmin(user: Pick<SessionUser, "role">) {
  return user.role === "ADMIN";
}
