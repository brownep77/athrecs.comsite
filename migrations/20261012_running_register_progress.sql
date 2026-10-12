-- An item is a known source page/document, never a claim about the entire archive.
create table if not exists event_register_extraction_items (
 source_host text not null,
 item_key text not null,
 source_url text not null,
 kind text not null check (kind in ('fixture','results','unclassified')),
 state text not null check (state in ('pending','extracted','partial','held','failed','excluded')),
 records integer not null default 0 check (records>=0),
 result_rows integer not null default 0 check (result_rows>=0),
 evidence jsonb not null default '{}',
 checked_at timestamptz,
 updated_at timestamptz not null default now(),
 primary key(source_host,item_key)
);
create index if not exists event_register_extraction_items_state_idx on event_register_extraction_items(source_host,kind,state);
alter table event_register_extraction_items enable row level security;
revoke all on event_register_extraction_items from public;
comment on table event_register_extraction_items is 'Staff-only known source work items. Percent extracted uses classified, discovered pages/documents, excluding non-race material. An unknown entire-archive total is never inferred from this inventory.';
