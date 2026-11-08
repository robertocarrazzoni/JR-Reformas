"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  LayoutDashboard,
  LogIn,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { LinkButton } from "@/components/ui/link-button";
import { Logo } from "@/components/ui/logo";
import { publicNav } from "@/lib/config";
import { cn } from "@/lib/cn";

export interface NavUser {
  name: string;
  role: string;
}

export function PublicHeader({ user }: { user: NavUser | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;
  const accountHref = user?.role === "ADMIN" ? "/admin" : "/conta";
  const bookingHref = user ? "/agendar" : "/login?next=%2Fagendar";

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        transparent
          ? "bg-transparent text-cream-50"
          : "border-b border-ink-900/10 bg-cream-50/95 text-ink-900 shadow-sm backdrop-blur",
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo priority className={transparent ? "text-cream-50" : "text-ink-900"} />

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-1 lg:flex"
        >
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                transparent
                  ? "text-cream-100/80 hover:bg-cream-50/10 hover:text-cream-50"
                  : "text-ink-600 hover:bg-ink-950/5 hover:text-ink-950",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                href={accountHref}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
                  transparent
                    ? "text-cream-50 hover:bg-cream-50/10"
                    : "text-ink-800 hover:bg-ink-950/5",
                )}
              >
                <Avatar name={user.name} size="sm" />
                <span className="max-w-28 truncate">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <LinkButton href={bookingHref} variant="primary" size="sm">
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Agendar
              </LinkButton>
            </>
          ) : (
            <>
              <LinkButton
                href="/login"
                variant={transparent ? "gold-outline" : "ghost"}
                size="sm"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Entrar
              </LinkButton>
              <LinkButton href={bookingHref} variant="primary" size="sm">
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Agendar
              </LinkButton>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors lg:hidden",
            transparent
              ? "hover:bg-cream-50/10"
              : "hover:bg-ink-950/5",
          )}
        >
          {open ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-cream-50/10 bg-ink-950 text-cream-50 lg:hidden"
        >
          <nav
            aria-label="Navegação principal — mobile"
            onClick={closeMenu}
            className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-5 py-5 sm:px-8"
          >
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-3 text-sm font-medium text-cream-100/80 transition-colors hover:bg-cream-50/10 hover:text-cream-50"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 grid gap-2 border-t border-cream-50/10 pt-4">
              {user ? (
                <>
                  <LinkButton href={accountHref} variant="secondary" size="md">
                    {user.role === "ADMIN" ? (
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                    )}
                    {user.role === "ADMIN" ? "Painel admin" : "Minha conta"}
                  </LinkButton>
                  <LinkButton href={bookingHref} variant="primary" size="md">
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                    Agendar visita
                  </LinkButton>
                </>
              ) : (
                <>
                  <LinkButton href="/login" variant="secondary" size="md">
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Entrar
                  </LinkButton>
                  <LinkButton href={bookingHref} variant="primary" size="md">
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                    Agendar visita
                  </LinkButton>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
