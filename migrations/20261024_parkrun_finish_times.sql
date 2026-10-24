-- parkrun records volunteer-timed finishes, not chip or gun fields.
-- Correct only duplicate timing labels: never select between conflicting marks.
-- The existing result_change_history trigger preserves all original values privately.
select set_config('athrecs.archive_note',
  'Correct parkrun timing classification: retain finish time and verification; remove duplicate chip/gun labels. Official timing method: https://volunteer.parkrun.com/hc/en-us/articles/16857863282066-4-1-Virtual-Volunteer (checked 2026-10-24).', true);

update results r
set chip_time_seconds = null, gun_time_seconds = null
from editions d join events e on e.id = d.event_id
where r.edition_id = d.id
  and (lower(e.sport) = 'parkrun' or e.name ~* '\mparkrun\M')
  and e.name !~* '\(not\)\s*parkrun'
  and r.finish_time_seconds is not null
  and (r.chip_time_seconds is not null or r.gun_time_seconds is not null)
  and (r.chip_time_seconds is null or r.chip_time_seconds = r.finish_time_seconds)
  and (r.gun_time_seconds is null or r.gun_time_seconds = r.finish_time_seconds);

select set_config('athrecs.archive_note', '', true);
