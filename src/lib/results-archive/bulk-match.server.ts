import { createHmac, randomBytes } from "node:crypto";
import type { Sql } from "../db";
import { archiveRowSchema, type ArchiveRow } from "./core";
import type { ArchiveActor } from "./service.server";

/**
 * Bulk archive matching (owner instruction, 1 November 2026).
 *
 * Links unmatched archive rows of one dataset to EXISTING athletes only. It never
 * creates or merges profiles, never touches athlete-managed accounts and never
 * overwrites an existing result. Reviewed associations stay inside the private archive.
 *
 * Tiers:
 * - "bridge": exactly one profile already holds this edition's performance in a
 *   source history with the same bib (and the same normalised name).
 * - "name_club" / "name_country": owner override. The normalised name occurs once
 *   in the whole directory and once in the race, and the club (or nationality)
 *   agrees.
 * Anything else stays unmatched for manual review.
 */
export type BulkTier = "bridge" | "name_club" | "name_country";
export type BulkSkip =
  | "no_candidate"
  | "several_candidates"
  | "several_bridges"
  | "name_repeated_in_race"
  | "no_club_or_country_agreement"
  | "managed_account"
  | "existing_result"
  | "gender_conflict"
  | "athlete_matched_twice"
  | "not_linkable"
  | "identity_conflict"
  | "bib_conflict";
export type BulkDecision =
  | { entryId: number; revision: number; athleteId: number; tier: BulkTier; name: string }
  | { entryId: number; revision: number; skip: BulkSkip; name: string };
type Match = Extract<BulkDecision, { athleteId: number }> & {
  bib: string;
  finishSeconds: number;
  athleteName: string;
  evidence: string;
};
export type BulkInput = {
  datasetId: string;
  after?: number;
  limit?: number;
  apply: boolean;
  previewToken?: string;
};
export type BulkReceipt = {
  scanned: number;
  next: number | null;
  linked: number;
  skipped: Partial<Record<BulkSkip, number>>;
  matches: Match[];
  previewToken: string;
};
export const BULK_NOTE: Record<BulkTier, string> = {
  bridge:
    "Bulk match: the athlete's existing source history already holds this edition's performance with the same bib and name.",
  name_club:
    "Bulk match (owner override, 1 Nov 2026): the only directory athlete with this exact name, unique in this race, with the same club.",
  name_country:
    "Bulk match (owner override, 1 Nov 2026): the only directory athlete with this exact name, unique in this race, with the same nationality.",
};

const IOC: Record<string, string> = {
  GBR: "united kingdom",
  IRL: "ireland",
  USA: "united states",
  CAN: "canada",
  AUS: "australia",
  NZL: "new zealand",
  RSA: "south africa",
  FRA: "france",
  GER: "germany",
  ESP: "spain",
  ITA: "italy",
  NED: "netherlands",
  BEL: "belgium",
  SUI: "switzerland",
  AUT: "austria",
  POR: "portugal",
  DEN: "denmark",
  SWE: "sweden",
  NOR: "norway",
  FIN: "finland",
  ISL: "iceland",
  POL: "poland",
  CZE: "czech republic",
  SVK: "slovakia",
  HUN: "hungary",
  ROU: "romania",
  BUL: "bulgaria",
  GRE: "greece",
  CRO: "croatia",
  SLO: "slovenia",
  SRB: "serbia",
  UKR: "ukraine",
  LTU: "lithuania",
  LAT: "latvia",
  EST: "estonia",
  LUX: "luxembourg",
  MLT: "malta",
  CYP: "cyprus",
  TUR: "turkey",
  ISR: "israel",
  JPN: "japan",
  CHN: "china",
  HKG: "hong kong",
  KOR: "south korea",
  SGP: "singapore",
  MAS: "malaysia",
  THA: "thailand",
  IND: "india",
  PHI: "philippines",
  INA: "indonesia",
  KEN: "kenya",
  ETH: "ethiopia",
  UGA: "uganda",
  TAN: "tanzania",
  ERI: "eritrea",
  NGR: "nigeria",
  MAR: "morocco",
  BRA: "brazil",
  MEX: "mexico",
  ARG: "argentina",
  CHI: "chile",
  COL: "colombia",
  PER: "peru",
  UAE: "united arab emirates",
  QAT: "qatar",
  KSA: "saudi arabia",
  BER: "bermuda",
  JAM: "jamaica",
  TTO: "trinidad and tobago",
};
const COUNTRY_ALIASES: Record<string, string> = {
  uk: "united kingdom",
  "great britain": "united kingdom",
  england: "united kingdom",
  scotland: "united kingdom",
  wales: "united kingdom",
  "northern ireland": "united kingdom",
  usa: "united states",
  "united states of america": "united states",
  "korea, republic of": "south korea",
  czechia: "czech republic",
  türkiye: "turkey",
};
const folded = (v: string) =>
  v
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export function countryName(v: string): string {
  const raw = v.trim();
  if (/^[A-Z]{3}$/.test(raw)) return IOC[raw] ?? "";
  const f = folded(raw);
  const name = COUNTRY_ALIASES[f] ?? f;
  return Object.values(IOC).includes(name) ? name : "";
}
const NO_CLUB = new Set([
  "",
  "unattached",
  "none",
  "na",
  "n a",
  "no club",
  "independent",
  "private",
  "unknown",
  "not specified",
  "not provided",
  "unaffiliated",
]);
export function clubKey(v: string): string {
  const key = v.normalize("NFC").toLowerCase().trim().replace(/\s+/g, " ");
  return NO_CLUB.has(folded(v)) || !/\p{L}{2}/u.test(key) || key.length < 3 ? "" : key;
}
function genderCode(v: string): string {
  const f = v.trim().toLowerCase();
  if (["m", "male", "men", "man"].includes(f)) return "M";
  if (["f", "w", "female", "women", "woman"].includes(f)) return "F";
  if (["x", "nonbinary", "non-binary", "non binary", "nb"].includes(f)) return "X";
  return ["", "unknown", "u", "unspecified"].includes(f) ? "" : f;
}

type CandidateRow = {
  eid: number;
  revision: number;
  payload: ArchiveRow;
  dup: number;
  aid: number | null;
  gender: string | null;
  club: string | null;
  athlete_name: string;
  source_nationality: string;
  identity_conflict: boolean;
  bib_conflict: boolean;
  invalid: boolean;
  nationality: string | null;
  managed: boolean | null;
  has_result: boolean | null;
  bridge: boolean | null;
};

const NAME_KEY = (col: string) =>
  `regexp_replace(athlete_directory_search_fold(${col}), '[[:space:][:punct:]]+', '', 'g')`;

/** Pure decision step, exported for regression tests. */
export function decide(rows: CandidateRow[]): BulkDecision[] {
  const byEntry = new Map<number, CandidateRow[]>();
  for (const r of rows) {
    const group = byEntry.get(r.eid);
    if (group) group.push(r);
    else byEntry.set(r.eid, [r]);
  }
  const decisions: BulkDecision[] = [];
  for (const [entryId, group] of byEntry) {
    const first = group[0];
    const p = first.payload;
    const base = { entryId, revision: first.revision, name: p.name };
    const cands = group.filter((g) => g.aid !== null);
    const linkable =
      p.status === "finished" &&
      Boolean(p.finishSeconds && p.finishSeconds > 0) &&
      !p.team &&
      !p.leg;
    if (!linkable || first.invalid) {
      decisions.push({ ...base, skip: "not_linkable" });
      continue;
    }
    if (first.bib_conflict) {
      decisions.push({ ...base, skip: "bib_conflict" });
      continue;
    }
    if (!cands.length) {
      decisions.push({ ...base, skip: "no_candidate" });
      continue;
    }
    if (first.dup > 1) {
      decisions.push({ ...base, skip: "name_repeated_in_race" });
      continue;
    }
    const bridges = cands.filter((c) => c.bridge);
    let chosen: CandidateRow | undefined;
    let tier: BulkTier | undefined;
    if (bridges.length > 1) {
      decisions.push({ ...base, skip: "several_bridges" });
      continue;
    }
    if (bridges.length === 1) {
      chosen = bridges[0];
      tier = "bridge";
    } else if (cands.length > 1) {
      decisions.push({ ...base, skip: "several_candidates" });
      continue;
    } else {
      const c = cands[0];
      const sourceClub = clubKey(p.club);
      const sourceCountry = countryName(c.source_nationality);
      if (sourceClub && clubKey(c.club ?? "") === sourceClub) tier = "name_club";
      else if (sourceCountry && countryName(c.nationality ?? "") === sourceCountry)
        tier = "name_country";
      if (!tier) {
        decisions.push({ ...base, skip: "no_club_or_country_agreement" });
        continue;
      }
      chosen = c;
    }
    const sourceNationality = countryName(chosen!.source_nationality);
    const athleteNationality = countryName(chosen!.nationality ?? "");
    if (
      chosen!.identity_conflict ||
      (sourceNationality && athleteNationality && sourceNationality !== athleteNationality)
    ) {
      decisions.push({ ...base, skip: "identity_conflict" });
      continue;
    }
    if (chosen!.managed) {
      decisions.push({ ...base, skip: "managed_account" });
      continue;
    }
    if (chosen!.has_result) {
      decisions.push({ ...base, skip: "existing_result" });
      continue;
    }
    const sg = genderCode(p.gender),
      ag = genderCode(chosen!.gender ?? "");
    if (sg && ag && sg !== ag) {
      decisions.push({ ...base, skip: "gender_conflict" });
      continue;
    }
    decisions.push({ ...base, athleteId: chosen!.aid!, tier: tier! });
  }
  // One athlete can hold only one result per edition: drop every competing claim.
  const counts = new Map<number, number>();
  for (const d of decisions)
    if ("athleteId" in d) counts.set(d.athleteId, (counts.get(d.athleteId) ?? 0) + 1);
  return decisions.map((d) =>
    "athleteId" in d && counts.get(d.athleteId)! > 1
      ? {
          entryId: d.entryId,
          revision: d.revision,
          name: d.name,
          skip: "athlete_matched_twice" as const,
        }
      : d,
  );
}

async function plan(sql: Sql, datasetId: string, after: number, limit: number) {
  const [ds] = await sql<{
    edition_id: number;
    source_url: string;
    provider: string;
    day: string;
    slug: string;
    event: string;
    distance: string;
    past: boolean;
  }>`
    select d.edition_id,d.source_url,d.provider,ed.event_date::text as day,ed.event_date<=current_date as past,
      ev.slug,ev.name as event,ed.distance_code as distance from result_archive_datasets d
      join editions ed on ed.id=d.edition_id join events ev on ev.id=ed.event_id where d.id=${datasetId}`;
  if (!ds) throw new Error("Archive dataset not found");
  const rows = await sql.query<CandidateRow>(
    `
    with e as materialized (
      select a.id,a.revision,a.payload,${NAME_KEY("a.payload->>'name'")} as k from result_archive_entries a
      where a.dataset_id=$1 and a.id>$2 and a.canonical_result_id is null and a.review_state='unmatched'
      order by a.id limit $3
    ), edition_rows as materialized (
      select x.id,${NAME_KEY("x.payload->>'name'")} as k, nullif(upper(trim(x.payload->>'bib')),'') as bib
      from result_archive_entries x join result_archive_datasets d on d.id=x.dataset_id where d.edition_id=$4
    ), directory as (
      select at.id, ${NAME_KEY("at.display_name")} as k, false as alias from athletes at
      union all
      select at.id, ${NAME_KEY("n.name")} as k, true as alias from athletes at
      cross join lateral jsonb_array_elements_text(case when jsonb_typeof(at.profile_details->'aliases')='array'
        then at.profile_details->'aliases' else '[]'::jsonb end) n(name)
    ), candidates as (
      select e.id,d.id as aid,bool_and(d.alias) as alias_only from e join directory d on d.k=e.k and e.k<>''
      group by e.id,d.id
    ), names as (select k, count(*)::int as n from edition_rows group by k),
    bibs as (select bib,count(*)::int as n from edition_rows where bib is not null group by bib)
    select e.id as eid,e.revision,e.payload,names.n as dup,at.id as aid,at.display_name as athlete_name,at.gender,
      coalesce(c.name,at.source_club_name,'') as club,coalesce(at.profile_details->>'nationality','') as nationality,
      coalesce(e.payload->'original'->>'Nationality',e.payload->'original'->>'nationality','') as source_nationality,
      (coalesce(bibs.n,0)>1 or exists(select 1 from results r where r.edition_id=$4 and upper(trim(r.bib))=nullif(upper(trim(e.payload->>'bib')),''))
        or exists(select 1 from result_archive_private_matches m where m.edition_id=$4 and m.bib=nullif(upper(trim(e.payload->>'bib')),''))) as bib_conflict,
      exists(select 1 from athlete_account_links l where l.athlete_id=at.id and l.status='active') as managed,
      (exists(select 1 from results r where r.athlete_id=at.id and r.edition_id=$4) or
       exists(select 1 from result_archive_private_matches m where m.athlete_id=at.id and m.edition_id=$4)) as has_result,
      (cand.alias_only or trim(athlete_directory_search_fold(at.display_name))<>trim(athlete_directory_search_fold(e.payload->>'name'))
       or at.parent_athlete_id is not null or at.profile_details->>'syntheticTest'='true' or
       exists(select 1 from result_archive_match_requests q where q.entry_id=e.id) or
       (coalesce(e.payload->>'sourceAthleteId','')<>'' and not (
        select count(distinct m.athlete_id)=1 and coalesce(bool_and(m.athlete_id=at.id),false)
        from (select provider,external_id,athlete_id from athlete_source_identities union all
              select provider,external_id,athlete_id from result_archive_athlete_identifiers) m
        where m.provider=e.payload->>'sourceAthleteProvider' and m.external_id=e.payload->>'sourceAthleteId'))
        or coalesce(h.conflict,false)) as identity_conflict,coalesce(h.bridge,false) as bridge
    from e left join names on names.k=e.k left join bibs on bibs.bib=upper(trim(e.payload->>'bib'))
    left join candidates cand on cand.id=e.id left join athletes at on at.id=cand.aid left join clubs c on c.id=at.club_id
    left join lateral (
      select bool_or(v.ok) as bridge,bool_or(not v.ok) as conflict
      from athlete_source_histories h cross join lateral jsonb_array_elements(
        case when jsonb_typeof(h.performances)='array' then h.performances else '[]'::jsonb end) p
      cross join lateral (select coalesce(
        p->>'bib'=e.payload->>'bib' and nullif(trim(p->>'bib'),'') is not null
        and p->>'profileExcluded' is distinct from 'true' and p->>'syntheticTest' is distinct from 'true'
        and p->'disqualification' is null and p->>'performance' ~ '^[0-9]{1,3}:[0-5][0-9]:[0-5][0-9]([.][0-9]+)?$'
        and case when p->>'performance' ~ '^[0-9]{1,3}:[0-5][0-9]:[0-5][0-9]([.][0-9]+)?$'
          and jsonb_typeof(e.payload->'finishSeconds')='number'
          then extract(epoch from (p->>'performance')::interval)=(e.payload->>'finishSeconds')::numeric else false end,
        false) as ok) v
      where h.athlete_id=at.id and p->>'date'=$5 and lower(p->>'discipline')=lower($8)
        and (p->>'eventSlug'=$6 or (nullif(p->>'eventSlug','') is null and lower(p->>'meeting')=lower($7)))
    ) h on true order by e.id,at.id`,
    [datasetId, after, limit, ds.edition_id, ds.day, ds.slug, ds.event, ds.distance],
  );
  // Historical/off-schema or flagged rows stay in the queue without poisoning the batch.
  for (const r of rows) {
    const parsed = archiveRowSchema.safeParse(r.payload);
    r.invalid = !ds.past || !parsed.success;
    if (!parsed.success) {
      r.payload = { name: String(r.payload?.name ?? ""), status: "unknown" } as ArchiveRow;
    } else {
      r.payload = parsed.data;
    }
  }
  const decisions = decide(rows);
  const evidenceByEntry = new Map(
    rows.filter((r) => r.aid !== null).map((r) => [`${r.eid}/${r.aid}`, r]),
  );
  const matches: Match[] = [];
  const skipped: BulkReceipt["skipped"] = {};
  for (const d of decisions) {
    if ("skip" in d) {
      skipped[d.skip] = (skipped[d.skip] ?? 0) + 1;
      continue;
    }
    const r = evidenceByEntry.get(`${d.entryId}/${d.athleteId}`)!;
    const evidence =
      d.tier === "bridge"
        ? `${ds.day} · ${ds.distance} · bib ${r.payload.bib} · same finish time`
        : d.tier === "name_club"
          ? `${r.payload.club} / ${r.club}`
          : `${r.source_nationality} / ${r.nationality}`;
    matches.push({
      ...d,
      bib: r.payload.bib,
      finishSeconds: r.payload.finishSeconds!,
      athleteName: r.athlete_name,
      evidence,
    });
  }
  return { ds, decisions, matches, skipped };
}

// Production workers share the auth secret. A local restart invalidates outstanding previews.
const tokenSecret = process.env.BETTER_AUTH_SECRET || randomBytes(32);
export async function bulkMatchArchiveDataset(
  sql: Sql,
  input: BulkInput,
  actor: ArchiveActor,
): Promise<BulkReceipt> {
  if (!actor.userId || !actor.staffEmail) throw new Error("Authenticated staff required");
  const limit = input.limit ?? 25,
    after = input.after ?? 0;
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 500 ||
    !Number.isSafeInteger(after) ||
    after < 0
  )
    throw new Error("Choose 1–500 rows and a valid cursor.");
  if (input.apply && !input.previewToken) throw new Error("Preview this batch before approval.");
  return sql.transaction(async (tx) => {
    await tx.query(
      input.apply ? "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE" : "SET TRANSACTION READ ONLY",
    );
    await tx.query("SET LOCAL statement_timeout = '25s'");
    await tx.query("SET LOCAL lock_timeout = '3s'");
    if (input.apply) {
      await tx`select d.id from result_archive_datasets d join editions ed on ed.id=d.edition_id
        where d.id=${input.datasetId} for update of ed,d`;
    }
    const { ds, decisions, matches, skipped } = await plan(tx, input.datasetId, after, limit);
    const previewToken = createHmac("sha256", tokenSecret)
      .update(
        JSON.stringify([
          "archive-private-match-v1",
          actor.userId,
          input.datasetId,
          after,
          limit,
          ds,
          decisions,
          matches,
        ]),
      )
      .digest("hex");
    if (input.apply && input.previewToken !== previewToken)
      throw new Error("This batch changed. Preview it again before approval.");
    if (input.apply && matches.length) {
      const rows = JSON.stringify(
        matches.map((m) => ({
          entry_id: m.entryId,
          revision: m.revision,
          athlete_id: m.athleteId,
          tier: m.tier,
          bib: m.bib,
          note: BULK_NOTE[m.tier],
          evidence: m.evidence,
        })),
      );
      const applied = await tx<{ id: number }>`
        with proposed as (select * from jsonb_to_recordset(${rows}::jsonb)
          as m(entry_id bigint,revision int,athlete_id int,tier text,bib text,note text,evidence text)),
        claimed as (update result_archive_entries a set review_state='held',review_note=m.note,
          reviewed_by=${actor.userId},reviewed_at=now(),updated_at=now() from proposed m
          where a.id=m.entry_id and a.revision=m.revision and a.canonical_result_id is null and a.review_state='unmatched'
          returning a.id), saved as (insert into result_archive_private_matches(entry_id,revision,edition_id,athlete_id,tier,bib,reviewed_by)
          select m.entry_id,m.revision,${ds.edition_id},m.athlete_id,m.tier,nullif(upper(trim(m.bib)),''),${actor.userId}
          from proposed m join claimed on claimed.id=m.entry_id returning entry_id)
        insert into result_archive_decisions(entry_id,revision,action,actor_id,note,before_value,after_value)
          select m.entry_id,m.revision,'link',${actor.userId},m.note,'{"state":"unmatched"}'::jsonb,
            jsonb_build_object('state','held','privateAthleteId',m.athlete_id,'method','bulk_archive_match:'||m.tier,'evidence',m.evidence)
          from proposed m join saved using(entry_id) returning entry_id as id`;
      if (applied.length !== matches.length) throw new Error("Batch changed. Preview again.");
    }
    return {
      scanned: decisions.length,
      next: decisions.length === limit ? decisions[decisions.length - 1].entryId : null,
      matches,
      skipped,
      linked: input.apply ? matches.length : 0,
      previewToken,
    };
  });
}
