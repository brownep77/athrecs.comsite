-- Public-facing athlete classification. This does not imply that the person
-- has claimed the account; it only describes the profile and its sourced roles.

alter table athletes add column if not exists profile_type text not null default 'Athlete';
alter table athletes add column if not exists profile_roles text not null default '';
alter table athletes add column if not exists profile_source_checked_at date;

create index if not exists athletes_profile_type_idx on athletes (profile_type);
