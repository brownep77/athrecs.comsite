import fs from "node:fs";
const dir = new URL("./", import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL("manifest.json", dir), "utf8"));
const literal = JSON.stringify(manifest).replaceAll("'", "''");
const sql = `-- Explicit, repeatable publication after migration 0037 and the marked-results UI are live.
-- The existing ATH-000128 is updated; no athlete record is created or merged.
do $publish$
declare
  payload jsonb := '${literal}'::jsonb;
  item jsonb;
  target integer;
  event_key integer;
  edition_key integer;
  result_key integer;
  before_snapshot jsonb;
  history jsonb;
begin
  select id into strict target from athletes
  where id=128 and slug='joe-skipper' and display_name='Joe Skipper' for update;
  if exists(select 1 from athlete_account_links where athlete_id=target and status='active') then
    raise exception 'Profile ownership changed: use owner publication settings';
  end if;
  if exists(select 1 from athletes where id<>target and
    (lower(display_name) in ('joe skipper','joseph skipper') or slug='joe-skipper')) then
    raise exception 'Possible duplicate athlete requires reconciliation';
  end if;
  if exists(select 1 from athlete_source_identities where provider='powerof10' and external_id='366603' and athlete_id<>target) then
    raise exception 'Power of 10 identity is linked to a different athlete';
  end if;
  select jsonb_build_object('profile',to_jsonb(a),'results',
    (select jsonb_agg(to_jsonb(r)) from results r where r.athlete_id=target))
    into before_snapshot from athletes a where a.id=target;
  for item in select value from jsonb_array_elements(payload->'results') loop
    event_key := null;
    select id into event_key from events where slug=item->>'slug';
    if event_key is null then
      insert into events(slug,name,sport,country,county,city,area,surface,summary,source_url)
      values(item->>'slug',item->>'name',item->>'sport',item->>'country','',item->>'city','',item->>'surface',
        'Historical race result with linked source evidence.',item->>'source')
      on conflict(slug) do nothing;
      select id into strict event_key from events where slug=item->>'slug';
    end if;
    if not exists(select 1 from events where id=event_key and sport=item->>'sport') then
      raise exception 'Event sport conflict for %', item->>'slug';
    end if;
    insert into event_distances(event_id,distance_code) values(event_key,item->>'code') on conflict do nothing;
    insert into editions(event_id,event_date,distance_code,distance_km,status,source_url,results_official_url)
    values(event_key,(item->>'date')::date,item->>'code',(item->>'km')::double precision,'Finished',item->>'source',item->>'source')
    on conflict(event_id,event_date,distance_code) do nothing;
    select id into strict edition_key from editions where event_id=event_key and event_date=(item->>'date')::date and distance_code=item->>'code';
    insert into results(edition_id,athlete_id,status,finish_time_seconds,overall_place,result_source,source_url,result_visibility,result_details)
    values(edition_key,target,item->>'status',(item->>'seconds')::integer,(item->>'place')::integer,
      'Reviewed source history',item->>'source','public',item->'details')
    on conflict(edition_id,athlete_id) do update set
      status=excluded.status,finish_time_seconds=excluded.finish_time_seconds,
      overall_place=excluded.overall_place,source_url=excluded.source_url,
      result_source=excluded.result_source,result_visibility='public',
      result_details=results.result_details || excluded.result_details
    returning id into result_key;
    insert into result_source_references(result_id,source_url,source_name)
    values(result_key,item->>'source','Reviewed performance source') on conflict do nothing;
    if item->'details' ? 'disqualification' then
      insert into result_source_references(result_id,source_url,source_name)
      values(result_key,payload->'decision'->>'sourceUrl','ITA disqualification announcement, 4 September 2026') on conflict do nothing;
    end if;
  end loop;
  -- The legacy 2024 Wroxham row lacks a matching dated source. The 2026 page
  -- has no Joe Skipper result. Do not expose these unsubstantiated private rows.
  if exists(select 1 from results where id in (12255,11181) and athlete_id=target and result_visibility<>'private') then
    raise exception 'Withheld Wroxham entries require a fresh publication review';
  end if;
  history := payload->'sourceHistory';
  insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
  values(target,history->>'provider',history->>'externalId',history->>'sourceUrl',(history->>'capturedAt')::timestamptz,false,
    array(select jsonb_array_elements_text(history->'yearsExpected')::integer),
    array(select jsonb_array_elements_text(history->'yearsCaptured')::integer),history->'performances',now())
  on conflict(athlete_id,provider,external_id) do update set
    captured_at=excluded.captured_at,performances=excluded.performances,published_at=excluded.published_at;
  insert into athlete_source_identities(provider,external_id,athlete_id,source_url)
    values('powerof10','366603',target,history->>'sourceUrl') on conflict do nothing;
  update athletes set profile_visibility='public',
    bio='British endurance athlete whose sourced record includes running, cycling time trials, triathlon and duathlon. Eight IRONMAN wins are recorded before May 2025. Swim, bike and run splits are shown within their parent races. PTO also reports 325.55 miles for his 2020 12-hour cycling ride. Competitive results covered by the ITA whereabouts decision are retained with a disqualification marker. This is a selected sourced history; no standalone swimming race has been verified.',
    profile_roles='Triathlete,Cyclist,Runner',
    profile_source_checked_at='2026-09-19',
    profile_details=profile_details || '{"nationality":"British","birthdayVisibility":"hidden"}'::jsonb
    where id=target;
  if exists(select 1 from results r join editions ed on ed.id=r.edition_id
    where r.athlete_id=target and r.result_visibility='public' and ed.event_date>='2025-05-15'
      and (r.status<>'DQ' or r.result_details->'disqualification'->>'reason' is distinct from 'whereabouts')) then
    raise exception 'An affected competitive result is missing its disqualification';
  end if;
  if (select count(*) from results where athlete_id=target and result_visibility='public') <> 44 then
    raise exception 'Unexpected publication count; recheck concurrent athlete edits';
  end if;
  insert into network_audit_log(action,entity_type,entity_id,before_value,after_value,note)
    select 'athlete.publish_sourced_history','athlete',target::text,before_snapshot,
      jsonb_build_object('profile',to_jsonb(a),'results',(select jsonb_agg(to_jsonb(r)) from results r where r.athlete_id=target)),
      'User-authorized Joe Skipper upload; reused ATH-000128 after duplicate checks. 44 result entries, 12 whereabouts disqualifications, 2 decimal track performances. Two unsubstantiated Wroxham legacy entries remain private. Official ITA decision dated 17 August 2026, announcement 4 September 2026.'
    from athletes a where a.id=target;
end
$publish$;
`;
fs.writeFileSync(new URL("publish.sql", dir), sql);
console.log("Generated reviewed publication SQL for " + manifest.results.length + " results.");
