import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { dbSource, getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import { syncSportsRecsNetworkFoundation } from "./sportsrecs-network.server";

export type SportsRecsBrandOverview = {
  code: string;
  name: string;
  purpose: string;
  launch_status: "planned" | "active" | "paused" | "retired";
  is_network: boolean;
  primary_domain: string | null;
  domain_status: "provisional" | "active" | "retired" | null;
  proposed_event_count: number;
  live_event_count: number;
  planned_publication_count: number;
};

export type SportsRecsSportOverview = {
  code: string;
  name: string;
  description: string;
  event_count: number;
  discipline_count: number;
  reviewed_event_count: number;
};

export type SportsRecsMigrationReport = {
  event_count: number;
  classified_event_count: number;
  unclassified_event_count: number;
  brand_planned_event_count: number;
  legacy_edition_count: number;
  network_edition_count: number;
  mapped_competition_count: number;
  legacy_result_count: number;
  mapped_result_count: number;
  protected_legacy_publication_count: number;
};

export type SportsRecsUnclassifiedEvent = {
  id: number;
  name: string;
  legacy_sport: string;
  country: string;
  city: string;
  confidence: string;
};

export const getSportsRecsNetworkOverview = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    await syncSportsRecsNetworkFoundation(sql);

    const [report] = await sql<SportsRecsMigrationReport>`
      select * from sportsrecs_network_migration_report
    `;

    const brands = await sql<SportsRecsBrandOverview>`
      select
        brand.code,
        brand.name,
        brand.purpose,
        brand.launch_status,
        brand.is_network,
        (
          select domain.hostname
          from brand_domains domain
          where domain.brand_id = brand.id
          order by domain.is_primary desc, (domain.status = 'active') desc, domain.id
          limit 1
        ) as primary_domain,
        (
          select domain.status
          from brand_domains domain
          where domain.brand_id = brand.id
          order by domain.is_primary desc, (domain.status = 'active') desc, domain.id
          limit 1
        ) as domain_status,
        (
          select count(*)::int
          from event_classifications classification
          where classification.proposed_brand_id = brand.id
        ) as proposed_event_count,
        (
          select count(*)::int
          from event_publications publication
          where publication.brand_id = brand.id
            and publication.publication_status in ('legacy_live', 'live')
        ) as live_event_count,
        (
          select count(*)::int
          from event_publications publication
          where publication.brand_id = brand.id
            and publication.publication_status in ('planned', 'draft')
        ) as planned_publication_count
      from brands brand
      order by
        case brand.code
          when 'sportsrecs' then 0
          when 'runrecs' then 1
          when 'athrecs' then 2
          when 'cycrecs' then 3
          when 'swimrecs' then 4
          when 'trirecs' then 5
          when 'gymrecs' then 6
          when 'fitrecs' then 7
          else 99
        end,
        brand.name
    `;

    const sports = await sql<SportsRecsSportOverview>`
      select
        sport.code,
        sport.name,
        sport.description,
        count(distinct classification.event_id)::int as event_count,
        count(distinct discipline.id)::int as discipline_count,
        count(distinct case
          when classification.classification_status in ('reviewed', 'overridden')
          then classification.event_id
        end)::int as reviewed_event_count
      from sports sport
      left join disciplines discipline on discipline.sport_id = sport.id
      left join event_classifications classification on classification.sport_id = sport.id
      group by sport.id, sport.code, sport.name, sport.description
      order by count(distinct classification.event_id) desc, sport.name
    `;

    const unclassified = await sql<SportsRecsUnclassifiedEvent>`
      select
        event.id,
        event.name,
        event.sport as legacy_sport,
        event.country,
        event.city,
        classification.confidence::text as confidence
      from event_classifications classification
      join events event on event.id = classification.event_id
      where classification.classification_status = 'unclassified'
      order by event.country, event.name
      limit 25
    `;

    return {
      backend: dbSource,
      generatedAt: new Date().toISOString(),
      report: report ?? {
        event_count: 0,
        classified_event_count: 0,
        unclassified_event_count: 0,
        brand_planned_event_count: 0,
        legacy_edition_count: 0,
        network_edition_count: 0,
        mapped_competition_count: 0,
        legacy_result_count: 0,
        mapped_result_count: 0,
        protected_legacy_publication_count: 0,
      },
      brands,
      sports,
      unclassified,
      safeguards: {
        readOnlyFoundation: true,
        publicUrlCutoverEnabled: false,
        specialistDomainWritesEnabled: false,
        legacyAthrecsCanonical: true,
        competitionModel: "shadow" as const,
      },
    };
  });
