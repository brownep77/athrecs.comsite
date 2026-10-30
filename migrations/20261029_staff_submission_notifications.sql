-- Future member submissions only. Notification snapshots commit with the submitted
-- record; this migration does not replay historical submissions or send email.
create table staff_submission_alert_deliveries (
  id bigserial primary key,
  category text not null check (category in ('support','results','partnerships')),
  event_kind text not null check (event_kind in (
    'profile_correction','result_proposal','result_verification','club_application',
    'partner_registration','partner_opportunity','partner_application','private_profile_save')),
  event_key text not null check (length(event_key) between 1 and 500),
  actor_user_id text not null references "user"(id) on delete cascade,
  recipient text not null,
  submission jsonb not null check (jsonb_typeof(submission)='object'),
  review_path text not null check (review_path ~ '^/admin/(athlete-directory|athlete-workspace|athlete-accounts|club-registrations|partnerships)([?#].*)?$'),
  created_at timestamptz not null default now(),
  email_payload jsonb,
  attempts integer not null default 0 check (attempts>=0),
  first_attempt_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_id text,
  needs_review boolean not null default false,
  last_error text,
  unique(event_kind,event_key,recipient)
);
create index staff_submission_alert_pending on staff_submission_alert_deliveries(next_attempt_at,id)
  where sent_at is null and not needs_review;
alter table staff_submission_alert_deliveries enable row level security;
revoke all on staff_submission_alert_deliveries from public;

create function queue_staff_submission_alert(
  p_category text,p_event_kind text,p_event_key text,p_actor_user_id text,
  p_submission jsonb,p_review_path text
) returns void language plpgsql security invoker set search_path=public as $$
declare synthetic boolean;
begin
  if jsonb_typeof(p_submission->'fields') is distinct from 'array' then
    raise exception 'A submission notification requires explicit fields';
  end if;
  synthetic := athrecs_is_test_user(p_actor_user_id)
    or coalesce(p_submission->>'syntheticTest'='true',false);
  insert into staff_submission_alert_deliveries
    (category,event_kind,event_key,actor_user_id,recipient,submission,review_path)
  select p_category,p_event_kind,p_event_key,p_actor_user_id,r.recipient,
    p_submission || jsonb_build_object('name',u.name,'email',u.email,'syntheticTest',synthetic),p_review_path
  from "user" u cross join athrecs_notification_recipients(p_category,synthetic) r
  where u.id=p_actor_user_id
    and (not synthetic or r.recipient='paul@athrecs.com')
  on conflict(event_kind,event_key,recipient) do nothing;
end;
$$;
revoke all on function queue_staff_submission_alert(text,text,text,text,jsonb,text) from public;

-- Each branch selects the submitted fields deliberately. Never serialize an entire
-- account, result row, private evidence document, or authentication record into mail.
create function queue_staff_submission_from_record() returns trigger
language plpgsql security invoker set search_path=public as $$
declare
  fields jsonb;
  results jsonb;
  actor text;
  company_name text;
  opportunity_title text;
  synthetic boolean := false;
begin
  if tg_table_name='athlete_profile_edit_suggestions' then
    if new.status<>'pending' then return new; end if;
    fields := jsonb_build_array(
      jsonb_build_object('label','Profile','value',new.profile_slug),
      jsonb_build_object('label','Suggested correction','value',new.suggestion),
      jsonb_build_object('label','Supporting link','value',new.evidence_url));
    perform queue_staff_submission_alert('support','profile_correction',new.id::text,new.user_id,
      jsonb_build_object('fields',fields,'status','Awaiting staff review'),'/admin/athlete-directory');

  elsif tg_table_name='athlete_result_proposals' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'Race',entry->'race','Date',entry->'date','Distance',entry->'distance',
      'Time',entry->'time','Timing basis',entry->'timingBasis','Bib',entry->'bib',
      'Overall place',entry->'place','Source link',entry->'sourceUrl') order by n),'[]'::jsonb)
    into results from jsonb_array_elements(new.entries) with ordinality as r(entry,n);
    fields := jsonb_build_array(
      jsonb_build_object('label','Athlete record','value',new.athlete_id),
      jsonb_build_object('label','Source link','value',new.source_url),
      jsonb_build_object('label','Proposed results','value',results),
      jsonb_build_object('label','Submitted text','value',new.original_text));
    synthetic := exists(select 1 from athrecs_test_athletes where athlete_id=new.athlete_id);
    perform queue_staff_submission_alert('results','result_proposal',new.id::text,new.submitted_by,
      jsonb_build_object('fields',fields,'status','Awaiting source and identity review','syntheticTest',synthetic),
      '/admin/athlete-workspace'||case when new.athlete_id is null then '' else '?athleteId='||new.athlete_id::text end);

  elsif tg_table_name='athlete_result_verification_requests' then
    if new.status<>'pending' then return new; end if;
    if tg_op='UPDATE' then
      if (old.status,old.requested_by,old.athlete_note,old.evidence_url,old.result_version)
        is not distinct from (new.status,new.requested_by,new.athlete_note,new.evidence_url,new.result_version)
        then return new; end if;
    end if;
    fields := jsonb_build_array(
      jsonb_build_object('label','Athlete','value',new.result_snapshot->'athleteName'),
      jsonb_build_object('label','Race','value',new.result_snapshot->'race'),
      jsonb_build_object('label','Date','value',new.result_snapshot->'date'),
      jsonb_build_object('label','Distance','value',new.result_snapshot->'distance'),
      jsonb_build_object('label','Recorded performance','value',case
        when jsonb_typeof(new.result_snapshot->'performance')='number'
        then to_jsonb((new.result_snapshot->>'performance')||' seconds')
        else new.result_snapshot->'performance' end),
      jsonb_build_object('label','Result reference','value',new.result_key),
      jsonb_build_object('label','Athlete note','value',new.athlete_note),
      jsonb_build_object('label','Supporting link','value',new.evidence_url));
    synthetic := exists(select 1 from athrecs_test_athletes where athlete_id=new.athlete_id);
    perform queue_staff_submission_alert('results','result_verification',new.id::text||':'||new.revision::text,new.requested_by,
      jsonb_build_object('fields',fields,'status','Awaiting staff verification','syntheticTest',synthetic),
      '/admin/athlete-workspace?athleteId='||new.athlete_id::text||'#result-verification');

  elsif tg_table_name='club_registration_applications' then
    if new.status<>'pending' or new.submitted_at is null then return new; end if;
    if tg_op='UPDATE' then
      if (old.status,old.submitted_at,old.details) is not distinct from (new.status,new.submitted_at,new.details)
        then return new; end if;
    end if;
    fields := jsonb_build_array(
      jsonb_build_object('label','Club','value',new.details->'clubName'),
      jsonb_build_object('label','Existing club record','value',new.club_id),
      jsonb_build_object('label','Town or city','value',new.details->'city'),
      jsonb_build_object('label','County','value',new.details->'county'),
      jsonb_build_object('label','Country','value',new.details->'country'),
      jsonb_build_object('label','Sports','value',new.details->'sports'),
      jsonb_build_object('label','Website','value',new.details->'website'),
      jsonb_build_object('label','Affiliation','value',new.details->'affiliation'),
      jsonb_build_object('label','Governing body','value',new.details->'governingBody'),
      jsonb_build_object('label','Affiliation number','value',new.details->'affiliationNumber'),
      jsonb_build_object('label','Representative','value',new.details->'representativeName'),
      jsonb_build_object('label','Representative role','value',new.details->'representativeRole'),
      jsonb_build_object('label','Club contact email','value',new.details->'clubEmail'),
      jsonb_build_object('label','Contact phone','value',new.details->'phone'),
      jsonb_build_object('label','Verification method','value',new.details->'verificationMethod'),
      jsonb_build_object('label','Supporting link','value',new.details->'evidenceUrl'),
      jsonb_build_object('label','Authority details','value',new.details->'authorityDetails'));
    perform queue_staff_submission_alert('partnerships','club_application',new.id::text||':'||new.revision::text,new.user_id,
      jsonb_build_object('fields',fields,'status','Awaiting representative verification'),'/admin/club-registrations');

  elsif tg_table_name='partner_brands' then
    if new.status<>'pending' then return new; end if;
    if tg_op='UPDATE' then
      if (old.status,old.name,old.website,old.category,old.description,old.sports,old.markets,old.contact_name,old.contact_role)
        is not distinct from (new.status,new.name,new.website,new.category,new.description,new.sports,new.markets,new.contact_name,new.contact_role)
        then return new; end if;
    end if;
    fields := jsonb_build_array(
      jsonb_build_object('label','Company','value',new.name),
      jsonb_build_object('label','Website','value',new.website),
      jsonb_build_object('label','Category','value',new.category),
      jsonb_build_object('label','Description','value',new.description),
      jsonb_build_object('label','Sports','value',new.sports),
      jsonb_build_object('label','Markets','value',new.markets),
      jsonb_build_object('label','Contact name','value',new.contact_name),
      jsonb_build_object('label','Contact role','value',new.contact_role));
    perform queue_staff_submission_alert('partnerships','partner_registration',new.id::text||':'||new.revision::text,new.owner_user_id,
      jsonb_build_object('fields',fields,'status','Awaiting company review'),'/admin/partnerships');

  elsif tg_table_name='partner_opportunities' then
    if new.status<>'pending' then return new; end if;
    if tg_op='UPDATE' then
      if (old.status,old.title,old.kind,old.audience,old.description,old.benefits,old.requirements,old.sports,old.markets,old.closing_date)
        is not distinct from (new.status,new.title,new.kind,new.audience,new.description,new.benefits,new.requirements,new.sports,new.markets,new.closing_date)
        then return new; end if;
    end if;
    select owner_user_id,name into actor,company_name from partner_brands where id=new.brand_id;
    fields := jsonb_build_array(
      jsonb_build_object('label','Company','value',company_name),
      jsonb_build_object('label','Opportunity','value',new.title),
      jsonb_build_object('label','Type','value',new.kind),
      jsonb_build_object('label','Audience','value',new.audience),
      jsonb_build_object('label','Description','value',new.description),
      jsonb_build_object('label','Benefits','value',new.benefits),
      jsonb_build_object('label','Requirements','value',new.requirements),
      jsonb_build_object('label','Sports','value',new.sports),
      jsonb_build_object('label','Markets','value',new.markets),
      jsonb_build_object('label','Closing date','value',new.closing_date));
    perform queue_staff_submission_alert('partnerships','partner_opportunity',new.id::text||':'||new.revision::text,actor,
      jsonb_build_object('fields',fields,'status','Awaiting opportunity review'),'/admin/partnerships');

  elsif tg_table_name='partner_applications' then
    if new.status<>'pending' then return new; end if;
    select o.title,b.name into opportunity_title,company_name from partner_opportunities o
      join partner_brands b on b.id=o.brand_id where o.id=new.opportunity_id;
    fields := jsonb_build_array(
      jsonb_build_object('label','Company','value',company_name),
      jsonb_build_object('label','Opportunity','value',opportunity_title),
      jsonb_build_object('label','Applicant','value',new.display_name),
      jsonb_build_object('label','Applicant type','value',new.applicant_kind),
      jsonb_build_object('label','Athlete record','value',new.athlete_id),
      jsonb_build_object('label','Club website','value',new.club_website),
      jsonb_build_object('label','Submitted message','value',new.message));
    perform queue_staff_submission_alert('partnerships','partner_application',new.id::text,new.user_id,
      jsonb_build_object('fields',fields,'status','Private application awaiting staff review'),'/admin/partnerships');
  end if;
  return new;
end;
$$;
revoke all on function queue_staff_submission_from_record() from public;

create trigger staff_profile_correction_alert after insert on athlete_profile_edit_suggestions
  for each row execute function queue_staff_submission_from_record();
create trigger staff_result_proposal_alert after insert on athlete_result_proposals
  for each row execute function queue_staff_submission_from_record();
create trigger staff_result_verification_alert after insert or update on athlete_result_verification_requests
  for each row execute function queue_staff_submission_from_record();
create trigger staff_club_application_alert after insert or update on club_registration_applications
  for each row execute function queue_staff_submission_from_record();
create trigger staff_partner_registration_alert after insert or update on partner_brands
  for each row execute function queue_staff_submission_from_record();
create trigger staff_partner_opportunity_alert after insert or update on partner_opportunities
  for each row execute function queue_staff_submission_from_record();
create trigger staff_partner_application_alert after insert on partner_applications
  for each row execute function queue_staff_submission_from_record();

comment on table staff_submission_alert_deliveries is
  'Private, immutable submission snapshots and per-recipient email delivery state. New submissions only; email success does not publish, approve or verify any data.';
