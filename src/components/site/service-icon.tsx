import type { ServiceIcon as ServiceIconName } from "@/lib/config";
import {
  Building2,
  Hammer,
  Layers3,
  Paintbrush,
  PlugZap,
  Ruler,
} from "lucide-react";

const icons = {
  hammer: Hammer,
  building: Building2,
  paintbrush: Paintbrush,
  plug: PlugZap,
  ruler: Ruler,
  layers: Layers3,
} as const;

export function ServiceIcon({
  name,
  className,
}: {
  name: ServiceIconName;
  className?: string;
}) {
  const Icon = icons[name];
  return <Icon className={className} aria-hidden="true" />;
}
