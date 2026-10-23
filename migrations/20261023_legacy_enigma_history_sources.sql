-- Preserve original HTTP-only Enigma evidence without allowing arbitrary HTTP
-- hosts. All existing HTTPS histories remain valid and no rows are rewritten.
alter table athlete_source_histories
  drop constraint if exists athlete_source_histories_source_url_check;
alter table athlete_source_histories
  add constraint athlete_source_histories_source_url_check check (
    source_url like 'https://%'
    or source_url ~ '^http://(www\.)?enigmarunning\.co\.uk/'
  );
