-- Private follow-up queue. Account creation and result claims remain independent.
create table athlete_profile_setup_requests (
  id bigserial primary key,
  user_id text not null references "user"(id) on delete cascade,
  details jsonb not null,
  fingerprint text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  completed_by text references "user"(id) on delete set null,
  unique(user_id,fingerprint)
);
create index athlete_profile_setup_pending on athlete_profile_setup_requests(created_at) where completed_at is null;
create table athlete_profile_setup_alerts (
  id bigserial primary key,
  request_id bigint not null references athlete_profile_setup_requests(id) on delete cascade,
  recipient text not null check(recipient in ('paul@athrecs.com','paultwbrowne@gmail.com')),
  email_payload jsonb,
  sent_at timestamptz,
  first_attempt_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  needs_review boolean not null default false,
  last_error text,
  unique(request_id,recipient)
);
create index athlete_profile_setup_alert_pending on athlete_profile_setup_alerts(next_attempt_at) where sent_at is null and not needs_review;
