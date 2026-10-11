-- ANZ has a stable public athlete ID, shared by its profile and event searches.
alter table athlete_source_identities drop constraint athlete_source_identities_provider_check;
alter table athlete_source_identities add constraint athlete_source_identities_provider_check
  check (provider in ('worldathletics','powerof10','parkrun','athleticsurn','anzrankings'));
