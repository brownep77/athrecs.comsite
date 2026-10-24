import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfileRevision } from "@/lib/athrecs/profile-revision-api";

/** Derived achievements update with the same result set as PBs, countries and race history. */
export function useProfileResultRefresh(userId?: string) {
  const client = useQueryClient();
  const last = useRef<string | null>(null);
  const revision = useQuery({
    queryKey: ["my-profile-revision", userId],
    queryFn: () => getMyProfileRevision(),
    enabled: Boolean(userId),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: "always",
    retry: 1,
  });
  useEffect(() => {
    const next = userId && revision.data ? `${userId}:${revision.data}` : null;
    if (!next || next === last.current) return;
    last.current = next;
    for (const key of [
      "my-athlete-account",
      "my-athlete-bio",
      "my-profile-result-visibility",
      "athlete-workspace",
      "managed-performance-history",
    ]) {
      void client.invalidateQueries({ queryKey: [key] });
    }
  }, [client, userId, revision.data]);
}
