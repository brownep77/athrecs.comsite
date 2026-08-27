-- Up to three optional HTTPS evidence links may accompany a result claim.
-- Evidence is never required for an uncontested athlete self-claim.

alter table result_claims
  add column if not exists evidence_url_2 text
  check (evidence_url_2 is null or evidence_url_2 ~ '^https://');

alter table result_claims
  add column if not exists evidence_url_3 text
  check (evidence_url_3 is null or evidence_url_3 ~ '^https://');

comment on column result_claims.evidence_url_2 is
  'Optional second private evidence link supplied by the claimant.';
comment on column result_claims.evidence_url_3 is
  'Optional third private evidence link supplied by the claimant.';
