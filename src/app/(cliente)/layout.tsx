import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/session";

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <AppShell
      variant="customer"
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </AppShell>
  );
}
