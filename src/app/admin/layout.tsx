import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AppShell
      variant="admin"
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </AppShell>
  );
}
