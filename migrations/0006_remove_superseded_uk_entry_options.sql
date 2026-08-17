-- The first UK pilot used separate provider codes for official closed routes.
-- Reuse the canonical `official` row instead so the legacy fallback is
-- updated rather than displayed as a duplicate card.
delete from edition_entry_options option
using editions edition, events event
where option.edition_id = edition.id
  and edition.event_id = event.id
  and (
    (
      event.slug = 'london-marathon'
      and edition.event_date = '2027-04-24'::date
      and option.provider_code = 'official-ballot'
    )
    or (
      event.slug = 'loch-ness-marathon'
      and edition.event_date = '2026-09-27'::date
      and option.provider_code = 'official-general'
    )
  );
