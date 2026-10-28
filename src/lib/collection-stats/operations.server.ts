import { withDiscoveryRead } from "../athrecs/discovery-read.server";
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
 a as not materialized (select a.id,a.display_name,a.gender,a.country,a.county,a.club_id,a.second_club_id,a.parent_athlete_id,a.profile_details,a.nation,a.created_at,a.source_club_name from athletes a where not exists(select 1 from athrecs_test_athletes t where t.athlete_id=a.id)
   and coalesce(a.profile_details->>'syntheticTest','false')<>'true'),
 e as (select id,slug,name,sport,country,county,website,created_at from events where not(slug=any($1::text[]))),
 d as (select d.id,d.event_id,d.event_date,d.distance_code,d.status,d.stats_created_at from editions d join e on e.id=d.event_id),
 r as (select r.id,r.athlete_id,r.edition_id,r.status,r.result_details,r.stats_created_at,r.result_source,r.source_url,r.bib, a.display_name athlete_name,e.name event_name,e.sport,e.country,d.distance_code,d.event_date
   from results r join a on a.id=r.athlete_id join d on d.id=r.edition_id join e on e.id=d.event_id
   where coalesce(r.result_details->>'syntheticTest','false')<>'true'),
 histories as not materialized (select h.* from athlete_source_histories h join a on a.id=h.athlete_id),
 hcounts as (select h.athlete_id,count(*) n from histories h cross join lateral jsonb_array_elements(h.performances) p
   where coalesce(p->>'profileExcluded','false')<>'true' and coalesce(p->>'syntheticTest','false')<>'true' group by 1)`;
const inventories = `jsonb_build_array(
 jsonb_build_object('label','Main results saved','href','/admin/result-archive','value',(select count(*) from r),'detail','Results connected to athlete profiles in the main collection. May include unfinished races or hidden results; saving a result does not verify or publish it.'),
 jsonb_build_object('label','Results in imported histories','href','/admin/athlete-directory','value',(select coalesce(sum(jsonb_array_length(performances)),0) from histories),'detail','Results saved in athlete histories from other websites. The same performance may also be in the main results or another history.'),
 jsonb_build_object('label','Entries in the results archive','href','/admin/result-archive','value',(select count(*) from result_archive_entries x join result_archive_datasets ds on ds.id=x.dataset_id join d on d.id=ds.edition_id),'detail','Collected results-sheet entries, including entries already matched and entries still waiting for the right athlete. These may also appear in the main results.'),
 jsonb_build_object('label','Entries in saved results sheets','href','/admin/result-archive','value',(select coalesce(sum(row_count),0) from (select distinct on(provider,source_key) row_count from result_archive_source_captures order by provider,source_key,last_seen_at desc,id desc)x),'detail','Entries in the latest saved copy of each results sheet. They may still need processing and matching to athletes.'))`;
const col = (key: string, label: string, numeric = false): OperationColumn => ({
  key,
  label,
  numeric,
});
const recordCols = [col("label", "Entry"), col("detail", "Details"), col("status", "Status")];
const verified = (
  status: string,
  provider: string,
) => `case when ${status}='unverified' then 'No check recorded'
 when ${status}='source_verified' then 'Checked against source' when ${status}='verified_by_administrator' then 'Checked by staff'
 when trim(coalesce(${provider},'')) ~* '^world[[:space:]]*athletics$' then 'Accepted under World Athletics rule' else 'No check recorded' end`;

const stateLabel = (value: string) => `case ${value}
 when 'pending' then 'Waiting for review' when 'needs_info' then 'More information needed'
 when 'needs_changes' then 'Changes requested' when 'held' then 'Paused for review'
 when 'queued' then 'Waiting to start' when 'processing' then 'Collection in progress'
 when 'completed_with_errors' then 'Finished with some errors' when 'failed' then 'Could not complete'
 when 'staged' then 'Saved for review' when 'eligible' then 'Passed initial checks'
 when 'blocked' then 'An issue needs resolving' when 'review' then 'Needs review'
 when 'proposed' then 'Suggested for review' when 'approved' then 'Approved'
 when 'rejected' then 'Not approved' else replace(${value},'_',' ') end`;

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
            col("editions", "Race dates and distances", true),
          ],
    description:
      "Each total below counts main result entries. Country means where the event took place. Select See entries to find the athletes and events included.",
    metrics: inventories,
    notes: [
      "Do not add the four boxes together: the same performance can appear in more than one. Main results include unfinished races and results hidden from profiles. This is a count of saved entries, not verified performances.",
      "Test athletes, test results and known alternative event listings are left out. Saved results sheets still need their own checks.",
    ],
  };
}
function coverage(f: OperationInput): QuerySpec {
  const ctes = `rc as (select athlete_id,count(*) n from r where coalesce(result_details->>'profileExcluded','false')<>'true' group by 1),
 coverage as (select a.id,a.display_name,coalesce(rc.n,0) canonical,coalesce(h.n,0) observations,
 case when coalesce(rc.n,0)=0 and coalesce(h.n,0)=0 then 'No saved results'
 when coalesce(rc.n,0)=0 then 'Imported history only' when rc.n=1 then 'One main result' else 'Several main results' end bucket
 from a left join rc on rc.athlete_id=a.id left join hcounts h on h.athlete_id=a.id)`;
  return {
    ctes,
    rows:
      f.mode === "records"
        ? `select id::text key,display_name label,canonical,observations,${athleteLink("id")} href from coverage where bucket=$2`
        : `select bucket key,bucket label,bucket drill,count(*) count,coalesce(sum(canonical),0) canonical,coalesce(sum(observations),0) observations from coverage group by bucket`,
    columns: [
      col("label", f.mode === "records" ? "Athlete" : "Results saved for the athlete"),
      ...(f.mode === "summary" ? [col("count", "Athletes", true)] : []),
      col("canonical", "Main results saved", true),
      col("observations", "Results in imported histories", true),
    ],
    description:
      "Each athlete appears in one group below, according to the results we have saved for their profile.",
    notes: [
      "Results hidden from profiles and test results are left out here. Imported histories may include the same performances as the main results, so do not add the two result columns together.",
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
    rows = `select entity||':'||id::text key,label,case when $2='undated' then 'Date first saved is unknown' when added>=${start} then 'Added '||to_char(added at time zone 'Europe/London','YYYY-MM-DD HH24:MI') else 'Updated in selected period' end detail,entity status,href from records t where
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
      col("editions", "New race dates and distances", true),
      col("athletes", "New athletes", true),
      col("results", "New results", true),
      col("updated", "Entries edited", true),
    ];
  } else {
    rows = `select entity key,case entity when 'editions' then 'Race dates and distances' when 'athletes' then 'Athlete profiles' else initcap(entity) end label,entity drill,
  count(*) filter(where added>=(${today}::timestamp at time zone 'Europe/London')) as today,
  count(*) filter(where added>=(((${today}-6)::timestamp) at time zone 'Europe/London')) as week,
  count(*) filter(where added>=(((${today}-29)::timestamp) at time zone 'Europe/London')) as month,
  count(*) filter(where added>=${start}) as period,
  (select count(distinct record_id) from changes c where c.entity=t.entity and c.day>=${today}-($3::int-1)) updated,
  count(*) filter(where added is null) undated from records t group by entity`;
    columns = [
      col("label", "Type of entry"),
      col("today", "New today", true),
      col("week", "New in 7 days", true),
      col("month", "New in 30 days", true),
      col("period", "New in selected period", true),
      col("updated", "Edited in selected period", true),
      col("undated", "Date first saved is unknown", true),
    ];
  }
  return {
    ctes,
    rows,
    columns,
    description:
      "Count entries first saved or edited during the chosen period. Days follow UK time and include today.",
    metrics: `jsonb_build_array(jsonb_build_object('label','Entries with no date first saved','value',(select count(*) from records where added is null),'drill','undated'))`,
    notes: [
      "We kept existing dates for when events and profiles were created. Tracking when race dates and results were added or edited started with this report. Older entries may have no saved date.",
      "An edited entry is counted once for the whole period. In Day by day, it can count on each day it was edited. An entry can be both added and edited in the same period.",
    ],
  };
}
function sources(f: OperationInput): QuerySpec {
  if (f.group === "imports")
    return {
      description:
        "Each attempt to collect results from a website, showing entries added, changed, skipped and attempts with errors.",
      rows:
        f.mode === "records"
          ? `select id key,source_name label,concat(rows_imported,' new · ',rows_updated,' updated · ',error_count,' errors') detail,status,'/admin/result-archive' href from result_ingestion_runs where source_name=$2`
          : `select source_name key,source_name label,source_name drill,count(*) runs,sum(rows_imported) imported,sum(rows_updated) updated,sum(rows_skipped) skipped,count(*) filter(where status in ('failed','completed_with_errors')) failed,max(coalesce(finished_at,started_at))::text checked from result_ingestion_runs group by source_name`,
      columns:
        f.mode === "records"
          ? recordCols
          : [
              col("label", "Results website"),
              col("runs", "Collection attempts", true),
              col("imported", "Entries added", true),
              col("updated", "Entries changed", true),
              col("skipped", "Entries skipped", true),
              col("failed", "Attempts with errors", true),
              col("checked", "Last attempt"),
            ],
      notes: [
        "These totals count work done across collection attempts. Repeated attempts can count the same entry again. An entry may be skipped for several reasons, not just because it is a duplicate.",
      ],
    };
  if (f.group === "datasets")
    return {
      description:
        "Compare the entries saved from each results sheet with the number we expected to find, when that number is known.",
      ctes: `datasets as (select ds.id,ds.provider,e.name,ds.expected_rows,ds.updated_at,count(x.id) observed,count(x.id) filter(where x.canonical_result_id is not null) linked from result_archive_datasets ds join d on d.id=ds.edition_id join e on e.id=d.event_id left join result_archive_entries x on x.dataset_id=ds.id group by ds.id,e.name)`,
      rows:
        f.mode === "records"
          ? `select x.id::text key,coalesce(nullif(x.payload->>'name',''),'Collected entry '||x.source_key) label,ds.provider||' · '||ds.name detail,x.review_state status,'/admin/result-archive' href from result_archive_entries x join datasets ds on ds.id=x.dataset_id where ds.id::text=$2`
          : `select id::text key,provider||' · '||name label,id::text drill,expected_rows expected,observed,linked,case when expected_rows>0 then round(100.0*observed/expected_rows,1)::float8 end percent,updated_at::text checked from datasets`,
      columns:
        f.mode === "records"
          ? recordCols
          : [
              col("label", "Results sheet"),
              col("expected", "Entries expected", true),
              col("observed", "Entries saved", true),
              col("linked", "Entries matched to main results", true),
              col("percent", "Expected entries saved (%)", true),
              col("checked", "Last updated"),
            ],
      notes: [
        "A blank expected total means we cannot tell whether the sheet is complete. More than 100% means the expected total or saved entries need checking. Collecting an entry does not confirm the athlete or verify the result.",
      ],
    };
  return {
    description:
      "Pages and documents we have found on each website. Select See entries to find the individual pages and their progress.",
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
        ? `select item_key key,source_url label,kind||' · '||records||' items · '||result_rows||' result entries' detail,state status,'/admin/event-register' href from event_register_extraction_items where source_host=$2`
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
            col("known", "Relevant pages found", true),
            col("extracted", "Finished collecting", true),
            col("outstanding", "Still to finish", true),
            col("failed", "Could not collect", true),
            col("held", "Paused for review", true),
            col("records", "Items reported as saved", true),
            col("results", "Result entries reported", true),
            col("percent", "Found pages finished (%)", true),
            col("checked", "Last checked"),
          ],
    notes: [
      "Progress covers relevant pages we have found and identified. It does not measure the whole website: there may be other pages we have not discovered.",
      "A blank percentage means we do not have a known total to compare against. Saved item and result counts may include entries also collected elsewhere. Paused and failed pages can also be included in Still to finish.",
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
            col("label", "Work to review"),
            col("count", "Entries", true),
            col("older7", "Older than 7 days", true),
            col("older30", "Older than 30 days", true),
            col("oldest", "Oldest entry saved"),
          ],
  };
}
function matching(f: OperationInput): QuerySpec {
  return queueReport(
    f,
    `
 select case when x.review_state='held' then 'Collected results: paused for review' else 'Collected results: athlete still to be matched' end bucket,
 'archive:'||x.id::text id,coalesce(nullif(x.payload->>'name',''),'Collected entry '||x.source_key) label,ds.provider detail,x.review_state status,x.created_at created,'/admin/result-archive' href
 from result_archive_entries x join result_archive_datasets ds on ds.id=x.dataset_id join d on d.id=ds.edition_id where x.canonical_result_id is null
 union all select 'Changed source entries: review needed','revision:'||x.id::text,coalesce(x.payload->>'name',x.source_key),ds.provider,x.review_state,x.updated_at,'/admin/result-archive'
 from result_archive_entries x join result_archive_datasets ds on ds.id=x.dataset_id join d on d.id=ds.edition_id where x.revision>x.applied_revision
 union all select 'Club findings: possible athlete matches','club:'||c.id::text,cl.name,'Suggested entry '||c.id::text,c.status,c.created_at,'/admin/club-scanner'
 from club_scan_candidates c join clubs cl on cl.id=c.club_id where c.status in ('proposed','held') and jsonb_array_length(c.matches)>0
 union all select 'Requests to claim results: '||${stateLabel("c.status")},'claim:'||c.id::text,a.display_name,'Request to claim a result',c.status,c.submitted_at,'/admin/result-claims?claimId='||c.id::text
 from result_claims c join a on a.id=c.athlete_id where c.status in ('pending','needs_info')
 union all select 'The same result claimed by different people or flagged as conflicting','conflict:'||c.id::text,a.display_name,'Competing ownership claims or recorded conflict',c.status,c.submitted_at,'/admin/result-claims?claimId='||c.id::text
 from result_claims c join a on a.id=c.athlete_id where c.status in ('pending','needs_info','approved') and
 (nullif(trim(c.conflict_reason),'') is not null or exists(select 1 from result_claims c2 where c2.claim_key=c.claim_key and c2.claimant_user_id<>c.claimant_user_id and c2.status in ('pending','needs_info','approved')))
 union all select 'Member requests to match a collected result','request:'||x.entry_id::text||':'||x.user_id,coalesce(en.payload->>'name',en.source_key),'Member asking to match a result',en.review_state,x.created_at,'/admin/result-archive'
 from result_archive_match_requests x join result_archive_entries en on en.id=x.entry_id join result_archive_datasets ds on ds.id=en.dataset_id join d on d.id=ds.edition_id where en.canonical_result_id is null and not athrecs_is_test_user(x.user_id)
 `,
    "Collected results and athlete requests that need the right person identified or another check completed.",
    [
      "One item may appear in more than one group. A shared name or suggested match does not prove who the athlete is. Dates show when the request or source entry was saved; changed source entries use their update date.",
    ],
  );
}
function verification(f: OperationInput): QuerySpec {
  return queueReport(
    f,
    `
 select 'Main results: '||${verified("r.result_details->>'verificationStatus'", "r.result_source")} bucket,'r:'||r.id::text id,
 r.athlete_name||' — '||r.event_name label,concat_ws(' · ',r.event_date::text,r.sport,r.distance_code) detail,
 ${verified("r.result_details->>'verificationStatus'", "r.result_source")} status,r.stats_created_at created,${athleteLink("r.athlete_id")} href from r
 union all select 'Imported histories: '||${verified("p->>'verificationStatus'", "h.provider")},
 'h:'||h.athlete_id::text||':'||h.provider||':'||h.external_id||':'||ordinality::text,a.display_name,
 h.provider||' · '||coalesce(p->>'meeting',p->>'event',p->>'discipline','Imported result'),
 ${verified("p->>'verificationStatus'", "h.provider")},h.captured_at,${athleteLink("h.athlete_id")}
 from histories h join a on a.id=h.athlete_id cross join lateral jsonb_array_elements(h.performances) with ordinality x(p,ordinality)
 where coalesce(p->>'profileExcluded','false')<>'true' and coalesce(p->>'syntheticTest','false')<>'true'
 union all select 'Requests to check results: '||${stateLabel("v.status")},'v:'||v.id::text,a.display_name,'Request to check a result',v.status,v.created_at,${athleteLink("v.athlete_id")}
 from athlete_result_verification_requests v join a on a.id=v.athlete_id
 `,
    "The checking labels currently saved for results, followed by requests asking staff to check a result.",
    [
      "Checking a result against its source, approving it as staff, and confirming who owns a profile are separate checks. Accepted under World Athletics rule means the existing official-record rule applies; it does not mean someone has just checked it manually.",
      "Main results and imported histories may contain the same performance. No check recorded includes results with no saved checking label. A rejected checking request does not prove a result is false. Age columns show when entries or requests were saved, not when results were verified.",
    ],
  );
}
function gaps(f: OperationInput): QuerySpec {
  const p = `select a.id,a.display_name,a.gender,a.country,a.county,
 coalesce(nullif(${known("private.nationality")},'Unknown'),${statedNationalitySql},${sourceNationalitySql("a.profile_details")},nullif(${known("a.nation")},'Unknown'),'Unknown') nationality,
 (exists(select 1 from r where r.athlete_id=a.id and ${known("r.sport")}<>'Unknown')
 or exists(select 1 from histories h where h.athlete_id=a.id and cardinality(athlete_history_sports_v5(h.provider,h.performances))>0)
 or (${profileSportEvidencePredicateSql()} and cardinality(athlete_profile_sports_v3(a.profile_details))>0)
 or exists(select 1 from athlete_account_links l join athlete_sport_profiles sp on sp.user_id=l.user_id where l.athlete_id=a.id and l.status='active' and ${known("sp.sport_code")}<>'Unknown')) has_sport
 from a left join athlete_account_links owner on owner.athlete_id=a.id and owner.status='active'
 left join athlete_private_profiles private on private.user_id=owner.user_id`;
  const rows = `select 'Athletes: missing '||gap bucket,'a:'||p.id::text||':'||gap id,p.display_name label,'Recorded profile detail' detail,'Missing' status,null::timestamptz created,${athleteLink("p.id")} href
 from profile_gaps p cross join lateral (values ('gender',${known("p.gender")}='Unknown'),('nationality',p.nationality='Unknown'),('sport',not p.has_sport),('country',${known("p.country")}='Unknown'),('county',${known("p.county")}='Unknown')) missing(gap,absent) where absent
 union all select 'Events: missing '||gap,'e:'||e.id::text||':'||gap,e.name,'Saved event','Missing',e.created_at,'/admin/event-register'
 from e cross join lateral (values ('official website',trim(e.website)=''),('country',${known("e.country")}='Unknown'),('county',${known("e.county")}='Unknown'),('sport',${known("e.sport")}='Unknown'),
 ('confirmed race date',not exists(select 1 from d where d.event_id=e.id and d.event_date is not null)),
 ('distance',not exists(select 1 from event_distances x where x.event_id=e.id and ${known("x.distance_code")}<>'Unknown') and not exists(select 1 from d where d.event_id=e.id and ${known("d.distance_code")}<>'Unknown'))) missing(gap,absent) where absent
 union all select 'Races: date to be confirmed','d:'||d.id::text,e.name,coalesce(d.event_date::text,'No date')||' · '||d.distance_code,d.status,d.stats_created_at,'/admin/event-register' from d join e on e.id=d.event_id where d.status='TBC'`;
  const report = queueReport(
    f,
    rows,
    "Missing information to research and complete. Select See entries to find the affected athletes or events.",
    [
      "An athlete or event can appear in several groups if several details are missing. Nationality is not guessed from where someone lives, their club or race location. Blank and Unknown values both count as missing.",
    ],
  );
  report.ctes = `profile_gaps as (${p}),${report.ctes}`;
  return report;
}
function duplicates(f: OperationInput): QuerySpec {
  const ctes = `same_names as (select lower(regexp_replace(trim(display_name),'[[:space:]]+',' ','g')) name from a where parent_athlete_id is null and length(trim(display_name))>1 group by 1 having count(*)>1),
 row_conflicts as (select edition_id,trim(bib) bib,split_part(source_url,'#',1) source from r where trim(coalesce(bib,''))<>'' and trim(coalesce(source_url,''))<>'' group by 1,2,3 having count(distinct athlete_id)>1)`;
  const report = queueReport(
    f,
    `
 select 'Athletes sharing a name: check before merging' bucket,'a:'||a.id::text id,a.display_name label,concat_ws(' · ',a.gender,a.country,a.source_club_name) detail,'Possible match only' status,a.created_at created,${athleteLink("a.id")} href
 from a join same_names n on n.name=lower(regexp_replace(trim(a.display_name),'[[:space:]]+',' ','g')) where a.parent_athlete_id is null
 union all select 'One source result linked to different athletes','r:'||r.id::text,r.athlete_name||' — '||r.event_name,'Bib '||r.bib,'Review source row',r.stats_created_at,${athleteLink("r.athlete_id")} from r join row_conflicts c on c.edition_id=r.edition_id and c.bib=trim(r.bib) and c.source=split_part(r.source_url,'#',1)
 union all select 'Collected events flagged as duplicates','f:'||id,event_name,event_date,status,created_at,'/admin/fixture-review' from fixture_candidates where status='duplicate'
 union all select 'Race searches flagged as duplicates','c:'||c.id::text,c.event_slug,c.reason,c.status,c.created_at,'/admin/race-collector' from race_collector_candidates c where c.status='duplicate' and not exists(select 1 from race_collector_duplicate_reviews rv where rv.candidate_id=c.id and rv.undone_at is null)
 union all select 'Club findings flagged as duplicates','cl:'||c.id::text,cl.name,'Suggested entry '||c.id::text,c.status,c.created_at,'/admin/club-scanner' from club_scan_candidates c join clubs cl on cl.id=c.club_id where c.status='duplicate'
 `,
    "Profiles, results and collected items that may refer to the same thing. Check the evidence before merging or removing anything.",
    [
      "Athletes sharing a name may be different people. Nothing is merged automatically from this report. Profiles already merged into another profile are left out of the name check.",
      "Result conflicts mean the same race date, distance, results-page link and bib number are linked to different athletes. We count affected entries: two profiles to compare count as two. Some duplicate findings were already stopped from being published.",
    ],
  );
  report.ctes = `${ctes},${report.ctes}`;
  return report;
}
function clubs(f: OperationInput): QuerySpec {
  return {
    description:
      "Athletes currently linked to each club, their saved results, and applications to manage a club page.",
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
        : `select id::text key,name label,id::text drill,country,athletes,results,observations,empty,applications,case when represented then 'Approved club manager' else 'No approved club manager' end representative,missing from club_stats`,
    columns:
      f.mode === "records"
        ? [
            col("label", "Athlete"),
            col("results", "Main results saved", true),
            col("observations", "Results in imported histories", true),
          ]
        : [
            col("label", "Club"),
            col("country", "Country"),
            col("athletes", "Athletes", true),
            col("results", "Main results saved", true),
            col("observations", "Results in imported histories", true),
            col("empty", "Athletes without results", true),
            col("applications", "Applications waiting", true),
            col("representative", "Who can manage the page"),
            col("missing", "Missing information"),
          ],
    metrics: `jsonb_build_array(jsonb_build_object('label','Clubs','href','/admin/club-scanner','value',(select count(*) from club_stats)),jsonb_build_object('label','Clubs missing information','href','/admin/club-scanner','value',(select count(*) from club_stats where missing<>'None')),jsonb_build_object('label','Applications awaiting review','href','/admin/club-registrations','value',(select count(*) from club_registration_applications where status in ('pending','needs_changes'))))`,
    notes: [
      "Results belong to athletes linked through their first or second club. Some results may have been achieved before they joined that club. Athletes can appear under more than one club. Main results and imported histories may include the same performances.",
      "The application total also includes requests for new clubs that do not have a club page yet. Use Club applications to review them.",
    ],
  };
}
function backlog(f: OperationInput): QuerySpec {
  return queueReport(
    f,
    `
 select 'Events found: '||${stateLabel("status")} bucket,'fixture:'||id id,event_name label,event_date detail,status,created_at created,'/admin/fixture-review' href
 from fixture_candidates where status in ('staged','eligible','blocked','failed') and review_status<>'rejected'
 union all select 'Race searches: '||${stateLabel("status")},'race:'||id::text,event_slug,reason,status,created_at,'/admin/race-collector' from race_collector_candidates where status in ('review','held')
 union all select 'Club findings: '||${stateLabel("c.status")},'club:'||c.id::text,cl.name,'Suggested entry '||c.id::text,c.status,c.created_at,'/admin/club-scanner' from club_scan_candidates c join clubs cl on cl.id=c.club_id where c.status in ('proposed','held','approved')
 union all select 'Result collection: '||${stateLabel("status")},'import:'||id,source_name,concat(rows_imported,' entries added; ',error_count,' errors'),status,created_at,'/admin/result-archive' from result_ingestion_runs where status in ('queued','processing','completed_with_errors','failed')
 union all select 'Club applications: '||${stateLabel("app.status")},'application:'||app.id::text,coalesce(c.name,'New club application'),'Application to manage a club page',app.status,coalesce(app.submitted_at,app.created_at),'/admin/club-registrations' from club_registration_applications app left join clubs c on c.id=app.club_id where app.status in ('pending','needs_changes')
 `,
    "Events, club findings, result collection attempts and club applications waiting for checking, a fix or a decision.",
    [
      "Private profiles and unpublished histories are not automatically included as waiting work. This report does not make anything public.",
      "The same work can also appear in other reports. Age starts when the item or application was first saved, not when it was last retried. Rejected event suggestions are left out.",
    ],
  );
}
function activity(f: OperationInput): QuerySpec {
  return {
    description:
      "Count accounts that took each action in the chosen period. Each account counts once per action, using UK dates.",
    ctes: `stages as (
 select 'New registrations' bucket,u.id,u.name label,u."createdAt" happened,'Registered account' detail from "user" u where not athrecs_is_test_user(u.id) and u."createdAt">=${start}
 union all select 'Accounts claiming a profile',u.id,u.name,min(l.linked_at),'Account currently linked to a profile' from athlete_account_links l join a on a.id=l.athlete_id join "user" u on u.id=l.user_id where l.status='active' and l.linked_at>=${start} and not athrecs_is_test_user(u.id) group by u.id
 union all select 'Athletes adding results',u.id,u.name,min(c.created_at),'Added at least one result when confirming a profile' from athlete_profile_result_confirmations c join a on a.id=c.athlete_id join "user" u on u.id=c.user_id where c.added_count>0 and c.created_at>=${start} and not athrecs_is_test_user(u.id) group by u.id
 union all select 'Accounts signing in',u.id,u.name,l.last_sign_in_at,'Includes people who signed in when joining' from athlete_login_activity l join "user" u on u.id=l.user_id where l.last_sign_in_at>=${start} and not athrecs_is_test_user(u.id)
 )`,
    rows:
      f.mode === "records"
        ? `select id key,label,detail,happened::text status,'/admin/athlete-accounts' href from stages where bucket=$2`
        : `select bucket key,bucket label,bucket drill,count(distinct id) count from stages group by bucket
 union all select bucket,bucket,bucket,0 from (values('New registrations'),('Accounts claiming a profile'),('Athletes adding results'),('Accounts signing in')) s(bucket) where not exists(select 1 from stages t where t.bucket=s.bucket)`,
    columns:
      f.mode === "records"
        ? recordCols
        : [col("label", "Activity"), col("count", "Accounts (each counted once)", true)],
    notes: [
      "One account can appear in several groups. Someone signing in may have registered before this period. Test accounts are left out; staff accounts are included. These totals do not show which visitors became members.",
      "Athletes adding results counts members who added at least one result through profile confirmation. Results collected automatically or added by staff are not counted as member activity here. Website visit figures use the dates shown above them.",
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
  return withDiscoveryRead(sql, async (tx) => {
    const [row] = await tx.query<{
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
              `Tracking when race dates and results were added or edited began on ${new Date(row.tracking).toLocaleString("en-GB", { timeZone: "Europe/London" })} (UK time).`,
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
  });
}
