import type { ReactNode } from "react";
import { ArrowUpRight, CalendarDays, Flag, Gauge, Medal, Users } from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { RunningGuidesLink } from "./RunningGuidesLink";
import {
  SUPERHALFS_BERLIN_FAQ,
  SUPERHALFS_CARDIFF_RACE_INFO,
  SUPERHALFS_CHECKED_AT,
  SUPERHALFS_CHECKED_LABEL,
  SUPERHALFS_CLAIMS,
  SUPERHALFS_OFFICIAL,
  SUPERHALFS_PACE_TARGETS,
  SUPERHALFS_QUESTIONS,
  SUPERHALFS_RACES,
  SUPERHALFS_RULES,
  SUPERHALFS_TIME_LIMIT_NEWS,
  type SuperHalfsRace,
} from "@/data/superhalfs";

const linkStyle =
  "font-semibold text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const sectionStyle = "scroll-mt-24 space-y-5";
const headingStyle = "font-display text-2xl font-semibold tracking-tight text-fg md:text-3xl";

function RaceCountry({ race }: { race: SuperHalfsRace }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="inline-flex shrink-0">
        <CountryFlag country={race.countryFlagCode ?? race.countryCode} />
      </span>
      <span>{race.country}</span>
    </span>
  );
}

function OfficialLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkStyle}>
      {children}
      <ArrowUpRight aria-hidden="true" className="ml-1 inline h-3.5 w-3.5" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function RaceCard({ race, index }: { race: SuperHalfsRace; index: number }) {
  return (
    <article
      id={race.id}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-elevated px-5 py-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="font-display text-3xl font-semibold text-accent/60">
            {String(index + 1).padStart(2, "0")}
          </span>
          <p className="text-sm font-semibold text-fg">
            <RaceCountry race={race} />
          </p>
        </div>
        <span className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-muted">
          {race.countryCode}
        </span>
      </div>
      <div className="space-y-5 p-5 md:p-6">
        <div className="space-y-2">
          <h3 className="font-display text-xl font-semibold leading-tight text-fg">{race.name}</h3>
          <p className="text-sm font-semibold text-accent">
            <time dateTime={race.date}>{race.dateLabel}</time>
            {race.dateStatus === "provisional" && " · Provisional"}
          </p>
          <p className="text-sm leading-relaxed text-muted">{race.course}</p>
        </div>
        <dl className="grid gap-3 rounded-xl border border-border bg-elevated p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              2027 local start
            </dt>
            <dd className="mt-1 font-medium text-fg">{race.start}</dd>
            <dd className="mt-1 text-xs text-muted">
              {race.timeZone.replace("Europe/", "")} local time
            </dd>
            {race.startNote && (
              <dd className="mt-2 text-xs leading-relaxed text-muted">{race.startNote}</dd>
            )}
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Published cutoff
            </dt>
            <dd className="mt-1 font-medium text-fg">{race.cutoff}</dd>
            <dd className="mt-1 text-xs text-muted">{race.cutoffStatus}</dd>
          </div>
        </dl>
        <div className="space-y-4 text-sm leading-relaxed text-muted">
          <div>
            <h4 className="mb-1 font-semibold text-fg">Amateur and club entry</h4>
            <p>{race.entry}</p>
          </div>
          <div>
            <h4 className="mb-1 font-semibold text-fg">Race-week planning</h4>
            <p>{race.practical}</p>
          </div>
          <div>
            <h4 className="mb-1 font-semibold text-fg">Elite and professional athletes</h4>
            <p>{race.elite}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-border pt-4 text-sm">
          <OfficialLink href={race.entryUrl}>Official entry</OfficialLink>
          <OfficialLink href={race.resultsUrl}>{race.resultsLabel}</OfficialLink>
          <OfficialLink href={race.eliteUrl}>
            {race.id === "cardiff" || race.id === "copenhagen"
              ? "Elite information"
              : "Organiser and elite enquiries"}
          </OfficialLink>
          {race.id === "cardiff" && (
            <a className={linkStyle} href="/running/races/cardiff-half-marathon">
              AthRecs Cardiff guide
            </a>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Official race information:{" "}
          {race.sources.map((source, sourceIndex) => (
            <span key={source.url}>
              {sourceIndex > 0 && " · "}
              <a
                className="underline underline-offset-2 hover:text-fg"
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </span>
          ))}
        </p>
      </div>
    </article>
  );
}

export function SuperHalfsPage() {
  return (
    <article className="space-y-10 pb-12 md:space-y-14">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <a href="/" className="hover:text-fg">
          Home
        </a>
        <span aria-hidden="true">/</span>
        <a href="/running" className="hover:text-fg">
          Running
        </a>
        <span aria-hidden="true">/</span>
        <a href="/running/race-series" className="hover:text-fg">
          Race series
        </a>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-semibold text-fg">
          SuperHalfs
        </span>
      </nav>

      <RunningGuidesLink />
      <header className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="h-1.5 bg-accent" />
        <div className="grid gap-8 p-5 md:p-8 lg:grid-cols-[1.5fr_1fr] lg:p-10">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              The AthRecs race-series guide
            </p>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl lg:text-5xl">
              SuperHalfs 2027
              <br />
              <span className="text-accent">Race preview &amp; runner guide</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted">
              SuperHalfs brings together six European half marathons: Lisbon, Prague, Berlin,
              Copenhagen, Cardiff and Valencia. Each race covers 21.0975 kilometres (13.1 miles).
              Complete all six in any order to earn the official SuperMedal. Compare 2027 dates,
              courses, entry routes and practical advice for amateur, club and elite runners.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#dates"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                Compare the six races
              </a>
              <a
                href="#entry"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-fg no-underline hover:bg-elevated"
              >
                How to enter <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs leading-relaxed text-muted">
              By AthRecs · Information checked{" "}
              <time dateTime={SUPERHALFS_CHECKED_AT}>{SUPERHALFS_CHECKED_LABEL}</time>.{" "}
              <a href="#sources" className="underline underline-offset-2">
                Official sources and update notes
              </a>
            </p>
          </div>
          <aside
            aria-label="SuperHalfs essentials"
            className="space-y-5 rounded-xl border border-border bg-elevated p-5 md:p-6"
          >
            <div className="grid grid-cols-3 gap-3 border-b border-border pb-5 text-center">
              <div>
                <p className="font-display text-3xl font-semibold text-fg">6</p>
                <p className="mt-1 text-xs text-muted">races</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold text-fg">21.1</p>
                <p className="mt-1 text-xs text-muted">km each</p>
              </div>
              <div>
                <Medal aria-hidden="true" className="mx-auto h-9 w-9 text-accent" />
                <p className="mt-1 text-xs text-muted">one SuperMedal</p>
              </div>
            </div>
            <h2 className="font-display text-lg font-semibold text-fg">
              No deadline for the six-race journey
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              The former five-year limit was removed in 2025. Plan around your race entries, goals
              and available time.
            </p>
            <p className="text-xs">
              <OfficialLink href={SUPERHALFS_TIME_LIMIT_NEWS}>
                Official completion-rule update
              </OfficialLink>
            </p>
            <div className="flex flex-wrap gap-2">
              {SUPERHALFS_RACES.map((race) => (
                <a
                  key={race.id}
                  href={`#${race.id}`}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg no-underline hover:border-accent"
                >
                  {race.city}
                </a>
              ))}
            </div>
          </aside>
        </div>
      </header>

      <nav aria-label="On this page" className="flex flex-wrap gap-2 border-y border-border py-4">
        {[
          ["preview", "2027 preview"],
          ["dates", "2027 dates"],
          ["choose", "Choose your race"],
          ["entry", "Entry & passport"],
          ["races", "Race previews"],
          ["cutoffs", "Cutoffs"],
          ["amateur", "Amateur planning"],
          ["elite", "Elite athletes"],
          ["checklist", "Runner checklist"],
          ["pace", "Pace guide"],
          ["questions", "Questions"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-muted no-underline hover:bg-elevated hover:text-fg"
          >
            {label}
          </a>
        ))}
      </nav>

      <section id="preview" className={sectionStyle} aria-labelledby="preview-heading">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            The season ahead
          </p>
          <h2 id="preview-heading" className={headingStyle}>
            SuperHalfs 2027 preview: plan your next half marathon
          </h2>
          <p className="max-w-4xl text-base leading-relaxed text-muted">
            Three spring races and three autumn races shape the 2027 calendar. Lisbon opens the
            season, with Prague and Berlin following in April. Copenhagen and Cardiff begin the
            autumn sequence, followed by Valencia’s provisional October date. Your starting point
            can be any of the six cities.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            { name: "Spring 2027", months: "March–April", races: SUPERHALFS_RACES.slice(0, 3) },
            { name: "Autumn 2027", months: "September–October", races: SUPERHALFS_RACES.slice(3) },
          ].map((season) => (
            <div
              key={season.name}
              className="rounded-xl border border-border bg-surface p-5 md:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
                <h3 className="font-display text-xl font-semibold text-fg">{season.name}</h3>
                <p className="text-xs font-medium text-muted">{season.months}</p>
              </div>
              <ol className="divide-y divide-border">
                {season.races.map((race) => (
                  <li
                    key={race.id}
                    className="flex items-baseline justify-between gap-4 py-3.5 last:pb-0"
                  >
                    <a href={`#${race.id}`} className={`${linkStyle} text-sm`}>
                      {race.city}
                    </a>
                    <div className="text-right text-sm text-fg">
                      <time dateTime={race.date}>{race.dateLabel.replace(" 2027", "")}</time>
                      {race.dateStatus === "provisional" && (
                        <p className="mt-1 text-xs font-medium text-muted">Provisional date</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <div className="grid gap-5 text-sm leading-relaxed text-muted lg:grid-cols-2">
          <p>
            <strong className="text-fg">Build a season that fits your goals.</strong> One spring
            race and one autumn race is a possible starting plan; one race each year also works.
            Prague and Berlin are on consecutive days, so consider separate years for these two. The
            current six-race series has no completion deadline.
          </p>
          <p>
            <strong className="text-fg">Secure a place before arranging travel.</strong> A
            SuperPassport records progress but does not reserve entries. Check each organiser’s
            available entry routes, the full cost of a travel or charity place, and the edition’s
            final course and race-day instructions.
          </p>
        </div>
        <p className="text-xs text-muted">
          Dates and race details are linked to their organisers below.{" "}
          <OfficialLink href={SUPERHALFS_RULES}>Official series rules and calendar</OfficialLink>
        </p>
      </section>

      <section id="dates" className={sectionStyle} aria-labelledby="dates-heading">
        <div className="space-y-2">
          <h2 id="dates-heading" className={headingStyle}>
            When are the SuperHalfs races in 2027?
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            Five dates are confirmed on the organisers’ websites. Valencia is provisionally listed
            by SuperHalfs. All dates refer to the local race day.
          </p>
        </div>
        <div
          className="overflow-x-auto rounded-xl border border-border bg-surface"
          tabIndex={0}
          role="region"
          aria-label="SuperHalfs 2027 dates table, scroll horizontally if needed"
        >
          <table className="w-full min-w-[620px] text-left text-sm">
            <caption className="sr-only">
              The six SuperHalfs races, their 2027 dates and confirmation status, checked{" "}
              {SUPERHALFS_CHECKED_LABEL}
            </caption>
            <thead className="border-b border-border bg-elevated text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-4">
                  Race
                </th>
                <th scope="col" className="px-5 py-4">
                  Country
                </th>
                <th scope="col" className="px-5 py-4">
                  2027 date
                </th>
                <th scope="col" className="px-5 py-4">
                  Date status
                </th>
              </tr>
            </thead>
            <tbody>
              {SUPERHALFS_RACES.map((race) => (
                <tr key={race.id} className="border-b border-border last:border-0">
                  <th scope="row" className="px-5 py-4">
                    <a className={linkStyle} href={`#${race.id}`}>
                      {race.city}
                    </a>
                  </th>
                  <td className="px-5 py-4 text-muted">
                    <RaceCountry race={race} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-fg">
                    <time dateTime={race.date}>{race.dateLabel}</time>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-border bg-elevated px-2.5 py-1 text-xs font-semibold text-fg">
                      {race.dateStatus === "confirmed" ? "Confirmed" : "Provisional"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed text-muted">
          <strong className="text-fg">Planning note:</strong> Prague is on Saturday 3 April and
          Berlin on Sunday 4 April. Completing both in the same weekend is unnecessary for the
          series; choose editions that suit your recovery and travel plans.
        </p>
      </section>

      <section id="choose" className={sectionStyle} aria-labelledby="choose-heading">
        <h2 id="choose-heading" className={headingStyle}>
          Which SuperHalfs race should I run first?
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          Choose the race whose entry availability, finishing requirements and travel arrangements
          fit your circumstances. There is no compulsory starting city. Use your main goal to decide
          which details matter most.
        </p>
        <div
          className="overflow-x-auto rounded-xl border border-border bg-surface"
          tabIndex={0}
          role="region"
          aria-label="Choose a SuperHalfs race by your running goal, scroll horizontally if needed"
        >
          <table className="w-full min-w-[620px] text-left text-sm">
            <caption className="sr-only">
              SuperHalfs race-choice guide for five running goals
            </caption>
            <thead className="border-b border-border bg-elevated text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-4">
                  Your goal
                </th>
                <th scope="col" className="px-5 py-4">
                  What to compare
                </th>
                <th scope="col" className="px-5 py-4">
                  Start here
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "First half marathon",
                  "Your expected finish time, the cutoff’s timing basis and any intermediate checkpoints.",
                  "cutoffs",
                  "Compare cutoffs",
                ],
                [
                  "Personal best",
                  "The confirmed course, start wave, qualifying evidence and likely race-day conditions. No course guarantees a PB.",
                  "pace",
                  "Check goal pace",
                ],
                [
                  "Running and a city break",
                  "Course landmarks, bib-collection days, accommodation and transport to the start.",
                  "races",
                  "Explore the six races",
                ],
                [
                  "Elite or professional competition",
                  "Accepted performances, the qualifying window, application deadlines and confirmed race support.",
                  "elite",
                  "Plan elite entry",
                ],
                [
                  "Completing all six",
                  "The cities still missing from your passport, available places and space between races.",
                  "entry",
                  "Check passport rules",
                ],
              ].map(([goal, comparison, target, label]) => (
                <tr key={goal} className="border-b border-border last:border-0">
                  <th scope="row" className="px-5 py-4 font-semibold text-fg">
                    {goal}
                  </th>
                  <td className="px-5 py-4 leading-relaxed text-muted">{comparison}</td>
                  <td className="px-5 py-4">
                    <a href={`#${target}`} className={linkStyle}>
                      {label}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-4xl text-sm leading-relaxed text-muted">
          Expecting to need more than three hours? Look closely at Berlin’s published
          3-hour-15-minute net limit and Cardiff’s four-hour allowance from the last starter. Their
          timing rules differ, so read the{" "}
          <a href="#cutoffs" className={linkStyle}>
            cutoff comparison
          </a>{" "}
          before choosing. A longer time allowance does not establish which course will feel
          easiest.
        </p>
      </section>

      <section id="entry" className={sectionStyle} aria-labelledby="entry-heading">
        <h2 id="entry-heading" className={headingStyle}>
          How do I enter SuperHalfs?
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Create your SuperPassport",
              "Register with SuperHalfs for your free digital passport. Keep its number ready when entering each race.",
            ],
            [
              "Secure each race entry",
              "Enter through the individual organiser’s available ballot, entry, charity or official travel route. Each race has its own fees and conditions.",
            ],
            [
              "Run, record and complete",
              "Include the passport number in your entries, check your stamps after each finish and collect the SuperMedal after completing the set.",
            ],
          ].map(([title, description], index) => (
            <li key={title} className="rounded-xl border border-border bg-surface p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Step {index + 1}
              </span>
              <h3 className="mb-2 mt-3 font-display text-lg font-semibold text-fg">{title}</h3>
              <p className="text-sm leading-relaxed text-muted">{description}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm">
          <OfficialLink href={SUPERHALFS_OFFICIAL}>
            Visit the official SuperHalfs website
          </OfficialLink>
        </p>
        <div className="space-y-3 rounded-xl border border-border bg-elevated p-5">
          <h3 className="font-display text-lg font-semibold text-fg">
            Which previous finishes count?
          </h3>
          <p className="text-sm leading-relaxed text-muted">
            Eligible editions begin with Prague on 2 April 2022; Berlin counts from 2024. Match the
            named event, year and official chip-time finish. Lisbon’s qualifying 2022 edition was in
            May. Cardiff’s March 2022 race is excluded; its October edition qualifies.
          </p>
          <p className="text-sm leading-relaxed text-muted">
            The original SH5 scheme is closed to new registrations. Retained five-race participants
            have a rolling 36-month window and can ask SuperHalfs to switch to SH6.
          </p>
          <p className="text-xs">
            <OfficialLink href={SUPERHALFS_RULES}>
              Check eligibility and your SuperPassport
            </OfficialLink>
          </p>
        </div>
      </section>

      <section id="races" className={sectionStyle} aria-labelledby="races-heading">
        <div className="space-y-2">
          <h2 id="races-heading" className={headingStyle}>
            The six SuperHalfs race previews
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            Compare the race experience, practical arrangements and entry routes. Entry status
            reflects the checked date; use the organiser’s links for availability, prices and final
            race instructions.
          </p>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          {SUPERHALFS_RACES.map((race, index) => (
            <RaceCard key={race.id} race={race} index={index} />
          ))}
        </div>
      </section>

      <section id="cutoffs" className={sectionStyle} aria-labelledby="cutoffs-heading">
        <h2 id="cutoffs-heading" className={headingStyle}>
          What are the SuperHalfs finishing time limits?
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          The series has no overall deadline, but each individual race has a cutoff. Net time starts
          when you cross the start line; gun time starts at the race signal. Intermediate
          checkpoints and road closures can also apply.
        </p>
        <div
          className="overflow-x-auto rounded-xl border border-border bg-surface"
          tabIndex={0}
          role="region"
          aria-label="SuperHalfs cutoff comparison, scroll horizontally if needed"
        >
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">
              Published SuperHalfs cutoffs, their timing basis and applicable edition
            </caption>
            <thead className="border-b border-border bg-elevated text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-4">
                  Race
                </th>
                <th scope="col" className="px-5 py-4">
                  Published limit
                </th>
                <th scope="col" className="px-5 py-4">
                  Timing and edition
                </th>
              </tr>
            </thead>
            <tbody>
              {SUPERHALFS_RACES.map((race) => (
                <tr key={race.id} className="border-b border-border last:border-0">
                  <th scope="row" className="px-5 py-4 text-fg">
                    <a href={race.rulesUrl} className={linkStyle}>
                      {race.city}
                    </a>
                  </th>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-fg">
                    {race.cutoff}
                  </td>
                  <td className="px-5 py-4 text-muted">
                    <p className="font-medium text-fg">{race.cutoffStatus}</p>
                    <p className="mt-1 leading-relaxed">{race.cutoffBasis}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed text-muted">
          Valencia’s figure is a{" "}
          <strong className="text-fg">2026 reference, not a confirmed 2027 limit</strong>. Prague’s
          published general rule also needs checking against the final 2027 instructions. Plan with
          a margin for aid stations and checkpoints.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          id="amateur"
          className={`${sectionStyle} rounded-2xl border border-border bg-surface p-5 md:p-6`}
          aria-labelledby="amateur-heading"
        >
          <Users aria-hidden="true" className="h-6 w-6 text-accent" />
          <h2 id="amateur-heading" className="font-display text-2xl font-semibold text-fg">
            For amateur, club and first-time runners
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Start with the race you can enter and prepare for comfortably. A useful series plan
            balances running, cost and the time needed to enjoy each city.
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted">
            <li>
              <strong className="text-fg">Choose your goal.</strong> Decide whether you want a first
              finish, a personal best or a city break. Compare the cutoff and course before choosing
              a target.
            </li>
            <li>
              <strong className="text-fg">Budget for the whole trip.</strong> Include entry,
              transport, accommodation, local travel and any charity commitment. Confirm your place
              before making inflexible bookings.
            </li>
            <li>
              <strong className="text-fg">Plan around bib collection.</strong> An early flight on
              race morning may leave no opportunity to collect your number. Check expo days,
              identification and collection rules.
            </li>
            <li>
              <strong className="text-fg">Check access and support.</strong> Ask the organiser about
              guide runners, disability entries, wheelchair categories, accessible facilities and
              companion arrangements before booking.
            </li>
            <li>
              <strong className="text-fg">Leave recovery space.</strong> Spread races across seasons
              or years. Your training, work and family schedule can shape the order.
            </li>
          </ul>
        </section>
        <section
          id="elite"
          className={`${sectionStyle} rounded-2xl border border-border bg-surface p-5 md:p-6`}
          aria-labelledby="elite-heading"
        >
          <Flag aria-hidden="true" className="h-6 w-6 text-accent" />
          <h2 id="elite-heading" className="font-display text-2xl font-semibold text-fg">
            For elite and professional athletes
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Use each organiser’s elite process and obtain written acceptance. The event-specific
            notes above identify confirmed provisions and requirements still awaiting publication.
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted">
            <li>
              <strong className="text-fg">Prepare a performance record.</strong> Have recent
              official results, personal and season bests, race dates, timing type and
              representative contact details ready.
            </li>
            <li>
              <strong className="text-fg">Confirm the qualifying window.</strong> Ask which
              distances and results are accepted, whether marks must be gun or chip times, and the
              application deadline.
            </li>
            <li>
              <strong className="text-fg">Confirm the race package.</strong> Ask about entry,
              travel, accommodation, personal refreshments, start access and any appearance or prize
              arrangements.
            </li>
            <li>
              <strong className="text-fg">Check classification rules.</strong> Confirm the course,
              category and governing-body requirements relevant to your record, ranking or
              qualification objective.
            </li>
            <li>
              <strong className="text-fg">Keep series tracking organised.</strong> If you also want
              to complete SuperHalfs, confirm that your accepted entry carries the correct
              SuperPassport details.
            </li>
          </ul>
        </section>
      </div>

      <section id="checklist" className={sectionStyle} aria-labelledby="checklist-heading">
        <h2 id="checklist-heading" className={headingStyle}>
          Your SuperHalfs runner checklist
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          Work through these four stages for each race. Keep the organiser’s final instructions with
          your entry confirmation so you can check details while travelling.
        </p>
        <ol className="grid gap-5 md:grid-cols-2">
          <li className="space-y-3 rounded-xl border border-border bg-surface p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              01 · Before entry
            </p>
            <h3 className="font-display text-xl font-semibold text-fg">
              Confirm your place and details
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              Select the designated half marathon and correct year. Compare the cutoff with your
              expected finish, read the entry conditions, and budget for the whole trip. Use the
              same name as your SuperHalfs account and include your SuperPassport number.
            </p>
          </li>
          <li className="space-y-3 rounded-xl border border-border bg-surface p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              02 · Before travel
            </p>
            <h3 className="font-display text-xl font-semibold text-fg">
              Plan around bib collection
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              Berlin requires personal collection at the EXPO with your start card and photo ID;
              there is no collection on race Sunday, 4 April 2027. Cardiff’s current guidance
              provides posted packs for UK entrants and Event Village collection for overseas
              entrants. Check the final instructions for your edition before booking arrival times.
            </p>
            <p className="text-xs">
              <OfficialLink href={SUPERHALFS_BERLIN_FAQ}>Berlin collection rules</OfficialLink>
              {" · "}
              <OfficialLink href={SUPERHALFS_CARDIFF_RACE_INFO}>
                Cardiff race information
              </OfficialLink>
            </p>
          </li>
          <li className="space-y-3 rounded-xl border border-border bg-surface p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              03 · Race morning
            </p>
            <h3 className="font-display text-xl font-semibold text-fg">
              Know your start arrangements
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              Check your allocated wave, local start time, transport, baggage arrangements and
              intermediate checkpoints. Confirm any guide-runner, companion or accessibility
              arrangements in advance. Elite athletes should follow their accepted entry’s
              instructions, including any separate start location.
            </p>
          </li>
          <li className="space-y-3 rounded-xl border border-border bg-surface p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              04 · After finishing
            </p>
            <h3 className="font-display text-xl font-semibold text-fg">
              Check your result and passport
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              Keep your official result link and check your name, bib, chip time and finish status.
              If a stamp is missing after results are processed, use the official claim form with
              the race year, event, bib number and chip time. Eligible races run before passport
              registration can also be claimed.
            </p>
            <p className="text-xs">
              <OfficialLink href={SUPERHALFS_CLAIMS}>
                Claim a missing SuperHalfs result
              </OfficialLink>
            </p>
          </li>
        </ol>
        <p className="max-w-4xl text-sm leading-relaxed text-muted">
          <strong className="text-fg">Running your sixth and final race?</strong> Check that the
          previous five eligible finishes appear in your SuperPassport and that your final entry
          includes its number. Follow the series instructions for the SuperMedal collection area.{" "}
          <OfficialLink href={SUPERHALFS_RULES}>Passport and medal guidance</OfficialLink>
        </p>
      </section>

      <section id="pace" className={sectionStyle} aria-labelledby="pace-heading">
        <div className="flex items-start gap-3">
          <Gauge aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-accent" />
          <div className="space-y-2">
            <h2 id="pace-heading" className={headingStyle}>
              Half-marathon pace guide
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-muted">
              Average even pace over 21.0975 kilometres, rounded to the nearest second. These are
              arithmetic reference points, not elite-entry standards or a promise that a race
              accepts that finishing time.
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Half-marathon target finish times and average pace per kilometre and per mile
            </caption>
            <thead className="border-b border-border bg-elevated text-xs text-muted">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Finish time
                </th>
                <th scope="col" className="px-4 py-3">
                  Minutes / km
                </th>
                <th scope="col" className="px-4 py-3">
                  Minutes / mile
                </th>
              </tr>
            </thead>
            <tbody>
              {SUPERHALFS_PACE_TARGETS.map((target) => (
                <tr key={target.finish} className="border-b border-border last:border-0">
                  <th scope="row" className="px-4 py-2.5 font-semibold tabular-nums text-fg">
                    {target.finish}
                  </th>
                  <td className="px-4 py-2.5 tabular-nums text-muted">{target.perKm}</td>
                  <td className="px-4 py-2.5 tabular-nums text-muted">{target.perMile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="questions" className={sectionStyle} aria-labelledby="questions-heading">
        <h2 id="questions-heading" className={headingStyle}>
          SuperHalfs questions, answered
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SUPERHALFS_QUESTIONS.map((item) => (
            <div
              key={item.question}
              className="space-y-3 rounded-xl border border-border bg-surface p-5"
            >
              <h3 className="font-display text-lg font-semibold leading-snug text-fg">
                {item.question}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{item.answer}</p>
              <a
                href={item.source}
                className="text-xs font-medium text-accent underline underline-offset-3"
              >
                Official information<span className="sr-only"> for: {item.question}</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="profile-heading"
        className="grid gap-5 rounded-2xl border border-border bg-elevated p-5 md:p-8 lg:grid-cols-[1.5fr_1fr] lg:items-center"
      >
        <div className="space-y-3">
          <h2 id="profile-heading" className={headingStyle}>
            Bring your running history together
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Find your athlete profile on AthRecs, explore your recorded performances and keep your
            half-marathon goals in view. The official race archives above are the starting point for
            checking an individual result.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <a
            href="/athletes"
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg no-underline"
          >
            Find your athlete profile
          </a>
          <a
            href="/running/events"
            className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-fg no-underline"
          >
            Explore running races
          </a>
        </div>
      </section>

      <footer id="sources" className="scroll-mt-24 space-y-4 border-t border-border pt-6">
        <h2 className="font-display text-xl font-semibold text-fg">Sources and updates</h2>
        <p className="max-w-4xl text-sm leading-relaxed text-muted">
          This independent AthRecs guide was checked against the SuperHalfs website and the six race
          organisers on <time dateTime={SUPERHALFS_CHECKED_AT}>{SUPERHALFS_CHECKED_LABEL}</time>.
          Organiser links appear beside the race details. Entries and the official SuperMedal are
          managed by the organisers.
        </p>
        <p className="max-w-4xl text-sm leading-relaxed text-muted">
          Pending details are labelled by edition: Valencia’s 2027 date is provisional; Lisbon’s
          start time needs clarification; several 2027 elite requirements and race-week arrangements
          remain unpublished. Recheck the organiser before entering or travelling.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <OfficialLink href={SUPERHALFS_OFFICIAL}>Official SuperHalfs</OfficialLink>
          <OfficialLink href={SUPERHALFS_RULES}>Series rules and passport help</OfficialLink>
          <a href="/running/race-series" className={linkStyle}>
            More running race series
          </a>
        </div>
      </footer>
    </article>
  );
}
