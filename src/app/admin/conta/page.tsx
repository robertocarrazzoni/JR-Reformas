import type { Metadata } from "next";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PasswordForm } from "@/components/profile/password-form";
import { ProfileLoader } from "@/components/profile/profile-loader";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Minha conta",
  description: "Atualize seus dados de acesso e a senha do painel administrativo.",
};

export default async function AdminAccountPage() {
  const user = await requireAdmin();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
              Minha conta
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink-950">
              {user.name}
            </h1>
            <p className="mt-1 text-sm text-ink-500">{user.email}</p>
          </div>
        </div>
        <Badge variant="gold">Administrador</Badge>
      </header>

      <div className="space-y-6">
        <ProfileLoader />
        <PasswordForm redirectTo="/login?alterada=1" />
      </div>

      <p className="text-xs leading-relaxed text-ink-400">
        Ao trocar a senha, todas as sessões abertas são encerradas — inclusive
        esta. Você será levado ao login para entrar com a nova senha.
      </p>
    </div>
  );
}
