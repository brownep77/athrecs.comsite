import { createHash, randomUUID } from "node:crypto";
import { load } from "cheerio";
import { auditResults } from "../../../scripts/lib/result-evidence-audit.mjs";
import type { Sql } from "../db.ts";
import { parseBrowserCapture } from "../results-archive/browser-capture.ts";
import { mapArchiveRows } from "../results-archive/core.ts";
import {
  sourceCheckSchema,
  sourceNameKey,
  trtResultUrl,
  type SourceCheckInput,
  type SourceCheckResponse,
  type SourceCheckRow,
} from "./source-check.ts";

const PROVIDER = "Total Race Timing";
const PROVIDER_KEY = "total-race-timing";
const ROBOTS_URL = "https://totalracetiming.co.uk/robots.txt";
const AGENT = "AthRecsResultsArchive/1.0 (+https://athrecs.com)";
const MAX_ROWS = 50;
const MAX_MATCH_TEXT = 100_000;
const MIN_SPACING_MS = 2_000;
const MAX_WAIT_MS = 6_000;
type Actor = { userId: string; staffEmail: string };
type Dependencies = { sql?: Sql; fetcher?: typeof fetch; wait?: (ms: number) => Promise<void> };
type FailureStatus = Exclude<SourceCheckResponse["status"], "checked">;

class SourceCheckError extends Error {
  readonly status: FailureStatus;
  readonly retry: number | null;
  constructor(message: string, status: FailureStatus = "unavailable", retry: number | null = null) {
    super(message);
    this.status = status;
    this.retry = retry;
  }
}

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

/** Match the applicable robots groups and longest path rule; allow wins a tie. */
export function sourceRobotsPolicy(robots: string, path: string) {
  if (/^\s*</.test(robots))
    throw new SourceCheckError("The source returned a web page instead of crawl rules.", "blocked");
  type Group = { agents: string[]; rules: { allow: boolean; path: string }[]; delay: number };
  const groups: Group[] = [];
  let group: Group | null = null;
  let hasDirectives = false;
  for (const line of robots.split(/\r?\n/)) {
    const plain = line.split("#", 1)[0].trim();
    const colon = plain.indexOf(":");
    if (colon < 0) continue;
    const key = plain.slice(0, colon).trim().toLowerCase(),
      value = plain.slice(colon + 1).trim();
    if (key === "user-agent") {
      if (!group || hasDirectives) {
        group = { agents: [], rules: [], delay: 0 };
        groups.push(group);
        hasDirectives = false;
      }
      group.agents.push(value.toLowerCase());
    } else if (group && group.agents.length) {
      hasDirectives = true;
      if ((key === "allow" || key === "disallow") && value) {
        if (value.length > 1000 || (value.match(/\*/g)?.length ?? 0) > 20)
          throw new SourceCheckError(
            "The published crawl rules need manual interpretation.",
            "blocked",
          );
        group.rules.push({ allow: key === "allow", path: value });
      }
      if (key === "crawl-delay") {
        const delay = Number(value);
        if (!Number.isFinite(delay) || delay < 0 || !value)
          throw new SourceCheckError(
            "The published crawl delay needs manual interpretation.",
            "blocked",
          );
        group.delay = Math.max(group.delay, delay);
      }
      if (key === "request-rate") {
        const rate = value.match(/^(\d+)\s*\/\s*(\d+)$/);
        if (!rate || Number(rate[1]) < 1)
          throw new SourceCheckError(
            "The published request rate needs manual interpretation.",
            "blocked",
          );
        group.delay = Math.max(group.delay, Number(rate[2]) / Number(rate[1]));
      }
    }
  }
  const agent = AGENT.toLowerCase();
  const strength = (g: Group) =>
    Math.max(-1, ...g.agents.map((a) => (a === "*" ? 0 : a && agent.includes(a) ? a.length : -1)));
  const best = Math.max(-1, ...groups.map(strength));
  const selected = best < 0 ? [] : groups.filter((g) => strength(g) === best);
  let priority = -1,
    allowed = true;
  for (const rule of selected.flatMap((g) => g.rules)) {
    const normalized = rule.path.replace(/%([0-9a-f]{2})/gi, (raw, hex: string) => {
      const c = String.fromCharCode(parseInt(hex, 16));
      return /[A-Za-z0-9._~-]/.test(c) ? c : raw.toUpperCase();
    });
    const end = normalized.endsWith("$");
    const pattern = end ? normalized.slice(0, -1) : normalized;
    // Bounded dynamic matching avoids regexp backtracking on third-party rules.
    let matches = new Uint8Array(path.length + 1);
    matches[0] = 1;
    for (const character of pattern) {
      const next = new Uint8Array(path.length + 1);
      if (character === "*") {
        next[0] = matches[0];
        for (let i = 1; i <= path.length; i++) next[i] = matches[i] || next[i - 1];
      } else {
        for (let i = 1; i <= path.length; i++)
          next[i] = Number(Boolean(matches[i - 1]) && path[i - 1] === character);
      }
      matches = next;
    }
    if (end ? !matches[path.length] : !matches.some(Boolean)) continue;
    const score = normalized.replace(/[*$]/g, "").length;
    if (score > priority || (score === priority && rule.allow)) {
      priority = score;
      allowed = rule.allow;
    }
  }
  return { allowed, crawlDelaySeconds: Math.max(0, ...selected.map((g) => g.delay)) };
}

async function reserveUser(sql: Sql, actor: Actor, url: string, requestId: string) {
  await sql.transaction(async (tx) => {
    await tx`set local lock_timeout = '2s'`;
    await tx`set local statement_timeout = '4s'`;
    await tx`select pg_advisory_xact_lock(hashtext('athrecs:source-check-user'),hashtext(${actor.userId}))`;
    const [recent] = await tx<{ short: number; hour: number }>`
      select count(*) filter(where created_at>clock_timestamp()-interval '5 minutes')::int as short,
      count(*)::int as hour from network_audit_log
      where actor_user_id=${actor.userId} and action='athlete.source_check_requested'
        and created_at>clock_timestamp()-interval '1 hour'`;
    if (recent.hour >= 60)
      throw new SourceCheckError(
        "This staff account has reached the hourly source-check limit.",
        "rate_limited",
        3600,
      );
    if (recent.short >= 10)
      throw new SourceCheckError(
        "Source checks are paused for this staff account. Try again in five minutes.",
        "rate_limited",
        300,
      );
    await tx`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,after_value,note)
      values(${actor.userId},'athlete.source_check_requested','athlete_source_check',${requestId},
        ${JSON.stringify({ sourceUrl: url })}::jsonb,'Staff requested a single results-page preview; no result import or publication.')`;
  });
}

/** Durable request reservations coordinate all instances of this new endpoint. */
async function reserveProvider(sql: Sql, actor: Actor, spacingMs: number) {
  return sql.transaction(async (tx) => {
    await tx`set local lock_timeout = '2s'`;
    await tx`set local statement_timeout = '4s'`;
    await tx`select pg_advisory_xact_lock(hashtext('athrecs:source-check-provider'))`;
    const [times] = await tx<{ now: string; until: string | null; scheduled: string | null }>`
      select clock_timestamp()::text as now,
        max((after_value->>'nextAllowedAt')::timestamptz)::text as until,
        max((after_value->>'scheduledAt')::timestamptz)::text as scheduled
      from (select after_value from network_audit_log
        where entity_type='athlete_source_provider' and entity_id=${PROVIDER_KEY}
          and action in ('athlete.source_provider_reserved','athlete.source_provider_cooldown')
        order by created_at desc,id desc limit 100) recent`;
    const now = Date.parse(times.now);
    const start = Math.max(
      now,
      Date.parse(times.until ?? "") || 0,
      (Date.parse(times.scheduled ?? "") || 0) + spacingMs,
    );
    const delay = Math.max(0, start - now);
    if (delay > MAX_WAIT_MS)
      throw new SourceCheckError(
        "This source is resting between requests or has limited access. Try again after the indicated wait.",
        "rate_limited",
        Math.ceil(delay / 1000),
      );
    await tx`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,after_value)
      values(${actor.userId},'athlete.source_provider_reserved','athlete_source_provider',${PROVIDER_KEY},
        ${JSON.stringify({ scheduledAt: new Date(start).toISOString(), nextAllowedAt: new Date(start + spacingMs).toISOString() })}::jsonb)`;
    return delay;
  });
}

async function checkCooldown(sql: Sql) {
  const [blocked] = await sql<{ retry: number | null }>`select
    ceil(extract(epoch from max((after_value->>'nextAllowedAt')::timestamptz)-clock_timestamp()))::int as retry
    from (select after_value from network_audit_log where entity_type='athlete_source_provider'
      and entity_id=${PROVIDER_KEY} and action='athlete.source_provider_cooldown'
      order by created_at desc,id desc limit 1) recent`;
  if ((blocked.retry ?? 0) > 0)
    throw new SourceCheckError(
      "The provider has limited or denied access. No further source request was made.",
      "rate_limited",
      blocked.retry,
    );
}

async function cooldown(sql: Sql, actor: Actor, retrySeconds: number, reason: string) {
  await sql`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,after_value,note)
    values(${actor.userId},'athlete.source_provider_cooldown','athlete_source_provider',${PROVIDER_KEY},
      ${JSON.stringify({ nextAllowedAt: new Date(Date.now() + retrySeconds * 1000).toISOString() })}::jsonb,${reason})`;
}

async function fetchText(
  url: string,
  robots: boolean,
  sql: Sql,
  actor: Actor,
  spacing: number,
  fetcher: typeof fetch,
  wait: (ms: number) => Promise<void>,
) {
  if (url !== ROBOTS_URL && trtResultUrl(url) !== url)
    throw new SourceCheckError(
      "This link is outside the supported public results route.",
      "blocked",
    );
  const delay = await reserveProvider(sql, actor, spacing);
  if (delay) await wait(delay);
  await checkCooldown(sql);
  const response = await fetcher(url, {
    redirect: "error",
    signal: AbortSignal.timeout(robots ? 10_000 : 18_000),
    headers: { "User-Agent": AGENT, Accept: robots ? "text/plain" : "text/html" },
  });
  if ([401, 403, 429].includes(response.status)) {
    const retry = response.headers.get("retry-after") ?? "";
    const supplied = /^\d+$/.test(retry)
      ? Number(retry)
      : Math.ceil((Date.parse(retry) - Date.now()) / 1000);
    // An invalidly huge Retry-After must still stop access without overflowing Date.
    const seconds = Math.min(
      315_360_000,
      Math.max(response.status === 429 ? 60 : 900, Number.isFinite(supplied) ? supplied : 0),
    );
    await response.body?.cancel();
    await cooldown(
      sql,
      actor,
      seconds,
      `Provider returned HTTP ${response.status}; no bypass or retry.`,
    );
    throw new SourceCheckError(
      `The source returned HTTP ${response.status}. Access was stopped; no results were imported.`,
      "blocked",
      seconds,
    );
  }
  if (robots && response.status === 404) {
    await response.body?.cancel();
    return "";
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw new SourceCheckError(
      `The ${robots ? "crawl-rules page" : "results page"} returned HTTP ${response.status}.`,
    );
  }
  if (
    robots &&
    /text\/html|application\/(?:json|xml)/i.test(response.headers.get("content-type") ?? "")
  ) {
    await response.body?.cancel();
    throw new SourceCheckError(
      "The source returned another document format instead of crawl rules.",
      "blocked",
    );
  }
  if (!robots && !response.headers.get("content-type")?.toLowerCase().includes("text/html")) {
    await response.body?.cancel();
    throw new SourceCheckError(
      "This adapter reads HTML results tables; this link returned another format.",
    );
  }
  const maxBytes = robots ? 256_000 : 6_000_000;
  if (Number(response.headers.get("content-length")) > maxBytes) {
    await response.body?.cancel();
    throw new SourceCheckError("The source response exceeds this preview's size limit.");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new SourceCheckError("The source response was empty.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes)
        throw new SourceCheckError("The source response exceeds this preview's size limit.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
}

/** Uses the existing TRT scanner's labelled table format, without its club filter. */
export function readTrtNameMatches(
  html: string,
  url: string,
  raw: SourceCheckInput,
  fetchedAt: string,
) {
  const input = sourceCheckSchema.parse(raw),
    $ = load(html);
  $("br").replaceWith(" ");
  const eventName = clean(
    $("h2").first().text() || $("h1").first().text() || $("title").text(),
  ).slice(0, 500);
  const names = new Map<string, string>();
  [input.name, ...input.aliases].forEach((name, i) => {
    const key = sourceNameKey(name);
    if (!names.has(key)) names.set(key, i === 0 ? "Racing name matches" : "Name variation matches");
  });
  const rows: SourceCheckRow[] = [],
    reviewCaptures: SourceCheckResponse["reviewCaptures"] = [],
    issues: string[] = [];
  const raceId = new URL(url).pathname.split("/").at(-1)!;
  let sourceRows = 0,
    matchedRows = 0,
    supportedTables = 0,
    searchableRows = 0,
    textSize = 0;
  $("table").each((tableIndex, element) => {
    const table = $(element),
      heading = table.prevAll("h3").first();
    const distance = clean(heading.text()).slice(0, 200),
      tableNumber = tableIndex + 1;
    const anchor = /^sr\d+$/.test(heading.attr("id") ?? "") ? heading.attr("id")! : "";
    const sourceUrl = url + (anchor ? `#${anchor}` : "");
    const headings = table
      .find("thead th")
      .map((_, th) => clean($(th).text()))
      .get();
    const sourceTableRows = table
      .find("tbody tr")
      .toArray()
      .map((tr) =>
        $(tr)
          .find("td")
          .map((_, td) => clean($(td).text()))
          .get(),
      )
      .filter((r) => r.length > 0);
    sourceRows += sourceTableRows.length;
    if (sourceRows > 50_000)
      throw new SourceCheckError("This results page has too many rows for one interactive check.");
    const splitNames = headings.includes("Forename") && headings.includes("Surname");
    const nameHeading = ["Name", "Full Name", "Full name", "Athlete Name"].find((h) =>
      headings.includes(h),
    );
    if (!splitNames && !nameHeading) {
      if (sourceTableRows.length)
        issues.push(
          `Table ${tableNumber} has no supported athlete-name headings and was not searched.`,
        );
      return;
    }
    const headers = headings.map((h, i) => h || `Unlabelled source column ${i + 1}`);
    const ambiguous =
      new Set(headers).size !== headers.length ||
      headers.length > 60 ||
      headers.some((h) => h.length > 150);
    if (ambiguous) {
      issues.push(
        `Table ${tableNumber} has ambiguous or unsupported headings and was not searched.`,
      );
      return;
    }
    supportedTables++;
    const start = clean(table.prevAll("p").first().text());
    const dates = start.match(/\b\d{2}\/\d{2}\/\d{4}\b/g) ?? [];
    const possibleDate = dates.length === 1 ? dates[0].split("/").reverse().join("-") : "";
    const date =
      possibleDate &&
      !Number.isNaN(Date.parse(possibleDate)) &&
      new Date(possibleDate).toISOString().slice(0, 10) === possibleDate
        ? possibleDate
        : null;
    const bibHeading = ["Tag", "Bib", "Runner Number"].find((h) => headings.includes(h));
    const bibIndex = bibHeading ? headings.indexOf(bibHeading) : -1;
    const bibCounts = new Map<string, number>();
    for (const cells of sourceTableRows)
      if (bibIndex >= 0 && cells[bibIndex])
        bibCounts.set(cells[bibIndex], (bibCounts.get(cells[bibIndex]) ?? 0) + 1);
    const handoffRows: string[][] = [],
      handoffLinks: string[][] = [];
    const derivedHeaders: string[] = [];
    const addHeader = (base: string) => {
      let name = base,
        suffix = 1;
      while (headers.includes(name) || derivedHeaders.includes(name)) name = `${base} ${++suffix}`;
      derivedHeaders.push(name);
    };
    addHeader("Source key");
    if (!nameHeading) addHeader("Full name");
    addHeader("Source table");
    addHeader("Source row");
    let tableMatches = 0;
    sourceTableRows.forEach((cells, rowIndex) => {
      if (cells.length !== headers.length) {
        issues.push(
          `Table ${tableNumber} contains rows whose cells do not match the headings; those rows were not searched.`,
        );
        return;
      }
      const original = Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ""]));
      const name = splitNames
        ? clean(`${original.Forename ?? ""} ${original.Surname ?? ""}`)
        : original[nameHeading!];
      if (!sourceNameKey(name)) return;
      searchableRows++;
      const matchReason = names.get(sourceNameKey(name));
      if (!matchReason) return;
      matchedRows++;
      tableMatches++;
      if (rows.length >= MAX_ROWS) return;
      if (
        cells.some((cell) => cell.length > 4000) ||
        textSize + cells.join("").length > MAX_MATCH_TEXT
      ) {
        issues.push(
          "Some matching source text exceeds the preview limit; inspect those rows on the source page.",
        );
        return;
      }
      const club = original.Club ?? "",
        bib = bibIndex >= 0 ? (cells[bibIndex] ?? "") : "";
      const rowIssues = ["Potential name match only; athlete identity has not been checked."];
      if (!date) rowIssues.push("The source date is missing or ambiguous.");
      if (!distance) rowIssues.push("The source distance/table heading is missing.");
      if (!bib)
        rowIssues.push(
          "No bib was supplied; the page, table and printed row number are the locator.",
        );
      if (bib && (bibCounts.get(bib) ?? 0) > 1)
        rowIssues.push(
          "This bib is repeated within the source table; use the printed row locator.",
        );
      if (input.club && !club) rowIssues.push("No club is listed at source.");
      else if (input.club && sourceNameKey(input.club) !== sourceNameKey(club))
        rowIssues.push(
          "The listed club differs from the search clue; check historical membership.",
        );
      const locator = bib && bibCounts.get(bib) === 1 ? `bib:${bib}` : `row:${rowIndex + 1}`;
      const key = `trt:${raceId}:${anchor || `table-${tableNumber}`}:${locator}`;
      rows.push({
        key,
        name,
        club,
        bib,
        date,
        distance,
        table: tableNumber,
        row: rowIndex + 1,
        sourceUrl,
        original,
        matchReason,
        issues: rowIssues,
      });
      textSize += cells.join("").length;
      if (cells.length === headers.length && key.length <= 300) {
        handoffRows.push([
          ...cells,
          key,
          ...(!nameHeading ? [name] : []),
          String(tableNumber),
          String(rowIndex + 1),
        ]);
        handoffLinks.push([sourceUrl]);
      }
    });
    if (handoffRows.length && reviewCaptures.length < 10) {
      const warnings = [
        `Selected matching rows only: ${handoffRows.length} of ${sourceTableRows.length} rows in source table ${tableNumber}. This is not a complete race result sheet.`,
        "Server-fetched single-page preview. No athlete identity, ownership or result verification has been established. Review the source before importing.",
        `Derived locator/name columns: ${derivedHeaders.join(", ")}. The original source columns are retained.`,
        ...(tableMatches > handoffRows.length
          ? ["Some matching rows were omitted by preview limits or require manual layout review."]
          : []),
        ...(date
          ? [`Source table date: ${date}.`]
          : ["The source table date needs manual review."]),
      ];
      const capture = {
        format: "athrecs-browser-results-v1",
        scope: "loaded-page-only",
        capturedAt: fetchedAt,
        page: { url: sourceUrl, title: eventName },
        table: {
          label: (distance || `Table ${tableNumber}`).slice(0, 100),
          headers: [...headers, ...derivedHeaders],
          rows: handoffRows,
          rowLinks: handoffLinks,
        },
        warnings,
      };
      try {
        if (!eventName || !distance || !date || !anchor)
          throw new Error("The source race, date, distance or table locator needs manual review.");
        if (sourceTableRows.some((cells) => cells.length !== headings.length))
          throw new Error("The full original table contains rows with an ambiguous layout.");
        const parsedCapture = parseBrowserCapture(JSON.stringify(capture));
        const proposals = mapArchiveRows(parsedCapture.table, parsedCapture.mapping);
        if (proposals.some((proposal) => !proposal.name || proposal.finishSeconds === null))
          throw new Error("The source finish status or timing headings need manual review.");
        const audit = auditResults(
          proposals.map((proposal) => ({
            id: proposal.sourceKey,
            athlete_id: proposal.sourceKey,
            display_name: proposal.name,
            event_name: eventName,
            event_date: date,
            distance_code: distance,
            status: proposal.status,
            result_visibility: "private",
            source_url: sourceUrl,
            source_bib: proposal.original.Tag ?? proposal.bib,
            finish_time_seconds: proposal.finishSeconds,
            chip_time_seconds: proposal.chipSeconds,
            gun_time_seconds: proposal.gunSeconds,
            overall_place: proposal.overallPlace,
            gender_place: proposal.genderPlace,
            category_place: proposal.categoryPlace,
          })),
          [
            {
              url: sourceUrl,
              headings: [eventName, distance],
              startTimes: dates,
              rowCount: sourceTableRows.length,
              // Retain the full independently parsed original table for comparison.
              // Never reconstruct source evidence from the matched proposals.
              tables: [{ headers: headings, rows: sourceTableRows }],
            },
          ],
          fetchedAt.slice(0, 10),
        );
        const flags = [
          ...new Set([
            ...audit.issues.flatMap((entry) => entry.flags),
            ...audit.comparisons.flatMap((entry) => entry.flags),
            ...(audit.scope.untestedResults || audit.comparisons.length !== proposals.length
              ? ["source_comparison_incomplete"]
              : []),
          ]),
        ];
        if (flags.length)
          throw new Error(`Source-row comparison needs review: ${flags.join(", ")}.`);
        capture.warnings.push(
          `The independent TRT source-row comparison found no flags for these ${proposals.length} proposed rows against the full original table at capture time. This does not establish athlete identity or result verification; edited values require a new comparison.`,
        );
        reviewCaptures.push({
          table: tableNumber,
          label: distance || `Table ${tableNumber}`,
          matchedRows: handoffRows.length,
          json: JSON.stringify(capture),
        });
      } catch (error) {
        const detail =
          error instanceof Error
            ? error.message.slice(0, 500)
            : "The source comparison is incomplete.";
        for (const row of rows.filter((row) => row.table === tableNumber))
          row.issues.push(`Automatic import handoff withheld: ${detail}`);
        issues.push(
          `Table ${tableNumber} cannot be passed to the import tool automatically. ${detail} Inspect its matching rows on the original page.`,
        );
      }
    } else if (handoffRows.length) {
      issues.push(
        "Only the first ten matching tables can be queued for import review; use the original page for the remaining tables.",
      );
    }
  });
  if (!supportedTables) {
    if (
      /captcha|verify (?:that )?you are human|access denied|just a moment/i.test(
        $("title").text() + " " + $("h1").text(),
      )
    )
      throw new SourceCheckError(
        "The source presented an access challenge. The check stopped without bypassing it.",
        "blocked",
        900,
      );
    throw new SourceCheckError(
      "No supported athlete result tables were found. The page may require manual or browser collection.",
    );
  }
  if (!searchableRows)
    throw new SourceCheckError(
      "No visible, supported athlete rows were available to search. The page may require browser or manual collection; this is not a checked no-match result.",
    );
  if (matchedRows > rows.length)
    issues.push(
      `Only ${rows.length} of ${matchedRows} matching rows are included in this bounded preview.`,
    );
  if (!matchedRows)
    issues.push(
      "No name match was found in the supported rows on this page. This does not establish that the athlete did not participate; other aliases, pages or unsupported rows may need review.",
    );
  return {
    eventName,
    sourceRows,
    matchedRows,
    returnedRows: rows.length,
    truncated: matchedRows > rows.length,
    rows,
    reviewCaptures,
    issues: [...new Set(issues)].slice(0, 30),
  };
}

export async function checkSourcePage(
  raw: SourceCheckInput,
  actor: Actor,
  dependencies: Dependencies = {},
): Promise<SourceCheckResponse> {
  if (!actor.userId || !actor.staffEmail) throw new Error("Verified staff access is required.");
  const input = sourceCheckSchema.parse(raw),
    url = trtResultUrl(input.url);
  const response: SourceCheckResponse = {
    status: "unavailable",
    provider: url ? PROVIDER : "Unsupported source",
    sourceUrl: url ?? input.url,
    eventName: "",
    checkedAt: new Date().toISOString(),
    fetchedAt: null,
    robotsCheckedAt: null,
    cacheStatus: "not_fetched",
    sourceRows: null,
    matchedRows: null,
    returnedRows: 0,
    truncated: false,
    rows: [],
    reviewCaptures: [],
    issues: [],
    retryAfterSeconds: null,
    coverage: { pagesChecked: 0, scope: "single_results_page" },
  };
  if (!url)
    return {
      ...response,
      issues: [
        "Live checks currently support a real Total Race Timing results link: https://totalracetiming.co.uk/raceresults/<id>. Other source adapters are not active. No website was fetched.",
      ],
    };
  let sql = dependencies.sql;
  if (!sql) {
    const { dbSource, getSql } = await import("../db.ts");
    if (dbSource !== "neon")
      return {
        ...response,
        issues: [
          "Connect persistent storage before running live source checks; the shared request limits must be durable.",
        ],
      };
    sql = await getSql();
  }
  const requestId = randomUUID(),
    fetcher = dependencies.fetcher ?? fetch;
  const wait =
    dependencies.wait ?? ((ms) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  try {
    await reserveUser(sql, actor, url, requestId);
    const robots = await fetchText(ROBOTS_URL, true, sql, actor, MIN_SPACING_MS, fetcher, wait);
    response.robotsCheckedAt = new Date().toISOString();
    const policy = sourceRobotsPolicy(robots, new URL(url).pathname);
    if (!policy.allowed)
      throw new SourceCheckError(
        "Published crawl rules disallow this results page. No participant page was fetched.",
        "blocked",
      );
    const spacing = Math.max(MIN_SPACING_MS, Math.ceil(policy.crawlDelaySeconds * 1000));
    if (spacing > MAX_WAIT_MS)
      throw new SourceCheckError(
        "The source requires a longer crawl delay than this interactive preview supports. Open the original link for manual review.",
        "blocked",
        Math.ceil(spacing / 1000),
      );
    const html = await fetchText(url, false, sql, actor, spacing, fetcher, wait);
    response.fetchedAt = new Date().toISOString();
    response.cacheStatus = "live";
    response.coverage.pagesChecked = 1;
    const parsed = readTrtNameMatches(html, url, input, response.fetchedAt);
    await sql`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,after_value,note)
      values(${actor.userId},'athlete.source_check_completed','athlete_source_check',${requestId},
        ${JSON.stringify({ sourceUrl: url, fetchedAt: response.fetchedAt, sourceHash: createHash("sha256").update(html).digest("hex"), sourceRows: parsed.sourceRows, matchedRows: parsed.matchedRows })}::jsonb,
        'Private single-page preview only; original HTML and participant names were not logged. No result was imported or verified.')`;
    return { ...response, ...parsed, status: "checked", checkedAt: new Date().toISOString() };
  } catch (error) {
    const failure =
      error instanceof SourceCheckError
        ? error
        : new SourceCheckError(
            "The source could not be read safely. No results have been imported; use the original link for manual review.",
          );
    if (failure.status === "blocked" && failure.message.includes("access challenge"))
      await cooldown(
        sql,
        actor,
        failure.retry ?? 900,
        "The source returned an access challenge; no bypass attempted.",
      );
    return {
      ...response,
      status: failure.status,
      checkedAt: new Date().toISOString(),
      issues: [failure.message],
      retryAfterSeconds: failure.retry,
    };
  }
}
