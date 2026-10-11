-- Completion of an ownership claim is separate from result or identity verification.
-- Preserve legacy decisions as unrecorded rather than inventing their evidence level.
alter table result_claims
  add column if not exists confirmation_method text not null default 'unrecorded'
    check (confirmation_method in ('unrecorded', 'athlete', 'staff')),
  add column if not exists confirmed_at timestamptz,
  add column if not exists claimant_role text not null default 'athlete'
    check (claimant_role in ('athlete', 'guardian'));

alter table athlete_account_links
  add column if not exists confirmation_method text not null default 'unrecorded'
    check (confirmation_method in ('unrecorded', 'athlete', 'staff'));

comment on table athlete_account_links is
  'Profile ownership links. confirmation_method distinguishes athlete self-confirmation from staff review; neither implies photo, ID or performance verification.';
comment on column result_claims.confirmation_method is
  'Basis for claim completion, independent of timing/source verification. unrecorded preserves legacy provenance.';
