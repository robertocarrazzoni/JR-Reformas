"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/components/ui/toast";
import { apiFetch, getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const customerNav: NavItem[] = [
  { href: "/conta", label: "Visão geral", icon: LayoutDashboard, exact: true },
  {
    href: "/conta/agendamentos",
    label: "Agendamentos",
    icon: CalendarDays,
  },
  { href: "/agendar", label: "Agendar visita", icon: CalendarPlus },
  { href: "/perfil", label: "Perfil", icon: UserRound },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarClock },
  {
    href: "/admin/agendamentos",
    label: "Agendamentos",
    icon: ClipboardList,
  },
];

export interface ShellUser {
  name: string;
  email: string;
  role: string;
}

interface AppShellProps {
  user: ShellUser;
  variant: "customer" | "admin";
  children: ReactNode;
}

export function AppShell({ user, variant, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const items = variant === "admin" ? adminNav : customerNav;

  function isActive(item: NavItem) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await apiFetch("/api/users/logout", { method: "POST" });
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast({
        title: "Não foi possível sair",
        description: getErrorMessage(error),
        variant: "error",
      });
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 lg:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-ink-950 text-cream-50 lg:flex">
        <div className="p-6">
          <Logo className="text-cream-50" priority />
        </div>

        <div className="mx-4 rounded-2xl border border-cream-50/10 bg-cream-50/[0.04] p-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-cream-50">
                {user.name}
              </p>
              <p className="truncate text-xs text-cream-200/60">{user.email}</p>
            </div>
          </div>
          <span className="mt-3 inline-flex rounded-full border border-gold-400/25 bg-gold-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-300">
            {variant === "admin" ? "Administrador" : "Cliente"}
          </span>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-3" aria-label="Menu da conta">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-gold-500 text-ink-950 shadow-sm shadow-gold-500/30"
                    : "text-cream-200/75 hover:bg-cream-50/[0.06] hover:text-cream-50",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-cream-50/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-cream-200/75 transition-colors hover:bg-cream-50/[0.06] hover:text-cream-50"
          >
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
            Ver site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-cream-200/75 transition-colors hover:bg-cream-50/[0.06] hover:text-cream-50 disabled:opacity-60"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            {loggingOut ? "Saindo..." : "Sair da conta"}
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-900/10 bg-cream-50/95 px-5 backdrop-blur lg:hidden">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-gold-500/25 bg-gold-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-700">
              {variant === "admin" ? "Admin" : "Cliente"}
            </span>
            <Avatar name={user.name} size="sm" />
          </div>
        </header>

        <main className="flex-1 px-5 py-8 pb-28 sm:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <nav
          aria-label="Menu da conta — mobile"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-900/10 bg-cream-50/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur lg:hidden"
        >
          <div className="flex items-center justify-around">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-semibold transition-colors",
                    active
                      ? "text-gold-700"
                      : "text-ink-400 hover:text-ink-700",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-center leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
