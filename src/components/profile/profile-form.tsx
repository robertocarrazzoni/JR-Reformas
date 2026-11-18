"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { apiFetch, getErrorMessage } from "@/lib/api";
import type { SessionUserDTO } from "@/lib/api-types";
import { updateSchema } from "@/lib/schemas/authSchema";

interface ProfileFormProps {
  user: Pick<SessionUserDTO, "name" | "email" | "phone">;
  onSaved?: () => void;
}

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "form", string>>;

export function ProfileForm({ user, onSaved }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const parsed = updateSchema.safeParse({
      name,
      email,
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

    setLoading(true);

    try {
      await apiFetch("/api/users", { method: "PATCH", json: parsed.data });
      toast({
        title: "Dados atualizados",
        description: "Suas informações de contato foram salvas.",
        variant: "success",
      });
      onSaved?.();
      router.refresh();
    } catch (error) {
      setErrors({ form: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados pessoais</CardTitle>
        <CardDescription>
          Usamos esses dados para entrar em contato sobre as visitas.
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
            <Label htmlFor="profile-name">Nome completo</Label>
            <Input
              id="profile-name"
              className="mt-1.5"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
            />
            <FieldError>{errors.name}</FieldError>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="profile-email">E-mail</Label>
              <Input
                id="profile-email"
                type="email"
                className="mt-1.5"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              <FieldError>{errors.email}</FieldError>
            </div>

            <div>
              <Label htmlFor="profile-phone">Telefone</Label>
              <Input
                id="profile-phone"
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
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              <Save className="h-4 w-4" aria-hidden="true" />
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
