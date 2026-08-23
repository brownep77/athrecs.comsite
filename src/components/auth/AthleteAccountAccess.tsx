import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, LogIn, UserRound } from "lucide-react";
import { signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export function AthleteAccountAccess({ compact = false }: { compact?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  const [signingIn, setSigningIn] = useState(false);

  if (isPending) {
    return (
      <span
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-md text-muted",
          compact ? "w-9" : "w-24",
        )}
        aria-label="Checking account"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      </span>
    );
  }

  if (user) {
    return (
      <Link
        to="/athlete-account"
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-accent-soft px-2.5 text-sm font-semibold text-fg no-underline transition-colors hover:bg-accent/15",
          compact && "w-9 px-0",
        )}
        aria-label="My Athlete Account"
      >
        <UserRound className="size-4" aria-hidden="true" />
        {compact ? null : <span>My account</span>}
      </Link>
    );
  }

  async function startSignIn() {
    setSigningIn(true);
    try {
      await signIn("grok-google", {
        callbackURL: "/athlete-account",
        errorCallbackURL: "/athlete-account",
      });
    } catch {
      setSigningIn(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void startSignIn()}
      disabled={signingIn}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-accent-soft px-2.5 text-sm font-semibold text-fg transition-colors hover:bg-accent/15 disabled:opacity-60",
        compact && "w-9 px-0",
      )}
      aria-label={signingIn ? "Opening Google sign-in" : "Sign in or create an athlete account"}
    >
      {signingIn ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogIn className="size-4" aria-hidden="true" />
      )}
      {compact ? null : <span>{signingIn ? "Opening…" : "Sign in"}</span>}
    </button>
  );
}
