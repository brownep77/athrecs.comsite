import { getSql } from "@/lib/db";
import type { EntryStatus, Sport } from "./types";

const SPORTS: Sport[] = [
  "Running",
  "Athletics",
  "Cycling",
  "Swimming",
  "Triathlon",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
];

const STATUSES: EntryStatus[] = [
  "Open",
  "ClosingSoon",
  "Closed",
  "Finished",
  "TBC",
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseSport(raw: string): Sport {
  const t = raw.trim();
  const hit = SPORTS.find((s) => s.toLowerCase() === t.toLowerCase());
  if (!hit) throw new Error(`Unknown sport "${raw}". Use: ${SPORTS.join(", ")}`);
  return hit;
}

function parseStatus(raw: string | undefined): EntryStatus {
  if (!raw?.trim()) return "TBC";
  const t = raw.trim();
  const hit = STATUSES.find((s) => s.toLowerCase() === t.toLowerCase());
  if (!hit) throw new Error(`Unknown status "${raw}"`);
  return hit;
}

export type ImportEventInput = {
  name: string;
  sport: string;
  city?: string;
  area?: string;
  surface?: string;
  summary?: string;
  description?: string;
  organiser?: string;
  website?: string;
  distances?: string[];
  slug?: string;
};

export type ImportEditionInput = {
  eventSlug?: string;
  eventName?: string;
  date: string;
  distance: string;
  distanceKm?: number;
  status?: string;
  startTime?: string;
  entryUrl?: string;
  source?: string;
};

export type ImportBundle = {
  events?: ImportEventInput[];
  editions?: ImportEditionInput[];
};

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQ = !inQ;
      continue;
    }
    if (ch === "," && !inQ) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** CSV columns: name,sport,city,date,distance,distance_km,status,start_time,website,organiser,surface,entry_url */
export function parseEventsCsv(csv: string): {
  events: ImportEventInput[];
  editions: ImportEditionInput[];
} {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (lines.length < 2) throw new Error("CSV needs a header row and at least one data row");

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const idx = (name: string) => headers.indexOf(name);

  const eventsMap = new Map<string, ImportEventInput>();
  const editions: ImportEditionInput[] = [];

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const get = (name: string) => {
      const i = idx(name);
      return i >= 0 ? cols[i] ?? "" : "";
    };
    const name = get("name") || get("event") || get("event_name");
    if (!name) continue;
    const sport = get("sport") || "Running";
    const city = get("city") || "Norfolk";
    const slug = slugify(get("slug") || name);
    if (!eventsMap.has(slug)) {
      eventsMap.set(slug, {
        slug,
        name,
        sport,
        city,
        area: get("area") || "",
        surface: get("surface") || "Road",
        summary: get("summary") || `${name} — Norfolk`,
        description: get("description") || "",
        organiser: get("organiser") || "",
        website: get("website") || get("entry_url") || "",
        distances: get("distance") ? [get("distance")] : [],
      });
    } else if (get("distance")) {
      const e = eventsMap.get(slug)!;
      if (!e.distances?.includes(get("distance"))) {
        e.distances = [...(e.distances ?? []), get("distance")];
      }
    }
    const date = get("date") || get("event_date");
    if (date) {
      editions.push({
        eventSlug: slug,
        eventName: name,
        date: date.slice(0, 10),
        distance: get("distance") || "Other",
        distanceKm: Number(get("distance_km") || get("km") || 0) || 0,
        status: get("status") || "TBC",
        startTime: get("start_time") || get("start") || undefined,
        entryUrl: get("entry_url") || undefined,
        source: get("source") || get("website") || undefined,
      });
    }
  }

  return { events: [...eventsMap.values()], editions };
}

export async function applyImportBundle(bundle: ImportBundle): Promise<{
  eventsUpserted: number;
  editionsUpserted: number;
  errors: string[];
}> {
  const sql = await getSql();
  let eventsUpserted = 0;
  let editionsUpserted = 0;
  const errors: string[] = [];

  for (const raw of bundle.events ?? []) {
    try {
      const sport = parseSport(raw.sport);
      const slug = slugify(raw.slug || raw.name);
      const distances = raw.distances?.length ? raw.distances : ["Other"];
      const existing = await sql<{ id: number }>`
        select id from events where slug = ${slug} limit 1
      `;
      let eventId: number;
      if (existing[0]) {
        eventId = existing[0].id;
        await sql`
          update events set
            name = ${raw.name},
            sport = ${sport},
            city = ${raw.city ?? ""},
            area = ${raw.area ?? ""},
            surface = ${raw.surface ?? "Road"},
            summary = ${raw.summary ?? ""},
            description = ${raw.description ?? ""},
            organiser = ${raw.organiser ?? ""},
            website = ${raw.website ?? ""}
          where id = ${eventId}
        `;
      } else {
        const ins = await sql<{ id: number }>`
          insert into events (
            slug, name, sport, country, county, city, area, surface,
            summary, description, organiser, website, featured
          ) values (
            ${slug}, ${raw.name}, ${sport}, ${"England"}, ${"Norfolk"},
            ${raw.city ?? ""}, ${raw.area ?? ""}, ${raw.surface ?? "Road"},
            ${raw.summary ?? ""}, ${raw.description ?? ""},
            ${raw.organiser ?? ""}, ${raw.website ?? ""}, ${false}
          ) returning id
        `;
        eventId = ins[0].id;
      }
      for (const d of distances) {
        await sql`
          insert into event_distances (event_id, distance_code)
          values (${eventId}, ${d}) on conflict do nothing
        `;
      }
      eventsUpserted += 1;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  for (const raw of bundle.editions ?? []) {
    try {
      const slug = slugify(raw.eventSlug || raw.eventName || "");
      if (!slug) throw new Error("Edition needs eventSlug or eventName");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) {
        throw new Error(`Bad date "${raw.date}" — use YYYY-MM-DD`);
      }
      const ev = await sql<{ id: number }>`
        select id from events where slug = ${slug} limit 1
      `;
      if (!ev[0]) {
        // create minimal event from edition
        if (!raw.eventName) throw new Error(`No event for slug ${slug}`);
        await applyImportBundle({
          events: [
            {
              name: raw.eventName,
              sport: "Running",
              slug,
              city: "Norfolk",
              distances: [raw.distance],
            },
          ],
        });
      }
      const again = await sql<{ id: number }>`
        select id from events where slug = ${slug} limit 1
      `;
      if (!again[0]) throw new Error(`Could not resolve event ${slug}`);
      const status = parseStatus(raw.status);
      await sql`
        insert into editions (
          event_id, event_date, distance_code, distance_km, status,
          entry_url, source_url, start_time
        ) values (
          ${again[0].id}, ${raw.date}::date, ${raw.distance},
          ${raw.distanceKm ?? 0}, ${status},
          ${raw.entryUrl ?? null}, ${raw.source ?? null}, ${raw.startTime ?? null}
        )
        on conflict (event_id, event_date, distance_code) do update set
          distance_km = excluded.distance_km,
          status = excluded.status,
          entry_url = excluded.entry_url,
          source_url = excluded.source_url,
          start_time = excluded.start_time
      `;
      editionsUpserted += 1;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  return { eventsUpserted, editionsUpserted, errors };
}
