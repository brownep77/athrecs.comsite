import type { Sql } from "../db";
import { archiveRowSchema, type ArchiveRow } from "./core";
import type { ArchiveActor } from "./service.server";

/**
 * Bulk archive matching (owner instruction, 1 November 2026).
 *
 * Links unmatched archive rows of one dataset to EXISTING athletes only. It never
 * creates or merges profiles, never touches athlete-managed accounts and never
 * overwrites an existing result. Linked results are inserted with the same private
 * visibility and audit trail as a single staff review.
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
  | "not_linkable";
export type BulkDecision =
  | { entryId: number; revision: number; athleteId: number; tier: BulkTier; name: string }
  | { entryId: number; revision: number; skip: BulkSkip; name: string };
export type BulkInput = { datasetId: string; after?: number; limit?: number; apply: boolean };
export type BulkReceipt = {
  scanned: number;
  next: number | null;
  linked: Record<BulkTier, number>;
  wouldLink: Record<BulkTier, number>;
  skipped: Partial<Record<BulkSkip, number>>;
  sample: { name: string; tier: BulkTier; athleteId: number }[];
};

export const BULK_NOTE: Record<BulkTier, string> = {
  bridge:
    "Bulk match: the athlete's existing source history already holds this edition's performance with the same bib and name. Official results row compared.",
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
  return COUNTRY_ALIASES[f] ?? f;
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
]);
export function clubKey(v: string): string {
  const f = folded(v)
    .replace(/\b(the|and)\b/g, " ")
    .replace(/\s+/g, "");
  return NO_CLUB.has(folded(v)) || f.length < 3 ? "" : f;
}
function genderCode(v: string): "M" | "F" | "" {
  const f = v.trim().toLowerCase();
  if (["m", "male", "men", "man"].includes(f)) return "M";
  if (["f", "w", "female", "women", "woman"].includes(f)) return "F";
  return "";
}

type CandidateRow = {
  eid: number;
  revision: number;
  payload: ArchiveRow;
  dup: number;
  aid: number | null;
  gender: string | null;
  club: string | null;
  country: string | null;
  nationality: string | null;
  managed: boolean | null;
  has_result: boolean | null;
  bridge: boolean | null;
};

const NAME_KEY = (col: string) =>
  `regexp_replace(normalize(lower(${col}), NFKD),'[^a-z0-9]','','g')`;

/** Pure decision step, exported for regression tests. */
export function decide(rows: CandidateRow[]): BulkDecision[] {
  const byEntry = new Map<number, CandidateRow[]>();
  for (const r of rows) byEntry.set(r.eid, [...(byEntry.get(r.eid) ?? []), r]);
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
    if (!linkable) {
      decisions.push({ ...base, skip: "not_linkable" });
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
      const sourceCountry = countryName(p.country);
      if (sourceClub && clubKey(c.club ?? "") === sourceClub) tier = "name_club";
      else if (
        sourceCountry &&
        [c.country ?? "", c.nationality ?? ""].some((x) => x && countryName(x) === sourceCountry)
      )
        tier = "name_country";
      if (!tier) {
        decisions.push({ ...base, skip: "no_club_or_country_agreement" });
        continue;
      }
      chosen = c;
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
    yr: number;
    slug: string;
    event: string;
  }>`
    select d.edition_id, d.source_url, d.provider, extract(year from ed.event_date)::int as yr, ev.slug, ev.name as event
    from result_archive_datasets d join editions ed on ed.id=d.edition_id join events ev on ev.id=ed.event_id where d.id=${datasetId}`;
  if (!ds) throw new Error("Archive dataset not found");
  const rows = await sql.query<CandidateRow & { last: number }>(
    `with e as (
       select a.id, a.revision, a.payload, ${NAME_KEY("a.payload->>'name'")} as k
       from result_archive_entries a
       where a.dataset_id=$1 and a.id>$2 and a.canonical_result_id is null and a.review_state='unmatched'
       order by a.id limit $3),
     dup as (
       select ${NAME_KEY("x.payload->>'name'")} as k, count(*)::int as c
       from result_archive_entries x where x.dataset_id=$1 group by 1)
     select e.id as eid, e.revision, e.payload, coalesce(dup.c,1) as dup, at.id as aid, at.gender,
       coalesce(c.name, at.source_club_name, '') as club, coalesce(at.country,'') as country,
       coalesce(at.profile_details->>'nationality','') as nationality,
       exists(select 1 from athlete_account_links l where l.athlete_id=at.id and l.status='active') as managed,
       exists(select 1 from results r where r.athlete_id=at.id and r.edition_id=$4) as has_result,
       (coalesce(e.payload->>'bib','') ~ '^[A-Za-z0-9]+$' and exists(
         select 1 from athlete_source_histories h
         cross join lateral jsonb_array_elements(case when jsonb_typeof(h.performances)='array' then h.performances else '[]'::jsonb end) p
         where h.athlete_id=at.id and p->>'year'=$5::text
           and (p->>'eventSlug'=$6 or lower(coalesce(p->>'meeting','')) like lower($7)||'%')
           and (p->>'bib'=e.payload->>'bib' or coalesce(p->>'notes','') ~ ('bib '||(e.payload->>'bib')||'[.;,)]')))) as bridge,
       (select max(id) from e) as last
     from e left join dup on dup.k=e.k
     left join athletes at on ${NAME_KEY("at.display_name")}=e.k and e.k<>''
     left join clubs c on c.id=at.club_id
     order by e.id, at.id`,
    [datasetId, after, limit, ds.edition_id, ds.yr, ds.slug, ds.event],
  );
  const parsed = rows.map((r) => ({ ...r, payload: archiveRowSchema.parse(r.payload) }));
  return { ds, decisions: decide(parsed), last: rows.length ? Number(rows[0].last) : null };
}

/** Set-based commit of planned links. Every guard is rechecked under locks. */
async function commit(
  sql: Sql,
  datasetId: string,
  ds: { edition_id: number; source_url: string; provider: string },
  links: Extract<BulkDecision, { athleteId: number }>[],
  actor: ArchiveActor,
) {
  if (!links.length) return [] as number[];
  return sql.transaction(async (tx) => {
    await tx.query("SET LOCAL lock_timeout = '10s'");
    await tx`select id from result_archive_datasets where id=${datasetId} for update`;
    const ids = links.map((l) => l.entryId);
    const entries = await tx<{ id: number; revision: number; payload: ArchiveRow }>`
      select id, revision, payload from result_archive_entries
      where id=any(${ids}::bigint[]) and dataset_id=${datasetId} and canonical_result_id is null and review_state='unmatched'
      order by id for update`;
    const athleteIds = [...new Set(links.map((l) => l.athleteId))].sort((a, b) => a - b);
    const okAthletes = new Set(
      (
        await tx<{ id: number }>`
          select a.id from athletes a where a.id=any(${athleteIds}::integer[])
            and not exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active')
            and not exists(select 1 from results r where r.athlete_id=a.id and r.edition_id=${ds.edition_id})
          order by a.id for update of a`
      ).map((a) => Number(a.id)),
    );
    const takenBibs = new Set(
      (
        await tx<{
          bib: string;
        }>`select bib from results where edition_id=${ds.edition_id} and source_url=${ds.source_url} and bib is not null`
      ).map((r) => r.bib),
    );
    const byId = new Map(entries.map((e) => [Number(e.id), e]));
    const checkedAt = new Date().toISOString();
    const payload = links.flatMap((l) => {
      const e = byId.get(l.entryId);
      if (!e || e.revision !== l.revision || !okAthletes.has(l.athleteId)) return [];
      const p = archiveRowSchema.parse(e.payload);
      if (p.bib && takenBibs.has(p.bib)) return [];
      const round = (n: number | null) => (n === null ? null : Math.round(n));
      return [
        {
          entry_id: l.entryId,
          revision: l.revision,
          athlete_id: l.athleteId,
          status: p.status,
          finish: round(p.finishSeconds),
          chip: round(p.chipSeconds),
          gun: round(p.gunSeconds),
          bib: p.bib || null,
          op: p.overallPlace,
          gp: p.genderPlace,
          cp: p.categoryPlace,
          category: p.category || null,
          note: BULK_NOTE[l.tier],
          details: {
            timing: {
              finishSeconds: p.finishSeconds,
              chipSeconds: p.chipSeconds,
              gunSeconds: p.gunSeconds,
            },
            archive: { entryId: l.entryId, revision: l.revision, sourceKey: p.sourceKey },
            sourceRow: { url: ds.source_url, name: p.name, bib: p.bib, provider: ds.provider },
            splits: p.splits.map((s) => ({ label: s.label, time: s.value })),
            verification: {
              status: "source_checked",
              method: `bulk_archive_match:${l.tier}`,
              checkedAt,
              identityNote: BULK_NOTE[l.tier],
            },
          },
        },
      ];
    });
    if (!payload.length) return [] as number[];
    await tx`select set_config('athrecs.archive_actor',${actor.userId},true),set_config('athrecs.archive_note','Bulk archive match',true)`;
    const inserted = await tx<{ id: number; athlete_id: number }>`
      insert into results(edition_id,athlete_id,status,finish_time_seconds,chip_time_seconds,gun_time_seconds,bib,overall_place,gender_place,category_place,category,result_source,source_url,result_visibility,result_details)
      select ${ds.edition_id},r.athlete_id,r.status,r.finish,r.chip,r.gun,r.bib,r.op,r.gp,r.cp,r.category,${ds.provider},${ds.source_url},'private',r.details
      from jsonb_to_recordset(${JSON.stringify(payload)}::jsonb)
        as r(athlete_id integer,status text,finish integer,chip integer,gun integer,bib text,op integer,gp integer,cp integer,category text,details jsonb)
      returning id, athlete_id`;
    if (inserted.length !== payload.length)
      throw new Error("Not every bulk link was inserted; nothing was saved.");
    const resultFor = new Map(inserted.map((r) => [Number(r.athlete_id), Number(r.id)]));
    const applied = payload.map((p) => ({ ...p, result_id: resultFor.get(p.athlete_id)! }));
    await tx`insert into result_source_references(result_id,source_url,source_name)
      select unnest(${applied.map((a) => a.result_id)}::bigint[]),${ds.source_url},${ds.provider} on conflict do nothing`;
    const rows = JSON.stringify(
      applied.map(({ entry_id, revision, result_id, note }) => ({
        entry_id,
        revision,
        result_id,
        note,
      })),
    );
    await tx`update result_archive_entries a set canonical_result_id=r.result_id, applied_revision=r.revision,
        applied_history_id=(select coalesce(max(h.id),0) from result_change_history h where h.result_id=r.result_id),
        review_state='linked', review_note=r.note, reviewed_by=${actor.userId}, reviewed_at=now(), updated_at=now()
      from jsonb_to_recordset(${rows}::jsonb) as r(entry_id bigint,revision integer,result_id bigint,note text)
      where a.id=r.entry_id`;
    await tx`insert into result_archive_decisions(entry_id,revision,action,actor_id,note,before_value,after_value)
      select r.entry_id,r.revision,'link',${actor.userId},r.note,
        jsonb_build_object('resultId',null,'appliedRevision',null,'state','unmatched'),
        jsonb_build_object('resultId',r.result_id,'bulk',true)
      from jsonb_to_recordset(${rows}::jsonb) as r(entry_id bigint,revision integer,result_id bigint,note text)`;
    return applied.map((a) => a.entry_id);
  });
}

const emptyTiers = (): Record<BulkTier, number> => ({ bridge: 0, name_club: 0, name_country: 0 });

/** One bounded chunk. The caller pages with `next` until it is null. */
export async function bulkMatchArchiveDataset(
  sql: Sql,
  input: BulkInput,
  actor: ArchiveActor,
): Promise<BulkReceipt> {
  if (!actor.userId || !actor.staffEmail) throw new Error("Authenticated staff required");
  const limit = Math.min(Math.max(input.limit ?? 500, 1), 1000);
  const { ds, decisions, last } = await plan(sql, input.datasetId, input.after ?? 0, limit);
  const links = decisions.filter(
    (d): d is Extract<BulkDecision, { athleteId: number }> => "athleteId" in d,
  );
  const receipt: BulkReceipt = {
    scanned: decisions.length,
    next: decisions.length < limit ? null : last,
    linked: emptyTiers(),
    wouldLink: emptyTiers(),
    skipped: {},
    sample: [],
  };
  for (const d of decisions) {
    if ("athleteId" in d) receipt.wouldLink[d.tier]++;
    else receipt.skipped[d.skip] = (receipt.skipped[d.skip] ?? 0) + 1;
  }
  receipt.sample = links
    .slice(0, 15)
    .map((l) => ({ name: l.name, tier: l.tier, athleteId: l.athleteId }));
  if (input.apply) {
    const done = new Set(await commit(sql, input.datasetId, ds, links, actor));
    for (const l of links) if (done.has(l.entryId)) receipt.linked[l.tier]++;
  }
  return receipt;
}
