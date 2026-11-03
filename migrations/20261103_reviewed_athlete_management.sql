-- Add an authorization boundary without rewriting or deleting historical claims,
-- links, account choices, results or source-verification evidence.
create or replace function athlete_management_reviewed(athlete_key integer, account_key text)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from athlete_account_links link
    left join result_claims claim on claim.id = link.source_claim_id
      and claim.athlete_id = link.athlete_id
      and claim.claimant_user_id = link.user_id
    where link.athlete_id = athlete_key and link.user_id = account_key
      and link.status = 'active'
      and link.confirmation_method in ('staff', 'unrecorded')
      and claim.status = 'approved' and claim.reviewed_at is not null
      and (claim.reviewed_by_user_id is not null
        or nullif(trim(claim.reviewed_by_email), '') is not null)
      and nullif(trim(claim.staff_note), '') is not null
      and (claim.reviewed_by_user_id is null or claim.reviewed_by_user_id <> claim.claimant_user_id)
      and (nullif(trim(claim.reviewed_by_email), '') is null
        or lower(trim(claim.reviewed_by_email)) <> lower(trim(claim.claimant_email)))
  )
$$;

create or replace view athlete_reviewed_account_links as
  select link.* from athlete_account_links link
  where athlete_management_reviewed(link.athlete_id, link.user_id);

comment on function athlete_management_reviewed(integer, text) is
  'Authorization for management and representation of an existing athlete. Requires recorded staff review; an athlete declaration or unknown legacy provenance is insufficient. Does not verify performances or imply a photo/ID check.';
comment on view athlete_reviewed_account_links is
  'Reviewed active management links only. Original links remain available for private history and audit; no historical provenance is upgraded.';
