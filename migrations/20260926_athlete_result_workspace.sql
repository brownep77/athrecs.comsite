-- Private proposals only. This migration does not import or publish any athlete data.
create table if not exists athlete_result_proposals (
  id uuid primary key,
  athlete_id integer references athletes(id) on delete restrict,
  submitted_by text not null references "user"(id) on delete cascade,
  source_url text not null check (source_url ~ '^https://'),
  original_text text not null check (length(original_text) <= 200000),
  input_hash text not null check (input_hash ~ '^[a-f0-9]{64}$'),
  entries jsonb not null check (jsonb_typeof(entries) = 'array' and jsonb_array_length(entries) between 1 and 250),
  revision integer not null default 1 check (revision > 0),
  evidence_for text not null default '',
  evidence_against text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists athlete_result_proposal_repeat
  on athlete_result_proposals (submitted_by, coalesce(athlete_id,0), input_hash);
create index if not exists athlete_result_proposal_target on athlete_result_proposals (athlete_id, updated_at desc);
create index if not exists athlete_result_proposal_submitter on athlete_result_proposals (submitted_by, updated_at desc);
create table if not exists athlete_result_review_invitations (
  id uuid primary key,
  batch_id uuid not null references athlete_result_proposals(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  recipient_email text not null,
  issued_revision integer not null,
  created_by text not null references "user"(id) on delete cascade,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists athlete_result_review_batch on athlete_result_review_invitations (batch_id);

-- Extra guard for this new, explicitly approved proposal writer only.
-- A bib is an edition-scoped source-row locator, never a global athlete identifier.
-- Existing importers and existing records are not modified by this migration.
create or replace function athlete_workspace_source_assignment_guard()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if new.result_source = 'Staff-reviewed submissions'
    and new.result_details ? 'proposal'
    and coalesce(btrim(new.bib),'') <> ''
    and coalesce(new.source_url,'') <> '' then
    perform pg_advisory_xact_lock(hashtext('athrecs:workspace-source-result'),
      hashtext(new.edition_id::text || '|' || split_part(new.source_url,'#',1) || '|' || btrim(new.bib)));
    if exists (
      select 1 from results r
      where r.edition_id = new.edition_id and r.athlete_id <> new.athlete_id
        and btrim(r.bib) = btrim(new.bib)
        and split_part(r.source_url,'#',1) = split_part(new.source_url,'#',1)
    ) then
      raise exception 'This source result is already assigned to another athlete. Review the existing assignment; nothing was copied.' using errcode = '23505';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists athlete_workspace_source_assignment on results;
create trigger athlete_workspace_source_assignment before insert on results
for each row execute function athlete_workspace_source_assignment_guard();
