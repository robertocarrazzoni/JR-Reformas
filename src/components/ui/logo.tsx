import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  href?: string | null;
  showWordmark?: boolean;
  priority?: boolean;
}

export function Logo({
  className,
  href = "/",
  showWordmark = true,
  priority = false,
}: LogoProps) {
  const content = (
    <>
      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-gold-500/50">
        <Image
          src="/brand/logo.jpg"
          alt={siteConfig.fullName}
          width={88}
          height={88}
          className="h-full w-full object-cover"
          priority={priority}
        />
      </span>
      {showWordmark ? (
        <span className="leading-none">
          <span className="block font-display text-lg font-extrabold uppercase tracking-tight text-current">
            JR Santana
          </span>
          <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.26em] text-gold-500">
            Construções e Reformas
          </span>
        </span>
      ) : null}
    </>
  );

  const classes = cn("inline-flex items-center gap-3", className);

  if (!href) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link
      href={href}
      className={cn(
        classes,
        "transition-opacity hover:opacity-90 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-gold-500",
      )}
      aria-label={`${siteConfig.fullName} — página inicial`}
    >
      {content}
    </Link>
  );
}
