import type { Sql } from "../db";
import { retainedFixtureAliasSlugs } from "../../data/fixture-deduplication";
import { withheldFixtureDateKeys } from "../../data/fixture-date-reviews";
import { countryMatchesFilter, resolveCountry } from "./countries.ts";
import { unconfirmedFixtureEditionIds } from "./fixture-distance-policy.server.ts";
import { todayIso } from "./format.ts";

/** Use the same upcoming Running editions and country resolution as the public calendar. */
export async function populatedRunningCountries(sql: Sql, countries: readonly string[]) {
  const today = todayIso();
  const held = await unconfirmedFixtureEditionIds(sql, today);
  const events = await sql.query<{
    slug: string;
    name: string;
    country: string;
    county: string;
    city: string;
    area: string;
  }>(
    `select e.slug, e.name, e.country, e.county, e.city, e.area from events e
    where e.sport = 'Running' and not (e.slug = any($2::text[]))
      and exists (select 1 from editions ed where ed.event_id = e.id
        and ed.event_date >= $1::date and ed.status <> 'Cancelled'
        and not (ed.id = any($3::int[]))
        and not ((e.slug || '|' || ed.event_date::text) = any($4::text[]))
      )`,
    [today, retainedFixtureAliasSlugs, held, withheldFixtureDateKeys],
  );
  return new Set(
    countries.filter((country) =>
      events.some((event) => {
        const matchesStoredCountry =
          event.country === country ||
          event.county === country ||
          (country === "United Kingdom" &&
            ["England", "Wales", "Scotland", "Northern Ireland"].includes(event.country));
        return matchesStoredCountry && countryMatchesFilter(resolveCountry(event), country);
      }),
    ),
  );
}
