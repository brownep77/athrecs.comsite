-- Repair the exact malformed weekly-note prefix only. Preserve original values
-- in the staff audit log. Dates, times, status and provenance remain unchanged.
with candidates as materialized (
  select ed.id,ed.notes,
    replace(ed.notes,'Weekly junior parkrun 2K — '||chr(1)||' ',
      'Weekly junior parkrun 2K — Sunday ') as corrected_notes
  from editions ed join events e on e.id=ed.event_id
  where e.sport='Parkrun' and e.name ilike '%junior%'
    and ed.distance_code='2K' and extract(dow from ed.event_date)=0
    and ed.notes like 'Weekly junior parkrun 2K — '||chr(1)||' %'
), audit as (
  insert into network_audit_log(action,entity_type,entity_id,before_value,after_value)
  select 'fixture.weekday_note_repaired','edition',id::text,
    jsonb_build_object('notes',notes),
    jsonb_build_object('notes',corrected_notes,'reason','Restore weekday in malformed junior parkrun recurrence note')
  from candidates returning entity_id
)
update editions ed set notes=c.corrected_notes
from candidates c where ed.id=c.id
  and exists(select 1 from audit where entity_id=c.id::text);
