-- Support athlete-specific result reads. The existing (edition_id, athlete_id)
-- constraint is led by edition, while profiles and ownership checks use athlete.
create index if not exists results_athlete_id_idx on results (athlete_id);
