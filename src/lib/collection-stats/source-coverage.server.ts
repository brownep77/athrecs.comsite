import type { OperationInput } from "./operations";
import type { QuerySpec } from "./operations.server";

const col = (key: string, label: string, numeric = false) => ({ key, label, numeric });
// Group evidence by exact host, ignoring only www and case. Do not guess that
// different subdomains/providers are the same organisation.
const host = (url: string) =>
  `nullif(regexp_replace(substring(lower(trim(${url})) from '^https?://([^/?#: @]+)'), '^www[.]', ''),'')`;
const source = (url: string, provider = "''") =>
  `coalesce(${host(url)},case when nullif(trim(${provider}),'') is not null then 'Provider: '||lower(trim(${provider})) end,'Unknown source')`;
const notes = [
  "Share of AthRecs is the number linked to this source divided by the stated AthRecs total. It is not the percentage collected from the external website. Its full total is unknown unless separately recorded.",
  "Evidence is grouped by website host; www and letter case are ignored. Different subdomains remain separate. One athlete or result can have several sources, so source shares can overlap. Test athletes, test results and known event aliases are excluded.",
  "Refresh reads saved AthRecs data; it does not contact source websites. A source capture date is separate from the time these figures were loaded.",
];

export function sourceCoverage(f: OperationInput): QuerySpec | null {
  if (f.group === "fixtures") {
    return {
      ctes: `fixture_sources as (select d.*,e.name,e.sport,
        ${source("coalesce(nullif(trim(d.source_url),''),e.source_url)")} source
        from d join e on e.id=d.event_id),
        grouped_sources as (select *,jsonb_build_array(source,sport)::text bucket from fixture_sources)`,
      rows:
        f.mode === "records"
          ? `select id::text key,name label,coalesce(event_date::text,'Date TBC') date,distance_code distance,source,sport,'/admin/event-register' href from grouped_sources where bucket=$2`
          : `select bucket key,source||' · '||sport label,bucket drill,count(*) count,
          (select count(*) from fixture_sources all_f where all_f.sport=g.sport) denominator,
          round(100.0*count(*)/nullif((select count(*) from fixture_sources all_f where all_f.sport=g.sport),0),1)::float8 share
          from grouped_sources g group by bucket,source,sport`,
      columns:
        f.mode === "records"
          ? [
              col("label", "Race"),
              col("date", "Edition date"),
              col("distance", "Distance"),
              col("source", "Source"),
              col("sport", "Sport"),
            ]
          : [
              col("label", "Source and sport"),
              col("count", "Saved fixtures", true),
              col("denominator", "All AthRecs fixtures in sport", true),
              col("share", "Share of sport fixtures (%)", true),
            ],
      description:
        "Fixture editions by source and sport. One fixture is one race date and distance. Edition evidence takes precedence; the event source is used when edition evidence is absent.",
      notes,
    };
  }
  if (f.group === "athleteSources") {
    return {
      ctes: `raw_sources as (
        select id athlete_id,${source("source_url")} source from a where ${host("source_url")} is not null
        union select i.athlete_id,${source("i.source_url", "i.provider")} from athlete_source_identities i join a on a.id=i.athlete_id
        union select i.athlete_id,${source("null::text", "i.provider")} from result_archive_athlete_identifiers i join a on a.id=i.athlete_id
        union select athlete_id,${source("source_url", "provider")} from histories
        union select athlete_id,${source("source_url")} from r where ${host("source_url")} is not null
        union select r.athlete_id,${source("ref.source_url", "ref.source_name")} from result_source_references ref join r on r.id=ref.result_id),
        athlete_sources as (select * from raw_sources union all
          select id,'Unknown source' from a where not exists(select 1 from raw_sources x where x.athlete_id=a.id))`,
      rows:
        f.mode === "records"
          ? `select a.id::text key,a.display_name label,s.source,'/admin/athletes/'||a.id::text href from athlete_sources s join a on a.id=s.athlete_id where s.source=$2`
          : `select source key,source label,source drill,count(distinct athlete_id) count,
          (select count(*) from a) denominator,
          round(100.0*count(distinct athlete_id)/nullif((select count(*) from a),0),1)::float8 share
          from athlete_sources group by source`,
      columns:
        f.mode === "records"
          ? [col("label", "Athlete"), col("source", "Source")]
          : [
              col("label", "Athlete source"),
              col("count", "Distinct athletes linked", true),
              col("denominator", "All AthRecs athletes", true),
              col("share", "Share of athletes (%)", true),
            ],
      description:
        "Sources recorded on athlete profiles, reviewed identifiers, imported histories and main results. A link records provenance, not proof of identity or that this source originally created the profile.",
      notes,
    };
  }
  if (f.group === "resultSources") {
    return {
      ctes: `raw_sources as (
        select id result_id,${source("source_url")} source from r where ${host("source_url")} is not null
        union select ref.result_id,${source("ref.source_url", "ref.source_name")} from result_source_references ref join r on r.id=ref.result_id),
        result_sources as (select * from raw_sources union all
          select id,'Unknown source' from r where not exists(select 1 from raw_sources s where s.result_id=r.id))`,
      rows:
        f.mode === "records"
          ? `select r.id::text key,r.athlete_name||' — '||r.event_name label,r.sport,r.distance_code distance,r.event_date::text date,'/admin/athletes/'||r.athlete_id::text href from result_sources s join r on r.id=s.result_id where s.source=$2`
          : `select source key,source label,source drill,count(distinct result_id) count,
          (select count(*) from r) denominator,
          round(100.0*count(distinct result_id)/nullif((select count(*) from r),0),1)::float8 share
          from result_sources group by source`,
      columns:
        f.mode === "records"
          ? [
              col("label", "Athlete and race"),
              col("sport", "Sport"),
              col("distance", "Distance"),
              col("date", "Edition date"),
            ]
          : [
              col("label", "Result source"),
              col("count", "Distinct main results", true),
              col("denominator", "All AthRecs main results", true),
              col("share", "Share of main results (%)", true),
            ],
      description:
        "Main results linked to each evidence source. Additional source references count once per result and website. Imported histories and unlinked archive rows are reported separately.",
      notes,
    };
  }
  if (f.group === "profileResults") {
    return {
      ctes: `history_coverage as (select h.*,a.display_name,
        jsonb_build_array(h.athlete_id,h.provider,h.external_id)::text bucket,
        ${source("h.source_url", "h.provider")} source,
        (select count(distinct y) from unnest(h.years_expected) y where y is not null) expected,
        (select count(distinct y) from unnest(h.years_expected) y where y=any(h.years_captured)) captured,
        (select count(*) from jsonb_array_elements(h.performances) p where coalesce(p->>'syntheticTest','false')<>'true' and coalesce(p->>'profileExcluded','false')<>'true') saved
        from histories h join a on a.id=h.athlete_id)`,
      rows:
        f.mode === "records"
          ? `select h.bucket||':'||p.ordinality key,concat_ws(' · ',p.value->>'date',p.value->>'meeting',p.value->>'discipline') label,
          p.value->>'performance' performance,coalesce(p.value->>'verificationStatus','unverified') status,
          '/admin/athletes/'||h.athlete_id::text href from history_coverage h
          cross join lateral jsonb_array_elements(h.performances) with ordinality p(value,ordinality)
          where h.bucket=$2 and coalesce(p.value->>'syntheticTest','false')<>'true' and coalesce(p.value->>'profileExcluded','false')<>'true'`
          : `select bucket key,display_name||' · '||source||' · '||external_id label,bucket drill,saved,
          expected,captured,round(100.0*captured/nullif(expected,0),1)::float8 percent,
          case when complete then 'Recorded complete' else 'Not recorded complete' end status,
          captured_at::text checked,'/admin/athletes/'||athlete_id::text href from history_coverage`,
      columns:
        f.mode === "records"
          ? [
              col("label", "Performance"),
              col("performance", "Mark / time"),
              col("status", "Verification"),
            ]
          : [
              col("label", "Athlete and source history"),
              col("saved", "Saved history results", true),
              col("expected", "Expected years", true),
              col("captured", "Expected years captured", true),
              col("percent", "Year coverage (%)", true),
              col("status", "Saved completeness flag"),
              col("checked", "Source captured at"),
            ],
      description:
        "Results held for each athlete source history, with the recorded capture time and coverage of its expected years. Open a history to see its saved performances.",
      notes: [
        "Year coverage is distinct expected years captured divided by distinct expected years. Unknown or empty expected-year lists have no percentage. Extra captured years do not inflate the figure.",
        "100% of expected years does not prove all results within those years were collected, or that this is the athlete's entire career. The completeness flag is the importer's saved assessment, not a fresh source check. Full result totals remain unknown.",
        "Hidden and synthetic performances are excluded. Different histories can contain the same performance; do not add these counts to main results.",
        notes[2],
      ],
    };
  }
  return null;
}
