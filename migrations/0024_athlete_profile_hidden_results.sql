-- Per-account result visibility for private Athlete Profiles.
--
-- Hiding a result is deliberately non-destructive: the canonical result,
-- athlete identity, claim and account link remain unchanged. This table only
-- records that the signed-in athlete does not want a particular result shown on
-- their private profile or included in its automatic biography.

create table if not exists athlete_profile_hidden_results (
  user_id text not null references "user" ("id") on delete cascade,
  result_id int not null references results (id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (user_id, result_id)
);

create index if not exists athlete_profile_hidden_results_result_idx
  on athlete_profile_hidden_results (result_id, user_id);

comment on table athlete_profile_hidden_results is
  'Private per-account exclusions from the Athlete Profile. Never delete the underlying canonical result when inserting here.';
