import { createFileRoute, Link } from "@tanstack/react-router";
import { EyeOff, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Athlete Account privacy | ATHRECS.com" },
      {
        name: "description",
        content: "How ATHRECS handles Athlete Account, Entry Passport and preference data.",
      },
    ],
  }),
  component: AthletePrivacyPage,
});

function AthletePrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="bg-gradient-to-r from-slate-950 to-cyan-950 px-5 py-7 text-white md:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
            <ShieldCheck className="size-4" aria-hidden="true" /> Athlete privacy
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold">
            Your account data, under your control
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            This notice explains the Athlete Account and Entry Passport. It is designed to keep
            required identity data separate from optional sport, product, analytics and marketing
            choices.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <PrivacyPrinciple
          icon={LockKeyhole}
          title="Private by default"
          text="Account details, product choices and claim evidence are restricted to you and authorised ATHRECS staff."
        />
        <PrivacyPrinciple
          icon={EyeOff}
          title="Not your public profile"
          text="Private account data is not published on athlete or result pages automatically."
        />
        <PrivacyPrinciple
          icon={RefreshCw}
          title="Choices can change"
          text="You can update optional answers or withdraw analytics, research and marketing consent at any time."
        />
      </div>

      <section className="space-y-6 rounded-xl border border-border bg-surface p-5 shadow-card md:p-8">
        <NoticeSection title="Information required to operate the account">
          <p>
            ATHRECS requires your verified Google email, full name and acknowledgement of this
            notice. These are used to authenticate you, protect result claims, prevent duplicate
            ownership and support your account.
          </p>
        </NoticeSection>

        <NoticeSection title="Optional Entry Passport information">
          <p>
            You can add location, date of birth, nationality, club, sports, disciplines, training
            patterns, goals and coach name. You can also record equipment, nutrition, technology,
            clothing, recovery and purchasing preferences. These questions are optional. Do not add
            medical diagnoses or other information you do not want ATHRECS to hold.
          </p>
        </NoticeSection>

        <NoticeSection title="Separate consent choices">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Performance insights uses approved sport, training and race data to produce athlete
              insights.
            </li>
            <li>Personalisation uses your choices to improve events and content shown to you.</li>
            <li>Product research uses optional preferences in aggregated analysis.</li>
            <li>
              Marketing permits relevant ATHRECS news, product information or partner offers by
              email.
            </li>
          </ul>
          <p className="mt-3">
            These choices are independent, switched off by default and are not required to create an
            account or claim a result.
          </p>
        </NoticeSection>

        <NoticeSection title="Private result archive and claims">
          <p>
            ATHRECS may hold source-checked race results in a private archive so athletes can find
            and claim their own records after signing in. Ordinary participant lists, names and
            finish times are not published as a browseable public directory. Public-figure results
            are the exception, and an athlete may later choose to publish their own profile. Claim
            evidence remains private, and claiming does not automatically publish your results or
            the private contents of your Entry Passport.
          </p>
        </NoticeSection>

        <NoticeSection title="Access, correction and withdrawal">
          <p>
            Use My Athlete Account to review and correct your details or change consent choices.
            ATHRECS records consent changes so its systems can respect a withdrawal. Account
            deletion and formal data-access requests will be handled through ATHRECS support once
            the relevant support channel is published on the site.
          </p>
        </NoticeSection>

        <p className="text-xs text-subtle">Athlete Account notice version: 23 August 2026.</p>
      </section>

      <div className="flex justify-end">
        <Button asChild>
          <Link to="/athlete-account">Open My Athlete Account</Link>
        </Button>
      </div>
    </div>
  );
}

function PrivacyPrinciple({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof LockKeyhole;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <Icon className="size-5 text-accent" aria-hidden="true" />
      <h2 className="mt-3 font-display text-lg font-semibold text-fg">{title}</h2>
      <p className="mt-1 text-sm leading-5 text-muted">{text}</p>
    </article>
  );
}

function NoticeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-sm leading-6 text-muted">
      <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
