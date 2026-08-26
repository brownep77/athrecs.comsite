import { getSql, type Sql } from "@/lib/db";
import type { EntryOptionStatus, EntryOptionType, EntryStatus, Sport } from "./types";

// Append-only results import (athletes + finish times)
export {
  applyResultsImport,
  parseResultsCsv,
  type ResultsImportBundle,
  type ImportResultRow,
} from "./results-import.server";

const SPORTS: Sport[] = [
  "Running",
  "Athletics",
  "Parkrun",
  "Cycling",
  "Swimming",
  "Triathlon",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
  "Adventure Racing",
  "Functional Fitness",
  "Walking",
];

const STATUSES: EntryStatus[] = ["Open", "ClosingSoon", "Closed", "Finished", "TBC"];

const ENTRY_OPTION_TYPES: EntryOptionType[] = [
  "official",
  "third_party",
  "charity",
  "tour_operator",
];

const ENTRY_OPTION_STATUSES: EntryOptionStatus[] = [
  "open",
  "closing_soon",
  "ballot",
  "waitlist",
  "sold_out",
  "closed",
  "unknown",
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

function parseSport(raw: string): Sport {
  const t = raw.trim();
  if (/^track\s*(?:&|and)?\s*field$/i.test(t) || /^trackandfield$/i.test(t)) {
    return "Athletics";
  }
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

function normalizedEnum(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function parseEntryOptionType(
  raw: string | undefined,
  fallback: EntryOptionType = "official",
): EntryOptionType {
  const normalized = normalizedEnum(raw || fallback);
  const hit = ENTRY_OPTION_TYPES.find((value) => value === normalized);
  if (!hit) throw new Error(`Unknown entry type "${raw}"`);
  return hit;
}

function parseEntryOptionStatus(raw: string | undefined): EntryOptionStatus {
  const normalized = normalizedEnum(raw || "unknown");
  const hit = ENTRY_OPTION_STATUSES.find((value) => value === normalized);
  if (!hit) throw new Error(`Unknown entry option status "${raw}"`);
  return hit;
}

function entryOptionStatusForEdition(raw: string | undefined): EntryOptionStatus {
  switch (parseStatus(raw)) {
    case "Open":
      return "open";
    case "ClosingSoon":
      return "closing_soon";
    case "Closed":
    case "Finished":
      return "closed";
    default:
      return "unknown";
  }
}

function httpUrl(raw: string, label: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label} must be a complete http(s) URL`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${label} must use http or https`);
  }
  return url.toString();
}

function optionalDate(raw: string | undefined, label: string): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD`);
  }
  return value;
}

function csvBoolean(raw: string): boolean | undefined {
  if (!raw.trim()) return undefined;
  return /^(?:1|true|yes|y)$/i.test(raw.trim());
}

export type ImportEventInput = {
  name: string;
  sport: string;
  country?: string;
  county?: string;
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
  entryOptions?: ImportEntryOptionInput[];
  source?: string;
};

export type ImportEntryOptionInput = {
  providerCode?: string;
  providerName: string;
  entryUrl: string;
  entryType?: string;
  status?: string;
  priceAmount?: number;
  priceCurrency?: string;
  opensAt?: string;
  closesAt?: string;
  checkedAt?: string;
  sourceUrl?: string;
  isVerified?: boolean;
  isPrimary?: boolean;
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

/**
 * CSV supports the legacy official `entry_url` plus one provider option per row:
 * provider_name,provider_code,provider_entry_url,provider_type,provider_status,
 * provider_price,provider_currency,provider_opens,provider_closes,
 * provider_checked_at,provider_source_url,provider_verified,provider_primary.
 * Repeat an edition row to add another provider.
 */
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
      return i >= 0 ? (cols[i] ?? "") : "";
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
        country: get("country") || "England",
        county: get("county") || "Norfolk",
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
      const providerEntryUrl = get("provider_entry_url");
      const providerType = get("provider_type") || "third_party";
      const entryOptions: ImportEntryOptionInput[] | undefined = providerEntryUrl
        ? [
            {
              providerCode: get("provider_code") || undefined,
              providerName: get("provider_name") || "Entry provider",
              entryUrl: providerEntryUrl,
              entryType: providerType,
              status: get("provider_status") || "unknown",
              priceAmount: get("provider_price") ? Number(get("provider_price")) : undefined,
              priceCurrency: get("provider_currency") || undefined,
              opensAt: get("provider_opens") || undefined,
              closesAt: get("provider_closes") || undefined,
              checkedAt: get("provider_checked_at") || undefined,
              sourceUrl: get("provider_source_url") || providerEntryUrl,
              isVerified: csvBoolean(get("provider_verified")),
              isPrimary: csvBoolean(get("provider_primary")),
            },
          ]
        : undefined;
      editions.push({
        eventSlug: slug,
        eventName: name,
        date: date.slice(0, 10),
        distance: get("distance") || "Other",
        distanceKm: Number(get("distance_km") || get("km") || 0) || 0,
        status: get("status") || "TBC",
        startTime: get("start_time") || get("start") || undefined,
        entryUrl: get("entry_url") || undefined,
        entryOptions,
        source: get("source") || get("website") || undefined,
      });
    }
  }

  return { events: [...eventsMap.values()], editions };
}

export type ApplyImportOptions = {
  sqlOverride?: Sql;
  preserveExistingEvents?: boolean;
  preserveExistingPrimaryEntry?: boolean;
};

export async function applyImportBundle(
  bundle: ImportBundle,
  importOptions: ApplyImportOptions = {},
): Promise<{
  eventsUpserted: number;
  editionsUpserted: number;
  entryOptionsUpserted: number;
  errors: string[];
}> {
  const sql = importOptions.sqlOverride ?? (await getSql());
  let eventsUpserted = 0;
  let editionsUpserted = 0;
  let entryOptionsUpserted = 0;
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
        if (!importOptions.preserveExistingEvents) {
          await sql`
            update events set
              name = ${raw.name},
              sport = ${sport},
              country = ${raw.country ?? "England"},
              county = ${raw.county ?? "Norfolk"},
              city = ${raw.city ?? ""},
              area = ${raw.area ?? ""},
              surface = ${raw.surface ?? "Road"},
              summary = ${raw.summary ?? ""},
              description = ${raw.description ?? ""},
              organiser = ${raw.organiser ?? ""},
              website = ${raw.website ?? ""}
            where id = ${eventId}
          `;
        }
      } else {
        const ins = await sql<{ id: number }>`
          insert into events (
            slug, name, sport, country, county, city, area, surface,
            summary, description, organiser, website, featured
          ) values (
            ${slug}, ${raw.name}, ${sport}, ${raw.country ?? "England"},
            ${raw.county ?? "Norfolk"},
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
        await applyImportBundle(
          {
            events: [
              {
                name: raw.eventName,
                sport: "Running",
                slug,
                city: "Norfolk",
                distances: [raw.distance],
              },
            ],
          },
          { ...importOptions, sqlOverride: sql },
        );
      }
      const again = await sql<{ id: number }>`
        select id from events where slug = ${slug} limit 1
      `;
      if (!again[0]) throw new Error(`Could not resolve event ${slug}`);
      const status = parseStatus(raw.status);
      const hasExplicitPrimary = (raw.entryOptions ?? []).some(
        (option) => option.isPrimary === true,
      );
      const preserveCurrentPrimary =
        importOptions.preserveExistingPrimaryEntry === true && !hasExplicitPrimary;
      const editionRows = await sql<{ id: number }>`
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
          entry_url = case
            when ${preserveCurrentPrimary}
              and exists (
                select 1
                from edition_entry_options current_option
                where current_option.edition_id = editions.id
                  and current_option.is_primary
              )
            then editions.entry_url
            else coalesce(excluded.entry_url, editions.entry_url)
          end,
          source_url = coalesce(excluded.source_url, editions.source_url),
          start_time = excluded.start_time
        returning id
      `;
      const editionId = editionRows[0]?.id;
      if (!editionId) throw new Error(`Could not upsert edition ${slug} ${raw.date}`);

      const options = [...(raw.entryOptions ?? [])];
      if (
        raw.entryUrl &&
        !options.some((option) => {
          const code = slugify(option.providerCode || option.providerName);
          return (
            code === "official" ||
            (option.entryType != null && parseEntryOptionType(option.entryType) === "official")
          );
        })
      ) {
        options.unshift({
          providerCode: "official",
          providerName: "Official race entry",
          entryUrl: raw.entryUrl,
          entryType: "official",
          status: entryOptionStatusForEdition(raw.status),
          checkedAt: new Date().toISOString(),
          sourceUrl: raw.source || raw.entryUrl,
          isVerified: false,
          isPrimary: true,
        });
      }

      const seenProviderCodes = new Set<string>();
      const normalizedOptions = options.map((option) => {
        const providerName = option.providerName?.trim();
        if (!providerName) throw new Error("Entry provider needs providerName");
        const providerCode = slugify(option.providerCode || providerName);
        if (!providerCode) throw new Error(`Could not create provider code for ${providerName}`);
        if (seenProviderCodes.has(providerCode)) {
          throw new Error(`Duplicate entry provider code for this edition: ${providerCode}`);
        }
        seenProviderCodes.add(providerCode);
        const entryType = parseEntryOptionType(
          option.entryType,
          providerCode === "official" ? "official" : "third_party",
        );
        const priceAmount = option.priceAmount == null ? null : Number(option.priceAmount);
        if (priceAmount != null && (!Number.isFinite(priceAmount) || priceAmount < 0)) {
          throw new Error(`Bad entry price for ${providerName}`);
        }
        const priceCurrency = option.priceCurrency?.trim().toUpperCase() || null;
        if (priceCurrency && !/^[A-Z]{3}$/.test(priceCurrency)) {
          throw new Error(`Entry currency for ${providerName} must be a three-letter code`);
        }
        const checkedAt = option.checkedAt?.trim() || new Date().toISOString();
        if (Number.isNaN(Date.parse(checkedAt))) {
          throw new Error(`Bad checkedAt date for ${providerName}`);
        }
        return {
          providerCode,
          providerName,
          entryUrl: httpUrl(option.entryUrl, `Entry URL for ${providerName}`),
          entryType,
          status: parseEntryOptionStatus(option.status),
          priceAmount,
          priceCurrency,
          opensAt: optionalDate(option.opensAt, `opensAt for ${providerName}`),
          closesAt: optionalDate(option.closesAt, `closesAt for ${providerName}`),
          checkedAt,
          sourceUrl: option.sourceUrl
            ? httpUrl(option.sourceUrl, `Source URL for ${providerName}`)
            : httpUrl(option.entryUrl, `Entry URL for ${providerName}`),
          isVerified: option.isVerified === true,
          isPrimary: option.isPrimary === true,
        };
      });

      const currentPrimaryRows = preserveCurrentPrimary
        ? await sql<{ provider_code: string }>`
            select provider_code
            from edition_entry_options
            where edition_id = ${editionId} and is_primary
            limit 1
          `
        : [];
      const currentPrimaryCode = currentPrimaryRows[0]?.provider_code ?? null;
      const explicitPrimary = hasExplicitPrimary
        ? normalizedOptions.findIndex((option) => option.isPrimary)
        : -1;
      const currentPrimaryIndex = currentPrimaryCode
        ? normalizedOptions.findIndex((option) => option.providerCode === currentPrimaryCode)
        : -1;
      const officialPrimary = normalizedOptions.findIndex(
        (option) => option.entryType === "official",
      );
      const primaryIndex =
        explicitPrimary >= 0
          ? explicitPrimary
          : currentPrimaryIndex >= 0
            ? currentPrimaryIndex
            : currentPrimaryCode
              ? -1
              : officialPrimary;
      const replacePrimary = explicitPrimary >= 0 || (!currentPrimaryCode && primaryIndex >= 0);
      if (replacePrimary) {
        await sql`
          update edition_entry_options
          set is_primary = false, updated_at = now()
          where edition_id = ${editionId} and is_primary
        `;
      }
      for (const [index, option] of normalizedOptions.entries()) {
        const isPrimary = index === primaryIndex;
        await sql`
          insert into edition_entry_options (
            edition_id, provider_code, provider_name, entry_url, entry_type,
            status, price_amount, price_currency, opens_at, closes_at,
            checked_at, source_url, is_verified, is_primary, updated_at
          ) values (
            ${editionId}, ${option.providerCode}, ${option.providerName},
            ${option.entryUrl}, ${option.entryType}, ${option.status},
            ${option.priceAmount}, ${option.priceCurrency},
            ${option.opensAt}::date, ${option.closesAt}::date,
            ${option.checkedAt}::timestamptz, ${option.sourceUrl},
            ${option.isVerified}, ${isPrimary}, now()
          )
          on conflict (edition_id, provider_code) do update set
            provider_name = excluded.provider_name,
            entry_url = excluded.entry_url,
            entry_type = excluded.entry_type,
            status = excluded.status,
            price_amount = excluded.price_amount,
            price_currency = excluded.price_currency,
            opens_at = excluded.opens_at,
            closes_at = excluded.closes_at,
            checked_at = excluded.checked_at,
            source_url = excluded.source_url,
            is_verified = excluded.is_verified,
            is_primary = excluded.is_primary,
            updated_at = now()
        `;
        entryOptionsUpserted += 1;
        if (isPrimary) {
          await sql`update editions set entry_url = ${option.entryUrl} where id = ${editionId}`;
        }
      }
      editionsUpserted += 1;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  return { eventsUpserted, editionsUpserted, entryOptionsUpserted, errors };
}
