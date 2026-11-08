import type { Metadata } from "next";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DeleteAccount } from "@/components/profile/delete-account";
import { PasswordForm } from "@/components/profile/password-form";
import { ProfileForm } from "@/components/profile/profile-form";
import { requireUser } from "@/lib/session";
import { serializeSessionUser } from "@/lib/serializers";

export const metadata: Metadata = {
  title: "Meu perfil",
  description: "Atualize seus dados pessoais e a senha de acesso.",
};

export default async function ProfilePage() {
  const user = await requireUser();
  const serialized = serializeSessionUser(user);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">
              Meu perfil
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink-950">
              {user.name}
            </h1>
            <p className="mt-1 text-sm text-ink-500">{user.email}</p>
          </div>
        </div>
        <Badge variant="gold">Cliente</Badge>
      </header>

      <div className="space-y-6">
        <ProfileForm
          user={{
            name: serialized.name,
            email: serialized.email,
            phone: serialized.phone,
          }}
        />
        <PasswordForm />
        <DeleteAccount />
      </div>
    </div>
  );
}
