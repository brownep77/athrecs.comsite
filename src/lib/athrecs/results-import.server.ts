import { getSql } from "@/lib/db";
import { slugify } from "./import.server";

export type ImportResultRow = {
  eventSlug: string;
  date: string;
  distance: string;
  place?: number;
  bib?: string;
  athleteSlug?: string;
  givenName?: string;
  familyName?: string;
  displayName?: string;
  athleteName?: string;
  gender?: "M" | "F" | "U" | "X" | string;
  category?: string;
  time?: string;
  finishTimeSeconds?: number;
  chipTimeSeconds?: number;
  gunTimeSeconds?: number;
  clubSlug?: string;
  clubName?: string;
  source?: string;
  resultSource?: string;
  city?: string;
  county?: string;
  country?: string;
  distanceKm?: number;
  status?: string;
  genderPlace?: number;
  categoryPlace?: number;
};

export type ResultsImportBundle = { results: ImportResultRow[] };

export function timeToSeconds(time: string | undefined | null): number | null {
  if (!time?.trim()) return null;
  const parts = time.trim().replace(",", ".").split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 3) return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  if (parts.length === 2) return Math.round(parts[0] * 60 + parts[1]);
  if (parts.length === 1) return Math.round(parts[0]);
  return null;
}

function resolveDisplayName(row: ImportResultRow): string {
  if (row.displayName?.trim()) return row.displayName.trim();
  if (row.athleteName?.trim()) return row.athleteName.trim();
  const joined = `${row.givenName?.trim() ?? ""} ${row.familyName?.trim() ?? ""}`.trim();
  if (joined) return joined;
  if (row.athleteSlug) {
    return row.athleteSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  throw new Error("Result row needs displayName, athleteName, givenName/familyName, or athleteSlug");
}

function resolveAthleteSlug(row: ImportResultRow, displayName: string): string {
  if (row.athleteSlug?.trim()) return slugify(row.athleteSlug);
  return slugify(displayName);
}

function resolveClubSlug(row: ImportResultRow): string {
  if (row.clubSlug?.trim()) return slugify(row.clubSlug);
  const name = (row.clubName || "Unattached").trim();
  if (!name || /^unattached$/i.test(name) || name === "-") return "unattached";
  return slugify(name);
}

export async function applyResultsImport(bundle: ResultsImportBundle): Promise<{
  athletesUpserted: number;
  resultsUpserted: number;
  clubsUpserted: number;
  editionsEnsured: number;
  skipped: number;
  errors: string[];
}> {
  const sql = await getSql();
  let athletesUpserted = 0;
  let resultsUpserted = 0;
  let clubsUpserted = 0;
  let editionsEnsured = 0;
  let skipped = 0;
  const errors: string[] = [];
  const rows = bundle.results ?? [];
  if (!rows.length) {
    return { athletesUpserted: 0, resultsUpserted: 0, clubsUpserted: 0, editionsEnsured: 0, skipped: 0, errors: ["No results[] rows"] };
  }

  const clubIdBySlug = new Map<string, number>();
  const athleteIdBySlug = new Map<string, number>();
  const editionIdByKey = new Map<string, number>();
  const eventIdBySlug = new Map<string, number>();

  const existingClubs = await sql<{ id: number; slug: string }>`select id, slug from clubs`;
  for (const c of existingClubs) clubIdBySlug.set(c.slug, c.id);
  const existingEvents = await sql<{ id: number; slug: string }>`select id, slug from events`;
  for (const e of existingEvents) eventIdBySlug.set(e.slug, e.id);

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    try {
      if (!raw.eventSlug?.trim()) throw new Error("eventSlug required");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.date || "")) throw new Error(`Bad date "${raw.date}"`);
      if (!raw.distance?.trim()) throw new Error("distance required");

      const displayName = resolveDisplayName(raw);
      const athleteSlug = resolveAthleteSlug(raw, displayName);
      const clubSlug = resolveClubSlug(raw);
      const gender = ((raw.gender || "U").toString().trim().toUpperCase().slice(0, 1) || "U");
      const finishSecs = raw.finishTimeSeconds ?? raw.chipTimeSeconds ?? timeToSeconds(raw.time) ?? 0;

      let clubId = clubIdBySlug.get(clubSlug);
      if (clubId == null) {
        const clubName = (raw.clubName || "Unattached").trim() || "Unattached";
        const ins = await sql<{ id: number }>`
          insert into clubs (slug, name, city, county, country, sports, summary, source_names)
          values (${clubSlug}, ${clubName}, ${raw.city ?? ""}, ${raw.county ?? "Norfolk"}, ${raw.country ?? "England"}, ${"Running"}, ${clubName}, ${clubName})
          on conflict (slug) do update set name = excluded.name returning id`;
        clubId = ins[0].id;
        clubIdBySlug.set(clubSlug, clubId);
        clubsUpserted += 1;
      }

      let eventId = eventIdBySlug.get(raw.eventSlug);
      if (eventId == null) {
        const eventName = raw.eventSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        const ins = await sql<{ id: number }>`
          insert into events (slug, name, sport, country, county, city, area, surface, summary, description, organiser, website, featured)
          values (${raw.eventSlug}, ${eventName}, ${"Running"}, ${"England"}, ${"Norfolk"}, ${"Norwich"}, ${""}, ${"Road"}, ${eventName}, ${""}, ${""}, ${""}, ${false})
          on conflict (slug) do update set name = excluded.name returning id`;
        eventId = ins[0].id;
        eventIdBySlug.set(raw.eventSlug, eventId);
        await sql`insert into event_distances (event_id, distance_code) values (${eventId}, ${raw.distance}) on conflict do nothing`;
      }

      const edKey = `${raw.eventSlug}|${raw.date}|${raw.distance}`;
      let editionId = editionIdByKey.get(edKey);
      if (editionId == null) {
        const existing = await sql<{ id: number }>`
          select id from editions where event_id = ${eventId} and event_date = ${raw.date}::date and distance_code = ${raw.distance} limit 1`;
        if (existing[0]) {
          editionId = existing[0].id;
        } else {
          const ins = await sql<{ id: number }>`
            insert into editions (event_id, event_date, distance_code, distance_km, status, source_url)
            values (${eventId}, ${raw.date}::date, ${raw.distance}, ${raw.distanceKm ?? 10}, ${"Finished"}, ${raw.source ?? null})
            on conflict (event_id, event_date, distance_code) do update set status = excluded.status returning id`;
          editionId = ins[0].id;
          editionsEnsured += 1;
        }
        editionIdByKey.set(edKey, editionId);
      }

      let athleteId = athleteIdBySlug.get(athleteSlug);
      if (athleteId == null) {
        const existing = await sql<{ id: number }>`select id from athletes where slug = ${athleteSlug} limit 1`;
        if (existing[0]) {
          athleteId = existing[0].id;
        } else {
          const given = raw.givenName?.trim() || displayName.split(/\s+/)[0] || null;
          const family = raw.familyName?.trim() || (displayName.includes(" ") ? displayName.split(/\s+/).slice(1).join(" ") : null);
          const ins = await sql<{ id: number }>`
            insert into athletes (slug, display_name, given_name, family_name, gender, club_id, source_club_name, city, county, country, bio)
            values (${athleteSlug}, ${displayName}, ${given}, ${family}, ${gender}, ${clubId}, ${raw.clubName ?? null}, ${raw.city ?? "Norfolk"}, ${raw.county ?? "Norfolk"}, ${raw.country ?? "England"}, ${""})
            on conflict (slug) do update set display_name = excluded.display_name returning id`;
          athleteId = ins[0].id;
          athletesUpserted += 1;
          await sql`
            insert into athlete_clubs (athlete_id, club_id, relationship, source_name)
            values (${athleteId}, ${clubId}, ${"primary"}, ${raw.clubName ?? null})
            on conflict (athlete_id, club_id, relationship) do nothing`;
        }
        athleteIdBySlug.set(athleteSlug, athleteId);
      }

      await sql`
        insert into results (edition_id, athlete_id, status, finish_time_seconds, chip_time_seconds, gun_time_seconds, bib, overall_place, gender_place, category, category_place, result_source, source_url)
        values (${editionId}, ${athleteId}, ${raw.status ?? "finished"}, ${finishSecs}, ${raw.chipTimeSeconds ?? null}, ${raw.gunTimeSeconds ?? null}, ${raw.bib ?? null}, ${raw.place ?? null}, ${raw.genderPlace ?? null}, ${raw.category ?? null}, ${raw.categoryPlace ?? null}, ${raw.resultSource ?? "import"}, ${raw.source ?? null})
        on conflict (edition_id, athlete_id) do update set
          finish_time_seconds = excluded.finish_time_seconds,
          overall_place = excluded.overall_place,
          category = excluded.category,
          bib = excluded.bib`;
      resultsUpserted += 1;
    } catch (e) {
      skipped += 1;
      errors.push(`row ${i + 1}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { athletesUpserted, resultsUpserted, clubsUpserted, editionsEnsured, skipped, errors };
}
