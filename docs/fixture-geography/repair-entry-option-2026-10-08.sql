-- Browser verification found the old legacy option still said entries open.
-- Preserve its complete before-state, then align this one option with the
-- organiser-confirmed Closed edition and corrected seed entry URL.
insert into app_meta(key,value)
select 'fixture-geography:2026-10-08:entry-option:' || o.id, row_to_json(o)::text
from edition_entry_options o
join editions ed on ed.id=o.edition_id join events e on e.id=ed.event_id
where e.slug='gothenburg-marathon' and ed.event_date='2026-10-10'
  and ed.distance_code='Marathon' and o.provider_code='official'
  and o.entry_url='https://runabc.co.uk/gothenburg-marathon'
on conflict(key) do nothing;

update edition_entry_options o
set status='closed', entry_url='https://goteborgmarathon.se/anmalan',
    source_url='https://goteborgmarathon.se/anmalan', checked_at='2026-10-08T00:00:00Z',
    notes=concat_ws(' ',nullif(o.notes,''),'Organiser reports sold out; checked 2026-10-08.'),
    updated_at=now()
from editions ed join events e on e.id=ed.event_id
where o.edition_id=ed.id and e.slug='gothenburg-marathon'
  and ed.event_date='2026-10-10' and ed.distance_code='Marathon'
  and o.provider_code='official' and o.entry_url='https://runabc.co.uk/gothenburg-marathon';
