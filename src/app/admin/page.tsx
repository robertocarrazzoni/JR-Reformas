import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/admin-overview";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Painel administrativo",
  description: "Visão geral da agenda e dos agendamentos da JR Santana.",
};

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const firstName = user.name.trim().split(/\s+/)[0];

  return <AdminOverview firstName={firstName} />;
}
