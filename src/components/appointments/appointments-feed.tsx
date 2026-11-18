"use client";

import { AppointmentsList } from "@/components/appointments/appointments-list";
import { QueryError } from "@/components/ui/query-error";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/use-api-query";
import type { AppointmentDTO } from "@/lib/api-types";

export function AppointmentsFeed({ role }: { role: string }) {
  const { data, error, loading, reload } = useApiQuery<AppointmentDTO[]>(
    "/api/appointments",
  );

  if (loading && !data) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-12 w-full rounded-xl" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return <QueryError message={error} onRetry={() => void reload()} />;
  }

  return (
    <AppointmentsList
      appointments={data ?? []}
      role={role}
      onCancelled={() => void reload()}
    />
  );
}
