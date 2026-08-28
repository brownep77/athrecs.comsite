-- Refresh the non-destructive fixture catalogue after adding Belgium's
-- restricted-entry elite, professional and youth competition calendar.
--
-- ensureFullCatalogue() still protects the full catalogue with soft floors.
-- Removing this one marker only causes the fixture upsert to run again; it
-- does not delete athletes, results, clubs or existing events.
create table if not exists app_meta (
  key text primary key,
  value text not null
);

delete from app_meta where key = 'fixtures_catalogue_version';
