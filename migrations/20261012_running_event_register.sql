-- A live catalogue register: retain canonical event/edition IDs and never infer
-- a first-ever or final year from the range of editions we happen to hold.
create view running_register_editions as
select ed.* from editions ed join events e on e.id = ed.event_id
where e.sport in ('Running', 'Parkrun', 'OCR')
   or (e.sport = 'Athletics'
       and ed.distance_code !~* '(walk|throw|jump|vault|shot|discus|javelin|hammer|combined|decathlon|heptathlon)'
       and (e.surface in ('Road', 'XC', 'Cross Country', 'Mountain')
         or ed.distance_code ~* '^([0-9]+([.][0-9]+)?[ ]*(m|km|k|mi|mile|miles)(sc|h| hurdles)?|half|marathon|cross country|xc|mountain|road relays|[0-9]+[ ]*[x×][ ]*[0-9]+[ ]*m)$'));

create view running_register_events as
select e.* from events e
where e.sport in ('Running', 'Parkrun', 'OCR')
   or (e.sport = 'Athletics' and (
     e.surface in ('Road', 'XC', 'Cross Country', 'Mountain')
     or exists (select 1 from editions ed where ed.event_id = e.id
       and ed.distance_code !~* '(walk|throw|jump|vault|shot|discus|javelin|hammer|combined|decathlon|heptathlon)'
       and ed.distance_code ~* '^([0-9]+([.][0-9]+)?[ ]*(m|km|k|mi|mile|miles)(sc|h| hurdles)?|half|marathon|cross country|xc|mountain|road relays|[0-9]+[ ]*[x×][ ]*[0-9]+[ ]*m)$')
   ));

-- Append-only staff observations preserve earlier decisions and provenance.
create table event_register_history (
  id bigserial primary key,
  event_id integer not null references events(id) on delete restrict,
  first_year integer check (first_year between 1800 and 2200),
  first_date date,
  final_year integer check (final_year between 1800 and 2200),
  final_date date,
  lifecycle text not null default 'unknown' check (lifecycle in ('unknown','active','paused','ended')),
  source_url text,
  checked_on date,
  note text not null default '',
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  next_check date,
  actor_id text not null references "user"(id),
  created_at timestamptz not null default now(),
  check (first_year is null or final_year is null or first_year <= final_year),
  check (first_date is null or (first_year is not null and extract(year from first_date) = first_year)),
  check (final_date is null or (final_year is not null and extract(year from final_date) = final_year)),
  check (first_date is null or final_date is null or first_date <= final_date),
  check (final_year is null or lifecycle = 'ended'),
  check ((first_year is null and final_year is null and lifecycle = 'unknown')
    or (source_url is not null and source_url ~ '^https?://' and checked_on is not null and length(note) >= 8))
);
create index event_register_history_event on event_register_history(event_id, id desc);

create table event_register_contacts (
  id bigserial primary key,
  event_id integer not null references events(id) on delete restrict,
  organiser text not null,
  contact_name text not null default '',
  email text not null default '',
  phone text not null default '',
  contact_url text not null default '',
  postal_address text not null default '',
  period text not null check (period in ('current','historical','future','unknown')),
  from_year integer check (from_year between 1800 and 2200),
  to_year integer check (to_year between 1800 and 2200),
  source_url text not null check (source_url ~ '^https?://'),
  checked_on date not null,
  note text not null default '',
  actor_id text not null references "user"(id),
  created_at timestamptz not null default now(),
  check (from_year is null or to_year is null or from_year <= to_year),
  check (length(email || phone || contact_url || postal_address) > 0)
);
create index event_register_contacts_event on event_register_contacts(event_id, id desc);

comment on view running_register_events is 'Staff register scope: running, parkrun, OCR and identifiable running disciplines within athletics. Mixed athletics programmes are not assumed to be running-only.';
comment on table event_register_history is 'Evidence-backed first/final years. Earliest/latest catalogue editions are calculated separately and never copied into these fields.';
