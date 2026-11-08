import type { Metadata } from "next";
import { SlotManager } from "@/components/admin/slot-manager";
import { serializeAdminSlot } from "@/lib/serializers";
import { requireAdmin } from "@/lib/session";
import { getAdminSlotsService } from "@/services/slotsService";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Gerencie os horários disponíveis para visitas técnicas.",
};

export default async function AdminSchedulePage() {
  await requireAdmin();

  const slots = await getAdminSlotsService();

  const serialized = slots.map(serializeAdminSlot);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
          Painel administrativo
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-950">
          Agenda
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
          Crie novos horários, bloqueie períodos indisponíveis e acompanhe os
          horários já reservados.
        </p>
      </header>

      <SlotManager slots={serialized} />
    </div>
  );
}
