import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  authClient,
  signInWithProvider,
} from "@/lib/auth/client";
import { getAvailableAuthMethods } from "@/lib/auth/auth-methods-api";
import {
  AUTH_DIALOG_EVENT,
  safeAuthCallback,
  type AuthDialogMode,
  type AuthDialogOptions,
} from "@/lib/auth/auth-methods";
import { cn } from "@/lib/utils";

const AUTH_QUERY_KEYS = ["auth", "authMode", "returnTo", "token", "error"] as const;

function pathWithoutAuthParams(url: URL): string {
  const clean = new URL(url);
  for (const key of AUTH_QUERY_KEYS) clean.searchParams.delete(key);
  return `${clean.pathname}${clean.search}${clean.hash}`;
}

function authCallbackPath(callbackURL: string, mode: AuthDialogMode): string {
  const safe = safeAuthCallback(callbackURL);
  const url = new URL(safe, window.location.origin);
  url.searchParams.set("auth", "1");
  url.searchParams.set("authMode", mode);
  url.searchParams.set("returnTo", safe);
  return `${url.pathname}${url.search}${url.hash}`;
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

export function AthleteAuthDialog() {
  const titleId = useId();
  const emailInput = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthDialogMode>("signin");
  const [callbackURL, setCallbackURL] = useState("/athlete-account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const methods = useQuery({
    queryKey: ["available-auth-methods"],
    queryFn: () => getAvailableAuthMethods(),
    enabled: open,
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    setMounted(true);
    const initial = new URL(window.location.href);
    if (initial.searchParams.get("auth") === "1") {
      const requestedMode = initial.searchParams.get("authMode");
      const nextMode: AuthDialogMode =
        requestedMode === "signup" ||
        requestedMode === "forgot" ||
        requestedMode === "reset"
          ? requestedMode
          : "signin";
      setMode(nextMode);
      setCallbackURL(
        safeAuthCallback(
          initial.searchParams.get("returnTo") ?? pathWithoutAuthParams(initial),
        ),
      );
      setResetToken(initial.searchParams.get("token"));
      const oauthError = initial.searchParams.get("error");
      if (oauthError) {
        setError(
          oauthError === "email_not_found" || oauthError === "email_is_missing"
            ? "That provider did not share an email address. Use email sign-up or another provider."
            : "The sign-in provider could not complete the request. Try again or choose another method.",
        );
      }
      setOpen(true);
    }

    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<AuthDialogOptions>).detail ?? {};
      setCallbackURL(safeAuthCallback(detail.callbackURL));
      setMode(detail.mode ?? "signin");
      setMessage(null);
      setError(null);
      setNeedsVerification(false);
      setOpen(true);
    };
    window.addEventListener(AUTH_DIALOG_EVENT, onOpen);
    return () => window.removeEventListener(AUTH_DIALOG_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => emailInput.current?.focus(), 80);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) closeDialog();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, mode, busy]);

  function clearStatus() {
    setMessage(null);
    setError(null);
    setNeedsVerification(false);
  }

  function switchMode(nextMode: AuthDialogMode) {
    clearStatus();
    setPassword("");
    setConfirmPassword("");
    setMode(nextMode);
  }

  function cleanBrowserUrl() {
    const url = new URL(window.location.href);
    for (const key of AUTH_QUERY_KEYS) url.searchParams.delete(key);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function closeDialog() {
    if (busy) return;
    setOpen(false);
    clearStatus();
    cleanBrowserUrl();
  }

  async function startProvider(providerId: Parameters<typeof signInWithProvider>[0]) {
    setBusy(providerId);
    clearStatus();
    try {
      await signInWithProvider(providerId, {
        callbackURL,
        errorCallbackURL: authCallbackPath(callbackURL, mode),
      });
    } catch (cause) {
      setError(errorMessage(cause, "That sign-in method could not be opened."));
      setBusy(null);
    }
  }

  function validateEmailFields(): string | null {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return "Enter a valid email address.";
    if (mode === "forgot") return null;
    if (password.length < 10) return "Use a password of at least 10 characters.";
    if (mode === "signup") {
      if (name.trim().length < 2) return "Enter your full name.";
      if (password !== confirmPassword) return "The passwords do not match.";
    }
    if (mode === "reset" && password !== confirmPassword) {
      return "The passwords do not match.";
    }
    return null;
  }

  async function submitEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearStatus();
    const validation = validateEmailFields();
    if (validation) {
      setError(validation);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setBusy(`email-${mode}`);
    try {
      if (mode === "signup") {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: normalizedEmail,
          password,
          callbackURL,
        });
        if (result.error) throw new Error(result.error.message ?? "Account creation failed");
        setMessage(
          "Check your email for the ATHRECS verification link. The account is protected until you confirm it.",
        );
        setPassword("");
        setConfirmPassword("");
      } else if (mode === "signin") {
        const result = await authClient.signIn.email({
          email: normalizedEmail,
          password,
          rememberMe: true,
          callbackURL,
        });
        if (result.error) {
          const verificationRequired = result.error.status === 403;
          setNeedsVerification(verificationRequired);
          throw new Error(
            verificationRequired
              ? "Verify your email before signing in. A new verification email can be sent below."
              : result.error.message ?? "Email sign-in failed",
          );
        }
        window.location.href = callbackURL;
      } else if (mode === "forgot") {
        const result = await authClient.requestPasswordReset({
          email: normalizedEmail,
          redirectTo: `${window.location.origin}${authCallbackPath(callbackURL, "reset")}`,
        });
        if (result.error) throw new Error(result.error.message ?? "Reset request failed");
        setMessage(
          "If that email belongs to an ATHRECS account, a password-reset link has been sent.",
        );
      } else {
        if (!resetToken) throw new Error("This password-reset link is missing or has expired.");
        const result = await authClient.resetPassword({
          newPassword: password,
          token: resetToken,
        });
        if (result.error) throw new Error(result.error.message ?? "Password reset failed");
        setMessage("Your password has been changed. Sign in with the new password.");
        setResetToken(null);
        setPassword("");
        setConfirmPassword("");
        setMode("signin");
        cleanBrowserUrl();
      }
    } catch (cause) {
      setError(errorMessage(cause, "ATHRECS could not complete the request."));
    } finally {
      setBusy(null);
    }
  }

  async function resendVerification() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter your email address first.");
      return;
    }
    setBusy("verification");
    clearStatus();
    try {
      const result = await authClient.sendVerificationEmail({
        email: normalizedEmail,
        callbackURL,
      });
      if (result.error) throw new Error(result.error.message ?? "Verification email failed");
      setMessage("A new verification link has been sent if the account exists.");
    } catch (cause) {
      setError(errorMessage(cause, "ATHRECS could not send the verification email."));
    } finally {
      setBusy(null);
    }
  }

  if (!mounted || !open) return null;

  const emailAvailable = methods.data?.emailPassword === true;
  const socialProviders = methods.data?.providers ?? [];
  const formTitle =
    mode === "signup"
      ? "Create an Athlete Account"
      : mode === "forgot"
        ? "Reset your password"
        : mode === "reset"
          ? "Choose a new password"
          : "Sign in to ATHRECS";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) closeDialog();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[96dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-surface shadow-2xl sm:max-w-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-5 text-white sm:px-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300">
              <ShieldCheck className="size-4" aria-hidden="true" /> Secure Athlete Account
            </div>
            <h2 id={titleId} className="mt-2 font-display text-2xl font-semibold">
              {formTitle}
            </h2>
            <p className="mt-1 max-w-md text-sm leading-5 text-slate-300">
              One account for your Entry Passport, claimed results and future race-entry tools.
            </p>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            disabled={Boolean(busy)}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            aria-label="Close sign-in"
          >
            <XIcon className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          {mode === "signin" || mode === "signup" ? (
            <div className="grid grid-cols-2 rounded-lg bg-elevated p-1" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signin"}
                onClick={() => switchMode("signin")}
                className={cn(
                  "min-h-10 rounded-md px-3 text-sm font-semibold transition-colors",
                  mode === "signin" ? "bg-surface text-fg shadow-sm" : "text-muted",
                )}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                onClick={() => switchMode("signup")}
                className={cn(
                  "min-h-10 rounded-md px-3 text-sm font-semibold transition-colors",
                  mode === "signup" ? "bg-surface text-fg shadow-sm" : "text-muted",
                )}
              >
                Create account
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent"
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> Back to sign in
            </button>
          )}

          {(mode === "signin" || mode === "signup") && socialProviders.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {socialProviders.map((provider) => (
                <Button
                  key={provider.providerId}
                  type="button"
                  variant="secondary"
                  className="justify-start bg-surface"
                  disabled={Boolean(busy)}
                  onClick={() => void startProvider(provider.providerId)}
                >
                  {busy === provider.providerId ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <span
                      className="inline-flex size-6 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white"
                      aria-hidden="true"
                    >
                      {provider.label.charAt(0)}
                    </span>
                  )}
                  Continue with {provider.label}
                </Button>
              ))}
            </div>
          ) : null}

          {methods.isLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-border p-4 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading secure sign-in methods…
            </div>
          ) : methods.isError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-50 p-4 text-sm text-red-900">
              Sign-in methods could not be loaded. Close this window and try again.
            </div>
          ) : null}

          {emailAvailable ? (
            <>
              {(mode === "signin" || mode === "signup") && socialProviders.length > 0 ? (
                <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-subtle">
                  <span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" />
                </div>
              ) : null}

              <form className="space-y-4" onSubmit={(event) => void submitEmail(event)}>
                {mode === "signup" ? (
                  <label className="block space-y-1.5 text-sm font-medium text-fg">
                    Full name
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-3.5 size-4 text-subtle" aria-hidden="true" />
                      <input
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={120}
                        className="h-11 w-full rounded-lg border border-border bg-bg pl-10 pr-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
                        required
                      />
                    </div>
                  </label>
                ) : null}

                {mode !== "reset" ? (
                  <label className="block space-y-1.5 text-sm font-medium text-fg">
                    Email address
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-3.5 size-4 text-subtle" aria-hidden="true" />
                      <input
                        ref={emailInput}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        maxLength={254}
                        className="h-11 w-full rounded-lg border border-border bg-bg pl-10 pr-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
                        required
                      />
                    </div>
                  </label>
                ) : null}

                {mode !== "forgot" ? (
                  <label className="block space-y-1.5 text-sm font-medium text-fg">
                    {mode === "reset" ? "New password" : "Password"}
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 size-4 text-subtle" aria-hidden="true" />
                      <input
                        ref={mode === "reset" ? emailInput : undefined}
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          mode === "signin" ? "current-password" : "new-password"
                        }
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={10}
                        maxLength={128}
                        className="h-11 w-full rounded-lg border border-border bg-bg pl-10 pr-11 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-1 top-1 inline-flex size-9 items-center justify-center rounded-md text-muted hover:bg-elevated"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {mode !== "signin" ? (
                      <span className="block text-xs font-normal text-subtle">
                        At least 10 characters. Avoid a password used on another site.
                      </span>
                    ) : null}
                  </label>
                ) : null}

                {mode === "signup" || mode === "reset" ? (
                  <label className="block space-y-1.5 text-sm font-medium text-fg">
                    Confirm password
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      minLength={10}
                      maxLength={128}
                      className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
                      required
                    />
                  </label>
                ) : null}

                <Button type="submit" className="w-full" disabled={Boolean(busy)}>
                  {busy?.startsWith("email-") ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : mode === "signup" ? (
                    <UserRound className="size-4" aria-hidden="true" />
                  ) : (
                    <Mail className="size-4" aria-hidden="true" />
                  )}
                  {mode === "signup"
                    ? "Create account with email"
                    : mode === "forgot"
                      ? "Send password-reset link"
                      : mode === "reset"
                        ? "Save new password"
                        : "Sign in with email"}
                </Button>
              </form>

              {mode === "signin" ? (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="block w-full text-center text-sm font-semibold text-accent"
                >
                  Forgotten your password?
                </button>
              ) : null}
            </>
          ) : null}

          {!methods.isLoading &&
          !methods.isError &&
          !emailAvailable &&
          socialProviders.length === 0 ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-950">
              No public sign-in method is configured on this deployment yet.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-50 p-3 text-sm text-red-900" role="alert">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 p-3 text-sm text-emerald-950" role="status">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {message}
            </div>
          ) : null}
          {needsVerification ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={Boolean(busy)}
              onClick={() => void resendVerification()}
            >
              {busy === "verification" ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
              Resend verification email
            </Button>
          ) : null}

          <div className="rounded-lg bg-elevated p-3 text-xs leading-5 text-muted">
            <p className="flex items-start gap-2">
              <LockKeyhole className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              ATHRECS keeps account details private. Result claims are checked before a public athlete profile is linked.
            </p>
            <p className="mt-2 text-center">
              By continuing, you acknowledge the{" "}
              <Link to="/privacy" className="font-semibold text-accent" onClick={closeDialog}>
                privacy notice
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
