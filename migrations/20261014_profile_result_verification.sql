-- Staff evidence is private; member responses are deliberately separate.
create table athlete_result_verification_requests (
  id uuid primary key,
  athlete_id integer not null references athletes(id),
  result_key text not null,
  requested_by text not null references "user"(id),
  status text not null default 'pending' check(status in ('pending','needs_info','approved','rejected')),
  revision integer not null default 1 check(revision > 0),
  athlete_note text not null default '',
  evidence_url text not null default '',
  result_snapshot jsonb not null,
  result_version text not null,
  staff_evidence jsonb,
  member_message text not null default '',
  reviewed_by text references "user"(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(athlete_id,result_key)
);
create index athlete_verification_queue_idx on athlete_result_verification_requests(status,updated_at,id);
create index athlete_verification_owner_idx on athlete_result_verification_requests(requested_by,updated_at);
comment on table athlete_result_verification_requests is 'Private result verification inbox. A request is not verification; evidence is retained in this table and network_audit_log.';
