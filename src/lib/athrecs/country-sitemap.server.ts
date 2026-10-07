import type { Sql } from "../db";
import { countryMatchesFilter, resolveCountry } from "./countries.ts";

/** Match the unfiltered country race route: upcoming Running records only. */
export async function populatedRunningCountries(sql: Sql, countries: readonly string[]) {
  const events = await sql.query<{
    slug: string; name: string; country: string; county: string; city: string; area: string;
  }>(`select e.slug, e.name, e.country, e.county, e.city, e.area from events e
    where e.sport = 'Running' and exists (
      select 1 from editions ed where ed.event_id = e.id
        and ed.event_date >= (now() at time zone 'Europe/London')::date
    )`);
  return new Set(countries.filter((country) => events.some((event) =>
    (event.country === country || event.county === country)
      && countryMatchesFilter(resolveCountry(event), country),
  )));
}
