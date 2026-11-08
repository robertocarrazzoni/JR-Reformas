import { Badge } from "@/components/ui/badge";

export function AppointmentStatusBadge({ status }: { status: string }) {
  if (status === "SCHEDULED") {
    return <Badge variant="success">Confirmado</Badge>;
  }

  if (status === "CANCELLED") {
    return <Badge variant="danger">Cancelado</Badge>;
  }

  if (status === "DONE") {
    return <Badge variant="gold">Concluído</Badge>;
  }

  return <Badge>{status}</Badge>;
}
