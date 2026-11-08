import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/booking-flow";
import { getAvailableSlotsService } from "@/services/slotsService";
import { requireUser } from "@/lib/session";
import { serializeSlot } from "@/lib/serializers";

export const metadata: Metadata = {
  title: "Agendar visita",
  description:
    "Escolha um horário disponível e agende sua visita técnica com a JR Santana.",
};

export default async function BookingPage() {
  await requireUser();

  const slots = (await getAvailableSlotsService()).map(serializeSlot);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
          Nova visita
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-950">
          Agendar visita técnica
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
          Em três passos você escolhe o horário, descreve a obra e confirma o
          agendamento. Nossa equipe recebe os detalhes na hora.
        </p>
      </header>

      <BookingFlow slots={slots} />
    </div>
  );
}
