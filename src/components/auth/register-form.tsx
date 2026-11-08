"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { apiFetch, getErrorMessage } from "@/lib/api";
import type { MessageResponse } from "@/lib/api-types";
import { registerSchema } from "@/lib/schemas/authSchema";

type FieldErrors = Partial<
  Record<"name" | "email" | "phone" | "password" | "confirmPassword" | "form", string>
>;

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse({
      name,
      email,
      password,
      phone: phone.trim() ? phone.trim() : undefined,
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

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "As senhas não conferem." });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await apiFetch<MessageResponse>("/api/users", {
        method: "POST",
        json: parsed.data,
      });
      router.push("/login?cadastrado=1");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
        Crie sua conta
      </p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-950">
        Agende sua primeira visita
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Leva menos de um minuto. Depois, é só escolher o melhor horário.
      </p>

      {error ? (
        <Alert variant="error" className="mt-5">
          {error}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <Label htmlFor="register-name">Nome completo</Label>
          <Input
            id="register-name"
            className="mt-1.5"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            required
          />
          <FieldError>{errors.name}</FieldError>
        </div>

        <div>
          <Label htmlFor="register-email">E-mail</Label>
          <Input
            id="register-email"
            type="email"
            className="mt-1.5"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            required
          />
          <FieldError>{errors.email}</FieldError>
        </div>

        <div>
          <Label htmlFor="register-phone">Telefone (opcional)</Label>
          <Input
            id="register-phone"
            className="mt-1.5"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="(00) 00000-0000"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={Boolean(errors.phone)}
          />
          <FieldError>{errors.phone}</FieldError>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="register-password">Senha</Label>
            <PasswordInput
              id="register-password"
              className="mt-1.5"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              required
            />
            <FieldError>{errors.password}</FieldError>
          </div>
          <div>
            <Label htmlFor="register-confirm">Confirmar senha</Label>
            <PasswordInput
              id="register-confirm"
              className="mt-1.5"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repita a senha"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              required
            />
            <FieldError>{errors.confirmPassword}</FieldError>
          </div>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Já tem uma conta?{" "}
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
