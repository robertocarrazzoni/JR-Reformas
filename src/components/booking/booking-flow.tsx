"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  StickyNote,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/ui/link-button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { apiFetch, getErrorMessage } from "@/lib/api";
import type { AppointmentDTO, SlotDTO } from "@/lib/api-types";
import { createAppointmentSchema } from "@/lib/schemas/appointmentsSchema";
import {
  formatDateLong,
  formatDateRange,
  formatDay,
  formatMonthShort,
  formatTime,
  formatWeekday,
  toDateKey,
} from "@/lib/format";
import { cn } from "@/lib/cn";
import { whatsappLink } from "@/lib/config";

type Step = 1 | 2 | 3;

type FieldErrors = Partial<
  Record<"slotId" | "description" | "address" | "notes" | "form", string>
>;

const stepLabels = ["Horário", "Detalhes", "Confirmação"];

interface DateGroup {
  key: string;
  firstStartsAt: string;
  slots: SlotDTO[];
}

export function BookingFlow({ slots }: { slots: SlotDTO[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const groups = useMemo<DateGroup[]>(() => {
    const map = new Map<string, SlotDTO[]>();

    for (const slot of slots) {
      const key = toDateKey(slot.startsAt);
      const current = map.get(key) ?? [];
      current.push(slot);
      map.set(key, current);
    }

    return Array.from(map.entries())
      .map(([key, items]) => {
        const sorted = [...items].sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        );

        return { key, firstStartsAt: sorted[0].startsAt, slots: sorted };
      })
      .sort(
        (a, b) =>
          new Date(a.firstStartsAt).getTime() -
          new Date(b.firstStartsAt).getTime(),
      );
  }, [slots]);

  const [step, setStep] = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    groups[0]?.key ?? null,
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<AppointmentDTO | null>(null);

  const activeGroup = groups.find((group) => group.key === selectedDate) ?? null;
  const selectedSlot =
    slots.find((slot) => slot.id === selectedSlotId) ?? null;

  function handleContinue() {
    if (step === 1) {
      if (!selectedSlotId) {
        setErrors({ slotId: "Escolha um horário para continuar." });
        return;
      }

      setErrors({});
      setStep(2);
      return;
    }

    if (step === 2) {
      const parsed = createAppointmentSchema.safeParse({
        slotId: selectedSlotId ?? "",
        description,
        address,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      if (!parsed.success) {
        const fieldErrors: FieldErrors = {};

        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0] ?? "form") as keyof FieldErrors;
          if (!fieldErrors[key]) {
            fieldErrors[key] = issue.message;
          }
        }

        setErrors(fieldErrors);
        return;
      }

      setErrors({});
      setStep(3);
    }
  }

  async function handleSubmit() {
    setErrors({});
    setLoading(true);

    try {
      const appointment = await apiFetch<AppointmentDTO>("/api/appointments", {
        method: "POST",
        json: {
          slotId: selectedSlotId,
          description,
          address,
          notes: notes.trim() ? notes.trim() : undefined,
        },
      });

      setConfirmation(appointment);
      toast({
        title: "Visita agendada",
        description: "Acompanhe os detalhes em Minha conta.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      setErrors({ form: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  function resetFlow() {
    setConfirmation(null);
    setStep(1);
    setSelectedSlotId(null);
    setDescription("");
    setAddress("");
    setNotes("");
    setErrors({});
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-900/15 bg-white/60 px-6 py-16 text-center">
        <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold-100 text-gold-600">
          <CalendarCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-bold text-ink-950">
          Nenhum horário disponível no momento
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
          Novos horários são adicionados periodicamente. Fale com a equipe para
          entrar na lista de espera ou tirar dúvidas.
        </p>
        <div className="mt-6 flex justify-center">
          <a
            href={whatsappLink(
              "Olá! Gostaria de saber sobre novos horários para visita técnica.",
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="animate-fade-up rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink-950">
          Visita agendada com sucesso!
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-500">
          A equipe da JR Santana já recebeu seu pedido. Você pode acompanhar e
          cancelar este agendamento na sua conta.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-xl border border-ink-900/10 bg-cream-50 p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
            {formatWeekday(confirmation.slot.startsAt)},{" "}
            {formatDateLong(confirmation.slot.startsAt)}
          </p>
          <p className="mt-1 flex items-center gap-2 font-display text-xl font-bold text-ink-950">
            <Clock className="h-5 w-5 text-gold-600" aria-hidden="true" />
            {formatDateRange(
              confirmation.slot.startsAt,
              confirmation.slot.endsAt,
            )}
          </p>
          <p className="mt-2 text-sm font-semibold text-ink-800">
            {confirmation.description}
          </p>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
            {confirmation.address}
          </p>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href="/conta/agendamentos">Ver meus agendamentos</LinkButton>
          <Button type="button" variant="outline" onClick={resetFlow}>
            Agendar outro horário
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ol className="flex items-center gap-2 sm:gap-3">
        {stepLabels.map((label, index) => {
          const number = (index + 1) as Step;
          const active = step === number;
          const done = step > number;

          return (
            <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
              <span
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  active && "bg-gold-500 text-ink-950",
                  done && "bg-ink-950 text-gold-300",
                  !active && !done && "border border-ink-900/15 bg-white text-ink-400",
                )}
                aria-hidden="true"
              >
                {done ? <Check className="h-4 w-4" /> : number}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-semibold uppercase tracking-[0.14em] sm:block",
                  active ? "text-ink-950" : "text-ink-400",
                )}
              >
                {label}
              </span>
              {index < stepLabels.length - 1 ? (
                <span className="h-px flex-1 bg-ink-900/10" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-6">
        {step === 1 ? (
          <div className="animate-fade-in">
            <div className="rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-lg font-bold text-ink-950">
                Escolha a data
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Selecione um dia disponível para a visita técnica.
              </p>

              <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
                {groups.map((group) => {
                  const active = selectedDate === group.key;

                  return (
                    <button
                      key={group.key}
                      type="button"
                      onClick={() => {
                        setSelectedDate(group.key);
                        setSelectedSlotId(null);
                        setErrors({});
                      }}
                      aria-pressed={active}
                      className={cn(
                        "flex min-w-20 shrink-0 flex-col items-center rounded-xl border px-3 py-3 transition-all",
                        active
                          ? "border-gold-500 bg-gold-500 text-ink-950 shadow-sm shadow-gold-500/30"
                          : "border-ink-900/10 bg-cream-50 text-ink-700 hover:border-gold-400/60 hover:bg-white",
                      )}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                        {formatWeekday(group.firstStartsAt).slice(0, 3)}
                      </span>
                      <span className="font-display text-xl font-extrabold leading-tight">
                        {formatDay(group.firstStartsAt)}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest">
                        {formatMonthShort(group.firstStartsAt)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-ink-900/10 pt-5">
                <h3 className="font-display text-base font-bold text-ink-950">
                  Horários disponíveis
                  {activeGroup ? (
                    <span className="ml-2 text-xs font-medium text-ink-400">
                      {formatDateLong(activeGroup.firstStartsAt)}
                    </span>
                  ) : null}
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {(activeGroup?.slots ?? []).map((slot) => {
                    const active = selectedSlotId === slot.id;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          setErrors({});
                        }}
                        aria-pressed={active}
                        className={cn(
                          "flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all",
                          active
                            ? "border-gold-500 bg-ink-950 text-cream-50"
                            : "border-ink-900/10 bg-cream-50 text-ink-700 hover:border-gold-400/60 hover:bg-white",
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Clock
                            className={cn(
                              "h-3.5 w-3.5",
                              active ? "text-gold-300" : "text-gold-600",
                            )}
                            aria-hidden="true"
                          />
                          {formatTime(slot.startsAt)}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-medium",
                            active ? "text-cream-200/60" : "text-ink-400",
                          )}
                        >
                          até {formatTime(slot.endsAt)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <FieldError>{errors.slotId}</FieldError>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="animate-fade-in rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-950">
              Detalhes da obra
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Quanto mais contexto, melhor conseguimos preparar a visita.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="booking-description">O que você precisa?</Label>
                <Input
                  id="booking-description"
                  className="mt-1.5"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ex.: Reforma completa de cozinha"
                  aria-invalid={Boolean(errors.description)}
                />
                <FieldError>{errors.description}</FieldError>
              </div>

              <div>
                <Label htmlFor="booking-address">Endereço da obra</Label>
                <Input
                  id="booking-address"
                  className="mt-1.5"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Rua, número, bairro e cidade"
                  autoComplete="street-address"
                  aria-invalid={Boolean(errors.address)}
                />
                <FieldError>{errors.address}</FieldError>
              </div>

              <div>
                <Label htmlFor="booking-notes">
                  Observações <span className="font-normal text-ink-400">(opcional)</span>
                </Label>
                <Textarea
                  id="booking-notes"
                  className="mt-1.5"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Informações úteis: andar, acesso, tamanho do ambiente, preferências..."
                  aria-invalid={Boolean(errors.notes)}
                />
                <FieldError>{errors.notes}</FieldError>
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="animate-fade-in space-y-4">
            {errors.form ? <Alert variant="error">{errors.form}</Alert> : null}

            <div className="rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-lg font-bold text-ink-950">
                Confirme os dados
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Revise as informações antes de enviar.
              </p>

              <dl className="mt-5 space-y-4">
                <div className="rounded-xl bg-ink-950 p-4 text-cream-50">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300">
                    Horário
                  </dt>
                  <dd className="mt-1 font-display text-lg font-bold">
                    {selectedSlot
                      ? `${formatWeekday(selectedSlot.startsAt)}, ${formatDateLong(selectedSlot.startsAt)}`
                      : "—"}
                  </dd>
                  <dd className="mt-0.5 text-sm text-cream-200/70">
                    {selectedSlot
                      ? formatDateRange(selectedSlot.startsAt, selectedSlot.endsAt)
                      : "—"}
                  </dd>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                      Serviço
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-ink-900">
                      {description}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                      Endereço
                    </dt>
                    <dd className="mt-1 text-sm text-ink-700">{address}</dd>
                  </div>
                </div>

                {notes.trim() ? (
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                      Observações
                    </dt>
                    <dd className="mt-1 text-sm text-ink-500">{notes}</dd>
                  </div>
                ) : null}
              </dl>

              <p className="mt-5 flex items-start gap-2 rounded-lg bg-cream-100 px-3.5 py-3 text-xs leading-relaxed text-ink-500">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                O cancelamento pode ser solicitado até 24 horas antes do horário
                agendado.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (step === 1) {
              router.push("/conta");
              return;
            }
            setStep((previous) => (previous - 1) as Step);
          }}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {step === 1 ? "Voltar à conta" : "Voltar"}
        </Button>

        {step < 3 ? (
          <Button type="button" onClick={handleContinue}>
            Continuar
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} loading={loading}>
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            {loading ? "Confirmando..." : "Confirmar agendamento"}
          </Button>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-ink-400">
        Precisa de ajuda?{" "}
        <Link href="/contato" className="font-semibold text-gold-700 underline decoration-gold-400/50 underline-offset-4">
          Fale com a equipe
        </Link>
        .
      </p>
    </div>
  );
}
