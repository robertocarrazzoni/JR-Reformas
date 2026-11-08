import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description:
    "Crie sua conta na JR Santana e agende uma visita técnica para sua obra.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
