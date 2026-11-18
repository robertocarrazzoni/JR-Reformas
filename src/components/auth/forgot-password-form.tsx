"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, getErrorMessage } from "@/lib/api";
import type { ForgotPasswordResponse } from "@/lib/api-types";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ForgotPasswordResponse | null>(null);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await apiFetch<ForgotPasswordResponse>(
        "/api/users/forgot-password",
        { method: "POST", json: { email } },
      );
      setResult(response);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
        Recuperar acesso
      </p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-950">
        Esqueceu sua senha?
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Informe o e-mail da sua conta. Enviaremos um link para criar uma nova
        senha.
      </p>

      {error ? (
        <Alert variant="error" className="mt-5">
          {error}
        </Alert>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-4">
          <Alert variant="success" title="Verifique seu e-mail">
            {result.message}
          </Alert>

          {result.resetToken ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Link de redefinição (modo de teste)</p>
              <p className="mt-1 text-xs leading-relaxed">
                Este link aparece aqui porque EXPOSE_RESET_TOKEN está ativo.
                Nunca habilite essa variável em produção.
              </p>
              <Link
                href={`/redefinir-senha?token=${encodeURIComponent(result.resetToken)}`}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-800"
              >
                <MailCheck className="h-4 w-4" aria-hidden="true" />
                Abrir link de redefinição
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <Label htmlFor="forgot-email">E-mail</Label>
          <Input
            id="forgot-email"
            type="email"
            className="mt-1.5"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
            required
          />
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          {loading ? "Enviando..." : "Enviar link de recuperação"}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-ink-600 transition-colors hover:text-ink-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Voltar para o login
        </Link>
        <Link
          href="/cadastro"
          className="font-semibold text-gold-700 transition-colors hover:text-gold-600"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
