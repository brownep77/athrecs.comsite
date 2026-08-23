import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  ClipboardCheck,
  Loader2,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listStaffAthleteAccounts,
  type StaffAthleteAccountItem,
} from "@/lib/athrecs/athlete-account-api";

export const Route = createFileRoute("/admin/athlete-accounts")({
  head: () => ({
    meta: [
      { title: "Athlete accounts — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AdminAthleteAccountsPage,
});

function AdminAthleteAccountsPage() {
  const accounts = useQuery({
    queryKey: ["staff-athlete-accounts"],
    queryFn: () => listStaffAthleteAccounts(),
    staleTime: 30_000,
  });

  if (accounts.isLoading) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center gap-3 text-sm text-muted">
        <Loader2 className="size-5 animate-spin text-accent" aria-hidden="true" />
        Loading private athlete accounts…
      </div>
    );
  }

  if (accounts.isError || !accounts.data) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-950">
        <h1 className="font-display text-xl font-semibold">Athlete accounts could not load</h1>
        <p className="mt-2 text-sm">No account data was changed. Refresh to try again.</p>
        <Button className="mt-4" type="button" onClick={() => void accounts.refetch()}>
          <RefreshCw className="size-4" aria-hidden="true" /> Try again
        </Button>
      </div>
    );
  }

  const data = accounts.data;
  const withSports = data.filter((account) => account.sports.length).length;
  const withClaims = data.filter((account) => account.claimedProfiles.length).length;
  const researchConsent = data.filter((account) => account.consents.productResearch).length;
  const marketingConsent = data.filter((account) => account.consents.marketing).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Private athlete data
          </p>
          <h1 className="font-display text-3xl font-semibold text-fg">Athlete accounts</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted">
            Manage secure Entry Passports, see completion and claimed profiles, and confirm which
            athletes have separately approved analytics, research or marketing use.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void accounts.refetch()}>
          <RefreshCw className="size-4" aria-hidden="true" /> Refresh accounts
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Users} label="Athlete accounts" value={data.length} />
        <Metric icon={ClipboardCheck} label="Sports supplied" value={withSports} />
        <Metric icon={BadgeCheck} label="Linked profiles" value={withClaims} />
        <Metric icon={ShieldCheck} label="Product research" value={researchConsent} />
        <Metric icon={MailCheck} label="Marketing email" value={marketingConsent} />
      </div>

      <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">
        <strong>Restricted data:</strong> product and habit details must only be used according to
        the active consent shown on each account. Marketing consent is separate from product
        research consent.
      </div>

      {data.length ? (
        <div className="grid gap-4">
          {data.map((account) => (
            <AthleteAccountCard key={account.userId} account={account} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted">
          No athletes have completed an Athlete Account yet.
        </p>
      )}
    </div>
  );
}

function AthleteAccountCard({ account }: { account: StaffAthleteAccountItem }) {
  const primarySport = account.sports.find((sport) => sport.isPrimary) ?? account.sports[0];
  const supplied = [
    account.preferences.equipmentItems.length ? "Equipment" : null,
    account.preferences.nutritionProducts.length ? "Nutrition" : null,
    account.preferences.technologyDevices.length || account.preferences.technologyApps.length
      ? "Technology"
      : null,
    account.preferences.clothingItems.length ? "Clothing" : null,
    account.preferences.recoveryProducts.length ? "Recovery" : null,
  ].filter(Boolean) as string[];

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-fg">{account.fullName}</h2>
            <Badge className="border-emerald-500/30 bg-emerald-50 text-emerald-900">
              <MailCheck className="mr-1 size-3.5" aria-hidden="true" /> Verified email
            </Badge>
          </div>
          <p className="mt-1 break-all text-sm text-muted">{account.verifiedEmail}</p>
          <p className="mt-1 text-xs text-subtle">
            Account ID {account.userId} · Updated {formatDate(account.updatedAt)}
          </p>
        </div>
        <div className="min-w-44">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted">Completion</span>
            <strong className="text-fg">{account.completionPercent}%</strong>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${account.completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-4">
        <DetailBlock title="Entry Passport">
          <p>
            {[account.city, account.region, account.country].filter(Boolean).join(", ") ||
              "No location supplied"}
          </p>
          <p>{account.clubOrTeam || "No club or team supplied"}</p>
          <p>{account.nationality || "No nationality supplied"}</p>
        </DetailBlock>

        <DetailBlock title="Sports and habits">
          <p>{account.sports.map((sport) => sport.sportCode).join(", ") || "No sports supplied"}</p>
          {primarySport ? (
            <p>
              {primarySport.trainingSessionsPerWeek ?? "—"} sessions ·{" "}
              {primarySport.trainingHoursPerWeek ?? "—"} hours · {primarySport.eventsPerYear ?? "—"}{" "}
              events/year
            </p>
          ) : null}
        </DetailBlock>

        <DetailBlock title="Optional product data">
          <p>{supplied.join(", ") || "No product preferences supplied"}</p>
          <p>{account.preferences.equipmentBrands.join(", ") || "No equipment brands"}</p>
          <p>{account.preferences.technologyApps.join(", ") || "No apps supplied"}</p>
        </DetailBlock>

        <DetailBlock title="Consent status">
          <ConsentStatus label="Performance" active={account.consents.performanceInsights} />
          <ConsentStatus label="Personalisation" active={account.consents.personalisation} />
          <ConsentStatus label="Product research" active={account.consents.productResearch} />
          <ConsentStatus label="Marketing" active={account.consents.marketing} />
        </DetailBlock>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-bg px-5 py-3 text-sm">
        <span className="text-muted">
          {account.claimCount} claim{account.claimCount === 1 ? "" : "s"} ·{" "}
          {account.claimedProfiles.length} linked profile
          {account.claimedProfiles.length === 1 ? "" : "s"}
        </span>
        {account.claimedProfiles.length ? (
          <div className="flex flex-wrap gap-2">
            {account.claimedProfiles.map((profile) => (
              <Link
                key={profile.athleteId}
                to="/athletes/$slug"
                params={{ slug: profile.athleteSlug }}
                className="font-medium text-accent"
              >
                {profile.athleteName}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <Icon className="size-5 text-accent" aria-hidden="true" />
      <p className="mt-3 font-display text-2xl font-semibold text-fg">
        {value.toLocaleString("en-GB")}
      </p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </article>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-sm leading-6 text-muted">
      <h3 className="font-semibold text-fg">{title}</h3>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ConsentStatus({ label, active }: { label: string; active: boolean }) {
  return (
    <p className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className={active ? "font-medium text-emerald-700" : "text-subtle"}>
        {active ? "Granted" : "Not granted"}
      </span>
    </p>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB");
}
