import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { openAthleteAuth } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";

export function ProfileSignIn({
  returnTo,
  preview = false,
}: {
  returnTo: string;
  preview?: boolean;
}) {
  return (
    <section className="mx-auto max-w-xl space-y-4 rounded-xl border border-border bg-surface p-6">
      {preview ? (
        <h2 className="font-display text-2xl font-semibold">View the full athlete profile</h2>
      ) : (
        <h1 className="font-display text-2xl font-semibold">Sign in to view athlete profiles</h1>
      )}
      <p>
        {preview
          ? "Log in or create a free account to see the full results history, achievements and profile details."
          : "Log in or create an account to view athlete profiles and their published results."}
      </p>
      <Button
        onClick={() =>
          openAthleteAuth({ mode: "signin", callbackURL: returnTo, errorCallbackURL: returnTo })
        }
      >
        Sign in or create an account
      </Button>
      <p className="text-sm text-muted">
        Claiming and editing a profile requires verified ownership.
      </p>
    </section>
  );
}

/** Hide previously loaded data on logout and reload it after popup sign-in. */
export function ProfileViewer({
  children,
  returnTo,
  authenticated,
  signedOut,
}: {
  children: ReactNode;
  returnTo: string;
  authenticated: boolean;
  signedOut?: ReactNode;
}) {
  const { user, isPending } = useCurrentUserState();
  const router = useRouter();
  const previous = useRef<string | null | undefined>(undefined);
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!isPending && previous.current !== userId) {
      previous.current = userId;
      void router.invalidate();
    }
  }, [userId, isPending, router]);
  const fallback = signedOut ?? <ProfileSignIn returnTo={returnTo} />;
  if (isPending) return authenticated ? <>{children}</> : <>{fallback}</>;
  if (!user) return <>{fallback}</>;
  return <>{children}</>;
}
