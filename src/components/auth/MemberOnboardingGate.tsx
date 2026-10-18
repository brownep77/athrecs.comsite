import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyOnboarding } from "@/lib/athrecs/member-onboarding-api";
import { shouldRequestOnboarding, safeOnboardingReturnTo } from "@/lib/athrecs/member-onboarding";

/** Onboarding guidance; server authentication remains the access boundary. */
export function MemberOnboardingGate() {
  const { user, isPending } = useCurrentUserState();
  const location = useRouterState({ select: (state) => state.location });
  const navigate = useNavigate();
  const eligible = shouldRequestOnboarding(location.pathname);
  const returnTo = safeOnboardingReturnTo(location.href);
  const onboarding = useQuery({
    queryKey: ["member-onboarding", user?.id],
    queryFn: () => getMyOnboarding(),
    enabled: Boolean(user) && eligible,
    retry: false,
  });
  useEffect(() => {
    if (!isPending && user && eligible && onboarding.isSuccess && onboarding.data === null)
      void navigate({ to: "/join", search: { step: "profile", returnTo }, replace: true });
  }, [isPending, user, eligible, onboarding.isSuccess, onboarding.data, navigate, returnTo]);
  return null;
}
