import type { Sql } from "../db";
import { withDiscoveryRead } from "../athrecs/discovery-read.server";
import { countryNameAliases } from "../athrecs/country-flags";
import {
  profileEvidenceSportNames,
  profileSportEvidencePredicateSql,
} from "../athrecs/profile-sport-evidence";
import { sourceNationalitySql, statedNationalitySql } from "./nationality.server";

const nationalityAliases = JSON.stringify(countryNameAliases());
const sportAliases = JSON.stringify(
  Object.fromEntries(profileEvidenceSportNames.map((sport) => [sport.toLowerCase(), sport])),
);

// Use stored geography only: nationality, club location and race location are
// not evidence of an athlete's residence. Preserve UK home-nation distinctions.
const known = (column: string) =>
  `case when lower(trim(coalesce(${column},''))) in ('','unknown','u','n/a','not known','unspecified') then 'Unknown' else trim(${column}) end`;

type ProfileSnapshot = { generated_at: string; payload: { groups: unknown[]; excluded: number } };
const snapshotKey = "profiles-v1";

/** Only aggregate counts are saved. All reads remain behind staffMiddleware.
 * A transaction replaces the whole snapshot atomically; failures retain the old one.
 * The worker refreshes every five minutes. Page loads never wait for a warm refresh.
 */
export async function readProfileSnapshot(sql: Sql, refresh = false): Promise<ProfileSnapshot> {
  const read = (db: Sql) =>
    db.query<ProfileSnapshot>(
      "select generated_at::text, payload from collection_stats_snapshots where key=$1",
      [snapshotKey],
    );
  const [saved] = await read(sql);
  if (saved && !refresh) return saved;
  return withDiscoveryRead(sql, async (tx) => {
    await tx.query("set local statement_timeout='55s'");
    await tx.query("set local lock_timeout='5s'");
    // Serialize rebuilds across all function instances, without blocking cached readers.
    await tx.query("select pg_advisory_xact_lock(hashtext('collection-stats-profiles-v1'))");
    const [latest] = await read(tx);
    if (latest && (!refresh || latest.generated_at !== saved?.generated_at)) return latest;
    const [snapshot] = await tx.query<ProfileSnapshot>(
      `
      with
    profile_identity as materialized (
      select a.id, case
        when lower(trim(gender)) in ('m','male','man') then 'Male'
        when lower(trim(gender)) in ('f','female','woman') then 'Female'
        when lower(trim(gender)) in ('nb','non-binary','nonbinary','non binary') then 'Non-binary'
        when lower(trim(coalesce(gender,''))) in ('','u','unknown','n/a','unspecified') then 'Unknown'
        else trim(gender) end as gender,
        ${known("a.country")} as country, ${known("a.county")} as county,
        coalesce(nullif(${known("private.nationality")},'Unknown'), ${statedNationalitySql},
          ${sourceNationalitySql("a.profile_details")}, nullif(${known("a.nation")},'Unknown'), 'Unknown') as raw_nationality,
        (a.profile_visibility='public' or a.profile_type='Public figure') as is_public,
        a.created_at >= now()-interval '7 days' as added_7d
      from athletes a
      left join athlete_account_links owner on owner.athlete_id=a.id and owner.status='active'
      left join athlete_private_profiles private on private.user_id=owner.user_id
      where not exists(select 1 from athrecs_test_athletes t where t.athlete_id=a.id)
        and coalesce(a.profile_details->>'syntheticTest','false') <> 'true'
    ),
    profile_sport_evidence as (
      select r.athlete_id, e.sport from results r
        join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id
      union
      ${profileEvidenceSportNames.map((sport) => `select h.athlete_id, '${sport}'::text sport from athlete_source_histories h where athlete_history_sports_v3(h.provider,h.performances) @> array['${sport}']::text[]`).join(" union all ")}
      union
      ${profileEvidenceSportNames.map((sport) => `select a.id, '${sport}'::text sport from athletes a where ${profileSportEvidencePredicateSql()} and athlete_profile_sports_v1(a.profile_details) @> array['${sport}']::text[]`).join(" union all ")}
      union
      select owner.athlete_id, sp.sport_code from athlete_account_links owner
        join athlete_sport_profiles sp on sp.user_id=owner.user_id where owner.status='active'
    ),
    profile_sports as (
      select athlete_id, array_agg(distinct coalesce($2::jsonb->>lower(trim(sport)),trim(sport)) order by coalesce($2::jsonb->>lower(trim(sport)),trim(sport))) as sports
      from profile_sport_evidence where ${known("sport")}<>'Unknown'
      group by athlete_id
    ),
    profile_base as materialized (
      select p.*, coalesce($1::jsonb->>lower(regexp_replace(trim(raw_nationality),'[[:space:]]+',' ','g')),raw_nationality) as nationality,
        coalesce(s.sports,array['Unknown']::text[]) as sports
      from profile_identity p left join profile_sports s on s.athlete_id=p.id
    ),
      groups as (
        select gender,country,county,nationality,sports,
          count(distinct id)::int profiles,
          count(distinct id) filter(where is_public)::int public_profiles,
          count(distinct id) filter(where added_7d)::int added_7d
        from profile_base group by gender,country,county,nationality,sports
      )
      insert into collection_stats_snapshots(key,generated_at,payload)
      select 'profiles-v1',now(),jsonb_build_object(
        'groups',coalesce((select jsonb_agg(g) from groups g),'[]'::jsonb),
        'excluded',(select count(*) from athletes)-(select count(*) from profile_base))
      on conflict(key) do update set generated_at=excluded.generated_at,payload=excluded.payload
      returning generated_at::text,payload`,
      [nationalityAliases, sportAliases],
    );
    if (!snapshot) throw new Error("Athlete statistics could not be updated");
    return snapshot;
  });
}
