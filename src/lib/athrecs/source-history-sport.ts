import type { Sport } from "./types";

type SportRule = {
  field: "discipline" | "provider" | "meeting";
  pattern: string;
  sport: Sport;
  providerPattern?: string;
};
const word = (value: string) => `(^|[^a-z0-9_])(${value})([^a-z0-9_]|$)`;

/** Ordered evidence rules shared by profile display and generated PostgreSQL.
 * No names, clubs, nationality, race times or biographies imply a sport.
 * Unknown category/wave labels must not silently create an Athletics membership.
 */
export const sourceHistorySportRules: readonly SportRule[] = [
  { field: "discipline", pattern: word("triathlon"), sport: "Triathlon" },
  { field: "discipline", pattern: word("duathlon"), sport: "Duathlon" },
  { field: "discipline", pattern: word("aquathlon"), sport: "Aquathlon" },
  { field: "discipline", pattern: word("aquabike"), sport: "Aquabike" },
  { field: "discipline", pattern: word("parkrun(cx)?"), sport: "Parkrun" },
  { field: "provider", pattern: "^parkrun( official results)?$", sport: "Parkrun" },
  {
    field: "discipline",
    pattern: word("cycling|road cycling|mountain biking|bmx"),
    sport: "Cycling",
  },
  { field: "discipline", pattern: word("swimming|swim|open water"), sport: "Swimming" },
  { field: "discipline", pattern: word("rowing"), sport: "Rowing" },
  { field: "discipline", pattern: word("obstacle course|ocr"), sport: "OCR" },
  { field: "discipline", pattern: word("race walk|race walking|walking"), sport: "Walking" },
  // Metres and field implements take precedence over broad kilometre patterns.
  {
    field: "discipline",
    pattern: word(
      "track|hurdles?|steeplechase|s/chase|long jump|high jump|triple jump|pole vault|shot( putt?)?|discus( throw)?|javelin|hammer|decathlon|heptathlon|pentathlon|hexathlon|octathlon|combined events",
    ),
    sport: "Athletics",
  },
  { field: "discipline", pattern: "^(mile|2 miles)$", sport: "Athletics" },
  // Provider codes distinguish track combined events from swim/bike/run triathlon.
  {
    field: "discipline",
    pattern: "^(tri|pen)u[0-9]+[mw](ns)?$",
    providerPattern: "^powerof10$",
    sport: "Athletics",
  },
  {
    field: "discipline",
    pattern: "^one hour$",
    providerPattern: "^world ?athletics$",
    sport: "Athletics",
  },
  {
    field: "discipline",
    pattern: String.raw`^([0-9]+(,[0-9]{3})*\s+met(re|er)s|[0-9]+\s*(x|×)\s*[0-9]+m)([^a-z0-9_]|$)`,
    sport: "Athletics",
  },
  {
    field: "discipline",
    pattern: String.raw`^(50|60|70|75|80|100|110|150|200|300|400|500|600|800|1000|1200|1500|2000|3000|5000|10000)(m|sc|h)?$`,
    sport: "Athletics",
  },
  {
    field: "discipline",
    pattern: String.raw`^[0-9]+m\s+(h|indoors|s/c)([^a-z0-9_]|$)|^[0-9]+m?s/c$|^[0-9]+sc(nwj|ns)$`,
    sport: "Athletics",
  },
  {
    field: "discipline",
    pattern: word(String.raw`[0-9]+\s*(x|×)\s*[0-9]+\s*(m|metres|meters)`),
    sport: "Athletics",
  },
  {
    field: "discipline",
    pattern: String.raw`^(sp|dt|jt|ht)[0-9]+([.][0-9]+)?(k|kg|g)?$|^(lj|hj|tj|pv)$`,
    sport: "Athletics",
  },
  {
    field: "provider",
    pattern: "^(DUV Ultra Marathon Statistics|utmb|UTMB Index|Abbott World Marathon Majors)$",
    sport: "Running",
  },
  // Power of 10 uses M for miles here; the explicit metre/track rules above win.
  {
    field: "discipline",
    pattern: String.raw`^[0-9]+([.][0-9]+)?m( relay leg|lt|t)?$`,
    providerPattern: "^powerof10$",
    sport: "Running",
  },
  {
    field: "discipline",
    pattern: String.raw`^[0-9]+([.][0-9]+)?k(xl|dh)$`,
    providerPattern: "^powerof10$",
    sport: "Running",
  },
  { field: "discipline", pattern: "^virtual run$", sport: "Running" },
  {
    field: "discipline",
    pattern: word(
      "running|fun run|canicross|cross[ -]country|xc|road|trail|fell|ultra(marathon)?|multi[ -]terrain|mountain",
    ),
    sport: "Running",
  },
  {
    field: "discipline",
    pattern: String.raw`^(z(xc|fl|mr|mt)l?|hm(mr)?|mar(mr|mt|dh)?|short(mar|hm|[0-9]+([.][0-9]+)?[km])|mt)$`,
    sport: "Running",
  },
  {
    field: "discipline",
    pattern: String.raw`^[0-9]+([.][0-9]+)?(k|m)(xc|xcl|fl|mr|mrl|mt|mtl|nad|approx|l)$`,
    sport: "Running",
  },
  {
    field: "discipline",
    pattern: word(
      String.raw`marathon|half( marathon)?|[0-9]+([.][0-9]+)?\s*(k(m)?|kilometres|kilometers|mi|mile|miles|miler)`,
    ),
    sport: "Running",
  },
  // Event titles can identify a sport when the discipline contains only an age group or wave.
  // Explicit discipline/provider evidence always wins over the meeting title.
  ...(
    [
      "Triathlon",
      "Duathlon",
      "Aquathlon",
      "Aquabike",
      "Parkrun",
      "Cycling",
      "Swimming",
      "Rowing",
    ] as const
  ).map((sport): SportRule => ({ field: "meeting", pattern: word(sport), sport })),
  {
    field: "meeting",
    pattern: word(
      String.raw`cross[ -]country|xc|trail running|fun run|running|road relays?|road race|marathon|half marathon|[0-9]+([.][0-9]+)?\s*k(m)?`,
    ),
    sport: "Running",
  },
  // Reviewed race-title aliases for sources that supply only category labels.
  // https://www.waveneyvalley.org/lowestoft-scores-race/
  // https://www2.norfolkgazelles.co.uk/alex-moore-relay.php
  // https://totalracetiming.co.uk/raceresults/109 and /108 (Dunerunner trail events).
  {
    field: "meeting",
    pattern: String.raw`^(Lowestoft Scores( Race)?|Norfolk Gazelles ['‘]Big Stampede['’]|Rag-it-Round Repps|The Nelson Knee-Knobbler( \(race [0-9]+\))?)$`,
    sport: "Running",
  },
];

const compiledRules = sourceHistorySportRules.map((rule) => ({
  ...rule,
  regex: new RegExp(rule.pattern, "i"),
  providerRegex: rule.providerPattern ? new RegExp(rule.providerPattern, "i") : null,
}));

export function sourceHistorySport(discipline: string, provider = "", meeting = ""): Sport | null {
  const fields = {
    discipline: discipline.trim(),
    provider: provider.trim(),
    meeting: meeting.trim(),
  };
  return (
    compiledRules.find(
      (rule) =>
        rule.regex.test(fields[rule.field]) &&
        (!rule.providerRegex || rule.providerRegex.test(fields.provider)),
    )?.sport ?? null
  );
}

export const sourceHistorySportNames = [
  ...new Set(sourceHistorySportRules.map((rule) => rule.sport)),
].sort();

/** Static trusted expressions only; values from requests must remain SQL parameters. */
export function sourceHistorySportSql(
  discipline = "discipline",
  provider = "provider",
  meeting = "meeting",
): string {
  const fields = {
    discipline: `trim(coalesce(${discipline},''))`,
    provider: `trim(coalesce(${provider},''))`,
    meeting: `trim(coalesce(${meeting},''))`,
  };
  return `case\n${sourceHistorySportRules
    .map(
      (rule) =>
        `    when ${fields[rule.field]} ~* '${rule.pattern.replaceAll("'", "''")}'${rule.providerPattern ? ` and ${fields.provider} ~* '${rule.providerPattern.replaceAll("'", "''")}'` : ""} then '${rule.sport}'`,
    )
    .join("\n")}\n    else null end`;
}

/** Versioned lookup keeps old deployments and their expression indexes consistent. */
export function sourceHistorySportMigration(): string {
  return `-- Generated from source-history-sport.ts; checked by verify-source-history-sport.mjs.
-- Derived classification only: original performances, identity and visibility stay intact.
create or replace function athlete_source_sport_v3(provider text, discipline text, meeting text default '')
returns text language sql immutable parallel safe as $function$
  select ${sourceHistorySportSql()}
$function$;

create or replace function athlete_history_sports_v3(provider text, performances jsonb)
returns text[] language sql immutable parallel safe as $function$
  select coalesce(array_agg(distinct sport order by sport) filter (where sport is not null),array[]::text[])
  from (
    select public.athlete_source_sport_v3(provider,p->>'discipline',p->>'meeting') as sport
    from jsonb_array_elements(case when jsonb_typeof(performances)='array' then performances else '[]'::jsonb end) p
    where coalesce(p->>'profileExcluded','false')<>'true'
  ) classified
$function$;

-- Full index supports staff review of unpublished histories as well as public discovery.
create index if not exists source_history_sports_v3_lookup
  on athlete_source_histories using gin (athlete_history_sports_v3(provider,performances));
`;
}
