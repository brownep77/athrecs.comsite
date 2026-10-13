-- Owner-authorised fictional fixtures. Kept outside canonical events/editions/results.
create table athrecs_test_athletes (
  athlete_id integer primary key references athletes(id),
  user_id text unique references "user"(id),
  email text not null unique check(email=lower(trim(email))),
  created_at timestamptz not null default now()
);
create table athrecs_test_events (
  id integer primary key check(id between 1 and 10),
  name text not null unique,
  source_result_id integer not null unique references source_history_claim_results(id),
  check(name='Test '||id::text)
);
create table athrecs_test_registrations (
  user_id text not null references "user"(id),
  event_id integer not null references athrecs_test_events(id),
  registered boolean not null default true,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key(user_id,event_id)
);
create table athrecs_test_registration_receipts (
  id uuid primary key,
  user_id text not null references "user"(id),
  event_id integer not null references athrecs_test_events(id),
  version integer not null,
  registered boolean not null,
  sent_at timestamptz,
  first_attempt_at timestamptz,
  retry_after timestamptz not null default now(),
  needs_review boolean not null default false,
  unique(user_id,event_id,version)
);

-- Reuse the existing authorised test identity; never create a second one.
insert into athrecs_test_athletes(athlete_id,email)
select id,'paul@athrecs.com' from athletes where slug='test-test-fictional-male-20261013'
  and profile_details->>'syntheticTest'='true' and profile_details->>'testOwner'='paul@athrecs.com';

update athrecs_test_athletes t set user_id=u.id from "user" u where lower(trim(u.email))=t.email;

create function athrecs_is_test_user(uid text) returns boolean language sql stable as $$
 select exists(select 1 from "user" u join athrecs_test_athletes t on (t.email=lower(trim(u.email)) or t.user_id=u.id) where u.id=uid)
$$;
create function athrecs_test_access(uid text, aid integer) returns boolean language sql stable as $$
 select case when exists(select 1 from athrecs_test_athletes where athlete_id=aid)
   then exists(select 1 from "user" u join athrecs_test_athletes t on t.email=lower(trim(u.email)) where u.id=uid and u."emailVerified" and t.athlete_id=aid)
   else not athrecs_is_test_user(uid) end
$$;

-- No public profile, canonical result, real-account ownership or public share can
-- accidentally turn the synthetic fixture into real sporting data.
create function guard_athrecs_test_athlete() returns trigger language plpgsql as $$
begin
 if exists(select 1 from athrecs_test_athletes where athlete_id=new.id) then
  if new.profile_visibility<>'private' or new.profile_type='Public figure' or new.parent_athlete_id is not null
    or new.profile_details->>'syntheticTest' is distinct from 'true'
    or new.slug<>'test-test-fictional-male-20261013' then
   raise exception 'Fictional test athletes must stay private and separate';
  end if;
 end if;
 return new;
end $$;
create trigger athrecs_test_athlete_guard before update on athletes for each row execute function guard_athrecs_test_athlete();
create function guard_athrecs_test_record() returns trigger language plpgsql as $$
begin
 if tg_op='UPDATE' and tg_table_name in ('athlete_source_histories','source_history_claim_results','results') then
  if exists(select 1 from athrecs_test_athletes where athlete_id=old.athlete_id) and new.athlete_id<>old.athlete_id then
   raise exception 'Fictional test evidence cannot be reassigned to a genuine athlete';
  end if;
 end if;
 if tg_table_name='athlete_public_shares' then
  if athrecs_is_test_user(new.user_id) then
   new.search_indexable := false;
   if new.enabled then
   raise exception 'Fictional test accounts cannot publish or enable search indexing';
   end if;
  end if;
 elsif tg_table_name in ('result_claims','athlete_account_links') then
  if not athrecs_test_access(case when tg_table_name='result_claims' then to_jsonb(new)->>'claimant_user_id' else to_jsonb(new)->>'user_id' end,new.athlete_id) then
   raise exception 'Fictional test results are restricted to the approved test account';
  end if;
 elsif exists(select 1 from athrecs_test_athletes where athlete_id=new.athlete_id) then
  if tg_table_name='results' then
   raise exception 'Fictional test results cannot enter the canonical results catalogue';
  elsif tg_table_name='athlete_source_histories' then
   if new.published_at is not null then raise exception 'Fictional test histories cannot be published'; end if;
   if exists(select 1 from jsonb_array_elements(new.performances)p where p->>'syntheticTest' is distinct from 'true' or p->>'verificationStatus' is distinct from 'unverified') then
    raise exception 'Fictional history rows must retain their unverified test label';
   end if;
  elsif tg_table_name='source_history_claim_results' then
   if new.performance->>'syntheticTest' is distinct from 'true' or new.performance->>'verificationStatus' is distinct from 'unverified' then
    raise exception 'Fictional performances must retain their unverified test label';
   end if;
  elsif tg_table_name='athlete_claim_invitations' then
   if new.recipient_email is distinct from (select email from athrecs_test_athletes where athlete_id=new.athlete_id) then
    raise exception 'Test invitations can only reach the approved test email';
   end if;
  end if;
 end if;
 return new;
end $$;
create trigger athrecs_test_share_guard before insert or update on athlete_public_shares for each row execute function guard_athrecs_test_record();
create trigger athrecs_test_claim_guard before insert or update on result_claims for each row execute function guard_athrecs_test_record();
create trigger athrecs_test_link_guard before insert or update on athlete_account_links for each row execute function guard_athrecs_test_record();
create trigger athrecs_test_result_guard before insert or update on results for each row execute function guard_athrecs_test_record();
create trigger athrecs_test_history_guard before insert or update on athlete_source_histories for each row execute function guard_athrecs_test_record();
create trigger athrecs_test_source_guard before insert or update on source_history_claim_results for each row execute function guard_athrecs_test_record();
create trigger athrecs_test_invitation_guard before insert or update on athlete_claim_invitations for each row execute function guard_athrecs_test_record();

-- This migration contains invented data solely because the owner explicitly
-- requested Test 1..10. None is independently verified or a real race entry.
insert into source_history_claim_results(athlete_id,provider,external_id,source_key,source_url,performance,available)
select h.athlete_id,h.provider,h.external_id,p#>>'{archiveReference,sourceRow}',h.source_url,p,true
from athlete_source_histories h join athrecs_test_athletes t on t.athlete_id=h.athlete_id
cross join lateral jsonb_array_elements(h.performances)p
where h.provider='athrecs-private-system-test' and p->>'syntheticTest'='true'
on conflict(provider,external_id,source_key) do nothing;
insert into athrecs_test_events(id,name,source_result_id)
select (s.performance->>'testSequence')::int,s.performance->>'meeting',s.id from source_history_claim_results s
join athrecs_test_athletes t on t.athlete_id=s.athlete_id where s.provider='athrecs-private-system-test';

create or replace view athlete_claimable_results as
select r.id,r.athlete_id,r.edition_id,e.name event_name,e.slug event_slug,e.sport event_sport,
  d.event_date::text event_date,d.distance_code,d.distance_km,e.surface,e.country event_country,e.city event_city,
  r.finish_time_seconds,r.chip_time_seconds,r.gun_time_seconds,r.overall_place,r.gender_place,r.category_place,
  r.bib,r.category,r.source_url,r.result_source,r.result_details,r.status,
  coalesce(nullif(r.result_details->>'clubAtRace',''),c.name,a.source_club_name) club_name,
  null::text age_at_race,
  r.status='finished' and coalesce(r.result_details->>'profileExcluded','false')<>'true'
    and a.parent_athlete_id is null available
from results r join athletes a on a.id=r.athlete_id
join editions d on d.id=r.edition_id join events e on e.id=d.event_id left join clubs c on c.id=a.club_id
union all
select -s.id,s.athlete_id,0,s.performance->>'meeting',coalesce(s.performance->>'eventSlug',''),'Running',
  coalesce(nullif(s.performance->>'date',''),nullif(s.performance->>'dateLabel',''),s.performance->>'year'),
  s.performance->>'discipline',case when s.performance->>'syntheticTest'='true' then (s.performance->>'distanceKm')::numeric else 10::numeric end,
  case when s.performance->>'discipline' ilike '%virtual%' then 'Virtual' else 'Road' end,'','',
  claim_time_seconds(s.performance->>'performance'),
  case when s.performance->>'syntheticTest'='true' then claim_time_seconds(s.performance#>>'{archiveReference,original,Chip Time}') when s.performance->>'discipline' not ilike '%virtual%' then claim_time_seconds(s.performance->>'performance') end,
  case when s.performance#>>'{archiveReference,original,Gun Time}' ~ '^([0-9]+:)?[0-9]+:[0-5][0-9]$' then claim_time_seconds(s.performance#>>'{archiveReference,original,Gun Time}') end,
  (s.performance->>'place')::integer,
  (s.performance#>>'{places,gender}')::integer,(s.performance#>>'{places,category}')::integer,
  nullif(s.performance#>>'{archiveReference,original,Bib}',''),nullif(s.performance->>'ageGroup',''),
  s.source_url,coalesce(s.performance->>'verificationStatus','unverified'),s.performance,'finished',
  (select regexp_replace(l,'^Club( at race)?: ','') from jsonb_array_elements_text(coalesce(s.performance->'labels','[]'))l where l ~ '^Club( at race)?: ' limit 1),
  nullif(s.performance#>>'{archiveReference,original,Age}',''),
  s.available and a.parent_athlete_id is null
    and not exists(select 1 from results r join editions d on d.id=r.edition_id
      where r.athlete_id=s.athlete_id and d.event_date::text=s.performance->>'date'
      and r.source_url=s.source_url and r.finish_time_seconds=claim_time_seconds(s.performance->>'performance'))
from source_history_claim_results s join athletes a on a.id=s.athlete_id;


-- Keep the test identity bound even if an account email edit is attempted.
create function guard_athrecs_test_email() returns trigger language plpgsql as $$
begin
 if exists(select 1 from athrecs_test_athletes where user_id=new.id and email<>lower(trim(new.email))) then
  raise exception 'The reserved test account email cannot be changed';
 end if;
 return new;
end $$;
create trigger athrecs_test_email_guard before update of email on "user" for each row execute function guard_athrecs_test_email();

update athlete_public_shares s set enabled=false,search_indexable=false where athrecs_is_test_user(s.user_id);

do $$ begin
 if exists(select 1 from athrecs_test_athletes) and (select count(*) from athrecs_test_events)<>10 then raise exception 'Expected exactly ten authorised test fixtures'; end if;
end $$;

create or replace function queue_new_signup_alerts() returns trigger language plpgsql as $$
begin
 insert into signup_alert_deliveries(user_id,recipient,signup_name,signup_email,signup_at,email_verified)
 select NEW.id,recipient,NEW.name,NEW.email,NEW."createdAt",NEW."emailVerified"
 from (values ('paul@athrecs.com'),('paultwbrowne@gmail.com')) as recipients(recipient)
 where recipient='paul@athrecs.com' or not exists(select 1 from athrecs_test_athletes t where t.email=lower(trim(NEW.email)))
 on conflict(user_id,recipient) do nothing;
 return NEW;
end $$;
