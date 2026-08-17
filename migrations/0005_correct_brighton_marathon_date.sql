-- The provisional diary listing used 11 April. The organiser now confirms
-- Brighton Marathon 2027 for Sunday 4 April.
delete from editions old_edition
using events event
where old_edition.event_id = event.id
  and event.slug = 'brighton-marathon'
  and old_edition.event_date = '2027-04-11'::date
  and old_edition.distance_code = 'Marathon'
  and exists (
    select 1
    from editions correct_edition
    where correct_edition.event_id = old_edition.event_id
      and correct_edition.event_date = '2027-04-04'::date
      and correct_edition.distance_code = old_edition.distance_code
  );

update editions edition
set event_date = '2027-04-04'::date,
    source_url = 'https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/brighton-marathon'
from events event
where edition.event_id = event.id
  and event.slug = 'brighton-marathon'
  and edition.event_date = '2027-04-11'::date
  and edition.distance_code = 'Marathon';
