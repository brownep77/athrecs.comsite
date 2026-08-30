import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  scorePotentialResultNameMatch,
  uniquePotentialMatchNames,
} from "./result-match";
import { ensureAthrecsSeeded } from "./seed.server";

export type ExternalRunnerMatchSource =
  | "powerof10"
  | "parkrun"
  | "worldathletics"
  | "official"
  | "other";

export type ExternalRunnerMatch = {
  source: ExternalRunnerMatchSource;
  sourceUrl: string;
  athleteName: string;
  club: string;
  location: string;
  eventName: string;
  eventDate: string;
  distance: string;
  finishTime: string;
  confidence: "exact" | "strong" | "possible";
  why: string;
  resultId: number | null;
  eventSlug: string | null;
};

export type ExternalRunnerSearchResponse = {
  available: boolean;
  consentRequired: boolean;
  message: string;
  searchedNames: string[];
  matches: ExternalRunnerMatch[];
  cached: boolean;
};

type IdentityRow = {
  auth_name: string;
  full_name: string | null;
  display_name: string | null;
  previous_names: string[] | null;
  city: string | null;
  region: string | null;
  country: string | null;
  club_or_team: string | null;
  parkrun_id: string | null;
  athletics_urn: string | null;
  power_of_10_url: string | null;
  world_athletics_url: string | null;
  fingerprint_event: string | null;
  fingerprint_year: string | null;
  fingerprint_distance: string | null;
  fingerprint_time: string | null;
  performance_insights: string | null;
};

type CacheRow = {
  status: "ok" | "unavailable" | "error";
  payload: ExternalRunnerSearchResponse | string;
  created_at: string;
};

const CACHE_MS = 7 * 24 * 60 * 60 * 1000;

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

function text(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function sourceFromUrl(url: string): ExternalRunnerMatchSource {
  const value = url.toLowerCase();
  if (value.includes("powerof10") || value.includes("thepowerof10")) return "powerof10";
  if (value.includes("parkrun")) return "parkrun";
  if (value.includes("worldathletics")) return "worldathletics";
  if (value.startsWith("https://")) return "official";
  return "other";
}

function cacheKey(identity: IdentityRow): string {
  return [
    text(identity.full_name).toLowerCase(),
    (identity.previous_names ?? []).join("|").toLowerCase(),
    text(identity.club_or_team).toLowerCase(),
    text(identity.city).toLowerCase(),
    text(identity.parkrun_id).toLowerCase(),
    text(identity.athletics_urn).toLowerCase(),
    text(identity.fingerprint_event).toLowerCase(),
    text(identity.fingerprint_year),
  ].join("::");
}

function extractJsonObject(raw: string): unknown {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  const textValue = fenced?.[1] ?? raw;
  const start = textValue.indexOf("{");
  const end = textValue.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(textValue.slice(start, end + 1));
  } catch {
    return null;
  }
}

function asMatches(value: unknown): ExternalRunnerMatch[] {
  if (!value || typeof value !== "object") return [];
  const candidates = Array.isArray(value)
    ? value
    : Array.isArray((value as { candidates?: unknown }).candidates)
      ? ((value as { candidates: unknown[] }).candidates)
      : Array.isArray((value as { matches?: unknown }).matches)
        ? ((value as { matches: unknown[] }).matches)
        : [];
  const matches: ExternalRunnerMatch[] = [];
  for (const item of candidates) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const sourceUrl = text(typeof row.sourceUrl === "string" ? row.sourceUrl : String(row.source_url ?? ""));
    if (!/^https:\/\//i.test(sourceUrl)) continue;
    const athleteName = text(String(row.athleteName ?? row.athlete_name ?? ""));
    const eventName = text(String(row.eventName ?? row.event_name ?? ""));
    if (!athleteName && !eventName) continue;
    const confidence =
      row.confidence === "exact" || row.confidence === "strong" || row.confidence === "possible"
        ? row.confidence
        : "possible";
    matches.push({
      source: sourceFromUrl(sourceUrl),
      sourceUrl,
      athleteName,
      club: text(String(row.club ?? "")),
      location: text(String(row.location ?? "")),
      eventName,
      eventDate: text(String(row.eventDate ?? row.event_date ?? "")),
      distance: text(String(row.distance ?? "")),
      finishTime: text(String(row.finishTime ?? row.finish_time ?? "")),
      confidence,
      why: text(String(row.why ?? "Public result page matched the saved identity fields.")),
      resultId: null,
      eventSlug: null,
    });
  }
  return matches.slice(0, 20);
}

function responseText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const root = payload as Record<string, unknown>;
  if (typeof root.output_text === "string") return root.output_text;
  if (Array.isArray(root.output)) {
    const chunks: string[] = [];
    for (const item of root.output) {
      if (!item || typeof item !== "object") continue;
      const content = (item as { content?: unknown }).content;
      if (typeof content === "string") chunks.push(content);
      if (!Array.isArray(content)) continue;
      for (const part of content) {
        if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") {
          chunks.push((part as { text: string }).text);
        }
      }
    }
    if (chunks.length) return chunks.join("\n");
  }
  const choices = root.choices;
  if (Array.isArray(choices) && choices[0] && typeof choices[0] === "object") {
    const message = (choices[0] as { message?: { content?: unknown } }).message;
    if (typeof message?.content === "string") return message.content;
  }
  return "";
}

async function callXai(prompt: string): Promise<{ ok: boolean; text: string; model: string; error?: string }> {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, text: "", model: "", error: "missing-key" };
  }
  const model = process.env.XAI_MODEL?.trim() || "grok-4.6";
  const body = {
    model,
    input: [
      {
        role: "system",
        content:
          "Find publicly listed race results that may belong to this athlete. Use only sourced pages. Never invent a finish time or URL. Prefer Power of 10, parkrun, World Athletics and official result pages. Return JSON {\"candidates\":[{sourceUrl,athleteName,club,location,eventName,eventDate,distance,finishTime,confidence,why}]}.",
      },
      { role: "user", content: prompt },
    ],
    tools: [{ type: "web_search" }],
  };

  const response = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { ok: false, text: "", model, error: `xAI ${response.status} ${detail.slice(0, 240)}` };
  }
  const payload = await response.json();
  return { ok: true, text: responseText(payload), model };
}

async function attachAthrecsResults(
  sql: Awaited<ReturnType<typeof getSql>>,
  matches: ExternalRunnerMatch[],
  searchedNames: string[],
  identity: IdentityRow,
): Promise<ExternalRunnerMatch[]> {
  if (!matches.length || !searchedNames.length) return matches;
  const accountContext = {
    city: identity.city,
    region: identity.region,
    country: identity.country,
    clubOrTeam: identity.club_or_team,
  };
  const eventNames = [...new Set(matches.map((match) => match.eventName).filter((value) => value.length >= 4))];
  if (!eventNames.length) return matches;

  const rows = await sql<{
    result_id: number;
    athlete_name: string;
    event_name: string;
    event_slug: string;
    event_date: string;
    club_name: string | null;
    athlete_city: string | null;
    athlete_region: string | null;
    athlete_country: string | null;
  }>`
    select
      result.id as result_id,
      athlete.display_name as athlete_name,
      event.name as event_name,
      event.slug as event_slug,
      edition.event_date::text as event_date,
      club.name as club_name,
      athlete.city as athlete_city,
      athlete.county as athlete_region,
      athlete.country as athlete_country
    from results result
    join athletes athlete on athlete.id = result.athlete_id
    join editions edition on edition.id = result.edition_id
    join events event on event.id = edition.event_id
    left join clubs club on club.id = athlete.club_id
    where result.status = 'finished'
      and event.name = any(${eventNames}::text[])
    order by edition.event_date desc
    limit 200
  `;

  return matches.map((match) => {
    const linked = rows.find((row) => {
      const name = scorePotentialResultNameMatch(
        searchedNames,
        row.athlete_name,
        accountContext,
        {
          city: row.athlete_city,
          region: row.athlete_region,
          country: row.athlete_country,
          clubName: row.club_name,
        },
      );
      if (!name) return false;
      if (match.eventDate && row.event_date && !row.event_date.startsWith(match.eventDate.slice(0, 4))) {
        return false;
      }
      return row.event_name.toLowerCase() === match.eventName.toLowerCase();
    });
    if (!linked) return match;
    return { ...match, resultId: linked.result_id, eventSlug: linked.event_slug };
  });
}

export const findExternalRunnerMatches = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ExternalRunnerSearchResponse> => {
    const sql = await ready();
    const identities = await sql<IdentityRow>`
      select
        account_user."name" as auth_name,
        profile.full_name,
        profile.display_name,
        profile.previous_names,
        profile.city,
        profile.region,
        profile.country,
        profile.club_or_team,
        profile.parkrun_id,
        profile.athletics_urn,
        profile.power_of_10_url,
        profile.world_athletics_url,
        profile.fingerprint_event,
        profile.fingerprint_year,
        profile.fingerprint_distance,
        profile.fingerprint_time,
        consent.status as performance_insights
      from "user" account_user
      left join athlete_private_profiles profile on profile.user_id = account_user."id"
      left join athlete_account_consents consent
        on consent.user_id = account_user."id"
       and consent.purpose = 'performance_insights'
      where account_user."id" = ${context.userId}
      limit 1
    `;
    const identity = identities[0];
    const searchedNames = uniquePotentialMatchNames([
      identity?.full_name,
      identity?.display_name,
      identity?.auth_name,
      ...(identity?.previous_names ?? []),
    ]);

    if (!identity?.full_name) {
      return {
        available: false,
        consentRequired: false,
        message: "Save your full name in the Identity section before searching public result sites.",
        searchedNames,
        matches: [],
        cached: false,
      };
    }
    if (identity.performance_insights !== "granted") {
      return {
        available: false,
        consentRequired: true,
        message:
          "Turn on Performance and habit insights, then save your Athlete Account, before ATHRECS asks Grok to search public result sites.",
        searchedNames,
        matches: [],
        cached: false,
      };
    }

    const key = cacheKey(identity);
    const cached = await sql<CacheRow>`
      select status, payload, created_at::text as created_at
      from athlete_external_match_searches
      where user_id = ${context.userId} and cache_key = ${key}
      order by created_at desc
      limit 1
    `;
    const cachedRow = cached[0];
    if (cachedRow && Date.now() - new Date(cachedRow.created_at).getTime() < CACHE_MS) {
      const payload =
        typeof cachedRow.payload === "string"
          ? (JSON.parse(cachedRow.payload) as ExternalRunnerSearchResponse)
          : cachedRow.payload;
      return { ...payload, cached: true };
    }

    const prompt = JSON.stringify(
      {
        fullName: identity.full_name,
        alsoKnownAs: identity.previous_names ?? [],
        club: identity.club_or_team,
        city: identity.city,
        region: identity.region,
        country: identity.country,
        parkrunId: identity.parkrun_id,
        athleticsUrn: identity.athletics_urn,
        powerOf10Url: identity.power_of_10_url,
        worldAthleticsUrl: identity.world_athletics_url,
        fingerprintRace: {
          event: identity.fingerprint_event,
          year: identity.fingerprint_year,
          distance: identity.fingerprint_distance,
          time: identity.fingerprint_time,
        },
      },
      null,
      2,
    );

    let matches: ExternalRunnerMatch[] = [];
    let available = true;
    let message = "Public result sites searched. These are suggestions, not confirmed ownership.";
    let status: "ok" | "unavailable" | "error" = "ok";
    let model = process.env.XAI_MODEL?.trim() || "grok-4.6";

    try {
      const result = await callXai(prompt);
      model = result.model || model;
      if (!result.ok && result.error === "missing-key") {
        available = false;
        status = "unavailable";
        message =
          "Public search is wired, but XAI_API_KEY is not set on this deployment yet. ATHRECS matches still work.";
      } else if (!result.ok) {
        available = false;
        status = "error";
        message = "Public result search is temporarily unavailable. ATHRECS name matches are unaffected.";
      } else {
        matches = asMatches(extractJsonObject(result.text));
        matches = await attachAthrecsResults(sql, matches, searchedNames, identity);
        if (!matches.length) {
          message =
            "No sourced public-result candidates were returned. Add a previous name, club, parkrun ID or a known race and try again.";
        }
      }
    } catch {
      available = false;
      status = "error";
      message = "Public result search could not run. ATHRECS name matches are unaffected.";
    }

    const payload: ExternalRunnerSearchResponse = {
      available,
      consentRequired: false,
      message,
      searchedNames,
      matches,
      cached: false,
    };

    await sql`
      insert into athlete_external_match_searches (
        user_id, cache_key, status, model, payload, created_at
      ) values (
        ${context.userId}, ${key}, ${status}, ${model}, ${JSON.stringify(payload)}::jsonb, now()
      )
      on conflict (user_id, cache_key) do update set
        status = excluded.status,
        model = excluded.model,
        payload = excluded.payload,
        created_at = now()
    `;

    return payload;
  });
