-- Explicit synthetic bootstrap for a disposable test database only.
insert into athletes(slug,display_name,given_name,family_name,gender,county,country,bio,profile_visibility,profile_details)
values('test-test-fictional-male-20261013','Test Test','Test','Test','M','','',
 'FICTIONAL TEST ATHLETE. Invented results for the private AthRecs walkthrough only.',
 'private','{"syntheticTest":true,"doNotPublish":true,"testOwner":"paul@athrecs.com"}')
on conflict(slug) do nothing;
insert into athrecs_test_athletes(athlete_id,email)
select id,'paul@athrecs.com' from athletes where slug='test-test-fictional-male-20261013'
  and profile_details->>'syntheticTest'='true' and profile_details->>'testOwner'='paul@athrecs.com';

update athrecs_test_athletes t set user_id=u.id from "user" u where lower(trim(u.email))=t.email;

with fixtures(seq,discipline,km,mark) as (values
 (1,'1K',1.0,'00:04:30'),(2,'3K',3.0,'00:14:45'),(3,'5K',5.0,'00:25:00'),
 (4,'5M',8.04672,'00:42:00'),(5,'10K',10.0,'00:53:00'),(6,'10M',16.09344,'01:29:00'),
 (7,'Half Marathon',21.0975,'01:59:00'),(8,'Marathon',42.195,'04:15:00'),
 (9,'50K',50.0,'06:05:00'),(10,'100K',100.0,'13:20:00')),
 performances as (select jsonb_agg(jsonb_build_object(
 'year',2026,'date',to_char(make_date(2026,seq,1),'YYYY-MM-DD'),'sourceDate',to_char(make_date(2026,seq,1),'YYYY-MM-DD'),
 'meeting','Test '||seq,'discipline',discipline,'distanceKm',km,'performance',mark,
 'syntheticTest',true,'testSequence',seq,'verificationStatus','unverified','place',seq::text,
 'ageGroup','Male open','wind','','venue','Fictional test venue','sourceUrls','[]'::jsonb,
 'labels',jsonb_build_array('FICTIONAL TEST RACE','Synthetic result — not a sporting achievement'),
 'notes','Fictional race, date, finish time and placing authorised by Paul Browne for a private test walkthrough only.',
 'archiveReference',jsonb_build_object('sourceRow','athrecs-test-test-20261013-'||seq,'original',jsonb_build_object('Name','Test Test','Sex','M','Bib','TEST-'||seq,'Gun Time',mark,'Distance',discipline))) order by seq) as rows from fixtures)
insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances)
select t.athlete_id,'athrecs-private-system-test','test-test-20261013','https://www.athrecs.com/test-account',now(),true,array[2026],array[2026],p.rows
from athrecs_test_athletes t cross join performances p on conflict(provider,external_id) do nothing;
insert into source_history_claim_results(athlete_id,provider,external_id,source_key,source_url,performance,available)
select h.athlete_id,h.provider,h.external_id,p#>>'{archiveReference,sourceRow}',h.source_url,p,true
from athlete_source_histories h join athrecs_test_athletes t on t.athlete_id=h.athlete_id
cross join lateral jsonb_array_elements(h.performances)p
where h.provider='athrecs-private-system-test' and p->>'syntheticTest'='true'
on conflict(provider,external_id,source_key) do nothing;
insert into athrecs_test_events(id,name,source_result_id)
select (s.performance->>'testSequence')::int,s.performance->>'meeting',s.id from source_history_claim_results s
join athrecs_test_athletes t on t.athlete_id=s.athlete_id where s.provider='athrecs-private-system-test';

