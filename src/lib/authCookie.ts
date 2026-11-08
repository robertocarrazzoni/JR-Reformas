import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/cookieNames";

export { AUTH_COOKIE };

const MAX_AGE_SECONDS = 60 * 60 * 24;

function baseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE, token, {
    ...baseOptions(),
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE, "", {
    ...baseOptions(),
    maxAge: 0,
  });
}
