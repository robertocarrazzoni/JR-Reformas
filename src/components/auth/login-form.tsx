"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { apiFetch, getErrorMessage } from "@/lib/api";
import type { AuthResponse } from "@/lib/api-types";

interface LoginFormProps {
  nextPath?: string;
  notice?: string;
}

export function LoginForm({ nextPath, notice }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<AuthResponse>("/api/users/login", {
        method: "POST",
        json: { email, password },
      });

      const safeNext =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : null;

      const destination =
        safeNext ?? (data.user.role === "ADMIN" ? "/admin" : "/conta");

      router.replace(destination);
      router.refresh();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
        Bem-vindo de volta
      </p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-950">
        Entrar na sua conta
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Acesse para acompanhar agendamentos e solicitar novas visitas.
      </p>

      {notice ? (
        <Alert variant="success" className="mt-5">
          {notice}
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="error" className="mt-5">
          {error}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <Label htmlFor="login-email">E-mail</Label>
          <Input
            id="login-email"
            type="email"
            className="mt-1.5"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Senha</Label>
            <Link
              href="/esqueci-senha"
              className="text-xs font-semibold text-gold-700 transition-colors hover:text-gold-600"
            >
              Esqueci minha senha
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            className="mt-1.5"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Sua senha"
            autoComplete="current-password"
            required
          />
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="inline-flex items-center gap-1 font-semibold text-gold-700 transition-colors hover:text-gold-600"
        >
          Criar conta
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </p>
    </div>
  );
}
