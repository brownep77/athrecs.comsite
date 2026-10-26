import type { Sql } from "../db";
import {
  FIXED_DISTANCE,
  TIMED_DISTANCE,
  DISTANCE_SPORTS,
  PLACEHOLDER,
  RACE_FORMAT,
} from "./fixture-distance-policy.ts";

/** Filter in PostgreSQL so every public read receives only small edition IDs, not global programme data. */
export async function unconfirmedFixtureEditionIds(sql: Sql, today: string): Promise<number[]> {
  const rows = await sql.query<{ id: number }>(
    `
    select ed.id from editions ed join events e on e.id=ed.event_id
    where ed.event_date >= $1::date
      and (ed.distance_km is null or ed.distance_km <= 0 or ed.distance_km = 'NaN'::float8 or ed.distance_km = 'Infinity'::float8)
      and (ed.distance_km < 0 or ed.distance_km = 'NaN'::float8 or ed.distance_km = 'Infinity'::float8
        or (not (coalesce(btrim(ed.distance_code),'') ~* $2 or coalesce(btrim(ed.distance_code),'') ~* $3)
          and (e.sport = any($4::text[]) or coalesce(btrim(ed.distance_code),'') ~* $5 or coalesce(btrim(ed.distance_code),'') ~* $6)))`,
    [
      today,
      FIXED_DISTANCE.source,
      TIMED_DISTANCE.source,
      DISTANCE_SPORTS,
      PLACEHOLDER.source,
      RACE_FORMAT.source,
    ],
  );
  return rows.map((row) => row.id);
}
