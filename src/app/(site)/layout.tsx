import type { ReactNode } from "react";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { getSessionUser } from "@/lib/session";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-cream-50"
      >
        Pular para o conteúdo
      </a>
      <PublicHeader user={user ? { name: user.name, role: user.role } : null} />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
