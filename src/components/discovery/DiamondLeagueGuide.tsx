import { useId, useState } from "react";
import { CalendarDays, Tv } from "lucide-react";
import {
  DIAMOND_LEAGUE_2027,
  DIAMOND_LEAGUE_BROADCASTERS,
  DIAMOND_LEAGUE_WATCH_URL,
  diamondLeagueCoverage,
  type DiamondLeagueMeeting,
} from "@/data/diamond-league";
import { formatRaceDateShort } from "@/lib/athrecs/format";

const linkStyle = "font-semibold text-accent underline-offset-4 hover:underline";
const fieldStyle =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg";

export function DiamondLeagueGuide() {
  return (
    <section
      id="diamond-league"
      className="scroll-mt-28 space-y-4 rounded-xl border border-accent/25 bg-surface p-4 sm:p-5"
      aria-labelledby="diamond-league-heading"
    >
      <div>
        <h2
          id="diamond-league-heading"
          className="flex items-center gap-2 font-display text-xl font-semibold"
        >
          <CalendarDays className="size-5 text-accent" aria-hidden="true" />
          Diamond League 2027
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          15 meetings from Doha to the Zurich final. Meeting dates are local; competition and TV
          start times are still to be announced.
        </p>
      </div>
      <details>
        <summary className="cursor-pointer text-sm font-semibold text-accent">
          View all 15 fixtures
        </summary>
        <ol className="mt-3 divide-y divide-border">
          {DIAMOND_LEAGUE_2027.map((meeting) => (
            <li key={meeting.id} className="grid gap-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <p className="text-sm font-semibold">
                <time dateTime={meeting.startDate}>{formatRaceDateShort(meeting.startDate)}</time>
                {meeting.endDate !== meeting.startDate ? (
                  <>
                    {" "}
                    – <time dateTime={meeting.endDate}>{formatRaceDateShort(meeting.endDate)}</time>
                  </>
                ) : null}
              </p>
              <div className="min-w-0 text-sm">
                <a href={`/races/${meeting.publicSlug ?? meeting.slug}`} className={linkStyle}>
                  {meeting.name}
                </a>
                <p className="mt-1 text-xs text-muted">
                  {meeting.city}, {meeting.country}
                </p>
                {meeting.note ? <p className="mt-1 text-xs text-muted">{meeting.note}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </details>
      <DiamondLeagueTv />
    </section>
  );
}

export function DiamondLeagueTv({ meeting }: { meeting?: DiamondLeagueMeeting }) {
  const id = useId();
  const [country, setCountry] = useState("England");
  const [selectedMeeting, setSelectedMeeting] = useState("");
  const meetingId = meeting?.id ?? selectedMeeting;
  const rows = (
    country === "all"
      ? DIAMOND_LEAGUE_BROADCASTERS
      : DIAMOND_LEAGUE_BROADCASTERS.filter((row) => row.country === country)
  ).map((row) => diamondLeagueCoverage(row.country, meetingId)!);
  return (
    <section
      className="space-y-3 rounded-lg border border-border bg-bg p-4"
      aria-labelledby={`${id}-heading`}
    >
      <h3 id={`${id}-heading`} className="flex items-center gap-2 font-semibold">
        <Tv className="size-4 text-accent" aria-hidden="true" />
        {meeting ? `${meeting.name}: TV & streaming in 2027` : "TV & streaming by country"}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold" htmlFor={`${id}-country`}>
          Where are you watching?
          <select
            id={`${id}-country`}
            className={fieldStyle}
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          >
            <option value="all">All listed countries / territories</option>
            {DIAMOND_LEAGUE_BROADCASTERS.map((row) => (
              <option key={row.country}>{row.country}</option>
            ))}
            <option value="other">Another country / territory</option>
          </select>
        </label>
        {!meeting ? (
          <label className="text-xs font-semibold" htmlFor={`${id}-meeting`}>
            Meeting
            <select
              id={`${id}-meeting`}
              className={fieldStyle}
              value={selectedMeeting}
              onChange={(event) => setSelectedMeeting(event.target.value)}
            >
              <option value="">Whole series</option>
              {DIAMOND_LEAGUE_2027.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.city}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div aria-live="polite" className="space-y-2">
        {rows.length ? (
          rows.map((row) => (
            <article key={row.country} className="rounded-lg border border-border bg-surface p-3">
              <p className="text-sm font-semibold">
                {row.country} · {row.broadcaster}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">{row.detail}</p>
              <a
                href={row.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-1 inline-block text-xs ${linkStyle}`}
              >
                Coverage details
                <span className="sr-only"> for {row.country} (opens in a new tab)</span>
              </a>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted">
            We have not confirmed a 2027 broadcaster for your country. Choose your country and
            meeting in the official guide below.
          </p>
        )}
      </div>
      <p className="text-xs leading-5 text-muted">
        Coverage can vary by meeting. Earlier broadcast agreements do not confirm every 2027
        listing. Online streams may be restricted by country; TV coverage may start after the first
        event.
      </p>
      <a
        href={DIAMOND_LEAGUE_WATCH_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-block text-sm ${linkStyle}`}
      >
        Official worldwide viewing guide<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </section>
  );
}
