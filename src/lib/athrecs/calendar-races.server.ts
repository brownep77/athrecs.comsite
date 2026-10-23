import type { Sql } from "../db";
import { withheldFixtureDateKeys } from "../../data/fixture-date-reviews";
import { ROAD_MARATHONS } from "../../data/road-marathons";
import { ROAD_HALF_MARATHONS } from "../../data/road-half-marathons";
import { MARATHON_COUNTRIES } from "../../data/road-marathons/countries";
import { ROAD_ULTRAS } from "../running/road-ultras";
import { catalogueCalendarRace } from "./catalogue-calendar";
import { publicCatalogueContent } from "./public-catalogue-content";
import { twoOceansCalendarPresentation } from "./two-oceans-presentation";
import { validCalendarRaceId, MAX_CALENDAR_RACES } from "./calendar-subscription";
import type { CalendarRace } from "./event-calendar";

const site = "https://www.athrecs.com";
type Edition = {
  id: number;
  event_date: string;
  distance_code: string;
  distance_km: number;
  status: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  slug: string;
  name: string;
  country: string;
  county: string;
  city: string;
  website: string;
};

/** Resolve a bounded selection from canonical data; never fetch a supplied URL. */
export async function resolveCalendarRaces(
  sql: Sql,
  ids: string[],
): Promise<Map<string, CalendarRace>> {
  const selected = [...new Set(ids.filter(validCalendarRaceId))].slice(0, MAX_CALENDAR_RACES + 1);
  const result = new Map<string, CalendarRace>();
  const editionIds = selected.flatMap((id) =>
    id.startsWith("edition-") ? [Number(id.split("-")[1])] : [],
  );
  if (editionIds.length) {
    const rows = await sql.query<Edition>(
      `
      select ed.id, ed.event_date::text, ed.distance_code, ed.distance_km, ed.status,
        ed.start_time, e.slug, e.name, e.country, e.county, e.city, e.website,
        case when ed.end_source_url is not null and ed.end_checked_at is not null then ed.end_date::text end as end_date,
        case when ed.end_source_url is not null and ed.end_checked_at is not null then ed.end_time end as end_time
      from editions ed join events e on e.id=ed.event_id where ed.id=any($1::bigint[])
    `,
      [editionIds],
    );
    for (const row of rows) {
      if (withheldFixtureDateKeys.includes(`${row.slug}|${row.event_date}`)) continue;
      const shown = twoOceansCalendarPresentation({
        event_slug: row.slug,
        event_name: row.name,
        distance_code: row.distance_code,
      });
      const race = catalogueCalendarRace(
        { ...row, slug: shown.event_slug, name: shown.event_name },
        row,
        site,
      );
      if (selected.includes(race.id)) result.set(race.id, publicCatalogueContent(race));
    }
  }
  for (const id of selected) {
    const match = id.match(/^(road|ultra)-(.+)-(\d{4}-\d{2}-\d{2})$/);
    if (!match) continue;
    const [, kind, slug, date] = match;
    if (kind === "road") {
      const half = ROAD_HALF_MARATHONS.find((race) => race.slug === slug);
      const race = half ?? ROAD_MARATHONS.find((race) => race.slug === slug);
      const edition = race?.editions.find((item) => item.date === date);
      if (!race || !edition) continue;
      result.set(
        id,
        publicCatalogueContent({
          id,
          name: race.name,
          date,
          endDate: edition.endDate,
          distance: half ? "Half marathon" : "Marathon",
          timeZone: race.timeZone,
          location: [
            ...new Set(
              [
                race.city,
                race.region,
                race.nation,
                MARATHON_COUNTRIES.find((c) => c.id === race.country)?.name,
              ].filter(Boolean),
            ),
          ].join(", "),
          officialUrl: race.officialUrl,
          pageUrl: `${site}/running/races/${slug}`,
        }),
      );
    } else {
      const race = ROAD_ULTRAS.find((item) => item.slug === slug);
      const edition = race?.editions.find((item) => item.date === date);
      if (!race || !edition) continue;
      result.set(
        id,
        publicCatalogueContent({
          id,
          name: race.name,
          date,
          endDate: edition.endDate,
          distance: race.distance,
          location: race.location,
          timeZone: "Europe/London",
          provisional: edition.provisional,
          officialUrl: edition.url,
          pageUrl: `${site}/running/ultramarathons/${slug}`,
        }),
      );
    }
  }
  return result;
}
