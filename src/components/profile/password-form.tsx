"use client";

import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/components/ui/toast";
import { apiFetch, getErrorMessage } from "@/lib/api";

type FieldErrors = Partial<
  Record<"currentPassword" | "newPassword" | "confirmPassword" | "form", string>
>;

export function PasswordForm() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const nextErrors: FieldErrors = {};

    if (!currentPassword) {
      nextErrors.currentPassword = "Informe a senha atual.";
    }

    if (newPassword.length < 6) {
      nextErrors.newPassword = "A nova senha deve ter pelo menos 6 caracteres.";
    }

    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "As senhas não conferem.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/api/users/password", {
        method: "PATCH",
        json: { currentPassword, newPassword },
      });
      toast({
        title: "Senha atualizada",
        description: "Use a nova senha no próximo acesso.",
        variant: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrors({ form: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senha de acesso</CardTitle>
        <CardDescription>
          Troque sua senha periodicamente para manter a conta segura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errors.form ? (
          <Alert variant="error" className="mb-4">
            {errors.form}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="current-password">Senha atual</Label>
            <PasswordInput
              id="current-password"
              className="mt-1.5"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.currentPassword)}
            />
            <FieldError>{errors.currentPassword}</FieldError>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="new-password">Nova senha</Label>
              <PasswordInput
                id="new-password"
                className="mt-1.5"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.newPassword)}
              />
              <FieldError>{errors.newPassword}</FieldError>
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <PasswordInput
                id="confirm-password"
                className="mt-1.5"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
              />
              <FieldError>{errors.confirmPassword}</FieldError>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              {loading ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
