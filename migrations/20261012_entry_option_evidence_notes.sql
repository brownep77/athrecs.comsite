-- Seeded catalogues already have this column. Include it in the migration
-- schema too so catalogue rollback can preserve evidence on every database.
alter table edition_entry_options add column if not exists notes text;
