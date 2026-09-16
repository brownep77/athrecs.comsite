import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyPartnerships } from "@/lib/athrecs/partnerships-api";
import { IS_ATHRECS_SITE } from "@/lib/site-scope";

export function usePartnerAccount() {
  const { user, isPending } = useCurrentUserState();
  const query = useQuery({
    queryKey: ["partners", "mine", user?.id],
    queryFn: () => getMyPartnerships(),
    enabled: !!user && IS_ATHRECS_SITE,
    retry: false,
  });
  return { user, isPending, query };
}
export function useRefreshPartners() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["partners"] });
}
export function formText(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}
