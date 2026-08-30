import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  Archive,
  BarChart3,
  BadgeCheck,
  CalendarCheck,
  Database,
  ExternalLink,
  Loader2,
  LockKeyhole,
  LogOut,
  Network,
  RefreshCcw,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStaffAccess } from "@/lib/auth/staff-access";
import { signIn, signOut } from "@/lib/auth/client";
import {
  DEFAULT_STAFF_SITE_URL,
  isPermittedStaffHostname,
  normalizeHostname,
} from "@/lib/auth/staff-config";
import { cn } from "@/lib/utils";

const staffSiteUrl =
  import.meta.env.VITE_STAFF_SITE_URL?.trim().replace(/\/+$/, "") || DEFAULT_STAFF_SITE_URL;
const configuredStaffHost = normalizeHostname(staffSiteUrl);

const staffNav = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: ShieldCheck,
    match: (path: string) => path === "/admin",
  },
  {
    // The route generator refreshes the committed tree during the Vite build.
    to: "/admin/network" as never,
    label: "Network",
    icon: Network,
    match: (path: string) => path.startsWith("/admin/network"),
  },
  {
    // The committed route tree is refreshed by the Vite build.
    to: "/admin/catalogue-recovery-emergency" as never,
    label: "Catalogue recovery",
    icon: RefreshCcw,
    match: (path: string) => path.startsWith("/admin/catalogue-recovery"),
  },
  {
    to: "/admin/data-intelligence",
    label: "Data & analytics",
    icon: BarChart3,
    match: (path: string) => path.startsWith("/admin/data-intelligence"),
  },
  {
    to: "/admin/fixture-review",
    label: "Fixtures",
    icon: CalendarCheck,
    match: (path: string) => path.startsWith("/admin/fixture-review"),
  },
  {
    to: "/admin/result-archive",
    label: "Result archive",
    icon: Archive,
    match: (path: string) =>
      path.startsWith("/admin/result-archive") || path.startsWith("/admin/result-links"),
  },
  {
    to: "/admin/result-claims",
    label: "Claims",
    icon: BadgeCheck,
    match: (path: string) => path.startsWith("/admin/result-claims"),
  },
  {
    to: "/admin/athlete-accounts",
    label: "Athlete accounts",
    icon: UserRoundCog,
    match: (path: string) => path.startsWith("/admin/athlete-accounts"),
  },
  {
    to: "/admin/sources",
    label: "Sources",
    icon: Database,
    match: (path: string) => path.startsWith("/admin/sources"),
  },
] as const;

export function StaffMicrositeShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [hostname, setHostname] = useState<string | null>(null);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => setHostname(window.location.hostname), []);

  const allowedClientHost =
    hostname !== null && isPermittedStaffHostname(hostname, configuredStaffHost);
  const access = useQuery({
    queryKey: ["staff-access", hostname],
    queryFn: () => getStaffAccess(),
    enabled: allowedClientHost,
    retry: false,
    staleTime: 15_000,
  });

  if (hostname === null) return <StaffLoadingScreen label="Opening staff tools…" />;

  if (!allowedClientHost) {
    return (
      <StaffNotice
        icon={LockKeyhole}
        eyebrow="ATHRECS Staff"
        title="Staff tools have moved"
        description="Updates, fixture review and publishing now run on the private ATHRECS staff site. The public website no longer loads administration data."
      >
        <Button asChild>
          <a href={`${staffSiteUrl}/admin`}>
            Open staff site
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/">Return to ATHRECS</Link>
        </Button>
      </StaffNotice>
    );
  }

  if (access.isLoading) return <StaffLoadingScreen label="Checking staff access…" />;

  if (access.isError || !access.data) {
    return (
      <StaffNotice
        icon={AlertTriangle}
        eyebrow="ATHRECS Staff"
        title="Staff access could not be checked"
        description="Refresh the page to try again. No administration tools or data have been opened."
      >
        <Button type="button" onClick={() => void access.refetch()}>
          Try again
        </Button>
      </StaffNotice>
    );
  }

  if (!access.data.allowedHost) {
    return (
      <StaffNotice
        icon={AlertTriangle}
        eyebrow="Configuration mismatch"
        title="This staff host is not approved"
        description="The public and server staff-host settings do not match. Access remains locked until the deployment configuration is corrected."
      />
    );
  }

  if (!access.data.configured) {
    return (
      <StaffNotice
        icon={AlertTriangle}
        eyebrow="Setup required"
        title="Staff allowlist is not configured"
        description="Add at least one Google email address to ATHRECS_STAFF_EMAILS in the production environment. Access remains locked until then."
      />
    );
  }

  if (!access.data.signedIn) {
    async function startGoogleSignIn() {
      setSigningIn(true);
      setSignInError(null);
      try {
        await signIn("grok-google", {
          callbackURL: "/admin",
          errorCallbackURL: "/admin",
        });
      } catch (error) {
        setSignInError(error instanceof Error ? error.message : "Google sign-in failed");
        setSigningIn(false);
      }
    }

    return (
      <StaffNotice
        icon={LockKeyhole}
        eyebrow="Private staff microsite"
        title="Sign in to ATHRECS Staff"
        description="Use an approved Google account to manage fixtures, results and sources."
      >
        <Button type="button" disabled={signingIn} onClick={() => void startGoogleSignIn()}>
          {signingIn ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {signingIn ? "Opening Google…" : "Continue with Google"}
        </Button>
        {signInError ? (
          <p className="w-full text-sm text-red-700" role="alert">
            {signInError}
          </p>
        ) : null}
      </StaffNotice>
    );
  }

  if (!access.data.authorized) {
    const identityMessage = access.data.googleIdentity
      ? "This Google account is not on the ATHRECS staff allowlist."
      : "This session was not created with Google. Sign out and use an approved Google account.";
    return (
      <StaffNotice
        icon={AlertTriangle}
        eyebrow="Access denied"
        title="This account is not approved"
        description={identityMessage}
      >
        {access.data.email ? (
          <p className="w-full break-all rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
            Signed in as {access.data.email}
          </p>
        ) : null}
        <Button type="button" variant="secondary" onClick={() => void signOut("/admin")}>
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </Button>
      </StaffNotice>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/admin" className="flex items-center gap-3 no-underline">
            <img
              src="/athrecs-logo-header.png"
              alt="ATHRECS.com"
              width={158}
              height={32}
              className="h-8 w-auto brightness-0 invert"
            />
            <span className="border-l border-slate-700 pl-3 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
              Staff
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden max-w-64 truncate text-slate-300 sm:block">
              {access.data.email}
            </span>
            <button
              type="button"
              onClick={() => void signOut("/admin")}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-700 px-3 font-medium text-white transition-colors hover:border-cyan-400 hover:text-cyan-200"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
        <nav className="border-t border-slate-800" aria-label="Staff tools">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 md:px-6">
            {staffNav.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium no-underline transition-colors",
                    active
                      ? "bg-cyan-300 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  )}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            <a
              href="https://www.athrecs.com"
              className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-300 no-underline transition-colors hover:bg-slate-800 hover:text-white"
            >
              View ATHRECS
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}

function StaffLoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-4 text-white">
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <Loader2 className="size-5 animate-spin text-cyan-300" aria-hidden="true" />
        {label}
      </div>
    </div>
  );
}

function StaffNotice({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: typeof LockKeyhole;
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <img
            src="/athrecs-logo-header.png"
            alt="ATHRECS.com"
            width={158}
            height={32}
            className="h-8 w-auto brightness-0 invert"
          />
          <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-300">
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
        {children ? <div className="mt-6 flex flex-wrap gap-3">{children}</div> : null}
        <p className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
          Access attempts are checked again on every staff action.
        </p>
      </section>
    </div>
  );
}
