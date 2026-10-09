-- Bounded, repeat-safe repair. Execute as ONE transaction after review/testing.
-- Original event/edition records are retained in app_meta for restoration.
WITH corrections(slug,old_country,old_county,country,county,source_url) AS (VALUES
('longtown-10','Scotland','Scotland','England','Cumbria','https://runabc.co.uk/longtown-10'),
('alnwick-castle-half-marathon-10k','Scotland','Scotland','England','Northumberland','https://runabc.co.uk/alnwick-castle-half-marathon-10k'),
('great-north-run','Scotland','Scotland','England','Tyne & Wear','https://runabc.co.uk/great-north-run'),
('benidorm-marathon-half-running-crazy-10k','Scotland','Scotland','Spain','','https://runabc.co.uk/benidorm-marathon-half-running-crazy-10k'),
('bmaf-open-5km-road-championships-inc-northern-masters-champs','Scotland','Scotland','England','London','https://runabc.co.uk/bmaf-open-5km-road-championships-inc-northern-masters-champs'),
('capital-to-country','Scotland','Scotland','Nepal','','https://runabc.co.uk/capital-to-country'),
('carlisle-remembrance-run','Scotland','Scotland','England','Cumbria','https://runabc.co.uk/carlisle-remembrance-run'),
('derwent-reservoir-trail-races','Scotland','Scotland','England','Northumberland','https://runabc.co.uk/derwent-reservoir-trail-races'),
('wild-deer-ultra','Scotland','Scotland','England','County Durham','https://runabc.co.uk/wild-deer-ultra'),
('disney-wine-dine-half-marathon','Scotland','Scotland','United States','','https://runabc.co.uk/disney-wine-dine-half-marathon'),
('detroit-marathon','Scotland','Scotland','United States','','https://runabc.co.uk/detroit-marathon'),
('great-wall-marathon','Scotland','Scotland','China','','https://runabc.co.uk/great-wall-marathon'),
('gothenburg-marathon','Scotland','Scotland','Sweden','','https://runabc.co.uk/gothenburg-marathon'),
('keswick-half-marathon','Scotland','Scotland','England','Cumbria','https://runabc.co.uk/keswick-half-marathon'),
('kingdom-of-northumbria-coastal-ultra','Scotland','Scotland','England','Northumberland','https://runabc.co.uk/kingdom-of-northumbria-coastal-ultra'),
('marine-corps-marathon-10k','Scotland','Scotland','United States','','https://runabc.co.uk/marine-corps-marathon-10k'),
('helvellyn-trail-run-10k','Scotland','Scotland','England','Cumbria','https://runabc.co.uk/helvellyn-trail-run-10k'),
('langdale-horseshoe','Scotland','Scotland','England','Cumbria','https://runabc.co.uk/langdale-horseshoe'),
('nepal-international-marathon','Scotland','Scotland','Nepal','','https://runabc.co.uk/nepal-international-marathon'),
('rat-race-the-wall-2019','Scotland','Scotland','England','Cumbria','https://runabc.co.uk/rat-race-the-wall-2019'),
('pilgrims-ultra','Scotland','Scotland','England','Northumberland','https://runabc.co.uk/pilgrims-ultra'),
('niagara-falls-marathon-half-marathon-relay-10k','Scotland','Scotland','Canada','','https://runabc.co.uk/niagara-falls-marathon-half-marathon-relay-10k'),
('rip-n-run-xl','Scotland','Scotland','England','West Yorkshire','https://runabc.co.uk/rip-n-run-xl'),
('san-sebastian-marathon','Scotland','Scotland','Spain','','https://runabc.co.uk/san-sebastian-marathon'),
('run-the-raid-lindisfarne-half-marathon','Scotland','Scotland','England','Northumberland','https://runabc.co.uk/run-the-raid-lindisfarne-half-marathon'),
('amica-insurance-seattle-marathon','Scotland','Scotland','United States','','https://www.seattlemarathon.org/faq'),
('montane-cheviot-goat-winter-ultra-run','Scotland','Scotland','England','Northumberland','https://runabc.co.uk/montane-cheviot-goat-winter-ultra-run'),
('shanghai-marathon','Scotland','Scotland','China','','https://runabc.co.uk/shanghai-marathon'),
('spar-budapest-international-marathon','Scotland','Scotland','Hungary','','https://runabc.co.uk/spar-budapest-international-marathon'),
('sport-in-action-castle-5k-series-race-4','Scotland','Scotland','England','Cumbria','https://runabc.co.uk/sport-in-action-castle-5k-series-race-4'),
('the-priory-100k','Scotland','Scotland','England','Northumberland','https://runabc.co.uk/the-priory-100k'),
('sport-in-action-castle-5k-series-race-5','Scotland','Scotland','England','Cumbria','https://runabc.co.uk/sport-in-action-castle-5k-series-race-5'),
('the-lap-windermere-ultra-anticlockwise','Scotland','Scotland','England','Cumbria','https://runabc.co.uk/the-lap-windermere-ultra-anticlockwise'),
('tromso-ultra','Scotland','Scotland','Norway','','https://runabc.co.uk/tromso-ultra'),
('ullswater-trail-run-10k','Scotland','Scotland','England','Cumbria','https://runabc.co.uk/ullswater-trail-run-10k'),
('guernsey-june-half-marathon','England','South of England','Guernsey','','https://runabc.co.uk/guernsey-june-half-marathon'),
('hospice-10k-run','England','South of England','Jersey','','https://runabc.co.uk/hospice-10k-run'),
('corporate-cup-august','England','South of England','Jersey','','https://runabc.co.uk/corporate-cup-august'),
('isle-of-man-marathon','England','North of England','Isle of Man','','https://runabc.co.uk/isle-of-man-marathon'),
('jersey-spartan-half-marathon-relay-fun-run','England','South of England','Jersey','','https://runabc.co.uk/jersey-spartan-half-marathon-relay-fun-run'),
('western-10-road-run','England','North of England','Isle of Man','','https://runabc.co.uk/western-10-road-run'),
('round-the-rock-48-miles','England','South of England','Jersey','','https://runabc.co.uk/round-the-rock-48-miles')
), before_rows AS MATERIALIZED (
 SELECT e.*, c.country AS next_country,c.county AS next_county,c.source_url AS evidence_url
 FROM events e JOIN corrections c USING(slug)
 WHERE e.country=c.old_country AND e.county=c.old_county
), backups AS (
 INSERT INTO app_meta(key,value) SELECT 'fixture-geography:2026-10-08:event:'||b.slug,
 jsonb_build_object('before',to_jsonb(b)-'next_country'-'next_county'-'evidence_url','sourceUrl',b.evidence_url,'checkedAt','2026-10-08')::text FROM before_rows b
 ON CONFLICT(key) DO NOTHING RETURNING key
)
UPDATE events e SET country=b.next_country,county=b.next_county,
 summary=regexp_replace(e.summary,'Listed on runABC \([^)]*\)\.','Listed on runABC.'),
 description=regexp_replace(e.description,'Listed on runABC \([^)]*\)\.','Listed on runABC.'),updated_at=now()
FROM before_rows b WHERE e.id=b.id;

INSERT INTO app_meta(key,value) SELECT 'fixture-geography:2026-10-08:edition:'||ed.id,to_jsonb(ed)::text
FROM editions ed JOIN events e ON e.id=ed.event_id WHERE e.slug='gothenburg-marathon'
AND ed.event_date='2026-10-09' AND ed.distance_code='Marathon' AND ed.source_url='https://runabc.co.uk/gothenburg-marathon' ON CONFLICT(key) DO NOTHING;

UPDATE editions ed SET event_date='2026-10-10',start_time='10:00',status='Closed',
entry_url='https://goteborgmarathon.se/anmalan',source_url='https://goteborgmarathon.se/information',
notes=concat_ws(' ',nullif(ed.notes,''),'Sold out. Marathon start 10:00 local (Europe/Stockholm); organiser checked 2026-10-08.')
FROM events e WHERE e.id=ed.event_id AND e.slug='gothenburg-marathon' AND ed.event_date='2026-10-09'
AND ed.distance_code='Marathon' AND ed.source_url='https://runabc.co.uk/gothenburg-marathon';

UPDATE events SET area='Slottsskogsvallen',organiser='Solvikingarna',website='https://goteborgmarathon.se/',
source_url='https://goteborgmarathon.se/information',
summary='A flat coastal marathon from Slottsskogsvallen in Gothenburg, Sweden.',
description='Göteborg Marathon starts and finishes at Slottsskogsvallen in Gothenburg, Sweden. The marathon follows two laps of the coastal out-and-back route towards Lilla Amundön. A half marathon is also held at the event.',updated_at=now()
WHERE slug='gothenburg-marathon' AND country='Sweden' AND website='https://runabc.co.uk/gothenburg-marathon';
