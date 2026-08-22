#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const projectRoot = new URL("..", import.meta.url).pathname;
const migrationsDir = join(projectRoot, "migrations");
const files = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();
const db = new PGlite();

for (const file of files) {
  await db.exec(await readFile(join(migrationsDir, file), "utf8"));
}

await db.exec(`
  insert into events (
    slug, name, sport, country, county, city, area, surface, summary,
    description, organiser, website, source_url, region, postcode,
    latitude, longitude, data_verified_at
  ) values (
    'verification-race', 'Verification Race', 'Running', 'England', 'Norfolk',
    'Norwich', 'City centre', 'Road', '', '', 'ATHRECS', 'https://example.com',
    'https://example.com', 'East of England', 'NR1 1AA', 52.6309, 1.2974, now()
  );
  insert into editions (event_id, event_date, distance_code, distance_km, status)
  select id, current_date + 30, '10K', 10, 'Open' from events where slug = 'verification-race';
  insert into athletes (slug, display_name) values ('verification-athlete', 'Verification Athlete');
  insert into athlete_data_consents (
    athlete_id, purpose, status, policy_version, source, granted_at
  ) select id, 'performance_insights', 'granted', 'test', 'verification', now()
    from athletes where slug = 'verification-athlete';
  insert into athlete_habit_profiles (
    athlete_id, training_days_per_week, weekly_distance_km, races_per_year,
    preferred_distances, source
  ) select id, 4, 45, 12, '["10K", "Half marathon"]'::jsonb, 'verification'
    from athletes where slug = 'verification-athlete';
  insert into site_analytics_events (
    event_name, path, entity_type, entity_slug, session_hash, consent_version
  ) values (
    'event_view', '/races/verification-race', 'event', 'verification-race',
    repeat('a', 64), 'test'
  );
`);

const geography = await db.query(`
  select country, region, city, postcode from events where slug = 'verification-race'
`);
assert.deepEqual(geography.rows[0], {
  country: "England",
  region: "East of England",
  city: "Norwich",
  postcode: "NR1 1AA",
});

const habits = await db.query(`
  select count(*)::int as responses
  from athlete_habit_profiles h
  join athlete_data_consents consent on consent.athlete_id = h.athlete_id
    and consent.purpose = 'performance_insights'
    and consent.status = 'granted'
`);
assert.equal(habits.rows[0].responses, 1);

await db.exec(`
  update athlete_data_consents set status = 'withdrawn', withdrawn_at = now()
  where purpose = 'performance_insights'
`);
const withdrawn = await db.query(`
  select count(*)::int as responses
  from athlete_habit_profiles h
  join athlete_data_consents consent on consent.athlete_id = h.athlete_id
    and consent.purpose = 'performance_insights'
    and consent.status = 'granted'
`);
assert.equal(
  withdrawn.rows[0].responses,
  0,
  "withdrawn consent must remove the athlete from insights",
);

await assert.rejects(
  db.exec(`
    insert into site_analytics_events (event_name, path, session_hash, consent_version)
    values ('fingerprint', '/', repeat('b', 64), 'test')
  `),
  /check constraint/i,
);

const source = await readFile(
  join(projectRoot, "src/lib/athrecs/data-intelligence-api.ts"),
  "utf8",
);
assert.match(
  source,
  /middleware\(\[staffMiddleware\]\)/,
  "dashboard must remain behind staff auth",
);
assert.doesNotMatch(source, /x-forwarded-for|x-real-ip/i, "analytics must not read an IP header");

await db.close();
console.log(
  "Data intelligence verification passed: migrations, consent isolation and privacy constraints are valid.",
);
