import type { Sql } from "../db";
import { retainedFixtureAliasSlugs } from "../../data/fixture-deduplication";
import {
  operationInput,
  operationPageSize,
  operationSections,
  type OperationColumn,
  type OperationReport,
  type OperationInput,
} from "./operations";
import { sourceNationalitySql, statedNationalitySql } from "./nationality.server";
import { profileSportEvidencePredicateSql } from "../athrecs/profile-sport-evidence";

const known = (v: string) =>
  `case when lower(trim(coalesce(${v},''))) in ('','u','unknown','unspecified','n/a','none','null','not known') then 'Unknown' else trim(${v}) end`;
const start = `((now() at time zone 'Europe/London')::date-($3::int-1))::timestamp at time zone 'Europe/London'`;
const today = `(now() at time zone 'Europe/London')::date`;
const athleteLink = (v: string) => `'/admin/athletes/'||${v}::text`;
const base = `params as (select $1::text[], $2::text, $3::int, $4::text, $5::int),
 a as (select a.id,a.display_name,a.gender,a.country,a.county,a.club_id,a.second_club_id,a.parent_athlete_id,a.profile_details,a.nation,a.created_at,a.source_club_name from athletes a where not exists(select 1 from athrecs_test_athletes t where t.athlete_id=a.id)
   and coalesce(a.profile_details->>'syntheticTest','false')<>'true'),
 e as (select id,slug,name,sport,country,county,website,created_at from events where not(slug=any($1::text[]))),
 d as (select d.id,d.event_id,d.event_date,d.distance_code,d.status,d.stats_created_at from editions d join e on e.id=d.event_id),
 r as (select r.id,r.athlete_id,r.edition_id,r.status,r.result_details,r.stats_created_at,r.result_source,r.source_url,r.bib, a.display_name athlete_name,e.name event_name,e.sport,e.country,d.distance_code,d.event_date
   from results r join a on a.id=r.athlete_id join d on d.id=r.edition_id join e on e.id=d.event_id
   where coalesce(r.result_details->>'syntheticTest','false')<>'true'),
 histories as (select h.* from athlete_source_histories h join a on a.id=h.athlete_id),
 hcounts as (select h.athlete_id,count(*) n from histories h cross join lateral jsonb_array_elements(h.performances) p
   where coalesce(p->>'profileExcluded','false')<>'true' and coalesce(p->>'syntheticTest','false')<>'true' group by 1)`;
const inventories = `jsonb_build_array(
 jsonb_build_object('label','Catalogue results','href','/admin/result-archive','value',(select count(*) from r)),
 jsonb_build_object('label','Source-history rows','href','/admin/athlete-directory','value',(select coalesce(sum(jsonb_array_length(performances)),0) from histories),'detail','Raw observations; may overlap catalogue results or one another.'),
 jsonb_build_object('label','Central archive observations','href','/admin/result-archive','value',(select count(*) from result_archive_entries x join result_archive_datasets ds on ds.id=x.dataset_id join d on d.id=ds.edition_id),'detail','Includes linked and unmatched observations; not an extra unique-result total.'),
 jsonb_build_object('label','Latest captured source rows','href','/admin/result-archive','value',(select coalesce(sum(row_count),0) from (select distinct on(provider,source_key) row_count from result_archive_source_captures order by provider,source_key,last_seen_at desc,id desc)x),'detail','Latest version of each source sheet; identity may still be unresolved.'))`;
const col = (key: string, label: string, numeric = false): OperationColumn => ({
  key,
  label,
  numeric,
});
const recordCols = [col("label", "Record"), col("detail", "Details"), col("status", "Status")];
const verified = (
  status: string,
  provider: string,
) => `case when ${status}='unverified' then 'Unverified'
 when ${status}='source_verified' then 'Source checked' when ${status}='verified_by_administrator' then 'Administrator verified'
 when trim(coalesce(${provider},'')) ~* '^world[[:space:]]*athletics$' then 'World Athletics policy' else 'Unverified' end`;

type QuerySpec = {
  ctes?: string;
  rows: string;
  columns: OperationColumn[];
  description: string;
  notes?: string[];
  metrics?: string;
};
function results(f: OperationInput): QuerySpec {
  const group =
    {
      sport: known("sport"),
      distance: known("distance_code"),
      country: known("country"),
      year: "coalesce(extract(year from event_date)::text,'Unknown')",
    }[f.group as "sport" | "distance" | "country" | "year"] ?? known("sport");
  return {
    ctes: `grouped as (select r.*,${group} bucket from r)`,
    rows:
      f.mode === "records"
        ? `select id::text key,athlete_name||' — '||event_name label,concat_ws(' · ',event_date::text,sport,distance_code) detail,status,${athleteLink("athlete_id")} href from grouped where bucket=$2`
        : `select bucket key,bucket label,bucket drill,count(*) count,count(distinct athlete_id) athletes,count(distinct edition_id) editions from grouped group by bucket`,
    columns:
      f.mode === "records"
        ? recordCols
        : [
            col("label", "Group"),
            col("count", "Results", true),
            col("athletes", "Athletes", true),
            col("editions", "Editions", true),
          ],
    description:
      "Individual catalogue results by sport, distance, country or race year. Open a group to inspect its records.",
    metrics: inventories,
    notes: [
      "These inventories overlap and must not be added together. Catalogue counts include stored non-finish and excluded results; they do not certify a performance.",
      "Fictional test profiles/results and retained event aliases are excluded. Source captures remain raw observations.",
    ],
  };
}
function coverage(f: OperationInput): QuerySpec {
  const ctes = `rc as (select athlete_id,count(*) n from r where coalesce(result_details->>'profileExcluded','false')<>'true' group by 1),
 coverage as (select a.id,a.display_name,coalesce(rc.n,0) canonical,coalesce(h.n,0) observations,
 case when coalesce(rc.n,0)=0 and coalesce(h.n,0)=0 then 'No recorded results'
 when coalesce(rc.n,0)=0 then 'Source-history only' when rc.n=1 then 'One catalogue result' else 'Several catalogue results' end bucket
 from a left join rc on rc.athlete_id=a.id left join hcounts h on h.athlete_id=a.id)`;
  return {
    ctes,
    rows:
      f.mode === "records"
        ? `select id::text key,display_name label,canonical,observations,${athleteLink("id")} href from coverage where bucket=$2`
        : `select bucket key,bucket label,bucket drill,count(*) count,coalesce(sum(canonical),0) canonical,coalesce(sum(observations),0) observations from coverage group by bucket`,
    columns: [
      col("label", f.mode === "records" ? "Athlete" : "Coverage"),
      ...(f.mode === "summary" ? [col("count", "Athletes", true)] : []),
      col("canonical", "Catalogue results", true),
      col("observations", "Source-history rows", true),
    ],
    description:
      "Find empty profiles and see which athletes have one or several catalogue results.",
    notes: [
      "Excluded and synthetic performance rows do not count towards coverage. Source histories can overlap catalogue results; the two columns are not a deduplicated total.",
    ],
  };
}
function growth(f: OperationInput): QuerySpec {
  const ctes = `records as (
 select 'events' entity,id,name label,created_at added,'/admin/event-register' href from e union all
 select 'editions',d.id,e.name||' · '||coalesce(d.event_date::text,'Unknown')||' · '||d.distance_code,d.stats_created_at,'/admin/event-register' from d join e on e.id=d.event_id union all
 select 'athletes',id,display_name,created_at,${athleteLink("id")} from a union all
 select 'results',id,athlete_name||' — '||event_name,stats_created_at,${athleteLink("athlete_id")} from r),
 changes as (select c.* from collection_stats_changes c join records r on r.id=c.record_id and r.entity=c.entity),
 calendar as (select generate_series(${today}-($3::int-1),${today},interval '1 day')::date as day),
 daily_added as (select (added at time zone 'Europe/London')::date as day,entity,count(*) n from records where added>=${start} group by 1,2),
 daily_changes as (select day,count(*) n from changes where day>=${today}-($3::int-1) group by day)`;
  let rows: string;
  let columns: OperationColumn[];
  if (f.mode === "records") {
    rows = `select entity||':'||id::text key,label,case when $2='undated' then 'Collection date unknown' when added>=${start} then 'Added '||to_char(added at time zone 'Europe/London','YYYY-MM-DD HH24:MI') else 'Updated in selected period' end detail,entity status,href from records t where
     ($2='undated' and added is null)
     or ($2 like 'day:%' and (to_char(added at time zone 'Europe/London','YYYY-MM-DD')=substring($2 from 5)
       or exists(select 1 from changes c where c.entity=t.entity and c.record_id=t.id and c.day::text=substring($2 from 5))))
     or (entity=$2 and (added>=${start} or exists(select 1 from changes c where c.entity=t.entity and c.record_id=t.id and c.day>=${today}-($3::int-1))))`;
    columns = recordCols;
  } else if (f.group === "daily") {
    rows = `select c.day::text key,c.day::text label,'day:'||c.day::text drill,
      coalesce(sum(a.n) filter(where a.entity='events'),0) events,
      coalesce(sum(a.n) filter(where a.entity='editions'),0) editions,
      coalesce(sum(a.n) filter(where a.entity='athletes'),0) athletes,
      coalesce(sum(a.n) filter(where a.entity='results'),0) results,
      coalesce(ch.n,0) updated from calendar c left join daily_added a on a.day=c.day
      left join daily_changes ch on ch.day=c.day group by c.day,ch.n`;
    columns = [
      col("label", "UK date"),
      col("events", "New events", true),
      col("editions", "New editions", true),
      col("athletes", "New athletes", true),
      col("results", "New results", true),
      col("updated", "Records updated", true),
    ];
  } else {
    rows = `select entity key,initcap(entity) label,entity drill,
  count(*) filter(where added>=(${today}::timestamp at time zone 'Europe/London')) as today,
  count(*) filter(where added>=(((${today}-6)::timestamp) at time zone 'Europe/London')) as week,
  count(*) filter(where added>=(((${today}-29)::timestamp) at time zone 'Europe/London')) as month,
  count(*) filter(where added>=${start}) as period,
  (select count(distinct record_id) from changes c where c.entity=t.entity and c.day>=${today}-($3::int-1)) updated,
  count(*) filter(where added is null) undated from records t group by entity`;
    columns = [
      col("label", "Record type"),
      col("today", "New today", true),
      col("week", "New in 7 days", true),
      col("month", "New in 30 days", true),
      col("period", "New in selected period", true),
      col("updated", "Updated in selected period", true),
      col("undated", "Collection date unknown", true),
    ];
  }
  return {
    ctes,
    rows,
    columns,
    description: "New records and changed records, using UK calendar days including today.",
    metrics: `jsonb_build_array(jsonb_build_object('label','Records with unknown collection date','value',(select count(*) from records where added is null),'drill','undated'))`,
    notes: [
      "Existing event and athlete creation dates are retained. Edition/result creation dates and change tracking begin with this dashboard release; older unknown dates remain blank.",
      "Updates count distinct retained records in the selected period. Daily update totals can include the same record on several days. New records can also be updated.",
    ],
  };
}
function sources(f: OperationInput): QuerySpec {
  if (f.group === "imports")
    return {
      description:
        "Import activity by provider, including new rows, updates, skipped rows and failed runs.",
      rows:
        f.mode === "records"
          ? `select id key,source_name label,concat(rows_imported,' new · ',rows_updated,' updated · ',error_count,' errors') detail,status,'/admin/result-archive' href from result_ingestion_runs where source_name=$2`
          : `select source_name key,source_name label,source_name drill,count(*) runs,sum(rows_imported) imported,sum(rows_updated) updated,sum(rows_skipped) skipped,count(*) filter(where status in ('failed','completed_with_errors')) failed,max(coalesce(finished_at,started_at))::text checked from result_ingestion_runs group by source_name`,
      columns:
        f.mode === "records"
          ? recordCols
          : [
              col("label", "Provider"),
              col("runs", "Runs", true),
              col("imported", "Rows added", true),
              col("updated", "Rows updated", true),
              col("skipped", "Rows skipped", true),
              col("failed", "Runs with errors", true),
              col("checked", "Last run"),
            ],
      notes: [
        "Import counters describe operations, not unique results. Retries and repeat updates can affect more than one run. A skipped row is not necessarily a duplicate.",
      ],
    };
  if (f.group === "datasets")
    return {
      description: "Completeness of recorded result datasets where an expected row count is known.",
      ctes: `datasets as (select ds.id,ds.provider,e.name,ds.expected_rows,ds.updated_at,count(x.id) observed,count(x.id) filter(where x.canonical_result_id is not null) linked from result_archive_datasets ds join d on d.id=ds.edition_id join e on e.id=d.event_id left join result_archive_entries x on x.dataset_id=ds.id group by ds.id,e.name)`,
      rows:
        f.mode === "records"
          ? `select x.id::text key,coalesce(nullif(x.payload->>'name',''),'Source row '||x.source_key) label,ds.provider||' · '||ds.name detail,x.review_state status,'/admin/result-archive' href from result_archive_entries x join datasets ds on ds.id=x.dataset_id where ds.id::text=$2`
          : `select id::text key,provider||' · '||name label,id::text drill,expected_rows expected,observed,linked,case when expected_rows>0 then round(100.0*observed/expected_rows,1)::float8 end percent,updated_at::text checked from datasets`,
      columns:
        f.mode === "records"
          ? recordCols
          : [
              col("label", "Dataset"),
              col("expected", "Expected rows", true),
              col("observed", "Observed rows", true),
              col("linked", "Linked rows", true),
              col("percent", "Observed %", true),
              col("checked", "Last dataset update"),
            ],
      notes: [
        "A blank expected count means completeness is unknown. Over 100% flags a denominator or source-row issue; it is not silently capped. Row coverage does not establish identity or source verification.",
      ],
    };
  return {
    description:
      "Known source pages and documents, grouped by website. Open a website to inspect its work items.",
    ctes: `hosts as (select host from event_register_sources where host<>'' union select source_host from event_register_extraction_items where source_host<>''),
 progress as (select source_host,
 count(*) filter(where kind<>'unclassified' and state<>'excluded') known,
 count(*) filter(where kind<>'unclassified' and state='extracted') extracted,
 count(*) filter(where kind<>'unclassified' and state in ('pending','partial','held','failed')) outstanding,
 count(*) filter(where state='failed') failed,count(*) filter(where state='held') held,
 sum(records) records,sum(result_rows) results,max(checked_at)::text checked
 from event_register_extraction_items group by source_host)`,
    rows:
      f.mode === "records"
        ? `select item_key key,source_url label,kind||' · '||records||' records · '||result_rows||' result rows' detail,state status,'/admin/event-register' href from event_register_extraction_items where source_host=$2`
        : `select host key,host label,host drill,coalesce(p.known,0) known,coalesce(p.extracted,0) extracted,coalesce(p.outstanding,0) outstanding,
 coalesce(p.failed,0) failed,coalesce(p.held,0) held,coalesce(p.records,0) records,coalesce(p.results,0) results,
 case when p.known>0 then round(100.0*p.extracted/p.known,1)::float8 end percent,
 coalesce(p.checked,(select nullif(max(checked_on),'') from event_register_sources where host=h.host),'Not checked') checked
 from hosts h left join progress p on p.source_host=h.host`,
    columns:
      f.mode === "records"
        ? recordCols
        : [
            col("label", "Website"),
            col("known", "Known pages", true),
            col("extracted", "Extracted", true),
            col("outstanding", "Outstanding", true),
            col("failed", "Failed", true),
            col("held", "Held", true),
            col("records", "Recorded items", true),
            col("results", "Reported result rows", true),
            col("percent", "Known pages %", true),
            col("checked", "Last checked"),
          ],
    notes: [
      "Percentages cover classified, discovered pages/documents only, excluding non-race items. They are not percentages of an entire website or archive.",
      "Blank percentages mean no denominator is recorded. Raw record counters may overlap other sources. Use Imports and Datasets for their separate progress measures.",
    ],
  };
}
function queueReport(
  f: OperationInput,
  items: string,
  description: string,
  notes: string[] = [],
): QuerySpec {
  return {
    ctes: `items as (${items})`,
    description,
    notes,
    rows:
      f.mode === "records"
        ? `select id key,label,detail,status,created::text since,href from items where bucket=$2`
        : `select bucket key,bucket label,bucket drill,count(*) count,
 count(*) filter(where created<now()-interval '7 days') older7,
 count(*) filter(where created<now()-interval '30 days') older30,
 min(created)::text oldest from items group by bucket`,
    columns:
      f.mode === "records"
        ? [...recordCols, col("since", "Recorded at")]
        : [
            col("label", "Queue"),
            col("count", "Records", true),
            col("older7", "Older than 7 days", true),
            col("older30", "Older than 30 days", true),
            col("oldest", "Oldest record"),
          ],
  };
}
function matching(f: OperationInput): QuerySpec {
  return queueReport(
    f,
    `
 select case when x.review_state='held' then 'Archive rows held' else 'Archive rows awaiting matching' end bucket,
 'archive:'||x.id::text id,coalesce(nullif(x.payload->>'name',''),'Source row '||x.source_key) label,ds.provider detail,x.review_state status,x.created_at created,'/admin/result-archive' href
 from result_archive_entries x join result_archive_datasets ds on ds.id=x.dataset_id join d on d.id=ds.edition_id where x.canonical_result_id is null
 union all select 'Linked source revisions awaiting review','revision:'||x.id::text,coalesce(x.payload->>'name',x.source_key),ds.provider,x.review_state,x.updated_at,'/admin/result-archive'
 from result_archive_entries x join result_archive_datasets ds on ds.id=x.dataset_id join d on d.id=ds.edition_id where x.revision>x.applied_revision
 union all select 'Club candidates with possible matches','club:'||c.id::text,cl.name,'Candidate '||c.id::text,c.status,c.created_at,'/admin/club-scanner'
 from club_scan_candidates c join clubs cl on cl.id=c.club_id where c.status in ('proposed','held') and jsonb_array_length(c.matches)>0
 union all select 'Claims: '||c.status,'claim:'||c.id::text,a.display_name,'Result ownership request',c.status,c.submitted_at,'/admin/result-claims?claimId='||c.id::text
 from result_claims c join a on a.id=c.athlete_id where c.status in ('pending','needs_info')
 union all select 'Conflicting active claims','conflict:'||c.id::text,a.display_name,'Competing ownership claims or recorded conflict',c.status,c.submitted_at,'/admin/result-claims?claimId='||c.id::text
 from result_claims c join a on a.id=c.athlete_id where c.status in ('pending','needs_info','approved') and
 (nullif(trim(c.conflict_reason),'') is not null or exists(select 1 from result_claims c2 where c2.claim_key=c.claim_key and c2.claimant_user_id<>c.claimant_user_id and c2.status in ('pending','needs_info','approved')))
 union all select 'Archive match requests','request:'||x.entry_id::text||':'||x.user_id,coalesce(en.payload->>'name',en.source_key),'Member match request',en.review_state,x.created_at,'/admin/result-archive'
 from result_archive_match_requests x join result_archive_entries en on en.id=x.entry_id join result_archive_datasets ds on ds.id=en.dataset_id join d on d.id=ds.edition_id where en.canonical_result_id is null and not athrecs_is_test_user(x.user_id)
 `,
    "Results and requests awaiting identity matching or review.",
    [
      "Queue categories can overlap. A suggested match or shared name is not proof of identity. Age is measured from the recorded request or source observation.",
    ],
  );
}
function verification(f: OperationInput): QuerySpec {
  return queueReport(
    f,
    `
 select 'Catalogue: '||${verified("r.result_details->>'verificationStatus'", "r.result_source")} bucket,'r:'||r.id::text id,
 r.athlete_name||' — '||r.event_name label,concat_ws(' · ',r.event_date::text,r.sport,r.distance_code) detail,
 ${verified("r.result_details->>'verificationStatus'", "r.result_source")} status,r.stats_created_at created,${athleteLink("r.athlete_id")} href from r
 union all select 'Source history: '||${verified("p->>'verificationStatus'", "h.provider")},
 'h:'||h.athlete_id::text||':'||h.provider||':'||h.external_id||':'||ordinality::text,a.display_name,
 h.provider||' · '||coalesce(p->>'meeting',p->>'event',p->>'discipline','Source performance'),
 ${verified("p->>'verificationStatus'", "h.provider")},h.captured_at,${athleteLink("h.athlete_id")}
 from histories h join a on a.id=h.athlete_id cross join lateral jsonb_array_elements(h.performances) with ordinality x(p,ordinality)
 where coalesce(p->>'profileExcluded','false')<>'true' and coalesce(p->>'syntheticTest','false')<>'true'
 union all select 'Verification requests: '||v.status,'v:'||v.id::text,a.display_name,'Result verification request',v.status,v.created_at,${athleteLink("v.athlete_id")}
 from athlete_result_verification_requests v join a on a.id=v.athlete_id
 `,
    "Recorded performance-verification labels and the athlete verification inbox.",
    [
      "Source checks, administrator verification and ownership approval are different measures. World Athletics policy reflects the existing official-record rule; it does not claim a new manual check.",
      "Catalogue and source-history observations can overlap. Unverified includes absent explicit verification. Request rejection is a review outcome, not proof of an invalid performance. Age columns describe storage/request age, not verification age.",
    ],
  );
}
function gaps(f: OperationInput): QuerySpec {
  const p = `select a.id,a.display_name,a.gender,a.country,a.county,
 coalesce(nullif(${known("private.nationality")},'Unknown'),${statedNationalitySql},${sourceNationalitySql("a.profile_details")},nullif(${known("a.nation")},'Unknown'),'Unknown') nationality,
 (exists(select 1 from r where r.athlete_id=a.id and ${known("r.sport")}<>'Unknown')
 or exists(select 1 from histories h where h.athlete_id=a.id and cardinality(athlete_history_sports_v3(h.provider,h.performances))>0)
 or (${profileSportEvidencePredicateSql()} and cardinality(athlete_profile_sports_v1(a.profile_details))>0)
 or exists(select 1 from athlete_account_links l join athlete_sport_profiles sp on sp.user_id=l.user_id where l.athlete_id=a.id and l.status='active' and ${known("sp.sport_code")}<>'Unknown')) has_sport
 from a left join athlete_account_links owner on owner.athlete_id=a.id and owner.status='active'
 left join athlete_private_profiles private on private.user_id=owner.user_id`;
  const rows = `select 'Athletes: missing '||gap bucket,'a:'||p.id::text||':'||gap id,p.display_name label,'Recorded profile detail' detail,'Missing' status,null::timestamptz created,${athleteLink("p.id")} href
 from profile_gaps p cross join lateral (values ('gender',${known("p.gender")}='Unknown'),('nationality',p.nationality='Unknown'),('sport',not p.has_sport),('country',${known("p.country")}='Unknown'),('county',${known("p.county")}='Unknown')) missing(gap,absent) where absent
 union all select 'Events: missing '||gap,'e:'||e.id::text||':'||gap,e.name,'Catalogue event','Missing',e.created_at,'/admin/event-register'
 from e cross join lateral (values ('official website',trim(e.website)=''),('country',${known("e.country")}='Unknown'),('county',${known("e.county")}='Unknown'),('sport',${known("e.sport")}='Unknown'),
 ('dated edition',not exists(select 1 from d where d.event_id=e.id and d.event_date is not null)),
 ('distance',not exists(select 1 from event_distances x where x.event_id=e.id and ${known("x.distance_code")}<>'Unknown') and not exists(select 1 from d where d.event_id=e.id and ${known("d.distance_code")}<>'Unknown'))) missing(gap,absent) where absent
 union all select 'Editions: date to be confirmed','d:'||d.id::text,e.name,coalesce(d.event_date::text,'No date')||' · '||d.distance_code,d.status,d.stats_created_at,'/admin/event-register' from d join e on e.id=d.event_id where d.status='TBC'`;
  const report = queueReport(f, rows, "Missing details that can guide the next collection pass.", [
    "Each record can appear in several gap categories. Nationality is never inferred from residence, club or race location. Empty fields and explicit Unknown values are treated as missing.",
  ]);
  report.ctes = `profile_gaps as (${p}),${report.ctes}`;
  return report;
}
function duplicates(f: OperationInput): QuerySpec {
  const ctes = `same_names as (select lower(regexp_replace(trim(display_name),'[[:space:]]+',' ','g')) name from a where parent_athlete_id is null and length(trim(display_name))>1 group by 1 having count(*)>1),
 row_conflicts as (select edition_id,trim(bib) bib,split_part(source_url,'#',1) source from r where trim(coalesce(bib,''))<>'' and trim(coalesce(source_url,''))<>'' group by 1,2,3 having count(distinct athlete_id)>1)`;
  const report = queueReport(
    f,
    `
 select 'Same-name athlete profiles to review' bucket,'a:'||a.id::text id,a.display_name label,concat_ws(' · ',a.gender,a.country,a.source_club_name) detail,'Possible match only' status,a.created_at created,${athleteLink("a.id")} href
 from a join same_names n on n.name=lower(regexp_replace(trim(a.display_name),'[[:space:]]+',' ','g')) where a.parent_athlete_id is null
 union all select 'Conflicting assignments of a source result','r:'||r.id::text,r.athlete_name||' — '||r.event_name,'Bib '||r.bib,'Review source row',r.stats_created_at,${athleteLink("r.athlete_id")} from r join row_conflicts c on c.edition_id=r.edition_id and c.bib=trim(r.bib) and c.source=split_part(r.source_url,'#',1)
 union all select 'Fixture candidates flagged duplicate','f:'||id,event_name,event_date,status,created_at,'/admin/fixture-review' from fixture_candidates where status='duplicate'
 union all select 'Race collector duplicate findings','c:'||c.id::text,c.event_slug,c.reason,c.status,c.created_at,'/admin/race-collector' from race_collector_candidates c where c.status='duplicate' and not exists(select 1 from race_collector_duplicate_reviews rv where rv.candidate_id=c.id and rv.undone_at is null)
 union all select 'Club candidates flagged duplicate','cl:'||c.id::text,cl.name,'Candidate '||c.id::text,c.status,c.created_at,'/admin/club-scanner' from club_scan_candidates c join clubs cl on cl.id=c.club_id where c.status='duplicate'
 `,
    "Potential overlaps and recorded duplicate findings, ready for human review.",
    [
      "Same names are review candidates, not confirmed duplicates; these figures never trigger an automatic merge. Already merged child profiles are excluded from the same-name check.",
      "Result conflicts use the same edition, source URL and non-empty bib assigned to different athletes. Counts are affected records, not unique duplicate pairs. Import findings can describe records that were correctly prevented from publishing.",
    ],
  );
  report.ctes = `${ctes},${report.ctes}`;
  return report;
}
function clubs(f: OperationInput): QuerySpec {
  return {
    description: "Current club affiliations, result coverage and representative applications.",
    ctes: `members as (select club_id, id athlete_id from a where club_id is not null union select second_club_id,id from a where second_club_id is not null),
 rc as (select athlete_id,count(*) n from r group by 1),
 club_stats as (select c.id,c.slug,c.name,c.country,
 count(m.athlete_id) athletes,coalesce(sum(rc.n),0) results,coalesce(sum(h.n),0) observations,
 count(*) filter(where m.athlete_id is not null and coalesce(rc.n,0)=0 and coalesce(h.n,0)=0) empty,
 (select count(*) from club_registration_applications app where app.club_id=c.id and app.status in ('pending','needs_changes')) applications,
 exists(select 1 from club_representatives rep where rep.club_id=c.id and rep.status='active') represented,
 case when trim(coalesce(c.website,''))='' and trim(c.summary)='' then 'Website and biography' when trim(coalesce(c.website,''))='' then 'Website' when trim(c.summary)='' then 'Biography' else 'None' end missing
 from clubs c left join members m on m.club_id=c.id left join rc on rc.athlete_id=m.athlete_id left join hcounts h on h.athlete_id=m.athlete_id group by c.id)`,
    rows:
      f.mode === "records"
        ? `select a.id::text key,a.display_name label,coalesce(rc.n,0) results,coalesce(h.n,0) observations,${athleteLink("a.id")} href from members m join a on a.id=m.athlete_id left join rc on rc.athlete_id=a.id left join hcounts h on h.athlete_id=a.id where m.club_id::text=$2`
        : `select id::text key,name label,id::text drill,country,athletes,results,observations,empty,applications,case when represented then 'Approved representative' else 'No active representative' end representative,missing from club_stats`,
    columns:
      f.mode === "records"
        ? [
            col("label", "Athlete"),
            col("results", "Catalogue results", true),
            col("observations", "Source-history rows", true),
          ]
        : [
            col("label", "Club"),
            col("country", "Country"),
            col("athletes", "Athletes", true),
            col("results", "Catalogue results", true),
            col("observations", "History rows", true),
            col("empty", "Athletes without results", true),
            col("applications", "Open applications", true),
            col("representative", "Management"),
            col("missing", "Missing information"),
          ],
    metrics: `jsonb_build_array(jsonb_build_object('label','Clubs','href','/admin/club-scanner','value',(select count(*) from club_stats)),jsonb_build_object('label','Clubs missing information','href','/admin/club-scanner','value',(select count(*) from club_stats where missing<>'None')),jsonb_build_object('label','Applications awaiting review','href','/admin/club-registrations','value',(select count(*) from club_registration_applications where status in ('pending','needs_changes'))))`,
    notes: [
      "Results belong to athletes currently linked through their first or second club; this does not claim that every result was achieved for that club. Members can appear in several clubs. Catalogue and source-history rows can overlap.",
      "Applications for a new club may not yet have a club ID and are included in the application total. Use Club registrations to review them.",
    ],
  };
}
function backlog(f: OperationInput): QuerySpec {
  return queueReport(
    f,
    `
 select 'Fixture candidates: '||status bucket,'fixture:'||id id,event_name label,event_date detail,status,created_at created,'/admin/fixture-review' href
 from fixture_candidates where status in ('staged','eligible','blocked','failed') and review_status<>'rejected'
 union all select 'Race collector: '||status,'race:'||id::text,event_slug,reason,status,created_at,'/admin/race-collector' from race_collector_candidates where status in ('review','held')
 union all select 'Club candidates: '||c.status,'club:'||c.id::text,cl.name,'Candidate '||c.id::text,c.status,c.created_at,'/admin/club-scanner' from club_scan_candidates c join clubs cl on cl.id=c.club_id where c.status in ('proposed','held','approved')
 union all select 'Result imports: '||status,'import:'||id,source_name,concat(rows_imported,' rows added; ',error_count,' errors'),status,created_at,'/admin/result-archive' from result_ingestion_runs where status in ('queued','processing','completed_with_errors','failed')
 union all select 'Club registrations: '||app.status,'application:'||app.id::text,coalesce(c.name,'New club application'),'Representative application',app.status,coalesce(app.submitted_at,app.created_at),'/admin/club-registrations' from club_registration_applications app left join clubs c on c.id=app.club_id where app.status in ('pending','needs_changes')
 `,
    "Review, held and failed work that needs a decision before collection or publication can progress.",
    [
      "Private profiles and unpublished histories are not automatically treated as publication backlog. Visibility changes still require the existing review process.",
      "Queues can overlap other reports. Age starts at the original record/submission date, not the most recent retry. Rejected fixture candidates are excluded.",
    ],
  );
}
function activity(f: OperationInput): QuerySpec {
  return {
    description:
      "Recorded registrations, profile claims and athletes adding results in the selected UK date window.",
    ctes: `stages as (
 select 'New registrations' bucket,u.id,u.name label,u."createdAt" happened,'Registered account' detail from "user" u where not athrecs_is_test_user(u.id) and u."createdAt">=${start}
 union all select 'Accounts claiming a profile',u.id,u.name,min(l.linked_at),'Currently active ownership link' from athlete_account_links l join a on a.id=l.athlete_id join "user" u on u.id=l.user_id where l.status='active' and l.linked_at>=${start} and not athrecs_is_test_user(u.id) group by u.id
 union all select 'Athletes adding results',u.id,u.name,min(c.created_at),'At least one added result in a profile confirmation' from athlete_profile_result_confirmations c join a on a.id=c.athlete_id join "user" u on u.id=c.user_id where c.added_count>0 and c.created_at>=${start} and not athrecs_is_test_user(u.id) group by u.id
 union all select 'Accounts signing in',u.id,u.name,l.last_sign_in_at,'Includes signup sessions' from athlete_login_activity l join "user" u on u.id=l.user_id where l.last_sign_in_at>=${start} and not athrecs_is_test_user(u.id)
 )`,
    rows:
      f.mode === "records"
        ? `select id key,label,detail,happened::text status,'/admin/athlete-accounts' href from stages where bucket=$2`
        : `select bucket key,bucket label,bucket drill,count(distinct id) count from stages group by bucket
 union all select bucket,bucket,bucket,0 from (values('New registrations'),('Accounts claiming a profile'),('Athletes adding results'),('Accounts signing in')) s(bucket) where not exists(select 1 from stages t where t.bucket=s.bucket)`,
    columns:
      f.mode === "records"
        ? recordCols
        : [col("label", "Activity"), col("count", "Distinct accounts", true)],
    notes: [
      "These are activity counts, not a linked visitor-to-registration conversion funnel. Accounts can appear in several stages and may have registered before the selected period. Fictional test accounts are excluded; staff accounts are included.",
      "Athletes adding results uses saved profile confirmations with added_count greater than zero. Other import and staff-entry routes are not claimed as athlete activity. Visits and search performance are available in Website traffic & Google with their own reporting window.",
    ],
  };
}
const builders = {
  results,
  coverage,
  growth,
  sources,
  matching,
  verification,
  gaps,
  duplicates,
  clubs,
  backlog,
  activity,
};

/** Bounded staff-only queries. SQL fragments come only from this module's constants. */
export async function readCollectionOperations(sql: Sql, input: unknown): Promise<OperationReport> {
  const f = operationInput.parse(input);
  const spec = builders[f.section](f);
  const [row] = await sql.query<{
    rows: OperationReport["rows"];
    total: number;
    metrics: OperationReport["metrics"];
    generated: string;
    tracking: string;
  }>(
    `
 with ${base}${spec.ctes ? `,${spec.ctes}` : ""},
 report_rows as (${spec.rows}),
 filtered as materialized(select * from report_rows where $4='' or strpos(lower(label),lower($4))>0),
 page as (select * from filtered order by ${f.section === "growth" && f.group === "daily" ? "key desc" : "label,key"} limit ${operationPageSize} offset $5)
 select coalesce((select jsonb_agg(page) from page),'[]'::jsonb) rows,
 (select count(*) from filtered) total,${spec.metrics ?? "'[]'::jsonb"} metrics,now()::text generated,(select started_at::text from collection_stats_tracking) tracking`,
    [retainedFixtureAliasSlugs, f.key, f.days, f.q, f.page * operationPageSize],
  );
  if (!row) throw new Error("Operations statistics are unavailable");
  return {
    title: operationSections[f.section],
    description: spec.description,
    notes: [
      ...(spec.notes ?? []),
      ...(f.section === "growth"
        ? [
            `Edition/result collection dates and change history are tracked from ${new Date(row.tracking).toLocaleString("en-GB", { timeZone: "Europe/London" })} (UK time).`,
          ]
        : []),
    ],
    columns: spec.columns,
    rows: row.rows,
    total: row.total,
    page: f.page,
    generatedAt: row.generated,
    metrics: row.metrics,
  };
}
