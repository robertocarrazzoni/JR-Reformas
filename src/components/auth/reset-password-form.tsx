"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { apiFetch, getErrorMessage } from "@/lib/api";
import type { MessageResponse } from "@/lib/api-types";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    if (password.length < 6) {
      setFieldError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setFieldError("As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      await apiFetch<MessageResponse>("/api/users/reset-password", {
        method: "POST",
        json: { token, newPassword: password },
      });
      router.push("/login?redefinido=1");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-950">
          Link inválido
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          O link de redefinição está incompleto ou expirou. Solicite um novo
          e-mail de recuperação.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/esqueci-senha"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gold-500 px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
          >
            Solicitar novo link
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-ink-900/20 px-5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-950/5"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
        Nova senha
      </p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-950">
        Crie uma nova senha
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Escolha uma senha segura com pelo menos 6 caracteres.
      </p>

      {error ? (
        <Alert variant="error" className="mt-5">
          {error}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <Label htmlFor="reset-password">Nova senha</Label>
          <PasswordInput
            id="reset-password"
            className="mt-1.5"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo de 6 caracteres"
            autoComplete="new-password"
            required
          />
        </div>

        <div>
          <Label htmlFor="reset-confirm">Confirmar nova senha</Label>
          <PasswordInput
            id="reset-confirm"
            className="mt-1.5"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repita a nova senha"
            autoComplete="new-password"
            required
          />
          <FieldError>{fieldError}</FieldError>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          {loading ? "Salvando..." : "Redefinir senha"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Lembrou a senha?{" "}
        <Link
          href="/login"
          className="font-semibold text-gold-700 transition-colors hover:text-gold-600"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
