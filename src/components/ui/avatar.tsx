import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

interface AvatarProps {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 font-display font-bold text-ink-950 ring-1 ring-gold-500/30",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
