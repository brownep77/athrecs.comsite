-- Record successful self-confirmations in the same durable staff outbox as conflicts.
-- Existing events retain their conflict meaning; do not notify historical completions.
alter table result_claim_alerts add column if not exists event_kind text not null
  default 'ownership_conflict' check (event_kind in ('ownership_conflict', 'claim_completed'));
comment on table result_claim_alerts is 'Private staff outbox for completed self-confirmations and competing claims; one notification event per claim.';
