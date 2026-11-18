"use client";

import { useState, type SubmitEvent } from "react";
import { CalendarPlus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { apiFetch, getErrorMessage } from "@/lib/api";
import { toDateInputValue, toISOStringFromInputs } from "@/lib/format";

export function SlotForm({ onCreated }: { onCreated?: () => void }) {
  const { toast } = useToast();
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!date || !startTime || !endTime) {
      setError("Informe a data e os horários de início e término.");
      return;
    }

    const startsAt = toISOStringFromInputs(date, startTime);
    const endsAt = toISOStringFromInputs(date, endTime);

    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      setError("O horário de término deve ser posterior ao de início.");
      return;
    }

    if (new Date(startsAt).getTime() <= Date.now()) {
      setError("O horário de início deve estar no futuro.");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/api/slots", {
        method: "POST",
        json: { startsAt, endsAt },
      });
      toast({
        title: "Horário criado",
        description: "O novo horário já está disponível na agenda.",
        variant: "success",
      });
      setError(null);
      onCreated?.();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo horário</CardTitle>
        <CardDescription>
          Adicione um horário disponível para visitas técnicas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="slot-date">Data</Label>
            <Input
              id="slot-date"
              type="date"
              className="mt-1.5"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slot-start">Início</Label>
              <Input
                id="slot-start"
                type="time"
                className="mt-1.5"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="slot-end">Término</Label>
              <Input
                id="slot-end"
                type="time"
                className="mt-1.5"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            {loading ? "Criando..." : "Adicionar horário"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
