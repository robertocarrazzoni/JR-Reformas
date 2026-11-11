import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta para acompanhar agendamentos da JR Santana.",
};

interface LoginPageProps {
  searchParams: Promise<{
    next?: string | string[];
    cadastrado?: string | string[];
    redefinido?: string | string[];
    alterada?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = typeof params.next === "string" ? params.next : undefined;

  const notice = params.cadastrado
    ? "Conta criada com sucesso. Faça login para continuar."
    : params.redefinido
      ? "Senha redefinida com sucesso. Entre com a nova senha."
      : params.alterada
        ? "Senha alterada com sucesso. Entre com a nova senha."
        : undefined;

  return <LoginForm nextPath={nextPath} notice={notice} />;
}
