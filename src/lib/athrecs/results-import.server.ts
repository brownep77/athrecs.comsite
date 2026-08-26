import { createHash, randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import { slugify } from "./import.server";

export type ResultAcquisitionMethod = "scan" | "upload" | "api" | "manual";

export type ResultIngestionMetadata = {
  sport?: string;
  sourceName?: string;
  sourceUrl?: string;
  acquisitionMethod?: ResultAcquisitionMethod;
  fileName?: string;
  notes?: string;
};

export type ImportResultRow = {
  eventSlug: string;
  eventName?: string;
  sport?: string;
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

export type ResultsImportBundle = {
  results: ImportResultRow[];
  ingestion?: ResultIngestionMetadata;
};

export type ResultsImportOptions = {
  metadata?: ResultIngestionMetadata;
  requestedByUserId?: string;
  sourceContent?: string;
};

type EventLookup = { id: number; slug: string; name: string; sport: string };
type AthleteLookup = { id: number; profileType: string };
type Coverage = {
  eventId: number;
  editionId: number;
  sport: string;
  eventName: string;
  eventSlug: string;
  eventDate: string;
  distanceCode: string;
  sourceUrl: string | null;
  detected: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
};

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    if (char === '"') {
      if (quoted && csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && csv[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error("CSV has an unclosed quoted value");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function csvHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function csvNumber(value: string, label: string, rowNumber: number): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`CSV row ${rowNumber}: ${label} must be a number`);
  return parsed;
}

/** Parse a timing-provider or spreadsheet CSV into the canonical result bundle. */
export function parseResultsCsv(csv: string): ResultsImportBundle {
  const table = parseCsvRows(csv);
  if (table.length < 2) throw new Error("CSV needs a header and at least one result row");
  const headers = table[0].map(csvHeader);
  const index = (names: string[]) => names.map((name) => headers.indexOf(name)).find((i) => i >= 0);
  const value = (cells: string[], ...names: string[]) => {
    const column = index(names);
    return column == null ? "" : (cells[column] ?? "").trim();
  };
  for (const required of ["event_slug", "date", "distance"] as const) {
    if (!headers.includes(required)) throw new Error(`CSV header is missing ${required}`);
  }

  const results = table.slice(1).map((cells, offset): ImportResultRow => {
    const rowNumber = offset + 2;
    return {
      eventSlug: value(cells, "event_slug", "event"),
      eventName: value(cells, "event_name") || undefined,
      sport: value(cells, "sport") || undefined,
      date: value(cells, "date", "event_date"),
      distance: value(cells, "distance", "distance_code"),
      place: csvNumber(value(cells, "place", "overall_place", "position"), "place", rowNumber),
      bib: value(cells, "bib", "bib_number") || undefined,
      athleteSlug: value(cells, "athlete_slug") || undefined,
      givenName: value(cells, "given_name", "first_name", "firstname") || undefined,
      familyName: value(cells, "family_name", "last_name", "surname", "lastname") || undefined,
      displayName: value(cells, "display_name") || undefined,
      athleteName: value(cells, "athlete_name", "athlete", "name") || undefined,
      gender: value(cells, "gender", "sex") || undefined,
      category: value(cells, "category", "age_category") || undefined,
      time: value(cells, "time", "finish_time") || undefined,
      finishTimeSeconds: csvNumber(
        value(cells, "finish_time_seconds"),
        "finish_time_seconds",
        rowNumber,
      ),
      chipTimeSeconds: csvNumber(
        value(cells, "chip_time_seconds", "chip_seconds"),
        "chip_time_seconds",
        rowNumber,
      ),
      gunTimeSeconds: csvNumber(
        value(cells, "gun_time_seconds", "gun_seconds"),
        "gun_time_seconds",
        rowNumber,
      ),
      clubSlug: value(cells, "club_slug") || undefined,
      clubName: value(cells, "club_name", "club", "team") || undefined,
      source: value(cells, "source", "source_url") || undefined,
      resultSource: value(cells, "result_source", "provider") || undefined,
      city: value(cells, "city", "town") || undefined,
      county: value(cells, "county", "region") || undefined,
      country: value(cells, "country") || undefined,
      distanceKm: csvNumber(value(cells, "distance_km"), "distance_km", rowNumber),
      status: value(cells, "status") || undefined,
      genderPlace: csvNumber(value(cells, "gender_place"), "gender_place", rowNumber),
      categoryPlace: csvNumber(value(cells, "category_place"), "category_place", rowNumber),
    };
  });
  return { results };
}

export function timeToSeconds(time: string | undefined | null): number | null {
  if (!time?.trim()) return null;
  const parts = time.trim().replace(",", ".").split(":").map(Number);
  if (parts.some((part) => Number.isNaN(part))) return null;
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
    return row.athleteSlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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

function shortText(value: string | undefined, max: number): string {
  return value?.trim().slice(0, max) ?? "";
}

function httpsUrl(value: string | undefined): string | null {
  const text = value?.trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function acquisitionMethod(value: unknown): ResultAcquisitionMethod {
  if (value === "scan" || value === "api" || value === "manual") return value;
  return "upload";
}

function eventTitle(row: ImportResultRow): string {
  return (
    row.eventName?.trim() ||
    row.eventSlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export async function applyResultsImport(
  bundle: ResultsImportBundle,
  options: ResultsImportOptions = {},
): Promise<{
  runId: string;
  sport: string;
  sourceName: string;
  athletesUpserted: number;
  resultsUpserted: number;
  resultsInserted: number;
  resultsUpdated: number;
  clubsUpserted: number;
  editionsEnsured: number;
  editionsTracked: number;
  skipped: number;
  errors: string[];
}> {
  const sql = await getSql();
  const rows = Array.isArray(bundle.results) ? bundle.results : [];
  const suppliedMetadata = Object.fromEntries(
    Object.entries(options.metadata ?? {}).filter(([, value]) => value !== undefined && value !== ""),
  ) as ResultIngestionMetadata;
  const metadata = { ...(bundle.ingestion ?? {}), ...suppliedMetadata };
  const sport = shortText(metadata.sport || rows[0]?.sport || "Running", 80) || "Running";
  const sourceName = shortText(metadata.sourceName, 160) || "ATHRECS results import";
  const sourceUrl = httpsUrl(metadata.sourceUrl || rows[0]?.source);
  const runId = randomUUID();
  const fileSha256 = createHash("sha256")
    .update(options.sourceContent ?? JSON.stringify(rows))
    .digest("hex");
  const requestedByUserId = options.requestedByUserId?.trim() || null;
  const requester = requestedByUserId
    ? await sql<{ email: string }>`
        select lower("email") as email from "user" where "id" = ${requestedByUserId} limit 1
      `
    : [];

  await sql`
    insert into result_ingestion_runs (
      id, sport, source_name, source_url, acquisition_method, file_name,
      file_sha256, status, requested_by_user_id, requested_by_email,
      rows_detected, notes
    ) values (
      ${runId}, ${sport}, ${sourceName}, ${sourceUrl},
      ${acquisitionMethod(metadata.acquisitionMethod)},
      ${shortText(metadata.fileName, 240) || null}, ${fileSha256}, 'processing',
      ${requestedByUserId}, ${requester[0]?.email ?? null}, ${rows.length},
      ${shortText(metadata.notes, 2000)}
    )
  `;

  let athletesUpserted = 0;
  let resultsUpserted = 0;
  let resultsInserted = 0;
  let resultsUpdated = 0;
  let clubsUpserted = 0;
  let editionsEnsured = 0;
  let skipped = 0;
  const errors: string[] = [];
  const coverage = new Map<string, Coverage>();

  if (!rows.length) errors.push("No results[] rows");

  const clubIdBySlug = new Map<string, number>();
  const athleteBySlug = new Map<string, AthleteLookup>();
  const editionIdByKey = new Map<string, number>();
  const eventBySlug = new Map<string, EventLookup>();

  try {
    const existingClubs = await sql<{ id: number; slug: string }>`select id, slug from clubs`;
    for (const club of existingClubs) clubIdBySlug.set(club.slug, club.id);
    const existingEvents = await sql<EventLookup>`select id, slug, name, sport from events`;
    for (const event of existingEvents) eventBySlug.set(event.slug, event);

  for (let index = 0; index < rows.length; index += 1) {
    const raw = rows[index];
    let coverageRow: Coverage | undefined;
    try {
      if (!raw.eventSlug?.trim()) throw new Error("eventSlug required");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.date || "")) {
        throw new Error(`Bad date "${raw.date}"`);
      }
      if (!raw.distance?.trim()) throw new Error("distance required");

      const displayName = resolveDisplayName(raw);
      const athleteSlug = resolveAthleteSlug(raw, displayName);
      const clubSlug = resolveClubSlug(raw);
      const gender = raw.gender?.toString().trim().toUpperCase().slice(0, 1) || "U";
      const finishSecs =
        raw.finishTimeSeconds ?? raw.chipTimeSeconds ?? timeToSeconds(raw.time) ?? 0;

      let clubId = clubIdBySlug.get(clubSlug);
      if (clubId == null) {
        const clubName = (raw.clubName || "Unattached").trim() || "Unattached";
        const inserted = await sql<{ id: number }>`
          insert into clubs (slug, name, city, county, country, sports, summary, source_names)
          values (
            ${clubSlug}, ${clubName}, ${raw.city ?? ""}, ${raw.county ?? ""},
            ${raw.country ?? ""}, ${sport}, ${clubName}, ${clubName}
          )
          on conflict (slug) do update set name = excluded.name
          returning id
        `;
        clubId = inserted[0].id;
        clubIdBySlug.set(clubSlug, clubId);
        clubsUpserted += 1;
      }

      let event = eventBySlug.get(raw.eventSlug);
      if (!event) {
        const name = eventTitle(raw);
        const eventSport = shortText(raw.sport || sport, 80) || "Running";
        const inserted = await sql<EventLookup>`
          insert into events (
            slug, name, sport, country, county, city, area, surface,
            summary, description, organiser, website, featured
          ) values (
            ${raw.eventSlug}, ${name}, ${eventSport}, ${raw.country ?? ""},
            ${raw.county ?? ""}, ${raw.city ?? ""}, '', 'Road', ${name}, '', '', '', false
          )
          on conflict (slug) do update set name = excluded.name
          returning id, slug, name, sport
        `;
        event = inserted[0];
        eventBySlug.set(raw.eventSlug, event);
      }
      await sql`
        insert into event_distances (event_id, distance_code)
        values (${event.id}, ${raw.distance})
        on conflict do nothing
      `;

      const editionKey = `${raw.eventSlug}|${raw.date}|${raw.distance}`;
      let editionId = editionIdByKey.get(editionKey);
      if (editionId == null) {
        const existing = await sql<{ id: number }>`
          select id from editions
          where event_id = ${event.id}
            and event_date = ${raw.date}::date
            and distance_code = ${raw.distance}
          limit 1
        `;
        if (existing[0]) {
          editionId = existing[0].id;
        } else {
          const inserted = await sql<{ id: number }>`
            insert into editions (
              event_id, event_date, distance_code, distance_km, status, source_url
            ) values (
              ${event.id}, ${raw.date}::date, ${raw.distance},
              ${raw.distanceKm ?? 0}, 'Finished', ${raw.source ?? sourceUrl}
            )
            on conflict (event_id, event_date, distance_code)
            do update set status = excluded.status
            returning id
          `;
          editionId = inserted[0].id;
          editionsEnsured += 1;
        }
        editionIdByKey.set(editionKey, editionId);
      }

      coverageRow = coverage.get(editionKey);
      if (!coverageRow) {
        coverageRow = {
          eventId: event.id,
          editionId,
          sport: event.sport,
          eventName: event.name,
          eventSlug: event.slug,
          eventDate: raw.date,
          distanceCode: raw.distance,
          sourceUrl: httpsUrl(raw.source) ?? sourceUrl,
          detected: 0,
          imported: 0,
          updated: 0,
          skipped: 0,
          errors: [],
        };
        coverage.set(editionKey, coverageRow);
      }
      coverageRow.detected += 1;

      let athlete = athleteBySlug.get(athleteSlug);
      if (!athlete) {
        const existing = await sql<{ id: number; profile_type: string }>`
          select id, profile_type from athletes where slug = ${athleteSlug} limit 1
        `;
        if (existing[0]) {
          athlete = { id: existing[0].id, profileType: existing[0].profile_type };
        } else {
          const given = raw.givenName?.trim() || displayName.split(/\s+/)[0] || null;
          const family =
            raw.familyName?.trim() ||
            (displayName.includes(" ") ? displayName.split(/\s+/).slice(1).join(" ") : null);
          const inserted = await sql<{ id: number; profile_type: string }>`
            insert into athletes (
              slug, display_name, given_name, family_name, gender, club_id,
              source_club_name, city, county, country, bio, profile_visibility
            ) values (
              ${athleteSlug}, ${displayName}, ${given}, ${family}, ${gender}, ${clubId},
              ${raw.clubName ?? null}, ${raw.city ?? ""}, ${raw.county ?? ""},
              ${raw.country ?? ""}, '', 'private'
            )
            on conflict (slug) do update set display_name = excluded.display_name
            returning id, profile_type
          `;
          athlete = { id: inserted[0].id, profileType: inserted[0].profile_type };
          athletesUpserted += 1;
          await sql`
            insert into athlete_clubs (athlete_id, club_id, relationship, source_name)
            values (${athlete.id}, ${clubId}, 'primary', ${raw.clubName ?? null})
            on conflict (athlete_id, club_id, relationship) do nothing
          `;
        }
        athleteBySlug.set(athleteSlug, athlete);
      }

      const existingResult = await sql<{ id: number }>`
        select id from results
        where edition_id = ${editionId} and athlete_id = ${athlete.id}
        limit 1
      `;
      const visibility = athlete.profileType === "Public figure" ? "public_figure" : "private";
      await sql`
        insert into results (
          edition_id, athlete_id, status, finish_time_seconds, chip_time_seconds,
          gun_time_seconds, bib, overall_place, gender_place, category,
          category_place, result_source, source_url, result_visibility, ingestion_run_id
        ) values (
          ${editionId}, ${athlete.id}, ${raw.status ?? "finished"}, ${finishSecs},
          ${raw.chipTimeSeconds ?? null}, ${raw.gunTimeSeconds ?? null}, ${raw.bib ?? null},
          ${raw.place ?? null}, ${raw.genderPlace ?? null}, ${raw.category ?? null},
          ${raw.categoryPlace ?? null}, ${raw.resultSource ?? "import"},
          ${raw.source ?? sourceUrl}, ${visibility}, ${runId}
        )
        on conflict (edition_id, athlete_id) do update set
          status = excluded.status,
          finish_time_seconds = excluded.finish_time_seconds,
          chip_time_seconds = excluded.chip_time_seconds,
          gun_time_seconds = excluded.gun_time_seconds,
          overall_place = excluded.overall_place,
          gender_place = excluded.gender_place,
          category = excluded.category,
          category_place = excluded.category_place,
          bib = excluded.bib,
          result_source = excluded.result_source,
          source_url = excluded.source_url,
          result_visibility = case
            when excluded.result_visibility = 'public_figure' then 'public_figure'
            else results.result_visibility
          end,
          ingestion_run_id = excluded.ingestion_run_id
      `;
      resultsUpserted += 1;
      if (existingResult[0]) {
        resultsUpdated += 1;
        coverageRow.updated += 1;
      } else {
        resultsInserted += 1;
        coverageRow.imported += 1;
      }
    } catch (error) {
      skipped += 1;
      const message = `row ${index + 1}: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(message);
      if (coverageRow) {
        coverageRow.skipped += 1;
        coverageRow.errors.push(message);
      }
    }
  }

  for (const item of coverage.values()) {
    const successful = item.imported + item.updated;
    const status = item.skipped === 0 ? "complete" : successful > 0 ? "partial" : "failed";
    await sql`
      insert into result_ingestion_editions (
        ingestion_run_id, event_id, edition_id, sport, event_name, event_slug,
        event_date, distance_code, source_url, status, rows_detected,
        rows_imported, rows_updated, rows_skipped, error_count, error_summary,
        finished_at, updated_at
      ) values (
        ${runId}, ${item.eventId}, ${item.editionId}, ${item.sport}, ${item.eventName},
        ${item.eventSlug}, ${item.eventDate}::date, ${item.distanceCode}, ${item.sourceUrl},
        ${status}, ${item.detected}, ${item.imported}, ${item.updated}, ${item.skipped},
        ${item.errors.length}, ${item.errors.slice(0, 20).join("; ") || null}, now(), now()
      )
      on conflict (ingestion_run_id, edition_id) do update set
        status = excluded.status,
        rows_detected = excluded.rows_detected,
        rows_imported = excluded.rows_imported,
        rows_updated = excluded.rows_updated,
        rows_skipped = excluded.rows_skipped,
        error_count = excluded.error_count,
        error_summary = excluded.error_summary,
        finished_at = now(),
        updated_at = now()
    `;
  }

  const status =
    errors.length === 0
      ? "completed"
      : resultsUpserted > 0
        ? "completed_with_errors"
        : "failed";
  await sql`
    update result_ingestion_runs set
      status = ${status},
      rows_imported = ${resultsInserted},
      rows_updated = ${resultsUpdated},
      rows_skipped = ${skipped},
      edition_count = ${coverage.size},
      error_count = ${errors.length},
      error_summary = ${errors.slice(0, 20).join("; ") || null},
      finished_at = now(),
      updated_at = now()
    where id = ${runId}
  `;

    return {
      runId,
      sport,
      sourceName,
      athletesUpserted,
      resultsUpserted,
      resultsInserted,
      resultsUpdated,
      clubsUpserted,
      editionsEnsured,
      editionsTracked: coverage.size,
      skipped,
      errors,
    };
  } catch (error) {
    const fatalMessage = error instanceof Error ? error.message : String(error);
    await sql`
      update result_ingestion_runs set
        status = 'failed',
        rows_imported = ${resultsInserted},
        rows_updated = ${resultsUpdated},
        rows_skipped = ${skipped},
        edition_count = ${coverage.size},
        error_count = ${errors.length + 1},
        error_summary = ${`Fatal import error: ${fatalMessage}`.slice(0, 2000)},
        finished_at = now(),
        updated_at = now()
      where id = ${runId}
    `.catch(() => undefined);
    throw error;
  }
}
