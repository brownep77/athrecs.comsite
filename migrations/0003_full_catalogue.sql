-- Preserve stable source identifiers, fuller profile/provenance fields and
-- primary/secondary athlete-club relationships from the production catalogue.

alter table clubs add column if not exists source_names text not null default '';

alter table events add column if not exists source_id int;
alter table events add column if not exists source_url text;
create unique index if not exists events_source_id_idx on events (source_id)
  where source_id is not null;

alter table editions add column if not exists source_id int;
alter table editions add column if not exists notes text;
alter table editions add column if not exists results_permission text;
alter table editions add column if not exists results_hosting text;
alter table editions add column if not exists results_official_url text;
alter table editions add column if not exists results_permission_note text;
alter table editions add column if not exists results_permission_at timestamptz;
alter table editions add column if not exists results_permission_by text;
alter table editions add column if not exists results_rights_requested_at timestamptz;
alter table editions add column if not exists public_result_count int;
alter table editions add column if not exists partner_result_count int;
alter table editions add column if not exists athlete_result_count int;
alter table editions add column if not exists results_access text;
create unique index if not exists editions_source_id_idx on editions (source_id)
  where source_id is not null;

alter table athletes add column if not exists source_id int;
alter table athletes add column if not exists given_name text;
alter table athletes add column if not exists family_name text;
alter table athletes add column if not exists second_club_id int references clubs (id) on delete set null;
alter table athletes add column if not exists source_club_name text;
alter table athletes add column if not exists source_second_club_name text;
alter table athletes add column if not exists date_of_birth date;
alter table athletes add column if not exists nation text;
alter table athletes add column if not exists continent text;
alter table athletes add column if not exists commonwealth boolean;
alter table athletes add column if not exists race_entry_name text;
alter table athletes add column if not exists default_category text;
alter table athletes add column if not exists default_bib text;
alter table athletes add column if not exists preferred_distance text;
alter table athletes add column if not exists ea_number text;
alter table athletes add column if not exists athrecs_id text;
alter table athletes add column if not exists parent_athlete_id int references athletes (id) on delete set null;
alter table athletes add column if not exists avatar_url text;
alter table athletes add column if not exists source_url text;
create unique index if not exists athletes_source_id_idx on athletes (source_id)
  where source_id is not null;
create unique index if not exists athletes_athrecs_id_idx on athletes (athrecs_id)
  where athrecs_id is not null;
create index if not exists athletes_second_club_id_idx on athletes (second_club_id);

create table if not exists athlete_clubs (
  athlete_id int not null references athletes (id) on delete cascade,
  club_id int not null references clubs (id) on delete cascade,
  relationship text not null,
  source_name text,
  primary key (athlete_id, club_id, relationship)
);

alter table results add column if not exists source_id int;
alter table results add column if not exists chip_time_seconds int;
alter table results add column if not exists gun_time_seconds int;
alter table results add column if not exists bib text;
alter table results add column if not exists gender_place int;
alter table results add column if not exists category_place int;
alter table results add column if not exists age_on_day int;
alter table results add column if not exists age_grade_pct double precision;
alter table results add column if not exists open_rating int;
alter table results add column if not exists age_grade_rating int;
alter table results add column if not exists result_source text;
alter table results add column if not exists source_url text;
create unique index if not exists results_source_id_idx on results (source_id)
  where source_id is not null;
