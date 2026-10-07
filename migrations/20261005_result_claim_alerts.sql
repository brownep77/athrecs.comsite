-- Durable staff notifications. Recording a conflict and saving its claim are atomic.
-- No ownership, publication or existing performance values are changed.
create table if not exists result_claim_alerts (
  claim_id bigint primary key references result_claims(id) on delete cascade,
  summary text not null,
  created_at timestamptz not null default now()
);
create table if not exists result_claim_alert_deliveries (
  id bigserial primary key,
  claim_id bigint not null references result_claim_alerts(claim_id) on delete cascade,
  recipient text not null,
  email_payload jsonb not null,
  created_at timestamptz not null default now(),
  attempts int not null default 0,
  first_attempt_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  needs_review boolean not null default false,
  last_error text,
  unique(claim_id, recipient)
);
create index if not exists result_claim_alert_delivery_pending_idx
  on result_claim_alert_deliveries(next_attempt_at) where sent_at is null and not needs_review;
comment on table result_claim_alerts is 'Private staff outbox for competing claims; one notification event per claim.';
