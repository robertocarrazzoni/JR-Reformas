import type { ComponentProps } from "react";
import Link from "next/link";
import { buttonClasses, type ButtonProps } from "@/components/ui/button";

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

export function LinkButton({
  className,
  variant,
  size,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props} />
  );
}
