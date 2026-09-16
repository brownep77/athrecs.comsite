import { useId, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Handshake, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openAthleteAuth } from "@/lib/auth/client";
import { STATUS_LABELS } from "@/lib/athrecs/partnerships";
import { IS_ATHRECS_SITE } from "@/lib/site-scope";

export const inputClass =
  "mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-fg focus:outline-none focus:ring-2 focus:ring-accent";
export const panelClass = "rounded-xl border border-border bg-surface p-5 shadow-card md:p-6";
export function PartnerArea({ children }: { children: ReactNode }) {
  if (!IS_ATHRECS_SITE)
    return (
      <section className={panelClass}>
        <h1 className="font-display text-3xl">Brands & Partners</h1>
        <p className="my-4">Manage athlete and club partnerships on AthRecs.</p>
        <Button asChild>
          <a href="https://www.athrecs.com/brands">Open AthRecs partnerships</a>
        </Button>
      </section>
    );
  return <div className="space-y-6 pb-4">{children}</div>;
}
export function PartnerHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="space-y-4 border-b border-border pb-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-accent">
            <Handshake className="size-4" aria-hidden="true" /> Brands & Partners
          </p>
          <h1 className="font-display text-3xl font-semibold text-fg md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-base text-muted">{description}</p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/brands/manage">Brand dashboard</Link>
        </Button>
      </div>
      <nav
        aria-label="Partnerships"
        className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold"
      >
        <Link to="/brands" className="text-accent hover:underline">
          Brand directory
        </Link>
        <Link to="/opportunities" className="text-accent hover:underline">
          Opportunities
        </Link>
        <Link to="/brands/register" className="text-accent hover:underline">
          Register your brand
        </Link>
      </nav>
    </header>
  );
}
export function PartnerSignIn({ path }: { path: string }) {
  return (
    <section className={panelClass}>
      <h2 className="font-display text-xl font-semibold">Sign in to continue</h2>
      <p className="my-3 text-muted">
        Use your existing AthRecs account or create one. Brand registration is reviewed separately.
      </p>
      <Button onClick={() => openAthleteAuth({ callbackURL: path, errorCallbackURL: path })}>
        Sign in or create account
      </Button>
    </section>
  );
}
export function LoadingPartners() {
  return (
    <p className="flex items-center gap-2 py-8 text-muted" role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading partnerships…
    </p>
  );
}
export function PartnerError({ error }: { error: unknown }) {
  return error ? (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      {error instanceof Error ? error.message : "Something went wrong. Please try again."}
    </p>
  ) : null;
}
export function PartnerStatus({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${status === "approved" || status === "shared" ? "bg-accent-soft text-accent" : "bg-elevated text-fg"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
export function Field({
  label,
  name,
  value,
  max = 250,
  min = 2,
  type = "text",
  multiline = false,
  hint,
}: {
  label: string;
  name: string;
  value?: string;
  max?: number;
  min?: number;
  type?: string;
  multiline?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          defaultValue={value}
          required
          minLength={min}
          maxLength={max}
          rows={4}
          className={inputClass}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      ) : (
        <input
          id={id}
          name={name}
          defaultValue={value}
          type={type}
          required
          minLength={min}
          maxLength={max}
          className={inputClass}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      )}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
export function SelectField({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  options: Record<string, string>;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <select id={id} name={name} defaultValue={value} required className={inputClass}>
        {Object.entries(options).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
export function Declaration({
  children,
  name = "declaration",
}: {
  children: ReactNode;
  name?: string;
}) {
  return (
    <label className="flex items-start gap-3 text-sm leading-6">
      <input name={name} type="checkbox" required className="mt-1 size-4 shrink-0 accent-accent" />
      <span>{children}</span>
    </label>
  );
}
