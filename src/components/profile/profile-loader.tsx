"use client";

import { ProfileForm } from "@/components/profile/profile-form";
import { QueryError } from "@/components/ui/query-error";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/use-api-query";
import type { MeResponse } from "@/lib/api-types";

export function ProfileLoader() {
  const { data, error, loading, reload } = useApiQuery<MeResponse>(
    "/api/users/me",
  );

  if (loading && !data) {
    return <SkeletonCard />;
  }

  if (error) {
    return <QueryError message={error} onRetry={() => void reload()} />;
  }

  if (!data) {
    return null;
  }

  return (
    <ProfileForm user={data.user} onSaved={() => void reload()} />
  );
}
