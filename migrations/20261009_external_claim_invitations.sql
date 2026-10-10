-- Invitations may precede registration. Existing account-bound links stay bound.
alter table athlete_claim_invitations alter column user_id drop not null;
alter table athlete_claim_invitations alter column recipient_email drop not null;
alter table athlete_claim_invitations alter column email_payload drop not null;
alter table athlete_claim_invitations add column if not exists invitation_kind text not null default 'account';
alter table athlete_claim_invitations add column if not exists recipient_name text;
alter table athlete_claim_invitations add column if not exists recipient_contact jsonb;
alter table athlete_claim_invitations add column if not exists recipient_key text;
alter table athlete_claim_invitations add constraint athlete_claim_invitation_binding check (
  (invitation_kind='account' and user_id is not null and recipient_email is not null and email_payload is not null)
  or (invitation_kind='email' and recipient_email is not null and email_payload is not null and recipient_key is not null)
  or (invitation_kind='contact' and recipient_email is null and email_payload is null and recipient_key is not null and recipient_contact is not null)
);
create index if not exists athlete_claim_invitations_recipient_idx on athlete_claim_invitations(recipient_key,created_at desc);
create index if not exists athlete_claim_invitations_email_idx on athlete_claim_invitations(recipient_email,created_at desc);
create index if not exists athlete_claim_invitations_athlete_idx on athlete_claim_invitations(athlete_id,created_at desc);
comment on table athlete_claim_invitations is 'Private profile invitations. Account links retain strict account/mailbox binding; pre-registration email links require the exact verified mailbox; contact-only links require a verified account and explicit submission before account binding. All claims require staff identity review. Tokens and contacts are confidential.';
