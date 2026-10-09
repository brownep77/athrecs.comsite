-- Source ledger: world-athletics-corrections-2026-10-08.json.
insert into app_meta(key,value)
select 'fixture-geography:2026-10-08:event:' || e.slug,row_to_json(e)::text from events e
where e.country='England' and e.slug in (
 'wa-33rd-spar-european-cross-country-championships-7204675',
 'wa-4j-studios-scottishathletics-national-senior-under-18-champs-7239162',
 'wa-4j-studios-scottishathletics-u20-championships-7239116')
on conflict(key) do nothing;

update events set country='Scotland',summary=replace(summary,', England.',', Scotland.'),
 description=case when slug='wa-33rd-spar-european-cross-country-championships-7204675'
 then replace(description,'10 DEC 2027','12 DEC 2027') else description end,updated_at=now()
where country='England' and slug in (
 'wa-33rd-spar-european-cross-country-championships-7204675',
 'wa-4j-studios-scottishathletics-national-senior-under-18-champs-7239162',
 'wa-4j-studios-scottishathletics-u20-championships-7239116');

insert into app_meta(key,value)
select 'fixture-geography:2026-10-08:edition:' || ed.id,row_to_json(ed)::text
from editions ed join events e on e.id=ed.event_id
where e.slug='wa-33rd-spar-european-cross-country-championships-7204675'
 and ed.event_date='2027-12-10' and ed.distance_code='Other'
on conflict(key) do nothing;

update editions ed set event_date='2027-12-12',notes=replace(notes,'10 DEC 2027','12 DEC 2027')
from events e where e.id=ed.event_id
 and e.slug='wa-33rd-spar-european-cross-country-championships-7204675'
 and ed.event_date='2027-12-10' and ed.distance_code='Other';
