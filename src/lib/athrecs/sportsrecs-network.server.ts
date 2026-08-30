import type { Sql } from "@/lib/db";

/**
 * Populate the additive SportsRecs shadow model after the legacy seed/import
 * path has run. Every statement is idempotent and deliberately preserves staff
 * classifications, live URL ownership and any future active competition rows.
 */
export async function syncSportsRecsNetworkFoundation(sql: Sql): Promise<void> {
  await sql.query(`
    insert into event_classifications (
      event_id,
      sport_id,
      primary_discipline_id,
      proposed_brand_id,
      classification_status,
      confidence,
      classification_source
    )
    select
      suggestion.event_id,
      sport.id,
      discipline.id,
      brand.id,
      suggestion.classification_status,
      suggestion.confidence,
      'sync:sportsrecs_network_foundation'
    from sportsrecs_event_classification_suggestions suggestion
    join sports sport on sport.code = suggestion.sport_code
    left join disciplines discipline on discipline.code = suggestion.discipline_code
    left join brands brand on brand.code = suggestion.brand_code
    on conflict (event_id) do nothing
  `);

  await sql.query(`
    insert into event_publications (
      event_id,
      brand_id,
      public_slug,
      public_path,
      publication_status,
      is_canonical,
      canonical_url,
      published_at
    )
    select
      event.id,
      brand.id,
      event.slug,
      '/races/' || event.slug,
      'legacy_live',
      true,
      'https://www.athrecs.com/races/' || event.slug,
      event.created_at
    from events event
    join brands brand on brand.code = 'athrecs'
    on conflict (event_id, brand_id) do nothing
  `);

  await sql.query(`
    insert into network_event_editions (
      event_id,
      edition_name,
      start_date,
      end_date,
      status,
      migration_state,
      legacy_edition_count
    )
    select
      suggestion.event_id,
      suggestion.edition_name,
      suggestion.start_date,
      suggestion.end_date,
      suggestion.status,
      'shadow',
      suggestion.legacy_edition_count
    from sportsrecs_network_edition_suggestions suggestion
    on conflict (event_id, start_date) do update set
      edition_name = excluded.edition_name,
      end_date = excluded.end_date,
      status = excluded.status,
      legacy_edition_count = excluded.legacy_edition_count,
      updated_at = now()
    where network_event_editions.migration_state = 'shadow'
  `);

  await sql.query(`
    insert into competitions (
      network_edition_id,
      legacy_edition_id,
      discipline_id,
      competition_code,
      name,
      distance_code,
      result_format,
      status,
      migration_state
    )
    select
      suggestion.network_edition_id,
      suggestion.legacy_edition_id,
      suggestion.discipline_id,
      suggestion.competition_code,
      suggestion.name,
      suggestion.distance_code,
      suggestion.result_format,
      suggestion.status,
      'shadow'
    from sportsrecs_competition_suggestions suggestion
    on conflict (legacy_edition_id) do update set
      network_edition_id = excluded.network_edition_id,
      discipline_id = excluded.discipline_id,
      competition_code = excluded.competition_code,
      name = excluded.name,
      distance_code = excluded.distance_code,
      result_format = excluded.result_format,
      status = excluded.status,
      updated_at = now()
    where competitions.migration_state = 'shadow'
  `);
}
