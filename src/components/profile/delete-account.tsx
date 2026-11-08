"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, TriangleAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { apiFetch, getErrorMessage } from "@/lib/api";
import type { MessageResponse } from "@/lib/api-types";

const CONFIRMATION = "EXCLUIR";

export function DeleteAccount() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setError(null);
    setLoading(true);

    try {
      await apiFetch<MessageResponse>("/api/users", { method: "DELETE" });
      toast({
        title: "Conta excluída",
        description: "Sentiremos sua falta. Você pode criar uma nova conta quando quiser.",
        variant: "success",
      });
      router.replace("/");
      router.refresh();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setLoading(false);
    }
  }

  return (
    <Card className="border-rose-200">
      <CardHeader className="border-rose-200/70">
        <CardTitle className="text-rose-700">Excluir conta</CardTitle>
        <CardDescription>
          Esta ação é permanente. Todos os seus dados de acesso serão removidos.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-500">
          <TriangleAlert
            className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
            aria-hidden="true"
          />
          Contas com agendamentos vinculados não podem ser excluídas. Cancele ou
          aguarde a conclusão das visitas antes de continuar.
        </p>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => {
            setOpen(true);
            setConfirmation("");
            setError(null);
          }}
          className="shrink-0"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Excluir minha conta
        </Button>
      </CardContent>

      <Modal
        open={open}
        onClose={() => {
          if (!loading) {
            setOpen(false);
          }
        }}
        title="Excluir conta permanentemente?"
        description="Não é possível desfazer esta ação."
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Manter minha conta
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              loading={loading}
              disabled={confirmation !== CONFIRMATION}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {loading ? "Excluindo..." : "Excluir conta"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error ? <Alert variant="error">{error}</Alert> : null}

          <p className="text-sm leading-relaxed text-ink-600">
            Para confirmar, digite{" "}
            <strong className="font-semibold text-ink-950">{CONFIRMATION}</strong>{" "}
            no campo abaixo.
          </p>

          <div>
            <Label htmlFor="delete-confirmation">Confirmação</Label>
            <Input
              id="delete-confirmation"
              className="mt-1.5"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={CONFIRMATION}
              autoComplete="off"
            />
          </div>
        </div>
      </Modal>
    </Card>
  );
}
