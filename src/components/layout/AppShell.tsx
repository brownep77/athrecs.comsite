import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  Home,
  List,
  Settings2,
  Users,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    to: "/races",
    label: "Events",
    icon: List,
    match: (p: string) => p.startsWith("/races"),
  },
  {
    to: "/athletes",
    label: "Athletes",
    icon: Users,
    match: (p: string) => p.startsWith("/athletes"),
  },
  {
    to: "/clubs",
    label: "Clubs",
    icon: UsersRound,
    match: (p: string) => p.startsWith("/clubs"),
  },
  {
    to: "/calendar",
    label: "Calendar",
    icon: CalendarDays,
    match: (p: string) => p.startsWith("/calendar"),
  },
  {
    to: "/admin",
    label: "Update",
    icon: Settings2,
    match: (p: string) => p.startsWith("/admin"),
  },
] as const;

function BrandLogo({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src="/athrecs-logo-header.png"
      alt="ATHRECS.com"
      width={158}
      height={32}
      className={cn("h-8 w-auto object-contain object-left", className)}
      decoding={priority ? "sync" : "async"}
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col overflow-x-hidden bg-bg">
      <header className="safe-pt sticky top-0 z-40 hidden border-b border-border/80 bg-bg/90 backdrop-blur-md md:block">
        <div className="flex h-16 items-center justify-between gap-4 px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 no-underline"
            aria-label="ATHRECS.com home"
          >
            <BrandLogo priority className="h-9" />
            <span className="hidden border-l border-border pl-3 text-[11px] leading-tight text-subtle lg:block">
              Holding
              <br />
              Norfolk pilot
            </span>
          </Link>
          <nav className="flex items-center gap-0.5">
            {nav.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium no-underline transition-colors",
                    active
                      ? "bg-elevated text-fg"
                      : "text-muted hover:bg-elevated/60 hover:text-fg",
                  )}
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <header className="safe-pt sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md md:hidden">
        <div className="flex h-12 items-center justify-between gap-2 px-4">
          <Link to="/" className="min-w-0 no-underline" aria-label="ATHRECS.com home">
            <BrandLogo className="h-7 max-w-[160px]" />
          </Link>
          <Link
            to="/calendar"
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent-soft px-3 text-sm font-semibold text-fg no-underline"
          >
            <CalendarDays className="h-4 w-4" strokeWidth={2} />
            Calendar
          </Link>
        </div>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-10 md:pt-8">
        {children}
      </main>

      <nav
        className="safe-pb fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-surface/95 backdrop-blur-md md:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-6 px-0.5 pt-1">
          {nav.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.to} className="min-w-0">
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[10px] font-medium no-underline",
                    active ? "text-fg" : "text-subtle",
                  )}
                >
                  <item.icon
                    className="h-5 w-5"
                    strokeWidth={active ? 2 : 1.6}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
