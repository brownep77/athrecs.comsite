-- Generated from source-history-sport.ts; checked by verify-source-history-sport.mjs.
-- Derived classification only: original performances, identity and visibility stay intact.
create or replace function athlete_source_sport_v2(provider text, discipline text, meeting text default '')
returns text language sql immutable parallel safe as $function$
  select case
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(triathlon)([^a-z0-9_]|$)' then 'Triathlon'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(duathlon)([^a-z0-9_]|$)' then 'Duathlon'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(aquathlon)([^a-z0-9_]|$)' then 'Aquathlon'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(aquabike)([^a-z0-9_]|$)' then 'Aquabike'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(parkrun(cx)?)([^a-z0-9_]|$)' then 'Parkrun'
    when trim(coalesce(provider,'')) ~* '^parkrun( official results)?$' then 'Parkrun'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(cycling|road cycling|mountain biking|bmx)([^a-z0-9_]|$)' then 'Cycling'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(swimming|swim|open water)([^a-z0-9_]|$)' then 'Swimming'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(rowing)([^a-z0-9_]|$)' then 'Rowing'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(obstacle course|ocr)([^a-z0-9_]|$)' then 'OCR'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(race walk|race walking|walking)([^a-z0-9_]|$)' then 'Walking'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(track|hurdles?|steeplechase|s/chase|long jump|high jump|triple jump|pole vault|shot( putt?)?|discus( throw)?|javelin|hammer|decathlon|heptathlon|pentathlon|hexathlon|octathlon|combined events)([^a-z0-9_]|$)' then 'Athletics'
    when trim(coalesce(discipline,'')) ~* '^(mile|2 miles)$' then 'Athletics'
    when trim(coalesce(discipline,'')) ~* '^([0-9]+(,[0-9]{3})*\s+met(re|er)s|[0-9]+\s*(x|×)\s*[0-9]+m)([^a-z0-9_]|$)' then 'Athletics'
    when trim(coalesce(discipline,'')) ~* '^(50|60|70|75|80|100|110|150|200|300|400|500|600|800|1000|1200|1500|2000|3000|5000|10000)(m|sc|h)?$' then 'Athletics'
    when trim(coalesce(discipline,'')) ~* '^[0-9]+m\s+(h|indoors|s/c)([^a-z0-9_]|$)|^[0-9]+m?s/c$|^[0-9]+sc(nwj|ns)$' then 'Athletics'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])([0-9]+\s*(x|×)\s*[0-9]+\s*(m|metres|meters))([^a-z0-9_]|$)' then 'Athletics'
    when trim(coalesce(discipline,'')) ~* '^(sp|dt|jt|ht)[0-9]+([.][0-9]+)?(k|kg|g)?$|^(lj|hj|tj|pv)$' then 'Athletics'
    when trim(coalesce(provider,'')) ~* '^(DUV Ultra Marathon Statistics|utmb|UTMB Index|Abbott World Marathon Majors)$' then 'Running'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(running|fun run|canicross|cross[ -]country|xc|road|trail|fell|ultra(marathon)?|multi[ -]terrain|mountain)([^a-z0-9_]|$)' then 'Running'
    when trim(coalesce(discipline,'')) ~* '^(z(xc|fl|mr|mt)l?|hm(mr)?|mar(mr|mt|dh)?|short(mar|hm|[0-9]+([.][0-9]+)?[km])|mt)$' then 'Running'
    when trim(coalesce(discipline,'')) ~* '^[0-9]+([.][0-9]+)?(k|m)(xc|xcl|fl|mr|mrl|mt|mtl|nad|approx|l)$' then 'Running'
    when trim(coalesce(discipline,'')) ~* '(^|[^a-z0-9_])(marathon|half( marathon)?|[0-9]+([.][0-9]+)?\s*(k(m)?|kilometres|kilometers|mi|mile|miles|miler))([^a-z0-9_]|$)' then 'Running'
    when trim(coalesce(meeting,'')) ~* '(^|[^a-z0-9_])(Triathlon)([^a-z0-9_]|$)' then 'Triathlon'
    when trim(coalesce(meeting,'')) ~* '(^|[^a-z0-9_])(Duathlon)([^a-z0-9_]|$)' then 'Duathlon'
    when trim(coalesce(meeting,'')) ~* '(^|[^a-z0-9_])(Aquathlon)([^a-z0-9_]|$)' then 'Aquathlon'
    when trim(coalesce(meeting,'')) ~* '(^|[^a-z0-9_])(Aquabike)([^a-z0-9_]|$)' then 'Aquabike'
    when trim(coalesce(meeting,'')) ~* '(^|[^a-z0-9_])(Parkrun)([^a-z0-9_]|$)' then 'Parkrun'
    when trim(coalesce(meeting,'')) ~* '(^|[^a-z0-9_])(Cycling)([^a-z0-9_]|$)' then 'Cycling'
    when trim(coalesce(meeting,'')) ~* '(^|[^a-z0-9_])(Swimming)([^a-z0-9_]|$)' then 'Swimming'
    when trim(coalesce(meeting,'')) ~* '(^|[^a-z0-9_])(Rowing)([^a-z0-9_]|$)' then 'Rowing'
    when trim(coalesce(meeting,'')) ~* '(^|[^a-z0-9_])(cross[ -]country|xc|trail running|fun run|running|marathon|half marathon|[0-9]+([.][0-9]+)?\s*k(m)?)([^a-z0-9_]|$)' then 'Running'
    else null end
$function$;

create or replace function athlete_history_sports_v2(provider text, performances jsonb)
returns text[] language sql immutable parallel safe as $function$
  select coalesce(array_agg(distinct sport order by sport) filter (where sport is not null),array[]::text[])
  from (
    select public.athlete_source_sport_v2(provider,p->>'discipline',p->>'meeting') as sport
    from jsonb_array_elements(case when jsonb_typeof(performances)='array' then performances else '[]'::jsonb end) p
    where coalesce(p->>'profileExcluded','false')<>'true'
  ) classified
$function$;

-- Full index supports staff review of unpublished histories as well as public discovery.
create index if not exists source_history_sports_v2_lookup
  on athlete_source_histories using gin (athlete_history_sports_v2(provider,performances));
